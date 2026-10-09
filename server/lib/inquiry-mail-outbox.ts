import { randomUUID } from 'node:crypto';
import type { QueryResultRow } from 'pg';
import type { Database, DatabaseClient } from '../../db/client.js';
import { inquiries, inquiryMailOutbox, type InquiryRow } from '../../db/schema.js';
import {
  buildInquiryMail,
  inquiryMailErrorCode,
  type InquiryMailConfig,
  type InquiryMailErrorCode,
  type InquiryMailSender,
} from './inquiry-mail.js';

export const INQUIRY_MAIL_LEASE_MS = 60_000;
export const INQUIRY_MAIL_POLL_MS = 5000;
export const INQUIRY_MAIL_BATCH_SIZE = 5;
const INQUIRY_MAIL_QUERY_TIMEOUT_MS = 5000;
function outboxQuery<R extends QueryResultRow>(
  client: DatabaseClient,
  text: string,
  values: unknown[]
) {
  // pg supports per-query timeout; its separate declaration package omits this property.
  const config = { text, values, query_timeout: INQUIRY_MAIL_QUERY_TIMEOUT_MS };
  return client.query<R>(config);
}
export type InquiryMailJob = {
  inquiry: InquiryRow;
  messageId: string;
  leaseToken: string;
  attempts: number;
};
export type InquiryMailStore = {
  claim(): Promise<InquiryMailJob | null>;
  sent(job: InquiryMailJob): Promise<boolean>;
  failed(job: InquiryMailJob, code: InquiryMailErrorCode, next: Date): Promise<boolean>;
};

export async function saveInquiryWithMail(
  db: Database,
  row: InquiryRow,
  enabled: boolean,
  appOrigin: string
) {
  try {
    if (!enabled) {
      await db.insert(inquiries).values(row);
      return;
    }
    const messageId = `<inquiry-${row.id}@${new URL(appOrigin).hostname}>`;
    const inquiryInsert = db.insert(inquiries).values(row).toSQL();
    const mailInsert = db
      .insert(inquiryMailOutbox)
      .values({
        inquiryId: row.id,
        messageId,
        status: 'pending',
        attempts: 0,
        nextAttemptAt: row.createdAt,
        createdAt: row.createdAt,
        updatedAt: row.createdAt,
      })
      .toSQL();
    const client = await db.$client.connect();
    let failed = true;
    try {
      // Own checkout and every phase, including BEGIN: a timed-out ROLLBACK queued
      // behind blocked SQL must never return an open transaction to the shared Pool.
      for (const query of [
        { text: 'BEGIN', values: [] },
        { text: inquiryInsert.sql, values: inquiryInsert.params },
        { text: mailInsert.sql, values: mailInsert.params },
        { text: 'COMMIT', values: [] },
      ]) {
        const bounded = { ...query, query_timeout: 10_000 };
        await client.query(bounded);
      }
      failed = false;
    } finally {
      // release(error) removes the client and destroys its active socket. The server
      // aborts any uncommitted transaction; no delayed rollback or healthy reuse.
      client.release(failed ? new Error('inquiry-transaction-failed') : undefined);
    }
  } catch {
    // Cover legacy inserts, SQL generation and checkout too: Drizzle errors may
    // contain the query and customer parameters. Never retain their cause.
    throw new Error('Inquiry persistence failed');
  }
}

