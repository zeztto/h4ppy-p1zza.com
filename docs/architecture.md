# 현재 구조와 운영

2026-10-09에 확인한 source와 p1zza-2nd 운영 구성을 기준으로 정리한 문서입니다. [초기 설계 기록](../archive/docs-2026-03-25/README.md)의 구상과 현재 연결된 기능을 구분합니다.

## 요청과 데이터 흐름

공개 도메인 `p1zza.kr`의 요청은 Caddy에서 Docker network의 Express app port `3001`로 전달됩니다. Express는 production build인 `dist/`를 제공하며 API 요청은 PostgreSQL에서 처리합니다. React SPA는 같은 origin의 `/api/public`에서 콘텐츠를 읽고 React Router로 페이지를 전환합니다.

개발에서는 Vite port `5173`이 화면을 제공하고 `/api`를 Express port `3001`로 proxy합니다. `npm run dev`는 웹과 API를 함께 실행합니다. 현재 구성 근거는 [Vite 설정](../vite.config.ts), [Express app](../server/app.ts), [Compose](../compose.yml)입니다.

## 화면과 실제 연결 범위

| 경로               | 현재 기능                                                 |
| ------------------ | --------------------------------------------------------- |
| `/`                | 소개·대표 프로젝트·핵심 가치·기술·주요 업무, 활성 홈 섹션 |
| `/portfolio`       | 공개 프로젝트 목록·분류 필터                              |
| `/portfolio/:id`   | 공개 프로젝트 상세·서비스·repository 링크·이전/다음 항목  |
| `/profile`         | 프로필·소개 본문                                          |
| `/inquiry`         | 문의 입력·Turnstile 인증·DB 접수                          |
| `/admin/login`     | GitHub OAuth 로그인                                       |
| `/admin`           | 대시보드                                                  |
| `/admin/projects`  | 프로젝트 생성·수정·삭제·공개·대표·순서, 목록·Kanban       |
| `/admin/profile`   | 프로필 수정·저장                                          |
| `/admin/sections`  | 홈 섹션 순서·활성·콘텐츠 관리                             |
| `/admin/inquiries` | 문의 목록과 처리 상태 관리                                |

route 근거는 [App.tsx](../src/app/App.tsx), 관리자 메뉴는 [AdminLayout.tsx](../src/app/layouts/AdminLayout.tsx)입니다. 공개 블로그는 제공하지 않습니다. 보호된 `/admin/blog` route와 준비 화면은 source에 남아 있으며 관리자 메뉴에서는 숨겨져 있습니다.

관리자로 로그인하면 홈의 편집 toolbar와 섹션 추가·내용 편집 도구를 사용할 수 있습니다. [LandingPage](../src/app/pages/landing/LandingPage.tsx)에 실제 저장 동작이 연결되어 있습니다. custom section 편집은 Markdown·CSS textarea, preview와 저장 버튼으로 구성됩니다. 헤더·푸터 설정을 읽는 공개 기능과 설정 API는 있지만 `HeaderEditor`·`FooterEditor`는 현재 화면에 연결되어 있지 않습니다. 사이트 전체의 일반 텍스트 자동 저장이나 offline queue를 구현한 것으로 설명하지 않습니다.

## API와 인증

| API                             | 동작                                            |
| ------------------------------- | ----------------------------------------------- |
| `GET /api/health`               | `{ "ok": true }` 응답                           |
| `GET /api/public/projects`      | 공개 프로젝트 목록                              |
| `GET /api/public/projects/:id`  | 공개 프로젝트 상세, 숨김·누락은 404             |
| `GET /api/public/profile`       | `primary` 프로필                                |
| `GET /api/public/sections`      | 활성 섹션을 지정 순서로 조회                    |
| `GET /api/public/settings/:key` | 헤더·푸터·grid 등의 설정 조회                   |
| `POST /api/inquiries`           | 입력과 Turnstile 검증 후 문의 저장, 성공 시 201 |
| `/api/auth`                     | GitHub 시작·callback, session 확인과 logout     |
| `/api/admin`                    | 인증된 관리자용 콘텐츠·설정·문의 API            |

관리자 OAuth는 `ADMIN_GITHUB_LOGINS` 허용 목록과 DB session을 사용합니다. 관리자 API는 session을 확인하고, 변경 요청에 `Origin` header가 있으면 허용 origin과 대조합니다. 공개 문의도 같은 origin middleware를 거치며 production에서는 서버가 Turnstile token을 검증합니다. site key는 공개 웹 build에 들어가며 secret key는 서버 runtime에서만 사용합니다.

