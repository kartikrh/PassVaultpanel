FROM node:20-alpine AS builder

WORKDIR /app

ARG REACT_APP_BASE_URL
ARG REACT_APP_SOCKET_URL
ARG REACT_APP_ENCRYPTION_SECRET
ARG REACT_APP_API_INTERVAL
ARG REACT_APP_IS_SOCKET
ARG REACT_APP_DEFAULTAUTH

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

ENV REACT_APP_BASE_URL=${REACT_APP_BASE_URL}
ENV REACT_APP_SOCKET_URL=${REACT_APP_SOCKET_URL}
ENV REACT_APP_ENCRYPTION_SECRET=${REACT_APP_ENCRYPTION_SECRET}
ENV REACT_APP_API_INTERVAL=${REACT_APP_API_INTERVAL}
ENV REACT_APP_IS_SOCKET=${REACT_APP_IS_SOCKET}
ENV REACT_APP_DEFAULTAUTH=${REACT_APP_DEFAULTAUTH}

RUN NODE_OPTIONS="--max-old-space-size=4096" yarn run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Railway (and most PaaS) inject PORT at container start; nginx doesn't read
# env vars on its own, so this leans on the official nginx image's built-in
# entrypoint (/docker-entrypoint.d/20-envsubst-on-templates.sh), which
# envsubst's any *.template file into conf.d using only real env var names --
# nginx's own $uri/$host/etc. don't match an actual env var, so they're left
# untouched. Defaults to 80 for a plain `docker run` with no PORT set.
ENV PORT=80
RUN mkdir -p /etc/nginx/templates
RUN printf '%s\n' \
'server {' \
'  listen ${PORT};' \
'  server_name _;' \
'  root /usr/share/nginx/html;' \
'  index index.html;' \
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' > /etc/nginx/templates/default.conf.template

CMD ["nginx", "-g", "daemon off;"]