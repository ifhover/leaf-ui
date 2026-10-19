import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  server: { host: '127.0.0.1', port: 4178, strictPort: true },
  resolve: {
    alias: [
      {
        find: '@ifhover/leaf-ui/table/tanstack',
        replacement: fileURLToPath(new URL('../../src/tabletanstack/index.ts', import.meta.url)),
      },
      {
        find: '@ifhover/leaf-ui/table',
        replacement: fileURLToPath(new URL('../../src/tabletanstack/index.ts', import.meta.url)),
      },
      {
        find: '@ifhover/leaf-ui',
        replacement: fileURLToPath(new URL('../../src/index.ts', import.meta.url)),
      },
    ],
    dedupe: ['react', 'react-dom'],
  },
});
