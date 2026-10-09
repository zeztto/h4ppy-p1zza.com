/* eslint-disable @typescript-eslint/no-namespace */
import type { NextFunction, Request, Response } from 'express';
import type { Database } from '../../db/client.js';
import type { AdminUserRow } from '../../db/schema.js';
import { env, isProduction } from '../env.js';
import { HttpError } from '../lib/errors.js';
import { isAllowedAdmin, readSessionUser } from '../lib/session.js';

declare global {
  namespace Express {
    interface Locals {
      db: Database;
      adminUser: AdminUserRow | null;
    }
  }
}

export async function attachSessionUser(req: Request, res: Response, next: NextFunction) {
  try {
    res.locals.adminUser = await readSessionUser(res.locals.db, req);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(_req: Request, res: Response, next: NextFunction) {
  if (!isAllowedAdmin(res.locals.adminUser)) {
    next(new HttpError(401, 'Unauthorized'));
    return;
  }

  next();
}

export function createSameOriginGuard(appOrigin = env.appOrigin, production = isProduction) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      next();
      return;
    }

    const origin = req.headers.origin;
    if (!origin) {
      if (production) {
        const referer = req.get('referer');
        try {
          if (referer && new URL(referer).origin === new URL(appOrigin).origin) {
            next();
            return;
          }
        } catch {
          /* Invalid Referer cannot establish same origin. */
        }
        next(new HttpError(403, 'Cross-origin request rejected'));
        return;
      }
      next();
      return;
    }

    const allowedOrigins = new Set<string>([new URL(appOrigin).origin]);
    const host = req.get('host');

    if (!production && host) {
      const normalizedHosts = new Set([
        host,
        host.replace('127.0.0.1', 'localhost'),
        host.replace('localhost', '127.0.0.1'),
      ]);

      const protocols = new Set([req.protocol, 'https', !production ? 'http' : '']);

      for (const normalizedHost of normalizedHosts) {
        for (const protocol of protocols) {
          if (!protocol) {
            continue;
          }

          allowedOrigins.add(`${protocol}://${normalizedHost}`);
        }
      }
    }

    if (allowedOrigins.has(origin)) {
      next();
      return;
    }

    next(new HttpError(403, 'Cross-origin request rejected'));
  };
}

export const requireSameOrigin = createSameOriginGuard();
