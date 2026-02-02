#!/bin/bash 
set -e

npx drizzle-kit generate --config ./src/server_config/sqlite/drizzle.config.ts
npx drizzle-kit push --config ./src/server_config/sqlite/drizzle.config.ts

exec "$@";