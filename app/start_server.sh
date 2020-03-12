#!/bin/sh

if [ "$NODE_ENV" = "production" ]; then
  node server.js;
else
  nodemon --ignore './sessions' server.js;
fi
