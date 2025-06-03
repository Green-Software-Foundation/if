ARG BASEIMAGE=node:18-slim

FROM --platform=$BUILDPLATFORM $BASEIMAGE AS deps

# Install git and ca-certificates
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get --no-install-recommends install -y \
    git ca-certificates

# Create application directory
WORKDIR /app

# Copy package*.json
COPY package*.json .

# Install build dependencies
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --ignore-scripts --no-fund

# Compile TypeScript
RUN --mount=src=tsconfig.json,target=tsconfig.json \
    --mount=src=tsconfig.build.json,target=tsconfig.build.json \
    --mount=src=src/,target=src/ \
    npm run build

# Remove devDependencies
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm prune --ignore-scripts --omit=dev

# Remove empty directory
RUN rmdir --ignore-fail-on-non-empty node_modules/*

# Set executable attributes to applications
RUN chmod +x build/if-*/index.js

# Link applications
RUN for a in build/if-*/index.js; do ln -s ../../$a node_modules/.bin/$(basename $(dirname $a)); done


FROM $BASEIMAGE

# Packages to be installed
ARG PACKAGES='git ca-certificates'

# Install lsb_release, git and ca-certificates
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get --no-install-recommends install -y \
    lsb-release $PACKAGES

# Copy entrypoint shell script
COPY bin/docker-entrypoint.sh /usr/local/bin

# Set execution user
USER 1000

# Create application directory
WORKDIR /app

# Copy application and runtime dependencies
COPY --from=deps --chown=node:node /app .

# Set environment variables
ENV NODE_ENV=production NPM_CONFIG_UPDATE_NOTIFIER=false PATH=/app/node_modules/.bin:$PATH HOST=

# Expose port
EXPOSE 3000

# Run the application
CMD ["if-api"]
