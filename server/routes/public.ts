import { asc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { projects, siteProfile, siteSections, siteSettings } from '../../db/schema.js';
import { mapProfile, mapProject, mapSection, mapSetting } from '../lib/content.js';
import { asyncHandler, assert } from '../lib/http.js';

export function createPublicRouter() {
  const router = Router();

  router.get(
    '/projects',
    asyncHandler(async (_req, res) => {
      const rows = await res.locals.db.query.projects.findMany({
        where: eq(projects.isPublished, true),
        orderBy: [asc(projects.sortOrder), asc(projects.name)],
      });

      res.status(200).json(rows.map(mapProject));
    })
  );

  router.get(
    '/projects/:id',
    asyncHandler(async (req, res) => {
      const projectId = req.params['id'];
      assert(typeof projectId === 'string' && projectId.length > 0, 400, 'Project id is required');

      const row = await res.locals.db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      assert(row && row.isPublished, 404, 'Project not found');
      res.status(200).json(mapProject(row));
    })
  );

  router.get(
    '/profile',
    asyncHandler(async (_req, res) => {
      const row = await res.locals.db.query.siteProfile.findFirst({
        where: eq(siteProfile.id, 'primary'),
      });

      assert(row, 404, 'Profile not found');
      res.status(200).json(mapProfile(row));
    })
  );

  router.get(
    '/sections',
    asyncHandler(async (_req, res) => {
      const rows = await res.locals.db.query.siteSections.findMany({
        where: eq(siteSections.enabled, true),
        orderBy: [asc(siteSections.sortOrder)],
      });

      res.status(200).json(rows.map(mapSection));
    })
  );

  router.get(
    '/settings/:key',
    asyncHandler(async (req, res) => {
      const key = req.params['key'];
      assert(typeof key === 'string' && key.length > 0, 400, 'Setting key is required');

      const row = await res.locals.db.query.siteSettings.findFirst({
        where: eq(siteSettings.key, key),
      });

      assert(row, 404, 'Setting not found');
      res.status(200).json(mapSetting(row));
    })
  );

  return router;
}
