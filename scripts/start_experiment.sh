#!/bin/bash

set -e

HHTotal="$1"

[ "$HHTotal" ] || {
	echo "Please pass the total number of households as first argument."
	exit 1
}

export MEASUREMENTS_OUT_DIR="$PWD"/measurements_out/

yarn run run-netting-entity \
&>> run/netting_server.log \
& echo $! > run/netting_server.pid

scripts/start_all_households.sh $HHTotal
