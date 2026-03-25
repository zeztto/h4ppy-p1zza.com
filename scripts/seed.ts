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

const isForceMode = process.argv.includes('--force');

async function run() {
  const databaseUrl = process.env['TURSO_DATABASE_URL'];
  const authToken = process.env['TURSO_AUTH_TOKEN'];

  if (!databaseUrl || !authToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required');
  }

  const { client, db } = createDatabase(databaseUrl, authToken);
  const now = new Date();
  await ensureDatabaseSchema(client);

  const [projectCountRow, sectionCountRow, existingProfile] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(projects),
    db.select({ count: sql<number>`count(*)` }).from(siteSections),
    db.query.siteProfile.findFirst({
      where: eq(siteProfile.id, 'primary'),
    }),
  ]);

  const existingProjects = projectCountRow[0]?.count ?? 0;
  const existingSections = sectionCountRow[0]?.count ?? 0;
  const existingProfileCount = existingProfile ? 1 : 0;

  if (!isForceMode && (existingProjects > 0 || existingSections > 0 || existingProfile)) {
    console.warn(
      JSON.stringify(
        {
          ok: true,
          skipped: true,
          mode: 'safe',
          reason: 'existing content detected',
          existing: {
            projects: existingProjects,
            sections: existingSections,
            profile: existingProfileCount,
          },
        },
        null,
        2
      )
    );
    return;
  }

  const [seedProjects, seedProfile, seedSections] = await Promise.all([
    loadSeedProjects(),
    loadSeedProfile(),
    loadSeedSections(),
  ]);

  if (isForceMode && seedProjects.length > 0) {
    await db.delete(projects).where(notInArray(projects.id, seedProjects.map((project) => project.id)));
  }

  if (isForceMode && seedSections.length > 0) {
    await db
      .delete(siteSections)
      .where(notInArray(siteSections.key, seedSections.map((section) => section.key)));
  }

  if (isForceMode || existingProjects === 0) {
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
  }

  if (isForceMode || !existingProfile) {
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
  }

  if (isForceMode || existingSections === 0) {
    await Promise.all(
      seedSections.map((section) =>
        db
          .insert(siteSections)
          .values({
            id: section.key,
            key: section.key,
            name: section.name,
            description: section.description,
            enabled: section.enabled,
            sortOrder: section.sortOrder,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: siteSections.id,
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
  }

  const [finalProjectCountRow] = await db.select({ count: sql<number>`count(*)` }).from(projects);
  const [finalSectionCountRow] = await db.select({ count: sql<number>`count(*)` }).from(siteSections);
  const profileRow = await db.query.siteProfile.findFirst({
    where: eq(siteProfile.id, 'primary'),
  });

  console.warn(
    JSON.stringify(
      {
        ok: true,
        mode: isForceMode ? 'force' : 'safe',
        projects: finalProjectCountRow?.count ?? 0,
        sections: finalSectionCountRow?.count ?? 0,
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
