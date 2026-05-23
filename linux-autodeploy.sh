#!/bin/bash

# Default value is false
PULL=${1:-false}

echo "🚀 Starting deployment..."
echo "📌 Pull code: $PULL"

cd {full publish path}

echo "🛑 Stopping old containers..."
docker compose down

# Only pull if parameter is true
if [ "$PULL" = "true" ]; then
    # Make git ignore local changes to the Docker files so the pull
    # does NOT overwrite the Linux versions you put in place.
    echo "🙈 Telling git to ignore local Dockerfile & docker-compose.yml..."
    git update-index --skip-worktree Dockerfile docker-compose.yml 2>/dev/null || true

    echo "📦 Pulling latest code from GitHub..."
    # git fetch origin
    # git reset --hard origin/producation
    git pull origin producation
else
    echo "⏭️  Skipping git pull (use 'true' to pull)"
fi

echo "🐳 Building & Starting both containers..."
docker compose up -d --build

# ─────────────────────────────────
# Copy build to Nginx folder
# ─────────────────────────────────
echo "📂 Copying build to Nginx... Process Start"

# Wait for build to complete inside container
sleep 20

# Create folder if not exists
sudo mkdir -p /var/www/html/{application}

# Remove old build
sudo rm -rf /var/www/html/{application}/build

# Copy build folder from container to Nginx
docker cp {dockername}:/app/build /var/www/html/{application}

# Set permissions
sudo chown -R www-data:www-data /var/www/html/{application}
sudo chmod -R 755 /var/www/html/{application}

echo "✅ Build copied to Nginx!"

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "📋 Container status:"
docker compose ps

echo "🎉 Done!"
