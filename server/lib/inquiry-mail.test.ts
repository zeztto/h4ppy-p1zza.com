import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { inspect } from 'node:util';
import test from 'node:test';
import type { Socket } from 'node:net';
import nodemailer from 'nodemailer';
import SMTPConnection from 'nodemailer/lib/smtp-connection';
import type { Database, DatabaseClient } from '../../db/client.js';
import { createDatabase } from '../../db/client.js';
import { inquiries, inquiryMailOutbox, type InquiryRow } from '../../db/schema.js';
import { readEnvironment } from '../env-config.js';
import {
  buildInquiryMail,
  createInquirySmtpSender,
  INQUIRY_MAIL_RECIPIENT,
  type InquiryMailConfig,
} from './inquiry-mail.js';
import {
  createInquiryMailWorker,
  createPostgresInquiryMailStore,
  saveInquiryWithMail,
  type InquiryMailJob,
  type InquiryMailStore,
} from './inquiry-mail-outbox.js';

const config: InquiryMailConfig = {
  host: 'mail.fixture.invalid',
  port: 587,
  user: 'sender@fixture.invalid',
  pass: 'fixture-only-credential',
  from: 'sender@fixture.invalid',
};
const row: InquiryRow = {
  id: 'fixture-inquiry-id',
  name: 'QA 문의',
  email: 'customer@fixture.invalid',
  phone: null,
  company: 'QA',
  projectType: '웹 서비스',
  budget: null,
  timeline: null,
  description: 'Provided text\nhttps://fixture.invalid/no-fetch',
  status: 'new',
  sourceUrl: 'https://p1zza.kr/inquiry',
  userAgent: 'private-agent-sentinel',
  ipAddress: 'private-ip-sentinel',
  createdAt: new Date('2026-10-09T03:00:00Z'),
  updatedAt: new Date('2026-10-09T03:00:00Z'),
  resolvedAt: null,
};
const job: InquiryMailJob = {
  inquiry: row,
  leaseToken: 'fixture-lease',
  attempts: 1,
  messageId: '<inquiry-fixture-inquiry-id@p1zza.kr>',
};
function environment() {
  return {
    GITHUB_CLIENT_ID: 'fixture',
    GITHUB_CLIENT_SECRET: 'fixture',
    SESSION_SECRET: 'fixture',
    DATABASE_URL: 'postgres://fixture@localhost/fixture',
  };
}

test('mail defaults disabled and enabled configuration rejects partial, insecure and header inputs', () => {
  assert.equal(readEnvironment(environment()).inquiryMail, null);
  const enabled = {
    ...environment(),
    INQUIRY_MAIL_ENABLED: 'true',
    SMTP_HOST: config.host,
    SMTP_PORT: '587',
    SMTP_USER: config.user,
    SMTP_PASS: config.pass,
    INQUIRY_MAIL_FROM: config.from,
  };
  assert.deepEqual(readEnvironment(enabled).inquiryMail, config);
  for (const patch of [
    { SMTP_PASS: '' },
    { SMTP_PORT: '25' },
    { INQUIRY_MAIL_ENABLED: 'yes' },
    { SMTP_HOST: 'https://mail.invalid/path' },
    { INQUIRY_MAIL_FROM: 'sender@fixture.invalid\r\nBcc:x@y.invalid' },
  ]) {
    assert.throws(() => readEnvironment({ ...enabled, ...patch }), /INQUIRY_MAIL|SMTP/);
  }
  assert.throws(
    () => readEnvironment({ ...enabled, SMTP_USER: 'other@fixture.invalid' }),
    /SMTP_USER/
  );
});

