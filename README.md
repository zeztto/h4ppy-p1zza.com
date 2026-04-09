# p1zza.kr - Portfolio Website

> 웹 개발자 포트폴리오 웹사이트 | Web Developer Portfolio Website

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4.1-646CFF?logo=vite)](https://vitejs.dev/)

## 📖 Overview | 개요

React 18.3.1, TypeScript, Express로 구축된 개인 포트폴리오 서비스입니다. 공개 포트폴리오 페이지와 admin 편집 화면을 함께 제공하며, Vultr 이전을 위해 Docker + PostgreSQL 배포 구조를 준비하고 있습니다.

A personal portfolio service built with React 18.3.1, TypeScript, and Express. It serves public portfolio pages and an admin editing surface, and is being prepared for Docker + PostgreSQL deployment on Vultr.

## ✨ Features | 주요 기능

- 🎨 **Interactive Portfolio** - 36개 프로젝트의 라이브 iframe 미리보기
- 📱 **Responsive Design** - 모바일부터 데스크톱까지 완벽한 반응형
- 🎯 **Category Filtering** - 카테고리별 프로젝트 필터링
- 📝 **Blog Section** - 기술 블로그 포스트 모음
- 🌓 **Dark Mode Ready** - 다크 모드 지원 준비
- 🚀 **Performance Optimized** - 번들 크기 최적화 및 lazy loading
- 🔒 **Security Hardened** - CSP, 보안 헤더, TypeScript strict mode
- 🔍 **SEO Optimized** - 완전한 메타 태그, sitemap, robots.txt
- 🛠️ **Admin CMS** - 프로젝트/섹션/프로필/문의 관리 기능
- 🐳 **Docker Ready** - container image와 `compose.yml` 제공
- 🐘 **PostgreSQL Ready** - `DATABASE_URL` 기반 runtime과 Turso migration script 지원

## 🎯 Showcased Projects | 프로젝트 소개

### Media | 미디어 (4개)

- **포픽 (Phopic)** - 사진 편집 및 관리 웹 애플리케이션
- **YouTube 다운로더** - YouTube 영상/오디오 다운로드 도구
- **슈퍼 노멀라이저** - 오디오 노멀라이제이션 도구 (Peak/RMS/LUFS)
- **숏폼 비디오 변환기** - 가로 영상을 세로 숏폼(9:16)으로 변환

### Tools | 도구 (10개)

- **계산기** - 기본, Casio, TI, AlphaOmega 4가지 모드 계산기
- **이모지 모음** - 이모지 검색 및 클립보드 복사 도구
- **비밀번호 생성기** - 안전한 비밀번호 생성 도구
- **로또 번호 생성기** - 12가지 알고리즘으로 로또 번호 생성
- **색상 팔레트** - HEX, RGB, HSL, CMYK 색상 선택 및 변환
- **단위 변환기** - 길이, 무게, 온도, 부피 변환 도구
- **서버 시간 동기화** - 웹사이트 서버 시간 실시간 비교 도구
- **다국어 로렘 입숨** - 다국어 지원 더미 텍스트 생성기
- **텍스트 분석기** - 텍스트 통계 및 분석 도구
- **이미지·문서 파일 변환기** - 다양한 파일 형식 변환 도구

### Finance | 금융 (5개)

- **코인 나우** - 실시간 가상화폐 시세 및 차트
- **2026년 연봉 계산기** - 최신 세율 및 4대보험료 반영 연봉 계산
- **복리 투자 수익 계산기** - 복리 투자 수익률 계산 도구
- **실시간 환율** - 실시간 환율 정보 서비스
- **대출 이자 계산기** - 대출 이자 계산 도구

### Games | 게임 (5개)

- **테트릭스** - Modern Guideline 준수 테트리스 게임
- **수도쿠** - 5가지 난이도로 즐기는 한국어 수도쿠 게임
- **룰렛 추첨** - 암호학적으로 안전한 무작위 룰렛 추첨 시스템
- **타로카드 점** - 타로카드로 확인하는 5가지 운세
- **카드 퍼즐** - 기억력 카드 매칭 게임

### Productivity | 생산성 (2개)

- **인스타그램 팔로워 분석** - 팔로워/팔로우 관계 분석 도구
- **메모모미 (Memomome)** - 간단하고 빠른 메모 애플리케이션

### Archive | 아카이브 (9개)

- **h4ppy p1zza 포트폴리오** - 이 포트폴리오 사이트 자체 (메타 프로젝트)
- **큐알잉 (QR-ing)** - QR 코드 생성 도구
- **키프레임 생성기** - 애니메이션 키프레임 생성 도구
- **Endless Blood** - 인터랙티브 게임
- **도파밈 (Dopameme)** - 밈 생성기
- **해피랩스 (h4ppy Labs)** - 오디오 플러그인 소개
- **엔비디아 Q3** - 데이터 시각화 프로젝트
- **소수 분포 양자역학** - Prime distribution visualization
- **이지 유튜브 쉐어** - YouTube 공유 도구

## 🛠️ Tech Stack | 기술 스택

### Frontend

- **React** 18.3.1 - UI 라이브러리
- **TypeScript** 5.x - 타입 안전성
- **Vite** 6.4.1 - 빌드 도구

### Backend

- **Express** 5.x - API 서버
- **Drizzle ORM** - 타입 안전한 데이터 접근
- **PostgreSQL** - 배포 대상 데이터베이스

### UI Framework

- **shadcn/ui** - UI 컴포넌트 라이브러리
- **Radix UI** - Headless UI primitives
- **Tailwind CSS** 4.1.12 - 유틸리티 CSS 프레임워크
- **Lucide Icons** - 아이콘 라이브러리

### Styling

- **class-variance-authority** - 컴포넌트 variant 관리
- **clsx** + **tailwind-merge** - className 유틸리티
- **Motion** (Framer Motion) 12.23.24 - 애니메이션

### Development Tools

- **ESLint** 9.x - 코드 품질 및 보안 검사
- **Prettier** 3.x - 코드 포맷팅
- **TypeScript** strict mode - 엄격한 타입 체크

## 📁 Project Structure | 프로젝트 구조

```
h4ppy-p1zza.com/
├── public/                     # 루트 정적 파일만 유지
│   ├── robots.txt              # 검색 엔진 크롤링 설정
│   └── sitemap.xml             # 사이트맵
├── src/
│   ├── app/
│   │   ├── App.tsx             # 메인 앱 컴포넌트
│   │   └── components/
│   │       ├── portfolio-layout.tsx  # 포트폴리오 레이아웃
│   │       ├── about-page.tsx        # 소개 페이지
│   │       ├── blog-page.tsx         # 블로그 페이지
│   │       ├── footer.tsx            # 푸터
│   │       ├── figma/                # Figma 유틸리티
│   │       └── ui/                   # UI 컴포넌트
│   │           ├── badge.tsx
│   │           ├── button.tsx
│   │           ├── card.tsx
│   │           ├── dropdown-menu.tsx
│   │           └── utils.ts
│   ├── config/
│   │   └── env.ts              # 환경 변수 설정
│   ├── security/
│   │   └── csp.ts              # CSP 설정
│   ├── styles/
│   │   ├── index.css           # 메인 스타일
│   │   ├── theme.css           # 테마 변수
│   │   ├── tailwind.css        # Tailwind imports
│   │   └── fonts.css           # 폰트 정의
│   └── main.tsx                # 진입점
├── index.html                  # HTML 템플릿
├── vite.config.ts              # Vite 설정
├── tsconfig.json               # TypeScript 설정
├── eslint.config.js            # ESLint 설정
├── .prettierrc.json            # Prettier 설정
├── package.json                # 의존성
└── README.md                   # 이 파일
```

정적 이미지 자산 정책:
- 포트폴리오 썸네일, 프로필 이미지, OG 이미지는 Cloudinary에서 관리합니다.
- `public/`에는 favicon, manifest, robots, sitemap 같은 origin-root 자산만 유지합니다.
- 썸네일 생성 후에는 `npm run assets:cloudinary:sync`로 Cloudinary에 업로드하고, 레포에는 바이너리 파일을 남기지 않습니다.

## 🚀 Getting Started | 시작하기

### Prerequisites | 사전 요구사항

- Node.js 18+ 또는 20+
- npm, pnpm, 또는 yarn

### Installation | 설치

```bash
# Clone repository
git clone https://github.com/zeztto/h4ppy-p1zza.com.git
cd h4ppy-p1zza.com

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### Development | 개발

```bash
# Start development server
npm run dev

# Open browser at http://localhost:5173
```

### Build | 빌드

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Scripts | 스크립트

```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 미리보기
npm run lint         # ESLint 실행
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 포맷팅
npm run format:check # Prettier 검사
npm run type-check   # TypeScript 타입 체크
```

## 📦 Deployment | 배포

### Docker Compose

```bash
cp .env.example .env.local
docker compose --env-file .env.local up --build
```

- app port: `3001`
- database: `postgres:17-alpine`
- required runtime env: `DATABASE_URL`, `APP_ORIGIN`, GitHub OAuth, session secret
- compose는 `.env.local` 전체를 통째로 주입하지 않고 필요한 변수만 선택적으로 전달합니다.
- local `docker compose`로 GitHub OAuth까지 테스트하려면 `APP_ORIGIN=http://localhost:3001` 로 바꿔서 사용하세요.

### Vultr + Caddy

- compose project name: `p1zza-kr`
- canonical domain: `https://p1zza.kr`
- redirect host: `www.p1zza.kr`
- `h4ppy-p1zza.com`은 이 서비스에 연결하지 않습니다.
- 배포 메모: [deploy/vultr/README.md](/Users/sungwoonjeon/dev/h4ppy-p1zza.com/deploy/vultr/README.md)
- Caddy site file: [deploy/vultr/p1zza.kr.caddy](/Users/sungwoonjeon/dev/h4ppy-p1zza.com/deploy/vultr/p1zza.kr.caddy)

## 🔒 Security Features | 보안 기능

- ✅ **Content Security Policy (CSP)** - XSS 공격 방지
- ✅ **Security Headers** - X-Frame-Options, X-Content-Type-Options
- ✅ **TypeScript Strict Mode** - 타입 안전성 강화
- ✅ **ESLint Security Rules** - 코드 보안 검사
- ✅ **Iframe Sandboxing** - 최소 권한 원칙
- ✅ **Environment Variables** - 타입 안전한 환경 변수
- ✅ **Dependency Auditing** - 정기적인 보안 감사

## 📊 Performance | 성능

### Bundle Size

- Initial JS: <150KB gzipped
- Total assets: <300KB gzipped
- 미사용 의존성 105개 제거
- 미사용 UI 컴포넌트 41개 삭제

### Lighthouse Scores (목표)

- Performance: >95
- SEO: 100
- Accessibility: >90
- Best Practices: >90

## 📝 License | 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments | 감사의 글

- UI components from [shadcn/ui](https://ui.shadcn.com/) (MIT License)
- Icons from [Lucide](https://lucide.dev/)
- Images from [Unsplash](https://unsplash.com)
- Design foundation from Figma Make

## 📬 Contact | 연락처

- **GitHub:** [@zeztto](https://github.com/zeztto)
- **Instagram:** [@h4ppy_p1zza](https://instagram.com/h4ppy_p1zza)
- **Portfolio:** [h4ppy-p1zza.com](https://h4ppy-p1zza.com)

---

<p align="center">
  Made with ❤️ by h4ppy p1zza
  <br>
  🤖 Optimized and documented with <a href="https://claude.com/claude-code">Claude Code</a>
</p>
