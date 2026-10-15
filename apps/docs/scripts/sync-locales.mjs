import { copyFile, mkdir } from 'node:fs/promises';

// Public files must exist before Rspress checks links and collects static assets.
const output = new URL('../docs/public/locales/', import.meta.url);
await mkdir(output, { recursive: true });
for (const name of [
  'en-US.json',
  'zh-CN.json',
  'zh-TW.json',
  'ja-JP.json',
  'ko-KR.json',
  'schema.json',
])
  await copyFile(
    new URL(`../../../packages/react/src/locales/${name}`, import.meta.url),
    new URL(name, output),
  );
