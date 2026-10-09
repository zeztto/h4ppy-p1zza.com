# p1zza.kr 운영 배포

현재 저장소는 [zeztto/p1zza.kr](https://github.com/zeztto/p1zza.kr)이다.
현재 운영 서버는 `p1zza-2nd`이며 소스와 Compose 설정은 `/opt/p1zza-kr`에 있다.
배포 `service_name`과 Compose project는 `p1zza-kr`이며 DB volume
`p1zza-kr_postgres_data`를 유지한다. 실제 Compose app service 이름은 `app`이다.
app과 DB는 host port를 공개하지 않고, 기존 `caddy-gateway`가
`p1zza.kr` 요청을 `p1zza-kr-app-1:3001`로 전달한다.

## 환경 변수와 source 보존

운영 환경 변수는 서버의 `/opt/p1zza-kr/.env.local`에 보존한다. 소스를 전달할 때
실제 `.env`, `.env.*`, `*.env` 파일을 제외하고 운영 환경 파일을 덮어쓰지 않는다.
Tracked public template `.env.example`은 저장소 source와 함께 전달할 수 있다.

배포 전 DB custom dump, 기존 소스·환경 파일, Compose·Caddy 설정, 실행 image를
Git 밖의 접근 제한된 경로에 백업한다. Directory mode700, file mode600을 사용하고
문의·인증 데이터나 secret 값을 로그 또는 저장소에 넣지 않는다.

배포할 exact Git commit을 `git archive`로 private staging 경로에 전달하고 manifest/hash를
검증한 뒤 tracked source만 운영 경로에 overlay한다. 운영 env, untracked data, DB volume을
보존하며 전체 경로를 대상으로 하는 `rsync --delete`는 사용하지 않는다.
삭제되거나 archive로 이동한 tracked file은 이전 commit·운영 파일·원본 backup과
archive counterpart의 hash를 확인한 exact allowlist만 제거한다. Hash가 다르면 중단한다.

`VITE_TURNSTILE_SITE_KEY`는 browser에 공개되는 site key다. Compose가 이 값을
public `PUBLIC_TURNSTILE_SITE_ID` build arg와 runtime 환경 변수로 전달한다.
Vite가 이를 bundle에 포함하므로 site key를 바꾸면 app image를 다시 build해야 한다.
`TURNSTILE_SECRET_KEY`와 DB·OAuth·session secret은 runtime에만 전달한다.
배포할 Git commit의 전체 SHA를 `APP_REVISION`으로 전달하면 image의
`org.opencontainers.image.revision` label로 실행 버전을 확인할 수 있다.

## Target-side lock과 app-only release

GitHub-hosted runner와 직접 SSH release는 서버의 동일한 Compose lock을 사용한다.
아래 명령은 `p1zza-2nd`의 Bash에서 실행한다. 승인된 전체 commit SHA를
`APP_REVISION`으로 export하고 source overlay, build, 필요한 content apply, app 교체와
보존 검증을 같은 lock 안에서 진행한다.

```sh
set -euo pipefail
export APP_REVISION
: "${APP_REVISION:?승인된 commit의 전체 SHA를 먼저 설정하세요}"
exec 9>/run/lock/p1zza-deploy-compose.lock
flock -w 1800 9
cd /opt/p1zza-kr
# 검증된 exact SHA의 tracked source를 overlay한다. 운영 env/data는 보존한다.
docker compose --env-file .env.local -f compose.yml build app
image_id=$(docker image inspect --format '{{.Id}}' p1zza-kr-app:latest)
test "$(docker image inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image_id")" = "$APP_REVISION"
docker image tag "$image_id" "p1zza-kr-app:release-$APP_REVISION"
# Source/env parity와 bundle을 검증한다.
# 콘텐츠 변경이 있는 release만 검토한 dry-run/digest로 승인된 apply를 진행한다.
docker compose --env-file .env.local -f compose.yml up -d --no-deps --no-build app
for attempt in $(seq 1 45); do
  status=$(docker inspect --format '{{.State.Health.Status}}' p1zza-kr-app-1)
  [ "$status" = healthy ] && break
  sleep 2
done
test "$(docker inspect --format '{{.State.Health.Status}}' p1zza-kr-app-1)" = healthy
test "$(docker inspect --format '{{.Image}}' p1zza-kr-app-1)" = "$image_id"
test "$(docker inspect --format '{{.State.Health.Status}}' p1zza-kr-db-1)" = healthy
docker compose --env-file .env.local -f compose.yml exec -T app \
  wget -qO- http://127.0.0.1:3001/api/health
# 다른 서비스 ID/restart, DB volume, env, public HTTPS를 확인한다.
```

Lock은 검증이 끝난 뒤 shell이 종료될 때 해제된다. Build와 apply 사이에 lock을
해제하는 단계식 release라면 다음 단계에서 같은 SHA/image/env와 reviewed content digest를
다시 확인한다. App metadata만 바뀐 release에는 content apply나 DB seed가 필요하지 않다.

DB service를 recreate하거나 volume을 삭제하지 않는다. 새 문의를 보존하기 위해
일반 콘텐츠 rollback은 해당 release가 변경한 필드만 조건부 transaction으로 복구한다.
Image rollback은 보존한 immutable image와 exact source를 사용해 같은 lock 아래에서
`up -d --no-deps --no-build app`으로 app만 교체한다.

중앙 `zeztto/p1zza-1st-self-hosted-runner`의 generic workflow를 사용하는 경우 repository
입력은 `zeztto/p1zza.kr`, service_name은 `p1zza-kr`이다. 그 workflow의 전체 Compose
release와 위의 app-only release는 적용 범위가 다르므로 명시적으로 검토해 선택한다.

`stage.sh`는 과거 `p1zza-1st`와 host port3001을 전제로 작성된 historical utility다.
현재 운영 release에서는 실행하지 않으며 위의 `p1zza-2nd` 절차를 사용한다.

## Caddy와 domain

기존 `/opt/caddy/Caddyfile`은 `/etc/caddy/sites-enabled/*`를 import한다.
현재 site 파일은 `/opt/caddy/sites-enabled/p1zza-kr.caddy`이며 gateway는
`p1zza-kr_default` network에 연결되어 있다. app 콘텐츠·bundle 교체에는
Caddy 변경이나 gateway restart가 필요하지 않다.

- Canonical origin: `APP_ORIGIN=https://p1zza.kr`
- Canonical redirect hosts: `CANONICAL_REDIRECT_HOSTS=www.p1zza.kr`
- GitHub repository rename은 운영 domain·경로·Compose project·volume을 바꾸지 않는다.

Domain 정책을 변경할 때는 [p1zza.kr.caddy](p1zza.kr.caddy)의 예시와 실제 gateway 설정을
대조하고 해당 site 파일을 검증한 뒤 별도의 승인된 절차로 적용한다.