test('mail recipient, envelope, headers, body privacy and KST date come from bounded trusted values', () => {
  const mail = buildInquiryMail(row, job.messageId, config, 'https://p1zza.kr');
  assert.equal(INQUIRY_MAIL_RECIPIENT, 'cs@lmml.kr');
  assert.equal(mail.to, 'cs@lmml.kr');
  assert.deepEqual(mail.envelope, { from: config.from, to: ['cs@lmml.kr'] });
  assert.deepEqual(mail.replyTo, { address: row.email });
  assert.equal(mail.messageId, job.messageId);
  assert.equal(typeof mail.text, 'string');
  assert.match(String(mail.text), /12:00/);
  assert.match(String(mail.text), /https:\/\/p1zza.kr\/admin\/inquiries/);
  assert.match(String(mail.text), /Provided text/);
  assert.doesNotMatch(
    JSON.stringify(mail),
    /private-agent-sentinel|private-ip-sentinel|fixture-only-credential/
  );
  assert.equal(mail.html, undefined);
  assert.equal(mail.attachments, undefined);
  assert.throws(() =>
    buildInquiryMail(
      { ...row, email: 'a@b.invalid\r\nBcc:x@y.invalid' },
      job.messageId,
      config,
      'https://p1zza.kr'
    )
  );
});

test('enabled atomic save discards its checkout on every failed phase; disabled stays legacy', async () => {
  let saved: object[] = [];
  let staged: object[] = [];
  let failPhase = '';
  const releases: boolean[] = [];
  const calls: string[] = [];
  const insert = (table: unknown) => ({
    values: (value: object) => ({
      toSQL: () => ({
        sql: table === inquiries ? 'INSERT inquiry' : 'INSERT outbox',
        params: [{ table, value }],
      }),
    }),
  });
  const db = {
    insert,
    $client: {
      connect: async () => ({
        query: async (statement: { text: string; values: object[]; query_timeout: number }) => {
          assert.equal(statement.query_timeout, 10000);
          calls.push(statement.text);
          if (statement.text === failPhase) throw new Error('private database response');
          if (statement.text === 'BEGIN') staged = [];
          if (statement.text.startsWith('INSERT')) staged.push(...statement.values);
          if (statement.text === 'COMMIT') saved = [...staged];
        },
        release: (error?: Error) => {
          releases.push(Boolean(error));
          if (error) staged = [];
        },
      }),
    },
  } as unknown as Database;
  await saveInquiryWithMail(db, row, true, 'https://p1zza.kr');
  assert.equal(saved.length, 2);
  assert.equal((saved[0] as { table: unknown }).table, inquiries);
  assert.equal((saved[1] as { table: unknown }).table, inquiryMailOutbox);
  assert.deepEqual(releases, [false]);
  for (const phase of ['BEGIN', 'INSERT inquiry', 'INSERT outbox', 'COMMIT']) {
    saved = [];
    calls.length = 0;
    releases.length = 0;
    failPhase = phase;
    await assert.rejects(
      saveInquiryWithMail(db, row, true, 'https://p1zza.kr'),
      /Inquiry persistence failed/
    );
    assert.deepEqual(saved, []);
    assert.deepEqual(staged, []);
    assert.deepEqual(releases, [true]);
    assert.equal(calls.includes('ROLLBACK'), false, 'No timed-out rollback may enter the queue');
  }
  saved = [];
  const legacy = {
    insert: (table: unknown) => ({
      values: async (value: object) => {
        saved.push({ table, value });
      },
    }),
  } as unknown as Database;
  await saveInquiryWithMail(legacy, row, false, 'https://p1zza.kr');
  assert.equal(saved.length, 1);
});

test('lost COMMIT acknowledgement may preserve both rows but still discards the checkout', async () => {
  let staged = 0;
  let committed = 0;
  let discarded = false;
  const db = {
    insert: () => ({ values: () => ({ toSQL: () => ({ sql: 'INSERT fixture', params: [] }) }) }),
    $client: {
      connect: async () => ({
        query: async ({ text }: { text: string }) => {
          if (text.startsWith('INSERT')) staged++;
          if (text === 'COMMIT') {
            committed = staged;
            throw new Error('fixture lost commit acknowledgement');
          }
        },
        release: (error?: Error) => {
          discarded = Boolean(error);
        },
      }),
    },
  } as unknown as Database;
  await assert.rejects(
    saveInquiryWithMail(db, row, true, 'https://p1zza.kr'),
    /Inquiry persistence failed/
  );
  assert.equal(committed, 2);
  assert.equal(discarded, true);
});

