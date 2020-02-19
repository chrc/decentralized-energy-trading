#!/bin/bash

scripts/start_all_households.sh $1

tail -f run/{hhs,meter}_*.log

scripts/stop_all_households.sh
