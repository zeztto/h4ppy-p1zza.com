import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const RUNTIME_KEYS = [
  'ADMIN_GITHUB_LOGINS',
  'APP_ORIGIN',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_URL',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'SESSION_SECRET',
  'TURNSTILE_SECRET_KEY',
  'VITE_TURNSTILE_SITE_KEY',
] as const;

const LEGACY_KEYS = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'] as const;

function readOption(flag: string) {
  const optionIndex = process.argv.findIndex((arg) => arg === flag);
  if (optionIndex === -1) {
    return null;
  }

  return process.argv[optionIndex + 1] ?? null;
}

function shellEscape(value: string) {
  if (/^[A-Za-z0-9_./:@+-]*$/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}

function readRailwayVariables() {
  const output = execFileSync('railway', ['variables', '--json'], {
    encoding: 'utf8',
  });

  return JSON.parse(output) as Record<string, string>;
}

function resolveOutputPath() {
  return readOption('--output');
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function main() {
  const vars = readRailwayVariables();
  const postgresDb = readOption('--postgres-db') || 'p1zza';
  const postgresUser = readOption('--postgres-user') || 'postgres';
  const postgresPassword = readOption('--postgres-password') || 'change-me';
  const postgresHost = readOption('--postgres-host') || 'db';
  const lines = [
    '# generated from railway variables',
    'NODE_ENV=production',
    'PORT=3001',
    `APP_ORIGIN=${shellEscape(vars['APP_ORIGIN'] || 'https://p1zza.kr')}`,
    'CANONICAL_REDIRECT_HOSTS=www.p1zza.kr',
    `POSTGRES_DB=${shellEscape(postgresDb)}`,
    `POSTGRES_USER=${shellEscape(postgresUser)}`,
    `POSTGRES_PASSWORD=${shellEscape(postgresPassword)}`,
    `DATABASE_URL=${shellEscape(`postgres://${postgresUser}:${postgresPassword}@${postgresHost}:5432/${postgresDb}`)}`,
  ];

  for (const key of RUNTIME_KEYS) {
    const value = vars[key];
    if (!value || key === 'APP_ORIGIN') {
      continue;
    }

    lines.push(`${key}=${shellEscape(value)}`);
  }

  if (hasFlag('--include-legacy')) {
    for (const key of LEGACY_KEYS) {
      const value = vars[key];
      if (value) {
        lines.push(`${key}=${shellEscape(value)}`);
      }
    }
  }

  const content = `${lines.join('\n')}\n`;
  const outputPath = resolveOutputPath();

  if (outputPath) {
    const absolutePath = path.resolve(process.cwd(), outputPath);
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.warn(`wrote ${absolutePath}`);
    return;
  }

  process.stdout.write(content);
}

main();