test('disabled persistence failure exposes only a generic error to application logging without PII or cause', async () => {
  const sentinels = [
    'qa_private_name_sentinel',
    'qa_private_email_sentinel',
    'qa_private_description_sentinel',
  ];
  const privateFailure = Object.assign(
    new Error(`Failed query with params: ${sentinels.join(',')}`),
    {
      query: 'INSERT inquiries private_sql_sentinel',
      params: sentinels,
      cause: new Error('private_provider_error_sentinel'),
    }
  );
  const legacy = {
    insert: () => ({
      values: async () => {
        throw privateFailure;
      },
    }),
  } as unknown as Database;
  const builder = {
    insert: () => {
      throw privateFailure;
    },
  } as unknown as Database;
  const checkout = {
    insert: () => ({ values: () => ({ toSQL: () => ({ sql: 'INSERT fixture', params: [] }) }) }),
    $client: {
      connect: async () => {
        throw privateFailure;
      },
    },
  } as unknown as Database;
  const logs: string[] = [];
  for (const [db, enabled] of [
    [legacy, false],
    [builder, true],
    [checkout, true],
  ] as const) {
    await assert.rejects(
      saveInquiryWithMail(db, row, enabled, 'https://p1zza.kr'),
      (error: unknown) => {
        logs.push(inspect(error));
        assert.ok(error instanceof Error);
        assert.equal(error.message, 'Inquiry persistence failed');
        assert.equal(error.cause, undefined);
        assert.equal('query' in error, false);
        assert.equal('params' in error, false);
        return true;
      }
    );
  }
  for (const sentinel of [
    ...sentinels,
    'private_sql_sentinel',
    'private_provider_error_sentinel',
  ]) {
    assert.equal(logs.join('\n').includes(sentinel), false);
  }
});

test('actual pg Pool release(error) removes a failed inquiry transaction client instead of reusing it', async () => {
  let ended = 0;
  class TransactionClient extends EventEmitter {
    _queryable = true;
    _ending = false;
    connect(callback: (error: Error | null) => void) {
      callback(null);
    }
    query(
      statement: { text: string; query_timeout: number },
      callback: (error: Error | null, result?: object) => void
    ) {
      assert.equal(statement.query_timeout, 10000);
      if (statement.text.includes('inquiry_mail_outbox'))
        callback(new Error('fixture blocked SQL timeout'));
      else callback(null, { rows: [], rowCount: 1 });
    }
    end(callback?: () => void) {
      ended++;
      callback?.();
      this.emit('end');
    }
  }
  const database = createDatabase('postgres://fixture@localhost/unused');
  Object.assign(database.client, { Client: TransactionClient });
  try {
    await assert.rejects(
      saveInquiryWithMail(database.db, row, true, 'https://p1zza.kr'),
      /Inquiry persistence failed/
    );
    assert.equal(ended, 1);
    assert.equal(database.client.totalCount, 0);
    assert.equal(database.client.idleCount, 0);
  } finally {
    await database.client.end();
  }
});

test('SMTP transport forces STARTTLS and deadlines destroy active sockets and close transport', async () => {
  let transportClosed = 0;
  let socketDestroyed = 0;
  let captured: object | undefined;
  class FakeSocket extends EventEmitter {
    connect() {
      queueMicrotask(() => this.emit('connect'));
      return this;
    }
    destroy() {
      socketDestroyed++;
      this.emit('close');
      return this;
    }
  }
  const sender = createInquirySmtpSender(config, {
    deadlineMs: 15,
    socketFactory: () => new FakeSocket() as unknown as Socket,
    transportFactory: (options) => {
      captured = options;
      return {
        close: () => {
          transportClosed++;
        },
        sendMail: () => {
          options.getSocket?.(options, () => {});
          return new Promise(() => {});
        },
      };
    },
  });
  await assert.rejects(
    sender.send(buildInquiryMail(row, job.messageId, config, 'https://p1zza.kr')),
    /send-timeout/
  );
  assert.ok(socketDestroyed > 0);
  assert.equal(transportClosed, 1);
  assert.deepEqual(
    { ...captured, getSocket: undefined },
    {
      host: config.host,
      port: 587,
      secure: false,
      requireTLS: true,
      tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2', servername: config.host },
      auth: { user: config.user, pass: config.pass },
      forceAuth: true,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      dnsTimeout: 5000,
      socketTimeout: 10000,
      logger: false,
      debug: false,
      disableFileAccess: true,
      disableUrlAccess: true,
      getSocket: undefined,
    }
  );
  await sender.close();
});

