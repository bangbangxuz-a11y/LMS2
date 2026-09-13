#!/usr/bin/env bash
set -Eeuo pipefail

workspace_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$workspace_root"

if [[ -z "${CODEPLAYGROUND_HOST:-}" ]]; then
	if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
		CODEPLAYGROUND_HOST='0.0.0.0'
	else
		CODEPLAYGROUND_HOST='127.0.0.1'
	fi
fi
export CODEPLAYGROUND_HOST
export CODEPLAYGROUND_PORT="${CODEPLAYGROUND_PORT:-8001}"
export CODEPLAYGROUND_OPEN_BROWSER="${CODEPLAYGROUND_OPEN_BROWSER:-1}"

exec "$workspace_root/.vscode/start-backend.sh"
