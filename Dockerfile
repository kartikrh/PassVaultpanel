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

RUN printf '%s\n' \
'server {' \
'  listen 80;' \
'  server_name _;' \
'  root /usr/share/nginx/html;' \
'  index index.html;' \
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]