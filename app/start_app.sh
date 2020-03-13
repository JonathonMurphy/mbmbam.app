#!/bin/sh

if [ "$NODE_ENV" = "production" ]; then
  node server.js > app.out.log 2> app.err.log < /dev/null & 
else
  nodemon --ignore './sessions' server.js;
fi
