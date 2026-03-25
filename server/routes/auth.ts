import { Router } from 'express';
import { env } from '../env.js';
import { buildGitHubAuthorizeUrl, exchangeGitHubCode, fetchGitHubUser } from '../lib/github.js';
import { asyncHandler, assert } from '../lib/http.js';
import {
  clearOAuthState,
  createOAuthState,
  createSession,
  invalidateSession,
  upsertAdminUser,
  verifyOAuthState,
} from '../lib/session.js';

export function createAuthRouter() {
  const router = Router();

  router.get(
    '/github/start',
    asyncHandler(async (_req, res) => {
      const state = createOAuthState(res);
      const redirectUri = `${env.appOrigin}/api/auth/github/callback`;
      res.redirect(
        302,
        buildGitHubAuthorizeUrl({
          clientId: env.githubClientId,
          redirectUri,
          state,
        })
      );
    })
  );

  router.get(
    '/github/callback',
    asyncHandler(async (req, res) => {
      const code = typeof req.query['code'] === 'string' ? req.query['code'] : null;
      const state = typeof req.query['state'] === 'string' ? req.query['state'] : null;

      assert(code, 400, 'GitHub code missing');
      assert(state, 400, 'GitHub state missing');

      verifyOAuthState(req, state);
      clearOAuthState(res);

      const redirectUri = `${env.appOrigin}/api/auth/github/callback`;
      const accessToken = await exchangeGitHubCode({
        clientId: env.githubClientId,
        clientSecret: env.githubClientSecret,
        code,
        redirectUri,
      });

      const githubUser = await fetchGitHubUser(accessToken);
      if (!env.adminGithubLogins.includes(githubUser.login)) {
        res.redirect(302, '/admin/login?error=unauthorized');
        return;
      }

      const adminUser = await upsertAdminUser(res.locals.db, {
        githubId: String(githubUser.id),
        githubLogin: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        displayName: githubUser.name ?? null,
      });

      await createSession(res.locals.db, res, adminUser.id);
      res.redirect(302, '/admin');
    })
  );

  router.get(
    '/session',
    asyncHandler(async (_req, res) => {
      const user = res.locals.adminUser;

      if (!user) {
        res.status(200).json({ authenticated: false, user: null });
        return;
      }

      res.status(200).json({
        authenticated: true,
        user: {
          id: user.id,
          githubLogin: user.githubLogin,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      });
    })
  );

  router.post(
    '/logout',
    asyncHandler(async (req, res) => {
      await invalidateSession(res.locals.db, req, res);
      res.status(204).send();
    })
  );

  return router;
}
