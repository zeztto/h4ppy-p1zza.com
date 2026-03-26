import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const adminUsers = sqliteTable(
  'admin_users',
  {
    id: text('id').primaryKey(),
    githubId: text('github_id').notNull().unique(),
    githubLogin: text('github_login').notNull().unique(),
    role: text('role').notNull().default('admin'),
    avatarUrl: text('avatar_url'),
    displayName: text('display_name'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => ({
    githubLoginIdx: uniqueIndex('admin_users_github_login_idx').on(table.githubLogin),
  })
);

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    sessionHash: text('session_hash').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => ({
    sessionHashIdx: uniqueIndex('sessions_hash_idx').on(table.sessionHash),
  })
);

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  url: text('url').notNull(),
  category: text('category').notNull(),
  year: text('year'),
  thumbnailUrl: text('thumbnail_url'),
  longDescription: text('long_description'),
  tagsJson: text('tags_json').notNull().default('[]'),
  featuresJson: text('features_json').notNull().default('[]'),
  techStackJson: text('tech_stack_json').notNull().default('[]'),
  sortOrder: integer('sort_order').notNull().default(0),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const siteProfile = sqliteTable('site_profile', {
  id: text('id').primaryKey().default('primary'),
  displayName: text('display_name').notNull(),
  headline: text('headline').notNull(),
  bioShort: text('bio_short').notNull(),
  avatarUrl: text('avatar_url'),
  githubUrl: text('github_url'),
  instagramUrl: text('instagram_url'),
  email: text('email'),
  essayMarkdown: text('essay_markdown').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const siteSections = sqliteTable('site_sections', {
  id: text('id').primaryKey(),
  key: text('key'),
  name: text('name').notNull(),
  description: text('description').notNull(),
  sectionType: text('section_type').notNull().default('template'),
  templateKey: text('template_key'),
  contentJson: text('content_json').notNull().default('{}'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const inquiries = sqliteTable('inquiries', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  projectType: text('project_type'),
  budget: text('budget'),
  timeline: text('timeline'),
  description: text('description').notNull(),
  status: text('status').notNull().default('new'),
  sourceUrl: text('source_url'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  resolvedAt: integer('resolved_at', { mode: 'timestamp_ms' }),
});

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(adminUsers, {
    fields: [sessions.userId],
    references: [adminUsers.id],
  }),
}));

export type AdminUserRow = typeof adminUsers.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type SiteProfileRow = typeof siteProfile.$inferSelect;
export type SiteSectionRow = typeof siteSections.$inferSelect;
export type SiteSettingsRow = typeof siteSettings.$inferSelect;
export type InquiryRow = typeof inquiries.$inferSelect;
