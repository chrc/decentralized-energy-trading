#!/bin/bash

# Concatenates all measurement logfiles into one big file.

meas_dir="$1"
[ -z "$meas_dir" ] && meas_dir="$MEASUREMENTS_OUT_DIR"
[ -z "$meas_dir" ] && echo "Must pass directory argument or set MEASUREMENTS_OUT_DIR environment variable." && exit 1

# Exit if any subcommand fails
set -e

paths="$(ls -1 "$meas_dir"/*_*T*.json | grep -vE 'all_')"
num_files="$(echo "$paths" | wc -l)"
num_meas="$(echo "$paths" | xargs cat | wc -l)"
start_date="$(echo "$paths" | grep -oE '[0-9]{4,}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}' | sort | head -n 1)"
echo "$num_meas measurements across $num_files files from $start_date in $meas_dir"

combined_path="$meas_dir"/all_"$start_date".json
echo "Combining into $combined_path"
echo "$paths" | xargs cat | sort -u > "$combined_path"

num_meas_after="$(wc -l < "$combined_path")"
[ "$num_meas_after" -eq "$num_meas" ] || {
	echo "Only got $num_meas_after measurements after combining, was expecting $num_meas"
	exit 2
}
