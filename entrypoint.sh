#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Wait for the database to be ready (optional but good practice)
# This requires netcat to be installed in the Dockerfile
# while ! nc -z db 3306; do
#   echo "Waiting for the Database to be ready..."
#   sleep 2
# done

echo "Database is ready. Starting server..."

# Execute the main command passed to this script
exec "$@"