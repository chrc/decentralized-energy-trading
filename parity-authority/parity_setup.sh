#!/bin/bash

# Create configuration for the Parity authority network

set -e

if [[ $# -lt 1 ]] ; then
    echo 'Please pass the number of households (total) as first argument.'
    exit 1
fi

HH=$1

mkdir -p parity/authorities
for ((i=3; i<=$HH; i++))
do
    FILE=parity/authorities/authority$i.json
    if [[ -f "$FILE" ]]; then
        rm -f $FILE
        echo "Deleted existing file!"
    fi
done

yarn generate-docker-parity $HH
