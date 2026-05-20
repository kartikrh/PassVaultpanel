# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Prevent OOM during the CRA / webpack build and disable sourcemaps in prod.
# CI=false is REQUIRED: CRA treats warnings as errors when CI=true, and Railway
# sets CI=true by default. The codebase has many lint warnings — leave this off.
ENV NODE_OPTIONS="--max-old-space-size=4096" \
    GENERATE_SOURCEMAP=false \
    CI=false \
    DISABLE_ESLINT_PLUGIN=true

# Install dependencies first so this layer is cached
# and only re-runs when package.json / yarn.lock change.
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

# Copy the rest of the source
COPY . .

# react-scripts build hardcodes NODE_ENV=production and always reads
# .env.production — there is no flag to make it read .env.development.
# On this branch (UAT) we want the build to bake UAT API values, which
# live in .env.development. Overlay it onto .env.production before the
# build so CRA picks up the dev values. main branch keeps its own
# .env.production untouched and bakes real prod URLs.
RUN cp .env.development .env.production

# Produce the production bundle
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
