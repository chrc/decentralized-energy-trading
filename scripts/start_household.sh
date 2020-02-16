#!/bin/bash

# Starts a household server and writes its pid to ./hhs_$nr.pid
# Also starts a corresponding meter sensor and writes its pid to ./meter_$nr.pid
# Args: <id>
#   id: number of the household, starting at 1
# To stop them, run stop_household.sh $nr

id=$1

# this may fail but that's okay
scripts/stop_household.sh $id

# Exit if any subcommand fails
set -e

HHS_PORT=$(( id + 3001 ))
MONGO_PORT=$(( id + 27010 ))
PARITY_ADDRESS="$( jq -rc .address < "parity-authority/parity/authorities/authority$id.json" )"
PARITY_PORT=$(( ( 10 * id ) + 8546 ))

  # -d mongodb://127.0.0.1:$MONGO_PORT \
yarn run-server \
  -p $HHS_PORT \
  -a "$PARITY_ADDRESS" \
  -P node$id \
  -r $PARITY_PORT \
& echo $! > hhs_$id.pid

ENERGY="$( [ $(( id % 2 )) -eq 0 ] && echo "+" || echo "-" )"

yarn run-sensor -p $HHS_PORT -e "$ENERGY" \
& echo $! > meter_$id.pid
