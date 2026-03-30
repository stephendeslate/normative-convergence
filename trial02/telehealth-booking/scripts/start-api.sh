#!/bin/sh
set -e

echo "Running Prisma schema push..."
cd /app/apps/api
npx prisma db push --accept-data-loss --skip-generate
echo "Schema push complete."

echo "Starting API server..."
cd /app
exec node apps/api/dist/main.js
