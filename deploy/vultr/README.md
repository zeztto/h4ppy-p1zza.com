# Vultr Deploy Notes

## App Compose

- active host: `p1zza-2nd`
- previous host: `p1zza-1st` remains a rollback/reference target until cutover is closed
- copy this repository to `/opt/p1zza-kr`
- keep the compose project name as `p1zza-kr` so the Docker network becomes `p1zza-kr_default`
- provide production secrets in `/opt/p1zza-kr/.env.vultr`
- run with `docker compose --env-file .env.vultr up -d --build`
- Railway에서 값 추출 시 `npm run env:railway:export -- --output .env.vultr --postgres-password '<strong-password>' --include-legacy`를 사용하면 runtime 변수와 Postgres 변수, legacy Turso migration 변수를 함께 생성할 수 있습니다.
- `bash deploy/vultr/stage.sh --env-file .env.vultr`를 사용하면 `p1zza-2nd`로 rsync, env 업로드, `docker compose up -d --build`, `/api/health` 확인까지 한 번에 실행할 수 있습니다.
- 첫 staging bring-up 뒤에는 `docker compose --env-file .env.vultr exec db sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\''\dt'\'''` 로 schema를 확인합니다.

## Caddy

- do not install or edit a host-level Caddy service
- use the existing Docker gateway at `/opt/caddy`
- `/opt/caddy/Caddyfile` imports `/etc/caddy/sites-enabled/*`
- create `/opt/caddy/sites-enabled/p1zza-kr.caddy` from [p1zza.kr.caddy](/Users/sungwoonjeon/dev/h4ppy-p1zza.com/deploy/vultr/p1zza.kr.caddy)
- connect `caddy-gateway` to `p1zza-kr_default`
- validate and reload the existing `caddy-gateway`; do not recreate unrelated gateway state

## Domain Policy

- `APP_ORIGIN=https://p1zza.kr`
- `CANONICAL_REDIRECT_HOSTS=www.p1zza.kr`
- do not attach `h4ppy-p1zza.com` to this service
