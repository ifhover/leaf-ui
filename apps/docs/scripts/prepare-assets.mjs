import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(new URL('../../../packages/react/package.json', import.meta.url));
const destination = fileURLToPath(
  new URL('../docs/public/media/pdf.worker.min.mjs', import.meta.url),
);
await mkdir(fileURLToPath(new URL('../docs/public/media/', import.meta.url)), { recursive: true });
await copyFile(require.resolve('pdfjs-dist/build/pdf.worker.min.mjs'), destination);
