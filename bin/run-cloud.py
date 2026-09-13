#!/usr/bin/env python3
"""
run-cloud.py - One-command game hosting with cloudflared tunnel

Usage: python3 run-cloud.py

This script:
1. Builds the game (npm run build)
2. Starts local HTTP server
3. Creates trycloudflare tunnel (no account needed)
4. Prints public URL for your phone

Requirements:
- cloudflared in PATH
- npm installed

Output:
   After tunnel starts, access: https://xxx.trycloudflare.com
"""

import subprocess
import os
import sys
import re
import signal
import time

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
PORT = 5173

def main():
    print("=" * 50)
    print("CAT'S FOOD CHAIN FARM - Cloud Tunnel")
    print("=" * 50)
    
    # Change to project dir
    os.chdir(PROJECT_DIR)
    
    # Build the game
    print("\n🔨 Building game...")
    result = subprocess.run(['npm', 'run', 'build'], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Build failed:\n{result.stderr}")
        return 1
    
    print("✅ Build successful!\n")
    
    # Start local server
    print(f"🎮 Starting local server on port {PORT}...")
    server = subprocess.Popen(
        ['python3', '-m', 'http.server', str(PORT)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    time.sleep(2)  # Wait for server to bind
    
    # Start cloudflared tunnel
    print("🌐 Creating cloudflared tunnel (trycloudflare)...")
    tunnel = subprocess.Popen(
        ['cloudflared', 'tunnel', '--url', f'http://localhost:{PORT}', '--no-autoupdate'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    tunnel_url = None
    
    # Read tunnel output and find URL
    print("\n⏳ Waiting for tunnel...\n")
    for line in iter(tunnel.stdout.readline, ''):
        print(f"[tunnel] {line.strip()}")
        
        # Look for trycloudflare URL in output
        if 'trycloudflare.com' in line:
            match = re.search(r'https://[a-z0-9-]+\.trycloudflare\.com', line)
            if match:
                tunnel_url = match.group(0)
    
    return tunnel_url, server, tunnel

if __name__ == '__main__':
    url, server, tunnel = main()
    
    if url:
        print("\n" + "=" * 50)
        print("🎉 SUCCESS! PUBLIC URL:")
        print("=" * 50)
        print(f"\n   {url}")
        print("\n   Open on your phone browser!")
        print("\n" + "=" * 50)
        
        # Keep running until Ctrl+C
        try:
            server.wait()
        except KeyboardInterrupt:
            print("\n\nStopping...")
        
        server.terminate()
        tunnel.terminate()
    else:
        print("\n❌ Tunnel failed to start")