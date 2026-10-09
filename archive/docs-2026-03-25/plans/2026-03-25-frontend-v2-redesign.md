# Frontend v2.0 Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the entire frontend (landing page + admin dashboard) with a modern, bright design system while keeping the backend/API layer unchanged.

**Architecture:** Component-per-file structure with shared `ProjectCard`, `SectionHeading`, `ThemeToggle`, and `Footer` components. Public pages wrap in `PublicLayout` (header + footer); admin pages wrap in `AdminLayout` (sidebar). Data flows through `usePublicData` hook for public pages and existing `api.ts` service for admin pages.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Motion (animation), Lucide React (icons), Radix UI (primitives), CVA (variants)

**Spec document:** `docs/superpowers/specs/2026-03-25-frontend-v2-redesign.md`

---

## File Map

### New Files to Create

| File | Responsibility |
|------|---------------|
| `src/app/lib/types.ts` | Public API response types |
| `src/app/hooks/useTheme.ts` | Dark/light theme state management |
| `src/app/hooks/usePublicData.ts` | Public API data fetching hook |
| `src/app/components/ThemeToggle.tsx` | Sun/moon toggle button |
| `src/app/components/SectionHeading.tsx` | Consistent section title + subtitle |
| `src/app/components/ProjectCard.tsx` | Shared project card with thumbnail |
| `src/app/components/Footer.tsx` | Site footer with links |
| `src/app/layouts/PublicLayout.tsx` | Header + Footer wrapper for public pages |
| `src/app/layouts/AdminLayout.tsx` | Sidebar + content for admin pages (rewrite) |
| `src/app/pages/landing/LandingPage.tsx` | Section orchestrator (dynamic from DB) |
| `src/app/pages/landing/HeroSection.tsx` | Hero with name, headline, CTAs |
| `src/app/pages/landing/ProjectsSection.tsx` | Featured projects grid |
| `src/app/pages/landing/ValuesSection.tsx` | Core values cards |
| `src/app/pages/landing/SkillsSection.tsx` | Tech stack display |
| `src/app/pages/landing/ExperienceSection.tsx` | Work experience section |
| `src/app/pages/portfolio/PortfolioPage.tsx` | Full project grid + category filter |
| `src/app/pages/portfolio/ProjectDetailPage.tsx` | Individual project detail |
| `src/app/pages/profile/ProfilePage.tsx` | About page with essay |
| `src/app/pages/admin/LoginPage.tsx` | GitHub OAuth login (rewrite) |
| `src/app/pages/admin/DashboardPage.tsx` | Stats + quick actions (rewrite) |
| `src/app/pages/admin/ProjectsPage.tsx` | Project CRUD (rewrite) |
| `src/app/pages/admin/ProfilePage.tsx` | Profile editor (rewrite) |
| `src/app/pages/admin/SectionsPage.tsx` | Section manager (rewrite) |
| `src/app/pages/admin/BlogPage.tsx` | Coming soon placeholder |
| `src/app/pages/NotFoundPage.tsx` | 404 page |

### Files to Modify

| File | Changes |
|------|---------|
| `src/styles/theme.css` | New design tokens (colors, sidebar vars) |
| `src/styles/fonts.css` | Replace Noto Sans KR with Pretendard + Inter |
| `src/app/App.tsx` | New routing to new page components |
| `index.html` | Update theme-color meta tag |

### Files to Delete (after migration)

| File | Reason |
|------|--------|
| `src/app/components/portfolio-layout.tsx` | Replaced by page-per-file structure |
| `src/app/components/profile-page.tsx` | Replaced by `pages/profile/ProfilePage.tsx` |
| `src/app/admin/AdminLayout.tsx` | Moved to `layouts/AdminLayout.tsx` |
| `src/app/admin/AdminLogin.tsx` | Replaced by `pages/admin/LoginPage.tsx` |
| `src/app/admin/pages/DashboardPage.tsx` | Replaced by `pages/admin/DashboardPage.tsx` |
| `src/app/admin/pages/ProjectsPage.tsx` | Replaced by `pages/admin/ProjectsPage.tsx` |
| `src/app/admin/pages/ProfilePage.tsx` | Replaced by `pages/admin/ProfilePage.tsx` |
| `src/app/admin/pages/SectionsPage.tsx` | Replaced by `pages/admin/SectionsPage.tsx` |
| `src/app/admin/pages/BlogPage.tsx` | Replaced by `pages/admin/BlogPage.tsx` |

