/* eslint-disable @typescript-eslint/no-namespace */
import type { NextFunction, Request, Response } from 'express';
import type { Database } from '../../db/client.js';
import type { AdminUserRow } from '../../db/schema.js';
import { env, isProduction } from '../env.js';
import { HttpError } from '../lib/errors.js';
import { readSessionUser } from '../lib/session.js';

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
  if (!res.locals.adminUser) {
    next(new HttpError(401, 'Unauthorized'));
    return;
  }

  next();
}

export function requireSameOrigin(req: Request, _res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    next();
    return;
  }

  const origin = req.headers.origin;
  if (!origin || origin === env.appOrigin) {
    next();
    return;
  }

  if (!isProduction) {
    const host = req.get('host');
    const requestOrigin = host ? `${req.protocol}://${host}` : '';

    if (
      origin === requestOrigin ||
      origin === requestOrigin.replace('127.0.0.1', 'localhost') ||
      origin === requestOrigin.replace('localhost', '127.0.0.1')
    ) {
      next();
      return;
    }
  }

  next(new HttpError(403, 'Cross-origin request rejected'));
}
