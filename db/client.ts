import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export function createDatabaseClient(url: string) {
  const client = new Pool({
    connectionString: url,
    max: 10,
  });
  return drizzle(client, { schema });
}

export function createDatabase(url: string) {
  const client = new Pool({
    connectionString: url,
    max: 10,
  });
  return {
    client,
    db: drizzle(client, { schema }),
  };
}

export type Database = ReturnType<typeof createDatabaseClient>;
export type DatabaseClient = Pool;
