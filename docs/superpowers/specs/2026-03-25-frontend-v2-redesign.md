# h4ppy-p1zza.com Frontend v2.0 Redesign

## Overview

Rewrite the entire frontend (landing page + admin dashboard) while keeping the existing backend, database, and API layer intact. The goal is a modern, bright, brand-forward portfolio site that showcases both projects and personal story, paired with a polished admin dashboard.

## Scope

**In scope:**
- All public pages: landing, portfolio, project detail, profile
- Admin dashboard: login, dashboard, projects, profile, sections
- Design system: colors, typography, spacing, components
- File structure reorganization
- Dark/light mode with manual toggle
- Responsive design (mobile-first)
- Animations (subtle, using `motion` library — import from `motion/react`)

**Out of scope:**
- Backend/API changes
- Database schema changes
- Authentication flow changes (GitHub OAuth stays as-is)
- Blog feature (remains placeholder — `/admin/blog` route exists but shows "Coming Soon")
- Cloudinary image upload UI (future enhancement)
- Analytics/visitor tracking

## Architecture

### File Structure

```
src/
├── app/
│   ├── App.tsx                      # Router setup
│   ├── layouts/
│   │   ├── PublicLayout.tsx          # Header + Footer wrapper
│   │   └── AdminLayout.tsx          # Sidebar + content area (moved from admin/)
│   ├── pages/
│   │   ├── landing/
│   │   │   ├── LandingPage.tsx      # Section orchestrator (dynamic from DB)
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── ValuesSection.tsx
│   │   │   ├── SkillsSection.tsx
│   │   │   └── ExperienceSection.tsx
│   │   ├── portfolio/
│   │   │   ├── PortfolioPage.tsx    # Full project grid + filtering
│   │   │   └── ProjectDetailPage.tsx
│   │   ├── profile/
│   │   │   └── ProfilePage.tsx
│   │   ├── admin/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── SectionsPage.tsx
│   │   │   └── BlogPage.tsx         # Placeholder "Coming Soon"
│   │   └── NotFoundPage.tsx         # 404 page (extracted from App.tsx)
│   ├── components/
│   │   ├── ui/                      # Shadcn primitives (button, card, badge, dropdown)
│   │   ├── ProjectCard.tsx          # Shared project card
│   │   ├── SectionHeading.tsx       # Consistent section titles
│   │   ├── ThemeToggle.tsx          # Dark/light switch
│   │   └── Footer.tsx
│   ├── hooks/
│   │   ├── usePublicData.ts         # Public API data fetching
│   │   └── useTheme.ts             # Theme state (localStorage + OS detection)
│   └── lib/
│       ├── api.ts                   # API client (existing, minimal changes)
│       └── types.ts                 # Public API response types
├── data/
│   └── site-content.ts              # Fallback data (existing, no changes)
└── styles/
    ├── index.css                    # Entry: imports fonts.css → tailwind.css → theme.css
    ├── fonts.css                    # @font-face declarations
    ├── tailwind.css                 # @import "tailwindcss" + source config (Tailwind v4 CSS-first)
    └── theme.css                    # Design tokens as CSS custom properties
```

### Design Principles

- Each file targets ~200 lines max
- Pages are thin orchestrators; visual logic lives in components
- Shared components (`ProjectCard`, `SectionHeading`) used across landing and portfolio
- API client and backend remain unchanged
- `LandingPage` dynamically renders sections based on `site_sections` table (enabled + sort_order)

### Routing

| Path | Component | Layout |
|------|-----------|--------|
| `/` | LandingPage | PublicLayout |
| `/portfolio` | PortfolioPage | PublicLayout |
| `/portfolio/:id` | ProjectDetailPage | PublicLayout |
| `/profile` | ProfilePage | PublicLayout |
| `/admin/login` | LoginPage | None |
| `/admin` | DashboardPage | AdminLayout (protected) |
| `/admin/projects` | ProjectsPage | AdminLayout (protected) |
| `/admin/profile` | ProfilePage | AdminLayout (protected) |
| `/admin/sections` | SectionsPage | AdminLayout (protected) |
| `/admin/blog` | BlogPage | AdminLayout (protected) |
| `*` | NotFoundPage | PublicLayout |

