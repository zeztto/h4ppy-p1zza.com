# Admin Page Redesign Spec

## Overview

어드민 페이지를 전면 개선하여 인라인 편집, 섹션 콘텐츠 DB 관리, 칸반 포트폴리오 관리, 헤더/푸터 편집, 그리드 커스터마이징을 구현한다. 하드코딩된 콘텐츠를 모두 DB로 이전하고, 향후 독립 CMS 솔루션으로 분리 가능한 구조를 갖춘다.

## Goals

1. 모든 하드코딩 콘텐츠를 DB로 이전하여 어드민에서 편집 가능하게 만든다
2. 실제 사이트 레이아웃에서 인라인 편집이 가능하도록 한다
3. 포트폴리오를 칸반/그리드 프리뷰로 직관적으로 관리한다
4. 섹션 추가/제거 및 커스텀 섹션 생성을 지원한다
5. 헤더/푸터를 어드민에서 편집 가능하게 한다
6. 포트폴리오 그리드 컬럼 수를 랜딩/포트폴리오 페이지별로 설정한다

## Non-Goals

- 멀티 사이트/멀티 유저 지원 (향후 독립 CMS 분리 시 고려)
- 블록 에디터 (Notion 스타일) — 마크다운 + HTML + 컴포넌트로 충분
- 실시간 협업 편집
- 버전 히스토리 / 되돌리기 (1차에서는 제외)

---

## 1. Data Model Changes

### 1.1 `site_sections` table — migrate PK and extend

**PK change:** The current `key` column (e.g., `'hero'`, `'projects'`) serves as PK but collides when multiple instances of the same template exist. Migrate to:
- New `id` column (nanoid, 12 chars) as PK
- Keep `key` as a non-unique legacy column (nullable, for backward compat during migration)

Existing rows: `id` is set to the current `key` value (e.g., `'hero'`→ id `'hero'`). New sections get a nanoid.

Add columns:
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | text (PK) | nanoid | Unique section identifier |
| `section_type` | text | `'template'` | `'template'` or `'custom'` |
| `template_key` | text | null | Template identifier (hero, projects, values, skills, experience). Multiple sections can share the same template_key. |
| `content_json` | text | `'{}'` | Section content as JSON string |

- For template sections, `template_key` identifies the template; `content_json` holds template-specific data.
- For custom sections, `template_key` is null; `content_json` holds `{ markdown, css }`.
- Existing rows: `id` = current `key`, `section_type='template'`, `template_key` = current `key`.
- API endpoints use `id` (not `key`) in URL paths: `/api/admin/sections/:id`.

### 1.2 Template contentJson schemas

```typescript
// hero — references site_profile for headline/bioShort/avatarUrl.
// HeroContent stores ONLY hero-specific display settings.
// The HeroSection component reads profile data from site_profile
// and hero-specific settings from this content.
interface HeroContent {
  ctaText: string;
  ctaLink: string;
  showAvatar: boolean;   // whether to display avatar in hero
  layout: 'centered' | 'left-aligned'; // hero layout variant
}

// projects
interface ProjectsSectionContent {
  title: string;
  maxItems: number;       // max projects shown on landing
  showFeaturedOnly: boolean;
}

// values
interface ValuesContent {
  title: string;
  items: Array<{
    icon: string;   // lucide icon name
    title: string;
    description: string;
  }>;
}

// skills
interface SkillsContent {
  title: string;
  categories: Array<{
    name: string;
    items: Array<{
      name: string;
      level: number; // 0-100
    }>;
  }>;
}

// experience
interface ExperienceContent {
  title: string;
  items: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

// custom
interface CustomSectionContent {
  markdown: string; // supports HTML and component shortcodes
  css: string;      // scoped CSS for this section
}
```

### 1.3 `site_settings` table — new

| Column | Type | Description |
|--------|------|-------------|
| `key` (PK) | text | Setting identifier |
| `value` | text | JSON string |
| `updated_at` | integer (timestamp_ms) | Last update |

Settings keys:
```typescript
// header
interface HeaderSettings {
  siteName: string;
  navLinks: Array<{ label: string; to: string }>;
  showThemeToggle: boolean;
}

// footer
interface FooterSettings {
  siteName: string;
  copyright: string;
  socialLinks: Array<{ type: 'github' | 'instagram' | 'email' | 'twitter' | 'linkedin'; url: string }>;
}

// portfolio_grid
interface PortfolioGridSettings {
  landingColumns: number;        // 1-4, default 3
  portfolioPageColumns: number;  // 1-4, default 3
}
```

### 1.4 Migration strategy

**Phase 1 (this PR):**
- Existing `site_sections` rows: set `id` = current `key`, `section_type='template'`, `template_key` = current `key`, `content_json` from hardcoded defaults in `site-content.ts`
- Create `site_settings` with default header/footer/grid values
- Footer reads from `site_settings` with **fallback** to `site_profile` social URLs (backward compat)
- `site_profile` social URL columns remain — no destructive changes

