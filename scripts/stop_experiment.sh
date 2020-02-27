#!/bin/bash

scripts/stop_all_households.sh
kill "$(cat run/netting_server.pid)"
