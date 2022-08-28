#!/bin/sh
cp "./default-envs/$1.json" "./default-env.json"
export NODE_ENV=$1
exit 0