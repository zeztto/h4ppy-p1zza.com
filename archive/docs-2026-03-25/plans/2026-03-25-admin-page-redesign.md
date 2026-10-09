# Admin Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the admin to support inline editing, DB-driven section content, kanban portfolio management, header/footer editing, and grid customization — eliminating all hardcoded content.

**Architecture:** Extend existing Express + Drizzle + React stack. Add `site_settings` table and extend `site_sections` with `id` PK, `section_type`, `template_key`, `content_json`. Frontend adds inline edit mode on public pages, kanban board with @dnd-kit, and section/settings editors.

**Tech Stack:** React 18, TypeScript, Express 5, Drizzle ORM, Turso/SQLite, @dnd-kit, Tailwind CSS 4, react-markdown

**Spec:** `docs/superpowers/specs/2026-03-25-admin-page-redesign.md`

---

## File Structure

### New files

```
db/
  migrate-sections.ts              — Migration: add columns to site_sections, create site_settings

server/
  routes/settings.ts               — Admin + public settings API routes

src/app/
  lib/section-content-types.ts     — TypeScript interfaces for all section contentJson schemas
  hooks/useSettings.ts             — Hook to fetch site_settings by key (public)

  admin/
    services/settings-api.ts       — Admin API client for settings CRUD
    services/sections-api.ts       — Admin API client for sections CRUD (create, delete, patch)

  components/
    inline-edit/
      EditModeProvider.tsx          — React context for edit mode state
      EditModeFAB.tsx               — Floating button to toggle edit mode
      EditableWrapper.tsx           — Hover/click edit affordance wrapper
      InlineText.tsx                — Contenteditable inline text editor
      InlineEditToolbar.tsx         — Section-level toolbar (move, toggle, delete)
      SectionAdder.tsx              — "+" button between sections

    section-editors/
      SectionEditorModal.tsx        — Container for section editing (template picker + custom editor)
      HeroEditor.tsx                — Hero section CTA/layout settings editor
      ValuesEditor.tsx              — Values items slide-over editor
      SkillsEditor.tsx              — Skills categories slide-over editor
      ExperienceEditor.tsx          — Experience items slide-over editor
      ProjectsSectionEditor.tsx     — Projects section settings editor
      CustomSectionEditor.tsx       — Markdown+HTML+CSS code editor
      CustomSectionRenderer.tsx     — Renders custom section content (markdown + shortcodes)

    kanban/
      KanbanBoard.tsx               — Main kanban board with dnd-kit
      KanbanColumn.tsx              — Single kanban column
      KanbanCard.tsx                — Draggable project card

    portfolio-grid/
      GridPreview.tsx               — Grid preview with drag reorder
      GridColumnControl.tsx         — Column count slider

    settings-editors/
      HeaderEditor.tsx              — Nav links slide-over editor
      FooterEditor.tsx              — Social links slide-over editor
```

### Modified files

```
db/schema.ts                       — Add siteSettings table, extend siteSections columns
db/bootstrap.ts                    — Call migrate-sections, seed defaults
server/routes/admin.ts             — Add section CRUD (POST, PATCH, DELETE), update batch PUT
server/routes/public.ts            — Return contentJson in sections, add settings endpoint
server/lib/content.ts              — Update mapSection to include new fields
server/app.ts                      — Mount settings router

src/data/site-content.ts           — Add DEFAULT_SECTION_CONTENT for each template type
src/app/lib/types.ts               — Extend PublicSection with sectionType, templateKey, contentJson
src/app/admin/types.ts             — Extend AdminSection with sectionType, templateKey, contentJson
src/app/admin/services/api.ts      — Add settings API functions, update section functions

src/app/App.tsx                     — Wrap PublicLayout with EditModeProvider
src/app/layouts/PublicLayout.tsx    — Read header from settings, add EditableWrapper
src/app/components/Footer.tsx       — Read footer from settings with fallback

src/app/pages/landing/LandingPage.tsx     — Render sections from contentJson, add edit toolbars
src/app/pages/landing/HeroSection.tsx     — Accept content props for CTA settings
src/app/pages/landing/ValuesSection.tsx   — Accept content props instead of hardcoded data
src/app/pages/landing/SkillsSection.tsx   — Accept content props instead of hardcoded data
src/app/pages/landing/ExperienceSection.tsx — Accept content props instead of hardcoded data
src/app/pages/landing/ProjectsSection.tsx — Accept content props for grid settings

src/app/pages/portfolio/PortfolioPage.tsx — Read grid columns from settings
src/app/pages/admin/ProjectsPage.tsx      — Rewrite: tabbed list/kanban/grid-preview
src/app/pages/admin/SectionsPage.tsx      — Enhance: content editing, add/remove
```

---

## Phase 1: Data Model & API Foundation

### Task 1: Install new dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities nanoid react-markdown remark-gfm
```

- [ ] **Step 2: Verify build passes**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add dnd-kit, nanoid, react-markdown"
```

---

### Task 2: Define section content type interfaces

**Files:**
- Create: `src/app/lib/section-content-types.ts`

- [ ] **Step 1: Create type definitions file**

```typescript
// Section content schemas — these define the shape of contentJson for each template type

export interface HeroContent {
  ctaText: string;
  ctaLink: string;
  showAvatar: boolean;
  layout: 'centered' | 'left-aligned';
}

export interface ProjectsSectionContent {
  title: string;
  maxItems: number;
  showFeaturedOnly: boolean;
}

export interface ValuesContent {
  title: string;
  items: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

// NOTE: Spec defines skill items as { name, level } objects but the existing
// SkillsSection.tsx uses flat string arrays. We keep strings for now to match
// existing UI. Skill levels can be added in a future iteration.
export interface SkillsContent {
  title: string;
  categories: Array<{
    name: string;
    items: string[];
  }>;
}

// NOTE: Spec defines experience items with an `icon` field but the existing
// ExperienceSection.tsx has no icon support. Omitted to match existing UI.
export interface ExperienceContent {
  title: string;
  items: Array<{
    title: string;
    description: string;
  }>;
}

export interface CustomSectionContent {
  markdown: string;
  css: string;
}

export type SectionType = 'template' | 'custom';
export type TemplateKey = 'hero' | 'projects' | 'values' | 'skills' | 'experience';

export type SectionContent =
  | HeroContent
  | ProjectsSectionContent
  | ValuesContent
  | SkillsContent
  | ExperienceContent
  | CustomSectionContent;
```