### Files Unchanged

| File | Reason |
|------|--------|
| `server/**/*` | Backend stays as-is |
| `db/**/*` | Database stays as-is |
| `src/data/site-content.ts` | Fallback data |
| `src/app/admin/AuthContext.tsx` | Auth context (consumed, not modified) |
| `src/app/admin/ProtectedRoute.tsx` | Route guard (consumed, not modified) |
| `src/app/admin/services/api.ts` | API client at existing path (consumed, not modified — note: spec diagram shows `src/app/lib/api.ts` but actual location is `src/app/admin/services/api.ts`) |
| `src/app/admin/types.ts` | Admin types (consumed, not modified) |
| `src/app/components/ui/*` | Shadcn primitives (kept, used as-is) |

---

## Task Dependencies

```
Task 1 (Design System) → Task 2 (Types & Hooks) → Task 3 (Shared Components)
                                                        ↓
Task 4 (PublicLayout) depends on Task 3
Tasks 5, 6, 7 (Landing sections) depend on Task 3 — CAN RUN IN PARALLEL
Task 8 (LandingPage) depends on Tasks 5, 6, 7
Tasks 9, 10, 11, 12 (Portfolio, Detail, Profile, 404) depend on Task 3 — CAN RUN IN PARALLEL
Task 13 (AdminLayout) depends on Task 1
Tasks 14-19 (Admin pages) depend on Task 13 — CAN RUN IN PARALLEL
Task 20 (Routing) depends on ALL above
Task 21 (Cleanup) depends on Task 20
Task 22 (QA) depends on Task 21
```

---

## Task 1: Design System Foundation

**Files:**
- Modify: `src/styles/fonts.css`
- Modify: `src/styles/theme.css`
- Modify: `index.html` (theme-color meta tag)

- [ ] **Step 1: Update fonts.css — replace Noto Sans KR with Pretendard + Inter**

Replace the Google Fonts import with Pretendard CDN and Inter. Pretendard is served from the CDN at `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css`.

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

- [ ] **Step 2: Update theme.css — new color tokens, typography, sidebar vars, and @theme inline block**

Replace all CSS custom properties in `:root` and `.dark` with the new design tokens from the spec. **Also update the `@theme inline` block** that maps CSS custom properties to Tailwind theme values — every token added/renamed in `:root` must have a corresponding `--color-*` mapping in `@theme inline`.

Key changes:
- `:root` background: `#ffffff` → `#fafafa`
- Primary: `#030213` → `#4f46e5` (indigo accent)
- Foreground: `oklch(0.145 0 0)` → `#1a1a2e`
- Add missing tokens: `--card-foreground`, `--destructive-foreground` (both in `:root`, `.dark`, AND `@theme inline`)
- Dark mode: complete token set matching spec (all 15 tokens)
- Font family in `@layer base`: `'Pretendard Variable', Pretendard, Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif`
- Sidebar tokens updated for new palette

- [ ] **Step 3: Update index.html — theme-color and preconnect hints**

Change `<meta name="theme-color" content="#030213">` to `<meta name="theme-color" content="#4f46e5">`.
Add preconnect for jsdelivr CDN: `<link rel="preconnect" href="https://cdn.jsdelivr.net">`.
Keep existing Google Fonts preconnect (still used for Inter).

- [ ] **Step 4: Verify dev server still works**

Run: `npm run dev:web`
Expected: Vite dev server starts, page loads with updated colors/fonts. Existing components should render with new palette.

- [ ] **Step 5: Verify Tailwind source directive covers new paths**

Check `src/styles/tailwind.css` — the `@source` directive should be `'../**/*.{js,ts,jsx,tsx}'` which covers all subdirectories of `src/`. New paths like `src/app/pages/**` and `src/app/layouts/**` are already covered since they're under `src/`. No changes needed, but verify.

