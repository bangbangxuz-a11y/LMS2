#!/usr/bin/env bash
set -Eeuo pipefail

workspace_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$workspace_root"

export CODEPLAYGROUND_HOST="${CODEPLAYGROUND_HOST:-0.0.0.0}"
export CODEPLAYGROUND_PORT="${CODEPLAYGROUND_PORT:-8001}"

exec python3 "$workspace_root/backend.py"
