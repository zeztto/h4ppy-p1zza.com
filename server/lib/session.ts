import { and, eq, gt } from 'drizzle-orm';
import { adminUsers, sessions, type AdminUserRow } from '../../db/schema.js';
import type { Database } from '../../db/client.js';
import { env, isProduction } from '../env.js';
import { clearCookie, getCookie, setCookie } from './cookies.js';
import { randomToken, sha256, signValue, secureEquals } from './crypto.js';
import { assert } from './http.js';
import type { Request, Response } from 'express';

const SESSION_COOKIE = 'sid';
const OAUTH_STATE_COOKIE = 'oauth_state';
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const OAUTH_STATE_MAX_AGE_MS = 1000 * 60 * 10;

export function createOAuthState(res: Response) {
  const value = randomToken(24);
  const signedValue = `${value}.${signValue(value, env.sessionSecret)}`;

  setCookie(res, OAUTH_STATE_COOKIE, signedValue, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: OAUTH_STATE_MAX_AGE_MS,
  });

  return value;
}

export function verifyOAuthState(req: Request, state: string) {
  const stored = getCookie(req, OAUTH_STATE_COOKIE);
  assert(stored, 400, 'OAuth state missing');

  const [value, signature] = stored.split('.');
  assert(value && signature, 400, 'OAuth state invalid');
  assert(value === state, 400, 'OAuth state mismatch');
  assert(secureEquals(signature, signValue(value, env.sessionSecret)), 400, 'OAuth state invalid');
}

export function clearOAuthState(res: Response) {
  clearCookie(res, OAUTH_STATE_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });
}

export async function upsertAdminUser(
  db: Database,
  user: {
    githubId: string;
    githubLogin: string;
    avatarUrl: string;
    displayName?: string | null;
  }
) {
  const now = new Date();
  const existing = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.githubId, user.githubId),
  });

  if (existing) {
    await db
      .update(adminUsers)
      .set({
        githubLogin: user.githubLogin,
        avatarUrl: user.avatarUrl,
        displayName: user.displayName ?? existing.displayName,
        updatedAt: now,
      })
      .where(eq(adminUsers.id, existing.id));

    return { ...existing, ...user, updatedAt: now } satisfies AdminUserRow;
  }

  const row: AdminUserRow = {
    id: user.githubId,
    githubId: user.githubId,
    githubLogin: user.githubLogin,
    role: 'admin',
    avatarUrl: user.avatarUrl,
    displayName: user.displayName ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(adminUsers).values(row);
  return row;
}

export async function createSession(db: Database, res: Response, userId: string) {
  const rawSessionId = randomToken(32);
  const now = new Date();
  const sessionRow = {
    id: randomToken(16),
    sessionHash: sha256(rawSessionId),
    userId,
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(now.getTime() + SESSION_MAX_AGE_MS),
  };

  await db.insert(sessions).values(sessionRow);

  setCookie(res, SESSION_COOKIE, rawSessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export async function invalidateSession(db: Database, req: Request, res: Response) {
  const rawSessionId = getCookie(req, SESSION_COOKIE);

  if (rawSessionId) {
    await db.delete(sessions).where(eq(sessions.sessionHash, sha256(rawSessionId)));
  }

  clearCookie(res, SESSION_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });
}

export async function readSessionUser(db: Database, req: Request) {
  const rawSessionId = getCookie(req, SESSION_COOKIE);
  if (!rawSessionId) {
    return null;
  }

  const sessionHash = sha256(rawSessionId);
  const now = new Date();

  const row = await db.query.sessions.findFirst({
    where: and(eq(sessions.sessionHash, sessionHash), gt(sessions.expiresAt, now)),
    with: {
      user: true,
    },
  });

  if (!row) {
    return null;
  }

  await db
    .update(sessions)
    .set({
      updatedAt: now,
      expiresAt: new Date(now.getTime() + SESSION_MAX_AGE_MS),
    })
    .where(eq(sessions.id, row.id));

  return row.user;
}
