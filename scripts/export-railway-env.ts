import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

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

const VALUE_FLAGS = ['--output', '--postgres-db', '--postgres-user', '--postgres-host'] as const;
const HELP = `Usage: env:railway:export -- --output <new-file> [--include-legacy]
       env:railway:export -- --stdout [--include-legacy]
POSTGRES_PASSWORD must be supplied through the environment, never a CLI argument.
The output directory must already exist, be owned by this user, and have mode 0700.
Files are created exclusively with mode 0600; existing files and symlinks are refused.
--stdout explicitly exposes secrets to the receiving stream. Avoid CI logs.
Output uses Docker Compose env-file syntax; do not source it as a shell script.
Optional: --postgres-db, --postgres-user, --postgres-host.
`;

// Only fixed operator messages reach stderr. Provider, filesystem, and JSON
// messages and stacks can contain credentials and must never be forwarded.
class ExportFailure extends Error {}

interface ExportOptions {
  output: string | undefined;
  includeLegacy: boolean;
  database: string;
  user: string;
  host: string;
}

interface ExportDependencies {
  env: NodeJS.ProcessEnv;
  cwd: string;
  uid: number | undefined;
  readVariables: () => unknown;
  writeStdout: (value: string) => void;
  writeStderr: (value: string) => void;
}

interface ReservedOutput {
  filename: string;
  fd: number;
  identity: fs.Stats;
  ancestors: Map<string, fs.Stats>;
}

function parseArguments(args: readonly string[]): ExportOptions {
  const values = new Map<string, string>();
  const flags = new Set<string>();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;
    if (arg === '--postgres-password') {
      throw new ExportFailure(
        'Use POSTGRES_PASSWORD in the environment; password arguments are refused.'
      );
    }
    if (VALUE_FLAGS.some((flag) => flag === arg)) {
      const value = args[++index];
      if (values.has(arg) || !value || value.startsWith('--') || /[\r\n\0]/.test(value)) {
        throw new ExportFailure('A value option is missing, repeated, or invalid.');
      }
      values.set(arg, value);
    } else if (arg === '--stdout' || arg === '--include-legacy') {
      if (flags.has(arg)) throw new ExportFailure('An option is repeated.');
      flags.add(arg);
    } else {
      throw new ExportFailure('Unknown option. Use --help for the export contract.');
    }
  }
  const output = values.get('--output');
  if (Boolean(output) === flags.has('--stdout')) {
    throw new ExportFailure('Choose exactly one destination: --output <new-file> or --stdout.');
  }
  const host = values.get('--postgres-host') ?? 'db';
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) throw new ExportFailure('The Postgres host is invalid.');
  return {
    output,
    includeLegacy: flags.has('--include-legacy'),
    database: values.get('--postgres-db') ?? 'p1zza',
    user: values.get('--postgres-user') ?? 'postgres',
    host,
  };
}

function inspectAncestors(parent: string, uid: number): Map<string, fs.Stats> {
  const ancestors = new Map<string, fs.Stats>();
  let current = parent;
  while (true) {
    const stat = fs.lstatSync(current);
    if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.uid !== uid && stat.uid !== 0)) {
      throw new ExportFailure('Output directories must be trusted directories without symlinks.');
    }
    // Root-owned sticky temp directories protect children owned by this user.
    if ((stat.mode & 0o022) !== 0 && !(stat.uid === 0 && (stat.mode & 0o1000) !== 0)) {
      throw new ExportFailure('Output directory ancestors must not be writable by other users.');
    }
    ancestors.set(current, stat);
    const next = path.dirname(current);
    if (next === current) break;
    current = next;
  }
  const directParent = ancestors.get(parent)!;
  if (directParent.uid !== uid || (directParent.mode & 0o777) !== 0o700) {
    throw new ExportFailure('The output parent must be owned by this user with mode 0700.');
  }
  return ancestors;
}

function sameIdentity(left: fs.Stats, right: fs.Stats) {
  return left.dev === right.dev && left.ino === right.ino;
}

function checkReservation(output: ReservedOutput, uid: number) {
  const ancestors = inspectAncestors(path.dirname(output.filename), uid);
  for (const [name, before] of output.ancestors) {
    if (!sameIdentity(before, ancestors.get(name)!)) {
      throw new ExportFailure('The output directory changed during export.');
    }
  }
  const stat = fs.lstatSync(output.filename);
  if (
    !stat.isFile() ||
    !sameIdentity(stat, output.identity) ||
    stat.uid !== uid ||
    (stat.mode & 0o777) !== 0o600 ||
    stat.nlink !== 1
  ) {
    throw new ExportFailure('The reserved output file changed during export.');
  }
}

function cleanupOutput(output: ReservedOutput) {
  try {
    const stat = fs.lstatSync(output.filename);
    if (stat.isFile() && sameIdentity(stat, output.identity)) fs.unlinkSync(output.filename);
  } catch {
    // Never remove a replacement path or print a filesystem error containing it.
  }
}

