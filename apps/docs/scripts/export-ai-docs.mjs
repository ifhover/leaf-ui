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

export async function exportAiDocs({ repository, output, base, sourceCommit = null }) {
  const manifest = JSON.parse(
    await readFile(path.join(repository, 'packages/react/package.json'), 'utf8'),
  );
  const version = manifest.version;
  const exports = publicExports(
    await readFile(path.join(repository, 'packages/react/src/index.ts'), 'utf8'),
  );
  const files = await walkFiles(output);
  const pages = [];
  const normalize = (value) => value.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const origin = 'https://ifhover.github.io';
  for (const file of files.filter((candidate) => candidate.endsWith('.md'))) {
    const relative = path.relative(output, file).replaceAll(path.sep, '/');
    if (!/^(en\/)?(components|guide)\/.+\.md$/.test(relative)) continue;
    const english = relative.startsWith('en/');
    const id = relative.replace(/^en\//, '').replace(/\.md$/, '');
    const source = await readFile(file, 'utf8');
    const title = source.match(/^#\s+(.+)$/m)?.[1] ?? id;
    const html = relative.replace(/\.md$/, '.html');
    const symbols = exports
      .filter((entry) => {
        if (documentationPage(entry) === id) return true;
        const module = entry.module.split('/').filter(Boolean).at(-1);
        if (id === 'components/result' && module === 'empty') return true;
        if (id === 'components/textarea' && entry.module.startsWith('./textarea/')) return true;
        if (id === 'components/time-picker' && entry.module === './shared/time') return true;
        if (id === 'guide/theming' && ['theme', 'types'].includes(module)) return true;
        return (
          id.startsWith('components/') && normalize(module) === normalize(id.split('/').at(-1))
        );
      })
      .map(({ name, kind }) => ({ name, kind }));
    const header = `> Leaf UI ${version} · Package: @sudden3/leaf-ui${sourceCommit ? ` · Source: ${sourceCommit}` : ''}\n> Browser documentation: ${origin}${base}${html}\n\n`;
    await writeFile(file, header + source, 'utf8');
    pages.push({ id, language: english ? 'en' : 'zh', title, markdown: relative, html, symbols });
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
    package: '@sudden3/leaf-ui',
    version,
    sourceCommit,
    exports: exports.map(({ name, kind }) => ({ name, kind })),
    pages: pages.sort((a, b) => `${a.id}/${a.language}`.localeCompare(`${b.id}/${b.language}`)),
  };
  await mkdir(path.join(output, 'api'), { recursive: true });
  await writeFile(path.join(output, 'api/index.json'), `${JSON.stringify(index, null, 2)}\n`);
  const llms = await readFile(path.join(output, 'llms.txt'), 'utf8');
  const text = `# Leaf UI ${version}\n\n> Version-specific documentation for @sudden3/leaf-ui@${version}.\n\nRead only the pages required for your task. Match the version installed in the application; do not substitute the latest version.\n\n## API discovery\n\n- [API and exported type index](${origin}${base}api/index.json): Map exact public exports to individual Markdown pages.\n\n${llms.replace(/^# .+\n/, '')}`;
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
