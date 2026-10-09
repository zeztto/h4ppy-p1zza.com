import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import express, { type RequestHandler } from 'express';
import type { Database } from '../../db/client.js';

Object.assign(process.env, {
  NODE_ENV: 'development',
  APP_ORIGIN: 'https://p1zza.test',
  DATABASE_URL: 'postgresql://qa:qa@localhost/unused',
  GITHUB_CLIENT_ID: 'qa-only-id',
  GITHUB_CLIENT_SECRET: 'qa-only-secret',
  SESSION_SECRET: 'qa-only-session-secret',
  ADMIN_GITHUB_LOGINS: 'allowed-admin',
  TURNSTILE_SECRET_KEY: 'qa-only-turnstile-secret',
  DOTENV_CONFIG_QUIET: 'true',
});
const { createPublicInquiryRouter } = await import('./inquiries.js');
const { createAuthRouter } = await import('./auth.js');
const { HttpError } = await import('../lib/errors.js');
const { adminUsers } = await import('../../db/schema.js');
const { INQUIRY_FIELD_LIMITS } = await import('../../src/shared/inquiry-contract.js');

function mockDatabase(failDelete = false, existingRole?: string) {
  const inserts: Record<string, unknown>[] = [];
  let currentUser: Record<string, unknown> | undefined = existingRole
    ? {
        id: '123',
        githubId: '123',
        githubLogin: 'allowed-admin',
        role: existingRole,
        avatarUrl: null,
        displayName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    : undefined;
  let deletes = 0;
  const db = {
    query: { adminUsers: { findFirst: async () => currentUser } },
    insert: (table: unknown) => ({
      values: async (row: Record<string, unknown>) => {
        inserts.push(row);
        if (table === adminUsers) currentUser = row;
      },
    }),
    update: () => ({
      set: (row: Record<string, unknown>) => ({
        where: async () => {
          currentUser = { ...currentUser, ...row };
        },
      }),
    }),
    delete: () => ({
      where: async () => {
        if (failDelete) throw new Error('QA revocation failure');
        deletes += 1;
      },
    }),
  } as unknown as Database;
  return { db, inserts, deleteCount: () => deletes };
}

async function withServer(
  router: RequestHandler,
  db: Database,
  callback: (
    call: (
      path: string,
      body?: unknown,
      headers?: Record<string, string>,
      method?: string
    ) => Promise<{ status: number; body: unknown; headers: http.IncomingHttpHeaders }>
  ) => Promise<void>
) {
  const app = express();
  app.use(express.json());
  app.use((_req, res, next) => {
    res.locals.db = db;
    next();
  });
  app.use(router);
  app.use(
    (error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      void _next;
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'QA unexpected error' });
    }
  );
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const call = async (
    path: string,
    body?: unknown,
    headers: Record<string, string> = {},
    method = body === undefined ? 'GET' : 'POST'
  ) => {
    const data = body === undefined ? '' : JSON.stringify(body);
    return new Promise<{ status: number; body: unknown; headers: http.IncomingHttpHeaders }>(
      (resolve, reject) => {
        const req = http.request(
          {
            host: '127.0.0.1',
            port: address.port,
            path,
            method,
            headers: {
              'content-type': 'application/json',
              'content-length': Buffer.byteLength(data),
              origin: 'https://p1zza.test',
              ...headers,
            },
          },
          (incoming) => {
            let content = '';
            incoming.setEncoding('utf8');
            incoming.on('data', (chunk: string) => {
              content += chunk;
            });
            incoming.on('end', () =>
              resolve({
                status: incoming.statusCode ?? 0,
                body:
                  content && incoming.headers['content-type']?.includes('application/json')
                    ? JSON.parse(content)
                    : content || null,
                headers: incoming.headers,
              })
            );
          }
        );
        req.on('error', reject);
        req.end(data);
      }
    );
  };
  try {
    await callback(call);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
}
const valid = {
  name: 'QA User',
  email: 'qa@example.invalid',
  description: 'Local QA fixture',
  turnstileToken: 'qa-token',
};

async function withProvider(
  callback: (calls: () => number) => Promise<void>,
  hostname = 'p1zza.test'
) {
  const original = globalThis.fetch;
  let count = 0;
  globalThis.fetch = async () => {
    count += 1;
    return new Response(JSON.stringify({ success: true, hostname }));
  };
  try {
    await callback(() => count);
  } finally {
    globalThis.fetch = original;
  }
}

test('actual inquiry HTTP route rejects every overflow and adversarial email before provider/DB', async () => {
  const fixture = mockDatabase();
  await withProvider(async (calls) => {
    for (const [field, limit] of Object.entries(INQUIRY_FIELD_LIMITS)) {
      await withServer(createPublicInquiryRouter(), fixture.db, async (call) => {
        const response = await call('/', { ...valid, [field]: 'x'.repeat(limit + 1) });
        assert.equal(response.status, 400, field);
      });
    }
    await withServer(createPublicInquiryRouter(), fixture.db, async (call) => {
      const response = await call('/', { ...valid, email: 'a@' + 'x.'.repeat(16000) + '@x' });
      assert.equal(response.status, 400);
    });
    assert.equal(calls(), 0);
    assert.equal(fixture.inserts.length, 0);
  });
});

