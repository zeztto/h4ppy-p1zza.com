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
  if (!cookieHeader || cookieHeader.length > 8192) {
    return new Map<string, string>();
  }
  const cookies = new Map<string, string>();
  const duplicates = new Set<string>();
  for (const segment of cookieHeader.split(';').slice(0, 100)) {
    const separator = segment.indexOf('=');
    if (separator < 1) continue;
    try {
      const key = decodeURIComponent(segment.slice(0, separator).trim());
      const value = decodeURIComponent(segment.slice(separator + 1).trim());
      if (!/^[!#$%&'*+\-.^_`|~0-9a-z]+$/i.test(key) || value.length > 4096) continue;
      if (cookies.has(key) || duplicates.has(key)) {
        cookies.delete(key);
        duplicates.add(key);
        continue;
      }
      cookies.set(key, value);
    } catch {
      // Malformed percent encoding is an invalid cookie, never an application error.
    }
  }
  return cookies;
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
