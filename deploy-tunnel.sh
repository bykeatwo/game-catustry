#!/bin/bash
# Cloudflared tunnel script for Cat's Food Chain Farm
# Usage: ./deploy-tunnel.sh

# OPTIONS:
# 1. Requires cloudflared installed (https://developers.cloudflare.com/cloudflared/)
# 2. Requires Cloudflare account with tunnel configured
# 3. Let's generate a quick tunnel instead

set -e

echo "=== Cloudflared Tunnel Setup ==="
echo ""
echo "This script helps deploy the game via cloudflared."

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "cloudflared not found. Installing..."
    if command -v apt-get &> /dev/null; then
        curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/cloudflared.deb
        sudo apt-get install -y /tmp/cloudflared.deb
    elif command -v brew &> /dev/null; then
        brew install cloudflare/cloudflare/cloudflared
    else
        echo "Please install cloudflared manually:"
        echo "https://developers.cloudflare.com/cloudflared/get-started/#installing"
        exit 1
    fi
fi

echo ""
echo "Build the game first..."
npm run build

echo ""
echo "Start vite preview server on port 5173..."
echo "Running: npx vite preview --port 5173 &"

# Start vite preview in background
npx vite preview --port 5173 &
VITE_PID=$!

# Wait for server to start
sleep 3

echo ""
echo "Starting cloudflared tunnel..."
echo "Tunnel URL will print below when ready."

# Start cloudflared HTTP tunnel
cloudflared tunnel --url http://localhost:5173

# Handle graceful shutdown
trap "kill $VITE_PID 2>/dev/null" EXIT