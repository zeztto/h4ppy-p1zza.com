import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './errors.js';

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

export function assert(condition: unknown, statusCode: number, message: string): asserts condition {
  if (!condition) {
    throw new HttpError(statusCode, message);
  }
}

export function requireJsonObject(value: unknown, message = 'Invalid JSON body') {
  assert(value && typeof value === 'object' && !Array.isArray(value), 400, message);
  return value as Record<string, unknown>;
}
