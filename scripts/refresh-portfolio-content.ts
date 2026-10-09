import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { Pool, type PoolClient } from 'pg';
import {
  ARCHIVED_PROJECT_IDS,
  BASELINE_PUBLISHED_PROJECT_IDS,
  NEWLY_PUBLISHED_PROJECT_IDS,
  PORTFOLIO_REFRESH_REVISION,
  PROJECT_CONTENT_UPDATES,
  PROFILE_CONTENT_UPDATE,
  SECTION_CONTENT_UPDATES,
} from '../src/data/portfolio-refresh.js';

export type ContentRow = Record<string, unknown>;
export interface ContentSnapshot {
  projects: ContentRow[];
  site_profile: ContentRow[];
  site_sections: ContentRow[];
  site_settings: ContentRow[];
}
export interface ContentAction {
  table: keyof ContentSnapshot;
  id: string;
  kind: 'insert' | 'update';
  changes: ContentRow;
}
export interface RefreshPlan {
  actions: ContentAction[];
  before: ContentSnapshot;
  after: ContentSnapshot;
  beforeDigest: string;
  afterDigest: string;
  preservedDigest: string;
}

export class RefreshError extends Error {}

const CONTENT_TABLES = ['projects', 'site_profile', 'site_sections', 'site_settings'] as const;

const rowKey = (table: keyof ContentSnapshot) => (table === 'site_settings' ? 'key' : 'id');
const jsonClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function contentDigest(snapshot: ContentSnapshot) {
  const sorted = Object.fromEntries(
    (Object.entries(snapshot) as [keyof ContentSnapshot, ContentRow[]][]).map(([table, rows]) => [
      table,
      [...rows]
        .sort((a, b) =>
          String(a[rowKey(table as keyof ContentSnapshot)]).localeCompare(
            String(b[rowKey(table as keyof ContentSnapshot)])
          )
        )
        .map((row) =>
          Object.fromEntries(Object.entries(row).sort(([a], [b]) => a.localeCompare(b)))
        ),
    ])
  );
  return createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
}

function updateRow(
  after: ContentSnapshot,
  actions: ContentAction[],
  table: keyof ContentSnapshot,
  id: string,
  values: ContentRow,
  now: string,
  allowInsert = false
) {
  const row = after[table].find((item) => item[rowKey(table)] === id);
  if (!row) {
    if (!allowInsert) throw new RefreshError(`Missing required ${table} target: ${id}`);
    const changes = { id, ...values, created_at: now, updated_at: now };
    after[table].push(changes);
    actions.push({ table, id, kind: 'insert', changes });
    return;
  }
  const changes = Object.fromEntries(
    Object.entries(values).filter(
      ([key, value]) => JSON.stringify(row[key]) !== JSON.stringify(value)
    )
  );
  if (Object.keys(changes).length === 0) return;
  changes['updated_at'] = now;
  Object.assign(row, changes);
  actions.push({ table, id, kind: 'update', changes });
}

function preservedContent(snapshot: ContentSnapshot, actions: ContentAction[]) {
  const preserved = {} as ContentSnapshot;
  for (const table of CONTENT_TABLES) {
    preserved[table] = snapshot[table]
      .filter(
        (row) =>
          !actions.some(
            (action) =>
              action.kind === 'insert' && action.table === table && action.id === row[rowKey(table)]
          )
      )
      .map((row) => {
        const action = actions.find(
          (candidate) => candidate.table === table && candidate.id === row[rowKey(table)]
        );
        if (!action) return row;
        return Object.fromEntries(Object.entries(row).filter(([key]) => !(key in action.changes)));
      });
  }
  return preserved;
}

