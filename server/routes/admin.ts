import { asc, desc, eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import type { Database } from '../../db/client.js';
import { projects, siteProfile, siteSections } from '../../db/schema.js';
import { env } from '../env.js';
import { resolveCloudinaryConfig, signCloudinaryUpload } from '../lib/cloudinary.js';
import { mapProfile, mapProject, mapSection, serializeArray } from '../lib/content.js';
import { asyncHandler, assert, requireJsonObject } from '../lib/http.js';

function stringField(value: unknown, field: string, fallback = '') {
  if (value == null) {
    return fallback;
  }

  assert(typeof value === 'string', 400, `${field} must be a string`);
  return value.trim();
}

function stringArray(value: unknown, field: string) {
  assert(Array.isArray(value), 400, `${field} must be an array`);
  return value.map((entry) => stringField(entry, `${field}[]`)).filter(Boolean);
}

function toOptionalString(value: unknown, field: string) {
  const next = stringField(value, field);
  return next || null;
}

function slugifyProjectId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function resolveProjectId(db: Database, input: unknown, name: string) {
  const base = slugifyProjectId(stringField(input, 'id') || name);
  assert(base, 400, 'Project id is required');

  const existing = await db.query.projects.findFirst({
    where: eq(projects.id, base),
  });

  if (!existing) {
    return base;
  }

  let suffix = 2;
  while (suffix < 10_000) {
    const candidate = `${base}-${suffix}`;
    const duplicate = await db.query.projects.findFirst({
      where: eq(projects.id, candidate),
    });

    if (!duplicate) {
      return candidate;
    }

    suffix += 1;
  }

  throw new Error('Unable to allocate unique project id');
}

export function createAdminRouter() {
  const router = Router();

  router.get(
    '/dashboard',
    asyncHandler(async (_req, res) => {
      const [projectCountRow, publishedCountRow, sectionCountRow, profileRow, latestProject, latestSection] =
        await Promise.all([
          res.locals.db.select({ count: sql<number>`count(*)` }).from(projects),
          res.locals.db
            .select({ count: sql<number>`count(*)` })
            .from(projects)
            .where(eq(projects.isPublished, true)),
          res.locals.db.select({ count: sql<number>`count(*)` }).from(siteSections),
          res.locals.db.query.siteProfile.findFirst({
            where: eq(siteProfile.id, 'primary'),
          }),
          res.locals.db.query.projects.findFirst({
            orderBy: [desc(projects.updatedAt)],
          }),
          res.locals.db.query.siteSections.findFirst({
            orderBy: [desc(siteSections.updatedAt)],
          }),
        ]);

      const projectsTotal = projectCountRow[0]?.count ?? 0;
      const projectsPublished = publishedCountRow[0]?.count ?? 0;
      const lastUpdatedAt = [profileRow?.updatedAt, latestProject?.updatedAt, latestSection?.updatedAt]
        .filter((value): value is Date => Boolean(value))
        .sort((left, right) => right.getTime() - left.getTime())[0];

      res.status(200).json({
        stats: {
          projectsTotal,
          projectsPublished,
          projectsDraft: Math.max(projectsTotal - projectsPublished, 0),
          sectionsTotal: sectionCountRow[0]?.count ?? 0,
          profileConfigured: Boolean(profileRow),
          lastUpdatedAt: lastUpdatedAt?.toISOString() ?? null,
        },
        recentActivity: [],
      });
    })
  );

  router.get(
    '/projects',
    asyncHandler(async (_req, res) => {
      const rows = await res.locals.db.query.projects.findMany({
        orderBy: [asc(projects.sortOrder), asc(projects.name)],
      });

      res.status(200).json(rows.map(mapProject));
    })
  );

  router.post(
    '/projects',
    asyncHandler(async (req, res) => {
      const payload = requireJsonObject(req.body);
      const name = stringField(payload['name'], 'name');
      const description = stringField(payload['description'], 'description');
      const url = stringField(payload['url'], 'url');
      const category = stringField(payload['category'], 'category');

      assert(name, 400, 'Project name is required');
      assert(description, 400, 'Project description is required');
      assert(url, 400, 'Project url is required');
      assert(category, 400, 'Project category is required');

      const now = new Date();
      const row = {
        id: await resolveProjectId(res.locals.db, payload['id'], name),
        name,
        description,
        url,
        category,
        year: toOptionalString(payload['year'], 'year'),
        thumbnailUrl: toOptionalString(
          payload['thumbnailUrl'] ?? payload['thumbnail'],
          'thumbnailUrl'
        ),
        longDescription: toOptionalString(payload['longDescription'], 'longDescription'),
        tagsJson: serializeArray(stringArray(payload['tags'] ?? [], 'tags')),
        featuresJson: serializeArray(
          Array.isArray(payload['features']) ? stringArray(payload['features'], 'features') : []
        ),
        techStackJson: serializeArray(
          Array.isArray(payload['techStack']) ? stringArray(payload['techStack'], 'techStack') : []
        ),
        sortOrder:
          typeof payload['sortOrder'] === 'number' ? Math.floor(payload['sortOrder']) : 999_999,
        isFeatured: payload['isFeatured'] === true,
        isPublished: payload['isPublished'] !== false,
        createdAt: now,
        updatedAt: now,
      };

      await res.locals.db.insert(projects).values(row);
      res.status(201).json(mapProject(row));
    })
  );

  router.patch(
    '/projects/:id',
    asyncHandler(async (req, res) => {
      const projectId = req.params['id'];
      assert(typeof projectId === 'string' && projectId.length > 0, 400, 'Project id is required');

      const existing = await res.locals.db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });
      assert(existing, 404, 'Project not found');

      const payload = requireJsonObject(req.body);
      const nextRow = {
        name:
          payload['name'] !== undefined ? stringField(payload['name'], 'name') : existing.name,
        description:
          payload['description'] !== undefined
            ? stringField(payload['description'], 'description')
            : existing.description,
        url: payload['url'] !== undefined ? stringField(payload['url'], 'url') : existing.url,
        category:
          payload['category'] !== undefined
            ? stringField(payload['category'], 'category')
            : existing.category,
        year:
          payload['year'] !== undefined
            ? toOptionalString(payload['year'], 'year')
            : existing.year,
        thumbnailUrl:
          payload['thumbnailUrl'] !== undefined || payload['thumbnail'] !== undefined
            ? toOptionalString(payload['thumbnailUrl'] ?? payload['thumbnail'], 'thumbnailUrl')
            : existing.thumbnailUrl,
        longDescription:
          payload['longDescription'] !== undefined
            ? toOptionalString(payload['longDescription'], 'longDescription')
            : existing.longDescription,
        tagsJson:
          payload['tags'] !== undefined
            ? serializeArray(stringArray(payload['tags'], 'tags'))
            : existing.tagsJson,
        featuresJson:
          payload['features'] !== undefined
            ? serializeArray(stringArray(payload['features'], 'features'))
            : existing.featuresJson,
        techStackJson:
          payload['techStack'] !== undefined
            ? serializeArray(stringArray(payload['techStack'], 'techStack'))
            : existing.techStackJson,
        sortOrder:
          typeof payload['sortOrder'] === 'number'
            ? Math.floor(payload['sortOrder'])
            : existing.sortOrder,
        isFeatured:
          typeof payload['isFeatured'] === 'boolean'
            ? payload['isFeatured']
            : existing.isFeatured,
        isPublished:
          typeof payload['isPublished'] === 'boolean'
            ? payload['isPublished']
            : existing.isPublished,
        updatedAt: new Date(),
      };

      await res.locals.db.update(projects).set(nextRow).where(eq(projects.id, projectId));
      const updated = await res.locals.db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      assert(updated, 500, 'Updated project missing');
      res.status(200).json(mapProject(updated));
    })
  );

  router.delete(
    '/projects/:id',
    asyncHandler(async (req, res) => {
      const projectId = req.params['id'];
      assert(typeof projectId === 'string' && projectId.length > 0, 400, 'Project id is required');
      await res.locals.db.delete(projects).where(eq(projects.id, projectId));
      res.status(204).send();
    })
  );

  router.put(
    '/projects/reorder',
    asyncHandler(async (req, res) => {
      const payload = requireJsonObject(req.body);
      const orderedIds = stringArray(payload['projectIds'] ?? payload['ids'], 'projectIds');

      await Promise.all(
        orderedIds.map((id, index) =>
          res.locals.db
            .update(projects)
            .set({ sortOrder: index + 1, updatedAt: new Date() })
            .where(eq(projects.id, id))
        )
      );

      const rows = await res.locals.db.query.projects.findMany({
        orderBy: [asc(projects.sortOrder), asc(projects.name)],
      });

      res.status(200).json(rows.map(mapProject));
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

  router.put(
    '/profile',
    asyncHandler(async (req, res) => {
      const payload = requireJsonObject(req.body);
      const existing = await res.locals.db.query.siteProfile.findFirst({
        where: eq(siteProfile.id, 'primary'),
      });
      const now = new Date();

      const row = {
        id: 'primary',
        displayName: stringField(payload['displayName'], 'displayName', existing?.displayName ?? ''),
        headline: stringField(payload['headline'], 'headline', existing?.headline ?? ''),
        bioShort: stringField(payload['bioShort'], 'bioShort', existing?.bioShort ?? ''),
        avatarUrl:
          payload['avatarUrl'] !== undefined
            ? toOptionalString(payload['avatarUrl'], 'avatarUrl')
            : existing?.avatarUrl ?? null,
        githubUrl:
          payload['githubUrl'] !== undefined
            ? toOptionalString(payload['githubUrl'], 'githubUrl')
            : existing?.githubUrl ?? null,
        instagramUrl:
          payload['instagramUrl'] !== undefined
            ? toOptionalString(payload['instagramUrl'], 'instagramUrl')
            : existing?.instagramUrl ?? null,
        email:
          payload['email'] !== undefined
            ? toOptionalString(payload['email'], 'email')
            : existing?.email ?? null,
        essayMarkdown: stringField(
          payload['essayMarkdown'],
          'essayMarkdown',
          existing?.essayMarkdown ?? ''
        ),
        updatedAt: now,
      };

      assert(row.displayName, 400, 'displayName is required');
      assert(row.headline, 400, 'headline is required');
      assert(row.bioShort, 400, 'bioShort is required');

      await res.locals.db
        .insert(siteProfile)
        .values(row)
        .onConflictDoUpdate({
          target: siteProfile.id,
          set: {
            displayName: row.displayName,
            headline: row.headline,
            bioShort: row.bioShort,
            avatarUrl: row.avatarUrl,
            githubUrl: row.githubUrl,
            instagramUrl: row.instagramUrl,
            email: row.email,
            essayMarkdown: row.essayMarkdown,
            updatedAt: now,
          },
        });

      const updated = await res.locals.db.query.siteProfile.findFirst({
        where: eq(siteProfile.id, 'primary'),
      });
      assert(updated, 500, 'Updated profile missing');
      res.status(200).json(mapProfile(updated));
    })
  );

  router.get(
    '/sections',
    asyncHandler(async (_req, res) => {
      const rows = await res.locals.db.query.siteSections.findMany({
        orderBy: [asc(siteSections.sortOrder)],
      });

      res.status(200).json(rows.map(mapSection));
    })
  );

  router.put(
    '/sections',
    asyncHandler(async (req, res) => {
      const payload = requireJsonObject(req.body);
      assert(Array.isArray(payload['sections']), 400, 'sections must be an array');
      const sectionsPayload = payload['sections'] as unknown[];
      const incomingIds = new Set<string>();
      const now = new Date();

      await Promise.all(
        sectionsPayload.map(async (section, index) => {
          const record = requireJsonObject(section, 'Each section must be an object');
          const id = stringField(record['id'] ?? record['key'], 'id');
          incomingIds.add(id);

          await res.locals.db
            .insert(siteSections)
            .values({
              id,
              key: stringField(record['key'], 'key') || null,
              name: stringField(record['name'], 'name'),
              description: stringField(record['description'], 'description'),
              enabled: record['enabled'] !== false,
              sortOrder: typeof record['sortOrder'] === 'number' ? record['sortOrder'] : index + 1,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: siteSections.id,
              set: {
                name: stringField(record['name'], 'name'),
                description: stringField(record['description'], 'description'),
                enabled: record['enabled'] !== false,
                sortOrder:
                  typeof record['sortOrder'] === 'number' ? record['sortOrder'] : index + 1,
                updatedAt: now,
              },
            });
        })
      );

      const existingRows = await res.locals.db.query.siteSections.findMany();
      await Promise.all(
        existingRows
          .filter((row) => !incomingIds.has(row.id))
          .map((row) => res.locals.db.delete(siteSections).where(eq(siteSections.id, row.id)))
      );

      const rows = await res.locals.db.query.siteSections.findMany({
        orderBy: [asc(siteSections.sortOrder)],
      });

      res.status(200).json(rows.map(mapSection));
    })
  );

  router.post(
    '/uploads/sign',
    asyncHandler(async (req, res) => {
      const payload = requireJsonObject(req.body);
      const config = resolveCloudinaryConfig(env);
      assert(config, 500, 'Cloudinary credentials missing');

      const timestamp = Math.floor(Date.now() / 1000);
      const folder = stringField(payload['folder'], 'folder', 'h4ppy-p1zza');
      const publicId = stringField(payload['publicId'], 'publicId');

      const signed = signCloudinaryUpload(config, {
        folder,
        public_id: publicId,
        timestamp,
      });

      res.status(200).json({
        ...signed,
        folder,
        publicId,
      });
    })
  );

  return router;
}
