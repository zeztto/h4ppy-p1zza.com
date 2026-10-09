import assert from 'node:assert/strict';
import test from 'node:test';
import { ensureDatabaseSchema } from './bootstrap.js';
import type { DatabaseClient } from './client.js';

function currentDatabaseFixture() {
  const queries: string[] = [];
  const client = {
    query: async (query: string) => {
      queries.push(query);
      if (query.includes('information_schema.columns')) {
        return {
          rows: ['id', 'key', 'section_type', 'template_key', 'content_json'].map((column) => ({
            column_name: column,
            data_type: 'text',
            is_nullable: 'NO',
          })),
        };
      }
      if (query.includes('information_schema.table_constraints'))
        return { rows: [{ column_name: 'id' }] };
      return { rows: [] };
    },
    connect: async () => {
      throw new Error('An existing current schema must not be migrated');
    },
  } as unknown as DatabaseClient;
  return { client, queries };
}

test('production schema bootstrap leaves existing sections and settings byte-preserved', async () => {
  const fixture = currentDatabaseFixture();
  await ensureDatabaseSchema(fixture.client, { seedDefaults: false });
  assert.equal(
    fixture.queries.some((query) => /^\s*(?:INSERT|UPDATE|DELETE|ALTER|DROP)\b/i.test(query)),
    false
  );
  assert.equal(
    fixture.queries.filter((query) => query.startsWith('CREATE TABLE IF NOT EXISTS')).length,
    7
  );
});

test('development and explicit seed callers retain default initialization', async () => {
  const fixture = currentDatabaseFixture();
  await ensureDatabaseSchema(fixture.client);
  assert.equal(
    fixture.queries.filter((query) => query.includes('INSERT INTO site_settings')).length,
    3
  );
  assert.equal(
    fixture.queries.some((query) => query.includes('UPDATE site_sections')),
    true
  );
});
