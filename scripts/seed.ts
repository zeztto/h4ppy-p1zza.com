import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { eq, notInArray, sql } from 'drizzle-orm';
import { ensureDatabaseSchema } from '../db/bootstrap.js';
import { createDatabase } from '../db/client.js';
import { projects, siteProfile, siteSections } from '../db/schema.js';
import { serializeArray } from '../server/lib/content.js';
import { loadSeedProfile, loadSeedProjects, loadSeedSections } from './seed-loaders.js';

loadEnv({ path: '.env.local', override: false });
loadEnv();

async function run() {
  const databaseUrl = process.env['TURSO_DATABASE_URL'];
  const authToken = process.env['TURSO_AUTH_TOKEN'];

  if (!databaseUrl || !authToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required');
  }

  const { client, db } = createDatabase(databaseUrl, authToken);
  const now = new Date();
  await ensureDatabaseSchema(client);
  const [seedProjects, seedProfile, seedSections] = await Promise.all([
    loadSeedProjects(),
    loadSeedProfile(),
    loadSeedSections(),
  ]);

  if (seedProjects.length > 0) {
    await db.delete(projects).where(notInArray(projects.id, seedProjects.map((project) => project.id)));
  }

  if (seedSections.length > 0) {
    await db
      .delete(siteSections)
      .where(notInArray(siteSections.key, seedSections.map((section) => section.key)));
  }

  await Promise.all(
    seedProjects.map((project, index) =>
      db
        .insert(projects)
        .values({
          id: project.id,
          name: project.name,
          description: project.description,
          url: project.url,
          category: project.category,
          year: project.year ?? null,
          thumbnailUrl: project.thumbnail ?? null,
          longDescription: project.longDescription ?? null,
          tagsJson: serializeArray(project.tags),
          featuresJson: serializeArray(project.features),
          techStackJson: serializeArray(project.techStack),
          sortOrder: index + 1,
          isFeatured: index < 9,
          isPublished: true,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: projects.id,
          set: {
            name: project.name,
            description: project.description,
            url: project.url,
            category: project.category,
            year: project.year ?? null,
            thumbnailUrl: project.thumbnail ?? null,
            longDescription: project.longDescription ?? null,
            tagsJson: serializeArray(project.tags),
            featuresJson: serializeArray(project.features),
            techStackJson: serializeArray(project.techStack),
            sortOrder: index + 1,
            isFeatured: index < 9,
            isPublished: true,
            updatedAt: now,
          },
        })
    )
  );

  await db
    .insert(siteProfile)
    .values({
      id: 'primary',
      displayName: seedProfile.displayName,
      headline: seedProfile.headline,
      bioShort: seedProfile.bioShort,
      avatarUrl: seedProfile.avatarUrl,
      githubUrl: seedProfile.githubUrl,
      instagramUrl: seedProfile.instagramUrl,
      email: seedProfile.email,
      essayMarkdown: seedProfile.essayMarkdown,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: siteProfile.id,
      set: {
        displayName: seedProfile.displayName,
        headline: seedProfile.headline,
        bioShort: seedProfile.bioShort,
        avatarUrl: seedProfile.avatarUrl,
        githubUrl: seedProfile.githubUrl,
        instagramUrl: seedProfile.instagramUrl,
        email: seedProfile.email,
        essayMarkdown: seedProfile.essayMarkdown,
        updatedAt: now,
      },
    });

  await Promise.all(
    seedSections.map((section) =>
      db
        .insert(siteSections)
        .values({
          key: section.key,
          name: section.name,
          description: section.description,
          enabled: section.enabled,
          sortOrder: section.sortOrder,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: siteSections.key,
          set: {
            name: section.name,
            description: section.description,
            enabled: section.enabled,
            sortOrder: section.sortOrder,
            updatedAt: now,
          },
        })
    )
  );

  const [projectCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(projects);
  const [sectionCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(siteSections);
  const profileRow = await db.query.siteProfile.findFirst({
    where: eq(siteProfile.id, 'primary'),
  });

  console.warn(
    JSON.stringify(
      {
        ok: true,
        projects: projectCountRow?.count ?? 0,
        sections: sectionCountRow?.count ?? 0,
        profile: profileRow ? 1 : 0,
      },
      null,
      2
    )
  );
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
