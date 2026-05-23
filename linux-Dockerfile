# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Increase Node.js heap memory to prevent OOM during build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy only dependency manifests first — this layer is cached
# and only re-runs when package.json or yarn.lock changes
COPY package.json yarn.lock ./

# Install all dependencies (cached layer)
RUN yarn install --network-timeout 600000

# Now copy the rest of the source code
COPY . .

# Build the production bundle
RUN yarn build

# ---- Stage 2: Production ----
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g serve

# Copy only the compiled static files from the build stage
# Final image has NO source code, NO node_modules (much smaller)
COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
