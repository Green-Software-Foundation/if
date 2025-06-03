#!/bin/sh
set -e

# Install plugins if plugins.txt exists.
if [ -f plugins.txt ] && [ -r plugins.txt ]; then
  echo "Installing plugins..."
  npm install --no-fund $(cat plugins.txt)
fi

# Run command with node if the first argument contains a "-" or is not a system command.
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ] || { [ -f "${1}" ] && ! [ -x "${1}" ]; } || [ -d "${1}" ]; then
  set -- node "$@"
fi

exec "$@"
