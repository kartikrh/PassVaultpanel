#!/usr/bin/env bash
#
# setup-linux-docker.sh
#
# Run this on the Linux server. It removes the original Dockerfile and
# docker-compose.yml, then puts the Linux variants in their place using
# the original file names.
#
# Usage:
#   chmod +x setup-linux-docker.sh
#   ./setup-linux-docker.sh

set -euo pipefail

# Always work from the directory this script lives in.
cd "$(dirname "$0")"

SRC_DOCKERFILE="linux-Dockerfile"
SRC_COMPOSE="linux-docker-compose.yml"

DST_DOCKERFILE="Dockerfile"
DST_COMPOSE="docker-compose.yml"

# Make sure the Linux source files are present before touching anything.
for f in "$SRC_DOCKERFILE" "$SRC_COMPOSE"; do
    if [ ! -f "$f" ]; then
        echo "ERROR: required file '$f' not found in $(pwd). Aborting." >&2
        exit 1
    fi
done

# Delete the original files if they exist.
echo "Removing original $DST_DOCKERFILE and $DST_COMPOSE (if present)..."
rm -f "$DST_DOCKERFILE" "$DST_COMPOSE"

# Copy the Linux files into place under the original names.
echo "Copying $SRC_DOCKERFILE -> $DST_DOCKERFILE"
cp "$SRC_DOCKERFILE" "$DST_DOCKERFILE"

echo "Copying $SRC_COMPOSE -> $DST_COMPOSE"
cp "$SRC_COMPOSE" "$DST_COMPOSE"

echo "Done. $DST_DOCKERFILE and $DST_COMPOSE are now the Linux versions."