- [ ] **Step 6: Commit**

```
git add src/styles/fonts.css src/styles/theme.css index.html
git commit -m "feat: update design system tokens — new colors, Pretendard font, indigo accent"
```

---

## Task 2: Public Types & Hooks

**Files:**
- Create: `src/app/lib/types.ts`
- Create: `src/app/hooks/useTheme.ts`
- Create: `src/app/hooks/usePublicData.ts`

- [ ] **Step 1: Create public API types**

Create `src/app/lib/types.ts` with `PublicProject`, `PublicProfile`, and `PublicSection` interfaces matching the spec exactly. These types correspond to the shapes returned by `/api/public/*` endpoints (see `server/lib/content.ts` mapper functions).

These types must match the exact shapes returned by `server/lib/content.ts` mapper functions. The server uses `?? ''` for null coalescing, so string fields are never null. Timestamps are included.

```typescript
// Matches mapProject() in server/lib/content.ts
export interface PublicProject {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  year: string;
  thumbnailUrl: string;       // server defaults to '' via ?? ''
  thumbnail: string;          // alias field, same as thumbnailUrl
  longDescription: string;    // server defaults to '' via ?? ''
  tags: string[];
  features: string[];
  techStack: string[];
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string | null;   // ISO timestamp or null
  updatedAt: string | null;   // ISO timestamp or null
}

// Matches mapProfile() in server/lib/content.ts
export interface PublicProfile {
  id: string;                  // always 'primary'
  displayName: string;
  headline: string;
  bioShort: string;
  avatarUrl: string;
  githubUrl: string;
  instagramUrl: string;
  email: string;
  essayMarkdown: string;
  updatedAt: string;
}

// Matches mapSection() in server/lib/content.ts
export interface PublicSection {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  sortOrder: number;
  updatedAt: string;
}
```

**Note on fallback data compatibility:** `DEFAULT_SITE_PROFILE` from `src/data/site-content.ts` has type `SiteProfileContent` which lacks `id` and `updatedAt`. When using as fallback in `usePublicData`, cast with `as unknown as PublicProfile` or create a mapped fallback that adds the missing fields (e.g., `{ ...DEFAULT_SITE_PROFILE, id: 'primary', updatedAt: '' }`).

- [ ] **Step 2: Create useTheme hook**

Create `src/app/hooks/useTheme.ts`:
- Read initial theme from `localStorage` key `theme`
- If no stored preference, detect OS via `window.matchMedia('(prefers-color-scheme: dark)')`
- Default to `'light'`
- Toggle function switches between `'light'` and `'dark'`
- Apply/remove `.dark` class on `document.documentElement`
- Return `{ theme, toggleTheme, isDark }`

- [ ] **Step 3: Create usePublicData hook**

Create `src/app/hooks/usePublicData.ts`:
- Generic hook: `usePublicData<T>(endpoint: string, fallback?: T)`
- Fetches from `/api/public/${endpoint}` on mount
- Returns `{ data: T | null, loading: boolean, error: string | null }`
- On fetch failure, uses `fallback` if provided
- Uses `credentials: 'include'` for consistency with existing API pattern

- [ ] **Step 4: Commit**

```
git add src/app/lib/types.ts src/app/hooks/useTheme.ts src/app/hooks/usePublicData.ts
git commit -m "feat: add public types and useTheme/usePublicData hooks"
```

---

## Task 3: Shared Components

**Files:**
- Create: `src/app/components/ThemeToggle.tsx`
- Create: `src/app/components/SectionHeading.tsx`
- Create: `src/app/components/ProjectCard.tsx`
- Create: `src/app/components/Footer.tsx`

- [ ] **Step 1: Create ThemeToggle component**

Sun/moon icon button using Lucide's `Sun` and `Moon` icons. Consumes `useTheme` hook. Renders as a ghost-variant button with icon swap + subtle rotation animation.

