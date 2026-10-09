# Vultr 운영 배포

현재 운영 서버는 `p1zza-2nd`이며 소스와 Compose 설정은 `/opt/p1zza-kr`에 있다.
Compose project `p1zza-kr`와 DB volume `p1zza-kr_postgres_data`를 유지한다.
app과 DB는 host port를 공개하지 않고, 기존 `caddy-gateway`가
`p1zza.kr` 요청을 `p1zza-kr-app-1:3001`로 전달한다.

## 환경 변수와 build

운영 환경 변수는 서버의 `/opt/p1zza-kr/.env.local`에 보존한다. 소스를 전달할 때
`.env`, `.env.*`, `*.env` 파일을 제외하고, 운영 환경 파일을 덮어쓰지 않는다.

`VITE_TURNSTILE_SITE_KEY`는 browser에 공개되는 site key다. Compose가 이 값을
public `PUBLIC_TURNSTILE_SITE_ID` build arg와 runtime 환경 변수로 함께 전달한다. Docker build 단계에서
Vite가 이를 bundle에 포함하므로 site key를 바꿀 때 app image를 다시 build해야 한다.
`TURNSTILE_SECRET_KEY`와 DB·OAuth·session secret은 runtime에만 전달한다.
배포할 Git commit의 전체 SHA를 `APP_REVISION`으로 전달하면 image의
`org.opencontainers.image.revision` label로 실행 버전을 확인할 수 있다.

배포 전 DB custom dump, 기존 소스·환경 파일, Compose·Caddy 설정, 실행 image를
Git 밖의 접근 제한된 경로에 백업한다. 소스와 schema migration 검증이 끝난 뒤
서버에서 app만 build하고 교체한다.

```sh
cd /opt/p1zza-kr
: "${APP_REVISION:?배포할 commit의 전체 SHA를 설정하세요}"
docker compose --env-file .env.local -f compose.yml build app
# 승인된 콘텐츠 migration을 적용한 뒤 app만 교체한다.
docker compose --env-file .env.local -f compose.yml up -d --no-deps --no-build app
docker compose --env-file .env.local -f compose.yml exec -T app \
  wget -qO- http://127.0.0.1:3001/api/health
```

DB service를 recreate하거나 volume을 삭제하지 않는다. DB 백업 전체 restore는
새 문의를 덮어쓸 수 있으므로 일반 콘텐츠 rollback에는 변경한 콘텐츠 행만 복구한다.
image rollback은 백업한 image와 Compose 설정을 복구하고 `--no-build --no-deps app`으로
app만 교체한다.

`stage.sh`는 과거 `p1zza-1st`와 host port 3001을 전제로 작성되었다.
현재 운영 release에는 위의 `p1zza-2nd` 절차를 사용한다.

## Caddy와 domain

기존 `/opt/caddy/Caddyfile`은 `/etc/caddy/sites-enabled/*`를 import한다.
현재 site 파일은 `/opt/caddy/sites-enabled/p1zza-kr.caddy`이며 gateway는
`p1zza-kr_default` network에 연결되어 있다. app 콘텐츠·bundle 교체에는
Caddy 변경이나 gateway restart가 필요하지 않다.

- `APP_ORIGIN=https://p1zza.kr`
- `CANONICAL_REDIRECT_HOSTS=www.p1zza.kr`
- `h4ppy-p1zza.com`은 이 서비스에 연결하지 않는다.

별도 domain 정책을 바꿀 때만 [p1zza.kr.caddy](p1zza.kr.caddy)의 예시와 실제
gateway 설정을 대조하고, 변경할 site 파일을 검증한 뒤 적용한다.
