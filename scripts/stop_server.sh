#!/usr/bin/env bash

pid=$(sudo lsof -i :60900 -t); sudo kill -9 $pid &> /dev/null
