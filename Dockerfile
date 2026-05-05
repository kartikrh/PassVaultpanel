# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Use 4 GB heap — safe for 8 GB RAM server, prevents OOM during build
ENV NODE_OPTIONS="--max-old-space-size=4096"
# Disable source maps — cuts build time ~40% and reduces memory usage
ENV GENERATE_SOURCEMAP=false

# Copy dependency manifests first — Docker caches this layer
# and skips yarn install on rebuilds unless these files change
COPY package.json yarn.lock ./
RUN yarn install --network-timeout 600000

COPY . .
RUN yarn build

# ---- Stage 2: Production (nginx) ----
FROM nginx:alpine AS production

# Copy tuned nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy only the compiled static files — no source, no node_modules
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
