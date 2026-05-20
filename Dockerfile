# syntax=docker/dockerfile:1.7

# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Prevent OOM during the CRA / webpack build and disable sourcemaps in prod
ENV NODE_OPTIONS="--max-old-space-size=4096" \
    GENERATE_SOURCEMAP=false \
    CI=true

# Install dependencies first so this layer is cached
# and only re-runs when package.json / yarn.lock change.
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --network-timeout 600000

# Copy the rest of the source and produce the production bundle
COPY . .
RUN yarn build


# ---- Stage 2: Runtime ----
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Install the static file server and create a non-root user
RUN npm install -g serve@14 \
    && addgroup -S app && adduser -S app -G app

# Copy only the compiled static bundle from the build stage
# (final image has NO source code and NO node_modules)
COPY --from=builder --chown=app:app /app/build ./build

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/" >/dev/null 2>&1 || exit 1

# Shell form so $PORT is expanded at runtime
# (Railway / Heroku / Cloud Run inject a dynamic PORT; locally falls back to 3000)
CMD serve -s build -l ${PORT:-3000}
