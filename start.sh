#!/bin/sh

# Start nginx in background
nginx -g 'daemon off;' &

# Start Go compiler server
cd /app
npm run server
