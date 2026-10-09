import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const adminUsers = pgTable(
  'admin_users',
  {
    id: text('id').primaryKey(),
    githubId: text('github_id').notNull().unique(),
    githubLogin: text('github_login').notNull().unique(),
    role: text('role').notNull().default('admin'),
    avatarUrl: text('avatar_url'),
    displayName: text('display_name'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => ({
    githubLoginIdx: uniqueIndex('admin_users_github_login_idx').on(table.githubLogin),
  })
);

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    sessionHash: text('session_hash').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
  },
  (table) => ({
    sessionHashIdx: uniqueIndex('sessions_hash_idx').on(table.sessionHash),
  })
);

export const projects = pgTable('projects', {
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
  isFeatured: boolean('is_featured').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
});

export const siteProfile = pgTable('site_profile', {
  id: text('id').primaryKey().default('primary'),
  displayName: text('display_name').notNull(),
  headline: text('headline').notNull(),
  bioShort: text('bio_short').notNull(),
  avatarUrl: text('avatar_url'),
  githubUrl: text('github_url'),
  instagramUrl: text('instagram_url'),
  email: text('email'),
  essayMarkdown: text('essay_markdown').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
});

export const siteSections = pgTable('site_sections', {
  id: text('id').primaryKey(),
  key: text('key'),
  name: text('name').notNull(),
  description: text('description').notNull(),
  sectionType: text('section_type').notNull().default('template'),
  templateKey: text('template_key'),
  contentJson: text('content_json').notNull().default('{}'),
  enabled: boolean('enabled').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
});

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
});

export const inquiries = pgTable(
  'inquiries',
  {
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
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => ({
    statusIdx: index('inquiries_status_idx').on(table.status),
    createdAtIdx: index('inquiries_created_at_idx').on(table.createdAt.desc()),
  })
);

export const inquiryMailOutbox = pgTable(
  'inquiry_mail_outbox',
  {
    inquiryId: text('inquiry_id')
      .primaryKey()
      .references(() => inquiries.id),
    messageId: text('message_id').notNull().unique(),
    status: text('status').notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true, mode: 'date' }).notNull(),
    leaseToken: text('lease_token'),
    leaseExpiresAt: timestamp('lease_expires_at', { withTimezone: true, mode: 'date' }),
    lastErrorCode: text('last_error_code'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => ({
    dueIdx: index('inquiry_mail_outbox_due_idx')
      .on(table.nextAttemptAt, table.createdAt)
      .where(sql`${table.sentAt} IS NULL`),
    statusCheck: check(
      'inquiry_mail_outbox_status_check',
      sql`${table.status} IN ('pending', 'processing', 'sent')`
    ),
    attemptsCheck: check('inquiry_mail_outbox_attempts_check', sql`${table.attempts} >= 0`),
  })
);

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
