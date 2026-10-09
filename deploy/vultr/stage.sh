#!/usr/bin/env bash

set -euo pipefail
umask 077

REMOTE_HOST=p1zza-2nd
REMOTE_DIR=/opt/p1zza-kr
REVISION=""
ENV_FILE=""

usage() {
  cat <<'EOF'
Usage: bash deploy/vultr/stage.sh --revision <approved-full-Git-SHA> [options]

  --host <ssh-host>     Only p1zza-2nd is accepted (default: p1zza-2nd)
  --remote-dir <path>   Only /opt/p1zza-kr is accepted
  --env-file <path>     Explicitly replace env from a private 0600 file
  --help               Show this help

This command changes production. Run only after the lead release directive.
It preserves env by default, never deletes remote source/data, and changes
only app and the pinned portfolio DB. Schema-only migration never invokes seeds.
EOF
}

fail() { printf '%s\n' "$1" >&2; exit 1; }
while [[ $# -gt 0 ]]; do
  case "$1" in
    --host|--remote-dir|--revision|--env-file)
      [[ $# -ge 2 && -n "$2" && "$2" != --* ]] || fail "Missing option value"
      case "$1" in
        --host) REMOTE_HOST="$2" ;;
        --remote-dir) REMOTE_DIR="$2" ;;
        --revision) REVISION="$2" ;;
        --env-file) ENV_FILE="$2" ;;
      esac
      shift 2
      ;;
    --help) usage; exit 0 ;;
    *) fail "Unsupported option; deletion and whole-stack deployment are prohibited" ;;
  esac
done
[[ "$REMOTE_HOST" = p1zza-2nd && "$REMOTE_DIR" = /opt/p1zza-kr ]] || fail "Unexpected production target"
[[ "$REVISION" =~ ^[0-9a-f]{40}$ ]] || fail "An approved full Git SHA is required"
for tool in git python3 ssh scp; do command -v "$tool" >/dev/null || fail "Missing required tool: $tool"; done
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
[[ "$(git -C "$ROOT_DIR" rev-parse "$REVISION^{commit}")" = "$REVISION" ]] || fail "Revision is not an exact commit"

if [[ -n "$ENV_FILE" ]]; then
  python3 - "$ENV_FILE" <<'PY'
import os,pathlib,stat,sys
p=pathlib.Path(sys.argv[1]);s=p.lstat()
if not stat.S_ISREG(s.st_mode) or stat.S_IMODE(s.st_mode)!=0o600 or s.st_uid!=os.getuid():
    raise SystemExit('Env upload requires an owned regular 0600 file')
if stat.S_IMODE(p.parent.stat().st_mode)&0o077:
    raise SystemExit('Env upload requires a private parent directory')
PY
fi

LOCAL_STAGE="$(mktemp -d "${TMPDIR:-/tmp}/p1zza-release.XXXXXX")"
trap 'rm -rf -- "$LOCAL_STAGE"' EXIT
chmod 700 "$LOCAL_STAGE"
git -C "$ROOT_DIR" archive "$REVISION" > "$LOCAL_STAGE/source.tar"
python3 - "$LOCAL_STAGE" <<'PY'
import hashlib,json,pathlib,sys,tarfile
root=pathlib.Path(sys.argv[1]);manifest={}
with tarfile.open(root/'source.tar') as t:
    for m in t.getmembers():
        p=pathlib.PurePosixPath(m.name)
        if p.is_absolute() or '..' in p.parts or m.issym() or m.islnk():
            raise SystemExit('Unsafe source archive path')
        if m.isfile():
            if (p.name=='.env' or p.name.startswith('.env.') or p.name.endswith('.env')) and p.name!='.env.example':
                raise SystemExit('Actual env file must never enter source archive')
            manifest[m.name]=hashlib.sha256(t.extractfile(m).read()).hexdigest()