**Motion import:** Use `import { motion, AnimatePresence } from 'motion/react'` (not `framer-motion` or `motion` — the package is `motion` but the React import path is `motion/react`). This applies to ALL components using animation throughout this plan.

- [ ] **Step 2: Create SectionHeading component**

Props: `title: string`, `subtitle?: string`, `action?: ReactNode` (for "전체 보기 →" links).
Renders: `<div>` with title in `text-3xl font-semibold`, optional subtitle in `text-muted-foreground`, action aligned right on desktop.

- [ ] **Step 3: Create ProjectCard component**

Props: `project: PublicProject`, `onClick?: () => void`
Renders: Card with aspect-video thumbnail area (gradient placeholder if `thumbnailUrl` is empty string `''`), category badge, project name, description (1-line truncated), tags as small badges. Hover effect: `scale(1.02)` + shadow increase via `motion.div` from `motion/react`.

- [ ] **Step 4: Create Footer component**

Props: `profile?: PublicProfile`
Renders: site name, social links (GitHub, Instagram, Email) as icon buttons, copyright line. Uses Lucide icons: `Github`, `Instagram`, `Mail`.

- [ ] **Step 5: Commit**

```
git add src/app/components/ThemeToggle.tsx src/app/components/SectionHeading.tsx src/app/components/ProjectCard.tsx src/app/components/Footer.tsx
git commit -m "feat: add shared components — ThemeToggle, SectionHeading, ProjectCard, Footer"
```

---

## Task 4: Public Layout

**Files:**
- Create: `src/app/layouts/PublicLayout.tsx`

- [ ] **Step 1: Create PublicLayout with Header + Footer**

The layout wraps all public pages with:
- **Header:** sticky, backdrop-blur, contains: site name link (`/`), nav links (Portfolio `/portfolio`, Profile `/profile`), ThemeToggle. Mobile: hamburger menu (Lucide `Menu` / `X` icons) with slide-down nav panel.
- **Main:** `<main>` with `min-h-screen`
- **Footer:** Footer component

Uses `usePublicData` to fetch profile (for Footer social links) with a mapped fallback from `DEFAULT_SITE_PROFILE` (add missing `id` and `updatedAt` fields — see Task 2 note on fallback compatibility). Import from `src/data/site-content.ts`. Uses React Router `Link`, `Outlet`, and `useLocation` for active link highlighting. The `<Outlet />` renders the matched child route component.

- [ ] **Step 2: Verify layout renders**

Temporarily update `App.tsx` to wrap a test route with `PublicLayout`. Check: header renders, nav links work, theme toggle switches dark/light, mobile hamburger works, footer renders.

- [ ] **Step 3: Commit**

```
git add src/app/layouts/PublicLayout.tsx
git commit -m "feat: add PublicLayout with sticky header, nav, and footer"
```

---

## Task 5: Landing Page — Hero Section

**Files:**
- Create: `src/app/pages/landing/HeroSection.tsx`

- [ ] **Step 1: Create HeroSection**

Props: `profile: PublicProfile`
Two-column layout:
- Left: display name (`text-5xl font-bold`), headline (`text-xl text-muted-foreground`), bio short, two CTA buttons (Link to `/portfolio` as primary, Link to `/profile` as outline)
- Right: avatar image with rounded styling or decorative gradient element
- Background: subtle dot pattern or gradient
- Stacks to single column on mobile (`flex-col` on `md:flex-row`)
- Entry animation: fade-in + slide-up via Motion

- [ ] **Step 2: Commit**

```
git add src/app/pages/landing/HeroSection.tsx
git commit -m "feat: add landing page hero section"
```

---

## Task 6: Landing Page — Projects Section

**Files:**
- Create: `src/app/pages/landing/ProjectsSection.tsx`

- [ ] **Step 1: Create ProjectsSection**

