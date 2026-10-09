import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request, Response } from 'express';
import type { Database } from '../../db/client.js';
import type { AdminUserRow } from '../../db/schema.js';

Object.assign(process.env, {
  NODE_ENV: 'development',
  APP_ORIGIN: 'https://p1zza.test',
  DATABASE_URL: 'postgresql://qa:qa@localhost/unused',
  GITHUB_CLIENT_ID: 'qa-only-id',
  GITHUB_CLIENT_SECRET: 'qa-only-secret',
  SESSION_SECRET: 'qa-only-session-secret',
  ADMIN_GITHUB_LOGINS: 'allowed-admin',
  TURNSTILE_SECRET_KEY: '',
  DOTENV_CONFIG_QUIET: 'true',
});
const { parseCookies } = await import('./cookies.js');
const { inquiryString, isValidInquiryEmail, safeHttpSourceUrl } =
  await import('./inquiry-input.js');
const { createInquiryRateLimit } = await import('./inquiry-rate-limit.js');
const { createTurnstileVerifier } = await import('./turnstile.js');
const {
  createOAuthState,
  verifyOAuthState,
  createSession,
  invalidateSession,
  readSessionUser,
  SESSION_ABSOLUTE_MAX_AGE_MS,
} = await import('./session.js');
const { createSameOriginGuard, requireAdmin } = await import('../middleware/auth.js');
const { env } = await import('../env.js');
const { INQUIRY_FIELD_LIMITS } = await import('../../src/shared/inquiry-contract.js');

function request(
  headers: Record<string, string> = {},
  extras: Record<string, unknown> = {}
): Request {
  return {
    headers,
    get: (name: string) => headers[name.toLowerCase()],
    method: 'POST',
    protocol: 'https',
    ip: '192.0.2.10',
    ...extras,
  } as unknown as Request;
}
function response() {
  const headers = new Map<string, string[]>();
  return {
    headers,
    res: {
      append: (name: string, value: string) =>
        headers.set(name, [...(headers.get(name) ?? []), value]),
      setHeader: (name: string, value: string) => headers.set(name, [value]),
      locals: {},
    } as unknown as Response,
  };
}
const user: AdminUserRow = {
  id: 'qa-user',
  githubId: '123',
  githubLogin: 'allowed-admin',
  role: 'admin',
  avatarUrl: null,
  displayName: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
function database(
  sessionOverrides: Record<string, unknown> = {},
  userOverrides: Partial<AdminUserRow> = {}
) {
  const updates: Record<string, unknown>[] = [];
  const deletes: unknown[] = [];
  const inserts: Record<string, unknown>[] = [];
  const currentUser = { ...user, ...userOverrides };
  const row = {
    id: 'qa-session',
    userId: user.id,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
    user: currentUser,
    ...sessionOverrides,
  };
  const db = {
    query: {
      sessions: { findFirst: async () => row },
      adminUsers: { findFirst: async () => currentUser },
    },
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: async () => {
          updates.push(values);
        },
      }),
    }),
    delete: () => ({
      where: async (condition: unknown) => {
        deletes.push(condition);
      },
    }),
    insert: () => ({
      values: async (values: Record<string, unknown>) => {
        inserts.push(values);
      },
    }),
  } as unknown as Database;
  return { db, updates, deletes, inserts, row };
}
const sessionRequest = () => request({ cookie: `sid=${'s'.repeat(43)}` });

test('all inquiry strings reject overflow before trim; email adversarial input and normal boundaries', () => {
  for (const [field, limit] of Object.entries(INQUIRY_FIELD_LIMITS)) {
    assert.throws(
      () => inquiryString(' '.repeat(limit + 1), field as keyof typeof INQUIRY_FIELD_LIMITS),
      /이하로 입력/
    );
    assert.equal(inquiryString(' '.repeat(limit), field as keyof typeof INQUIRY_FIELD_LIMITS), '');
  }
  assert.equal(isValidInquiryEmail('a@' + 'x.'.repeat(16000) + '@x'), false);
  assert.equal(isValidInquiryEmail('person+tag@example.com'), true);
  assert.equal(isValidInquiryEmail('name@예시.한국'), true);
  for (const invalid of [
    'x@@example.com',
    'x@example..com',
    '.x@example.com',
    'x@-bad.com',
    'x@example.com/path',
    'x@example%2ecom',
    'x@example.com\n',
  ])
    assert.equal(isValidInquiryEmail(invalid), false);
  const maxEmail =
    'a'.repeat(64) + '@' + 'b'.repeat(63) + '.' + 'c'.repeat(63) + '.' + 'd'.repeat(61);
  assert.equal(maxEmail.length, 254);
  assert.equal(isValidInquiryEmail(maxEmail), true);
  assert.equal(isValidInquiryEmail(maxEmail + 'd'), false);
});

