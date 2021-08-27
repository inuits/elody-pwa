#!/bin/sh

set -e

echo "Starting dashboard"
npm link ./session-vue-3-oidc-library
exec npm run serve