function reserveOutput(filename: string, cwd: string, uid: number | undefined): ReservedOutput {
  if (uid === undefined)
    throw new ExportFailure('POSIX ownership checks are required for file export.');
  const absolutePath = path.resolve(cwd, filename);
  const ancestors = inspectAncestors(path.dirname(absolutePath), uid);
  // wx rejects existing regular files, directories, and dangling symlinks atomically.
  const fd = fs.openSync(absolutePath, 'wx', 0o600);
  const output: ReservedOutput = {
    filename: absolutePath,
    fd,
    identity: fs.fstatSync(fd),
    ancestors,
  };
  try {
    fs.fchmodSync(fd, 0o600);
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.uid !== uid || stat.nlink !== 1 || (stat.mode & 0o777) !== 0o600) {
      throw new ExportFailure('The output file could not be secured.');
    }
    checkReservation(output, uid);
    return output;
  } catch (error) {
    fs.closeSync(fd);
    cleanupOutput(output);
    throw error;
  }
}

function readRailwayVariables(): unknown {
  const providerEnv = { ...process.env };
  delete providerEnv['POSTGRES_PASSWORD'];
  const output = execFileSync('railway', ['variables', '--json'], {
    encoding: 'utf8',
    env: providerEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(output) as unknown;
}

// Compose double quotes preserve escapes; $$ prevents variable interpolation.
// This is a Docker Compose env file, not executable shell source.
function envLiteral(value: string) {
  if (/[\r\n\0]/.test(value))
    throw new ExportFailure('Multiline or null-containing values cannot be exported.');
  return JSON.stringify(value.replace(/\$/g, () => '$$'));
}

function buildContent(rawVariables: unknown, options: ExportOptions, password: string) {
  if (!rawVariables || typeof rawVariables !== 'object' || Array.isArray(rawVariables)) {
    throw new ExportFailure('Railway returned an invalid variable response.');
  }
  const variables = rawVariables as Record<string, unknown>;
  const pairs: Array<[string, string]> = [
    ['NODE_ENV', 'production'],
    ['PORT', '3001'],
    [
      'APP_ORIGIN',
      typeof variables['APP_ORIGIN'] === 'string' ? variables['APP_ORIGIN'] : 'https://p1zza.kr',
    ],
    ['CANONICAL_REDIRECT_HOSTS', 'www.p1zza.kr'],
    ['POSTGRES_DB', options.database],
    ['POSTGRES_USER', options.user],
    ['POSTGRES_PASSWORD', password],
    [
      'DATABASE_URL',
      `postgres://${encodeURIComponent(options.user)}:${encodeURIComponent(password)}@${options.host}:5432/${encodeURIComponent(options.database)}`,
    ],
  ];
  for (const key of [...RUNTIME_KEYS, ...(options.includeLegacy ? LEGACY_KEYS : [])]) {
    const value = variables[key];
    if (value === undefined || value === '' || key === 'APP_ORIGIN') continue;
    if (typeof value !== 'string')
      throw new ExportFailure('Railway returned an invalid variable value.');
    pairs.push([key, value]);
  }
  return `# generated Railway variables; Docker Compose env-file syntax\n${pairs.map(([key, value]) => `${key}=${envLiteral(value)}`).join('\n')}\n`;
}

export function runRailwayExport(
  args: readonly string[],
  overrides: Partial<ExportDependencies> = {}
): number {
  const dependencies: ExportDependencies = {
    env: process.env,
    cwd: process.cwd(),
    uid: process.getuid?.(),
    readVariables: readRailwayVariables,
    writeStdout: (value) => process.stdout.write(value),
    writeStderr: (value) => process.stderr.write(value),
    ...overrides,
  };
  let reserved: ReservedOutput | undefined;
  try {
    if (args.length === 1 && args[0] === '--help') {
      dependencies.writeStdout(HELP);
      return 0;
    }
    const options = parseArguments(args);
    const password = dependencies.env['POSTGRES_PASSWORD'];
    if (!password || /[\r\n\0]/.test(password)) {
      throw new ExportFailure(
        'A nonempty, single-line POSTGRES_PASSWORD environment variable is required.'
      );
    }
    if (options.output)
      reserved = reserveOutput(options.output, dependencies.cwd, dependencies.uid);
    const content = buildContent(dependencies.readVariables(), options, password);
    if (reserved) {
      checkReservation(reserved, dependencies.uid!);
      fs.writeFileSync(reserved.fd, content, 'utf8');
      fs.fsyncSync(reserved.fd);
      dependencies.writeStderr('Created a private environment file.\n');
    } else {
      dependencies.writeStderr(
        'Explicit --stdout export: the receiving stream contains secrets.\n'
      );
      dependencies.writeStdout(content);
    }
    return 0;
  } catch (error) {
    if (reserved) cleanupOutput(reserved);
    dependencies.writeStderr(
      `${error instanceof ExportFailure ? error.message : 'Environment export failed; provider and filesystem details were suppressed.'}\n`
    );
    return 1;
  } finally {
    if (reserved) fs.closeSync(reserved.fd);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = runRailwayExport(process.argv.slice(2));
}
