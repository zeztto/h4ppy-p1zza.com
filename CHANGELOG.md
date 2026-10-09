# 변경 이력

사용자에게 보이는 변경과 운영·문서 변경을 기록합니다. 형식은 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), 버전 표기는 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)을 참고합니다.

버전 제목은 문서상의 변경 기록입니다. 2026-10-09 확인 시 GitHub tag와 release는 없습니다. [프로필 갱신 merge 이후 변경 비교](https://github.com/zeztto/p1zza.kr/compare/ab4d31278dd571fff49b41e3f36fe6175f836792...HEAD)는 실제 commit을 기준으로 합니다.

## 1.1.3 - 2026-10-09

### 보안 수정

- 공개 문의의 이메일·필드·CAPTCHA 입력 한도와 선행 검증, 요청 제한 및 외부 검증 timeout 추가
- 기존 session의 현재 관리자 role·허용 목록 재확인, 권한 회수 시 무효화와 절대 만료 적용
- 잘못된 cookie의 안전한 처리와 고정 origin 검증, 인증·관리 API의 cache 제한
- 로그아웃 실패를 성공처럼 처리하지 않고 오류와 재시도를 제공
- 공개 문의 유입 URL의 protocol을 검증하고 기존 unsafe 값을 관리자 화면에서 링크로 만들지 않음
- production과 build dependency의 취약 branch 갱신 및 legacy loader의 범위 제한 override
- legacy secret export의 private file 생성·권한·출력 경계와 환경 파일 Git ignore 강화

### 운영 개선

- production schema bootstrap과 최소 권한 웹 앱 DB 계정 분리
- non-root app, capability 제거, no-new-privileges와 read-only filesystem 적용
- PostgreSQL 17.9 운영 DB를 보안 patch가 포함된 17.11로 갱신하고 정확한 patch 버전 고정
- production secret 필수 설정과 origin·DB 권한 검증, 정확한 Caddy peer 신뢰 및 HSTS 추가
- 배포 보조 명령을 p1zza-2nd와 target lock·환경 보존·app 내부 health 검사에 맞게 갱신
- 보안 회귀 테스트와 인증·입력·DB·배포 계약 문서 추가
- Node 22 기반 GitHub CI에 test·type·lint·build 및 full/production dependency audit 추가
- SSH 배포의 one-off·health 명령이 뒤따르는 Bash stdin을 소비하지 않도록 분리하고 회귀 검사 추가

## 1.1.2 - 2026-10-09

### 변경

- GitHub repository 이름과 active 문서의 clone·repository 링크를 `zeztto/p1zza.kr`로 정리
- private npm package 이름·repository·homepage·bugs metadata와 package-lock root 정보 갱신
- web manifest를 현재 개인 포트폴리오 소개에 맞추고 고정 프로젝트 개수와 오래된 문구 제거
- 기여 안내·유지보수 가이드·출처 문서를 한국어로 갱신하고 현행 구조·운영 문서 index 추가
- 연결된 CMS 기능과 헤더·푸터 편집 미연결 범위, PostgreSQL·현재 Compose 배포·legacy 보조 도구를 구분
- 2026-03-25 설계·계획 원문 4개를 `archive/docs-2026-03-25/`로 byte 보존 이동하고 SHA-256·byte·Git blob manifest 기록
- formatter의 `archive/` 제외 규칙으로 기존 콘텐츠와 역사 문서 원본 보존
- 존재하지 않는 release tag 링크를 실제 merge commit 기준 비교 링크로 교체

## 1.1.1 - 2026-10-09

### 변경

- 프로필 본문을 최근 작업과 개발·운영 방식을 소개하는 여섯 문단으로 수정하고 과장된 표현과 반복을 정리

## 1.1.0 - 2026-10-09

### 추가

- lmml.kr, circlr, NMA Records, p1zza-agent의 실제 서비스·공개 release에 기반한 프로젝트 소개
- 갱신 전 콘텐츠 원본과 SHA-256 manifest, 공개 제외 프로젝트의 DB 행 보존
- dry run, digest 검토, 단일 transaction, 무관한 콘텐츠 보존 검증을 갖춘 scoped 콘텐츠 갱신 CLI와 행동 검증
- production image의 Git revision label과 공개 Turnstile site key build 전달

### 변경

- PRD AI, ONKURA, PEDALS, SRBBRS를 공개에서 제외하고 기존 설명과 기록 보존
- 서비스의 현재 기능·기술 목록·실제 화면 이미지로 콘텐츠 갱신하고 근거 없는 성능·인증 주장 제거
- 3W 소속 문구 제거, 개인 개발 문의와 현재 활동에 맞게 프로필·SEO 수정
- 한국어 카테고리·화면 문구, 대표 프로젝트 우선순위와 표시 개수 설정 일치
- 미완성 관리자 메뉴 숨김, 이미지 fallback을 중립 배경으로 변경
- 운영 topology와 일치하도록 app host port 비공개 유지, 환경 파일의 Docker build context 전달 차단
- README와 배포 절차를 PostgreSQL·현재 CMS·운영 경로에 맞게 갱신

## 이전 배포 준비 기록

### 변경

- `DATABASE_URL`을 사용하도록 runtime과 DB 구성을 PostgreSQL로 이전
- 컨테이너 배포를 위한 Dockerfile, `.dockerignore`, `compose.yml` 추가
- Vultr 배포 안내와 `p1zza.kr` Caddy site template 추가
- legacy Turso 이전용 `scripts/migrate-turso-to-postgres.ts` 추가
- 기본 도메인을 `p1zza.kr`로 정리하고 `h4ppy-p1zza.com`을 서비스 기본값에서 제거
- `h4ppy`, `LMML.KR`, `Wyz`, `deafroom.com code chat`, `row.kr` 서비스 항목 추가
- 해당 서비스 항목의 생성 썸네일 추가
- 포트폴리오 썸네일·프로필·OG 이미지를 repository 파일에서 Cloudinary 정적 자산 URL로 이전

## 1.0.0 - 2025-12-24

아래 항목은 당시 작성한 변경 기록입니다. 현재 기능, bundle 크기와 보안 검사 결과는 현재 source와 별도 검증 결과를 기준으로 확인합니다.

### 초기 공개

- React 18.3.1과 Vite 6.4.1 기반 포트폴리오 화면 추가
- live iframe preview를 포함한 프로젝트 16개 소개
- 분류 필터가 있는 포트폴리오 페이지 추가
- 블로그 preview 12개를 표시하는 페이지 추가
- 모바일을 지원하는 responsive navigation 추가
- shadcn/ui 기반 공통 컴포넌트 5개와 GitHub·Instagram footer 링크 추가
- 화면 전반에 한국어 콘텐츠 적용

### 당시 보안 관련 변경

- `src/config/env.ts`의 type-safe 환경 설정 추가
- strict TypeScript 설정과 build tool용 tsconfig 추가
- `src/security/csp.ts`의 CSP와 Vite 보안 header 설정 추가
- 직접적인 `iframeDoc.write()` 사용과 불필요한 `allow-modals` 권한 제거
- iframe의 `referrerPolicy`, `loading="lazy"`, device permission 설정 추가
- ESLint의 React hooks·TypeScript·no-eval·no-implied-eval 규칙 추가
- Prettier 설정과 ignore 파일 추가
- Vite 6.4.1로 갱신

### 당시 성능 관련 변경

- 사용하지 않는 npm package 105개 제거, 약 500KB 감소로 기록
- 제거 대상에 @emotion/react, @emotion/styled, @mui/icons-material, @mui/material, recharts, react-slick, react-dnd 포함
- react-hook-form, embla-carousel, cmdk, date-fns, next-themes, sonner, vaul, react-responsive-masonry 제거
- 사용하지 않는 UI 컴포넌트 41개 제거하고 badge·button·card·dropdown-menu·utils 유지
- index metadata·Open Graph·Twitter Card·한국어 locale·robots·sitemap·연결 사전 준비 설정 추가
- bundle 크기 60~70% 감소, 초기 JS gzip 150KB 미만으로 당시 기록

### 당시 문서와 기술 구성

- 한국어·영어 README에 기술 목록·프로젝트 16개 소개·설치·배포·구조·연락처 기록
- MIT LICENSE, CHANGELOG, ATTRIBUTIONS 추가·갱신
- React 18.3.1, TypeScript 5.x, Vite 6.4.1, Tailwind CSS 4.1.12 사용
- Radix UI 기반 shadcn/ui, Motion 12.23.24, ESLint 9.x, Prettier 3.x 사용
- CSP, X-Frame-Options, X-Content-Type-Options, 환경 변수와 입력 검증, iframe 제한 기록
- 당시 npm audit에서 발견된 취약점이 없다고 기록
