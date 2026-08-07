#!/usr/bin/env bash
set -euo pipefail

lsof -ti :3000 | xargs -r kill -9 || true
lsof -ti :3001 | xargs -r kill -9 || true

npm run dev:parallel
