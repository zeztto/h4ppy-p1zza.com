import type { DatabaseClient } from './client.js';
import { migrateSections } from './migrate-sections.js';
import { seedDefaults } from './seed-defaults.js';

const statements = [
  `CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY NOT NULL,
    github_id TEXT NOT NULL UNIQUE,
    github_login TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin',
    avatar_url TEXT,
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`,
  'CREATE UNIQUE INDEX IF NOT EXISTS admin_users_github_login_idx ON admin_users (github_login)',
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    session_hash TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
  )`,
  'CREATE UNIQUE INDEX IF NOT EXISTS sessions_hash_idx ON sessions (session_hash)',
  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    year TEXT,
    thumbnail_url TEXT,
    long_description TEXT,
    tags_json TEXT NOT NULL DEFAULT '[]',
    features_json TEXT NOT NULL DEFAULT '[]',
    tech_stack_json TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS site_profile (
    id TEXT PRIMARY KEY NOT NULL DEFAULT 'primary',
    display_name TEXT NOT NULL,
    headline TEXT NOT NULL,
    bio_short TEXT NOT NULL,
    avatar_url TEXT,
    github_url TEXT,
    instagram_url TEXT,
    email TEXT,
    essay_markdown TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS site_sections (
    id TEXT PRIMARY KEY NOT NULL,
    key TEXT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    section_type TEXT NOT NULL DEFAULT 'template',
    template_key TEXT,
    content_json TEXT NOT NULL DEFAULT '{}',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    project_type TEXT,
    budget TEXT,
    timeline TEXT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    source_url TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ
  )`,
  'CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries (status)',
  'CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries (created_at DESC)',
  `CREATE TABLE IF NOT EXISTS inquiry_mail_outbox (
    inquiry_id TEXT PRIMARY KEY NOT NULL REFERENCES inquiries(id),
    message_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CONSTRAINT inquiry_mail_outbox_status_check CHECK (status IN ('pending', 'processing', 'sent')),
    attempts INTEGER NOT NULL DEFAULT 0 CONSTRAINT inquiry_mail_outbox_attempts_check CHECK (attempts >= 0),
    next_attempt_at TIMESTAMPTZ NOT NULL,
    lease_token TEXT,
    lease_expires_at TIMESTAMPTZ,
    last_error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ
  )`,
  'CREATE INDEX IF NOT EXISTS inquiry_mail_outbox_due_idx ON inquiry_mail_outbox (next_attempt_at, created_at) WHERE sent_at IS NULL',
];

export async function grantInquiryMailOutboxAccess(client: DatabaseClient, roleName: string) {
  // Only a specifically named existing application role is accepted; no PUBLIC/default grants.
  if (
    !/^[a-z_][a-z\d_]{0,62}$/i.test(roleName) ||
    ['public', 'postgres'].includes(roleName.toLowerCase())
  ) {
    throw new Error('MIGRATION_APP_ROLE must name the existing restricted application role');
  }
  const result = await client.query<{ safe: boolean }>(
    `SELECT NOT (
    r.rolsuper OR r.rolcreaterole OR r.rolcreatedb OR r.rolbypassrls OR r.rolreplication OR
    has_schema_privilege(r.oid, 'public', 'CREATE') OR
    EXISTS (SELECT 1 FROM pg_roles other WHERE other.oid <> r.oid AND pg_has_role(r.oid, other.oid, 'MEMBER')) OR
    EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND pg_has_role(r.oid, c.relowner, 'MEMBER'))
    ) AS safe FROM pg_roles r WHERE r.rolname = $1`,
    [roleName]
  );
  if (result.rows[0]?.safe !== true)
    throw new Error('MIGRATION_APP_ROLE must be an existing non-owner restricted role');
  // The identifier is validated above and quoted; values in the catalog query are parameterized.
  await client.query(
    `GRANT SELECT, INSERT, UPDATE ON TABLE public.inquiry_mail_outbox TO "${roleName}"`
  );
}

export async function ensureDatabaseSchema(
  client: DatabaseClient,
  options: { seedDefaults?: boolean } = {}
) {
  await migrateSections(client);

  for (const statement of statements) {
    await client.query(statement);
  }

  if (options.seedDefaults !== false) await seedDefaults(client);
}
