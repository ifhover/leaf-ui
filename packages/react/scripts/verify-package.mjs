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
const components = [
  ['Button', { danger: true }, 'Leaf UI', /<button/],
  ['Input', { name: 'title' }, null, /<input/],
  ['Textarea', { name: 'description' }, null, /<textarea/],
  ['Checkbox', { defaultChecked: true }, 'Updates', /type="checkbox"/],
  ['Radio', { value: 'light' }, 'Light', /type="radio"/],
  [
    'RadioGroup',
    { label: 'Theme', options: [{ value: 'light', label: 'Light' }] },
    null,
    /<fieldset/,
  ],
  ['Switch', { defaultChecked: true }, 'Notifications', /role="switch"/],
  ['Select', { options: [{ value: 'design', label: 'Design' }] }, null, /<select/],
];
for (const [format, api] of [
  ['ESM', esm],
  ['CommonJS', cjs],
]) {
  for (const [name, props, children, expected] of components) {
    assert.ok(api[name], `${format} must export ${name}`);
    const markup = renderToStaticMarkup(createElement(api[name], props, children));
    assert.match(markup, expected);
    assert.ok(markup.includes('leaf-'), `${name} must include its component class`);
  }
}
const esmTypes = await readFile(new URL(entry.import.types, packageRoot), 'utf8');
assert.ok(
  !esmTypes.includes('.css') && !esmTypes.includes('.scss'),
  'Declarations must not reference extracted styles',
);
const css = await readFile(new URL(manifest.exports['./styles.css'], packageRoot), 'utf8');
assert.match(css, /--leaf-control-height:\s*34px/);
assert.match(css, /--leaf-color-danger/);
for (const name of ['button', 'input', 'textarea', 'checkbox', 'radio', 'switch', 'select']) {
  assert.ok(css.includes(`.leaf-${name}`), `Styles must include ${name}`);
}
assert.ok(!css.includes('@use'), 'Published CSS must be compiled from SCSS');
const esmCode = await readFile(new URL(entry.import.default, packageRoot), 'utf8');
const cjsCode = await readFile(new URL(entry.require.default, packageRoot), 'utf8');
assert.ok(esmCode.includes('from "react"'), 'ESM must keep React external');
assert.ok(cjsCode.includes('require("react")'), 'CommonJS must keep React external');
assert.ok(esmCode.includes('from "lucide-react"'), 'Lucide must remain an external dependency');
assert.ok(cjsCode.includes('require("lucide-react")'), 'CommonJS must keep Lucide external');
console.log(
  'All component exports, ESM/CommonJS rendering, declarations, compiled SCSS and dependencies verified.',
);
console.log('Package root:', fileURLToPath(packageRoot));