test('source URL permits only credential-free HTTP(S), rejecting unsafe schemes and controls', () => {
  assert.equal(safeHttpSourceUrl('https://example.com/path'), 'https://example.com/path');
  for (const url of [
    'javascript:alert(1)',
    'data:text/html,x',
    '//example.com',
    'file:///tmp/x',
    'https://user:password@example.com/',
    'https://example.com/\n',
  ])
    assert.equal(safeHttpSourceUrl(url), null);
});

test('malformed, duplicate, and oversized cookies never throw or authenticate ambiguous sid', () => {
  assert.equal(parseCookies(request({ cookie: 'sid=%E0%A4%A; theme=dark' })).get('theme'), 'dark');
  assert.equal(parseCookies(request({ cookie: 'sid=%E0%A4%A' })).has('sid'), false);
  assert.equal(
    parseCookies(request({ cookie: 'sid=first; sid=second; sid=third' })).has('sid'),
    false
  );
  assert.equal(parseCookies(request({ cookie: 'x'.repeat(8193) })).size, 0);
});

test('rate limit uses req.ip only, emits Retry-After, and prunes expired keys at capacity', () => {
  let now = 0;
  const limiter = createInquiryRateLimit({ limit: 2, windowMs: 1000, maxKeys: 2, now: () => now });
  const check = (ip: string, spoof: string) => {
    const { res, headers } = response();
    let error: unknown;
    limiter(
      request({ 'x-forwarded-for': spoof, 'cf-connecting-ip': spoof }, { ip }),
      res,
      (value) => {
        error = value;
      }
    );
    return { error, headers };
  };
  assert.equal(check('192.0.2.1', '1.1.1.1').error, undefined);
  assert.equal(check('192.0.2.1', '2.2.2.2').error, undefined);
  const blocked = check('192.0.2.1', '3.3.3.3');
  assert.equal((blocked.error as { statusCode: number }).statusCode, 429);
  assert.deepEqual(blocked.headers.get('Retry-After'), ['1']);
  assert.equal(check('192.0.2.2', '4.4.4.4').error, undefined);
  assert.equal((check('192.0.2.3', '5.5.5.5').error as { statusCode: number }).statusCode, 429);
  now = 1001;
  assert.equal(check('192.0.2.3', '6.6.6.6').error, undefined);
});

function provider(payload: unknown): typeof fetch {
  return async () => new Response(JSON.stringify(payload), { status: 200 });
}
test('Turnstile bounds token before calls, binds hostname, and leaves action unforced', async () => {
  let calls = 0;
  const verifier = createTurnstileVerifier({
    secretKey: 'qa-only',
    production: true,
    expectedHostname: 'p1zza.test',
    fetcher: async () => {
      calls += 1;
      return new Response(
        JSON.stringify({ success: true, hostname: 'p1zza.test', action: 'unspecified' })
      );
    },
  });
  assert.equal((await verifier('x'.repeat(2049))).success, false);
  assert.equal(calls, 0);
  assert.equal((await verifier('valid')).success, true);
  for (const hostname of ['other.test', undefined]) {
    const wrong = createTurnstileVerifier({
      secretKey: 'qa-only',
      production: true,
      expectedHostname: 'p1zza.test',
      fetcher: provider({ success: true, hostname }),
    });
    assert.deepEqual((await wrong('valid')).errorCodes, ['invalid-hostname']);
  }
});

test('Turnstile concurrent cap releases slots after completion', async () => {
  let complete: ((response: globalThis.Response) => void) | undefined;
  let calls = 0;
  const verifier = createTurnstileVerifier({
    secretKey: 'qa-only',
    production: true,
    expectedHostname: 'p1zza.test',
    maxConcurrent: 1,
    fetcher: async () => {
      calls += 1;
      if (calls > 1) return new Response(JSON.stringify({ success: true, hostname: 'p1zza.test' }));
      return new Promise<globalThis.Response>((resolve) => {
        complete = resolve;
      });
    },
  });
  const first = verifier('valid');
  assert.deepEqual((await verifier('valid')).errorCodes, ['verification-busy']);
  assert.equal(calls, 1);
  complete!(new Response(JSON.stringify({ success: true, hostname: 'p1zza.test' })));
  assert.equal((await first).success, true);
  assert.equal((await verifier('valid')).success, true);
});

test('Turnstile deadline aborts stalled provider and releases slot for a later verification', async () => {
  let calls = 0;
  let aborted = false;
  const verifier = createTurnstileVerifier({
    secretKey: 'qa-only',
    production: true,
    expectedHostname: 'p1zza.test',
    maxConcurrent: 1,
    timeoutMs: 15,
    fetcher: async (_url, init) => {
      calls += 1;
      if (calls > 1) return new Response(JSON.stringify({ success: true, hostname: 'p1zza.test' }));
      return new Promise<globalThis.Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => {
            aborted = true;
            reject(new Error('QA abort'));
          },
          { once: true }
        );
      });
    },
  });
  assert.deepEqual((await verifier('valid')).errorCodes, ['verification-timeout']);
  assert.equal(aborted, true);
  assert.equal((await verifier('valid')).success, true);
});

