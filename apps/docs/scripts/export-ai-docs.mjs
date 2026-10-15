import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentationPage } from './component-metadata.mjs';

export async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? walkFiles(file) : [file];
      }),
    )
  ).flat();
}

export function publicExports(source) {
  return [...source.matchAll(/export\s+(type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g)].flatMap(
    (match) =>
      match[2]
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({
          name: name
            .split(/\s+as\s+/)
            .at(-1)
            .replace(/^type\s+/, ''),
          module: match[3],
          kind: match[1] || name.startsWith('type ') ? 'type' : 'export',
        })),
  );
}

export async function publicApi(repository) {
  const { name } = JSON.parse(
    await readFile(path.join(repository, 'packages/react/package.json'), 'utf8'),
  );
  if (!['@ifhover/leaf-ui', '@sudden3/leaf-ui'].includes(name))
    throw new Error('The snapshot must identify a supported Leaf UI package.');
  const files = ['packages/react/src/index.ts', 'packages/react/src/tabletanstack/index.ts'];
  const entries = [];
  for (const relative of files) {
    const entry = path.join(repository, relative);
    let source;
    try {
      source = await readFile(entry, 'utf8');
    } catch (error) {
      if (relative !== files[0] && error.code === 'ENOENT') continue;
      throw error;
    }
    entries.push(
      ...publicExports(source).map((item) => ({
        ...item,
        entry,
        importPath: relative === files[0] ? name : `${name}/table/tanstack`,
      })),
    );
  }
  return entries;
}

