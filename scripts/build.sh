#!/bin/bash

BUILD_FOLDER="${PWD}/dist"
EXTENSIONS=".ts,.tsx,.js,.jsx"
SRC_FOLDER="${PWD}/src"
START_TIME=$(date +%s)

if test -d "$BUILD_FOLDER"; then
    echo "removing ${BUILD_FOLDER} directory"
    rm -rf ${BUILD_FOLDER}/*
fi

echo "building types"
eval $(npm bin)/tsc --emitDeclarationOnly 2>&1 &

echo "building src"
eval NODE_ENV=production $(npm bin)/babel ${SRC_FOLDER} --out-dir ${BUILD_FOLDER} --extensions ${EXTENSIONS} --source-maps inline 2>&1 &

wait

END_TIME=$(date +%s)

echo "build complete in $((END_TIME-START_TIME)) seconds!"
