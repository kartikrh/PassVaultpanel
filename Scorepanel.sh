#!/bin/bash
set -euo pipefail
trap 'echo "Deployment failed at line $LINENO"' ERR

log() {
  echo "$(date "+%Y-%m-%d %H:%M:%S") $1"
}

ROOT_DIRECTORY="/home/ubuntu"
PROJECT_NAME="Scorepanel"
GIT_BRANCH_NAME="producation"
PROJECT_PATH="${ROOT_DIRECTORY}/${PROJECT_NAME}"
BACKUP_DIR="${ROOT_DIRECTORY}/backup/${PROJECT_NAME}"

if [ ! -d "$PROJECT_PATH" ]; then
    log "Project directory not found."
    exit 1
fi

cd "$PROJECT_PATH"

read -rp "Do you want to take pull(y/n):" PULL

if [ "$PULL" = "y" ]; then
    log "Creating backup..."
    mkdir -p "$BACKUP_DIR"

    DATE=$(date +%d-%m-%Y_%H-%M-%S)
    DEST="${BACKUP_DIR}/${DATE}"

    cp -r "$PROJECT_PATH" "$DEST"

    log "Folder backup created: $DEST"

    log "Git stashing..."
    git stash push -u

    log "Checkout to ..."
    git checkout "$GIT_BRANCH_NAME"

    log "Pulling code from \"$GIT_BRANCH_NAME\"..."
    git pull origin "$GIT_BRANCH_NAME"

    log "Deleting old stash if it's available..."
    git stash clear

    log "Your code is updated with latest pull..."
else
    log "Skipping backup and latest pull..."
fi

log "Stopping old container..."
docker compose down

log "Building & Starting container..."
docker compose up -d --build

log "Cleaning up unused Docker images..."
docker system prune -f

log "Container status:"
docker compose ps -a

log "Deployment completed successfully for project '$PROJECT_NAME'."