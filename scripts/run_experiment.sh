#!/bin/bash

HHTotal="$1"

[ "$HHTotal" ] || {
	echo "Please pass the total number of households as first argument."
	exit 1
}

export MEASUREMENTS_OUT_DIR="$PWD"/measurements_out/

scripts/start_experiment.sh "$HHTotal"

watch -d grep -c netting_success "$MEASUREMENTS_OUT_DIR"/nettingserver_*.json

scripts/stop_experiment.sh