**Phase 2 (future PR):**
- Drop social URL columns from `site_profile` after confirming all data migrated to `site_settings`

**Migration approach:** Since SQLite lacks `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, migrations use `PRAGMA table_info()` to check existing columns before adding. Wrapped in the existing `db/bootstrap.ts` idempotent pattern. No `drizzle-kit` migration system introduced yet — follow existing convention.

---

## 2. Inline Editing System

### 2.1 Edit mode activation

- `useAdminEditMode()` hook checks auth state from `AuthContext`
- When admin is logged in and visits public routes (`/`, `/portfolio`, `/profile`), edit mode activates
- Floating toolbar at bottom-right: "편집 모드" toggle, "어드민으로 돌아가기" link
- Edit mode state stored in React context, not URL (avoids SEO issues)

### 2.2 EditableWrapper component

```typescript
interface EditableWrapperProps {
  children: React.ReactNode;
  entityType: 'section' | 'header' | 'footer' | 'text' | 'list';
  entityId: string;
  onEdit: () => void;
}
```

- Wraps any editable region
- On hover: shows blue dashed border + pencil icon badge (top-right)
- On click: triggers `onEdit` callback
- Only renders edit affordances when `useAdminEditMode()` returns true
- Non-admin visitors see zero changes (no extra DOM, no event listeners)

### 2.3 InlineEditToolbar — section-level

Appears above each section when in edit mode:
- Section name label
- Move up / Move down buttons
- Enable/Disable toggle
- Edit content button (opens section editor)
- Delete button (with confirmation)
- "+" button between sections to add new section

### 2.4 Content editing patterns

| Content type | Edit UI |
|-------------|---------|
| Single-line text (headline, title) | Click → contentEditable inline |
| Multi-line text (bio, description) | Click → textarea overlay at same position |
| List items (values, skills, experience) | Click → slide-over panel with add/remove/reorder |
| Image (avatar, thumbnail) | Click → URL input + Cloudinary upload |
| Custom section (markdown+HTML) | Click → CodeMirror/Monaco editor in slide-over |
| Header nav links | Click nav area → slide-over with link list editor |
| Footer social links | Click footer → slide-over with social link editor |

### 2.5 Auto-save

- Each field change: debounce 1 second, then PATCH to API
- **Request queue:** Only the latest pending state is sent. If a new edit arrives while a PATCH is in-flight, the in-flight request is NOT cancelled but the next PATCH sends the full latest `contentJson`. This prevents stale overwrites.
- Visual feedback: small "저장 중..." / "저장됨" indicator near edited element
- Optimistic updates: UI updates immediately, rolls back on API error
- No explicit save button needed for inline edits

### 2.6 Error handling UX

- **Save failure:** Toast notification at bottom-right ("저장에 실패했습니다. 다시 시도해주세요.") + field border turns red briefly
- **Field revert:** On API error, the contentEditable/textarea reverts to last-known-good value
- **Network disconnect:** Edit mode shows yellow "오프라인" badge; edits queue locally and flush on reconnect
- **Stale data:** If another tab updated the same section, the PATCH response returns fresh data and the UI reconciles

### 2.7 Platform requirements

Inline editing requires desktop (mouse hover for edit affordances). Mobile admin access redirects to the traditional admin panel at `/admin`. The inline edit FAB is hidden on viewports below 1024px.

---

## 3. Portfolio Kanban Management

### 3.1 ProjectsPage view modes

Top of page: tab bar with three modes:
- **리스트**: Enhanced list view (current + bulk actions)
- **칸반**: Kanban board
- **그리드 프리뷰**: Visual grid preview matching actual site

### 3.2 Kanban view

**Layout toggle:** Status view / Category view (top-right toggle)

**Status view columns:**
| Draft | Published | Featured |
|-------|-----------|----------|

- A project in "Featured" is also published (Featured is a subset of Published)

**State transition table:**
| Drag | isPublished | isFeatured |
|------|-------------|------------|
| Draft → Published | `true` | unchanged |
| Draft → Featured | `true` | `true` |
| Published → Featured | unchanged | `true` |
| Published → Draft | `false` | `false` |
| Featured → Published | unchanged | `false` |
| Featured → Draft | `false` | `false` |

**Category view columns:**
- One column per unique category + "미분류" column
- Dragging between columns changes `category`
- Columns are dynamically created from existing categories

**Card content:**
- Thumbnail (small), project name, year badge
- Published/Featured toggle switches on card
- Click card → open edit slide-over (same as current)

**Drag-and-drop:**
- Library: `@dnd-kit/core` + `@dnd-kit/sortable`
- Within-column drag: reorder (updates `sortOrder`)
- Cross-column drag: change status/category + place at drop position
- API call on drop: `PATCH /api/admin/projects/:id` for property change + `PUT /api/admin/projects/reorder` for order

### 3.3 Grid preview view

- Renders project cards in actual portfolio grid layout
- Top controls:
  - "랜딩 페이지" / "포트폴리오 페이지" tab
  - Column count slider: 1 ~ 4 (per tab)
- Cards are draggable within the grid to reorder
- Column setting auto-saves to `site_settings.portfolio_grid`
- Visual: identical to public `ProjectCard` component (reused)

### 3.4 List view enhancements

- Checkbox column for bulk selection
- Bulk action bar: "공개", "비공개", "삭제" buttons
- Existing per-row controls remain

---

## 4. Section Management

### 4.1 Adding sections

"+" button between sections (inline edit mode) or "섹션 추가" button (admin sections page) opens a modal:

**Tab 1 — 템플릿:**
- Grid of available template types with preview thumbnail and description
- Templates: Hero, Projects, Values, Skills, Experience (and future additions)
- Click to add with default content
- Each template type can exist multiple times (e.g., two "values" sections)

**Tab 2 — 커스텀:**
- Name input
- Markdown + HTML editor (CodeMirror with markdown/HTML syntax highlighting)
- Optional CSS editor
- Component shortcode reference panel (available shortcodes like `[project-grid]`, `[skill-bar]`, etc.)
- Live preview below editor

### 4.2 Removing sections

- Delete button on section toolbar (inline mode) or sections admin page
- Confirmation dialog: "이 섹션을 삭제하시겠습니까? 콘텐츠가 영구 삭제됩니다."
- Template sections: can be re-added from template picker
- Custom sections: deleted permanently

### 4.3 Section editing

**Template sections:**
- Inline editing for simple fields (title, text)
- Slide-over panel for complex fields (list items, skill categories)
- Each template type has a dedicated editor component

**Custom sections:**
- Full markdown+HTML editor in slide-over panel
- CSS editor tab
- Preview tab showing rendered output
- Shortcode insertion toolbar

### 4.4 Component shortcodes for custom sections

Available shortcodes rendered at display time:
```
[project-grid columns=3 max=6 featured-only]
[skill-bar name="React" level=90]
[icon name="code" size=24]
[divider]
[spacer height=40]
```

Rendered by a `ShortcodeRenderer` component that parses markdown, finds shortcode patterns, and replaces with React components.

---

## 5. Header & Footer Editing

### 5.1 Header

Editable in inline mode:
- **Site name**: click → inline text edit
- **Navigation links**: click nav area → slide-over panel
  - List of links with label + path
  - Add/remove/reorder with drag
  - Each link: text input for label, text input for path
- **Theme toggle**: checkbox to show/hide

Stored in `site_settings` key `'header'`.

### 5.2 Footer

Editable in inline mode:
- **Site name**: click → inline text edit
- **Social links**: click social area → slide-over panel
  - List of social links with type selector (GitHub, Instagram, Email, Twitter, LinkedIn) + URL input
  - Add/remove/reorder
- **Copyright text**: click → inline text edit

Stored in `site_settings` key `'footer'`.

---

## 6. API Changes

### 6.1 New endpoints

```
GET    /api/admin/settings              — Get all site settings
GET    /api/admin/settings/:key         — Get single setting
PUT    /api/admin/settings/:key         — Update single setting