export function buildRefreshPlan(
  snapshot: ContentSnapshot,
  now = new Date().toISOString()
): RefreshPlan {
  const before = jsonClone(snapshot);
  const after = jsonClone(snapshot);
  const actions: ContentAction[] = [];
  const knownPublicIds = new Set([
    ...BASELINE_PUBLISHED_PROJECT_IDS,
    ...NEWLY_PUBLISHED_PROJECT_IDS,
  ]);
  const keepIds = BASELINE_PUBLISHED_PROJECT_IDS.filter((id) => !ARCHIVED_PROJECT_IDS.includes(id));
  for (const row of before.projects) {
    if (row['is_published'] && !knownPublicIds.has(String(row['id']))) {
      throw new RefreshError(`Unknown published project: ${String(row['id'])}`);
    }
  }
  for (const id of keepIds) {
    if (!before.projects.some((row) => row['id'] === id && row['is_published'] === true)) {
      throw new RefreshError(`Missing expected published project: ${id}`);
    }
  }
  for (const id of ARCHIVED_PROJECT_IDS) {
    updateRow(after, actions, 'projects', id, { is_published: false, is_featured: false }, now);
  }
  for (const project of PROJECT_CONTENT_UPDATES) {
    updateRow(
      after,
      actions,
      'projects',
      project.id,
      {
        name: project.name,
        description: project.description,
        url: project.url,
        category: project.category,
        year: project.year ?? null,
        thumbnail_url: project.thumbnail ?? null,
        long_description: project.longDescription ?? null,
        tags_json: JSON.stringify(project.tags),
        features_json: JSON.stringify(project.features ?? []),
        tech_stack_json: JSON.stringify(project.techStack ?? []),
        sort_order: project.sortOrder,
        is_featured: project.isFeatured,
        is_published: true,
      },
      now,
      NEWLY_PUBLISHED_PROJECT_IDS.includes(project.id)
    );
  }
  updateRow(
    after,
    actions,
    'site_profile',
    'primary',
    {
      headline: PROFILE_CONTENT_UPDATE.headline,
      bio_short: PROFILE_CONTENT_UPDATE.bioShort,
      essay_markdown: PROFILE_CONTENT_UPDATE.essayMarkdown,
    },
    now
  );
  for (const section of SECTION_CONTENT_UPDATES) {
    updateRow(
      after,
      actions,
      'site_sections',
      section.id,
      { content_json: section.contentJson },
      now
    );
  }
  const footer = after.site_settings.find((row) => row['key'] === 'footer');
  if (!footer || typeof footer['value'] !== 'string')
    throw new RefreshError('Missing required footer setting');
  let footerValue: Record<string, unknown>;
  try {
    footerValue = JSON.parse(footer['value']) as Record<string, unknown>;
    if (!footerValue || Array.isArray(footerValue) || typeof footerValue !== 'object')
      throw new Error();
  } catch {
    throw new RefreshError('Invalid footer setting JSON');
  }
  footerValue['copyright'] = '© 2026 p1zza.kr';
  updateRow(after, actions, 'site_settings', 'footer', { value: JSON.stringify(footerValue) }, now);
  const preservedDigest = contentDigest(preservedContent(before, actions));
  if (contentDigest(preservedContent(after, actions)) !== preservedDigest) {
    throw new RefreshError('Unrelated content preservation check failed');
  }
  return {
    actions,
    before,
    after,
    beforeDigest: contentDigest(before),
    afterDigest: contentDigest(after),
    preservedDigest,
  };
}

async function readContent(client: PoolClient, lock: boolean): Promise<ContentSnapshot> {
  const snapshot = {} as ContentSnapshot;
  for (const table of CONTENT_TABLES) {
    const result = await client.query<ContentRow>(
      `SELECT * FROM ${table} ORDER BY ${rowKey(table)}${lock ? ' FOR UPDATE' : ''}`
    );
    snapshot[table] = jsonClone(result.rows);
  }
  return snapshot;
}

async function applyActions(client: PoolClient, actions: ContentAction[]) {
  for (const action of actions) {
    const entries = Object.entries(action.changes);
    const values = entries.map(([, value]) => value);
    let result;
    if (action.kind === 'insert') {
      result = await client.query(
        `INSERT INTO ${action.table} (${entries.map(([key]) => key).join(', ')}) VALUES (${values.map((_, index) => `$${index + 1}`).join(', ')})`,
        values
      );
    } else {
      result = await client.query(
        `UPDATE ${action.table} SET ${entries.map(([key], index) => `${key} = $${index + 1}`).join(', ')} WHERE ${rowKey(action.table)} = $${values.length + 1}`,
        [...values, action.id]
      );
    }
    if (result.rowCount !== 1)
      throw new RefreshError(`Unexpected affected row count: ${action.table}/${action.id}`);
  }
}

