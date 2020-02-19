#!/bin/bash

# Stops a household server and its corresponding meter sensor,
# using the pid at run/hhs_$id.pid and run/meter_$id.pid
# See also start_household.sh
# Args: <id>
#   id: number of the household, starting at 1

id=$1

# Exit if any subcommand fails
set -e

kill "$(cat run/hhs_$id.pid)"
kill "$(cat run/meter_$id.pid)"