(root/'manifest.json').write_text(json.dumps(manifest,sort_keys=True)+'\n')
PY
REMOTE_STAGE="/opt/p1zza-kr-backups/security-staging/$REVISION-$(date -u +%Y%m%dT%H%M%SZ)-$$"
ssh "$REMOTE_HOST" bash -s -- "$REMOTE_STAGE" <<'PREPARE'
set -euo pipefail
umask 077
[[ "$1" == /opt/p1zza-kr-backups/security-staging/* ]]
mkdir -p "$1"
chmod 700 "$1"
PREPARE
scp -q "$LOCAL_STAGE/source.tar" "$LOCAL_STAGE/manifest.json" "$REMOTE_HOST:$REMOTE_STAGE/"
if [[ -n "$ENV_FILE" ]]; then scp -q "$ENV_FILE" "$REMOTE_HOST:$REMOTE_STAGE/env.candidate"; fi

ssh "$REMOTE_HOST" bash -s -- "$REVISION" "$REMOTE_STAGE" <<'REMOTE' | tee "$LOCAL_STAGE/remote-release.log"
set -euo pipefail
umask 077
revision="$1"
staging="$2"
remote_dir=/opt/p1zza-kr
[[ "$revision" =~ ^[0-9a-f]{40}$ && "$staging" == /opt/p1zza-kr-backups/security-staging/"$revision"-* ]] || exit 1
exec 9>/run/lock/p1zza-deploy-compose.lock
flock -w 1800 9
cd "$remote_dir"
export APP_REVISION="$revision"
backup="/opt/p1zza-kr-backups/security-releases/$revision-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup" "$staging/source"
chmod 700 "$backup" "$staging" "$staging/source"
chmod 600 "$staging/source.tar" "$staging/manifest.json"
trap 'status=$?; if [ "$status" -ne 0 ]; then printf "Release stopped; private evidence: %s. No automatic DB restore.\n" "$backup" >&2; fi' EXIT

snapshot_rows() {
  python3 - <<'PY'
import json,subprocess
tables=['projects','site_profile','site_sections','site_settings','admin_users','inquiries','sessions']
result={}
for table in tables:
    sql='SELECT json_build_object(\'count\',count(*),\'hash\',md5(coalesce(string_agg(row_hash,\'\' ORDER BY row_hash),\'\'))) FROM (SELECT md5(row_to_json(t)::text) row_hash FROM public."'+table+'" t) h;'
    command=['docker','exec','-i','p1zza-kr-db-1','sh','-c','psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -qAt -v ON_ERROR_STOP=1']
    result[table]=json.loads(subprocess.check_output(command,input='BEGIN READ ONLY;\n'+sql+'\nCOMMIT;\n',text=True))
print(json.dumps(result,sort_keys=True))
PY
}

snapshot_outbox() {
  python3 - <<'PY'
import json,subprocess
command=['docker','exec','-i','p1zza-kr-db-1','sh','-c','psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -qAt -v ON_ERROR_STOP=1']
def query(sql):
    return json.loads(subprocess.check_output(command,input='BEGIN READ ONLY;\n'+sql+'\nCOMMIT;\n',text=True))
exists=query("SELECT to_json(to_regclass('public.inquiry_mail_outbox') IS NOT NULL);")
if not exists:
    print(json.dumps({'exists':False},sort_keys=True))
else:
    rows=query("SELECT json_build_object('count',count(*),'hash',md5(coalesce(string_agg(row_hash,'' ORDER BY row_hash),''))) FROM (SELECT md5(row_to_json(t)::text) row_hash FROM public.inquiry_mail_outbox t) h;")
    access=query("SELECT json_build_object('select',has_table_privilege('p1zza_app','public.inquiry_mail_outbox','SELECT'),'insert',has_table_privilege('p1zza_app','public.inquiry_mail_outbox','INSERT'),'update',has_table_privilege('p1zza_app','public.inquiry_mail_outbox','UPDATE'),'delete',has_table_privilege('p1zza_app','public.inquiry_mail_outbox','DELETE'),'publicGrant',EXISTS(SELECT 1 FROM pg_class c CROSS JOIN LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a WHERE c.oid='public.inquiry_mail_outbox'::regclass AND a.grantee=0));")
    print(json.dumps({'exists':True,'rows':rows,'access':access},sort_keys=True))
PY
}

verify_outbox_migration() {
  python3 - "$1" "$2" <<'PY'
import json,pathlib,sys
before=json.loads(pathlib.Path(sys.argv[1]).read_text());after=json.loads(pathlib.Path(sys.argv[2]).read_text())
expected={'select':True,'insert':True,'update':True,'delete':False,'publicGrant':False}
if not after.get('exists') or after.get('access')!=expected:raise SystemExit('Outbox migration privilege gate failed')
if before.get('exists'):
    if before['rows']!=after['rows']:raise SystemExit('Existing outbox rows changed during schema bootstrap')
elif after['rows']['count']!=0:raise SystemExit('New outbox must be empty; historical backfill is forbidden')
PY
}

check_db_patch_gate() {
  python3 - <<'PY'
import json,subprocess
sql="SELECT json_build_object('version',current_setting('server_version_num'),'recovery',pg_is_in_recovery(),'extensions',(SELECT array_agg(extname ORDER BY extname) FROM pg_extension),'slots',(SELECT count(*) FROM pg_replication_slots),'senders',(SELECT count(*) FROM pg_stat_replication),'subscriptions',(SELECT count(*) FROM pg_subscription),'publications',(SELECT count(*) FROM pg_publication),'walLevel',current_setting('wal_level'),'archiveMode',current_setting('archive_mode'),'locale',(SELECT json_build_object('provider',datlocprovider,'collate',datcollate,'ctype',datctype,'recordedVersion',datcollversion,'actualVersion',pg_database_collation_actual_version(oid)) FROM pg_database WHERE datname=current_database()));"
command=['docker','exec','-i','p1zza-kr-db-1','sh','-c','psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -qAt -v ON_ERROR_STOP=1']
d=json.loads(subprocess.check_output(command,input='BEGIN READ ONLY;\n'+sql+'\nCOMMIT;\n',text=True))
locale={'provider':'c','collate':'en_US.utf8','ctype':'en_US.utf8','recordedVersion':None,'actualVersion':None}
if d['version'] not in ['170009','170011'] or d['recovery'] or d['extensions']!=['plpgsql'] or any(d[k]!=0 for k in ['slots','senders','subscriptions','publications']) or d['walLevel']!='replica' or d['archiveMode']!='off' or d['locale']!=locale:
    raise SystemExit('PostgreSQL inventory differs from the reviewed minor-patch gate')
print(json.dumps(d,sort_keys=True))
PY
}

# Existing target identities must match the declared Compose project/services.
[[ "$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' p1zza-kr-app-1)" = p1zza-kr ]]
[[ "$(docker inspect -f '{{index .Config.Labels "com.docker.compose.service"}}' p1zza-kr-app-1)" = app ]]
[[ "$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' p1zza-kr-db-1)" = p1zza-kr ]]
[[ "$(docker inspect -f '{{.State.Health.Status}}' p1zza-kr-db-1)" = healthy ]]
test -f .env.local
[[ "$(stat -c '%a' .env.local)" = 600 ]]
[[ "$(stat -c '%u' .env.local)" = "$(id -u)" ]]

python3 - "$staging" "$backup" <<'PY'
import hashlib,json,pathlib,subprocess,sys,tarfile
staging=pathlib.Path(sys.argv[1]);backup=pathlib.Path(sys.argv[2])
with tarfile.open(staging/'source.tar') as t:
    for m in t.getmembers():
        p=pathlib.PurePosixPath(m.name)
        if p.is_absolute() or '..' in p.parts or m.issym() or m.islnk():raise SystemExit('Unsafe archive')
    t.extractall(staging/'source',filter='data')
manifest=json.loads((staging/'manifest.json').read_text())
if any(hashlib.sha256((staging/'source'/p).read_bytes()).hexdigest()!=h for p,h in manifest.items()):raise SystemExit('Staged source hash mismatch')
rows=[]
for cid in subprocess.check_output(['docker','ps','-q'],text=True).splitlines():
    d=json.loads(subprocess.check_output(['docker','inspect',cid],text=True))[0]
    if d['Name'] not in ['/p1zza-kr-app-1','/p1zza-kr-db-1']:rows.append([d['Id'],d['Image'],d['State']['StartedAt'],d['RestartCount']])
(backup/'other-containers-before.json').write_text(json.dumps(sorted(rows)))
d=json.loads(subprocess.check_output(['docker','inspect','p1zza-kr-db-1'],text=True))[0]
(backup/'db-mounts-before.json').write_text(json.dumps(d['Mounts'],sort_keys=True))
PY

# Backups are private; no DB rows, credentials, or full docker Env enter stdout.
printf 'Phase: private backup\n'
old_image="$(docker inspect -f '{{.Image}}' p1zza-kr-app-1)"
old_db_image="$(docker inspect -f '{{.Image}}' p1zza-kr-db-1)"
printf '%s\n' "$old_image" > "$backup/app-image-before.txt"
printf '%s\n' "$old_db_image" > "$backup/db-image-before.txt"
check_db_patch_gate > "$backup/db-patch-gate-before.json"
tar -czf "$backup/source-env-before.tar.gz" --exclude='./node_modules' --exclude='./build' --exclude='./dist' -C "$remote_dir" .
docker exec p1zza-kr-db-1 sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup/database-before.dump"
test -s "$backup/database-before.dump"
docker exec -i p1zza-kr-db-1 pg_restore --list < "$backup/database-before.dump" >/dev/null
docker image save "$old_image" | gzip > "$backup/app-image-before.tar.gz"
docker image save "$old_db_image" | gzip > "$backup/db-image-before.tar.gz"
gzip -t "$backup/app-image-before.tar.gz"
gzip -t "$backup/db-image-before.tar.gz"
sha256sum "$backup"/*.gz "$backup"/*.dump > "$backup/checksums-before.txt"
snapshot_rows > "$backup/rows-before.json"

# Validate staged config before touching live source or the operational env.
env_path="$remote_dir/.env.local"
if [[ -f "$staging/env.candidate" ]]; then
  chmod 600 "$staging/env.candidate"
  env_path="$staging/env.candidate"
fi
docker compose --project-directory "$staging/source" --env-file "$env_path" -f "$staging/source/compose.yml" config --quiet
python3 - "$env_path" <<'PY'
import json,pathlib,subprocess,sys
cidr=None
for line in pathlib.Path(sys.argv[1]).read_text().splitlines():
    if line.startswith('TRUSTED_PROXY_CIDRS='):cidr=line.split('=',1)[1].strip().strip('\"\'')
d=json.loads(subprocess.check_output(['docker','inspect','caddy-gateway'],text=True))[0]
ip=d['NetworkSettings']['Networks']['p1zza-kr_default']['IPAddress']
if not ip or cidr!=ip+'/32':raise SystemExit('TRUSTED_PROXY_CIDRS must match the exact current Caddy peer /32')
PY
if [[ "$env_path" != "$remote_dir/.env.local" ]]; then install -m 600 "$env_path" .env.local; fi
sha256sum .env.local > "$backup/env-release.sha256"
# No rsync --delete, directory deletion, env overwrite from source, or data deletion.
python3 - "$staging" "$remote_dir" <<'PY'
import json,os,pathlib,shutil,sys
staging=pathlib.Path(sys.argv[1]);target=pathlib.Path(sys.argv[2])
for name in json.loads((staging/'manifest.json').read_text()):
    p=target/name
    if p.is_symlink() or any(a.is_symlink() for a in p.parents if a!=target.parent):raise SystemExit('Live source contains symlink')
    for parent in reversed(p.parents):
        if parent==target or target not in parent.parents:continue
        if not parent.exists():parent.mkdir(mode=0o755);parent.chmod(0o755)
    shutil.copyfile(staging/'source'/name,p)
    os.chmod(p,0o755 if (staging/'source'/name).stat().st_mode&0o111 else 0o644)
PY
printf 'Phase: app-only build\n'
docker compose --env-file .env.local -f compose.yml build app > "$backup/build.log" 2>&1
image_id="$(docker image inspect -f '{{.Id}}' p1zza-kr-app:latest)"
[[ "$(docker image inspect -f '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image_id")" = "$revision" ]]
[[ "$(docker image inspect -f '{{.Config.User}}' "$image_id")" = node ]]
docker image tag "$image_id" "p1zza-kr-app:release-$revision"
printf 'Phase: pinned DB image preparation\n'
db_image=postgres:17.11-alpine@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24
docker compose --env-file .env.local -f compose.yml pull db > "$backup/db-pull.log" 2>&1
db_image_id="$(docker image inspect -f '{{.Id}}' "$db_image")"
[[ "$(docker run --rm --network none "$db_image" postgres --version)" = 'postgres (PostgreSQL) 17.11' ]]
printf 'Phase: additive schema-only bootstrap before candidate readiness\n'
snapshot_rows > "$backup/rows-before-additive-migration.json"
snapshot_outbox > "$backup/outbox-before-additive-migration.json"
docker compose --env-file .env.local -f compose.yml --profile maintenance run -T --interactive=false --rm --no-deps migration < /dev/null > "$backup/additive-migration.log" 2>&1
snapshot_rows > "$backup/rows-after-additive-migration.json"
snapshot_outbox > "$backup/outbox-after-additive-migration.json"
cmp -s "$backup/rows-before-additive-migration.json" "$backup/rows-after-additive-migration.json" || { printf 'Existing rows changed during additive migration; app pause stopped.\n' >&2; exit 1; }
verify_outbox_migration "$backup/outbox-before-additive-migration.json" "$backup/outbox-after-additive-migration.json"
printf 'Phase: pre-pause read-only production env/CRUD readiness\n'
docker compose --env-file .env.local -f compose.yml run -T --interactive=false --rm --no-deps app \
  node --input-type=module -e 'const {env}=await import("./build/server/server/env.js"); const {Pool}=await import("pg"); const {assertDatabaseReady}=await import("./build/server/db/runtime-access.js"); const pool=new Pool({connectionString:process.env.DATABASE_URL}); try { await assertDatabaseReady(pool,true,env.inquiryMail!==null); } finally { await pool.end(); }' \
  < /dev/null > "$backup/runtime-readiness-before-patch.log" 2>&1
printf 'Phase: app pause and DB minor patch\n'
date -u +%Y-%m-%dT%H:%M:%SZ > "$backup/critical-window-start.txt"
critical_start="$(date +%s)"
docker compose --env-file .env.local -f compose.yml stop app
snapshot_rows > "$backup/rows-before-patch.json"
snapshot_outbox > "$backup/outbox-before-patch.json"
docker exec p1zza-kr-db-1 sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup/database-before-patch.dump"
docker exec -i p1zza-kr-db-1 pg_restore --list < "$backup/database-before-patch.dump" >/dev/null
docker compose --env-file .env.local -f compose.yml up -d --no-deps --no-build db
for attempt in $(seq 1 45); do
  [[ "$(docker inspect -f '{{.State.Health.Status}}' p1zza-kr-db-1)" = healthy ]] && break
  sleep 2
done
[[ "$(docker inspect -f '{{.State.Health.Status}}' p1zza-kr-db-1)" = healthy ]]
[[ "$(docker inspect -f '{{.Image}}' p1zza-kr-db-1)" = "$db_image_id" ]]
[[ "$(docker exec p1zza-kr-db-1 postgres --version)" = 'postgres (PostgreSQL) 17.11' ]]
python3 - "$backup" <<'PY'
import json,pathlib,subprocess,sys
d=json.loads(subprocess.check_output(['docker','inspect','p1zza-kr-db-1'],text=True))[0]
if d['Mounts']!=json.loads((pathlib.Path(sys.argv[1])/'db-mounts-before.json').read_text()):raise SystemExit('DB volume changed during patch')
if any(v for v in d['NetworkSettings']['Ports'].values()):raise SystemExit('DB host port unexpectedly published')
PY
check_db_patch_gate > "$backup/db-patch-gate-after.json"
snapshot_rows > "$backup/rows-after-patch.json"
snapshot_outbox > "$backup/outbox-after-patch.json"
cmp -s "$backup/rows-before-patch.json" "$backup/rows-after-patch.json" || { printf 'Existing rows changed during DB patch; app replacement stopped.\n' >&2; exit 1; }
cmp -s "$backup/outbox-before-patch.json" "$backup/outbox-after-patch.json" || { printf 'Outbox changed during DB patch; app replacement stopped.\n' >&2; exit 1; }
printf 'Phase: schema-only migration (no seed)\n'
docker compose --env-file .env.local -f compose.yml --profile maintenance run -T --interactive=false --rm --no-deps migration < /dev/null > "$backup/migration.log" 2>&1
snapshot_rows > "$backup/rows-after-migration.json"
snapshot_outbox > "$backup/outbox-after-migration.json"
cmp -s "$backup/rows-after-patch.json" "$backup/rows-after-migration.json" || { printf 'Existing rows changed during migration; app replacement stopped.\n' >&2; exit 1; }
verify_outbox_migration "$backup/outbox-after-patch.json" "$backup/outbox-after-migration.json"
printf 'Phase: read-only production env/CRUD readiness\n'
docker compose --env-file .env.local -f compose.yml run -T --interactive=false --rm --no-deps app \
  node --input-type=module -e 'const {env}=await import("./build/server/server/env.js"); const {Pool}=await import("pg"); const {assertDatabaseReady}=await import("./build/server/db/runtime-access.js"); const pool=new Pool({connectionString:process.env.DATABASE_URL}); try { await assertDatabaseReady(pool,true,env.inquiryMail!==null); } finally { await pool.end(); }' \
  < /dev/null > "$backup/runtime-readiness.log" 2>&1
printf 'Phase: app-only recreate\n'
docker compose --env-file .env.local -f compose.yml up -d --no-deps --no-build app
for attempt in $(seq 1 45); do
  [[ "$(docker inspect -f '{{.State.Health.Status}}' p1zza-kr-app-1)" = healthy ]] && break
  sleep 2
done
[[ "$(docker inspect -f '{{.State.Health.Status}}' p1zza-kr-app-1)" = healthy ]]
[[ "$(docker inspect -f '{{.Image}}' p1zza-kr-app-1)" = "$image_id" ]]
docker compose --env-file .env.local -f compose.yml exec -T --interactive=false app wget -qO- http://127.0.0.1:3001/api/health < /dev/null
date -u +%Y-%m-%dT%H:%M:%SZ > "$backup/critical-window-end.txt"
printf '%s\n' "$(( $(date +%s) - critical_start ))" > "$backup/critical-window-seconds.txt"
sha256sum "$backup"/*.gz "$backup"/*.dump > "$backup/checksums-final.txt"
sha256sum -c "$backup/env-release.sha256" >/dev/null
python3 - "$staging" "$backup" <<'PY'
import hashlib,json,pathlib,subprocess,sys
staging=pathlib.Path(sys.argv[1]);backup=pathlib.Path(sys.argv[2]);target=pathlib.Path('/opt/p1zza-kr')
for p,h in json.loads((staging/'manifest.json').read_text()).items():
    if hashlib.sha256((target/p).read_bytes()).hexdigest()!=h:raise SystemExit('Live source hash mismatch')
rows=[]
for cid in subprocess.check_output(['docker','ps','-q'],text=True).splitlines():
    d=json.loads(subprocess.check_output(['docker','inspect',cid],text=True))[0]
    if d['Name'] not in ['/p1zza-kr-app-1','/p1zza-kr-db-1']:rows.append([d['Id'],d['Image'],d['State']['StartedAt'],d['RestartCount']])
if sorted(rows)!=json.loads((backup/'other-containers-before.json').read_text()):raise SystemExit('Other containers changed')
d=json.loads(subprocess.check_output(['docker','inspect','p1zza-kr-db-1'],text=True))[0]
if d['Mounts']!=json.loads((backup/'db-mounts-before.json').read_text()):raise SystemExit('DB volume changed')
if any(v for v in d['NetworkSettings']['Ports'].values()):raise SystemExit('DB host port unexpectedly published')
a=json.loads(subprocess.check_output(['docker','inspect','p1zza-kr-app-1'],text=True))[0]
if any(v for v in a['NetworkSettings']['Ports'].values()):raise SystemExit('App host port unexpectedly published')
if not a['HostConfig']['ReadonlyRootfs'] or 'ALL' not in a['HostConfig']['CapDrop']:raise SystemExit('App hardening missing')
if not any(v.startswith('no-new-privileges') for v in a['HostConfig'].get('SecurityOpt',[])):raise SystemExit('App privilege guard missing')
if a['Config']['User']!='node':raise SystemExit('App is not non-root')
runtime_env=dict(v.split('=',1) for v in a['Config']['Env'] if '=' in v)
if any(k in runtime_env for k in ['MIGRATION_DATABASE_URL','MIGRATION_APP_ROLE']):raise SystemExit('Migration-only env leaked into app env')
c=json.loads(subprocess.check_output(['docker','inspect','caddy-gateway'],text=True))[0]
ip=c['NetworkSettings']['Networks']['p1zza-kr_default']['IPAddress']
if runtime_env.get('TRUSTED_PROXY_CIDRS')!=ip+'/32':raise SystemExit('Caddy peer changed during release')
print('Preservation: other20 services, DB volume/rows, env, source PASS')
PY
printf '\nRelease complete. Private evidence: %s\n' "$backup"
printf 'P1ZZA_RELEASE_COMPLETE:%s\n' "$revision"
REMOTE

# SSH exit0 alone is insufficient: an interactive child can consume Bash stdin.
python3 - "$LOCAL_STAGE/remote-release.log" "$REVISION" <<'PY'
import pathlib,sys
lines=[line for line in pathlib.Path(sys.argv[1]).read_text().splitlines() if line]
marker='P1ZZA_RELEASE_COMPLETE:'+sys.argv[2]
if not lines or lines[-1]!=marker or lines.count(marker)!=1:
    raise SystemExit('Release completion marker missing; verify runtime gates and private evidence')
PY
