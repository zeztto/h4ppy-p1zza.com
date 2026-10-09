# p1zza.kr

[p1zza.kr](https://p1zza.kr/)의 개인 포트폴리오와 관리 CMS입니다. React SPA와 Express API가 PostgreSQL의 프로젝트·프로필·홈 섹션·사이트 설정을 읽습니다. 운영 환경은 p1zza-2nd의 Docker Compose와 Caddy입니다.

## 공개 화면과 관리 기능

- `/`: 소개, 대표 프로젝트, 기술 목록
- `/portfolio`, `/portfolio/:id`: 공개 프로젝트 목록·카테고리 필터·상세 소개
- `/profile`: 프로필과 활동 소개
- `/inquiry`: Cloudflare Turnstile 검증 후 문의를 DB에 저장
- `/admin/login`: GitHub OAuth와 `ADMIN_GITHUB_LOGINS` 허용 목록으로 관리자 로그인
- 관리자: 프로젝트·프로필·홈 섹션·헤더·푸터·문의 관리

문의는 DB에 저장하며 별도 이메일 알림은 구현되어 있지 않습니다. 공개 블로그는 제공하지 않습니다. 프로젝트 공개 여부와 대표 프로젝트 순서는 운영 DB가 결정합니다.

## 기술과 구조

React 18, TypeScript, Vite 6, Tailwind CSS 4, React Router, Express 5, Drizzle ORM, PostgreSQL 17을 사용합니다. Docker image는 Node.js 22에서 빌드합니다.

```text
src/app/          공개 화면·관리자 화면·공통 컴포넌트
src/data/         신규 DB 초기 데이터와 공개 repository 링크
src/shared/       API와 화면의 공통 타입
server/           API·OAuth·문의 검증·정적 파일 제공
db/               PostgreSQL schema와 연결
scripts/          초기화·이전·콘텐츠 갱신·자산 관리
public/           favicon·manifest·robots·sitemap
archive/          갱신 전 콘텐츠의 원본과 해시 manifest
deploy/vultr/     배포 절차와 Caddy 설정
```

프로필·기존 썸네일은 Cloudinary에서 관리합니다. 최신 프로젝트에는 실제 공개 서비스의 OG 이미지, 공개 release 이미지, 실제 페이지 캡처를 사용합니다. 공개 repository가 없는 프로젝트에는 GitHub 링크를 표시하지 않습니다.

## 개발

Node.js 22와 npm, 접근 가능한 PostgreSQL이 필요합니다.

```sh
npm ci
cp .env.example .env.local
```

`.env.local`에 실제 GitHub OAuth·session·Turnstile 값을 설정하고 `DATABASE_URL`을 개발 DB로 지정합니다. 호스트에서 `npm run dev`를 실행할 때는 Docker 내부의 `db` hostname 대신 접근 가능한 DB 주소를 사용합니다. 개발 origin은 `http://localhost:5173`, API port는 `3001`입니다. 관리자 OAuth callback은 `/api/auth/github/callback`입니다.

```sh
# 새 개발 DB에만 초기 데이터를 넣습니다.
npm run db:seed
npm run dev
```

기존 운영 DB의 콘텐츠 갱신에 `db:seed:force`를 사용하지 않습니다. 이 명령은 초기 데이터에 없는 프로젝트를 삭제하고 프로필·설정을 덮어쓸 수 있습니다.

```sh
npm run type-check
npm run lint
npx tsx --test scripts/refresh-portfolio-content.test.ts
npm run build
```

## 2026-10-09 프로필 본문 수정

lmml.kr과 circlr 작업, 개발·운영 방식, AI 활용을 여섯 문단으로 소개하도록 프로필 본문을 다듬었습니다.

## 2026-10-09 콘텐츠 갱신

lmml.kr, circlr, NMA Records, p1zza-agent를 공개 목록에 반영하고 기존 서비스의 설명·기술 목록·썸네일을 현재 구현에 맞췄습니다. PRD AI, ONKURA, PEDALS, SRBBRS는 공개에서 제외하며 기존 DB 행을 보존합니다. 소속이 종료된 3W 문구는 공개 화면에서 제거했습니다.

`content:refresh`는 기본적으로 dry run입니다. `DATABASE_URL`을 명시적으로 전달하며, 운영 환경에서는 image에 포함된 compiled script도 실행할 수 있습니다. 출력에는 숨김 콘텐츠를 포함한 before/after snapshot이 있으므로 Git 밖의 접근 제한된 디렉터리에 보관합니다.

```sh
# DATABASE_URL이 지정된 환경에서 실행합니다.
npm run content:refresh -- --output /private/backup/content-dry-run.json
# dry run 내용을 검토한 뒤 beforeDigest를 사용합니다.
npm run content:refresh -- --apply --expected-digest '<beforeDigest>' --output /private/backup/content-applied.json
```

출력 파일은 새로 생성하며 mode 600을 사용합니다. 기존 파일을 재사용하지 않습니다. 적용은 단일 transaction에서 콘텐츠 table만 변경하고, digest가 다르면 중단합니다. 문의·관리자·session 데이터는 변경하지 않습니다. 반복 적용 시 변경이 없으면 timestamp도 유지합니다. 이 갱신은 해당 기준일의 목록을 위한 명시적 migration이며, 이후 관리자 변경을 재설정하는 정기 작업으로 사용하지 않습니다.

## 배포

운영 경로는 `/opt/p1zza-kr`, Compose project는 `p1zza-kr`입니다. app과 DB의 host port를 공개하지 않고 Caddy가 Docker network의 app port 3001로 연결합니다. PostgreSQL volume과 기존 환경 파일을 보존하고 app만 교체합니다.

`VITE_TURNSTILE_SITE_KEY`는 공개 site key이며 Compose가 `PUBLIC_TURNSTILE_SITE_ID` build arg로 전달합니다. `TURNSTILE_SECRET_KEY`는 runtime에만 제공합니다. `APP_REVISION`에는 배포한 Git SHA를 기록합니다. 환경 파일은 Docker build context에서 제외합니다.

백업·전달·app 교체·검증·rollback 절차는 [배포 문서](deploy/vultr/README.md)를 따릅니다. 콘텐츠 rollback에는 변경한 행만 복구하며 새 문의를 덮어쓰는 전체 DB 복원은 자동으로 수행하지 않습니다. 현재 repository에는 자동 push 배포 workflow가 없습니다.

## 라이선스와 연락처

[MIT License](LICENSE). 운영 홈페이지는 [p1zza.kr](https://p1zza.kr/), repository는 [zeztto/h4ppy-p1zza.com](https://github.com/zeztto/h4ppy-p1zza.com)입니다.
