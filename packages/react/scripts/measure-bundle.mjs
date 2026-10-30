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
  table: `export { DataTable } from '@ifhover/leaf-ui/table';`,
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
const inputs = new Map();
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
  inputs.set(name, Object.keys(result.metafile.inputs));
}
// Preserve measured evidence even when a size budget fails.
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

for (const [name, modules] of inputs) {
  assert.ok(
    !modules.some((file) => /viewerjs|yet-another-react-lightbox/u.test(file)),
    `${name} must not load an external image preview engine`,
  );
  if (!['table', 'tableAdapter'].includes(name))
    assert.ok(
      !modules.some((file) =>
        /@tanstack[\\/]react-table|@tanstack[\\/]table-core|[\\/]tabletanstack[\\/]/u.test(file),
      ),
      `${name} must not load the optional table engine`,
    );
  if (['table', 'tableAdapter'].includes(name))
    assert.ok(report.cases[name].js.gzip < 96 * 1024, 'DataTable JS exceeds 96 KiB gzip');
  if (name === 'button') {
    const css = await readFile(path.join(output, `${name}.css`), 'utf8');
    assert.match(css, /\.leaf-button/);
    assert.doesNotMatch(css, /\.leaf-table|\.leaf-input|\.leaf-modal/);
    // Guard against accidentally pulling in unrelated, expensive component families.
    assert.ok(!modules.some((file) => /qrcode\.react/u.test(file)));
    assert.ok(report.cases[name].js.gzip < 5 * 1024, 'Button-only JS regression: over 5 KiB gzip');
    // The fixture now includes the automatically loaded shared foundation.
    // Keep the existing component budget, accounting for that shared CSS separately.
    assert.ok(
      report.cases[name].css.gzip < foundationGzip + 4.25 * 1024,
      'Button CSS regression: foundation plus over 4.25 KiB gzip',
    );
  }
}
// 0.9 adds global image previews, datetime and segmented input. With identical esbuild
// settings/dependencies, npm 0.8.1 measures 85.27/16.46 KiB form JS/CSS; 0.9 measures
// 113.04/20.12 KiB. These totals deliberately include all lazy preview code and CSS,
// even though verify-browser-styles protects their absence from initial assets.
assert.ok(report.cases.form.js.gzip < 120 * 1024, 'Form JS regression: over 120 KiB gzip');
assert.ok(
  report.cases.form.css.gzip < 21.25 * 1024,
  'Form + services CSS regression: over 21.25 KiB gzip',
);
assert.ok(report.cases.all.js.gzip < 250 * 1024, 'Library JS regression: over 250 KiB gzip');
// Calendar, picker, Card, Menu, FileList and dialog structures raise full CSS from
// npm 0.8.1's 46.10 to 51.04 KiB; retain about 6% headroom, not a changed metric.
assert.ok(report.cases.all.css.gzip < 54 * 1024, 'Library CSS regression: over 54 KiB gzip');
assert.ok(
  report.cases.button.css.gzip < report.cases.all.css.gzip,
  'Component CSS must be smaller than the whole library',
);
