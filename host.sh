#!/bin/bash
# Host Cat's Food Chain Farm with Cloudflared tunnel
# Usage: ./host.sh [options]
# Options:
#   --prod    Build and serve production preview (default: dev mode)
#   --port N  Use port N (default: 5173)
#
# The tunnel URL will be output as https://<random-id>.trycloudflare.com/

set -e

PORT=5173
DEV_MODE=1

while [[ $# -gt 0 ]]; do
    case $1 in
        --prod|--build) DEV_MODE=0; shift ;;
        --port) PORT="$2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

echo "=== Cat's Food Chain Farm ==="
echo "Port: $PORT"
echo "Mode: $( [ $DEV_MODE -eq 1 ] && echo 'dev (hot reload)' || echo 'preview (built)' )"
echo ""

if [ $DEV_MODE -eq 1 ]; then
    echo "🚀 Starting dev server on port $PORT..."
    npm run dev -- --port $PORT &
    VITE_PID=$!
else
    echo "🏗️  Building and starting preview server..."
    npm run build
    npx vite preview --port $PORT &
    VITE_PID=$!
fi

# Wait for server
echo "⏳ Waiting for server..."
sleep 3

# Verify server is running
if ! kill -0 $VITE_PID 2>/dev/null; then
    echo "❌ Error: server failed to start"
    exit 1
fi

echo ""
echo "=== 🌐 Cloudflared Tunnel ==="
echo "Your game will be accessible at a public URL!"
echo ""

cleanup() {
    echo ""
    echo "🛑 Stopping..."
    kill $VITE_PID 2>/dev/null || true
}
trap cleanup EXIT

cloudflared tunnel --url http://localhost:$PORT