import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: '.',
  base: './',
  build: { outDir: 'dist' },
  resolve: { alias: { '@': path.resolve(process.cwd(), 'src') } },
  server: {
    allowedHosts: [
      '.trycloudflare.com' // Allows example.com and all its subdomains
    ]
  }
});