#!/bin/bash

# Stops a household server and its corresponding meter sensor,
# using the pid at ./hhs_$nr.pid and ./meter_$nr.pid
# See also start_household.sh
# Args: <id>
#   id: number of the household, starting at 1

id=$1

# Exit if any subcommand fails
set -e

kill "$(cat hhs_$id.pid)"
kill "$(cat meter_$id.pid)"
# rm hhs$id.pid # leave it there in case the kill fails