- [ ] **Step 2: Commit**

```bash
git add src/app/lib/section-content-types.ts
git commit -m "feat: add section content type definitions"
```

---

### Task 3: Add default section content data

**Files:**
- Modify: `src/data/site-content.ts`

- [ ] **Step 1: Add default content for each template type**

Add these exports after the existing `DEFAULT_SITE_SECTIONS`:

```typescript
import type {
  HeroContent,
  ProjectsSectionContent,
  ValuesContent,
  SkillsContent,
  ExperienceContent,
} from '@/app/lib/section-content-types';

export const DEFAULT_HERO_CONTENT: HeroContent = {
  ctaText: '포트폴리오 보기',
  ctaLink: '/portfolio',
  showAvatar: true,
  layout: 'left-aligned',
};

export const DEFAULT_PROJECTS_CONTENT: ProjectsSectionContent = {
  title: 'Featured Projects',
  maxItems: 6,
  showFeaturedOnly: true,
};

export const DEFAULT_VALUES_CONTENT: ValuesContent = {
  title: '핵심 가치',
  items: [
    { icon: 'Users', title: '사용자 중심', description: '모든 결정의 중심에 사용자를 놓습니다. 기술은 도구일 뿐, 사람이 편하게 쓸 수 있어야 합니다.' },
    { icon: 'Lightbulb', title: '실용적 해결', description: '완벽보다 실용을 추구합니다. 일단 작동하는 것을 만들고, 그 다음 더 좋게 만듭니다.' },
    { icon: 'TrendingUp', title: '지속적 성장', description: '매일 조금씩 나아가는 것을 믿습니다. 어제보다 나은 코드를 쓰고, 어제보다 나은 서비스를 만듭니다.' },
  ],
};

export const DEFAULT_SKILLS_CONTENT: SkillsContent = {
  title: '기술 스택',
  categories: [
    { name: 'Frontend', items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'HTML/CSS'] },
    { name: 'Backend', items: ['Node.js', 'Express', 'PostgreSQL', 'SQLite', 'REST API'] },
    { name: 'Tools', items: ['Git', 'Vite', 'Figma', 'Vercel', 'Railway', 'Cloudinary'] },
  ],
};

export const DEFAULT_EXPERIENCE_CONTENT: ExperienceContent = {
  title: '주요 업무',
  items: [
    { title: '웹 애플리케이션 개발', description: 'React, TypeScript 기반의 풀스택 웹 앱 개발' },
    { title: '마케팅 랜딩페이지 제작', description: '전환율을 고려한 마케팅 페이지 기획 및 개발' },
    { title: 'UI/UX 설계', description: '사용자 경험을 최우선으로 한 인터페이스 설계' },
    { title: '데이터 기반 의사결정', description: '분석과 데이터를 활용한 서비스 개선' },
  ],
};

export const DEFAULT_SECTION_CONTENT: Record<string, unknown> = {
  hero: DEFAULT_HERO_CONTENT,
  projects: DEFAULT_PROJECTS_CONTENT,
  values: DEFAULT_VALUES_CONTENT,
  skills: DEFAULT_SKILLS_CONTENT,
  experience: DEFAULT_EXPERIENCE_CONTENT,
};
```

