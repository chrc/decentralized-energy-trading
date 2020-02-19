#!/bin/bash

# Starts <arg> many household servers using start_household.sh
# Args: <num>
#   num: number of households to start
# To stop them, run stop_all_households.sh $num

num=$1

# this may fail but that's okay
scripts/stop_all_households.sh

# Exit if any subcommand fails
set -e

for id in $(seq 1 $num) ;do
	scripts/start_household.sh $id
done
