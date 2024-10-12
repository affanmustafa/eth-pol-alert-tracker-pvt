#!/bin/sh

set -e

# Wait for the database to be ready
until pg_isready -h postgres -U postgresuser; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec "$@"