import assert from 'node:assert/strict';
import { request } from 'node:http';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import { createDatabase } from '../db/client.js';

Object.assign(process.env, {
  NODE_ENV: 'production',
  APP_ORIGIN: 'https://p1zza.kr',
  GITHUB_CLIENT_ID: 'test-oauth-client-id',
  GITHUB_CLIENT_SECRET: 'test-oauth-client-secret',
  ADMIN_GITHUB_LOGINS: 'zeztto',
  SESSION_SECRET: 'fixture-only-session-value-32-characters-long',
  DATABASE_URL: 'postgres://fixture_runtime:fixture-only-password@localhost/fixture',
  TURNSTILE_SECRET_KEY: 'fixture-only-captcha-secret',
  TRUSTED_PROXY_CIDRS: '127.0.0.1/32',
});

const { createApp, resolveCanonicalRedirectUrl } = await import('./app.js');

async function fixture() {
  const database = createDatabase(process.env['DATABASE_URL']!);
  const queries: string[] = [];
  database.client.query = (async (query: string) => {
    queries.push(query);
    return {
      rows: query.includes('FROM pg_roles')
        ? [{ elevated: false, role_memberships: false, schema_create: false, owns_tables: false }]
        : [],
    };
  }) as typeof database.client.query;
  const app = await createApp({ database });
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const port = (server.address() as AddressInfo).port;
  const send = (
    path: string,
    options: { method?: string; body?: string; headers?: Record<string, string> } = {}
  ) =>
    new Promise<{ status: number; headers: import('node:http').IncomingHttpHeaders; body: string }>(
      (resolve, reject) => {
        const outgoing = request(
          {
            hostname: '127.0.0.1',
            port,
            path,
            method: options.method ?? 'GET',
            headers: { host: 'p1zza.kr', ...options.headers },
          },
          (incoming) => {
            let body = '';
            incoming.setEncoding('utf8');
            incoming.on('data', (chunk: string) => {
              body += chunk;
            });
            incoming.on('end', () =>
              resolve({ status: incoming.statusCode ?? 0, headers: incoming.headers, body })
            );
          }
        );
        outgoing.on('error', reject);
        outgoing.end(options.body);
      }
    );
  return {
    app,
    queries,
    send,
    close: async () => {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      );
      await database.client.end();
    },
  };
}

test('actual app startup does not mutate schema and trusts only the configured immediate peer', async () => {
  const runtime = await fixture();
  try {
    assert.equal(
      runtime.queries.every((query) => query.trimStart().startsWith('SELECT')),
      true
    );
    const trust = runtime.app.get('trust proxy fn') as (ip: string, hop: number) => boolean;
    assert.equal(trust('127.0.0.1', 0), true);
    assert.equal(trust('::ffff:127.0.0.1', 0), true);
    assert.equal(trust('127.0.0.1', 1), false);
    assert.equal(trust('192.0.2.1', 0), false);
  } finally {
    await runtime.close();
  }
});

test('canonical redirect remains on APP_ORIGIN for protocol-relative and backslash paths', async () => {
  const runtime = await fixture();
  try {
    const redirected = await runtime.send(
      '//outside.invalid/profile?next=https://outside.invalid',
      { headers: { host: 'www.p1zza.kr' } }
    );
    assert.equal(redirected.status, 308);
    assert.equal(
      redirected.headers.location,
      'https://p1zza.kr/outside.invalid/profile?next=https://outside.invalid'
    );
    assert.equal(redirected.headers['x-content-type-options'], 'nosniff');
    const destination = resolveCanonicalRedirectUrl({
      hostname: 'www.p1zza.kr',
      originalUrl: '\\outside.invalid/path?test=1',
    } as import('express').Request);
    assert.equal(new URL(destination!).origin, 'https://p1zza.kr');
    assert.equal(
      resolveCanonicalRedirectUrl({
        hostname: 'unlisted.invalid',
        originalUrl: '/',
      } as import('express').Request),
      null
    );
  } finally {
    await runtime.close();
  }
});

test('auth/admin responses and body parser errors carry cache and security protections', async () => {
  const runtime = await fixture();
  try {
    const session = await runtime.send('/api/auth/session');
    assert.equal(session.status, 200);
    assert.equal(session.headers['cache-control'], 'private, no-store');
    assert.equal(session.headers['strict-transport-security'], 'max-age=2592000');
    const admin = await runtime.send('/api/admin/projects');
    assert.equal(admin.status, 401);
    assert.equal(admin.headers['cache-control'], 'private, no-store');
    const invalid = await runtime.send('/api/admin/projects', {
      method: 'POST',
      body: '{"private-input":',
      headers: { 'content-type': 'application/json' },
    });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.headers['cache-control'], 'private, no-store');
    assert.equal(invalid.headers['x-content-type-options'], 'nosniff');
    assert.equal(invalid.headers['strict-transport-security'], 'max-age=2592000');
    assert.equal(invalid.body.includes('private-input'), false);
    const oversized = await runtime.send('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify({ text: 'x'.repeat(2 * 1024 * 1024) }),
      headers: { 'content-type': 'application/json' },
    });
    assert.equal(oversized.status, 413);
    assert.equal(oversized.headers['cache-control'], 'private, no-store');
    assert.equal(oversized.headers['x-frame-options'], 'SAMEORIGIN');
    const tooManyParameters = await runtime.send('/api/admin/projects', {
      method: 'POST',
      body: Array.from({ length: 1001 }, (_, index) => `key${index}=value`).join('&'),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    assert.equal(tooManyParameters.status, 413);
    assert.equal(tooManyParameters.headers['cache-control'], 'private, no-store');
    const unsupportedCharset = await runtime.send('/api/admin/projects', {
      method: 'POST',
      body: '{}',
      headers: { 'content-type': 'application/json; charset=iso-8859-1' },
    });
    assert.equal(unsupportedCharset.status, 415);
    assert.equal(unsupportedCharset.headers['x-content-type-options'], 'nosniff');
  } finally {
    await runtime.close();
  }
});