export async function executeRefresh(
  pool: Pool,
  apply: boolean,
  expectedDigest?: string,
  recordPreparedPlan?: (plan: RefreshPlan) => Promise<void>
): Promise<RefreshPlan> {
  const client = await pool.connect();
  let transactionStarted = false;
  try {
    await client.query(`BEGIN ISOLATION LEVEL REPEATABLE READ${apply ? '' : ' READ ONLY'}`);
    transactionStarted = true;
    // Prevent concurrent content inserts/deletes while applying this reviewed inventory.
    if (apply)
      await client.query(
        'LOCK TABLE projects, site_profile, site_sections, site_settings IN SHARE ROW EXCLUSIVE MODE'
      );
    const plan = buildRefreshPlan(await readContent(client, apply));
    if (apply && (!expectedDigest || plan.beforeDigest !== expectedDigest)) {
      throw new RefreshError('Expected content digest does not match; refresh was not applied');
    }
    // Save reviewed before/after evidence before any mutation. An output error aborts the transaction.
    if (recordPreparedPlan) await recordPreparedPlan(plan);
    if (apply) {
      await applyActions(client, plan.actions);
      const actualAfter = await readContent(client, false);
      if (
        contentDigest(actualAfter) !== plan.afterDigest ||
        contentDigest(preservedContent(actualAfter, plan.actions)) !== plan.preservedDigest
      ) {
        throw new RefreshError('Post-update content verification failed');
      }
    }
    await client.query(apply ? 'COMMIT' : 'ROLLBACK');
    transactionStarted = false;
    return plan;
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export function parseArguments(args: string[]) {
  let apply = false;
  let expectedDigest: string | undefined;
  let output: string | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--apply') apply = true;
    else if (arg === '--expected-digest') {
      expectedDigest = args[++index];
      if (!expectedDigest || !/^[a-f0-9]{64}$/.test(expectedDigest))
        throw new RefreshError('--expected-digest requires a SHA-256 hex digest');
    } else if (arg === '--output') {
      output = args[++index];
      if (!output || output.startsWith('--'))
        throw new RefreshError('--output requires a file path');
    } else throw new RefreshError(`Unknown argument: ${arg}`);
  }
  if (apply && !expectedDigest)
    throw new RefreshError('--apply requires --expected-digest from a reviewed dry run');
  return { apply, expectedDigest, output };
}

async function main() {
  const { apply, expectedDigest, output } = parseArguments(process.argv.slice(2));
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) throw new RefreshError('DATABASE_URL is required');
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  try {
    if (output) await writeFile(output, '', { flag: 'wx', mode: 0o600 });
    const plan = await executeRefresh(
      pool,
      apply,
      expectedDigest,
      output
        ? async (preparedPlan) => {
            await writeFile(
              output,
              JSON.stringify(
                {
                  revision: PORTFOLIO_REFRESH_REVISION,
                  mode: apply ? 'apply' : 'dry-run',
                  phase: 'prepared',
                  ...preparedPlan,
                },
                null,
                2
              ) + '\n'
            );
          }
        : undefined
    );
    const report =
      JSON.stringify(
        {
          revision: PORTFOLIO_REFRESH_REVISION,
          mode: apply ? 'apply' : 'dry-run',
          phase: apply ? 'committed' : 'review',
          ...plan,
        },
        null,
        2
      ) + '\n';
    if (output) await writeFile(output, report);
    process.stdout.write(
      output
        ? JSON.stringify(
            {
              mode: apply ? 'apply' : 'dry-run',
              beforeDigest: plan.beforeDigest,
              afterDigest: plan.afterDigest,
              actions: plan.actions.map(({ table, id, kind, changes }) => ({
                table,
                id,
                kind,
                fields: Object.keys(changes),
              })),
              output,
            },
            null,
            2
          ) + '\n'
        : report
    );
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error: unknown) => {
    console.error(
      JSON.stringify({
        ok: false,
        error:
          error instanceof RefreshError
            ? error.message
            : 'Portfolio refresh failed. Inspect the prepared report and database state before retrying.',
      })
    );
    process.exitCode = 1;
  });
}
