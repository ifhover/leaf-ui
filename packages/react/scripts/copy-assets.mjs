import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const destination = fileURLToPath(new URL('../dist/esm/', import.meta.url));
await copyFile(
  require.resolve('pdfjs-dist/LICENSE'),
  fileURLToPath(new URL('../PDFJS-LICENSE', import.meta.url)),
);
await mkdir(destination, { recursive: true });
await copyFile(
  require.resolve('pdfjs-dist/build/pdf.worker.min.mjs'),
  `${destination}/pdf.worker.min.mjs`,
);
for (const format of ['esm', 'cjs']) {
  const root = fileURLToPath(new URL(`../dist/${format}/`, import.meta.url));
  await copyFile(path.join(root, 'styles/index.css'), path.join(root, 'index.css'));
  await copyFile(path.join(root, 'styles/index.css.map'), path.join(root, 'index.css.map'));
}