test('successful SMTP acceptance requires the fixed recipient and shutdown cancels an active send', async () => {
  let closed = 0;
  const sender = createInquirySmtpSender(config, {
    transportFactory: () => ({
      close: () => {
        closed++;
      },
      sendMail: async () => ({ accepted: [INQUIRY_MAIL_RECIPIENT], rejected: [] }),
    }),
  });
  await sender.send(buildInquiryMail(row, job.messageId, config, 'https://p1zza.kr'));
  assert.equal(closed, 1);
  const rejected = createInquirySmtpSender(config, {
    transportFactory: () => ({
      close: () => {},
      sendMail: async () => ({ accepted: [], rejected: [INQUIRY_MAIL_RECIPIENT] }),
    }),
  });
  await assert.rejects(
    rejected.send(buildInquiryMail(row, job.messageId, config, 'https://p1zza.kr')),
    /recipient-rejected/
  );
  const hanging = createInquirySmtpSender(config, {
    transportFactory: () => ({
      close: () => {
        closed++;
      },
      sendMail: () => new Promise(() => {}),
    }),
  });
  const pending = hanging.send(buildInquiryMail(row, job.messageId, config, 'https://p1zza.kr'));
  const result = assert.rejects(pending, /worker-shutdown/);
  await hanging.close();
  await result;
});

function storeFixture() {
  let available = true;
  const sent: string[] = [];
  const failed: { code: string; next: Date }[] = [];
  const store: InquiryMailStore = {
    claim: async () => {
      if (!available) return null;
      available = false;
      return job;
    },
    sent: async (claimed) => {
      sent.push(claimed.leaseToken);
      return true;
    },
    failed: async (_claimed, code, next) => {
      failed.push({ code, next });
      return true;
    },
  };
  return {
    store,
    sent,
    failed,
    requeue: () => {
      available = true;
    },
  };
}

test('worker success records sent once; failure preserves a retry with whitelisted sanitized error', async () => {
  const fixture = storeFixture();
  const now = new Date('2026-10-09T03:00:00Z');
  let calls = 0;
  const sender = {
    send: async () => {
      calls++;
    },
    close: async () => {},
  };
  const worker = createInquiryMailWorker(fixture.store, sender, config, 'https://p1zza.kr', {
    now: () => now,
  });
  await worker.runOnce();
  assert.equal(calls, 1);
  assert.deepEqual(fixture.sent, ['fixture-lease']);
  fixture.requeue();
  const failing = createInquiryMailWorker(
    fixture.store,
    {
      send: async () => {
        throw Object.assign(new Error('customer@fixture.invalid private provider text'), {
          code: 'EAUTH',
        });
      },
      close: async () => {},
    },
    config,
    'https://p1zza.kr',
    { now: () => now }
  );
  await failing.runOnce();
  assert.deepEqual(fixture.failed, [{ code: 'smtp-auth', next: new Date(now.getTime() + 60_000) }]);
  assert.doesNotMatch(JSON.stringify(fixture.failed), /customer|provider/);
});

