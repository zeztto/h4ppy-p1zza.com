import assert from 'node:assert/strict';
import test from 'node:test';
import { readEnvironment } from './env-config.js';

function production() {
  return {
    NODE_ENV: 'production',
    APP_ORIGIN: 'https://p1zza.kr',
    GITHUB_CLIENT_ID: 'test-oauth-client-id',
    GITHUB_CLIENT_SECRET: 'test-oauth-client-secret',
    ADMIN_GITHUB_LOGINS: 'zeztto',
    SESSION_SECRET: 'fixture-only-session-value-32-characters-long',
    DATABASE_URL: 'postgres://fixture_runtime:fixture-only-password@localhost/fixture',
    TURNSTILE_SECRET_KEY: 'fixture-only-captcha-secret',
    TRUSTED_PROXY_CIDRS: '192.0.2.20/32',
  };
}

test('production accepts an HTTPS origin and exact trusted peer without migration credentials', () => {
  const config = readEnvironment(production());
  assert.equal(config.appOrigin, 'https://p1zza.kr');
  assert.deepEqual(config.trustedProxyCidrs, ['192.0.2.20/32']);
  assert.equal('migrationDatabaseUrl' in config, false);
});

test('production rejects missing values and placeholder secrets without printing them', () => {
  for (const key of [
    'APP_ORIGIN',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'ADMIN_GITHUB_LOGINS',
    'TURNSTILE_SECRET_KEY',
    'TRUSTED_PROXY_CIDRS',
  ] as const) {
    assert.throws(() => readEnvironment({ ...production(), [key]: '' }), new RegExp(key));
  }
  for (const value of ['replace-me', 'short-value', 'generate-a-new-random-secret'.repeat(2)]) {
    assert.throws(
      () => readEnvironment({ ...production(), SESSION_SECRET: value }),
      /SESSION_SECRET/
    );
  }
});

test('production rejects insecure origins, DDL account defaults and broad proxy ranges', () => {
  for (const value of [
    'http://p1zza.kr',
    'https://p1zza.kr/path',
    'https://user:pass@p1zza.kr',
    'https://p1zza.kr?x=1',
  ]) {
    assert.throws(() => readEnvironment({ ...production(), APP_ORIGIN: value }), /APP_ORIGIN/);
  }
  for (const value of [
    'postgres://postgres:strong-fixture-password@localhost/fixture',
    'postgres://app:postgres@localhost/fixture',
  ]) {
    assert.throws(() => readEnvironment({ ...production(), DATABASE_URL: value }), /DATABASE_URL/);
  }
  for (const value of ['192.0.2.0/24', 'loopback', '1', '::/0', '192.0.2.20', '::1/64']) {
    assert.throws(
      () => readEnvironment({ ...production(), TRUSTED_PROXY_CIDRS: value }),
      /TRUSTED_PROXY_CIDRS/
    );
  }
  assert.deepEqual(
    readEnvironment({ ...production(), TRUSTED_PROXY_CIDRS: '::1/128' }).trustedProxyCidrs,
    ['::1/128']
  );
});

test('development preserves local defaults while rejecting invalid ports and protocols', () => {
  const config = readEnvironment({
    ...production(),
    NODE_ENV: 'development',
    APP_ORIGIN: '',
    TRUSTED_PROXY_CIDRS: '',
  });
  assert.equal(config.appOrigin, 'http://localhost:5173');
  assert.deepEqual(config.trustedProxyCidrs, []);
  for (const value of ['NaN', '3001junk', '0', '65536', '-1']) {
    assert.throws(() => readEnvironment({ ...production(), PORT: value }), /PORT/);
  }
  assert.throws(
    () => readEnvironment({ ...production(), DATABASE_URL: 'https://database.invalid' }),
    /DATABASE_URL/
  );
});
