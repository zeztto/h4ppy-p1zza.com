# p1zza.kr 운영 배포

저장소는 [zeztto/p1zza.kr](https://github.com/zeztto/p1zza.kr), 운영 서버는 `p1zza-2nd`,
source 경로는 `/opt/p1zza-kr`다. Compose project와 service_name은 `p1zza-kr`,
실행 service는 `app`과 `db`다. DB volume `p1zza-kr_postgres_data`를 유지한다.
app3001과 DB5432는 host에 publish하지 않는다. 기존 `caddy-gateway`가
`p1zza.kr`을 `p1zza-kr-app-1:3001`로 전달한다.

## Runtime과 migration 권한

app image는 `USER node`(UID1000), capabilities ALL 제거, no-new-privileges,
read-only root filesystem으로 실행한다. 쓰기 가능한 `/tmp`는16MiB tmpfs이며
noexec/nosuid다. app에 host source·backup·Docker socket mount를 추가하지 않는다.

`DATABASE_URL`은 app 전용 CRUD role을 사용한다. 이 role은 SUPERUSER, CREATEDB,
CREATEROLE, REPLICATION, BYPASSRLS, DB/schema CREATE, application table ownership 및 해당 owner role
membership을 갖지 않는다. 다른 어떤 role에도 MEMBER가 아니며 직접 grant만 사용한다.
동명 role이 이미 계약과 다른 경우 자동 권한 제거 없이 baseline을 lead에 보고한다.
DB CONNECT와 `public` schema USAGE, 기존7개 application table의
SELECT/INSERT/UPDATE/DELETE만 부여한다. 현재 sequence는0개이며 sequence grant는 하지 않는다. 새 table이 생기는
migration에서는 필요한 grant와 migration owner의 default privileges도 확인한다.
다른 schema의 CREATE/ownership와 실제 DDL 거부는 별도로 검증한다. Startup guard가
임의의 모든 ACL을 검사한다고 가정하지 않는다.

Production startup은 schema 준비 여부와 role 권한을 읽기로 확인하고 schema 생성이나
seed를 실행하지 않는다. `MIGRATION_DATABASE_URL`은 별도 privileged connection이며
maintenance profile의 일회성 `migration` service에만 전달한다.
`node build/server/db/bootstrap-entry.js`는 schema-only bootstrap을 실행하고
seedDefaults를 호출하지 않는다. app environment에 이 credential을 넣지 않는다.

기존 DB에 role을 준비할 때는 먼저 private custom dump와 행 hash baseline을 보존한다.
새 role 생성·grant와 private env 교체는 lead의 exact release directive 이후 수행한다.
기존 table owner, 행, volume은 바꾸지 않는다. Bootstrap 전후 모든 기존 행의
hash가 같아야 하며 변경이 발견되면 app 교체를 중단하고 lead에 보고한다.

### Exact role 준비와 ACL rollback

Role/env 준비도 exact release directive 이후 같은 target flock 안에서 수행한다. 먼저 DB
original ACL, LOGIN role의 CONNECT 가능 여부, owner·membership·grant와 기존 행 hash를
private snapshot에 기록한다. 현재 owner/superuser LOGIN1개, 다른 non-superuser CONNECT
consumer0개, `p1zza_app` 없음이다. 직전 재검증에서 동명 role이 예상 밖 상태로 존재하거나
다른 consumer가 발견되면 자동 role 변경·PUBLIC 권한 제거 없이 중단해 lead에 보고한다.

새 password는 private runner에서 생성하고 private stdin/0600 파일로만 전달한다. 다음
SQL의 `app_password` psql variable은 그 private 전달 경로로 준비하며 shell argument,
stdout, Git 또는 public template에 실제 값을 넣지 않는다.

```sql
BEGIN;
CREATE ROLE p1zza_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOREPLICATION NOBYPASSRLS PASSWORD :'app_password';
GRANT CONNECT ON DATABASE p1zza TO p1zza_app;
GRANT USAGE ON SCHEMA public TO p1zza_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.projects, public.site_profile, public.site_sections, public.site_settings,
  public.admin_users, public.inquiries, public.sessions TO p1zza_app;
REVOKE TEMPORARY ON DATABASE p1zza FROM PUBLIC;
COMMIT;
```

PUBLIC TEMPORARY revoke는 target portfolio DB에 한정하고 다른 non-superuser CONNECT
consumer가 없다는 재검증을 통과할 때만 수행한다. 기존 owner/superuser의 TEMP 사용과
데이터·ownership은 유지된다. 새 role은 membership0, DB CREATE/TEMP 및 다른 schema
CREATE/ownership 없음,7개 table 직접 CRUD만 확인한다. 실제 app credential의 CREATE TEMP
TABLE·schema/table DDL이42501로 거부되는지 rollback transaction으로 검증한다. 이후
`DATABASE_URL`만 새 CRUD connection으로 바꾸고 기존 privileged connection은 migration
전용 `MIGRATION_DATABASE_URL`로 보존한다. Provider/session secret은 그대로 유지한다.

ACL rollback은 app/image/schema rollback과 분리해 lead가 판단한다. 원래 PUBLIC TEMP
grant를 복구하려면 같은 target DB에서 `GRANT TEMPORARY ON DATABASE p1zza TO PUBLIC;`을
사용하고 private original ACL과 유효 권한을 대조한다. 새 role 삭제나 full DB restore를
자동 실행하지 않는다. 다른 consumer가 존재하는 조건에서는 원래 ACL을 보존한다.

## 필수 환경과 proxy

운영 환경은 `/opt/p1zza-kr/.env.local`에 root 소유0600으로 보존한다. 필수
DATABASE_URL, MIGRATION_DATABASE_URL, SESSION_SECRET, OAuth/Turnstile,
POSTGRES_PASSWORD, TRUSTED_PROXY_CIDRS가 없으면 Compose가 실패한다.
`.env.example`은 설명용 public template이다. Production app은 placeholder를 거부하고
SESSION_SECRET의 최소 길이와 HTTPS APP_ORIGIN 등을 추가 검증한다.
Cloudinary는 기존 URL 또는 split credentials 방식을 유지한다.

`TRUSTED_PROXY_CIDRS`는 현재 Caddy의 `p1zza-kr_default` IPv4 주소 하나의 `/32`다.
실제 주소는 private 운영 env에만 저장한다. public template의 loopback 값은 운영 값이
아니다. app은 첫 peer hop만 신뢰하고 forwarded origin을 CSRF 허용 origin으로 추가하지
않는다. Gateway recreate/network 변경 때 peer IP를 다시 확인하고 승인된 env 변경과
app-only recreate를 함께 진행해야 한다. 넓은 network CIDR나 숫자 hop 설정은 사용하지 않는다.

Caddy는 현재 client X-Forwarded-For/Host/Proto를 신뢰하지 않고 자체 생성한다.
공유 gateway의 trusted_proxies/header_up 정책을 다른 service 변경과 함께 바꾸지 않는다.
HSTS `max-age=2592000`은 app의 production canonical HTTPS 응답에서 제공한다.
includeSubDomains/preload는 사용하지 않으며 이번 release에는 Caddy 변경이 필요 없다.

`VITE_TURNSTILE_SITE_KEY`는 공개 browser 식별자다. Compose는 이를 public build arg
`PUBLIC_TURNSTILE_SITE_ID`와 runtime env로 전달한다. Sitekey 변경 시 image를 다시
build한다. TURNSTILE_SECRET_KEY, DB/OAuth/session secret은 runtime에만 전달하고
`.env`, `.env.*`, `*.env`는 build context/source 전달에서 제외한다. Tracked public
`.env.example`만 source archive에 포함할 수 있다.

## 승인된 exact source 배포

`stage.sh`는 현재 서버를 대상으로 하는 guarded release 도구다. 과거 `p1zza-1st`
default, `--delete`, `--no-build`, 전체 Compose up, host port3001 health probe는 제거했다.
아래 명령은 **lead의 release directive를 받은 뒤에만** 실행한다.

```sh
bash deploy/vultr/stage.sh --revision "$APPROVED_FULL_SHA"
```

다른 host와 `/opt/p1zza-kr` 이외 경로, full40자 SHA가 아닌 값은 거부한다.
Git archive로 exact commit의 tracked source만 private staging에 전달한다. Source에 실제
환경 파일이나 symlink/path traversal이 있으면 중단한다. Manifest hash 검증 뒤 source만
overlay하고 실행 bit를 보존한다. Env/untracked data/기존 경로를 삭제하지 않는다.
과거 tracked file 삭제는 이 도구가 자동 처리하지 않으며 이전 source·backup·archive
hash를 확인한 별도 exact allowlist와 release 승인이 필요하다. rsync --delete는 사용하지 않는다.

기본 동작은 기존 운영 env를 그대로 보존한다. 승인된 role/proxy/secret 변경이 있는
release만 `--env-file /private/directory/release.env`를 명시한다. Upload source는 현재
사용자 소유 regular file0600과 private parent directory가 필요하다. Source/env 후보의
Compose config와 exact Caddy peer를 검증한 뒤 install0600으로 반영한다. Env 후보와
로그는 staging/backup의700 directory 아래600 file로 보존한다. 실제 값을 stdout에 출력하지 않는다.

서버는 중앙 generic workflow와 같은 `/run/lock/p1zza-deploy-compose.lock`을 FD9으로
획득한다. Target identity 확인, private DB/source/env/image backup, source overlay,
app-only build, DB minor patch, schema-only migration, app-only recreate와 보존 검증을 이 lock에서 수행한다.
Build/migration log는 private backup에 기록한다. 실행 순서는 다음과 같다.

```sh
exec 9>/run/lock/p1zza-deploy-compose.lock
flock -w 1800 9
cd /opt/p1zza-kr
export APP_REVISION="$APPROVED_FULL_SHA"
# Exact source와 private env 검증·backup은 stage.sh가 수행한다.
docker compose --env-file .env.local -f compose.yml build app
# image의 revision label, USER node, package/version·bundle·secret 부재를 검증한다.
docker compose --env-file .env.local -f compose.yml pull db
# 새 CRUD connection의 readonly readiness를 먼저 확인한다.
docker compose --env-file .env.local -f compose.yml stop app
# App pause 후 fresh dump·행 hash를 보존한 뒤 같은 volume으로 DB만 교체한다.
docker compose --env-file .env.local -f compose.yml up -d --no-deps --no-build db
# DB17.11 healthy, volume·행 hash·extension/replication inventory를 확인한다.
docker compose --env-file .env.local -f compose.yml --profile maintenance \
  run -T --interactive=false --rm --no-deps migration < /dev/null
# 기존 행 hash 보존과 CRUD readiness를 확인한 뒤 app만 교체한다.
docker compose --env-file .env.local -f compose.yml up -d --no-deps --no-build app
docker compose --env-file .env.local -f compose.yml exec -T --interactive=false app \
  wget -qO- http://127.0.0.1:3001/api/health < /dev/null
```

DB가 먼저 존재하고 healthy여야 한다. DB는 검증된
`postgres:17.11-alpine@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`
로 pin한다. 기존17.9에서17.11로의 minor patch는 같은 volume을 사용하며 dump/restore
data migration을 실행하지 않는다. [17.10](https://www.postgresql.org/docs/release/17.10/)과
[17.11 release notes](https://www.postgresql.org/docs/release/17.11/)를 검토하고, 운영 inventory는
plpgsql만 존재·replication slots/senders/subscriptions/publications0·wal_level=replica·archive_mode=off다.
locale은 libc/en_US.utf8이며 recorded/actual collation version은 null이다. 다른 extension,
replication 또는 locale 상태가 발견되면 자동 진행하지 않는다. btree_gist/ltree reindex나
logical output plugin 설정 변경은 현재 inventory에 적용되지 않는다. 원본 private dump의
복원 proof는 운영 volume과 분리한 network-none PostgreSQL17.11 fixture에서만 수행한다.

App build와 backup을 먼저 끝내고, 기존 app을 잠시 멈춘 뒤 DB patch→healthy→schema-only
migration/readiness→새 app으로 진행한다. 정상 문의 write와 구버전 app connection 재시작이
patch 검증과 경쟁하지 않게 한다. Pause부터 app health까지 UTC timestamp와 초 단위를
private evidence에 기록한다. Fresh pause 이후 dump도 최종 checksum manifest에 포함한다. Migration
profile을 app의 depends_on으로 연결하지 않는다. Image에 full Git SHA revision label을
기록하고 `p1zza-kr-app:release-$APP_REVISION` immutable tag를 보존한다.
Stage의 최종 검증은 app health/image/hardening, source/env hash, DB volume,
다른20개 container(Caddy 포함)의 ID/image/start/restart와 Caddy peer 일치를 포함한다.
App와 DB는 별도 image/version/health/volume 검사로 보호한다. Public HTTPS,
기존7개 table의 count/row hash는 migration 전후 동일해야 하며 source/runtime role의
read-only readiness도 app 교체 전에 확인한다. 동시 사용자 변경으로 hash가 달라도
자동 복구하지 않고 중단하여 lead가 구분한다. 추가 public 기능 검증은 release gate에 포함한다.
전체 stack down/up, volume
삭제, seedforce, shared Caddy restart는 하지 않는다.

SSH의 Bash heredoc은 배포 명령 전체를 stdin으로 전달한다. Compose one-off `run`과
`exec`는 `-T`로 TTY를 끄고 `--interactive=false`와 `</dev/null`로 stdin도 명시적으로 닫아 뒤 Bash 명령을
소비하지 않게 한다. `-T`만으로 stdin이 닫히지는 않는다. 두 interactive flag는 실제 운영 Compose에서 지원되는지 확인한다. DB restore 목록 확인의
`docker exec -i ... < private.dump`와 SQL의 명시적 input은 필요한 전달이므로 유지한다.
다른 Docker/Compose 명령은 attached interactive mode나 stdin source를 사용하지 않는다.
Release caller는 SSH exit0만으로 성공을 판단하지 않고 최종 runtime·보존 검증 이후
출력되는 exact revision의 `P1ZZA_RELEASE_COMPLETE` marker를 확인한다. Marker가 없으면
private log와 실제 health/image/source를 확인하고 critical phase를 자동 재실행하지 않는다.

## Read-only app에서 콘텐츠 CLI 실행

상시 app filesystem은 쓰기 불가하므로 compiled `content:refresh`의 `--output`을 `/app`에
두지 않는다. 승인된 콘텐츠 release는 Git 밖 root 소유700 backup parent 아래 node
UID1000 전용700 subdirectory를 만들고 해당 subdirectory만 one-off container에 bind한다.
상시 app에 backup mount를 추가하지 않는다.

```sh
umask 077
private_parent=/opt/p1zza-kr-backups/approved-content-release
install -d -m 700 "$private_parent"
install -d -m 700 -o 1000 -g 1000 "$private_parent/cli-output"
# $private_parent/cli.env는 root 소유600이며 DATABASE_URL만 포함한다.
# Credential은 승인된 private env에서 파일로 준비하고 stdout에 출력하지 않는다.
docker run --rm --user 1000:1000 --read-only --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m,mode=1777 \
  --network p1zza-kr_default --env-file "$private_parent/cli.env" \
  --mount "type=bind,source=$private_parent/cli-output,target=/release-output" \
  "$APPROVED_IMMUTABLE_IMAGE" \
  node build/server/scripts/refresh-portfolio-content.js \
  --output /release-output/dryrun.json > "$private_parent/cli-stdout.json"
```

Private parent가700이므로 host의 node UID도 상위 backup 전체를 탐색할 수 없고 Docker
bind를 통해 전용 output만 사용한다. Output/log는600인지 검증한다. Dry run은 DB를
수정하지 않는다. `--apply --expected-digest`는 lead가 private plan의 exact delta를 검토하고
승인한 뒤 같은 lock 안에서 사용한다. CLI credential은 최소 DB env만 전달하며 OAuth/
provider secret을 이 one-off에 넣지 않는다. 종료 후 임시 credential 파일은 제거하고
원본 backup과 release evidence는 유지한다. 신규 test/seed 데이터는 운영에 넣지 않는다.

## 실패와 rollback

실패 시 private backup 경로를 보고하고 자동 full DB restore를 하지 않는다. 원본 문의와
동시 사용자 데이터를 덮어쓰지 않는다. 같은 lock에서 보존된 immutable image/source를
복구하고, 구버전 startup에 필요한 이전 private env를 복구해 app을 recreate하는 rollback을
lead와 결정한다. 구버전 image의 privileged bootstrap에는 최신 CRUD env를 재사용하지 않는다.
Pre-role backup 또는 첫 보안 stage의 original source-env archive에 보존한 superuser DSN
env를 이전 working image/config와 묶어 복구한다. 이전 DB image도 private gzip archive와 image ID로 보존한다. DB image
rollback이 필요하면 app을 멈춘 상태에서 같은 volume을 유지한 private Compose override로
`db`만 `up -d --no-deps --no-build`하고 healthy/version/mount/행 hash를 확인한다. DB의
minor version downgrade는 release notes·catalog/extension 변경 여부를 확인해 lead가 결정한다.
DB가 정상17.11이면 app rollback을 위해 DB까지 되돌릴 필요가 없다.
새 CRUD role을 지우거나 기존 table owner/volume을 바꾸지 않는다.
Rollback 때도 app/DB health, env, DB 행 보존, 다른 service identity를 재확인한다.

중앙 `zeztto/p1zza-1st-self-hosted-runner` workflow는 repository=`zeztto/p1zza.kr`,
service_name=`p1zza-kr`을 받는 generic 배포다. 전체 Compose release 경로와 이 문서의
app·DB minor patch/migration 절차는 범위가 다르므로 이 보안 release에 자동으로 대체 사용하지 않는다.

## Domain 보존

Canonical origin은 `https://p1zza.kr`, app의 canonical alias 설정은 `www.p1zza.kr`이다.
현재 gateway site는 `/opt/caddy/sites-enabled/p1zza-kr.caddy`이고 Caddyfile은
`/etc/caddy/sites-enabled/*`를 import한다. 저장소의 [p1zza.kr.caddy](p1zza.kr.caddy)는
alias를 포함한 예시이며 domain 정책을 실제로 바꾸려면 별도 검증·승인이 필요하다.
Repo rename이나 app 보안 release로 운영 domain/path/project/volume을 바꾸지 않는다.
