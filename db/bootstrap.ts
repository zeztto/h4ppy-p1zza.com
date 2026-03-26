import type { DatabaseClient } from './client.js';
import { migrateSections } from './migrate-sections.js';
import { seedDefaults } from './seed-defaults.js';

const statements = [
  'PRAGMA foreign_keys = ON',
  `CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY NOT NULL,
    github_id TEXT NOT NULL UNIQUE,
    github_login TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin',
    avatar_url TEXT,
    display_name TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  'CREATE UNIQUE INDEX IF NOT EXISTS admin_users_github_login_idx ON admin_users (github_login)',
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    session_hash TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
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
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
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
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS site_sections (
    id TEXT PRIMARY KEY NOT NULL,
    key TEXT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    section_type TEXT NOT NULL DEFAULT 'template',
    template_key TEXT,
    content_json TEXT NOT NULL DEFAULT '{}',
    enabled INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
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
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    resolved_at INTEGER
  )`,
  'CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries (status)',
  'CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries (created_at DESC)',
];

export async function ensureDatabaseSchema(client: DatabaseClient) {
  await migrateSections(client);

  for (const statement of statements) {
    await client.execute(statement);
  }

  await seedDefaults(client);
}
