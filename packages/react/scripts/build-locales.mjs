import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

const output = new URL('../dist/locales/', import.meta.url);
await mkdir(output, { recursive: true });
for (const name of [
  'en-US.json',
  'zh-CN.json',
  'zh-TW.json',
  'ja-JP.json',
  'ko-KR.json',
  'schema.json',
])
  await copyFile(new URL(`../src/locales/${name}`, import.meta.url), new URL(name, output));
// Rslib rewrites unbundled JSON imports to JS. Emit explicit data modules so CJS
// default interop is correct and neither module graph requires JSON import attributes.
for (const tag of ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR']) {
  const data = JSON.stringify(JSON.parse(await readFile(new URL(`${tag}.json`, output), 'utf8')));
  for (const [format, extension, statement] of [
    ['esm', 'js', `export default ${data};\n`],
    ['cjs', 'cjs', `module.exports = ${data};\n`],
  ]) {
    const directory = new URL(`../dist/${format}/locales/`, import.meta.url);
    await mkdir(directory, { recursive: true });
    await writeFile(new URL(`${tag}.${extension}`, directory), statement);
  }
}
await copyFile(
  new URL('./check-translations.mjs', import.meta.url),
  new URL('check-translations.mjs', output),
);
