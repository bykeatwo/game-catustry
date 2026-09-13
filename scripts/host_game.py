#!/usr/bin/env python3
"""
Cat's Food Chain Farm - Local Game Server with Tunnel
Usage: python3 host_game.py [--port PORT] [--tunnel] [--browse]

This script:
1. Serves the built game from dist/ locally
2. Optionally creates a cloudflared tunnel for public access using trycloudflare

Cloudflared Trial Tunnel (no account needed):
- Automatically creates a temporary tunnel at https://trycloudflare.com/
- Tunnels are short-lived but perfect for testing
"""

import http.server
import socketserver
import subprocess
import sys
import os
import threading
import time
import re
import signal

PORT = 5173
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

# Global for cleanup
httpd = None

def start_server(port=PORT):
    """Start the HTTP server."""
    global httpd
    os.chdir(DIRECTORY)
    
    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", port), Handler) as server:
        httpd = server
        print(f"\n{'='*60}")
        print("🎮 CAT'S FOOD CHAIN FARM - Game Server")
        print(f"{'='*60}")
        print(f"\n✓ Local URL: http://localhost:{port}")
        print("\n" + "-"*60)
        print("Controls:")
        print("  WASD or Arrow Keys - Move the cat")
        print("  Space / Tap - Work at facilities/plots")
        print("  Gather crops, sell to merchant, buy seeds!")
        print("-"*60)
        print("\nPress Ctrl+C to stop the server\n")
        
        server.serve_forever()

def start_tunnel(port=PORT):
    """Start cloudflared tunnel using trycloudflare (no account needed)."""
    print("\n🚀 Starting cloudflared tunnel (trycloudflare.com)...")
    print("   This creates a temporary public URL for testing.")
    print()
    
    try:
        # cloudflared tunnel --url http://localhost:5173
        proc = subprocess.Popen(
            ['cloudflared', 'tunnel', '--url', f'http://localhost:{port}'],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        
        tunnel_url = None
        
        # Read output in real-time
        for line in iter(proc.stdout.readline, ''):
            line = line.strip()
            print(f"[cloudflared] {line}")
            
            # Look for the tunnel URL in output
            # Format: "https://something.trycloudflare.com"
            url_match = re.search(r'https://[a-z0-9-]+\.trycloudflare\.com', line)
            if url_match and 'Quick Tunnel has been created' in line:
                tunnel_url = url_match.group(0)
                print(f"\n{'█'*60}")
                print(f"🎉 PUBLIC GAME URL:")
                print(f"   {tunnel_url}")
                print(f"{'█'*60}\n")
                # Continue running so tunnel stays active
                continue
            
            if 'cannot determine default configuration' in line.lower():
                # This is OK - cloudflared is working without config
                pass
            
            if 'registered tunnel connection' in line.lower():
                print(f"✅ Tunnel connected successfully!")
                
        return proc
        
    except FileNotFoundError:
        print("❌ cloudflared not found!")
        print("   Install from: https://developers.cloudflare.com/cloudflared/get-started/")
        return None

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Host Cat\'s Food Chain Farm')
    parser.add_argument('--port', type=int, default=PORT, help='Server port')
    parser.add_argument('--tunnel', action='store_true', help='Enable public tunnel')
    parser.add_argument('--build', action='store_true', help='Build before serving')
    args = parser.parse_args()
    
    # Build the game if requested
    if args.build:
        print("🔨 Building game...")
        result = subprocess.run(['npm', 'run', 'build'], 
                                cwd=os.path.dirname(__file__),
                                capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Build failed:\n{result.stderr}")
            return 1
        print("✅ Build successful!\n")
    
    # Check if dist exists
    if not os.path.exists(DIRECTORY):
        print(f"❌ dist/ directory not found at {DIRECTORY}")
        print("   Run 'npm run build' first")
        return 1
    
    # Start tunnel in background if requested
    tunnel_proc = None
    if args.tunnel:
        tunnel_proc = threading.Thread(target=start_tunnel, args=(args.port,), daemon=True)
        tunnel_proc.start()
        time.sleep(2)  # Give tunnel time to start
    
    # Start server
    try:
        start_server(args.port)
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped.")
        if tunnel_proc:
            print("   Tunnel connection closed.")
        return 0
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"\n⚠️  Port {args.port} is already in use.")
            print("   Try: lsof -i :{port} | kill -9 $(lsof -t -i :{port})")
        return 1

if __name__ == '__main__':
    main()