test('worker serializes overlapping polls, limits each batch to five and stops scheduling on shutdown', async () => {
  let claims = 0;
  let simultaneous = 0;
  let max = 0;
  const store: InquiryMailStore = {
    claim: async () => {
      claims++;
      return job;
    },
    sent: async () => true,
    failed: async () => true,
  };
  const worker = createInquiryMailWorker(
    store,
    {
      send: async () => {
        simultaneous++;
        max = Math.max(max, simultaneous);
        await new Promise((resolve) => setTimeout(resolve, 2));
        simultaneous--;
      },
      close: async () => {},
    },
    config,
    'https://p1zza.kr'
  );
  await Promise.all([worker.runOnce(), worker.runOnce()]);
  assert.equal(max, 1);
  assert.equal(claims, 5);
  await worker.stop();
  await worker.runOnce();
  assert.equal(claims, 5);
});

test('SQL claims expired leases with SKIP LOCKED and acknowledgement fences the current token', async () => {
  const queries: { query: string; values: unknown[] }[] = [];
  const client = {
    query: async (statement: { text: string; values: unknown[]; query_timeout: number }) => {
      assert.equal(statement.query_timeout, 5000);
      queries.push({ query: statement.text, values: statement.values });
      return { rows: [], rowCount: 0 };
    },
  } as unknown as DatabaseClient;
  const store = createPostgresInquiryMailStore(client);
  assert.equal(await store.claim(), null);
  assert.match(queries[0]!.query, /FOR UPDATE SKIP LOCKED/);
  assert.match(queries[0]!.query, /lease_expires_at <=/);
  assert.equal(await store.sent(job), false);
  assert.match(queries[1]!.query, /lease_token = \$2/);
  assert.equal(await store.failed(job, 'smtp-auth', new Date()), false);
  assert.match(queries[2]!.query, /lease_token = \$2/);
  assert.equal(
    queries.every(({ query }) => !query.includes(row.email)),
    true
  );
});

test('startup runs due work immediately and retries cap at one hour without changing Message-ID', async () => {
  let claimed = false;
  let done!: () => void;
  const completion = new Promise<void>((resolve) => {
    done = resolve;
  });
  let retry: Date | undefined;
  const messageIds: unknown[] = [];
  const now = new Date('2026-10-09T03:00:00Z');
  const store: InquiryMailStore = {
    claim: async () => {
      if (claimed) return null;
      claimed = true;
      return { ...job, attempts: 100 };
    },
    sent: async () => {
      throw new Error('Failed SMTP must not be marked sent');
    },
    failed: async (_job, _code, next) => {
      retry = next;
      done();
      return true;
    },
  };
  const worker = createInquiryMailWorker(
    store,
    {
      send: async (mail) => {
        messageIds.push(mail.messageId);
        throw new Error('private response');
      },
      close: async () => {},
    },
    config,
    'https://p1zza.kr',
    { now: () => now, report: () => {} }
  );
  worker.start();
  await completion;
  await worker.stop();
  assert.equal(retry?.getTime(), now.getTime() + 3_600_000);
  assert.deepEqual(messageIds, [job.messageId]);
});

test('SMTP accepted then acknowledgement failure retains a recovery lease and emits storage code only', async () => {
  let claimed = false;
  let failed = 0;
  const reports: string[] = [];
  const worker = createInquiryMailWorker(
    {
      claim: async () => {
        if (claimed) return null;
        claimed = true;
        return job;
      },
      sent: async () => {
        throw new Error('private database detail customer@fixture.invalid');
      },
      failed: async () => {
        failed++;
        return true;
      },
    },
    { send: async () => {}, close: async () => {} },
    config,
    'https://p1zza.kr',
    { report: (code) => reports.push(code) }
  );
  await worker.runOnce();
  await worker.stop();
  assert.equal(failed, 0);
  assert.deepEqual(reports, ['outbox-storage-unavailable']);
});

test('implicit TLS465 is enabled and provider errors are retried without raw headers or response logs', async () => {
  let secure = false;
  const sender = createInquirySmtpSender(
    { ...config, port: 465 },
    {
      transportFactory: (options) => {
        secure =
          options.secure === true &&
          options.requireTLS === true &&
          options.tls?.rejectUnauthorized === true;
        return {
          close: () => {},
          sendMail: async () => ({ accepted: [INQUIRY_MAIL_RECIPIENT], rejected: [] }),
        };
      },
    }
  );
  await sender.send(buildInquiryMail(row, job.messageId, config, 'https://p1zza.kr'));
  assert.equal(secure, true);
  await sender.close();
});