export function createPostgresInquiryMailStore(client: DatabaseClient): InquiryMailStore {
  return {
    async claim() {
      const token = randomUUID();
      const result = await outboxQuery<{
        inquiry: InquiryRow;
        message_id: string;
        attempts: number;
      }>(
        client,
        `WITH candidate AS (
        SELECT inquiry_id FROM public.inquiry_mail_outbox
        WHERE sent_at IS NULL AND next_attempt_at <= clock_timestamp()
          AND (lease_expires_at IS NULL OR lease_expires_at <= clock_timestamp())
        ORDER BY next_attempt_at, created_at FOR UPDATE SKIP LOCKED LIMIT 1
      ), claimed AS (
        UPDATE public.inquiry_mail_outbox o SET status = 'processing',
          lease_token = $1, lease_expires_at = clock_timestamp() + ($2 * interval '1 millisecond'),
          attempts = LEAST(o.attempts + 1::bigint, 2147483647)::integer, updated_at = clock_timestamp()
        FROM candidate WHERE o.inquiry_id = candidate.inquiry_id RETURNING o.*
      ) SELECT c.message_id, c.attempts, json_build_object(
        'id', i.id, 'name', i.name, 'email', i.email, 'phone', i.phone, 'company', i.company,
        'projectType', i.project_type, 'budget', i.budget, 'timeline', i.timeline,
        'description', i.description, 'status', i.status, 'sourceUrl', i.source_url,
        'createdAt', i.created_at, 'updatedAt', i.updated_at, 'resolvedAt', i.resolved_at,
        'userAgent', NULL, 'ipAddress', NULL
      ) AS inquiry FROM claimed c JOIN public.inquiries i ON i.id = c.inquiry_id`,
        [token, INQUIRY_MAIL_LEASE_MS]
      );
      const claimed = result.rows[0];
      if (!claimed) return null;
      return {
        inquiry: {
          ...claimed.inquiry,
          createdAt: new Date(claimed.inquiry.createdAt),
          updatedAt: new Date(claimed.inquiry.updatedAt),
          resolvedAt: claimed.inquiry.resolvedAt ? new Date(claimed.inquiry.resolvedAt) : null,
        },
        messageId: claimed.message_id,
        attempts: claimed.attempts,
        leaseToken: token,
      };
    },
    async sent(job) {
      const result = await outboxQuery(
        client,
        `UPDATE public.inquiry_mail_outbox SET status = 'sent',
        sent_at = clock_timestamp(), updated_at = clock_timestamp(), lease_token = NULL,
        lease_expires_at = NULL, last_error_code = NULL
        WHERE inquiry_id = $1 AND lease_token = $2 AND sent_at IS NULL`,
        [job.inquiry.id, job.leaseToken]
      );
      return result.rowCount === 1;
    },
    async failed(job, code, next) {
      const result = await outboxQuery(
        client,
        `UPDATE public.inquiry_mail_outbox SET status = 'pending',
        updated_at = clock_timestamp(), lease_token = NULL, lease_expires_at = NULL,
        last_error_code = $3, next_attempt_at = $4
        WHERE inquiry_id = $1 AND lease_token = $2 AND sent_at IS NULL`,
        [job.inquiry.id, job.leaseToken, code, next]
      );
      return result.rowCount === 1;
    },
  };
}

export function createInquiryMailWorker(
  store: InquiryMailStore,
  sender: InquiryMailSender,
  config: InquiryMailConfig,
  appOrigin: string,
  options: {
    now?: () => Date;
    report?: (code: 'outbox-storage-unavailable' | InquiryMailErrorCode) => void;
  } = {}
) {
  let stopped = false;
  let scheduled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let active: Promise<void> | undefined;
  const now = options.now ?? (() => new Date());
  const report =
    options.report ?? ((code) => console.warn(JSON.stringify({ event: 'inquiry-mail', code })));
  async function drain() {
    for (let count = 0; count < INQUIRY_MAIL_BATCH_SIZE && !stopped; count++) {
      let job: InquiryMailJob | null;
      try {
        job = await store.claim();
      } catch {
        report('outbox-storage-unavailable');
        return;
      }
      if (!job) return;
      try {
        await sender.send(buildInquiryMail(job.inquiry, job.messageId, config, appOrigin));
      } catch (error) {
        const code = inquiryMailErrorCode(error);
        const delay = Math.min(60_000 * 2 ** Math.min(Math.max(job.attempts - 1, 0), 6), 3_600_000);
        try {
          await store.failed(job, code, new Date(now().getTime() + delay));
        } catch {
          report('outbox-storage-unavailable');
        }
        report(code);
        continue;
      }
      // If SMTP accepted but DB acknowledgement fails, retain the recoverable lease.
      // A later retry may duplicate delivery; the persisted Message-ID remains stable.
      try {
        await store.sent(job);
      } catch {
        report('outbox-storage-unavailable');
      }
    }
  }
  function runOnce() {
    if (stopped) return Promise.resolve();
    if (active) return active;
    active = drain().finally(() => {
      active = undefined;
    });
    return active;
  }
  async function poll() {
    await runOnce();
    if (!stopped) {
      timer = setTimeout(() => {
        void poll();
      }, INQUIRY_MAIL_POLL_MS);
      timer.unref();
    }
  }
  return {
    runOnce,
    start() {
      if (!stopped && !scheduled) {
        scheduled = true;
        void poll();
      }
    },
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      await sender.close();
      await active;
    },
  };
}