- [ ] **Step 2: Verify types**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/data/site-content.ts
git commit -m "feat: add default section content data for all templates"
```

---

### Task 4: Extend database schema

**Files:**
- Modify: `db/schema.ts`

- [ ] **Step 1: Add `siteSettings` table and extend `siteSections`**

In `db/schema.ts`, replace the existing `siteSections` definition and add `siteSettings`:

```typescript
// Replace existing siteSections with:
export const siteSections = sqliteTable('site_sections', {
  id: text('id').primaryKey(),
  key: text('key'),  // legacy, nullable — kept for backward compat
  name: text('name').notNull(),
  description: text('description').notNull(),
  sectionType: text('section_type').notNull().default('template'),
  templateKey: text('template_key'),
  contentJson: text('content_json').notNull().default('{}'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

// Add new table:
export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull().default('{}'),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
```

Update the `SiteSectionRow` type export at bottom of file:
```typescript
export type SiteSettingsRow = typeof siteSettings.$inferSelect;
```

- [ ] **Step 2: Update `bootstrap.ts` CREATE TABLE to use new schema**

Replace the existing `site_sections` CREATE TABLE statement in `db/bootstrap.ts` with:
```sql
CREATE TABLE IF NOT EXISTS site_sections (
  id TEXT PRIMARY KEY NOT NULL,
  key TEXT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'template',
  template_key TEXT,
  content_json TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
)
```

Also add:
```sql
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL
)
```

This ensures fresh installs get the new schema. The migration script (Task 5) handles existing databases.

- [ ] **Step 3: Update existing `PUT /sections` route in `server/routes/admin.ts`**

The existing batch `PUT /sections` route uses `onConflictDoUpdate({ target: siteSections.key })`. Since `key` is no longer the PK, update to use `siteSections.id`:

- Change all references from `siteSections.key` to `siteSections.id` in the upsert
- The request payload now uses `id` instead of `key` for identification
- Set `key = id` for backward compat when inserting new rows

- [ ] **Step 4: Verify types compile**

Run: `npm run type-check`
Expected: Some errors in consumer files — will be fixed in Task 11.

- [ ] **Step 5: Commit**

```bash
git add db/schema.ts db/bootstrap.ts server/routes/admin.ts
git commit -m "feat: extend site_sections schema, add site_settings table"
```

---

### Task 5: Write database migration script

**Files:**
- Create: `db/migrate-sections.ts`
- Modify: `db/bootstrap.ts`

- [ ] **Step 1: Create migration script**

`db/migrate-sections.ts`:
```typescript
import type { DatabaseClient } from './client.js';

/** Check if a table exists */
async function tableExists(client: DatabaseClient, table: string): Promise<boolean> {
  const result = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    [table]
  );
  return result.rows.length > 0;
}

/** Check if a column exists in a table */
async function columnExists(client: DatabaseClient, table: string, column: string): Promise<boolean> {
  const result = await client.execute(`PRAGMA table_info(${table})`);
  return result.rows.some((row) => row['name'] === column);
}

export async function migrateSections(client: DatabaseClient) {
  // 1. Rebuild site_sections table with new PK (id instead of key)
  //    SQLite cannot ALTER a primary key, so we use the table-rebuild pattern:
  //    create new table → copy data → drop old → rename new
  const needsRebuild = await tableExists(client, 'site_sections')
    && !(await columnExists(client, 'site_sections', 'section_type'));

  if (needsRebuild) {
    await client.execute(`
      CREATE TABLE site_sections_new (
        id TEXT PRIMARY KEY NOT NULL,
        key TEXT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        section_type TEXT NOT NULL DEFAULT 'template',
        template_key TEXT,
        content_json TEXT NOT NULL DEFAULT '{}',
        enabled INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL
      )
    `);

    // Copy existing data: id = key (legacy rows use key as id)
    await client.execute(`
      INSERT INTO site_sections_new (id, key, name, description, section_type, template_key, enabled, sort_order, updated_at)
      SELECT key, key, name, description, 'template', key, enabled, sort_order, updated_at
      FROM site_sections
    `);

    await client.execute(`DROP TABLE site_sections`);
    await client.execute(`ALTER TABLE site_sections_new RENAME TO site_sections`);
  }

  // 2. Create site_settings table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL DEFAULT '{}',
      updated_at INTEGER NOT NULL
    )
  `);
}
```

**Important:** For fresh installs (no existing `site_sections` data), `bootstrap.ts` creates the table with the new schema directly (see Task 4). This migration only runs for existing databases that need the PK change.

- [ ] **Step 2: Update bootstrap.ts to call migration**

In `db/bootstrap.ts`, add at the end of `ensureDatabaseSchema`:
```typescript
import { migrateSections } from './migrate-sections.js';

// Add to end of ensureDatabaseSchema function:
await migrateSections(client);
```

- [ ] **Step 3: Commit**

```bash
git add db/migrate-sections.ts db/bootstrap.ts
git commit -m "feat: add section migration and site_settings table creation"
```

---

### Task 6: Seed default settings and section content

**Files:**
- Create: `db/seed-defaults.ts`
- Modify: `db/bootstrap.ts`

- [ ] **Step 1: Create defaults seeder**

`db/seed-defaults.ts`:
```typescript
import type { DatabaseClient } from './client.js';

const DEFAULT_HEADER = JSON.stringify({
  siteName: 'h4ppy p1zza',
  navLinks: [
    { label: 'Portfolio', to: '/portfolio' },
    { label: 'Profile', to: '/profile' },
  ],
  showThemeToggle: true,
});

const DEFAULT_FOOTER = JSON.stringify({
  siteName: 'h4ppy p1zza',
  copyright: '© 2026 h4ppy p1zza',
  socialLinks: [
    { type: 'github', url: 'https://github.com/zeztto' },
    { type: 'instagram', url: 'https://instagram.com/h4ppy_p1zza' },
  ],
});

const DEFAULT_PORTFOLIO_GRID = JSON.stringify({
  landingColumns: 3,
  portfolioPageColumns: 3,
});

const DEFAULT_SECTION_CONTENT: Record<string, string> = {
  hero: JSON.stringify({
    ctaText: '포트폴리오 보기',
    ctaLink: '/portfolio',
    showAvatar: true,
    layout: 'left-aligned',
  }),
  projects: JSON.stringify({
    title: 'Featured Projects',
    maxItems: 6,
    showFeaturedOnly: true,
  }),
  values: JSON.stringify({
    title: '핵심 가치',
    items: [
      { icon: 'Users', title: '사용자 중심', description: '모든 결정의 중심에 사용자를 놓습니다. 기술은 도구일 뿐, 사람이 편하게 쓸 수 있어야 합니다.' },
      { icon: 'Lightbulb', title: '실용적 해결', description: '완벽보다 실용을 추구합니다. 일단 작동하는 것을 만들고, 그 다음 더 좋게 만듭니다.' },
      { icon: 'TrendingUp', title: '지속적 성장', description: '매일 조금씩 나아가는 것을 믿습니다. 어제보다 나은 코드를 쓰고, 어제보다 나은 서비스를 만듭니다.' },
    ],
  }),
  skills: JSON.stringify({
    title: '기술 스택',
    categories: [
      { name: 'Frontend', items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'HTML/CSS'] },
      { name: 'Backend', items: ['Node.js', 'Express', 'PostgreSQL', 'SQLite', 'REST API'] },
      { name: 'Tools', items: ['Git', 'Vite', 'Figma', 'Vercel', 'Railway', 'Cloudinary'] },
    ],
  }),
  experience: JSON.stringify({
    title: '주요 업무',
    items: [
      { title: '웹 애플리케이션 개발', description: 'React, TypeScript 기반의 풀스택 웹 앱 개발' },
      { title: '마케팅 랜딩페이지 제작', description: '전환율을 고려한 마케팅 페이지 기획 및 개발' },
      { title: 'UI/UX 설계', description: '사용자 경험을 최우선으로 한 인터페이스 설계' },
      { title: '데이터 기반 의사결정', description: '분석과 데이터를 활용한 서비스 개선' },
    ],
  }),
};

export async function seedDefaults(client: DatabaseClient) {
  const now = Date.now();

  // Seed site_settings if empty
  for (const [key, value] of [
    ['header', DEFAULT_HEADER],
    ['footer', DEFAULT_FOOTER],
    ['portfolio_grid', DEFAULT_PORTFOLIO_GRID],
  ] as const) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)`,
      args: [key, value, now],
    });
  }

  // Populate content_json for existing sections that have empty content
  for (const [templateKey, content] of Object.entries(DEFAULT_SECTION_CONTENT)) {
    await client.execute({
      sql: `UPDATE site_sections SET content_json = ?, template_key = ? WHERE key = ? AND content_json = '{}'`,
      args: [content, templateKey, templateKey],
    });
  }
}
```

- [ ] **Step 2: Call seeder from bootstrap.ts**

Add to end of `ensureDatabaseSchema`:
```typescript
import { seedDefaults } from './seed-defaults.js';
// ... at end of function:
await seedDefaults(client);
```

- [ ] **Step 3: Commit**

```bash
git add db/seed-defaults.ts db/bootstrap.ts
git commit -m "feat: seed default settings and section content"
```

---

### Task 7: Update server content mapper and types

**Files:**
- Modify: `server/lib/content.ts`
- Modify: `src/app/lib/types.ts`
- Modify: `src/app/admin/types.ts`

- [ ] **Step 1: Update `mapSection` in `server/lib/content.ts`**

Replace the existing `mapSection` function:
```typescript
export function mapSection(row: SiteSectionRow) {
  return {
    id: row.id,
    key: row.key ?? row.id,
    name: row.name,
    description: row.description,
    sectionType: row.sectionType ?? 'template',
    templateKey: row.templateKey ?? row.key ?? null,
    contentJson: row.contentJson ?? '{}',
    enabled: row.enabled,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt.toISOString(),
  };
}
```

Add a new mapper for settings:
```typescript
import type { SiteSettingsRow } from '../../db/schema.js';

