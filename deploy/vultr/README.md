# Vultr Deploy Notes

## App Compose

- copy this repository to `/opt/p1zza-kr`
- keep the compose project name as `p1zza-kr` so the Docker network becomes `p1zza-kr_default`
- provide production secrets in `/opt/p1zza-kr/.env.local`
- run with `docker compose --env-file .env.local up -d --build`
- Railway에서 값 추출 시 `npm run env:railway:export -- --output .env.vultr --postgres-password '<strong-password>' --include-legacy`를 사용하면 runtime 변수와 Postgres 변수, legacy Turso migration 변수를 함께 생성할 수 있습니다.
- `bash deploy/vultr/stage.sh --env-file .env.vultr`를 사용하면 rsync, `.env.local` 업로드, `docker compose up -d --build`, `/api/health` 확인까지 한 번에 실행할 수 있습니다.
- 첫 staging bring-up 뒤에는 `docker compose --env-file .env.local exec db sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\''\dt'\'''` 로 schema를 확인합니다.

## Caddy

- do not install or edit a host-level Caddy service
- use the existing Docker gateway at `/opt/caddy`
- add `import /etc/caddy/sites-enabled/p1zza-kr/*.caddy` to `/opt/caddy/Caddyfile`
- create `/opt/caddy/sites-enabled/p1zza-kr/p1zza.kr.caddy` from [p1zza.kr.caddy](/Users/sungwoonjeon/dev/h4ppy-p1zza.com/deploy/vultr/p1zza.kr.caddy)
- extend `/opt/caddy/docker-compose.yml` with the external network `p1zza-kr_default`
- recreate only the `caddy-gateway` container after validating the config

## Domain Policy

- `APP_ORIGIN=https://p1zza.kr`
- `CANONICAL_REDIRECT_HOSTS=www.p1zza.kr`
- do not attach `h4ppy-p1zza.com` to this service
