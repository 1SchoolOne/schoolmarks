#!/bin/bash

set -euo pipefail

VERSION="v2.5.1"
INSTALL_DIR="/usr/local/bin"
TEMP_DIR=$(mktemp -d)
cleanup() { rm -rf "$TEMP_DIR"; }
trap cleanup EXIT

# Detect architecture
ARCH=$(uname -m)
case $ARCH in
    x86_64) ARCH="amd64" ;;
    aarch64) ARCH="arm64" ;;
    *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

FILENAME="overmind-${VERSION}-linux-${ARCH}.gz"
URL="https://github.com/DarthSim/overmind/releases/download/${VERSION}/${FILENAME}"

echo "Downloading overmind ${VERSION} for ${ARCH}..."
curl -L "$URL" -o "$TEMP_DIR/overmind.gz"

echo "Installing to $INSTALL_DIR..."
cd "$TEMP_DIR"
gzip -d overmind.gz
chmod +x overmind

if [ -w "$INSTALL_DIR" ]; then
    mv overmind "$INSTALL_DIR/"
else
    echo "Need sudo rights to move overmind to $INSTALL_DIR"
    sudo mv overmind "$INSTALL_DIR/"
fi

# Verify installation
if command -v overmind >/dev/null 2>&1; then
    echo "Installation successful: $(overmind --version)"
else
    echo "Installation verification failed"
    exit 1
fi