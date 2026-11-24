import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { host: '127.0.0.1', port: 8080, strictPort: true },
  preview: { host: '127.0.0.1', port: 8080, strictPort: true },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 180,
  },
});