export function mapSetting(row: SiteSettingsRow) {
  return {
    key: row.key,
    value: row.value,
    updatedAt: row.updatedAt.toISOString(),
  };
}
```

- [ ] **Step 2: Update `PublicSection` in `src/app/lib/types.ts`**

```typescript
export interface PublicSection {
  id: string;
  key: string;
  name: string;
  description: string;
  sectionType: 'template' | 'custom';
  templateKey: string | null;
  contentJson: string;
  enabled: boolean;
  sortOrder: number;
  updatedAt: string;
}
```

- [ ] **Step 3: Update `AdminSection` in `src/app/admin/types.ts`**

```typescript
export interface AdminSection {
  id: string;
  key: string;
  name: string;
  description: string;
  sectionType: 'template' | 'custom';
  templateKey: string | null;
  contentJson: string;
  enabled: boolean;
  sortOrder: number;
  updatedAt?: string;
}
```

- [ ] **Step 4: Verify types compile (expect some errors in consumers — OK for now)**

Run: `npm run type-check`

- [ ] **Step 5: Commit**

```bash
git add server/lib/content.ts src/app/lib/types.ts src/app/admin/types.ts
git commit -m "feat: update section types and mapper for new schema"
```

---

### Task 8: Add settings API endpoints

**Files:**
- Create: `server/routes/settings.ts`
- Modify: `server/app.ts`
- Modify: `server/routes/public.ts`

- [ ] **Step 1: Create settings router**

`server/routes/settings.ts`:
```typescript
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { siteSettings } from '../../db/schema.js';
import { mapSetting } from '../lib/content.js';
import { asyncHandler, assert, requireJsonObject } from '../lib/http.js';