## Design System

### Colors

**Light mode (default):**
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#fafafa` | Page background |
| `--foreground` | `#1a1a2e` | Primary text |
| `--primary` | `#4f46e5` | Brand accent (links, buttons, highlights) |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--secondary` | `#f1f5f9` | Secondary backgrounds |
| `--secondary-foreground` | `#1a1a2e` | Text on secondary |
| `--muted` | `#f1f5f9` | Subtle backgrounds |
| `--muted-foreground` | `#6b7280` | Secondary text |
| `--accent` | `#eef2ff` | Accent backgrounds (indigo tint) |
| `--accent-foreground` | `#3730a3` | Text on accent |
| `--border` | `#e5e7eb` | Borders and dividers |
| `--card` | `#ffffff` | Card backgrounds |
| `--card-foreground` | `#1a1a2e` | Card text |
| `--destructive` | `#dc2626` | Error/delete actions |
| `--destructive-foreground` | `#ffffff` | Text on destructive |

**Dark mode:**
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0f0f1a` | Page background |
| `--foreground` | `#e5e7eb` | Primary text |
| `--primary` | `#818cf8` | Brand accent (lighter indigo) |
| `--primary-foreground` | `#0f0f1a` | Text on primary |
| `--secondary` | `#1e1e2e` | Secondary backgrounds |
| `--secondary-foreground` | `#e5e7eb` | Text on secondary |
| `--muted` | `#1e1e2e` | Subtle backgrounds |
| `--muted-foreground` | `#9ca3af` | Secondary text |
| `--accent` | `#1e1b4b` | Accent backgrounds |
| `--accent-foreground` | `#c7d2fe` | Text on accent |
| `--border` | `#2e2e3e` | Borders |
| `--card` | `#1a1a2e` | Card backgrounds |
| `--card-foreground` | `#e5e7eb` | Card text |
| `--destructive` | `#dc2626` | Error/delete actions |
| `--destructive-foreground` | `#fecaca` | Text on destructive |

### Typography

- **Korean:** Pretendard (modern, excellent readability)
- **English fallback:** Inter, system-ui
- **Scale:** Hero 48px / Section title 32px / Subtitle 20px / Body 16px / Small 14px
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing & Layout

- Max content width: `max-w-6xl` (1152px)
- Section vertical padding: `py-24` (96px)
- Card border radius: `rounded-xl` (12px)
- Component radius: `rounded-lg` (8px)
- Card shadow: `shadow-sm`, hover `shadow-md`

## Public Types

The public API returns a slightly different shape than admin types. Define public types in `src/app/lib/types.ts`:

```typescript
// Public project shape (from /api/public/projects)
export interface PublicProject {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  year: string;
  thumbnailUrl: string | null;
  longDescription: string | null;
  tags: string[];
  features: string[];
  techStack: string[];
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
}

// Public profile shape (from /api/public/profile)
export interface PublicProfile {
  displayName: string;
  headline: string;
  bioShort: string;
  avatarUrl: string;
  githubUrl: string;
  instagramUrl: string;
  email: string;
  essayMarkdown: string;
}

// Public section shape (from /api/public/sections)
export interface PublicSection {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  sortOrder: number;
}
```

## usePublicData Hook

