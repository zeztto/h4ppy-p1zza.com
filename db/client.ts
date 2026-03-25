import { createClient, type Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

export function createLibsqlClient(url: string, authToken: string) {
  return createClient({
    url,
    authToken,
  });
}

export function createDatabaseClient(url: string, authToken: string) {
  const client = createLibsqlClient(url, authToken);
  return drizzle(client, { schema });
}

export function createDatabase(url: string, authToken: string) {
  const client = createLibsqlClient(url, authToken);
  return {
    client,
    db: drizzle(client, { schema }),
  };
}

export type Database = ReturnType<typeof createDatabaseClient>;
export type DatabaseClient = Client;
