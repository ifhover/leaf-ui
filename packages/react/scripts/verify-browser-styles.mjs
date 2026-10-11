import assert from 'node:assert/strict';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, '.quality/style-entries');
const require = createRequire(import.meta.url);
const rslibRequire = createRequire(require.resolve('@rslib/core'));
const { rspack } = rslibRequire('@rspack/core');
const { build: viteBuild } = await import(pathToFileURL(require.resolve('vite')));
const external = ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'];
const cases = {
  button: {
    names: ['Button'],
    include: ['button'],
    exclude: ['input', 'dropdown', 'table', 'modal'],
  },
  fields: {
    names: ['Button', 'Input'],
    include: ['button', 'input'],
    exclude: ['table', 'modal', 'select'],
  },
  table: {
    names: ['Table'],
    include: ['table', 'scrollbar', 'loading'],
    exclude: ['image-cropper', 'date-picker'],
  },
  date: {
    names: ['DatePicker'],
    include: ['date-picker', 'calendar', 'time-picker'],
    exclude: ['table', 'image-cropper'],
  },
  config: {
    names: ['ConfigProvider'],
    include: ['message', 'confirm', 'notification', 'loading-bar'],
    exclude: ['table', 'image-cropper'],
  },
  helper: { names: ['colorContrast'], include: [], exclude: ['button', 'input', 'modal', 'table'] },
  unused: {
    names: ['Button'],
    unused: true,
    include: [],
    exclude: ['button', 'input', 'modal', 'table'],
  },
  lazy: {
    names: ['Button'],
    lazy: true,
    include: ['button'],
    exclude: ['dropdown', 'input', 'table', 'modal'],
  },
  subpath: {
    names: ['Button'],
    subpath: '/button',
    include: ['button'],
    exclude: ['dropdown', 'input', 'table', 'modal'],
  },
  base: {
    names: ['Button'],
    base: true,
    include: ['button', 'message', 'confirm', 'notification', 'loading-bar'],
    exclude: ['table', 'image-cropper'],
  },
};

async function readOutputs(directory) {
  const files = await readdir(directory, { recursive: true });
  const css = await Promise.all(
    files
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFile(path.join(directory, file), 'utf8')),
  );
  return css.join('\n');
}

const report = [];
for (const engine of ['rspack', 'vite']) {
  const styles = new Map();
  for (const [name, fixture] of Object.entries(cases)) {
    const directory = path.join(output, engine, name);
    await mkdir(directory, { recursive: true });
    const source = path.join(directory, 'entry.js');
    if (fixture.lazy) {
      await writeFile(
        path.join(directory, 'lazy.js'),
        "export { Button } from '@ifhover/leaf-ui';\n",
      );
      await writeFile(source, "globalThis.loadLeafButton = () => import('./lazy.js');\n");
    } else {
      await writeFile(
        source,
        `import { ${fixture.names.join(', ')} } from '@ifhover/leaf-ui${fixture.subpath ?? ''}';\n` +
          (fixture.base ? "import '@ifhover/leaf-ui/styles.css';\n" : '') +
          (fixture.unused
            ? "console.log('Unused component');\n"
            : `globalThis.leafComponents = { ${fixture.names.join(', ')} };\n`),
      );
    }
    const destination = path.join(directory, 'dist');
    assert.ok(
      destination.startsWith(`${output}${path.sep}`),
      'Only clean fixture output inside .quality',
    );
    if (engine === 'rspack') {
      const compiler = rspack({
        mode: 'production',
        context: root,
        entry: source,
        output: { path: destination, clean: true },
        externals: Object.fromEntries(external.map((name) => [name, `commonjs ${name}`])),
        experiments: { css: true },
        module: { rules: [{ test: /\.css$/, type: 'css' }] },
        stats: 'errors-only',
      });
      await new Promise((resolve, reject) =>
        compiler.run((error, stats) =>
          compiler.close((closeError) => {
            if (error || closeError || stats?.hasErrors())
              reject(error || closeError || new Error(stats.toString()));
            else resolve();
          }),
        ),
      );
    } else {
      await viteBuild({
        configFile: false,
        root,
        logLevel: 'error',
        build: {
          outDir: destination,
          emptyOutDir: true,
          rollupOptions: { input: source, external },
        },
      });
    }
    const css = await readOutputs(destination);
    for (const selector of fixture.include)
      assert.ok(css.includes(`.leaf-${selector}`), `${engine} ${name} includes ${selector}`);
    for (const selector of fixture.exclude)
      assert.ok(
        !new RegExp(`\\.leaf-${selector}\\s*\\{`).test(css),
        `${engine} ${name} excludes ${selector}`,
      );
    styles.set(name, css);
    report.push({ engine, fixture: name, cssBytes: Buffer.byteLength(css) });
  }
  assert.equal(
    styles.get('button').trim(),
    styles.get('subpath').trim(),
    `${engine}: root and subpath Button CSS must match`,
  );
}
await writeFile(path.join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.table(report);
console.log(
  'Root named imports retain only used implementation styles in Rspack and Vite production builds.',
);
