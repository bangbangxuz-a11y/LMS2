#!/usr/bin/env bash
set -Eeuo pipefail

workspace_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$workspace_root"

export CODEPLAYGROUND_HOST="${CODEPLAYGROUND_HOST:-0.0.0.0}"
export CODEPLAYGROUND_PORT="${CODEPLAYGROUND_PORT:-8001}"
export CODEPLAYGROUND_OPEN_BROWSER="${CODEPLAYGROUND_OPEN_BROWSER:-1}"
backend_url="http://127.0.0.1:${CODEPLAYGROUND_PORT}"

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

open_browser() {
	if [[ "$CODEPLAYGROUND_OPEN_BROWSER" != '1' ]]; then
		return 0
	fi
	if [[ -n "${BROWSER:-}" ]]; then
		"$BROWSER" "$backend_url" >/dev/null 2>&1 &
	elif command -v xdg-open >/dev/null 2>&1; then
		xdg-open "$backend_url" >/dev/null 2>&1 &
	fi
}

if command -v curl >/dev/null 2>&1 && curl --silent --show-error --fail --max-time 1 "$backend_url/" >/dev/null 2>&1; then
	printf 'Backend already running at %s\n' "$backend_url"
	open_browser
	exit 0
fi

backend_pid=''
cleanup() {
	if [[ -n "$backend_pid" ]] && kill -0 "$backend_pid" 2>/dev/null; then
		kill "$backend_pid" 2>/dev/null || true
		wait "$backend_pid" 2>/dev/null || true
	fi
}
trap cleanup EXIT INT TERM

python3 "$workspace_root/backend.py" &
backend_pid=$!

ready=0
for _ in {1..50}; do
	if command -v curl >/dev/null 2>&1; then
		curl --silent --show-error --fail --max-time 1 "$backend_url/" >/dev/null 2>&1 && ready=1 && break
	else
		if (exec 3<>"/dev/tcp/127.0.0.1/${CODEPLAYGROUND_PORT}") 2>/dev/null; then
			exec 3>&-
			exec 3<&-
			ready=1
			break
		fi
	fi
	if ! kill -0 "$backend_pid" 2>/dev/null; then
		wait "$backend_pid"
	fi
	sleep 0.1
done

if (( ready == 0 )); then
	printf 'Backend did not become ready at %s\n' "$backend_url" >&2
	exit 1
fi

printf 'Backend ready at %s\n' "$backend_url"
open_browser

wait "$backend_pid"
