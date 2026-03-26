import path from 'node:path';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import express from 'express';
import { ensureDatabaseSchema } from '../db/bootstrap.js';
import { createDatabase } from '../db/client.js';
import { env, isProduction } from './env.js';
import { HttpError } from './lib/errors.js';
import { attachSessionUser, requireAdmin, requireSameOrigin } from './middleware/auth.js';
import { createAdminRouter } from './routes/admin.js';
import { createAuthRouter } from './routes/auth.js';
import { createAdminInquiryRouter, createPublicInquiryRouter } from './routes/inquiries.js';
import { createPublicRouter } from './routes/public.js';
import { createSettingsRouter } from './routes/settings.js';

function normalizeHost(host: string) {
  return host.trim().toLowerCase().replace(/\.$/, '').replace(/:\d+$/, '');
}

function resolveCanonicalRedirectUrl(req: express.Request) {
  if (!isProduction) {
    return null;
  }

  const requestHost = normalizeHost(req.get('x-forwarded-host') || req.get('host') || '');
  const canonicalHost = normalizeHost(new URL(env.appOrigin).host);

  if (!requestHost || requestHost === canonicalHost) {
    return null;
  }

  const redirectHosts = new Set(env.canonicalRedirectHosts.map(normalizeHost));
  if (!redirectHosts.has(requestHost)) {
    return null;
  }

  return new URL(req.originalUrl, env.appOrigin).toString();
}

function resolveDistPath() {
  const candidates = [
    path.resolve(process.cwd(), 'dist'),
    path.resolve(process.cwd(), '..', 'dist'),
    path.resolve(process.cwd(), '..', '..', 'dist'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function resolveIndexPath(distPath?: string) {
  const candidates = [
    distPath ? path.join(distPath, 'index.html') : null,
    path.resolve(process.cwd(), 'index.html'),
    path.resolve(process.cwd(), '..', 'index.html'),
    path.resolve(process.cwd(), '..', '..', 'index.html'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function readStructuredDataHashes(indexPath?: string) {
  if (!indexPath || !fs.existsSync(indexPath)) {
    return [];
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  const matches = html.matchAll(
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  return Array.from(matches, (match) => match[1])
    .filter((scriptContent): scriptContent is string => typeof scriptContent === 'string')
    .map((scriptContent) => {
      const hash = createHash('sha256').update(scriptContent).digest('base64');
      return `'sha256-${hash}'`;
    });
}

export async function createApp() {
  const app = express();
  const { client, db } = createDatabase(env.tursoDatabaseUrl, env.tursoAuthToken);
  const distPath = resolveDistPath();
  const structuredDataHashes = readStructuredDataHashes(resolveIndexPath(distPath));

  await ensureDatabaseSchema(client);

  app.disable('x-powered-by');
  app.use((req, res, next) => {
    const redirectUrl = resolveCanonicalRedirectUrl(req);
    if (redirectUrl) {
      res.redirect(308, redirectUrl);
      return;
    }

    next();
  });
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false }));

  app.use((_req, res, next) => {
    res.locals.db = db;

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (isProduction) {
      const scriptSrc = ["'self'", 'https://challenges.cloudflare.com', ...structuredDataHashes].join(' ');

      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          `script-src ${scriptSrc}`,
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
          "connect-src 'self' https://api.github.com https://api.cloudinary.com https://res.cloudinary.com https://challenges.cloudflare.com",
          "frame-src 'self' https:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'self'",
        ].join('; ')
      );
    }
    next();
  });

  app.use(attachSessionUser);
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.use('/api/auth', createAuthRouter());
  app.use('/api/inquiries', requireSameOrigin, createPublicInquiryRouter());
  app.use('/api/public', createPublicRouter());
  const adminRouter = createAdminRouter();
  adminRouter.use('/settings', createSettingsRouter());
  adminRouter.use('/inquiries', createAdminInquiryRouter());
  app.use('/api/admin', requireSameOrigin, requireAdmin, adminRouter);

  if (distPath) {
    app.use(express.static(distPath, { index: false }));

    app.get(/^(?!\/api).*/, (_req, res, next) => {
      const indexPath = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        next();
        return;
      }

      res.sendFile(indexPath);
    });
  }

  app.use((req, _res, next) => {
    next(new HttpError(404, `Route not found: ${req.path}`));
  });

  app.use(
    (error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
      void next;
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }

      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  );

  return app;
}
