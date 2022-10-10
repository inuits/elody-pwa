#!/bin/sh

set -e

echo "Starting dashboard"
npm run generate
exec npm run dev-only
