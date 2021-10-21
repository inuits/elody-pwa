#!/bin/bash
set -a

__DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DOCKER=docker
if [ -x "$(command -v podman)" ]; then
  DOCKER=podman
fi

${DOCKER} run -it --rm -v ${__DIR}/src:/app/src -p ${1:80}:8080 --env-file=.env.local inuits-dams-frontend:dev $@
