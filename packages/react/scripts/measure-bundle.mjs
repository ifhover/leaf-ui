import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, '.quality/bundles');
await mkdir(output, { recursive: true });
const cases = {
  base: `import '@ifhover/leaf-ui/styles.css'; export const baseStyles = true;`,
  button: `import { Button } from '@ifhover/leaf-ui/button'; export { Button };`,
  table: `export { Table } from '@ifhover/leaf-ui/table';`,
  tableAdapter: `export { DataTable } from '@ifhover/leaf-ui/table/tanstack';`,
  form: `export { ConfigProvider } from '@ifhover/leaf-ui/config-provider'; export { Form, FormField } from '@ifhover/leaf-ui/form'; export { Input } from '@ifhover/leaf-ui/input'; export { InputNumber } from '@ifhover/leaf-ui/input-number'; export { Select } from '@ifhover/leaf-ui/select'; export { DatePicker } from '@ifhover/leaf-ui/date-picker'; export { CheckboxGroup } from '@ifhover/leaf-ui/checkbox'; export { Button } from '@ifhover/leaf-ui/button';`,
  all: `export * from '@ifhover/leaf-ui';`,
};
const report = {
  node: process.version,
  includes: 'Leaf UI and transitive runtime dependencies; React/ReactDOM external',
  cases: {},
};
const foundationGzip = gzipSync(await readFile(path.join(root, 'dist/esm/styles/foundation.css')), {
  level: 9,
}).length;
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
  if (name !== 'tableAdapter')
    assert.ok(
      !Object.keys(result.metafile.inputs).some((file) =>
        /@tanstack[\\/]react-table|@tanstack[\\/]table-core|[\\/]tabletanstack[\\/]/u.test(file),
      ),
      `${name} must not load the optional table engine`,
    );
  if (name === 'table')
    assert.ok(report.cases[name].js.gzip < 14 * 1024, 'Native Table JS exceeds 14 KiB gzip');
  if (name === 'tableAdapter')
    assert.ok(report.cases[name].js.gzip < 96 * 1024, 'Table adapter JS exceeds 96 KiB gzip');
  if (name === 'button') {
    const css = await readFile(path.join(output, `${name}.css`), 'utf8');
    assert.match(css, /\.leaf-button/);
    assert.doesNotMatch(css, /\.leaf-table|\.leaf-input|\.leaf-modal/);
    // Guard against accidentally pulling in unrelated, expensive component families.
    assert.ok(
      !Object.keys(result.metafile.inputs).some((file) =>
        /qrcode\.react|yet-another-react-lightbox/u.test(file),
      ),
    );
    assert.ok(report.cases[name].js.gzip < 5 * 1024, 'Button-only JS regression: over 5 KiB gzip');
    // The fixture now includes the automatically loaded shared foundation.
    // Keep the existing component budget, accounting for that shared CSS separately.
    assert.ok(
      report.cases[name].css.gzip < foundationGzip + 4.25 * 1024,
      'Button CSS regression: foundation plus over 4.25 KiB gzip',
    );
  }
}
// 0.6 includes ICU messages and five built-in languages; see QUALITY.md for
// measured 0.5/0.6 comparisons and the retained optional-engine boundaries.
assert.ok(report.cases.form.js.gzip < 88 * 1024, 'Form JS regression: over 88 KiB gzip');
// This fixture now includes the shared base and all API feedback services;
// the previous standalone-import fixture omitted their CSS.
assert.ok(
  report.cases.form.css.gzip < 14.5 * 1024,
  'Form + services CSS regression: over 14.5 KiB gzip',
);
assert.ok(report.cases.all.js.gzip < 250 * 1024, 'Library JS regression: over 250 KiB gzip');
// Static light/dark derived palettes and inherited density add ~2.6 KiB to the full CSS.
// Standalone styles prune unused derived colors and retain their existing budgets.
// Dialog sections and card/list choices add ~1.75 KiB to full CSS, with no new runtime engine.
assert.ok(report.cases.all.css.gzip < 41 * 1024, 'Library CSS regression: over 41 KiB gzip');
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
