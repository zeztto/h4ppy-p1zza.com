import 'dotenv/config';
import { createClient } from '@libsql/client';
import { config as loadEnv } from 'dotenv';
import { eq } from 'drizzle-orm';
import { ensureDatabaseSchema } from '../db/bootstrap.js';
import { createDatabase } from '../db/client.js';
import {
  adminUsers,
  inquiries,
  projects,
  sessions,
  siteProfile,
  siteSections,
  siteSettings,
} from '../db/schema.js';

loadEnv({ path: '.env.local', override: false });
loadEnv();

type LegacyRow = Record<string, unknown>;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : String(value ?? '');
}

function asOptionalString(value: unknown) {
  if (value == null || value === '') {
    return null;
  }
  return String(value);
}

function asBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    return value === '1' || value.toLowerCase() === 'true';
  }
  return false;
}

function asDate(value: unknown) {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    return new Date(value);
  }
  if (typeof value === 'string') {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber) && value.trim() !== '') {
      return new Date(asNumber);
    }
    return new Date(value);
  }
  return new Date(0);
}

async function run() {
  const legacyUrl = requireEnv('TURSO_DATABASE_URL');
  const legacyAuthToken = requireEnv('TURSO_AUTH_TOKEN');
  const databaseUrl = requireEnv('DATABASE_URL');

  const legacy = createClient({
    url: legacyUrl,
    authToken: legacyAuthToken,
  });

  const { client, db } = createDatabase(databaseUrl);
  await ensureDatabaseSchema(client);

  const [
    legacyAdminUsers,
    legacySessions,
    legacyProjects,
    legacyProfile,
    legacySections,
    legacySettings,
    legacyInquiries,
  ] = await Promise.all([
    legacy.execute('SELECT * FROM admin_users'),
    legacy.execute('SELECT * FROM sessions'),
    legacy.execute('SELECT * FROM projects'),
    legacy.execute('SELECT * FROM site_profile'),
    legacy.execute('SELECT * FROM site_sections'),
    legacy.execute('SELECT * FROM site_settings'),
    legacy.execute('SELECT * FROM inquiries'),
  ]);

  for (const row of legacyAdminUsers.rows as LegacyRow[]) {
    await db
      .insert(adminUsers)
      .values({
        id: asString(row['id']),
        githubId: asString(row['github_id']),
        githubLogin: asString(row['github_login']),
        role: asString(row['role'] ?? 'admin'),
        avatarUrl: asOptionalString(row['avatar_url']),
        displayName: asOptionalString(row['display_name']),
        createdAt: asDate(row['created_at']),
        updatedAt: asDate(row['updated_at']),
      })
      .onConflictDoUpdate({
        target: adminUsers.id,
        set: {
          githubId: asString(row['github_id']),
          githubLogin: asString(row['github_login']),
          role: asString(row['role'] ?? 'admin'),
          avatarUrl: asOptionalString(row['avatar_url']),
          displayName: asOptionalString(row['display_name']),
          updatedAt: asDate(row['updated_at']),
        },
      });
  }

  for (const row of legacySessions.rows as LegacyRow[]) {
    await db
      .insert(sessions)
      .values({
        id: asString(row['id']),
        sessionHash: asString(row['session_hash']),
        userId: asString(row['user_id']),
        expiresAt: asDate(row['expires_at']),
        createdAt: asDate(row['created_at']),
        updatedAt: asDate(row['updated_at']),
      })
      .onConflictDoUpdate({
        target: sessions.id,
        set: {
          sessionHash: asString(row['session_hash']),
          userId: asString(row['user_id']),
          expiresAt: asDate(row['expires_at']),
          updatedAt: asDate(row['updated_at']),
        },
      });
  }

  for (const row of legacyProjects.rows as LegacyRow[]) {
    await db
      .insert(projects)
      .values({
        id: asString(row['id']),
        name: asString(row['name']),
        description: asString(row['description']),
        url: asString(row['url']),
        category: asString(row['category']),
        year: asOptionalString(row['year']),
        thumbnailUrl: asOptionalString(row['thumbnail_url']),
        longDescription: asOptionalString(row['long_description']),
        tagsJson: asString(row['tags_json'] ?? '[]'),
        featuresJson: asString(row['features_json'] ?? '[]'),
        techStackJson: asString(row['tech_stack_json'] ?? '[]'),
        sortOrder: Number(row['sort_order'] ?? 0),
        isFeatured: asBoolean(row['is_featured']),
        isPublished: asBoolean(row['is_published']),
        createdAt: asDate(row['created_at']),
        updatedAt: asDate(row['updated_at']),
      })
      .onConflictDoUpdate({
        target: projects.id,
        set: {
          name: asString(row['name']),
          description: asString(row['description']),
          url: asString(row['url']),
          category: asString(row['category']),
          year: asOptionalString(row['year']),
          thumbnailUrl: asOptionalString(row['thumbnail_url']),
          longDescription: asOptionalString(row['long_description']),
          tagsJson: asString(row['tags_json'] ?? '[]'),
          featuresJson: asString(row['features_json'] ?? '[]'),
          techStackJson: asString(row['tech_stack_json'] ?? '[]'),
          sortOrder: Number(row['sort_order'] ?? 0),
          isFeatured: asBoolean(row['is_featured']),
          isPublished: asBoolean(row['is_published']),
          updatedAt: asDate(row['updated_at']),
        },
      });
  }

  for (const row of legacyProfile.rows as LegacyRow[]) {
    await db
      .insert(siteProfile)
      .values({
        id: asString(row['id']),
        displayName: asString(row['display_name']),
        headline: asString(row['headline']),
        bioShort: asString(row['bio_short']),
        avatarUrl: asOptionalString(row['avatar_url']),
        githubUrl: asOptionalString(row['github_url']),
        instagramUrl: asOptionalString(row['instagram_url']),
        email: asOptionalString(row['email']),
        essayMarkdown: asString(row['essay_markdown']),
        updatedAt: asDate(row['updated_at']),
      })
      .onConflictDoUpdate({
        target: siteProfile.id,
        set: {
          displayName: asString(row['display_name']),
          headline: asString(row['headline']),
          bioShort: asString(row['bio_short']),
          avatarUrl: asOptionalString(row['avatar_url']),
          githubUrl: asOptionalString(row['github_url']),
          instagramUrl: asOptionalString(row['instagram_url']),
          email: asOptionalString(row['email']),
          essayMarkdown: asString(row['essay_markdown']),
          updatedAt: asDate(row['updated_at']),
        },
      });
  }

  for (const row of legacySections.rows as LegacyRow[]) {
    const nextId = asString(row['id'] ?? row['key']);
    await db
      .insert(siteSections)
      .values({
        id: nextId,
        key: asOptionalString(row['key']),
        name: asString(row['name']),
        description: asString(row['description']),
        sectionType: asString(row['section_type'] ?? 'template'),
        templateKey: asOptionalString(row['template_key']),
        contentJson: asString(row['content_json'] ?? '{}'),
        enabled: asBoolean(row['enabled']),
        sortOrder: Number(row['sort_order'] ?? 0),
        updatedAt: asDate(row['updated_at']),
      })
      .onConflictDoUpdate({
        target: siteSections.id,
        set: {
          key: asOptionalString(row['key']),
          name: asString(row['name']),
          description: asString(row['description']),
          sectionType: asString(row['section_type'] ?? 'template'),
          templateKey: asOptionalString(row['template_key']),
          contentJson: asString(row['content_json'] ?? '{}'),
          enabled: asBoolean(row['enabled']),
          sortOrder: Number(row['sort_order'] ?? 0),
          updatedAt: asDate(row['updated_at']),
        },
      });
  }

  for (const row of legacySettings.rows as LegacyRow[]) {
    await db
      .insert(siteSettings)
      .values({
        key: asString(row['key']),
        value: asString(row['value']),
        updatedAt: asDate(row['updated_at']),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: asString(row['value']),
          updatedAt: asDate(row['updated_at']),
        },
      });
  }

  for (const row of legacyInquiries.rows as LegacyRow[]) {
    await db
      .insert(inquiries)
      .values({
        id: asString(row['id']),
        name: asString(row['name']),
        email: asString(row['email']),
        phone: asOptionalString(row['phone']),
        company: asOptionalString(row['company']),
        projectType: asOptionalString(row['project_type']),
        budget: asOptionalString(row['budget']),
        timeline: asOptionalString(row['timeline']),
        description: asString(row['description']),
        status: asString(row['status'] ?? 'new'),
        sourceUrl: asOptionalString(row['source_url']),
        userAgent: asOptionalString(row['user_agent']),
        ipAddress: asOptionalString(row['ip_address']),
        createdAt: asDate(row['created_at']),
        updatedAt: asDate(row['updated_at']),
        resolvedAt: row['resolved_at'] == null ? null : asDate(row['resolved_at']),
      })
      .onConflictDoUpdate({
        target: inquiries.id,
        set: {
          status: asString(row['status'] ?? 'new'),
          phone: asOptionalString(row['phone']),
          company: asOptionalString(row['company']),
          projectType: asOptionalString(row['project_type']),
          budget: asOptionalString(row['budget']),
          timeline: asOptionalString(row['timeline']),
          description: asString(row['description']),
          sourceUrl: asOptionalString(row['source_url']),
          userAgent: asOptionalString(row['user_agent']),
          ipAddress: asOptionalString(row['ip_address']),
          updatedAt: asDate(row['updated_at']),
          resolvedAt: row['resolved_at'] == null ? null : asDate(row['resolved_at']),
        },
      });
  }

  const primaryProfile = await db.query.siteProfile.findFirst({
    where: eq(siteProfile.id, 'primary'),
  });

  console.warn(
    JSON.stringify(
      {
        ok: true,
        migrated: {
          adminUsers: legacyAdminUsers.rows.length,
          sessions: legacySessions.rows.length,
          projects: legacyProjects.rows.length,
          profile: primaryProfile ? 1 : 0,
          sections: legacySections.rows.length,
          settings: legacySettings.rows.length,
          inquiries: legacyInquiries.rows.length,
        },
      },
      null,
      2
    )
  );

  await client.end();
  legacy.close();
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
