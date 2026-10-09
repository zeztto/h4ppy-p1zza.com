# p1zza.kr 기여 안내

[p1zza.kr 저장소](https://github.com/zeztto/p1zza.kr)의 공개 화면, CMS, API와 운영 문서를 변경하는 절차입니다. 먼저 [현재 구조와 운영](docs/architecture.md)에서 수정하려는 기능의 연결 범위와 데이터 소유권을 확인하세요.

## 문제와 변경 범위 정리

버그는 재현 순서, 기대한 동작, 실제 결과, 브라우저·OS·Node.js 환경을 함께 기록합니다. 화면 문제는 문제가 발생한 화면 크기와 화면 기록을 포함합니다. 기능 제안은 사용할 사람과 실제 동작, 완료 조건을 명확히 설명합니다.

변경은 한 가지 목적에 집중합니다. 공개 기능, 운영 데이터, 인증, 배포 설정 중 무엇을 수정하는지 구분하고 파일 담당자를 정합니다. 다른 작업자의 수정과 기존 운영 콘텐츠를 보존합니다.

## 개발 환경

Node.js 22, npm과 접근 가능한 PostgreSQL 개발 DB가 필요합니다. 저장소를 직접 수정할 권한이 없으면 GitHub에서 fork한 뒤 자신의 저장소를 clone합니다.

```sh
git clone https://github.com/zeztto/p1zza.kr.git
cd p1zza.kr
npm ci
cp .env.example .env.local
```

`.env.local`의 `DATABASE_URL`은 별도의 개발 DB를 가리켜야 합니다. 호스트에서 실행하는 API는 Docker network 내부의 `db` hostname에 직접 연결할 수 없으므로 실제로 접근 가능한 DB 주소를 사용합니다.

GitHub OAuth 앱의 `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, 관리자 `ADMIN_GITHUB_LOGINS`와 `SESSION_SECRET`을 설정합니다. 개발 `APP_ORIGIN`은 `http://localhost:5173`이며 OAuth callback은 `/api/auth/github/callback`입니다. 문의 검증에는 해당 개발 도메인에서 사용할 수 있는 Turnstile site key와 secret key를 설정합니다. Cloudinary 업로드를 검증할 때는 본인의 Cloudinary 계정 설정도 필요합니다. 환경 파일과 인증 정보는 Git에 올리지 않습니다.

```sh
# 초기 데이터가 필요한 새 개발 DB에서 실행합니다.
npm run db:seed
npm run dev
```

Vite 화면은 `http://localhost:5173`, Express API는 port `3001`에서 실행됩니다. Vite가 `/api` 요청을 API로 전달합니다. `npm run build`는 `dist/`의 웹 자산과 `build/server/`의 서버 코드를 생성합니다. `npm start`는 빌드된 Express 서버를 실행합니다.

## 현재 코드 구조

| 경로                                    | 담당 내용                                     |
| --------------------------------------- | --------------------------------------------- |
| `src/app/pages/`, `src/app/components/` | 공개·관리자 화면과 편집 컴포넌트              |
| `src/app/hooks/`, `src/app/lib/`        | 화면 데이터 조회·상태·공개 타입·정렬          |
| `src/data/`                             | 새 DB 초기 데이터와 공개 repository·자산 참조 |
| `src/shared/`                           | 화면과 API의 문의 한도·전화번호 검증          |
| `server/`                               | 공개·관리자 API, OAuth·session, 문의 검증     |
| `db/`                                   | PostgreSQL schema·연결·초기화                 |
| `scripts/`                              | 초기화, legacy 이전, 콘텐츠 갱신, 자산 관리   |
| `deploy/vultr/`                         | 현재 p1zza-2nd 배포 절차와 보조 파일          |
| `docs/`, `guidelines/`                  | 현재 구조·운영 문서와 유지보수 기준           |
| `archive/`                              | 보존한 콘텐츠·설계 원본과 manifest            |

운영 콘텐츠는 PostgreSQL이 결정합니다. 초기 데이터 파일을 바꾸어도 기존 운영 DB는 자동 갱신되지 않습니다. 관리자 화면 또는 목적에 맞게 검토한 DB 갱신 절차를 사용합니다. `db:seed:force`는 프로젝트 삭제·덮어쓰기와 프로필·홈 섹션 덮어쓰기를 수행할 수 있으므로 운영 콘텐츠 갱신에 사용하지 않습니다.

## 구현 기준

TypeScript의 기존 strict 설정을 유지하고 API 응답 타입을 실제 서버와 맞춥니다. 기존 조회 hook, 화면 상태와 오류 처리 방식에 맞춰 구현합니다. 인증·문의 검증은 화면과 서버를 함께 확인하며 Turnstile secret을 웹 build에 포함하지 않습니다.

공개 UI는 한국어로 작성하고 기존 theme·Tailwind 구조를 사용합니다. 실제 서비스의 기능과 자산, 검증한 프로젝트 설명을 사용합니다. 미완성 메뉴나 동작하지 않는 버튼을 공개 화면에 추가하지 않습니다. 자세한 변경 기준은 [유지보수 가이드](guidelines/Guidelines.md)를 따릅니다.

`archive/`의 원본은 검색 치환, 줄바꿈 정리, format 대상에서 제외합니다. 보존된 데이터·문서를 다룰 때는 해당 manifest의 SHA-256과 byte 수를 확인합니다. LICENSE와 원출처 기록도 유지합니다.

## 검증

```sh
npm run type-check
npm run lint
npm test
npm run build
npm audit
npm audit --omit=dev
git diff --check
```

콘텐츠 갱신 자동 테스트는 공개 제외·새 공개 항목·반복 적용·무관한 값 보존·잘못된 대상·digest·CLI·seed 동작을 검증합니다. 보안 회귀 테스트는 session 권한 회수, 입력 제한, 외부 검증 실패, logout, URL, secret export와 최소 권한 startup을 검증합니다. Production build는 test 파일을 emit하지 않으며 test 타입 검사는 별도 noEmit config로 유지합니다. 자동 테스트는 전체 제품의 브라우저 E2E 검증을 대신하지 않습니다. 새 테스트는 바뀐 동작과 실제 회귀 위험을 검증하도록 작성합니다.

화면 변경은 `1440×900`, `1024×768`, `390×844`, `360×800`에서 한국어 줄바꿈, 가로 넘침, 키보드 focus, loading·empty·error 상태와 실제 링크를 확인합니다. 문의·관리자 저장은 별도 개발 환경에서 성공·실패 결과와 DB 반영을 확인하고 운영에 시험 데이터를 남기지 않습니다.

포맷은 수정한 파일을 명시해 필요한 부분에만 적용합니다. 원본 archive의 SHA-256을 다시 확인하고 변경하지 않은 파일까지 대량 포맷하지 않습니다. 검증 결과에는 명령, 실행 환경, 통과한 범위와 아직 확인하지 않은 동작을 함께 남깁니다.

## Pull Request

현재 repository의 main에서 작업 branch를 만들고 변경 목적과 검증 결과를 정리합니다. PR에는 영향을 받는 화면·API·데이터와 필요한 운영 작업을 설명합니다. 사용자에게 보이는 변경은 README와 CHANGELOG에도 반영합니다. dependency를 추가할 경우 사용 이유와 bundle·운영 영향도 기록합니다.

commit 제목은 `feat`, `fix`, `docs`, `refactor`, `test`, `chore` 등의 종류와 구체적인 변경 내용을 사용합니다. 예를 들어 문의 검증 수정은 `fix(inquiry): validate phone input`, 문서 정리는 `docs: update current architecture`처럼 작성합니다.

push, merge와 운영 배포는 해당 작업에서 승인된 범위에 따라 진행합니다. 현재 저장소에는 push 자동 배포 workflow가 없습니다. 운영 app 교체·백업·rollback은 [배포 문서](deploy/vultr/README.md)를 따릅니다.
