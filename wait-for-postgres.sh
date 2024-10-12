# #!/bin/sh
# # wait-for-it.sh

# set -e

# host="$1"
# shift
# cmd="$@"

# until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "postgresuser" -c '\q'; do
#   >&2 echo "Postgres is unavailable - sleeping"
#   sleep 1
# done

# >&2 echo "Postgres is up - executing command"
# exec $cmd

#!/bin/sh

set -e

# Wait for the database to be ready
until pg_isready -h database -U postgresuser -d nest; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec "$@"