import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { compileStringAsync } from 'sass-embedded';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'src');
const require = createRequire(import.meta.url);
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const components = [
  ...new Set(
    Object.values(manifest.exports)
      .map((entry) => entry?.import?.default?.match(/^\.\/dist\/esm\/([^/]+)\/index\.js$/)?.[1])
      .filter(Boolean),
  ),
];
const styled = new Set();
for (const name of components) {
  try {
    if ((await stat(path.join(source, name, `${name}.scss`))).isFile()) styled.add(name);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
const sassOptions = {
  style: 'compressed',
  loadPaths: [source, path.join(root, 'node_modules'), path.join(root, '../../node_modules')],
  importers: [
    {
      findFileUrl(url) {
        if (url.startsWith('.')) return null;
        try {
          return pathToFileURL(require.resolve(url));
        } catch {
          return null;
        }
      },
    },
  ],
};
const graph = new Map();
const esm = path.join(root, 'dist/esm');
async function dependencies(file) {
  if (graph.has(file)) return graph.get(file);
  const code = await readFile(file, 'utf8');
  const modules = [...code.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)['"](\.[^'"]+)['"]/g)].map(
    (match) => path.resolve(path.dirname(file), match[1]),
  );
  graph.set(file, modules);
  return modules;
}
async function stylesFor(name) {
  const visited = new Set(),
    styles = new Set();
  const pending = [path.join(esm, name, 'index.js')];
  for (const file of pending) {
    if (visited.has(file)) continue;
    visited.add(file);
    const folder = path.relative(esm, file).split(path.sep)[0];
    if (styled.has(folder)) styles.add(folder);
    if (file === path.join(esm, 'shared/calendar.js')) styles.add('shared-calendar');
    for (const dependency of await dependencies(file)) pending.push(dependency);
  }
  return [...styles].sort();
}
const styleGraph = new Map();
for (const name of components) styleGraph.set(name, await stylesFor(name));
const serviceStyles = [
  ...new Set(
    ['message', 'confirm', 'notification', 'loadingbar'].flatMap(
      (name) => styleGraph.get(name) ?? [],
    ),
  ),
].sort();
const base = await compileStringAsync(
  "@use 'styles/tokens';\n@use 'shared/floating';",
  sassOptions,
);

const componentCss = new Map();
for (const name of [...styled, 'shared-calendar']) {
  const module = name === 'shared-calendar' ? 'shared/calendar' : `${name}/${name}`;
  componentCss.set(name, (await compileStringAsync(`@use '${module}';`, sassOptions)).css);
}
for (const format of ['esm', 'cjs']) {
  const output = path.join(root, 'dist', format);
  const browser = path.join(output, 'browser');
  const modules = path.join(browser, 'modules');
  const styles = path.join(output, 'styles/components');
  const extension = format === 'esm' ? 'js' : 'cjs';
  const files = (await readdir(output, { recursive: true })).filter(
    (file) => file.endsWith(`.${extension}`) && file.split(path.sep)[0] !== 'browser',
  );
  await mkdir(modules, { recursive: true });
  await mkdir(styles, { recursive: true });
  for (const [name, css] of componentCss) await writeFile(path.join(styles, `${name}.css`), css);
  await writeFile(path.join(output, 'styles/foundation.css'), base.css);
  await writeFile(
    path.join(output, 'styles/base.css'),
    `@import './foundation.css';\n${serviceStyles.map((name) => `@import './components/${name}.css';`).join('\n')}\n`,
  );
  // CSS belongs to the implementation, not a re-export wrapper. Bundlers may
  // bypass side-effect-free barrels, but keep a used component's own module.
  // Mirror the complete graph so root and subpath imports share contexts and identity.
  for (const file of files) {
    const originalFile = path.join(output, file);
    const destination = path.join(modules, file);
    const relative = file.replaceAll(path.sep, '/');
    const folder = relative.split('/')[0];
    let owner = relative === `shared/calendar.${extension}` ? 'shared-calendar' : null;
    if (styled.has(folder) && !relative.endsWith(`/index.${extension}`)) {
      try {
        const tsx = relative.replace(new RegExp(`\\.${extension}$`), '.tsx');
        if ((await stat(path.join(source, tsx))).isFile()) owner = folder;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    const original = await readFile(originalFile, 'utf8');
    const prefix = original.match(
      /^(?:(?:"use (?:client|strict)"|'use (?:client|strict)');\s*)*/,
    )[0];
    const css = owner
      ? [path.join(output, 'styles/foundation.css'), path.join(styles, `${owner}.css`)]
      : [];
    const added = css
      .map((file) => {
        const relativeCss = path
          .relative(path.dirname(destination), file)
          .replaceAll(path.sep, '/');
        return format === 'esm' ? `import '${relativeCss}';\n` : `require('${relativeCss}');\n`;
      })
      .join('');
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, prefix + added + original.slice(prefix.length));
    try {
      const map = JSON.parse(await readFile(`${originalFile}.map`, 'utf8'));
      map.sources = map.sources.map((entry) =>
        /^[a-z][\w+.-]*:/i.test(entry)
          ? entry
          : path
              .relative(path.dirname(destination), path.resolve(path.dirname(originalFile), entry))
              .replaceAll(path.sep, '/'),
      );
      if (added) {
        const lines = map.mappings.split(';');
        lines.splice(
          prefix.split('\n').length - 1,
          0,
          ...Array(added.split('\n').length - 1).fill(''),
        );
        map.mappings = lines.join(';');
      }
      await writeFile(`${destination}.map`, JSON.stringify(map));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  for (const name of components) {
    const entry = `./modules/${name}/index.${extension}`;
    await writeFile(
      path.join(browser, `${name}.${extension}`),
      '"use client";\n' +
        (format === 'esm'
          ? `export * from '${entry}';\n`
          : `module.exports = require('${entry}');\n`),
    );
  }
  const entry = `./modules/index.${extension}`;
  await writeFile(
    path.join(browser, `index.${extension}`),
    '"use client";\n' +
      (format === 'esm'
        ? `export * from '${entry}';\n`
        : `module.exports = require('${entry}');\n`),
  );
}
console.log(
  `Built ${components.length} automatic browser style entries; base CSS covers ${serviceStyles.join(', ')}.`,
);
