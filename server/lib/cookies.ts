import type { Request, Response } from 'express';

export interface CookieOptions {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
}

export function parseCookies(req: Request) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return new Map<string, string>();
  }

  return new Map(
    cookieHeader
      .split(';')
      .map((segment) => segment.trim())
      .filter(Boolean)
      .map((segment) => {
        const separator = segment.indexOf('=');
        if (separator === -1) {
          return [segment, ''] as const;
        }

        const key = decodeURIComponent(segment.slice(0, separator));
        const value = decodeURIComponent(segment.slice(separator + 1));
        return [key, value] as const;
      })
  );
}

export function getCookie(req: Request, name: string) {
  return parseCookies(req).get(name) ?? null;
}

export function setCookie(res: Response, name: string, value: string, options: CookieOptions = {}) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path ?? '/'}`);

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  }
  if (options.httpOnly) {
    parts.push('HttpOnly');
  }
  if (options.secure) {
    parts.push('Secure');
  }
  if (options.sameSite) {
    parts.push(`SameSite=${capitalize(options.sameSite)}`);
  }

  res.append('Set-Cookie', parts.join('; '));
}

export function clearCookie(res: Response, name: string, options: CookieOptions = {}) {
  setCookie(res, name, '', {
    ...options,
    maxAge: 0,
  });
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
