#!/bin/sh

if [ "$NODE_ENV" = "production" ]; then
  node server.js > app.out.log 2> app.err.log & 
else
  nodemon --ignore './sessions' server.js;
fi
