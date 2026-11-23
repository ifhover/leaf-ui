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
// Private visual controls still own styles even when their folder no longer has
// a public package entry (for example the table frame used by DataTable).
for (const directory of await readdir(source, { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const name = directory.name;
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
    if (file === path.join(esm, 'shared/clear-button.js')) styles.add('shared-clear');
    if (file === path.join(esm, 'shared/selection-content.js')) styles.add('shared-selection');
    if (file === path.join(esm, 'shared/date-input.js')) styles.add('datepicker');
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

const resolveSourceFile = async (relative) => {
  const clean = relative.replace(/^\/+/u, '');
  if (!clean || clean.startsWith('..')) return null;
  const normalized = clean.replace(/\.scss$/u, '');
  const directory = path.posix.dirname(normalized);
  const base = path.posix.basename(normalized);
  const prefix = directory === '.' ? '' : `${directory}/`;
  const candidates = [
    `${prefix}_${base}.scss`,
    `${normalized}.scss`,
    `${normalized}/_index.scss`,
    `${normalized}/index.scss`,
  ];
  for (const candidate of candidates) {
    try {
      if ((await stat(path.join(source, candidate))).isFile()) return candidate;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return null;
};

// 自动浏览器入口已顺着 JS 模块依赖引入被依赖组件的 CSS，编译单组件切片时跳过重复的兄弟组件 @use，避免 @layer leaf-ui 阻断产物去重
const compileComponentCss = async (owner, entry) => {
  const entryFile = `${entry}.scss`;
  const contents = await readFile(path.join(source, entryFile), 'utf8');
  return compileStringAsync(contents, {
    ...sassOptions,
    url: new URL(`leaf-src:///${entryFile}`),
    importers: [
      {
        async canonicalize(url, context) {
          if (url.startsWith('leaf-empty:')) return new URL(url);
          const baseDir =
            context.containingUrl?.protocol === 'leaf-src:'
              ? path.posix.dirname(context.containingUrl.pathname.slice(1))
              : '';
          const candidate = url.startsWith('leaf-src:') ? new URL(url).pathname.slice(1) : url;
          const relativeCandidate =
            baseDir && !url.startsWith('/') && !url.includes(':')
              ? path.posix.normalize(path.posix.join(baseDir, url))
              : null;
          const resolved =
            (relativeCandidate && !relativeCandidate.startsWith('..')
              ? await resolveSourceFile(relativeCandidate)
              : null) ?? (await resolveSourceFile(candidate));
          if (!resolved) return null;
          const segments = resolved.replace(/\.scss$/u, '').split('/');
          if (resolved === 'shared/_clear.scss' && owner !== 'shared-clear') {
            return new URL('leaf-empty:///clear');
          }
          if (resolved === 'shared/_selection.scss' && owner !== 'shared-selection') {
            return new URL('leaf-src:///shared/_selection-mixins.scss');
          }
          if (
            segments.length === 2 &&
            segments[0] === segments[1] &&
            segments[0] !== owner &&
            styled.has(segments[0])
          ) {
            return new URL(`leaf-empty:///${segments[0]}`);
          }
          return new URL(`leaf-src:///${resolved}`);
        },
        async load(url) {
          if (url.protocol === 'leaf-empty:') return { contents: '', syntax: 'scss' };
          if (url.protocol === 'leaf-src:') {
            return {
              contents: await readFile(path.join(source, url.pathname.slice(1)), 'utf8'),
              syntax: 'scss',
            };
          }
          return null;
        },
      },
      ...sassOptions.importers,
    ],
  });
};

const componentCss = new Map();
const sharedCssEntries = new Map([
  ['shared-calendar', 'shared/calendar'],
  ['shared-clear', 'shared/_clear'],
  ['shared-selection', 'shared/_selection'],
]);
for (const name of [...styled, ...sharedCssEntries.keys()]) {
  const module = sharedCssEntries.get(name) ?? `${name}/${name}`;
  componentCss.set(name, (await compileComponentCss(name, module)).css);
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
    let owner =
      relative === `shared/calendar.${extension}`
        ? 'shared-calendar'
        : relative === `shared/clear-button.${extension}`
          ? 'shared-clear'
          : relative === `shared/selection-content.${extension}`
            ? 'shared-selection'
            : relative === `shared/date-input.${extension}`
              ? 'datepicker'
              : null;
    // The always-mounted image scope must not preload its lazy renderer's stylesheet.
    const stylelessScope = relative === `image/provider.${extension}`;
    if (styled.has(folder) && !relative.endsWith(`/index.${extension}`) && !stylelessScope) {
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
    const statements = css.map((file) => {
      const relativeCss = path.relative(path.dirname(destination), file).replaceAll(path.sep, '/');
      return format === 'esm' ? `import '${relativeCss}';` : `require('${relativeCss}');`;
    });
    const insertedLines = [];
    let outputCode = original;
    if (statements.length) {
      const prefixLine = prefix.split('\n').length - 1;
      const codeLines = original.split('\n');
      let componentLine = prefixLine;
      if (format === 'esm') {
        for (let index = prefixLine; index < codeLines.length; index++) {
          const line = codeLines[index];
          if (/^\s*import\b/.test(line)) {
            componentLine = index + 1;
            continue;
          }
          if (/^\s*(?:\/\/.*)?$/.test(line)) continue;
          break;
        }
      } else {
        let seenRequire = false;
        for (let index = prefixLine; index < codeLines.length; index++) {
          const line = codeLines[index];
          if (/^(?:const|var)\s+\S+\s*=\s*(?:\/\*[\s\S]*?\*\/\s*)?require\(/.test(line)) {
            seenRequire = true;
            componentLine = index + 1;
            continue;
          }
          if (seenRequire) break;
        }
      }
      const [foundationStatement, componentStatement] = statements;
      // 子依赖组件 CSS 需先于当前组件 CSS 生效，保持与源码 @use 一致的层叠顺序
      codeLines.splice(componentLine, 0, componentStatement);
      codeLines.splice(prefixLine, 0, foundationStatement);
      insertedLines.push(componentLine, prefixLine);
      outputCode = codeLines.join('\n');
    }
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, outputCode);
    try {
      const map = JSON.parse(await readFile(`${originalFile}.map`, 'utf8'));
      map.sources = map.sources.map((entry) =>
        /^[a-z][\w+.-]*:/i.test(entry)
          ? entry
          : path
              .relative(path.dirname(destination), path.resolve(path.dirname(originalFile), entry))
              .replaceAll(path.sep, '/'),
      );
      if (insertedLines.length) {
        const mappingLines = map.mappings.split(';');
        for (const lineIndex of insertedLines) mappingLines.splice(lineIndex, 0, '');
        map.mappings = mappingLines.join(';');
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
