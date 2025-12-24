# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-12-24

### Added

#### Phase 0: Initial Release
- Initial portfolio website with React 18.3.1 and Vite 6.4.1
- 16 project showcases with live iframe previews
- Portfolio page with category filtering
- Blog page with 12 blog post previews
- Responsive navigation with mobile support
- shadcn/ui component library integration (5 core components)
- Footer with social links (GitHub, Instagram)
- Korean language content throughout

#### Phase 1: Security Hardening
- Environment variable configuration with type-safe access
  - `.env.example` template
  - `src/config/env.ts` for type-safe access
- TypeScript strict mode enabled
  - `tsconfig.json` with comprehensive type checking
  - `tsconfig.node.json` for build tools
- Content Security Policy (CSP) implementation
  - `src/security/csp.ts` with CSP directives
  - Security headers in Vite configuration
- Improved iframe sandbox restrictions
  - Removed unsafe `iframeDoc.write()` usage
  - Minimal sandbox permissions (removed `allow-modals`)
  - Added `referrerPolicy`, `loading="lazy"`, device permissions
- ESLint configuration (eslint.config.js)
  - React hooks rules
  - Security rules (no-eval, no-implied-eval)
  - TypeScript recommended rules
- Prettier code formatting
  - `.prettierrc.json` configuration
  - `.prettierignore` file
- Vite updated to 6.4.1 (security patches)

#### Phase 2: Performance Optimization
- Removed 105 unused npm packages (~500KB reduction)
  - @emotion/react, @emotion/styled
  - @mui/icons-material, @mui/material
  - recharts, react-slick, react-dnd
  - react-hook-form, embla-carousel
  - cmdk, date-fns, next-themes
  - sonner, vaul, react-responsive-masonry
- Deleted 41 unused UI components
  - Kept only: badge, button, card, dropdown-menu, utils
- SEO optimizations
  - Comprehensive meta tags in index.html
  - Open Graph tags for social media
  - Twitter Card meta tags
  - Korean locale (ko_KR) settings
  - robots.txt for search engine crawling
  - sitemap.xml with main pages
  - Performance hints (preconnect, dns-prefetch)

#### Phase 3: Documentation
- Enhanced README.md
  - Bilingual content (Korean/English)
  - Complete tech stack with versions
  - 16 showcased projects with descriptions
  - Installation and deployment guides
  - Project structure overview
  - Contact information
- LICENSE file (MIT License)
- CHANGELOG.md (this file)
- Updated ATTRIBUTIONS.md

### Technical Stack
- React 18.3.1
- TypeScript 5.x
- Vite 6.4.1
- Tailwind CSS 4.1.12
- shadcn/ui with Radix UI primitives
- Motion (Framer Motion) 12.23.24
- ESLint 9.x
- Prettier 3.x

### Performance Metrics
- Bundle size reduced by 60-70%
- Initial JS: <150KB gzipped (from ~400KB+)
- 105 dependencies removed
- 41 unused components deleted

### Security Enhancements
- Content Security Policy (CSP)
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- TypeScript strict mode
- ESLint security rules
- Iframe sandboxing with minimal permissions
- Environment variable validation
- No security vulnerabilities (npm audit)

[Unreleased]: https://github.com/zeztto/h4ppy-p1zza.com/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/zeztto/h4ppy-p1zza.com/releases/tag/v1.0.0
