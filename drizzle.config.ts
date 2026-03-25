import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

loadEnv({ path: '.env.local', override: false });
loadEnv();

export default defineConfig({
  dialect: 'sqlite',
  schema: './db/schema.ts',
  out: './db/migrations',
  dbCredentials: {
    url: process.env['TURSO_DATABASE_URL'] ?? '',
    authToken: process.env['TURSO_AUTH_TOKEN'] ?? '',
  },
  strict: true,
  verbose: true,
});