test('removed allowlist identity and downgraded role independently revoke without extending sessions', async () => {
  for (const overrides of [{ githubLogin: 'removed-admin' }, { role: 'viewer' }]) {
    const fixture = database({}, overrides);
    assert.equal(await readSessionUser(fixture.db, sessionRequest()), null);
    assert.equal(fixture.updates.length, 0);
    assert.equal(fixture.deletes.length, 1);
  }
  const fixture = database();
  const previous = [...env.adminGithubLogins];
  try {
    env.adminGithubLogins.splice(0, env.adminGithubLogins.length);
    assert.equal(await readSessionUser(fixture.db, sessionRequest()), null);
    assert.equal(fixture.deletes.length, 1);
  } finally {
    env.adminGithubLogins.push(...previous);
  }
});

test('normal session refresh caps expiry at 30 days and old sessions require reauthentication', async () => {
  const createdAt = new Date(Date.now() - 29 * 86400000);
  const normal = database({ createdAt });
  assert.equal((await readSessionUser(normal.db, sessionRequest()))?.id, user.id);
  assert.equal(normal.updates.length, 1);
  assert.equal(
    (normal.updates[0]!['expiresAt'] as Date).getTime(),
    createdAt.getTime() + SESSION_ABSOLUTE_MAX_AGE_MS
  );
  const expired = database({ createdAt: new Date(Date.now() - 31 * 86400000) });
  assert.equal(await readSessionUser(expired.db, sessionRequest()), null);
  assert.equal(expired.updates.length, 0);
  assert.equal(expired.deletes.length, 1);
});

test('normal OAuth state and session issuance work; malformed or extended state is rejected', async () => {
  const { res, headers } = response();
  const state = createOAuthState(res);
  const cookie = headers.get('Set-Cookie')![0]!.split(';')[0]!;
  verifyOAuthState(request({ cookie }), state);
  assert.throws(
    () => verifyOAuthState(request({ cookie: cookie + '.' }), state),
    /OAuth state invalid/
  );
  assert.throws(
    () => verifyOAuthState(request({ cookie: 'oauth_state=%E0%A4%A' }), state),
    /OAuth state missing/
  );
  const normal = database();
  await createSession(normal.db, res, user.id);
  assert.equal(normal.inserts.length, 1);
  assert.ok(
    headers
      .get('Set-Cookie')!
      .some((value) => value.startsWith('sid=') && value.includes('HttpOnly'))
  );
  const downgraded = database({}, { role: 'viewer' });
  await assert.rejects(createSession(downgraded.db, res, user.id), /Unauthorized/);
  assert.equal(downgraded.inserts.length, 0);
});

test('logout clears cookie only after revocation; failed DB revoke keeps cookie', async () => {
  const normal = database();
  const first = response();
  await invalidateSession(normal.db, sessionRequest(), first.res);
  assert.equal(normal.deletes.length, 1);
  assert.ok(first.headers.get('Set-Cookie')![0]!.includes('Max-Age=0'));
  const failed = {
    delete: () => ({
      where: async () => {
        throw new Error('QA DB failure');
      },
    }),
  } as unknown as Database;
  const second = response();
  await assert.rejects(invalidateSession(failed, sessionRequest(), second.res), /QA DB failure/);
  assert.equal(second.headers.has('Set-Cookie'), false);
});

test('production origin is fixed and requireAdmin rechecks role/allowlist', () => {
  const guard = createSameOriginGuard('https://p1zza.test', true);
  const check = (headers: Record<string, string>) => {
    let error: unknown;
    guard(request(headers), response().res, (value) => {
      error = value;
    });
    return error;
  };
  assert.equal(check({ origin: 'https://p1zza.test' }), undefined);
  assert.equal(
    (
      check({
        origin: 'https://outside.test',
        'x-forwarded-host': 'outside.test',
        'x-forwarded-proto': 'https',
        host: 'outside.test',
      }) as { statusCode: number }
    ).statusCode,
    403
  );
  assert.equal((check({}) as { statusCode: number }).statusCode, 403);
  assert.equal(check({ referer: 'https://p1zza.test/admin' }), undefined);
  const { res } = response();
  for (const current of [null, { ...user, role: 'viewer' }, { ...user, githubLogin: 'removed' }]) {
    res.locals.adminUser = current;
    let error: unknown;
    requireAdmin(request(), res, (value) => {
      error = value;
    });
    assert.equal((error as { statusCode: number }).statusCode, 401);
  }
});
