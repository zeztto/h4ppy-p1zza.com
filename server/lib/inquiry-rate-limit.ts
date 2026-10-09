import type { RequestHandler } from 'express';
import { INQUIRY_RATE_LIMIT_MESSAGE } from '../../src/shared/inquiry-contract.js';
import { HttpError } from './errors.js';

interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
  maxKeys?: number;
  now?: () => number;
}

/** One bounded process-local store; IP trust is configured by Express, never by request headers here. */
export function createInquiryRateLimit(options: RateLimitOptions = {}): RequestHandler {
  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 10 * 60 * 1000;
  const maxKeys = options.maxKeys ?? 10_000;
  const now = options.now ?? Date.now;
  const entries = new Map<string, { attempts: number; expiresAt: number }>();
  let lastPrunedAt = 0;
  return (req, res, next) => {
    const timestamp = now();
    if (timestamp - lastPrunedAt >= 30_000 || entries.size >= maxKeys) {
      for (const [key, entry] of entries) if (entry.expiresAt <= timestamp) entries.delete(key);
      lastPrunedAt = timestamp;
    }
    const key = req.ip ?? 'unknown';
    const existing = entries.get(key);
    const entry =
      existing && existing.expiresAt > timestamp
        ? existing
        : { attempts: 0, expiresAt: timestamp + windowMs };
    if ((!existing && entries.size >= maxKeys) || entry.attempts >= limit) {
      res.setHeader(
        'Retry-After',
        String(Math.max(1, Math.ceil((entry.expiresAt - timestamp) / 1000)))
      );
      next(new HttpError(429, INQUIRY_RATE_LIMIT_MESSAGE));
      return;
    }
    entry.attempts += 1;
    entries.set(key, entry);
    next();
  };
}