test('actual inquiry route persists only trusted req.ip and safe URLs after valid provider hostname', async () => {
  const fixture = mockDatabase();
  await withProvider(async (calls) => {
    await withServer(createPublicInquiryRouter(), fixture.db, async (call) => {
      const response = await call(
        '/',
        { ...valid, name: '  QA User  ' },
        {
          'x-forwarded-for': '203.0.113.66',
          'cf-connecting-ip': '203.0.113.77',
          referer: 'javascript:alert(1)',
        }
      );
      assert.equal(response.status, 201);
    });
    assert.equal(calls(), 1);
    assert.equal(fixture.inserts[0]!['ipAddress'], '127.0.0.1');
    assert.equal(fixture.inserts[0]!['sourceUrl'], null);
    assert.equal(fixture.inserts[0]!['name'], 'QA User');
  });
});

test('unsafe source URL and wrong provider hostname never insert; missing token never calls provider', async () => {
  const fixture = mockDatabase();
  await withProvider(async (calls) => {
    await withServer(createPublicInquiryRouter(), fixture.db, async (call) => {
      assert.equal((await call('/', { ...valid, sourceUrl: 'javascript:alert(1)' })).status, 400);
      assert.equal((await call('/', { ...valid, turnstileToken: undefined })).status, 400);
    });
    assert.equal(calls(), 0);
  });
  await withProvider(async () => {
    await withServer(createPublicInquiryRouter(), fixture.db, async (call) => {
      assert.equal((await call('/', valid)).status, 400);
    });
  }, 'outside.test');
  assert.equal(fixture.inserts.length, 0);
});

test('actual inquiry IP limit cannot be bypassed with changing forwarded/CF headers', async () => {
  const fixture = mockDatabase();
  await withProvider(async (calls) => {
    await withServer(createPublicInquiryRouter(), fixture.db, async (call) => {
      for (let index = 0; index < 12; index += 1) {
        const response = await call(
          '/',
          { ...valid, turnstileToken: undefined },
          { 'x-forwarded-for': `203.0.113.${index}`, 'cf-connecting-ip': `198.51.100.${index}` }
        );
        assert.equal(response.status, index < 10 ? 400 : 429);
        if (index >= 10) assert.ok(Number(response.headers['retry-after']) > 0);
      }
    });
    assert.equal(calls(), 0);
    assert.equal(fixture.inserts.length, 0);
  });
});

test('actual logout route returns 204 on confirmed revoke and 500 without clearing cookie on failure', async () => {
  for (const failure of [false, true]) {
    const fixture = mockDatabase(failure);
    await withServer(createAuthRouter(), fixture.db, async (call) => {
      const response = await call('/logout', {}, { cookie: `sid=${'s'.repeat(43)}` });
      assert.equal(response.status, failure ? 500 : 204);
      if (failure) {
        assert.deepEqual(response.body, {
          error: '로그아웃을 완료하지 못했습니다. 다시 시도해주세요.',
        });
        assert.equal(response.headers['set-cookie'], undefined);
      } else assert.ok(response.headers['set-cookie']?.[0]?.includes('Max-Age=0'));
      const crossOrigin = await call(
        '/logout',
        {},
        { cookie: `sid=${'s'.repeat(43)}`, origin: 'https://outside.test' }
      );
      assert.equal(crossOrigin.status, 403);
      assert.equal(fixture.deleteCount(), failure ? 0 : 1);
    });
  }
});

test('normal OAuth callback issues session; removed identity and existing role downgrade do not', async () => {
  for (const scenario of ['normal', 'removed', 'downgraded']) {
    const fixture = mockDatabase(false, scenario === 'downgraded' ? 'viewer' : undefined);
    const original = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async (url) => {
      calls += 1;
      if (String(url).includes('access_token'))
        return new Response(JSON.stringify({ access_token: 'qa-only-token' }));
      return new Response(
        JSON.stringify({
          id: 123,
          login: scenario === 'removed' ? 'removed-admin' : 'allowed-admin',
          avatar_url: 'https://example.invalid/avatar.png',
          name: 'QA User',
        })
      );
    };
    try {
      await withServer(createAuthRouter(), fixture.db, async (call) => {
        const start = await call('/github/start');
        const state = new URL(String(start.headers.location)).searchParams.get('state');
        const cookie = start.headers['set-cookie']![0]!.split(';')[0]!;
        const callback = await call(`/github/callback?code=qa-code&state=${state}`, undefined, {
          cookie,
        });
        assert.equal(callback.status, 302);
        assert.equal(
          callback.headers.location,
          scenario === 'normal' ? '/admin' : '/admin/login?error=unauthorized'
        );
        const sessionCookies = (callback.headers['set-cookie'] ?? []).filter((value) =>
          value.startsWith('sid=')
        );
        assert.equal(sessionCookies.length, scenario === 'normal' ? 1 : 0);
      });
      assert.equal(calls, 2);
      if (scenario === 'normal') assert.equal(fixture.inserts.length, 2);
      else assert.equal(fixture.inserts.length, 0);
    } finally {
      globalThis.fetch = original;
    }
  }
});
