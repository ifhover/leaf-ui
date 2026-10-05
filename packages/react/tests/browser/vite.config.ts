import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  server: { host: '127.0.0.1', port: 4178, strictPort: true },
  resolve: {
    alias: { '@sudden3/leaf-ui': fileURLToPath(new URL('../../src/index.ts', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
});
