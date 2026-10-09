import { config as loadEnv } from 'dotenv';
import { ensureDatabaseSchema } from './bootstrap.js';
import { createDatabase } from './client.js';

loadEnv({ path: '.env.local', override: false });
loadEnv();

const databaseUrl = process.env['MIGRATION_DATABASE_URL'];
if (!databaseUrl) throw new Error('MIGRATION_DATABASE_URL is required for schema bootstrap');

const { client } = createDatabase(databaseUrl);
try {
  // Schema setup is separate from application startup and never refreshes existing content.
  await ensureDatabaseSchema(client, { seedDefaults: false });
  console.warn(JSON.stringify({ ok: true, operation: 'schema-bootstrap', contentSeeded: false }));
} finally {
  await client.end();
}