GET    /api/public/settings/:key        — Get public setting (header, footer, portfolio_grid)

POST   /api/admin/sections              — Create new section (returns generated id)
DELETE /api/admin/sections/:id          — Delete section by id
PATCH  /api/admin/sections/:id          — Update section by id (including contentJson)
```

### 6.2 Modified endpoints

```
GET    /api/public/sections             — Now includes contentJson for rendering
PUT    /api/admin/sections              — Existing batch update (keep for reorder/toggle)
```

### 6.3 Public data changes

- `PublicSection` type gains `sectionType`, `templateKey`, `contentJson`
- Public sections endpoint returns content needed for rendering (no more hardcoded fallback)
- Header/footer settings available via public settings endpoint

---

## 7. Frontend Architecture

### 7.1 New components

```
src/app/components/
  inline-edit/
    EditableWrapper.tsx       — Hover/click edit affordance wrapper
    InlineEditToolbar.tsx     — Section-level toolbar
    InlineText.tsx            — Contenteditable text field
    EditModeProvider.tsx      — Edit mode context provider
    EditModeFAB.tsx           — Floating action button for edit mode toggle
    SectionAdder.tsx          — "+" button to add sections between existing ones

  section-editors/
    HeroEditor.tsx            — Hero section content editor
    ValuesEditor.tsx          — Values items editor (slide-over)
    SkillsEditor.tsx          — Skills categories editor (slide-over)
    ExperienceEditor.tsx      — Experience items editor (slide-over)
    ProjectsSectionEditor.tsx — Projects section settings editor
    CustomSectionEditor.tsx   — Markdown+HTML+CSS editor
    ShortcodeRenderer.tsx     — Renders shortcodes in custom sections

  kanban/
    KanbanBoard.tsx           — Main kanban container
    KanbanColumn.tsx          — Single column (status or category)
    KanbanCard.tsx            — Draggable project card
    KanbanViewToggle.tsx      — Status/Category view switcher

  portfolio-grid/
    GridPreview.tsx           — Grid preview with column slider
    GridColumnControl.tsx     — Column count slider component

  settings-editors/
    HeaderEditor.tsx          — Nav links editor (slide-over)
    FooterEditor.tsx          — Social links editor (slide-over)
