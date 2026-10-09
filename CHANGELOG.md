# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-10-09

### Added

- lmml.kr, circlr, NMA Records, p1zza-agent의 실제 서비스·공개 release에 기반한 프로젝트 소개
- 갱신 전 콘텐츠 원본과 SHA-256 manifest, 공개 제외 프로젝트의 DB 행 보존
- dry run, digest 검토, 단일 transaction, 무관한 콘텐츠 보존 검증을 갖춘 scoped 콘텐츠 갱신 CLI와 행동 검증
- production image의 Git revision label과 공개 Turnstile site key build 전달

### Changed

- PRD AI, ONKURA, PEDALS, SRBBRS를 공개에서 제외하고 기존 설명과 기록 보존
- 서비스의 현재 기능·기술 목록·실제 화면 이미지로 콘텐츠 갱신하고 근거 없는 성능·인증 주장 제거
- 3W 소속 문구 제거, 개인 개발 문의와 현재 활동에 맞게 프로필·SEO 수정
- 한국어 카테고리·화면 문구, 대표 프로젝트 우선순위와 표시 개수 설정 일치
- 미완성 관리자 메뉴 숨김, 이미지 fallback을 중립 배경으로 변경
- 운영 topology와 일치하도록 app host port 비공개 유지, 환경 파일의 Docker build context 전달 차단
- README와 배포 절차를 PostgreSQL·현재 CMS·운영 경로에 맞게 갱신

## 이전 배포 준비 기록

### Changed

- Switched runtime/database configuration toward PostgreSQL via `DATABASE_URL`
- Added Dockerfile, `.dockerignore`, and `compose.yml` for containerized deployment
- Added Vultr deployment notes and `p1zza.kr` Caddy site template
- Added `scripts/migrate-turso-to-postgres.ts` for legacy Turso data migration
- Updated canonical domain defaults to `p1zza.kr` and removed `h4ppy-p1zza.com` from service defaults
- Added new portfolio service entries for `h4ppy`, `LMML.KR`, `Wyz`, `deafroom.com code chat`, and `row.kr`
- Added generated thumbnails for `h4ppy`, `LMML.KR`, `Wyz`, `deafroom.com code chat`, and `row.kr`
- Moved portfolio thumbnails, profile image, and OG image from the repo into Cloudinary-managed static asset URLs

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
