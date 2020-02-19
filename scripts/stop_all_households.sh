#!/bin/bash

# Stops all running household servers.

# Exit if any subcommand fails
set -e

for pidfile in run/{hhs,meter}_*.pid ;do
	pid="$(cat "$pidfile")"
	kill "$pid" \
	&& rm "$pidfile" \
	&& echo "Stopped $pidfile" \
	|| echo "Failed to kill $pid from $pidfile"
done