Props: `projects: PublicProject[]`
- Filters `projects.filter(p => p.isFeatured)` client-side
- `SectionHeading` with title "Featured Projects" and action `<Link to="/portfolio">전체 보기 →</Link>`
- 3-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`)
- Maps filtered projects to `ProjectCard` components
- Each card wraps in `Link` to `/portfolio/${project.id}`
- Staggered reveal animation via Motion

- [ ] **Step 2: Commit**

```
git add src/app/pages/landing/ProjectsSection.tsx
git commit -m "feat: add landing page featured projects section"
```

---

## Task 7: Landing Page — Values, Skills, Experience Sections

**Files:**
- Create: `src/app/pages/landing/ValuesSection.tsx`
- Create: `src/app/pages/landing/SkillsSection.tsx`
- Create: `src/app/pages/landing/ExperienceSection.tsx`

- [ ] **Step 1: Create ValuesSection**

Hardcoded content (matching current site). 3-column grid of cards, each with Lucide icon + title + description. Values: "사용자 중심", "실용적 해결", "지속적 성장" (or similar from current portfolio-layout.tsx content). Uses `SectionHeading`.

- [ ] **Step 2: Create SkillsSection**

Hardcoded content. Grouped by category (Frontend, Backend, Tools). Each category shows name + badges for individual skills. Uses `SectionHeading`.

- [ ] **Step 3: Create ExperienceSection**

Hardcoded content. Timeline or card list showing key career milestones (journalist → content creator → marketer → finance → developer). Uses `SectionHeading`.

- [ ] **Step 4: Commit**

```
git add src/app/pages/landing/ValuesSection.tsx src/app/pages/landing/SkillsSection.tsx src/app/pages/landing/ExperienceSection.tsx
git commit -m "feat: add landing page values, skills, and experience sections"
```

---

## Task 8: Landing Page — Orchestrator

**Files:**
- Create: `src/app/pages/landing/LandingPage.tsx`

- [ ] **Step 1: Create LandingPage orchestrator**

Fetches data via `usePublicData`:
- `usePublicData<PublicProject[]>('projects')` — for projects section
- `usePublicData<PublicProfile>('profile', mappedProfileFallback)` — for hero (create mapped fallback from `DEFAULT_SITE_PROFILE` with `id: 'primary'` and `updatedAt: ''`)
- `usePublicData<PublicSection[]>('sections', mappedSectionsFallback)` — for dynamic section rendering (map `DEFAULT_SITE_SECTIONS` to add `updatedAt: ''` to each)

Renders `HeroSection` always. Then iterates over `sections.filter(s => s.enabled).sort((a, b) => a.sortOrder - b.sortOrder)` and renders the matching component for each `section.key`:
- `'projects'` → `ProjectsSection`
- `'values'` → `ValuesSection`
- `'skills'` → `SkillsSection`
- `'experience'` → `ExperienceSection`

Loading state: skeleton placeholders. Error state: renders with fallback data.

- [ ] **Step 2: Commit**

```
git add src/app/pages/landing/LandingPage.tsx
git commit -m "feat: add LandingPage orchestrator with dynamic section rendering"
```

---

## Task 9: Portfolio Page

**Files:**
- Create: `src/app/pages/portfolio/PortfolioPage.tsx`

- [ ] **Step 1: Create PortfolioPage**

Fetches all published projects via `usePublicData<PublicProject[]>('projects')`.
- Page title: "Projects"
- Category filter pills: extract unique categories from projects, add "All" option
- Active filter state via `useState<string>('All')`
- Filter logic: `category === 'All' ? projects : projects.filter(p => p.category === category)`
- Grid: same 3-column layout as landing projects
- Each card links to `/portfolio/${project.id}`
- Motion `LayoutGroup` for animated filter transitions
- Loading: skeleton grid. Empty: "No projects yet" message.

- [ ] **Step 2: Commit**

```
git add src/app/pages/portfolio/PortfolioPage.tsx
git commit -m "feat: add portfolio page with category filtering"
```

---

## Task 10: Project Detail Page

**Files:**
- Create: `src/app/pages/portfolio/ProjectDetailPage.tsx`

- [ ] **Step 1: Create ProjectDetailPage**

Uses `useParams()` to get project ID. Fetches single project via `` usePublicData<PublicProject>(`projects/${id}`) `` (template literal with backticks, not single quotes). Also fetches all projects for prev/next navigation. The `/api/public/projects/:id` endpoint returns a single project object (not an array).

Layout:
- Back link: `← Back to Portfolio` linking to `/portfolio`
- Large thumbnail (full width, aspect-video, gradient placeholder if null)
- Project name (`text-4xl font-bold`) + external link button (`ExternalLink` icon)
- Category badge + year
- Description text
- Tech stack as badges
- Features as bullet list
- Prev/Next navigation at bottom

Loading: skeleton layout. Not found: redirect to `/portfolio` or show message.

- [ ] **Step 2: Commit**

```
git add src/app/pages/portfolio/ProjectDetailPage.tsx
git commit -m "feat: add project detail page with prev/next navigation"
```

---

## Task 11: Profile Page

**Files:**
- Create: `src/app/pages/profile/ProfilePage.tsx`

- [ ] **Step 1: Create ProfilePage**

Fetches profile via `usePublicData<PublicProfile>('profile', mappedProfileFallback)` (same mapped fallback pattern as LandingPage — import `DEFAULT_SITE_PROFILE` from `src/data/site-content.ts` and add `id: 'primary'`, `updatedAt: ''`).

Layout (`max-w-3xl mx-auto`):
- Top: avatar (rounded-full, 120px), display name, headline, social link icons
- Divider
- Essay: custom parser splits `essayMarkdown` on `\n## ` into sections. Each section gets an `<h2>` title and `<p>` paragraphs. Paragraphs split on `\n\n`.
- Fade-in animation on content

