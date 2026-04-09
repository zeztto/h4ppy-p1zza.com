import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local', override: false });
loadEnv();

const DEFAULT_APP_ORIGIN = 'http://localhost:5173';
const DEFAULT_CANONICAL_REDIRECT_HOSTS = 'www.p1zza.kr';

function readEnv(key: string, fallback?: string) {
  const value = process.env[key];

  if (value) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${key}`);
}

function readCsvEnv(key: string, fallback = '') {
  return readEnv(key, fallback)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export const env = {
  appOrigin: readEnv('APP_ORIGIN', DEFAULT_APP_ORIGIN),
  canonicalRedirectHosts: readCsvEnv('CANONICAL_REDIRECT_HOSTS', DEFAULT_CANONICAL_REDIRECT_HOSTS),
  nodeEnv: readEnv('NODE_ENV', 'development'),
  port: Number.parseInt(readEnv('PORT', '3001'), 10),
  githubClientId: readEnv('GITHUB_CLIENT_ID'),
  githubClientSecret: readEnv('GITHUB_CLIENT_SECRET'),
  adminGithubLogins: readCsvEnv('ADMIN_GITHUB_LOGINS'),
  sessionSecret: readEnv('SESSION_SECRET'),
  databaseUrl: readEnv('DATABASE_URL'),
  cloudinaryCloudName: process.env['CLOUDINARY_CLOUD_NAME'] ?? '',
  cloudinaryApiKey: process.env['CLOUDINARY_API_KEY'] ?? '',
  cloudinaryApiSecret: process.env['CLOUDINARY_API_SECRET'] ?? '',
  cloudinaryUrl: process.env['CLOUDINARY_URL'] ?? '',
  turnstileSecretKey: process.env['TURNSTILE_SECRET_KEY'] ?? '',
} as const;

export const isProduction = env.nodeEnv === 'production';