Custom hook using `useState` + `useEffect` for data fetching. No external data-fetching library needed (the dataset is small and doesn't require caching/revalidation).

```typescript
interface UsePublicDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function usePublicData<T>(endpoint: string, fallback?: T): UsePublicDataReturn<T>
```

**Behavior:**
- Fetches from `/api/public/{endpoint}` on mount
- Returns `{ data, loading, error }`
- If fetch fails, falls back to `fallback` parameter (from `site-content.ts`) if provided
- `loading` is true during fetch, false after (success or failure)
- No refetching/polling — data is fetched once per page visit

**Usage examples:**
```typescript
const { data: projects, loading } = usePublicData<PublicProject[]>('projects');
const { data: profile, loading } = usePublicData<PublicProfile>('profile', DEFAULT_SITE_PROFILE);
const { data: sections, loading } = usePublicData<PublicSection[]>('sections', DEFAULT_SITE_SECTIONS);
```

## Public Layout (Header + Footer)

### Header

```
┌─────────────────────────────────────────────────────┐
│  h4ppy p1zza     Portfolio  Profile    [ThemeToggle] │
└─────────────────────────────────────────────────────┘
```

- Left: site name (link to `/`)
- Center-right: navigation links — Portfolio (`/portfolio`), Profile (`/profile`)
- Far right: `ThemeToggle` component (sun/moon icon)
- Mobile: hamburger menu → slide-down nav with links + theme toggle
- Sticky header with backdrop blur on scroll
- Active link highlighting via React Router

### Footer

```
┌─────────────────────────────────────────────────────┐
│  h4ppy p1zza    [GitHub] [Instagram] [Email]        │
│                                                     │
│  © 2026 h4ppy p1zza                                 │
└─────────────────────────────────────────────────────┘
```

## Landing Page

### Hero Section

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   h4ppy p1zza                          [avatar/     │
│   Full-stack Web Developer              decorative  │
│                                         element]    │
│   웹 애플리케이션 개발을 전문으로 하는                  │
│   개발자입니다...                                     │
│                                                     │
│   [포트폴리오 보기]  [프로필]                          │
│                                                     │
│                    ↓ scroll                          │
└─────────────────────────────────────────────────────┘
```

- Two-column layout (text left, visual right), stacks on mobile
- Subtle gradient or dot pattern background
- CTA buttons: primary (filled) + secondary (outlined)
- Scroll indicator at bottom

### Projects Section

```
┌─────────────────────────────────────────────────────┐
│  Featured Projects                    전체 보기 →    │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ thumbnail│  │ thumbnail│  │ thumbnail│         │
│  │          │  │          │  │          │         │
│  │ [badge]  │  │ [badge]  │  │ [badge]  │         │
│  │ Name     │  │ Name     │  │ Name     │         │
│  │ desc...  │  │ desc...  │  │ desc...  │         │
│  │ #tag #tag│  │ #tag #tag│  │ #tag #tag│         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
```

- 3-column grid (2 on tablet, 1 on mobile)
- **Client-side filtering**: fetch all published projects via `/api/public/projects`, filter by `isFeatured === true` in the component
- Card: thumbnail (aspect-video) + category badge + name + description + tags
- Hover: card lifts with shadow transition
- "전체 보기" links to `/portfolio`
- **Missing thumbnail fallback**: show a placeholder gradient with the project name centered

### Values / Skills / Experience Sections

- Rendered dynamically based on `site_sections` (enabled + sort_order)
- Each section: `SectionHeading` + content grid
- Values: 3-column icon + title + description cards
- Skills: grouped badges or icon grid by category
- Experience: timeline or card list
- Content is currently hardcoded in the component; sections table controls visibility/order only

## Portfolio Page (`/portfolio`)

```
┌─────────────────────────────────────────────────────┐
│  Projects                                           │
│                                                     │
│  [All] [Websites] [Apps] [Tools] [Games]            │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ card     │  │ card     │  │ card     │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ card     │  │ card     │  │ card     │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
```

- Top: page title + category filter pills
- Same `ProjectCard` component as landing page
- Client-side filtering by `category` field
- All published projects shown (not just featured)
- Animated filter transitions

## Project Detail Page (`/portfolio/:id`)

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Portfolio                                │
│                                                     │
│  ┌───────────────────────────────────────────┐      │
│  │            Large Thumbnail                │      │
│  │    (placeholder gradient if missing)      │      │
│  └───────────────────────────────────────────┘      │
│                                                     │
│  Project Name                        [Visit Site →] │
│  [Category] [Year]                                  │
│                                                     │
│  Description text...                                │
│                                                     │
│  Tech Stack: [React] [TypeScript] [Tailwind]        │
│                                                     │
│  Features:                                          │
│  • Feature 1                                        │
│  • Feature 2                                        │
│                                                     │
│  ┌─ Previous          Next ─┐                       │
│  │  Project Name      Project Name                  │
│  └────────────────────────────┘                     │
└─────────────────────────────────────────────────────┘
```

## Profile Page (`/profile`)

```
┌─────────────────────────────────────────────────────┐
│           [Avatar]                                  │
│         h4ppy p1zza                                 │
│    Full-stack Web Developer                         │
│    [GitHub] [Instagram] [Email]                     │
│                                                     │
│  ─────────────────────────────                      │
│                                                     │
│  Essay content rendered with custom parser:          │
│  Split on "## " headings into titled sections,      │
│  render paragraphs between headings as <p> tags.    │
│  No markdown library needed — same approach as      │
│  current code (simple string splitting).            │
│                                                     │
│  max-w-3xl centered                                 │
└─────────────────────────────────────────────────────┘
```

**Markdown rendering approach:** The essay uses only `##` headings and plain paragraphs. A custom parser splits on `## ` to extract section titles and body text. No external markdown library needed — this matches the current implementation pattern.

## Admin Dashboard

### Layout

```
┌──────────┬──────────────────────────────────────────┐
│ SIDEBAR  │  MAIN CONTENT                            │
│ 260px    │                                          │
│          │                                          │
│ [Logo]   │  Page-specific content                   │
│          │                                          │
│ Dashboard│                                          │
│ Projects │                                          │
│ Profile  │                                          │
│ Sections │                                          │
│ Blog(off)│                                          │
│          │                                          │
│ ──────── │                                          │
│ [User]   │                                          │
│ [Logout] │                                          │
└──────────┴──────────────────────────────────────────┘
```

- Same design tokens as public site (unified brand)
- Sidebar collapses to hamburger on mobile
- Navigation highlights active page
- User card at bottom with avatar + name + logout

### Dashboard Page

The API (`/api/admin/dashboard`) returns `{ projectsTotal, projectsPublished, projectsDraft, sectionsTotal, recentActivity: [] }`.

```
┌──────────────────────────────────────────────────────┐
│  Dashboard                                           │
│                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │ Total│ │Publi-│ │ Draft│ │Secti-│               │
│  │  23  │ │shed  │ │      │ │ons   │               │
│  │      │ │  18  │ │   5  │ │   5  │               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                      │
│  Quick Actions                                       │
│  [+ New Project]  [Edit Profile]  [View Site →]      │
│                                                      │
│  Recent Activity                                     │
│  (empty state: "No recent activity" placeholder)     │
│  (API currently returns [], show graceful empty)     │
└──────────────────────────────────────────────────────┘
```

### Projects Page

- Search bar + category filter + "New Project" button
- Table/list view with: mini thumbnail (placeholder if missing), name, category, status toggles, action buttons
- Edit via slide-over panel (right side, 480px)
- Reordering via up/down buttons (keep simple — no drag-and-drop library needed for v2.0)
- Bulk status toggles

### Profile Editor

- Two-column: form (left) / live preview (right)
- Completeness percentage indicator
- Markdown textarea with preview toggle for essay
- Form fields: display name, headline, short bio, avatar URL, links

### Sections Manager

- Card-based list with up/down buttons for reordering
- Toggle switch on each card for enabled/disabled
- Section name + description display
- Visual indicator for current sort order

### Login Page

- Centered card on subtle background
- Site logo/name at top
- Single "GitHub로 로그인" button
- Clean and minimal

## Loading, Error, and Empty States

All pages must handle three states gracefully:

**Loading:**
- Skeleton placeholders matching the layout shape
- No layout shift when data arrives

**Error (API failure):**
- Public pages: fall back to `site-content.ts` defaults silently
- Admin pages: show error message with retry button

**Empty:**
- Portfolio with no projects: "No projects yet" message
- Project detail not found: redirect to `/portfolio` or show 404
- Dashboard recent activity empty: "No recent activity" placeholder
- Missing thumbnail: gradient placeholder with project initial or name

## Animations

Using the existing `motion` library (import from `motion/react`):

- **Page transitions:** fade-in + slide-up on route change (150ms)
- **Section reveal:** intersection observer triggers, staggered children (50ms delay each)
- **Card hover:** `scale(1.02)` + shadow increase (200ms ease)
- **Filter transitions:** layout animation on category change
- **Admin:** subtle fade transitions between pages, no heavy animations

## Dark Mode Implementation

- `useTheme` hook manages state in `localStorage` key `theme`
- Default: `light` (falls back to OS preference on first visit via `prefers-color-scheme`)
- Manual toggle overrides OS preference
- `.dark` class on `<html>` element (matches current Tailwind v4 custom variant: `@custom-variant dark (&:is(.dark *))`)
- `ThemeToggle` component: sun/moon icon button in header

## CSS Architecture

The existing Tailwind v4 CSS-first setup is maintained:

- `index.css` → imports `fonts.css`, `tailwind.css`, `theme.css` (in that order)
- `tailwind.css` → `@import "tailwindcss"` + `@source` directives
- `theme.css` → CSS custom properties in `:root` and `.dark`, `@theme inline` block mapping to Tailwind, `@layer base` for element defaults
- All design token changes happen in `theme.css` only

## Data Flow

```
Public Pages:
  usePublicData hook → fetch /api/public/* → render with fallback from site-content.ts
  Featured projects: fetch all → client-side filter isFeatured === true

Admin Pages:
  AuthContext → check /api/auth/session → ProtectedRoute gate
  Admin API calls (src/app/admin/services/api.ts) → /api/admin/* → CRUD operations
```

No changes to the API contract. The frontend consumes the same endpoints with the same request/response shapes.

## Migration Strategy

1. Update `theme.css` with new design tokens (colors, typography)
2. Add Pretendard font to `fonts.css`
3. Create shared components (`ProjectCard`, `SectionHeading`, `ThemeToggle`, `Footer`)
4. Create `usePublicData` and `useTheme` hooks
5. Create `PublicLayout` (header + footer)
6. Build public pages: Landing → Portfolio → Project Detail → Profile
7. Move `AdminLayout.tsx` from `src/app/admin/` to `src/app/layouts/`
8. Rebuild admin pages: Login → Dashboard → Projects → Profile → Sections
9. Update `App.tsx` routing to point to new pages
10. Remove old files (`portfolio-layout.tsx`, `profile-page.tsx`)
11. Test all pages, responsive breakpoints, dark mode

## Files to Delete After Migration

- `src/app/components/portfolio-layout.tsx` (1249-line monolith)
- `src/app/components/profile-page.tsx` (replaced by new ProfilePage)
- `src/app/admin/AdminCallback.tsx` (already deleted in git)
- `src/config/env.ts` (already deleted)
- `src/security/csp.ts` (already deleted)

## Files to Keep Unchanged

- `server/**/*` (all backend code)
- `db/**/*` (schema and migrations)
- `src/data/site-content.ts` (fallback data)
- `src/app/admin/AuthContext.tsx` (auth state — minor styling updates only)
- `src/app/admin/ProtectedRoute.tsx` (route guard — no changes)
- `src/app/admin/services/api.ts` (API client — no changes)
- `src/app/admin/types.ts` (TypeScript interfaces — no changes)
- `src/app/components/ui/*` (Shadcn primitives — keep and extend)