export function createSettingsRouter() {
  const router = Router();

  // GET all settings
  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const rows = await res.locals.db.query.siteSettings.findMany();
      res.status(200).json(rows.map(mapSetting));
    })
  );

  // GET single setting
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

  // PUT update setting
  router.put(
    '/:key',
    asyncHandler(async (req, res) => {
      const key = req.params['key'];
      assert(typeof key === 'string' && key.length > 0, 400, 'Setting key is required');

      const payload = requireJsonObject(req.body);
      const value = payload['value'];
      assert(value !== undefined, 400, 'value is required');

      const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
      const now = new Date();

      await res.locals.db
        .insert(siteSettings)
        .values({ key, value: valueStr, updatedAt: now })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value: valueStr, updatedAt: now },
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
```

- [ ] **Step 2: Add public settings endpoint to `server/routes/public.ts`**

Add to the public router:
```typescript
import { siteSettings } from '../../db/schema.js';
import { mapSetting } from '../lib/content.js';

// Add inside createPublicRouter, after existing routes:
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
```

- [ ] **Step 3: Mount settings router in `server/app.ts`**

Import and mount:
```typescript
import { createSettingsRouter } from './routes/settings.js';
// In the admin routes section:
adminRouter.use('/settings', createSettingsRouter());
```

- [ ] **Step 4: Commit**

```bash
git add server/routes/settings.ts server/routes/public.ts server/app.ts
git commit -m "feat: add settings API endpoints (admin + public)"
```

---

### Task 9: Add section CRUD API endpoints

**Files:**
- Modify: `server/routes/admin.ts`

- [ ] **Step 1: Add POST, PATCH, DELETE for individual sections**

Add to `createAdminRouter` in `server/routes/admin.ts`, after the existing `PUT /sections` route:

```typescript
import { nanoid } from 'nanoid';

// POST /sections — create new section
router.post(
  '/sections',
  asyncHandler(async (req, res) => {
    const payload = requireJsonObject(req.body);
    const name = stringField(payload['name'], 'name');
    assert(name, 400, 'Section name is required');

    const now = new Date();
    const sectionType = stringField(payload['sectionType'], 'sectionType', 'template');
    const templateKey = toOptionalString(payload['templateKey'], 'templateKey');
    const contentJson = payload['contentJson'] !== undefined
      ? (typeof payload['contentJson'] === 'string' ? payload['contentJson'] : JSON.stringify(payload['contentJson']))
      : '{}';

    // Get max sortOrder
    const maxOrderRow = await res.locals.db
      .select({ maxOrder: sql<number>`COALESCE(MAX(sort_order), 0)` })
      .from(siteSections);
    const nextOrder = (maxOrderRow[0]?.maxOrder ?? 0) + 1;

    const id = nanoid(12);
    const row = {
      id,
      key: id, // new sections use id as key
      name,
      description: stringField(payload['description'], 'description'),
      sectionType,
      templateKey,
      contentJson,
      enabled: payload['enabled'] !== false,
      sortOrder: typeof payload['sortOrder'] === 'number' ? payload['sortOrder'] : nextOrder,
      updatedAt: now,
    };

    await res.locals.db.insert(siteSections).values(row);
    res.status(201).json(mapSection(row));
  })
);

// PATCH /sections/:id — update single section
router.patch(
  '/sections/:id',
  asyncHandler(async (req, res) => {
    const sectionId = req.params['id'];
    assert(typeof sectionId === 'string' && sectionId.length > 0, 400, 'Section id is required');

    const existing = await res.locals.db.query.siteSections.findFirst({
      where: eq(siteSections.id, sectionId),
    });
    assert(existing, 404, 'Section not found');

    const payload = requireJsonObject(req.body);
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (payload['name'] !== undefined) updates['name'] = stringField(payload['name'], 'name');
    if (payload['description'] !== undefined) updates['description'] = stringField(payload['description'], 'description');
    if (typeof payload['enabled'] === 'boolean') updates['enabled'] = payload['enabled'];
    if (typeof payload['sortOrder'] === 'number') updates['sortOrder'] = payload['sortOrder'];
    if (payload['contentJson'] !== undefined) {
      updates['contentJson'] = typeof payload['contentJson'] === 'string'
        ? payload['contentJson']
        : JSON.stringify(payload['contentJson']);
    }

    await res.locals.db.update(siteSections).set(updates).where(eq(siteSections.id, sectionId));

    const updated = await res.locals.db.query.siteSections.findFirst({
      where: eq(siteSections.id, sectionId),
    });
    assert(updated, 500, 'Updated section missing');
    res.status(200).json(mapSection(updated));
  })
);

// DELETE /sections/:id — delete single section
router.delete(
  '/sections/:id',
  asyncHandler(async (req, res) => {
    const sectionId = req.params['id'];
    assert(typeof sectionId === 'string' && sectionId.length > 0, 400, 'Section id is required');
    await res.locals.db.delete(siteSections).where(eq(siteSections.id, sectionId));
    res.status(204).send();
  })
);
```

- [ ] **Step 2: Update public sections endpoint to return contentJson**

In `server/routes/public.ts`, the existing sections route already calls `mapSection` which now includes contentJson. Verify the sections endpoint only returns enabled sections:

Update the existing GET /sections in public.ts to filter by enabled:
```typescript
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
```

- [ ] **Step 3: Verify types compile**

Run: `npm run type-check`

- [ ] **Step 4: Commit**

```bash
git add server/routes/admin.ts server/routes/public.ts
git commit -m "feat: add section CRUD and settings endpoints"
```

---

### Task 10: Update admin API client

**Files:**
- Modify: `src/app/admin/services/api.ts`

- [ ] **Step 1: Add settings and section CRUD functions**

Add to `api.ts`:
```typescript
// Settings
export async function getSettings() {
  return adminRequest<Array<{ key: string; value: string; updatedAt: string }>>('/api/admin/settings');
}

export async function getSetting(key: string) {
  return adminRequest<{ key: string; value: string; updatedAt: string }>(`/api/admin/settings/${key}`);
}

export async function saveSetting(key: string, value: unknown) {
  return adminRequest<{ key: string; value: string; updatedAt: string }>(`/api/admin/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

// Section CRUD
export async function createSection(payload: {
  name: string;
  description: string;
  sectionType: 'template' | 'custom';
  templateKey?: string;
  contentJson?: unknown;
  enabled?: boolean;
}) {
  return adminRequest<AdminSection>('/api/admin/sections', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateSection(sectionId: string, payload: Partial<AdminSection>) {
  return adminRequest<AdminSection>(`/api/admin/sections/${sectionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteSection(sectionId: string) {
  await adminRequest<void>(`/api/admin/sections/${sectionId}`, {
    method: 'DELETE',
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/services/api.ts
git commit -m "feat: add settings and section CRUD to admin API client"
```

---

### Task 11: Fix remaining type errors and verify full build

**Files:**
- Modify: Various files that reference old `AdminSection.key` or `PublicSection.key` patterns

- [ ] **Step 1: Fix `SectionsPage.tsx` references to `section.key`**

Update `SectionsPage.tsx` to use `section.id` as the key prop and in API calls. The `key` field still exists as a legacy field, so most reads are fine — but the React key prop should use `id`.

- [ ] **Step 2: Fix `LandingPage.tsx` section rendering**

Update `LandingPage.tsx` to use `section.templateKey` (or fallback to `section.key`) in the `renderSection` switch statement.

- [ ] **Step 3: Run full type-check and fix remaining errors**

Run: `npm run type-check`
Fix any remaining type errors.

- [ ] **Step 4: Run dev server and verify nothing is broken**

Run: `npm run dev`
Visit `http://localhost:5173` — verify landing page renders correctly.
Visit `http://localhost:5173/admin` — verify admin pages work.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: resolve type errors after schema migration"
```

---

## Phase 2: Section Content from DB

### Task 12a: Update simple sections to accept content props

**Files:**
- Modify: `src/app/pages/landing/SkillsSection.tsx`
- Modify: `src/app/pages/landing/ExperienceSection.tsx`

- [ ] **Step 1: Update `SkillsSection`**

Accept `SkillsContent` props, use `content.categories` instead of hardcoded `skillGroups`. Default to `DEFAULT_SKILLS_CONTENT` from `site-content.ts`.

- [ ] **Step 2: Update `ExperienceSection`**

Accept `ExperienceContent` props, use `content.items` instead of hardcoded `milestones`. Default to `DEFAULT_EXPERIENCE_CONTENT`.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/landing/SkillsSection.tsx src/app/pages/landing/ExperienceSection.tsx
git commit -m "feat: SkillsSection and ExperienceSection read from content props"
```

---

### Task 12b: Update ValuesSection with dynamic icon lookup

**Files:**
- Modify: `src/app/pages/landing/ValuesSection.tsx`

- [ ] **Step 1: Create icon lookup helper**

lucide-react exports icons individually. Create a helper to map string names to components:
```typescript
import * as icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function getIcon(name: string): LucideIcon {
  const Icon = (icons as Record<string, LucideIcon>)[name];
  return Icon ?? icons.HelpCircle; // fallback icon
}
```

- [ ] **Step 2: Update `ValuesSection` to accept content props**

Replace hardcoded `values` array with props. Use `getIcon(item.icon)` for dynamic icon rendering. Default to `DEFAULT_VALUES_CONTENT`.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/landing/ValuesSection.tsx
git commit -m "feat: ValuesSection reads from content props with dynamic icons"
```

---

### Task 12c: Update HeroSection and ProjectsSection

**Files:**
- Modify: `src/app/pages/landing/HeroSection.tsx`
- Modify: `src/app/pages/landing/ProjectsSection.tsx`

- [ ] **Step 1: Update `HeroSection`**

Accept optional `HeroContent` props. Use `content.ctaText`/`content.ctaLink` for the CTA button text and link. Use `content.showAvatar` to conditionally show avatar. Use `content.layout` for left-aligned vs centered. Profile data (displayName, headline, bioShort, avatarUrl) still from `profile` prop. Default to `DEFAULT_HERO_CONTENT`.

- [ ] **Step 2: Update `ProjectsSection`**

Accept optional `ProjectsSectionContent` props for `title`, `maxItems`, `showFeaturedOnly`. Default to `DEFAULT_PROJECTS_CONTENT`.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/landing/HeroSection.tsx src/app/pages/landing/ProjectsSection.tsx
git commit -m "feat: HeroSection and ProjectsSection read from content props"
```

---

### Task 12d: Wire LandingPage to pass contentJson to all sections

**Files:**
- Modify: `src/app/pages/landing/LandingPage.tsx`

- [ ] **Step 1: Update `renderSection` to parse contentJson**

```typescript
const renderSection = (section: PublicSection) => {
  const content = JSON.parse(section.contentJson || '{}');
  const templateKey = section.templateKey ?? section.key;

  switch (templateKey) {
    case 'hero':
      return <HeroSection key={section.id} profile={profile ?? profileFallback} content={content} />;
    case 'projects':
      return <ProjectsSection key={section.id} projects={projects ?? []} content={content} />;
    case 'values':
      return <ValuesSection key={section.id} content={content} />;
    case 'skills':
      return <SkillsSection key={section.id} content={content} />;
    case 'experience':
      return <ExperienceSection key={section.id} content={content} />;
    default:
      return null;
  }
};
```

- [ ] **Step 2: Verify landing page renders correctly**

Run: `npm run dev`
Visit `http://localhost:5173` — all sections should display with data from DB (seeded defaults match previous hardcoded values).

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/landing/LandingPage.tsx
git commit -m "feat: LandingPage passes contentJson to all sections"
```

---

### Task 13: Update header and footer to read from settings

**Files:**
- Create: `src/app/hooks/useSettings.ts`
- Modify: `src/app/layouts/PublicLayout.tsx`
- Modify: `src/app/components/Footer.tsx`

- [ ] **Step 1: Create useSettings hook**

`src/app/hooks/useSettings.ts`:
```typescript
import { useState, useEffect } from 'react';

export function useSettings<T>(key: string, fallback: T): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/public/settings/${key}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (!cancelled && result?.value) {
          try {
            setData(typeof result.value === 'string' ? JSON.parse(result.value) : result.value);
          } catch { /* use fallback */ }
        }
      })
      .catch(() => { /* use fallback */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [key]);

  return { data, loading };
}
```

- [ ] **Step 2: Update PublicLayout header to read from settings**

Replace hardcoded `NAV_LINKS` with data from `useSettings('header', defaultHeaderSettings)`.

- [ ] **Step 3: Update Footer to read from settings with fallback**

Read from `useSettings('footer', defaultFooterSettings)`. Fall back to profile social URLs if settings don't exist yet.

- [ ] **Step 4: Verify header/footer render**

Run: `npm run dev`
Verify header nav links and footer social icons display correctly.

- [ ] **Step 5: Commit**

```bash
git add src/app/hooks/useSettings.ts src/app/layouts/PublicLayout.tsx src/app/components/Footer.tsx
git commit -m "feat: header and footer read from site_settings"
```

---

## Phase 3: Portfolio Kanban Management

### Task 14: Build kanban board components

**Files:**
- Create: `src/app/components/kanban/KanbanBoard.tsx`
- Create: `src/app/components/kanban/KanbanColumn.tsx`
- Create: `src/app/components/kanban/KanbanCard.tsx`

- [ ] **Step 1: Create KanbanCard**

Draggable project card showing thumbnail, name, category badge, published/featured toggles.
Uses `useSortable` from `@dnd-kit/sortable`.

- [ ] **Step 2: Create KanbanColumn**

Single column with title, card count badge, and `SortableContext` for drag-within-column.
Uses `useDroppable` from `@dnd-kit/core`.

- [ ] **Step 3: Create KanbanBoard**

Main board with `DndContext`. Accepts `projects` array, `mode` ('status' | 'category'), and callbacks for `onProjectUpdate` and `onReorder`.

Status mode: 3 columns — Draft, Published, Featured.
Category mode: dynamic columns from unique categories + "미분류".

Implements drag handlers:
- `handleDragEnd`: determines source/target column, updates project properties per state transition table (spec section 3.2), calls API.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/kanban/
git commit -m "feat: add kanban board components with dnd-kit"
```

---

### Task 15: Build grid preview components

**Files:**
- Create: `src/app/components/portfolio-grid/GridPreview.tsx`
- Create: `src/app/components/portfolio-grid/GridColumnControl.tsx`

- [ ] **Step 1: Create GridColumnControl**

Slider input (1-4) with labels. Accepts `value`, `onChange`, and `label` props.

- [ ] **Step 2: Create GridPreview**

Renders ProjectCard components in a CSS grid. Accepts `columns`, `projects`, and drag handlers.
Uses `@dnd-kit/sortable` for drag reorder within the grid.

Top controls: "랜딩 페이지" / "포트폴리오 페이지" tab + column slider per tab.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/portfolio-grid/
git commit -m "feat: add grid preview components with column control"
```

---

### Task 16a: Add tab bar and kanban view to ProjectsPage

**Files:**
- Modify: `src/app/pages/admin/ProjectsPage.tsx`

- [ ] **Step 1: Add view mode tabs at top**

Tab bar: "리스트" | "칸반" | "그리드 프리뷰". Store active tab in state. Default to "리스트".

- [ ] **Step 2: Integrate KanbanBoard in kanban tab**

Render `KanbanBoard` with status/category toggle. Wire up `onProjectUpdate` to `updateProject` API and `onReorder` to `reorderProjects` API.

State transition table for status kanban drags:
| Drag | isPublished | isFeatured |
|------|-------------|------------|
| Draft → Published | `true` | unchanged |
| Draft → Featured | `true` | `true` |
| Published → Featured | unchanged | `true` |
| Published → Draft | `false` | `false` |
| Featured → Published | unchanged | `false` |
| Featured → Draft | `false` | `false` |

- [ ] **Step 3: Verify kanban view works**

Run: `npm run dev`, visit `/admin/projects`, switch to kanban tab. Test drag between columns in both status and category modes.

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/admin/ProjectsPage.tsx
git commit -m "feat: add tab bar and kanban view to ProjectsPage"
```

---

### Task 16b: Add grid preview and bulk actions to ProjectsPage

**Files:**
- Modify: `src/app/pages/admin/ProjectsPage.tsx`

- [ ] **Step 1: Integrate GridPreview in grid tab**

Render `GridPreview` with column controls. Two sub-tabs: "랜딩 페이지" / "포트폴리오 페이지". Column slider 1-4 per sub-tab. Wire column changes to `saveSetting('portfolio_grid', ...)`.

- [ ] **Step 2: Enhance list view with bulk actions**

Add checkbox on each row. When any checked, show bulk action bar above the list:
- "공개" button: `updateProject(id, { isPublished: true })` for each selected
- "비공개" button: `updateProject(id, { isPublished: false })` for each selected
- "삭제" button: confirm dialog, then `deleteProject(id)` for each selected

- [ ] **Step 3: Keep existing slide-over project form**

The slide-over panel for creating/editing projects remains. Opened from any view mode via edit button on card/row.

- [ ] **Step 4: Verify all three views**

Run: `npm run dev`, visit `/admin/projects`. Test list bulk actions, grid preview with column slider.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/admin/ProjectsPage.tsx
git commit -m "feat: add grid preview and bulk actions to ProjectsPage"
```

---

### Task 17: Update portfolio page grid columns from settings

**Files:**
- Modify: `src/app/pages/portfolio/PortfolioPage.tsx`

- [ ] **Step 1: Read grid settings and apply column count**

Use `useSettings('portfolio_grid', { landingColumns: 3, portfolioPageColumns: 3 })` to get column count. Replace hardcoded `lg:grid-cols-3` with dynamic class based on setting.

- [ ] **Step 2: Update ProjectsSection landing grid similarly**

In `ProjectsSection.tsx`, use landing grid columns from settings.

- [ ] **Step 3: Verify both grids respect settings**

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/portfolio/PortfolioPage.tsx src/app/pages/landing/ProjectsSection.tsx
git commit -m "feat: portfolio grid columns from site_settings"
```

---

## Phase 4: Inline Editing System

### Task 18: Create edit mode infrastructure

**Files:**
- Create: `src/app/components/inline-edit/EditModeProvider.tsx`
- Create: `src/app/components/inline-edit/EditModeFAB.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Create EditModeProvider**

React context providing `{ isEditMode, toggleEditMode, isAdmin }`. Checks auth state — only active when admin is authenticated and visiting public routes.

- [ ] **Step 2: Create EditModeFAB**

Floating action button (bottom-right, z-50). Shows pencil icon. Click toggles edit mode. Hidden when not admin or on mobile (< 1024px). Shows "어드민" link to `/admin`.

- [ ] **Step 3: Wrap PublicLayout routes with EditModeProvider in App.tsx**

The `AuthProvider` already wraps everything. `EditModeProvider` should be a child of `AuthProvider` and wrap the `PublicLayout` route.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/inline-edit/EditModeProvider.tsx src/app/components/inline-edit/EditModeFAB.tsx src/app/App.tsx
git commit -m "feat: add edit mode provider and floating action button"
```

---

### Task 19: Create editable wrapper components

**Files:**
- Create: `src/app/components/inline-edit/EditableWrapper.tsx`
- Create: `src/app/components/inline-edit/InlineText.tsx`
- Create: `src/app/components/inline-edit/InlineEditToolbar.tsx`
- Create: `src/app/components/inline-edit/SectionAdder.tsx`

- [ ] **Step 1: Create EditableWrapper**

Wraps children. When edit mode active: on hover shows blue dashed border + pencil badge. On click calls `onEdit`. When edit mode inactive: renders children with no overhead.

- [ ] **Step 2: Create InlineText**

ContentEditable wrapper for single-line text. On blur or Enter: calls `onSave(newValue)`. Shows subtle underline when in edit mode.

- [ ] **Step 3: Create InlineEditToolbar**

Appears above each section in edit mode. Shows: section name, up/down arrows, enabled toggle, edit button, delete button. Calls callbacks for each action.

- [ ] **Step 4: Create SectionAdder**

"+" button that appears between sections in edit mode. On click: opens section picker modal.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/inline-edit/
git commit -m "feat: add inline edit wrapper components"
```

---

### Task 20: Wire inline editing into landing page

**Files:**
- Modify: `src/app/pages/landing/LandingPage.tsx`
- Modify: `src/app/layouts/PublicLayout.tsx`

- [ ] **Step 1: Wrap each section with InlineEditToolbar**

In `LandingPage`, when edit mode is active, wrap each rendered section with `InlineEditToolbar`. Wire up toolbar actions to API calls (updateSection for toggle/reorder, deleteSection for delete).

- [ ] **Step 2: Add SectionAdder between sections**

Show "+" buttons between sections and at the end of the page.

- [ ] **Step 3: Wire InlineText for header site name**

In `PublicLayout`, wrap the site name with `InlineText` when in edit mode. On save, call `saveSetting('header', ...)`.

- [ ] **Step 4: Add header/footer edit triggers**

Wrap nav area with `EditableWrapper` → opens `HeaderEditor` slide-over.
Wrap footer with `EditableWrapper` → opens `FooterEditor` slide-over.

- [ ] **Step 5: Verify inline editing works end-to-end**

Run: `npm run dev`
Login as admin, visit landing page, toggle edit mode. Test: section reorder, toggle, delete. Test header site name editing.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/landing/LandingPage.tsx src/app/layouts/PublicLayout.tsx
git commit -m "feat: wire inline editing into landing page and header"
```

---

## Phase 5: Section & Settings Editors

### Task 21a: Build template section editors

**Files:**
- Create: `src/app/components/section-editors/HeroEditor.tsx`
- Create: `src/app/components/section-editors/ValuesEditor.tsx`
- Create: `src/app/components/section-editors/SkillsEditor.tsx`
- Create: `src/app/components/section-editors/ExperienceEditor.tsx`
- Create: `src/app/components/section-editors/ProjectsSectionEditor.tsx`

- [ ] **Step 1: Create HeroEditor**

Slide-over panel with: CTA text input, CTA link input, show avatar toggle, layout selector (centered / left-aligned). On save: calls `updateSection(sectionId, { contentJson: ... })`.

- [ ] **Step 2: Create ValuesEditor**

Slide-over panel. Lists value items with add/remove/reorder. Each item: icon name input (lucide icon name), title input, description textarea. On save: calls `updateSection` with new contentJson.

- [ ] **Step 3: Create SkillsEditor**

Similar slide-over. Lists skill categories. Each category: name input + list of skill name inputs with add/remove. On save: updates contentJson.

- [ ] **Step 4: Create ExperienceEditor**

Similar to ValuesEditor for experience items (title + description per item).

- [ ] **Step 5: Create ProjectsSectionEditor**

Simple settings panel: title input, maxItems number input, showFeaturedOnly toggle.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/section-editors/
git commit -m "feat: add template section editors"
```

---

### Task 21b: Build SectionEditorModal (template picker + custom creator)

**Files:**
- Create: `src/app/components/section-editors/SectionEditorModal.tsx`

- [ ] **Step 1: Create SectionEditorModal**

Modal with two tabs:
- **"템플릿" tab**: Grid of template cards (Hero, Projects, Values, Skills, Experience). Each shows icon + name + description. Click calls `createSection` with template defaults from `DEFAULT_SECTION_CONTENT`.
- **"커스텀" tab**: Name input + "생성" button. Creates section with `sectionType: 'custom'` and empty markdown.

- [ ] **Step 2: Commit**

```bash
git add src/app/components/section-editors/SectionEditorModal.tsx
git commit -m "feat: add section editor modal with template picker"
```

---

### Task 21c: Build custom section editor and renderer

**Files:**
- Create: `src/app/components/section-editors/CustomSectionEditor.tsx`
- Create: `src/app/components/section-editors/CustomSectionRenderer.tsx`

- [ ] **Step 1: Create CustomSectionRenderer**

Renders custom section content:
1. Parse shortcode patterns FIRST (before markdown) — extract `[shortcode-name attr=value]` and replace with placeholder tokens
2. Render markdown via `react-markdown` with `remark-gfm`
3. Replace placeholder tokens with React components
4. Apply scoped CSS: wrap section in a div with unique class (e.g., `section-{id}`), prefix all user CSS selectors with that class using a regex rewriter

Supported shortcodes:
- `[divider]` → `<hr>` with custom styling
- `[spacer height=40]` → `<div style="height: 40px">`
- `[icon name="code" size=24]` → lucide icon component

- [ ] **Step 2: Create CustomSectionEditor**

Slide-over with two tab panels:
- **마크다운 tab**: `<textarea>` for markdown+HTML editing (plain textarea, not CodeMirror — lighter dependency)
- **CSS tab**: `<textarea>` for scoped CSS
- **미리보기 tab**: Live preview using `CustomSectionRenderer`

On save: calls `updateSection` with `contentJson: JSON.stringify({ markdown, css })`.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/section-editors/CustomSectionEditor.tsx src/app/components/section-editors/CustomSectionRenderer.tsx
git commit -m "feat: add custom section editor and renderer with shortcodes"
```

---

### Task 22: Build header and footer editors

**Files:**
- Create: `src/app/components/settings-editors/HeaderEditor.tsx`
- Create: `src/app/components/settings-editors/FooterEditor.tsx`

- [ ] **Step 1: Create HeaderEditor**

Slide-over panel. Editable list of nav links (label + path). Add/remove/reorder. Theme toggle checkbox. Calls `saveSetting('header', ...)` on save.

- [ ] **Step 2: Create FooterEditor**

Slide-over panel. Editable list of social links (type dropdown + URL input). Copyright text input. Calls `saveSetting('footer', ...)` on save.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/settings-editors/
git commit -m "feat: add header and footer settings editors"
```

---

### Task 23: Enhance admin SectionsPage

**Files:**
- Modify: `src/app/pages/admin/SectionsPage.tsx`

- [ ] **Step 1: Add section creation button**

"섹션 추가" button opens `SectionEditorModal`.

- [ ] **Step 2: Add per-section edit and delete**

Each section row: edit button opens the appropriate editor (template-specific or custom). Delete button with confirmation.

- [ ] **Step 3: Show section type badge**

Show "템플릿" or "커스텀" badge on each section row.

- [ ] **Step 4: Show content preview**

Brief preview of section content (e.g., item count for values, category count for skills).

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/admin/SectionsPage.tsx
git commit -m "feat: enhance SectionsPage with CRUD and content editing"
```

---

## Phase 6: Integration & Polish

### Task 24: Add custom section rendering to landing page

**Files:**
- Modify: `src/app/pages/landing/LandingPage.tsx`

- [ ] **Step 1: Add 'custom' case to renderSection switch**

```typescript
case null:
case undefined:
  if (section.sectionType === 'custom') {
    return <CustomSectionRenderer key={section.id} content={content} />;
  }
  return null;
```

- [ ] **Step 2: Verify custom sections render on landing page**

Create a custom section via admin, verify it appears on landing page.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/landing/LandingPage.tsx
git commit -m "feat: render custom sections on landing page"
```

---

### Task 25: Auto-save for inline editing

**Files:**
- Create: `src/app/hooks/useAutoSave.ts`

- [ ] **Step 1: Create useAutoSave hook**

```typescript
import { useRef, useCallback } from 'react';

export function useAutoSave<T>(
  saveFn: (value: T) => Promise<void>,
  delay = 1000
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const latestValueRef = useRef<T>();
  const inflightRef = useRef(false);

  const save = useCallback((value: T) => {
    latestValueRef.current = value;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (inflightRef.current) return; // will be picked up after current save
      inflightRef.current = true;
      try {
        await saveFn(latestValueRef.current!);
      } finally {
        inflightRef.current = false;
        // If value changed during save, trigger another save
        if (latestValueRef.current !== value) {
          save(latestValueRef.current!);
        }
      }
    }, delay);
  }, [saveFn, delay]);

  return save;
}
```

- [ ] **Step 2: Integrate into InlineText and section editors**

Wire `useAutoSave` into inline text fields and editor save callbacks.

- [ ] **Step 3: Commit**

```bash
git add src/app/hooks/useAutoSave.ts
git commit -m "feat: add auto-save hook with debounce and request queue"
```

---

### Task 26: Final verification and cleanup

- [ ] **Step 1: Run type-check**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Fix any lint errors.

- [ ] **Step 3: Run dev server and test full flow**

1. Landing page: all sections render from DB
2. Admin login → edit mode on landing page
3. Inline editing: text, section reorder, toggle, delete
4. Section add (template + custom)
5. Header/footer editing
6. Admin Projects: list, kanban (both modes), grid preview
7. Grid column changes reflected on portfolio page
8. Non-admin: zero edit UI visible

- [ ] **Step 4: Remove hardcoded content from section components**

Verify that `ValuesSection`, `SkillsSection`, `ExperienceSection` no longer have any hardcoded content arrays. They should only have fallback defaults imported from `site-content.ts`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```
