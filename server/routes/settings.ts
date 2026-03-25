import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { siteSettings } from '../../db/schema.js';
import { mapSetting } from '../lib/content.js';
import { asyncHandler, assert, requireJsonObject } from '../lib/http.js';

function stringField(value: unknown, field: string, fallback = '') {
  if (value == null) {
    return fallback;
  }

  assert(typeof value === 'string', 400, `${field} must be a string`);
  return value.trim();
}

export function createSettingsRouter() {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const rows = await res.locals.db.query.siteSettings.findMany();
      res.status(200).json(rows.map(mapSetting));
    })
  );

  router.get(
    '/:key',
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

  router.put(
    '/:key',
    asyncHandler(async (req, res) => {
      const key = req.params['key'];
      assert(typeof key === 'string' && key.length > 0, 400, 'Setting key is required');

      const payload = requireJsonObject(req.body);
      const value = stringField(payload['value'], 'value');
      const now = new Date();

      await res.locals.db
        .insert(siteSettings)
        .values({ key, value, updatedAt: now })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value, updatedAt: now },
        });

      const updated = await res.locals.db.query.siteSettings.findFirst({
        where: eq(siteSettings.key, key),
      });

      assert(updated, 500, 'Updated setting missing');
      res.status(200).json(mapSetting(updated));
    })
  );

  return router;
}
