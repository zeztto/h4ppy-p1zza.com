import { isIP } from 'node:net';

type Environment = Record<string, string | undefined>;

const PLACEHOLDER =
  /(?:replace[-_ ]?me|rotate[-_ ]?and[-_ ]?replace|generate[-_ ]?a[-_ ]?new|your[-_ ]?(?:secret|key)|change[-_ ]?me)/i;

function required(source: Environment, key: string, fallback?: string) {
  const value = source[key]?.trim();
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${key}`);
}

function csv(source: Environment, key: string, fallback = '') {
  return required(source, key, fallback)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function productionValue(key: string, value: string) {
  if (!value || PLACEHOLDER.test(value)) {
    throw new Error(`Production environment variable is missing or a placeholder: ${key}`);
  }
}

export function parseTrustedProxyCidrs(value: string[]) {
  for (const cidr of value) {
    const [address = '', prefix, ...extra] = cidr.split('/');
    const family = isIP(address);
    if (extra.length || !family || prefix !== (family === 4 ? '32' : '128')) {
      throw new Error('TRUSTED_PROXY_CIDRS must contain exact IPv4 /32 or IPv6 /128 addresses');
    }
  }
  return value;
}

export function readEnvironment(source: Environment) {
  const nodeEnv = required(source, 'NODE_ENV', 'development');
  const production = nodeEnv === 'production';
  const appOrigin = required(
    source,
    'APP_ORIGIN',
    production ? undefined : 'http://localhost:5173'
  );
  let origin: URL;
  try {
    origin = new URL(appOrigin);
  } catch {
    throw new Error('APP_ORIGIN must be an absolute origin URL');
  }
  if (
    origin.username ||
    origin.password ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash ||
    !['https:', 'http:'].includes(origin.protocol) ||
    (production && origin.protocol !== 'https:')
  ) {
    throw new Error('APP_ORIGIN must contain only an origin and must use HTTPS in production');
  }

  const portText = required(source, 'PORT', '3001');
  const port = Number(portText);
  if (!/^\d+$/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const githubClientId = required(source, 'GITHUB_CLIENT_ID');
  const githubClientSecret = required(source, 'GITHUB_CLIENT_SECRET');
  const adminGithubLogins = csv(source, 'ADMIN_GITHUB_LOGINS').map((login) => login.toLowerCase());
  if (adminGithubLogins.some((login) => !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(login))) {
    throw new Error('ADMIN_GITHUB_LOGINS must contain GitHub login names');
  }
  const sessionSecret = required(source, 'SESSION_SECRET');
  const databaseUrl = required(source, 'DATABASE_URL');
  const turnstileSecretKey = source['TURNSTILE_SECRET_KEY']?.trim() ?? '';
  const trustedProxyCidrs = parseTrustedProxyCidrs(csv(source, 'TRUSTED_PROXY_CIDRS'));
  const canonicalRedirectHosts = csv(source, 'CANONICAL_REDIRECT_HOSTS', 'www.p1zza.kr');
  if (canonicalRedirectHosts.some((host) => !/^[a-z\d.-]+(?::\d+)?$/i.test(host))) {
    throw new Error('CANONICAL_REDIRECT_HOSTS must contain host names only');
  }

  let database: URL;
  try {
    database = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
  }
  if (!['postgres:', 'postgresql:'].includes(database.protocol)) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
  }

  if (production) {
    productionValue('GITHUB_CLIENT_ID', githubClientId);
    productionValue('GITHUB_CLIENT_SECRET', githubClientSecret);
    productionValue('SESSION_SECRET', sessionSecret);
    productionValue('TURNSTILE_SECRET_KEY', turnstileSecretKey);
    if (sessionSecret.length < 32)
      throw new Error('SESSION_SECRET must contain at least 32 characters');
    if (!adminGithubLogins.length) throw new Error('ADMIN_GITHUB_LOGINS is required in production');
    if (!trustedProxyCidrs.length) throw new Error('TRUSTED_PROXY_CIDRS is required in production');
    if (decodeURIComponent(database.username) === 'postgres') {
      throw new Error('DATABASE_URL must use a restricted application role in production');
    }
    const password = decodeURIComponent(database.password);
    if (!password || password === 'postgres' || PLACEHOLDER.test(password)) {
      throw new Error(
        'DATABASE_URL must contain a non-placeholder application password in production'
      );
    }
  }

  return {
    appOrigin: origin.origin,
    canonicalRedirectHosts,
    trustedProxyCidrs,
    nodeEnv,
    port,
    githubClientId,
    githubClientSecret,
    adminGithubLogins,
    sessionSecret,
    databaseUrl,
    cloudinaryCloudName: source['CLOUDINARY_CLOUD_NAME'] ?? '',
    cloudinaryApiKey: source['CLOUDINARY_API_KEY'] ?? '',
    cloudinaryApiSecret: source['CLOUDINARY_API_SECRET'] ?? '',
    cloudinaryUrl: source['CLOUDINARY_URL'] ?? '',
    turnstileSecretKey,
  } as const;
}
