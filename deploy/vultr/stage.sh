#!/usr/bin/env bash

set -euo pipefail

REMOTE_HOST="p1zza-1st"
REMOTE_DIR="/opt/p1zza-kr"
ENV_FILE=""
DELETE_FLAG=0
BUILD_FLAG="--build"

usage() {
  cat <<'EOF'
Usage: bash deploy/vultr/stage.sh [options]

Options:
  --host <ssh-host>          SSH host alias (default: p1zza-1st)
  --remote-dir <path>        Remote app directory (default: /opt/p1zza-kr)
  --env-file <path>          Local env file to upload as .env.local
  --no-build                 Skip docker compose --build
  --delete                   Delete remote files that no longer exist locally
  --help                     Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)
      REMOTE_HOST="$2"
      shift 2
      ;;
    --remote-dir)
      REMOTE_DIR="$2"
      shift 2
      ;;
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --no-build)
      BUILD_FLAG=""
      shift
      ;;
    --delete)
      DELETE_FLAG=1
      shift
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required" >&2
  exit 1
fi

if ! command -v ssh >/dev/null 2>&1; then
  echo "ssh is required" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ -n "$ENV_FILE" && ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

ssh "$REMOTE_HOST" "mkdir -p '$REMOTE_DIR'"

RSYNC_ARGS=(
  -az
  --exclude=.git
  --exclude=node_modules
  --exclude=build
  --exclude=dist
  --exclude=.env
  --exclude=.env.local
  --exclude=coverage
  --exclude=.DS_Store
)

if [[ "$DELETE_FLAG" -eq 1 ]]; then
  RSYNC_ARGS+=(--delete)
fi

rsync "${RSYNC_ARGS[@]}" "$ROOT_DIR"/ "$REMOTE_HOST:$REMOTE_DIR/"

if [[ -n "$ENV_FILE" ]]; then
  rsync -az "$ENV_FILE" "$REMOTE_HOST:$REMOTE_DIR/.env.local"
fi

ssh "$REMOTE_HOST" "test -f '$REMOTE_DIR/.env.local'"
ssh "$REMOTE_HOST" "cd '$REMOTE_DIR' && docker compose --env-file .env.local up -d $BUILD_FLAG"
ssh "$REMOTE_HOST" "cd '$REMOTE_DIR' && docker compose ps"
ssh "$REMOTE_HOST" "for attempt in \$(seq 1 30); do curl -fsS http://127.0.0.1:3001/api/health >/dev/null && exit 0; sleep 2; done; cd '$REMOTE_DIR' && docker compose logs app --tail=80 && exit 1"