export async function exportAiDocs({ repository, output, base, sourceCommit = null }) {
  const manifest = JSON.parse(
    await readFile(path.join(repository, 'packages/react/package.json'), 'utf8'),
  );
  const version = manifest.version;
  const exports = await publicApi(repository);
  const files = await walkFiles(output);
  const markdownFiles = files.filter((file) => {
    const relative = path.relative(output, file).replaceAll(path.sep, '/');
    return /^(en\/)?(components|guide|api)\/.+\.md$/.test(relative);
  });
  const availablePages = new Set(
    markdownFiles.map((file) =>
      path
        .relative(output, file)
        .replaceAll(path.sep, '/')
        .replace(/^en\//, '')
        .replace(/\.md$/, ''),
    ),
  );
  const pages = [];
  const normalize = (value) => value.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const origin = 'https://ifhover.github.io';
  let exampleSource;
  for (const file of markdownFiles) {
    const relative = path.relative(output, file).replaceAll(path.sep, '/');
    const english = relative.startsWith('en/');
    const id = relative.replace(/^en\//, '').replace(/\.md$/, '');
    let document;
    try {
      document = await readFile(
        path.join(repository, 'apps/docs/docs', relative.replace(/\.md$/, '.mdx')),
        'utf8',
      );
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      try {
        document = await readFile(path.join(repository, 'apps/docs/docs', relative), 'utf8');
      } catch (missing) {
        if (missing.code !== 'ENOENT') throw missing;
      }
    }
    const original = await readFile(file, 'utf8');
    let source = original;
    if (document?.includes('<ComponentExample')) {
      exampleSource ??= await import(
        process.env.LEAF_DOCS_EXAMPLE_SOURCE ??
          new URL('./example-source.mjs', import.meta.url).href
      );
      source = exampleSource.extractExampleMarkdown(original, document);
    }
    const title = source.match(/^#\s+(.+)$/m)?.[1] ?? id;
    const html = relative.replace(/\.md$/, '.html');
    const symbols = exports
      .filter((entry) => {
        const target = documentationPage(entry, availablePages);
        if (target.startsWith('api/')) return target === id;
        if (target === id) return true;
        const module = entry.module.split('/').filter(Boolean).at(-1);
        if (id === 'components/result' && module === 'empty') return true;
        if (id === 'components/textarea' && entry.module.startsWith('./textarea/')) return true;
        if (id === 'components/time-picker' && entry.module === './shared/time') return true;
        if (id === 'guide/theming' && ['theme', 'types'].includes(module)) return true;
        return (
          id.startsWith('components/') && normalize(module) === normalize(id.split('/').at(-1))
        );
      })
      .map(({ name, kind, importPath }) => ({ name, kind, importPath }));
    const header = `> Leaf UI ${version} · Package: ${manifest.name}${sourceCommit ? ` · Source: ${sourceCommit}` : ''}\n> Browser documentation: ${origin}${base}${html}\n\n`;
    await writeFile(file, header + source, 'utf8');
    pages.push({ id, language: english ? 'en' : 'zh', title, markdown: relative, html, symbols });
  }
  for (const file of files.filter((candidate) => path.basename(candidate) === 'llms-full.txt')) {
    const directory = path.dirname(file);
    const fullPages = await walkFiles(directory);
    const chunks = await Promise.all(
      fullPages
        .filter((page) => page.endsWith('.md'))
        .filter(
          (page) =>
            directory !== output || !path.relative(output, page).startsWith(`en${path.sep}`),
        )
        .sort()
        .map((page) => readFile(page, 'utf8')),
    );
    await writeFile(file, chunks.join('\n\n'), 'utf8');
  }
  if (!pages.some((page) => page.id === 'components/button'))
    throw new Error(
      'Rspress did not export component Markdown. Enable llms before exporting APIs.',
    );
  const undocumented = exports.filter(
    (entry) => !pages.some((page) => page.symbols.some((symbol) => symbol.name === entry.name)),
  );
  if (undocumented.length)
    throw new Error(
      `Public exports have no documentation page: ${undocumented.map((entry) => entry.name).join(', ')}`,
    );
  const index = {
    schemaVersion: 1,
    package: manifest.name,
    version,
    sourceCommit,
    exports: exports.map(({ name, kind, importPath }) => ({ name, kind, importPath })),
    pages: pages.sort((a, b) => `${a.id}/${a.language}`.localeCompare(`${b.id}/${b.language}`)),
  };
  await mkdir(path.join(output, 'api'), { recursive: true });
  await writeFile(path.join(output, 'api/index.json'), `${JSON.stringify(index, null, 2)}\n`);
  // Copy only resources from this snapshot. Older releases without JSON stay unchanged.
  for (const name of [
    'en-US.json',
    'zh-CN.json',
    'zh-TW.json',
    'ja-JP.json',
    'ko-KR.json',
    'schema.json',
  ]) {
    let resource;
    try {
      resource = await readFile(path.join(repository, 'packages/react/src/locales', name));
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    await mkdir(path.join(output, 'locales'), { recursive: true });
    await writeFile(path.join(output, 'locales', name), resource);
  }
  const llms = await readFile(path.join(output, 'llms.txt'), 'utf8');
  const text = `# Leaf UI ${version}\n\n> Version-specific documentation for ${manifest.name}@${version}.\n\nRead only the pages required for your task. Match the package name and version installed in the application; do not substitute the latest version.\n\n## API discovery\n\n- [API and exported type index](${origin}${base}api/index.json): Map exact public exports to individual Markdown pages.\n\n${llms.replace(/^# .+\n/, '')}`;
  await writeFile(path.join(output, 'llms.txt'), text, 'utf8');
  await writeFile(path.join(output, 'llm.txt'), text, 'utf8');
  console.log(`AI documentation exported for Leaf UI ${version}: ${pages.length} Markdown pages.`);
  return index;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repository = path.resolve(
    process.argv[2] ?? path.join(fileURLToPath(new URL('../../../', import.meta.url))),
  );
  const output = path.resolve(process.argv[3] ?? path.join(repository, 'apps/docs/doc_build'));
  const base = process.env.LEAF_DOCS_BASE ?? '/';
  await exportAiDocs({
    repository,
    output,
    base,
    sourceCommit: process.env.LEAF_DOCS_SOURCE_COMMIT,
  });
}
