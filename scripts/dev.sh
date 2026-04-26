#!/bin/sh

set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

BACKEND_CMD="./backend/venv/bin/python backend/app.py"
FRONTEND_CMD="vite"

cleanup() {
  if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

$BACKEND_CMD &
BACKEND_PID=$!

sleep 2

$FRONTEND_CMD "$@"
