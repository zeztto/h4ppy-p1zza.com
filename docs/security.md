# 보안 운영

현재 앱의 인증·입력·운영 권한 계약과 검증 방법을 정리한다. npm advisory의 설치 여부와 실제 공격 경로는 별도 판단이며, audit 결과만으로 전체 보안을 보증하지 않는다.

## 관리자 session과 로그아웃

GitHub OAuth callback과 기존 session 요청은 모두 현재 `ADMIN_GITHUB_LOGINS`와 관리자 role을 확인한다. 회수된 identity는 session을 연장하지 않으며 관리자 API에 접근할 수 없다. Session은 idle 7일, 발급 후 절대 30일 한도를 적용한다. 승인 목록 변경은 새 설정으로 앱을 시작한 뒤 반영된다.

Session token은 browser의 Secure·HttpOnly·SameSite cookie에 저장하며 DB에는 hash만 저장한다. 인증 및 관리자 JSON은 `Cache-Control: no-store, private`를 사용한다. Logout은 서버 session 폐기가 성공한 뒤 UI를 이동한다. 요청 실패나 서버 오류 때에는 사용자에게 한국어 오류와 재시도를 제공하며 완료로 표시하지 않는다.

## 공개 문의

문의 필드의 길이와 형식을 외부 provider 및 DB 호출 전에 검사한다. Email은 최대 254자, Turnstile token은 최대 2,048자다. 다른 필드 한도는 [공통 계약](../src/shared/inquiry-contract.ts)에서 frontend와 backend가 함께 사용한다. 긴 이메일을 정규식에 그대로 넣지 않는다.

방문자 IP는 명시적으로 승인한 proxy 경계를 통과한 `req.ip`를 사용한다. 임의 `X-Forwarded-For`나 `CF-Connecting-IP`를 직접 신뢰하지 않는다. 요청 횟수와 CAPTCHA 동시 검증을 제한하며, 외부 검증에는 timeout을 적용한다. 한도 초과와 검증 실패는 DB에 문의를 저장하지 않는다.

신규 유입 URL은 HTTP(S)만 허용한다. 기존 저장 행의 값도 화면에서 확인해 unsafe protocol은 클릭 가능한 링크로 만들지 않는다. 원본 문의와 기존 콘텐츠는 삭제하지 않는다.

## DB 및 container

Production 앱은 준비된 schema와 CRUD 전용 계정으로 시작한다. DB superuser, 역할·DB 생성·replication 권한, schema 생성 및 table ownership를 앱 계정에 주지 않는다. 앱 계정에는 다른 role의 membership을 주지 않고 직접 필요한 CRUD 권한만 부여한다. Startup은 실제 session/current role의 속성과 membership을 확인한다. Role의 직접 속성과 role 전환 권한은 별도이므로 둘 다 검사한다. [PostgreSQL role membership](https://www.postgresql.org/docs/17/role-membership.html)

앱 계정의 실제 DB·다른 schema grant도 배포 때 따로 확인한다. 해당 DB에 다른 consumer가 없음을 확인한 뒤 기본 `PUBLIC TEMPORARY`를 회수해 임시 table 생성도 거부한다. 원본 ACL과 권한 복구 절차를 보존한다. Startup guard는 지정한 속성·membership·public schema·application table 계약을 검사하며 모든 object ACL의 부재를 전수 증명하지 않는다.

Schema 변경은 `MIGRATION_DATABASE_URL`을 사용하는 `db:bootstrap` one-off 명령으로 분리한다. 기존 DB bootstrap은 초기 콘텐츠의 재설정을 하지 않는다.

PostgreSQL은 검증한 17.11 patch로 고정한다. 17.9 운영 DB의 갱신은 기존 volume을 유지하며 수행하고, 사전에 private dump의 복원 가능 여부와 기존 행의 count·hash를 확인한다. 이 patch에는 SQL 실행·권한 처리 등의 보안 수정이 포함되어 있다. 확장 모듈과 replication 사용 여부를 먼저 확인해 필요한 후속 조치가 있는지 판단한다. [PostgreSQL 17.11 release notes](https://www.postgresql.org/docs/release/17.11/)

앱 container는 non-root, capability 제거, no-new-privileges, read-only rootfs를 사용한다. 필요한 임시 쓰기 경로만 별도로 허용한다. DB volume은 기존 이름과 내용을 보존하며 app과 DB의 host port는 공개하지 않는다.

Production은 HTTPS origin과 필수 secret을 요구하며 알려진 default credential이나 placeholder 값으로 시작하지 않는다. `TRUSTED_PROXY_CIDRS`는 Caddy peer의 정확한 주소 범위만 사용한다. HSTS는 제한적인 max-age로 적용하고 다른 subdomain이나 preload를 자동으로 포함하지 않는다.

## Secret 파일과 dependency

`.env.*`는 Git 추적에서 제외하고 `.env.example`만 허용한다. Runtime secret은 Docker build context와 browser bundle에 넣지 않는다. Turnstile site key는 공개 식별자이고 server secret과 구분한다. Backup과 export는 Git 밖의 private directory에 저장한다.

Legacy Railway export는 `--output` 또는 명시적인 `--stdout`을 요구한다. 파일 출력은 private parent directory의 새 파일에 mode 600으로 만들고, 기존 파일·symlink를 거부한다. Password는 command argument가 아니라 환경으로 전달한다. 출력은 Docker Compose env-file 형식이며 shell에서 source하지 않는다. Error에 provider의 secret 응답을 출력하지 않는다.

Dependency 갱신은 직접 package와 실제 resolved branch를 함께 확인한다. Major force update나 오래된 도구로의 자동 downgrade를 사용하지 않는다. Scoped override는 해당 도구의 실제 config load와 smoke로 호환성을 확인한다.

```sh
npm ci
npm test
npm run type-check
npm run lint
npm run build
npm audit
npm audit --omit=dev
```

보안 회귀 시험은 local disposable DB와 격리된 browser 환경에서 한다. 운영에 공격 payload·test 문의·test identity를 넣지 않는다. 배포 때에는 [배포 절차](../deploy/vultr/README.md)의 target lock, backup, source/image 일치, health와 데이터 보존·rollback 검증을 따른다.
