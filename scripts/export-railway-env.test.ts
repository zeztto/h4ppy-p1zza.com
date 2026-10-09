import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runRailwayExport } from './export-railway-env.js';

const scriptPath = fileURLToPath(new URL('./export-railway-env.ts', import.meta.url));

function fixture() {
  const directory = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'p1zza-export-test-'));
  fs.chmodSync(directory, 0o700);
  return {
    directory,
    filename: path.join(directory, 'production.env'),
    cleanup: () => fs.rmSync(directory, { recursive: true, force: true }),
  };
}

function execute(args: string[], overrides: Parameters<typeof runRailwayExport>[1] = {}) {
  let stdout = '';
  let stderr = '';
  let providerCalls = 0;
  const status = runRailwayExport(args, {
    env: { POSTGRES_PASSWORD: 'synthetic-test-only-password' },
    readVariables: () => {
      providerCalls += 1;
      return {
        SESSION_SECRET: 'synthetic-session-secret',
        TURSO_AUTH_TOKEN: 'synthetic-legacy-secret',
      };
    },
    writeStdout: (value) => {
      stdout += value;
    },
    writeStderr: (value) => {
      stderr += value;
    },
    ...overrides,
  });
  return { status, stdout, stderr, providerCalls };
}

test('CLI requires an explicit output destination before contacting Railway', () => {
  const directory = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'p1zza-export-test-'));
  const marker = path.join(directory, 'provider-called');
  const provider = path.join(directory, 'railway');
  fs.writeFileSync(
    provider,
    `#!${process.execPath}\nrequire('node:fs').writeFileSync(process.env['PROVIDER_MARKER'], 'called'); process.stdout.write('{}');\n`,
    { mode: 0o700 }
  );
  try {
    const result = spawnSync(process.execPath, ['--import', 'tsx', scriptPath], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${directory}${path.delimiter}${process.env['PATH'] ?? ''}`,
        PROVIDER_MARKER: marker,
        POSTGRES_PASSWORD: 'synthetic-test-only-password',
      },
    });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.equal(fs.existsSync(marker), false);
    assert.doesNotMatch(result.stderr, /synthetic-test-only-password/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('creates a new 0600 file in a private owned directory without stdout secrets', () => {
  const item = fixture();
  try {
    const result = execute(['--output', item.filename]);
    assert.equal(result.status, 0);
    assert.equal(result.providerCalls, 1);
    assert.equal(result.stdout, '');
    assert.equal(fs.statSync(item.filename).mode & 0o777, 0o600);
    assert.equal(fs.statSync(item.filename).uid, process.getuid!());
    const content = fs.readFileSync(item.filename, 'utf8');
    assert.match(content, /SESSION_SECRET="synthetic-session-secret"/);
    assert.doesNotMatch(content, /synthetic-legacy-secret/);
    assert.doesNotMatch(result.stderr, /synthetic-|production\.env/);
  } finally {
    item.cleanup();
  }
});

test('only explicit stdout exports secrets, and legacy values require opt-in', () => {
  const result = execute(['--stdout', '--include-legacy']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /SESSION_SECRET="synthetic-session-secret"/);
  assert.match(result.stdout, /TURSO_AUTH_TOKEN="synthetic-legacy-secret"/);
  assert.match(result.stderr, /receiving stream contains secrets/);
  assert.doesNotMatch(result.stderr, /synthetic-/);
});

test('invalid, ambiguous and legacy password arguments never contact the provider', () => {
  for (const args of [
    [],
    ['--output'],
    ['--stdout', '--output', 'new.env'],
    ['--stdout', '--stdout'],
    ['--output', 'one.env', '--output', 'two.env'],
    ['--stdout', '--overwrite'],
    ['--stdout', '--postgres-password', 'synthetic-password-argument'],
    ['--stdout', '--postgres-host', 'db:5432'],
    ['--output', 'a\nb.env'],
  ]) {
    const result = execute(args);
    assert.equal(result.status, 1);
    assert.equal(result.providerCalls, 0);
    assert.equal(result.stdout, '');
    assert.doesNotMatch(result.stderr, /synthetic-password-argument|one\.env|two\.env/);
  }
});

test('the password environment variable is required and single-line', () => {
  for (const password of [undefined, '', 'synthetic\npassword', 'synthetic\0password']) {
    const result = execute(['--stdout'], { env: { POSTGRES_PASSWORD: password } });
    assert.equal(result.status, 1);
    assert.equal(result.providerCalls, 0);
    assert.equal(result.stdout, '');
    assert.doesNotMatch(result.stderr, /synthetic/);
  }
});

test('existing files and dangling symlinks are refused without provider access or overwrites', () => {
  const item = fixture();
  try {
    fs.writeFileSync(item.filename, 'preserved-original', { mode: 0o600 });
    let result = execute(['--output', item.filename]);
    assert.equal(result.status, 1);
    assert.equal(result.providerCalls, 0);
    assert.equal(fs.readFileSync(item.filename, 'utf8'), 'preserved-original');
    fs.unlinkSync(item.filename);
    fs.symlinkSync(path.join(item.directory, 'missing-target'), item.filename);
    result = execute(['--output', item.filename]);
    assert.equal(result.status, 1);
    assert.equal(result.providerCalls, 0);
    assert.equal(fs.lstatSync(item.filename).isSymbolicLink(), true);
  } finally {
    item.cleanup();
  }
});

test('public, foreign-owned, missing and symlink parent directories fail before provider access', () => {
  const item = fixture();
  try {
    fs.chmodSync(item.directory, 0o755);
    assert.equal(execute(['--output', item.filename]).providerCalls, 0);
    fs.chmodSync(item.directory, 0o700);
    let result = execute(['--output', item.filename], { uid: process.getuid!() + 1 });
    assert.equal(result.status, 1);
    assert.equal(result.providerCalls, 0);
    result = execute(['--output', path.join(item.directory, 'missing-parent', 'export.env')]);
    assert.equal(result.status, 1);
    assert.equal(result.providerCalls, 0);
    const alias = path.join(item.directory, 'alias');
    fs.symlinkSync(item.directory, alias, 'dir');
    result = execute(['--output', path.join(alias, 'export.env')]);
    assert.equal(result.status, 1);
    assert.equal(result.providerCalls, 0);
    assert.equal(fs.existsSync(item.filename), false);
  } finally {
    item.cleanup();
  }
});

test('a writable ancestor is refused even when the immediate directory is private', () => {
  const item = fixture();
  try {
    const inner = path.join(item.directory, 'private');
    fs.mkdirSync(inner, { mode: 0o700 });
    fs.chmodSync(item.directory, 0o777);
    const result = execute(['--output', path.join(inner, 'production.env')]);
    assert.equal(result.status, 1);
    assert.equal(result.providerCalls, 0);
  } finally {
    item.cleanup();
  }
});

test('provider failures and malformed responses remove the empty reservation and redact errors', () => {
  const item = fixture();
  try {
    for (const provider of [
      () => {
        throw new Error('synthetic-session-secret in failed provider stdout/stderr');
      },
      () => ['synthetic-session-secret'],
      () => ({ SESSION_SECRET: { secret: 'synthetic-session-secret' } }),
      () => ({ SESSION_SECRET: 'synthetic-session-secret\nANOTHER_KEY=bad' }),
    ]) {
      const result = execute(['--output', item.filename], { readVariables: provider });
      assert.equal(result.status, 1);
      assert.equal(result.stdout, '');
      assert.doesNotMatch(result.stderr, /synthetic-session-secret|ANOTHER_KEY/);
      assert.equal(fs.existsSync(item.filename), false);
    }
  } finally {
    item.cleanup();
  }
});

test('a file replaced by a symlink during provider retrieval is never written or removed', () => {
  const item = fixture();
  const target = path.join(item.directory, 'preserve-target');
  try {
    fs.writeFileSync(target, 'preserved-original', { mode: 0o600 });
    const result = execute(['--output', item.filename], {
      readVariables: () => {
        fs.unlinkSync(item.filename);
        fs.symlinkSync(target, item.filename);
        return { SESSION_SECRET: 'synthetic-session-secret' };
      },
    });
    assert.equal(result.status, 1);
    assert.equal(fs.readFileSync(target, 'utf8'), 'preserved-original');
    assert.equal(fs.lstatSync(item.filename).isSymbolicLink(), true);
    assert.equal(result.stdout, '');
  } finally {
    item.cleanup();
  }
});

test('new hard links during provider retrieval are rejected before writing secrets', () => {
  const item = fixture();
  const alias = path.join(item.directory, 'linked-reservation');
  try {
    const result = execute(['--output', item.filename], {
      readVariables: () => {
        fs.linkSync(item.filename, alias);
        return { SESSION_SECRET: 'synthetic-session-secret' };
      },
    });
    assert.equal(result.status, 1);
    assert.equal(fs.readFileSync(alias, 'utf8'), '');
    assert.equal(result.stdout, '');
  } finally {
    item.cleanup();
  }
});

test('help does not read credentials or contact the provider', () => {
  const result = execute(['--help'], { env: {} });
  assert.equal(result.status, 0);
  assert.equal(result.providerCalls, 0);
  assert.match(result.stdout, /mode 0700/);
  assert.doesNotMatch(result.stdout, /synthetic-/);
});

test('DB credentials are URL-encoded and Compose dollar values are literal', () => {
  const result = execute(['--stdout', '--postgres-user', 'my:user', '--postgres-db', 'my/db'], {
    env: { POSTGRES_PASSWORD: 'test$VAR:pass@/#' },
    readVariables: () => ({ SESSION_SECRET: "test$VAR's-secret" }),
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /POSTGRES_PASSWORD="test\$\$VAR:pass@\/#"/);
  assert.match(
    result.stdout,
    /DATABASE_URL="postgres:\/\/my%3Auser:test%24VAR%3Apass%40%2F%23@db:5432\/my%2Fdb"/
  );
  assert.match(result.stdout, /SESSION_SECRET="test\$\$VAR's-secret"/);
});

const composeAvailable =
  spawnSync('docker', ['compose', 'version'], { stdio: 'ignore' }).status === 0;

test(
  'Compose env-file parsing preserves quotes, backslashes and dollar expressions',
  { skip: !composeAvailable },
  () => {
    const item = fixture();
    try {
      const compose = path.join(item.directory, 'compose.yml');
      fs.writeFileSync(
        compose,
        'services:\n  check:\n    image: busybox\n    environment:\n      CHECK_VALUE: ${SESSION_SECRET}\n'
      );
      for (const value of [
        "a'b",
        'a\\b',
        'a\\',
        "a\\'b",
        '${UNSET}$(echo hi)',
        'test$VAR:pass@/#',
      ]) {
        const result = execute(['--stdout'], { readVariables: () => ({ SESSION_SECRET: value }) });
        assert.equal(result.status, 0);
        fs.writeFileSync(item.filename, result.stdout, { mode: 0o600 });
        const env: NodeJS.ProcessEnv = {};
        for (const key of ['PATH', 'HOME', 'USER', 'LANG']) env[key] = process.env[key];
        const parsed = spawnSync(
          'docker',
          ['compose', '--env-file', item.filename, '-f', compose, 'config', '--environment'],
          { encoding: 'utf8', env }
        );
        assert.equal(parsed.status, 0);
        const variable = parsed.stdout
          .split('\n')
          .find((line) => line.startsWith('SESSION_SECRET='));
        assert.equal(variable?.slice('SESSION_SECRET='.length), value);
      }
    } finally {
      item.cleanup();
    }
  }
);

test('a parent moved and replaced during retrieval cannot receive secret output', () => {
  const item = fixture();
  const parent = path.join(item.directory, 'private');
  const moved = path.join(item.directory, 'moved');
  fs.mkdirSync(parent, { mode: 0o700 });
  const filename = path.join(parent, 'production.env');
  try {
    const result = execute(['--output', filename], {
      readVariables: () => {
        fs.renameSync(parent, moved);
        fs.mkdirSync(parent, { mode: 0o700 });
        return { SESSION_SECRET: 'synthetic-session-secret' };
      },
    });
    assert.equal(result.status, 1);
    assert.equal(fs.existsSync(filename), false);
    assert.equal(fs.readFileSync(path.join(moved, 'production.env'), 'utf8'), '');
    assert.equal(result.stdout, '');
  } finally {
    item.cleanup();
  }
});

test('file permission changes during retrieval abort before any secret is written', () => {
  const item = fixture();
  try {
    const result = execute(['--output', item.filename], {
      readVariables: () => {
        fs.chmodSync(item.filename, 0o644);
        return { SESSION_SECRET: 'synthetic-session-secret' };
      },
    });
    assert.equal(result.status, 1);
    assert.equal(fs.existsSync(item.filename), false);
    assert.equal(result.stdout, '');
    assert.doesNotMatch(result.stderr, /synthetic-/);
  } finally {
    item.cleanup();
  }
});

test('the real CLI suppresses a failing provider stderr and removes its reservation', () => {
  const item = fixture();
  try {
    const provider = path.join(item.directory, 'railway');
    fs.writeFileSync(
      provider,
      `#!${process.execPath}\nprocess.stderr.write('synthetic-provider-secret'); process.exit(2);\n`,
      { mode: 0o700 }
    );
    const result = spawnSync(
      process.execPath,
      ['--import', 'tsx', scriptPath, '--output', item.filename],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${item.directory}${path.delimiter}${process.env['PATH'] ?? ''}`,
          POSTGRES_PASSWORD: 'synthetic-password',
        },
      }
    );
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.doesNotMatch(result.stderr, /synthetic-provider-secret|synthetic-password/);
    assert.equal(fs.existsSync(item.filename), false);
  } finally {
    item.cleanup();
  }
});

test('Git ignores additional environment files while allowing the canonical example', () => {
  const filenames = [
    '.env',
    '.env.local',
    '.env.staging',
    '.env.vultr',
    'deployment.env',
    '.env.example',
  ];
  const result = spawnSync('git', ['check-ignore', '--no-index', '--stdin'], {
    cwd: path.dirname(path.dirname(scriptPath)),
    encoding: 'utf8',
    input: `${filenames.join('\n')}\n`,
  });
  assert.equal(result.status, 0);
  assert.deepEqual(result.stdout.trim().split('\n'), filenames.slice(0, -1));
});
