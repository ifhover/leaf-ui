import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const packageRoot = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));
const entry = manifest.exports['.'];

for (const relativePath of [
  entry.import.types,
  entry.import.default,
  entry.require.types,
  entry.require.default,
  manifest.exports['./styles.css'],
]) {
  assert.ok((await stat(new URL(relativePath, packageRoot))).isFile(), relativePath);
}

const esm = await import('@leaf-ui/react');
const cjs = require('@leaf-ui/react');

for (const [format, api] of [
  ['ESM', esm],
  ['CommonJS', cjs],
]) {
  assert.ok(api.Button, `${format} must export Button`);
  const markup = renderToStaticMarkup(createElement(api.Button, null, 'Leaf UI'));
  assert.match(markup, /<button/);
  assert.match(markup, /Leaf UI/);
  assert.match(markup, /type="button"/);
}

const esmTypes = await readFile(new URL(entry.import.types, packageRoot), 'utf8');
assert.ok(!esmTypes.includes('.css'), 'Type declarations must not reference extracted CSS');
const css = await readFile(new URL(manifest.exports['./styles.css'], packageRoot), 'utf8');
assert.match(css, /--leaf-color-primary/);
assert.ok(css.includes('.leaf-button'));
const esmCode = await readFile(new URL(entry.import.default, packageRoot), 'utf8');
const cjsCode = await readFile(new URL(entry.require.default, packageRoot), 'utf8');
assert.ok(esmCode.includes('from "react"'), 'ESM must keep React external');
assert.ok(cjsCode.includes('require("react")'), 'CommonJS must keep React external');
console.log('Package exports, ESM/CommonJS rendering, declarations and stylesheet verified.');
console.log('Package root:', fileURLToPath(packageRoot));
