import assert from 'node:assert/strict';
import test from 'node:test';
import type { DatabaseClient } from './client.js';
import { assertDatabaseReady } from './runtime-access.js';

function databaseFixture(
  access:
    | {
        elevated: boolean | null;
        role_memberships: boolean | null;
        schema_create: boolean | null;
        owns_tables: boolean | null;
      }
    | undefined,
  missingTable = false
) {
  const queries: string[] = [];
  const client = {
    query: async (query: string) => {
      queries.push(query);
      if (query.includes('FROM pg_roles')) return { rows: access ? [access] : [] };
      if (missingTable) throw new Error('Sensitive connection detail should not reach callers');
      return { rows: [] };
    },
  } as unknown as DatabaseClient;
  return { client, queries };
}

test('runtime startup checks schema with read-only queries and rejects elevated or owner roles', async () => {
  const ready = databaseFixture({
    elevated: false,
    role_memberships: false,
    schema_create: false,
    owns_tables: false,
  });
  await assertDatabaseReady(ready.client, true);
  assert.equal(ready.queries.length, 8);
  assert.equal(
    ready.queries.every((query) => query.trimStart().startsWith('SELECT')),
    true
  );
  for (const key of ['elevated', 'role_memberships', 'schema_create', 'owns_tables'] as const) {
    const forbidden = databaseFixture({
      elevated: false,
      role_memberships: false,
      schema_create: false,
      owns_tables: false,
      [key]: true,
    });
    await assert.rejects(assertDatabaseReady(forbidden.client, true), /non-owner application role/);
    assert.equal(forbidden.queries.length, 1);
  }
});

test('enabled mail requires eighth table and outbox write grants while disabled remains legacy ready', async () => {
  const queries: string[] = [];
  let privileges = true;
  const client = {
    query: async (query: string) => {
      queries.push(query);
      if (query.includes('has_table_privilege')) return { rows: [{ ready: privileges }] };
      return { rows: [] };
    },
  } as unknown as DatabaseClient;
  await assertDatabaseReady(client, false, true);
  assert.equal(queries.length, 9);
  assert.match(queries[7]!, /FROM public.inquiry_mail_outbox LIMIT 0/);
  assert.match(queries[8]!, /'INSERT'/);
  assert.match(queries[8]!, /'UPDATE'/);
  privileges = false;
  await assert.rejects(assertDatabaseReady(client, false, true), /schema is not ready/);
  queries.length = 0;
  await assertDatabaseReady(client, false, false);
  assert.equal(queries.length, 7);
});

test('missing schema stops startup with a sanitized bootstrap instruction', async () => {
  const missing = databaseFixture(
    { elevated: false, role_memberships: false, schema_create: false, owns_tables: false },
    true
  );
  await assert.rejects(assertDatabaseReady(missing.client, true), {
    message: 'Database schema is not ready; run db:bootstrap with migration credentials',
  });
});

test('missing or NULL role metadata fails closed before checking content tables', async () => {
  for (const metadata of [
    undefined,
    { elevated: false, role_memberships: null, schema_create: false, owns_tables: false },
  ]) {
    const fixture = databaseFixture(metadata);
    await assert.rejects(assertDatabaseReady(fixture.client, true), /non-owner application role/);
    assert.equal(fixture.queries.length, 1);
  }
});
