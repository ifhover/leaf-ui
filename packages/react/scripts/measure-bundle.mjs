import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, '.quality/bundles');
await mkdir(output, { recursive: true });
const cases = {
  button: `import { Button } from '@sudden3/leaf-ui/button'; import '@sudden3/leaf-ui/button/style.css'; export { Button };`,
  form: `import { ConfigProvider, Form, FormField, Input, InputNumber, Select, DatePicker, CheckboxGroup, Button } from '@sudden3/leaf-ui'; import '@sudden3/leaf-ui/form/style.css'; import '@sudden3/leaf-ui/input/style.css'; import '@sudden3/leaf-ui/input-number/style.css'; import '@sudden3/leaf-ui/select/style.css'; import '@sudden3/leaf-ui/date-picker/style.css'; import '@sudden3/leaf-ui/checkbox/style.css'; export { ConfigProvider, Form, FormField, Input, InputNumber, Select, DatePicker, CheckboxGroup, Button };`,
  all: `export * from '@sudden3/leaf-ui'; import '@sudden3/leaf-ui/styles.css';`,
};
const report = {
  node: process.version,
  includes: 'Leaf UI and transitive runtime dependencies; React/ReactDOM external',
  cases: {},
};
for (const [name, code] of Object.entries(cases)) {
  const result = await build({
    stdin: { contents: code, resolveDir: root, sourcefile: `${name}.tsx` },
    bundle: true,
    minify: true,
    treeShaking: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    external: ['react', 'react-dom', 'react/*', 'react-dom/*'],
    define: { 'process.env.NODE_ENV': '"production"' },
    outfile: path.join(output, `${name}.js`),
    metafile: true,
  });
  const files = await Promise.all(
    Object.keys(result.metafile.outputs)
      .filter((file) => /\.(js|css)$/u.test(file))
      .map(async (file) => {
        const data = await readFile(file);
        return {
          type: path.extname(file).slice(1),
          bytes: data.length,
          gzip: gzipSync(data, { level: 9 }).length,
        };
      }),
  );
  report.cases[name] = Object.fromEntries(
    files.map((file) => [file.type, { bytes: file.bytes, gzip: file.gzip }]),
  );
  report.cases[name].modules = Object.keys(result.metafile.inputs).length;
  if (name === 'button') {
    // Guard against accidentally pulling in unrelated, expensive component families.
    assert.ok(
      !Object.keys(result.metafile.inputs).some((file) =>
        /signature_pad|react-image-crop|qrcode\.react|yet-another-react-lightbox/u.test(file),
      ),
    );
    assert.ok(report.cases[name].js.gzip < 5 * 1024, 'Button-only JS regression: over 5 KiB gzip');
    assert.ok(report.cases[name].css.gzip < 4 * 1024, 'Button CSS regression: over 4 KiB gzip');
  }
}
assert.ok(report.cases.form.js.gzip < 64 * 1024, 'Form JS regression: over 64 KiB gzip');
assert.ok(report.cases.form.css.gzip < 10 * 1024, 'Form CSS regression: over 10 KiB gzip');
assert.ok(report.cases.all.js.gzip < 250 * 1024, 'Library JS regression: over 250 KiB gzip');
assert.ok(report.cases.all.css.gzip < 35 * 1024, 'Library CSS regression: over 35 KiB gzip');
assert.ok(
  report.cases.button.css.gzip < report.cases.all.css.gzip,
  'Component CSS must be smaller than the whole library',
);
await writeFile(
  path.join(root, '.quality/bundle-report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.table(
  Object.entries(report.cases).map(([entry, value]) => ({
    entry,
    'JS gzip KiB': (value.js.gzip / 1024).toFixed(2),
    'CSS gzip KiB': (value.css.gzip / 1024).toFixed(2),
    modules: value.modules,
  })),
);
console.log(report.includes);