- [ ] **Step 2: Commit**

```
git add src/app/pages/profile/ProfilePage.tsx
git commit -m "feat: add profile page with essay rendering"
```

---

## Task 12: NotFoundPage

**Files:**
- Create: `src/app/pages/NotFoundPage.tsx`

- [ ] **Step 1: Create NotFoundPage**

Simple centered layout: "404" heading, "Page not found" message, link back to home. Uses PublicLayout styling.

- [ ] **Step 2: Commit**

```
git add src/app/pages/NotFoundPage.tsx
git commit -m "feat: add 404 not found page"
```

---

## Task 13: Admin Layout

**Files:**
- Create: `src/app/layouts/AdminLayout.tsx`

- [ ] **Step 1: Create new AdminLayout**

Sidebar (260px) + main content area.

Sidebar contents:
- Top: site name/logo
- Nav items: Dashboard (`LayoutDashboard`), Projects (`FolderKanban`), Profile (`User`), Sections (`Layers`), Blog (`FileText`, disabled/dimmed) — all using Lucide icons
- Active item highlighted with `bg-accent text-accent-foreground`
- Bottom: user card (avatar + display name) + logout button
- Mobile: hamburger toggle, sidebar slides in as overlay

Main area: white background (`bg-background`), `p-6 lg:p-8`, renders `<Outlet />` from `react-router-dom`. This is a key architectural change from the old admin routing: the old `AdminLayout` handled its own internal routes via `Routes`/`Route`; the new one uses React Router's nested `<Outlet />` pattern where child routes are defined in `App.tsx`.

Consumes `useAuth()` from existing `AuthContext` (`src/app/admin/AuthContext.tsx`). Uses `useLocation()` for active link highlighting.

- [ ] **Step 2: Commit**

```
git add src/app/layouts/AdminLayout.tsx
git commit -m "feat: add new AdminLayout with sidebar navigation"
```

---

## Task 14: Admin Login Page

**Files:**
- Create: `src/app/pages/admin/LoginPage.tsx`

- [ ] **Step 1: Create LoginPage**

Centered card on subtle background.
- Site name at top
- "관리자 로그인" heading
- GitHub login button (calls `startLogin()` from existing `api.ts` which redirects to `/api/auth/github/start`)
- Minimal, uses existing Card + Button components
- If already authenticated (check `useAuth()`), redirect to `/admin`

- [ ] **Step 2: Commit**

```
git add src/app/pages/admin/LoginPage.tsx
git commit -m "feat: add admin login page"
```

---

## Task 15: Admin Dashboard Page

