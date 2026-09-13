#!/usr/bin/env bash
set -Eeuo pipefail

workspace_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$workspace_root"

export CODEPLAYGROUND_HOST="${CODEPLAYGROUND_HOST:-127.0.0.1}"
export CODEPLAYGROUND_PORT="${CODEPLAYGROUND_PORT:-8001}"
export CODEPLAYGROUND_OPEN_BROWSER="${CODEPLAYGROUND_OPEN_BROWSER:-1}"

exec "$workspace_root/.vscode/start-backend.sh"
