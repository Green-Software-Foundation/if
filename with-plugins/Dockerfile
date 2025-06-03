ARG BUILDBASEIMAGE=ghcr.io/green-software-foundation/if
ARG BASEIMAGE=node:18-slim

FROM --platform=$BUILDPLATFORM $BUILDBASEIMAGE AS deps

USER 0

ARG PLUGINS=plugins.txt
ARG NPMRC=.npmrc

# Install additional plugins
RUN --mount=src=.,target=settings \
    --mount=type=cache,target=/root/.npm,sharing=locked \
    if [ -r settings/$NPMRC -a -s settings/$NPMRC ]; then \
        cp settings/$NPMRC /root/.npmrc; \
    fi; \
    npm install --no-fund $(cat settings/$PLUGINS); \
    rm -f /root/.npmrc

# Remove devDependencies
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm prune --ignore-scripts --omit=dev

# Remove empty directory
RUN rmdir --ignore-fail-on-non-empty node_modules/*


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
COPY --from=deps /usr/local/bin/docker-entrypoint.sh /usr/local/bin

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