test('actual Nodemailer transport authenticates even when peer omits AUTH and refuses anonymous delivery', async () => {
  const proto = SMTPConnection.prototype;
  const original = { connect: proto.connect, login: proto.login, send: proto.send };
  let authenticated = 0;
  let sent = 0;
  proto.connect = function (callback) {
    this.allowsAuth = false;
    callback?.(undefined);
  };
  proto.login = function (_auth, callback) {
    authenticated++;
    callback(Object.assign(new Error('fixture_auth_rejected'), { code: 'EAUTH' }));
  };
  proto.send = function () {
    sent++;
    throw new Error('Anonymous send must not execute');
  };
  const sender = createInquirySmtpSender(config, {
    transportFactory: (options) =>
      nodemailer.createTransport({
        ...options,
        getSocket: (_smtp, callback) => callback(null, false),
      }),
  });
  try {
    await assert.rejects(
      sender.send(buildInquiryMail(row, job.messageId, config, 'https://p1zza.kr')),
      /fixture_auth_rejected/
    );
    assert.equal(authenticated, 1);
    assert.equal(sent, 0);
  } finally {
    Object.assign(proto, original);
    await sender.close();
  }
});

test('real pg Pool acquisition timeout cancels its queued claim and permits bounded worker shutdown', async () => {
  let queries = 0;
  class FakeClient extends EventEmitter {
    _queryable = true;
    _ending = false;
    connect(callback: (error: Error | null) => void) {
      callback(null);
    }
    query(_config: unknown, callback: (error: Error | null, result: object) => void) {
      queries++;
      callback(null, { rows: [], rowCount: 0 });
    }
    end(callback?: () => void) {
      callback?.();
      this.emit('end');
    }
  }
  const database = createDatabase('postgres://fixture@localhost/unused');
  assert.equal(database.client.options.connectionTimeoutMillis, 5000);
  assert.equal(database.client.options.query_timeout, undefined);
  Object.assign(database.client, { Client: FakeClient });
  database.client.options.max = 1;
  database.client.options.connectionTimeoutMillis = 20;
  const held = await database.client.connect();
  const keepAlive = setTimeout(() => {}, 1000);
  const reports: string[] = [];
  const worker = createInquiryMailWorker(
    createPostgresInquiryMailStore(database.client),
    {
      send: async () => {
        throw new Error('Pool timeout must not send');
      },
      close: async () => {},
    },
    config,
    'https://p1zza.kr',
    { report: (code) => reports.push(code) }
  );
  try {
    const running = worker.runOnce();
    await worker.stop();
    await running;
    assert.equal(database.client.waitingCount, 0);
    assert.deepEqual(reports, ['outbox-storage-unavailable']);
    held.release();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(queries, 0, 'Timed-out queued claim must never execute later');
  } finally {
    clearTimeout(keepAlive);
    if (database.client.idleCount === 0) held.release();
    await database.client.end();
  }
});

test('real pg Pool aborts a stalled connection handshake at its configured connection timeout', async () => {
  class StalledClient extends EventEmitter {
    private callback?: (error: Error | null) => void;
    connect(callback: (error: Error | null) => void) {
      this.callback = callback;
    }
    isConnected() {
      return false;
    }
    end(callback?: () => void) {
      this.callback?.(new Error('fixture_connection_closed'));
      callback?.();
      this.emit('end');
    }
  }
  const database = createDatabase('postgres://fixture@localhost/unused');
  Object.assign(database.client, { Client: StalledClient });
  database.client.options.connectionTimeoutMillis = 20;
  try {
    await assert.rejects(database.client.connect(), /connection timeout/);
    assert.equal(database.client.totalCount, 0);
  } finally {
    await database.client.end();
  }
});
