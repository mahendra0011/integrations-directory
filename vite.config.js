import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      ignored: [
        '**/*.log',
        '**/chrome-headless*.html',
        '**/tmp-browser-check/**',
        '**/.tmp-cdp-*/**',
        '**/.tmp-qa-*/**',
        '**/dist/**',
      ],
    },
  },
});
