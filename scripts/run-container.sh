#!/bin/bash
DOCKER=docker
if [ -x "$(command -v podman)" ]; then
  DOCKER=podman
fi

${DOCKER} run -it --rm -p ${1:80}:8080 --env-file=.env.local inuits-dams-frontend:prod $@