```

### 7.2 Modified components

```
src/app/layouts/PublicLayout.tsx
  — Wrap with EditModeProvider when admin is authenticated
  — Header reads from site_settings instead of hardcoded NAV_LINKS
  — Wrap header/footer with EditableWrapper

src/app/components/Footer.tsx
  — Read from site_settings instead of profile social URLs

src/app/pages/landing/LandingPage.tsx
  — Render sections from contentJson instead of hardcoded components
  — Wrap each section with InlineEditToolbar when in edit mode
  — Show SectionAdder between sections when in edit mode

src/app/pages/landing/HeroSection.tsx
src/app/pages/landing/ValuesSection.tsx
src/app/pages/landing/SkillsSection.tsx
src/app/pages/landing/ExperienceSection.tsx
src/app/pages/landing/ProjectsSection.tsx
  — All receive content from props (contentJson) instead of hardcoded data
  — Wrap editable elements with EditableWrapper

src/app/pages/portfolio/PortfolioPage.tsx
  — Grid columns from site_settings.portfolio_grid.portfolioPageColumns

src/app/pages/admin/ProjectsPage.tsx
  — Complete rewrite: tabbed view (리스트/칸반/그리드 프리뷰)

src/app/pages/admin/SectionsPage.tsx
  — Enhanced: section content editing, add/remove, type management
```

### 7.3 New dependencies

- `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` — drag and drop
- `@codemirror/lang-markdown` + `@codemirror/lang-html` + `@codemirror/lang-css` — code editors for custom sections (or use a lighter alternative like `react-simple-code-editor` if bundle size is a concern)

---

## 8. Section Rendering Pipeline

Public section rendering flow:

```
DB (contentJson) → API (PublicSection with content) → LandingPage
  → switch(templateKey):
      'hero'       → <HeroSection content={parsed} />
      'projects'   → <ProjectsSection content={parsed} projects={projects} />
      'values'     → <ValuesSection content={parsed} />
      'skills'     → <SkillsSection content={parsed} />
      'experience' → <ExperienceSection content={parsed} />
      null (custom) → <CustomSection content={parsed} />
```

`CustomSection` component:
1. Parse shortcode patterns FIRST (before markdown) — extract and replace with placeholder tokens
2. Parse markdown to HTML (using `marked` or `react-markdown`)
3. Replace placeholder tokens with rendered React components
4. Apply scoped CSS via `<style>` tag with auto-generated class prefix (e.g., `.section-abc123 h1 { ... }`) — all user CSS selectors are prefixed at runtime using a simple regex rewriter
5. HTML sanitization: admin-authored HTML is **trusted** (single-admin site). No DOMPurify needed. If CMS is later multi-tenant, add DOMPurify at that point.
6. Render via `react-markdown` with custom components map for shortcode tokens

**Shortcode parse order rationale:** Parsing shortcodes before markdown prevents the markdown parser from wrapping block-level shortcodes like `[project-grid]` in `<p>` tags.

---

## 9. Data Migration

Bootstrap script (`db/bootstrap.ts`) additions:

1. Add new columns to `site_sections` (idempotent ALTER TABLE)
2. Create `site_settings` table
3. Populate existing sections with `section_type='template'`, `template_key`, and default `content_json` from current hardcoded values in `site-content.ts`
4. Populate `site_settings` with default header/footer/grid settings derived from current hardcoded values
5. Keep `site_profile` intact; social URLs remain there as well until full migration

---

## 10. Success Criteria

- All section content editable from admin (zero hardcoded content)
- Inline editing works on all public pages when logged in as admin
- Kanban board allows drag-and-drop project management with status/category views
- Grid preview shows actual portfolio layout with adjustable column count
- Custom sections can be created with markdown+HTML+CSS
- Header/footer fully configurable from admin
- Non-admin users see zero edit UI artifacts
- Existing functionality (auth, project CRUD, profile editing) unbroken
