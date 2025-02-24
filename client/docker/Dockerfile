FROM node:20-alpine AS build
WORKDIR /app
# Enable and prepare yarn
RUN corepack enable && corepack prepare yarn@4.5.1 --activate  
# Copy package.json and lockfile
COPY . .
RUN --mount=type=secret,id=env_file \
  export GITHUB_PAT=$(grep GITHUB_PAT /run/secrets/env_file | cut -d= -f2) && \
  yarn install --immutable && \
  yarn build
# Copy rest of files

FROM nginx:alpine
# Copy build files and nginx conf
COPY --from=build /app/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# Copy env variables script. It will automatically be executed
# before the nginx container starts.
COPY docker/env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh