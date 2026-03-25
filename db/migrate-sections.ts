import type { DatabaseClient } from './client.js';

/**
 * Migrate site_sections from the legacy schema (key TEXT PRIMARY KEY)
 * to the new schema (id TEXT PRIMARY KEY, with additional columns).
 *
 * SQLite cannot ALTER a PRIMARY KEY, so we use the table-rebuild pattern:
 *   1. Create site_sections_new with the new schema
 *   2. Copy rows from the old table (id = key for existing rows)
 *   3. Drop the old table
 *   4. Rename new table to site_sections
 *
 * Also creates the site_settings table if it does not exist.
 */
export async function migrateSections(client: DatabaseClient): Promise<void> {
  // Check if migration is needed: table exists but lacks the section_type column
  const tableInfo = await client.execute(
    "PRAGMA table_info('site_sections')"
  );

  const columns = tableInfo.rows.map((row) => row['name'] as string);

  if (columns.length === 0) {
    // Table does not exist yet; bootstrap will create it with the new schema
    return;
  }

  if (columns.includes('section_type')) {
    // Already migrated
    return;
  }

  // Step 1: Create site_sections_new with the new schema
  await client.execute(`
    CREATE TABLE IF NOT EXISTS site_sections_new (
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
    )
  `);

  // Step 2: Copy data from old table (id = key for existing rows)
  await client.execute(`
    INSERT INTO site_sections_new (id, key, name, description, section_type, template_key, content_json, enabled, sort_order, updated_at)
    SELECT key, key, name, description, 'template', key, '{}', enabled, sort_order, updated_at
    FROM site_sections
  `);

  // Step 3: Drop old table
  await client.execute('DROP TABLE site_sections');

  // Step 4: Rename new table
  await client.execute('ALTER TABLE site_sections_new RENAME TO site_sections');

  // Step 5: Create site_settings table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
}