**Files:**
- Create: `src/app/pages/admin/DashboardPage.tsx`

- [ ] **Step 1: Create DashboardPage**

Fetches dashboard data via `getDashboard()` from existing `api.ts`.

Layout:
- Page title: "Dashboard"
- 4 stat cards in a grid. **Important:** stats are nested under `data.stats`, not top-level. Access: `data.stats.projectsTotal`, `data.stats.projectsPublished`, `data.stats.projectsDraft`, `data.stats.sectionsTotal`. The response type is `AdminDashboardResponse = { stats: AdminDashboardStats; recentActivity?: AdminActivity[] }`. Each card uses Lucide icon + number + label.
- Quick Actions: 3 buttons — "New Project" (link to `/admin/projects`), "Edit Profile" (link to `/admin/profile`), "View Site" (external link to `/`)
- Recent Activity: list from `recentActivity` array. Empty state: "No recent activity" placeholder.

- [ ] **Step 2: Commit**

```
git add src/app/pages/admin/DashboardPage.tsx
git commit -m "feat: add admin dashboard with stats and quick actions"
```

---

## Task 16: Admin Projects Page

**Files:**
- Create: `src/app/pages/admin/ProjectsPage.tsx`

- [ ] **Step 1: Create ProjectsPage**

The most complex admin page. Fetches projects via `getProjects()`.

Layout:
- Header: "Projects" title + search input + category filter dropdown + "New Project" button
- Project list: table/card list with columns — mini thumbnail, name, category, published toggle, featured toggle, action buttons (edit, delete)
- Edit panel: slide-over from right (480px) for creating/editing a project. Form fields match `AdminProjectInput` type: name, description, url, category, year, thumbnailUrl, longDescription, tags (textarea, one per line), features (textarea), techStack (textarea), isFeatured toggle, isPublished toggle.
- Reorder: up/down arrow buttons per row, calls `reorderProjects()` API
- Delete: confirmation dialog before calling `deleteProject()`
- All CRUD operations use existing `api.ts` functions

- [ ] **Step 2: Commit**

```
git add src/app/pages/admin/ProjectsPage.tsx
git commit -m "feat: add admin projects page with full CRUD"
```

---

## Task 17: Admin Profile Page

**Files:**
- Create: `src/app/pages/admin/ProfilePage.tsx`

- [ ] **Step 1: Create ProfilePage editor**

Fetches profile via `getProfile()` from existing `api.ts`.

Two-column layout:
- Left: edit form — display name, headline, short bio, avatar URL, GitHub URL, Instagram URL, email, essay markdown (large textarea)
- Right: live preview — renders profile as it would appear on `/profile`, updates in real-time as user types
- Top: completeness indicator (% based on filled fields)
- Save button calls `saveProfile()` with form data
- Success/error toast feedback

- [ ] **Step 2: Commit**

```
git add src/app/pages/admin/ProfilePage.tsx
git commit -m "feat: add admin profile editor with live preview"
```

---

## Task 18: Admin Sections Page

**Files:**
- Create: `src/app/pages/admin/SectionsPage.tsx`

- [ ] **Step 1: Create SectionsPage**

Fetches sections via `getSections()` from existing `api.ts`.

Layout:
- Card-based list, each card shows: section name, description, enabled toggle switch, sort order indicator
- Up/down buttons for reordering
- Toggle switch calls `saveSections()` with updated array
- Save button at top to persist order changes
- Visual distinction between enabled (full opacity) and disabled (dimmed) sections

- [ ] **Step 2: Commit**

```
git add src/app/pages/admin/SectionsPage.tsx
git commit -m "feat: add admin sections manager"
```

---

## Task 19: Admin Blog Placeholder

**Files:**
- Create: `src/app/pages/admin/BlogPage.tsx`

- [ ] **Step 1: Create BlogPage placeholder**

Simple "Coming Soon" page with icon, heading, and description. Centered layout.

- [ ] **Step 2: Commit**

```
git add src/app/pages/admin/BlogPage.tsx
git commit -m "feat: add admin blog placeholder page"
```

---

## Task 20: Routing & App.tsx Update

