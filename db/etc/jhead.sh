#!/usr/bin/env bash

cat $1 | jq | head -n 30 | tail -n 29