문의는 `name`, `email`, `description`을 필수로 받고 전화번호가 있으면 한국 전화번호 형식을 검사합니다. 성공한 문의는 `inquiries`에 저장되며 처리 상태는 `new`, `contacted`, `closed`입니다. 이메일·Slack 알림 전송은 현재 구현되어 있지 않습니다. 근거는 [공개 API](../server/routes/public.ts), [인증 API](../server/routes/auth.ts), [문의 API](../server/routes/inquiries.ts), [인증 middleware](../server/middleware/auth.ts)입니다.

## PostgreSQL과 콘텐츠 소유권

[DB client](../db/client.ts)는 `pg` pool과 Drizzle을 사용하고 [schema](../db/schema.ts)는 PostgreSQL table을 정의합니다.

| table                     | 용도                                         |
| ------------------------- | -------------------------------------------- |
| `projects`                | 프로젝트 소개·URL·분류·썸네일·공개·대표·순서 |
| `site_profile`            | 이름·소개·사진·연락처·본문                   |
| `site_sections`           | 홈 섹션 종류·콘텐츠·순서·활성                |
| `site_settings`           | 헤더·푸터·grid 등의 설정 값                  |
| `inquiries`               | 문의 내용과 처리 상태                        |
| `admin_users`, `sessions` | 관리자 identity와 session                    |

운영 DB와 `src/data/`의 초기 콘텐츠는 별개입니다. 초기화 script는 [seed loader](../scripts/seed-loaders.ts)로 신규 DB 값을 읽고, safe seed는 기존 콘텐츠가 있으면 초기화를 건너뜁니다. force seed는 프로젝트 삭제·덮어쓰기와 프로필·홈 섹션 덮어쓰기를 수행할 수 있습니다. 운영 갱신은 CMS 또는 해당 목적의 검토된 DB 절차를 사용합니다.

2026-10-09 콘텐츠 갱신 CLI는 [refresh-portfolio-content.ts](../scripts/refresh-portfolio-content.ts)에 있습니다. 기본 dry run, reviewed digest 확인, 단일 transaction과 무관한 값 보존 검증을 사용합니다. before/after snapshot과 출력 파일은 접근을 제한한 Git 외부 경로에 보관합니다. 이 script는 해당 기준일의 목록을 위한 명시적 migration으로 사용합니다. 명령과 보존 기준은 [README](../README.md)에 있습니다.

repository 링크는 [project-repositories.ts](../src/data/project-repositories.ts), 초기 자산 참조는 [cloudinary-assets.ts](../src/data/cloudinary-assets.ts)에 있습니다. 공개 화면은 내부 분류 key를 한국어 label로 표시하고 `sortOrder`를 우선합니다. 대표 프로젝트도 설정한 `maxItems`를 적용합니다.

## 현재 운영과 legacy 보조 도구

현재 배포는 p1zza-2nd의 `/opt/p1zza-kr`, Compose project `p1zza-kr`에서 app을 교체하는 절차입니다. DB는 PostgreSQL 17이며 volume은 `p1zza-kr_postgres_data`입니다. app·DB의 host port를 공개하지 않고 Caddy가 app에 연결합니다. `APP_REVISION`은 production image의 Git revision을 기록합니다. 구체적인 백업·검증·rollback은 [현재 배포 문서](../deploy/vultr/README.md)를 따릅니다.

저장소에는 push 자동 배포 workflow가 없습니다. 별도 중앙 배포 workflow와 현재 운영 server의 직접 Compose 절차는 운영 담당자가 선택한 경로에 맞춰 적용합니다. repository 이름을 바꾸어도 기존 서비스 경로·Compose 이름·DB volume·자산 namespace를 함께 rename할 필요는 없습니다.

| 보조 파일·명령                                                                               | 맥락                                                  |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [migrate-turso-to-postgres.ts](../scripts/migrate-turso-to-postgres.ts), `db:migrate:legacy` | 이전 Turso 원천에서 PostgreSQL로 이동하는 legacy 도구 |
| [railway.json](../railway.json), `env:railway:export`                                        | 이전 Railway 배포·환경 내보내기 설정                  |
| [stage.sh](../deploy/vultr/stage.sh)                                                         | 과거 host·host port 가정의 legacy 배포 보조 파일      |

이 도구들은 현재 runtime DB나 현재 운영 배포 절차를 설명하는 근거로 혼용하지 않습니다. 현재 검증 명령과 수동 UI 검증 범위는 [기여 안내](../CONTRIBUTING.md), 역사 문서의 원본 해시는 [문서 archive manifest](../archive/docs-2026-03-25/manifest.json)에서 확인합니다.