**Files:**
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Rewrite App.tsx with new routing**

Replace current routing to point to all new page components. Structure:

```tsx
<Routes>
  {/* Public routes */}
  <Route element={<PublicLayout />}>
    <Route path="/" element={<LandingPage />} />
    <Route path="/portfolio" element={<PortfolioPage />} />
    <Route path="/portfolio/:id" element={<ProjectDetailPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route>

  {/* Admin routes */}
  <Route path="/admin/login" element={<LoginPage />} />
  <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
    <Route index element={<DashboardPage />} />
    <Route path="projects" element={<ProjectsPage />} />
    <Route path="profile" element={<AdminProfilePage />} />
    <Route path="sections" element={<SectionsPage />} />
    <Route path="blog" element={<BlogPage />} />
  </Route>
</Routes>
```

Imports all new components. Wraps in `AuthProvider` (existing).

- [ ] **Step 2: Verify all routes work**

Start dev server, check each route:
- `/` — landing page with dynamic sections
- `/portfolio` — project grid with filtering
- `/portfolio/:id` — project detail
- `/profile` — about page with essay
- `/admin/login` — login page
- `/admin` — dashboard (requires auth)
- `/admin/projects` — project management
- `/admin/profile` — profile editor
- `/admin/sections` — section manager
- `/random-path` — 404 page

- [ ] **Step 3: Commit**

```
git add src/app/App.tsx
git commit -m "feat: update routing to use new page components"
```

---

## Task 21: Cleanup Old Files

**Files:**
- Delete: `src/app/components/portfolio-layout.tsx`
- Delete: `src/app/components/profile-page.tsx`
- Delete: `src/app/admin/AdminLayout.tsx`
- Delete: `src/app/admin/AdminLogin.tsx`
- Delete: `src/app/admin/pages/DashboardPage.tsx`
- Delete: `src/app/admin/pages/ProjectsPage.tsx`
- Delete: `src/app/admin/pages/ProfilePage.tsx`
- Delete: `src/app/admin/pages/SectionsPage.tsx`
- Delete: `src/app/admin/pages/BlogPage.tsx`

- [ ] **Step 1: Delete all replaced files**

Remove all old components that have been replaced by the new structure. Verify no remaining imports reference deleted files.

- [ ] **Step 2: Verify build succeeds**

Run: `npm run build`
Expected: Clean build with no errors. All TypeScript types resolve.

- [ ] **Step 3: Verify dev server works end-to-end**

Run: `npm run dev`
Test all public and admin routes. Check responsive behavior at mobile/tablet/desktop breakpoints. Verify dark mode toggle. Check that admin CRUD operations still work against the API.

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "refactor: remove old frontend files replaced by v2.0"
```

---

## Task 22: Final Polish & Responsive QA

- [ ] **Step 1: Check all pages at mobile (375px), tablet (768px), desktop (1280px)**

Verify: header hamburger menu, card grids reflow, sidebar responsive behavior, text doesn't overflow.

- [ ] **Step 2: Check dark mode on all pages**

Toggle theme on every page. Verify: no white flashes, all text readable, cards/backgrounds correct, admin sidebar correct.

- [ ] **Step 3: Check animations**

Verify: hero fade-in, section scroll reveal, card hover effects, filter transitions, page transitions.

- [ ] **Step 4: Check empty/error states**

Test: API down (stop server) → public pages show fallback data. Portfolio with no projects → empty message. Invalid project ID → 404 or redirect. Dashboard empty activity → placeholder.

- [ ] **Step 5: Fix any issues found**

- [ ] **Step 6: Update sitemap.xml if routes changed**

Check `public/sitemap.xml` — verify it includes all current routes (`/`, `/portfolio`, `/profile`). Update if any paths were added or changed.

- [ ] **Step 7: Run lint check**

Run: `npm run lint`
Expected: No errors. Fix any accessibility warnings from `eslint-plugin-jsx-a11y`.

- [ ] **Step 8: Final commit**

```
git add -A
git commit -m "fix: responsive, dark mode, and polish fixes for v2.0"
```
