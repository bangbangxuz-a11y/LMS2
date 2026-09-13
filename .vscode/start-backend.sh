#!/usr/bin/env bash
set -Eeuo pipefail

workspace_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$workspace_root"

export CODEPLAYGROUND_HOST="${CODEPLAYGROUND_HOST:-0.0.0.0}"
export CODEPLAYGROUND_PORT="${CODEPLAYGROUND_PORT:-8001}"

if [[ ! "$CODEPLAYGROUND_PORT" =~ ^[0-9]+$ ]] || (( CODEPLAYGROUND_PORT < 1024 || CODEPLAYGROUND_PORT > 65535 )); then
	printf 'Invalid CODEPLAYGROUND_PORT: %s (expected 1024-65535)\n' "$CODEPLAYGROUND_PORT" >&2
	exit 2
fi

if [[ ! -f "$workspace_root/backend.py" ]]; then
	printf 'Backend not found: %s/backend.py\n' "$workspace_root" >&2
	exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
	printf 'python3 is required but was not found in PATH\n' >&2
	exit 127
fi

exec python3 "$workspace_root/backend.py"
