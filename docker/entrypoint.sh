#!/bin/sh

set -e

echo "Starting dashboard"
pnpm run generate
exec pnpm run dev-only
