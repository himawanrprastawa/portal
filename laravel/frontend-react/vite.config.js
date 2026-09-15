import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: process.env.VERCEL ? 'dist' : path.resolve(__dirname, '../public'),
    emptyOutDir: false, // Don't wipe everything, will overwrite index.html and assets
  },
  server: {
    port: 3000,
    open: true
  }
});

