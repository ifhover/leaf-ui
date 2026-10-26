import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { componentDetail, readComponentDocument } from './component-document.mjs';

const markdown = unified().use(remarkParse).use(remarkGfm);

export const componentPageExceptions = new Map([
  ['index.mdx', 'Component catalog, not a component reference.'],
  ['icons.mdx', 'Cross-component icon integration guide.'],
  ['empty.mdx', 'Compatibility migration page; the canonical Empty API belongs to Result.'],
]);

function validateBase(base) {
  if (!/^\/(?:[\w.-]+\/)*$/.test(base))
    throw new Error('Expected an absolute documentation base ending in /.');
}

function linkDestination(source, node) {
  const start = node.position.start.offset;
  const end = node.position.end.offset;
  let cursor = start + (node.type === 'image' ? 2 : 1);
  if (
    node.type !== 'definition' &&
    !source.slice(start).startsWith(node.type === 'image' ? '![' : '[')
  )
    return null;
  // Parsed link children already account for nested brackets and code spans.
  if (node.children?.length) cursor = node.children.at(-1).position.end.offset;
  let depth = 1;
  while (cursor < end) {
    const character = source[cursor++];
    if (character === '\\') cursor++;
    else if (character === '`' && node.type !== 'definition') {
      const run = /^`+/.exec(source.slice(cursor - 1))[0];
      cursor += run.length - 1;
      let closing = source.indexOf(run, cursor);
      while (closing >= 0 && closing < end) {
        if (source[closing - 1] !== '`' && source[closing + run.length] !== '`') {
          cursor = closing + run.length;
          break;
        }
        closing = source.indexOf(run, closing + run.length);
      }
    } else if (character === '[') depth++;
    else if (character === ']' && --depth === 0) break;
  }
  if (source[cursor] !== (node.type === 'definition' ? ':' : '(')) return null;
  cursor++;
  while (cursor < end && /\s/.test(source[cursor])) cursor++;
  const angled = source[cursor] === '<';
  const destinationStart = angled ? ++cursor : cursor;
  depth = 0;
  while (cursor < end) {
    const character = source[cursor];
    if (character === '\\') cursor += 2;
    else if (angled ? character === '>' : /\s/.test(character) || (character === ')' && !depth))
      break;
    else {
      if (!angled && character === '(') depth++;
      if (!angled && character === ')') depth--;
      cursor++;
    }
  }
  return { start: destinationStart, end: cursor, angled };
}

function resolveMarkdownLinks(source, { base, sourceUrl }) {
  const tree = markdown.parse(source);
  const pageUrl = new URL(sourceUrl);
  const edits = [];
  const visit = (node) => {
    if (['link', 'image', 'definition'].includes(node.type)) {
      const href = node.url;
      if (!/^(?:[a-z][\w+.-]*:|\/\/)/i.test(href)) {
        const relative =
          href.startsWith('/') && !href.startsWith(base) ? `${base}${href.slice(1)}` : href;
        const target = new URL(relative, pageUrl);
        const route = target.pathname.startsWith(base) ? target.pathname.slice(base.length) : '';
        if (
          target.origin === pageUrl.origin &&
          /^(?:en\/)?(?:api|components|guide)\/.+/.test(route) &&
          !target.pathname.endsWith('/')
        ) {
          if (/\.mdx?$/i.test(target.pathname))
            target.pathname = target.pathname.replace(/\.mdx?$/i, '.html');
          else if (!path.posix.extname(target.pathname)) target.pathname += '.html';
        }
        const destination = linkDestination(source, node);
        if (!destination) throw new Error(`Cannot locate the Markdown destination for ${href}.`);
        edits.push({
          ...destination,
          value: destination.angled ? target.href : target.href.replace(/[\\()]/g, '\\$&'),
        });
      }
    }
    for (const child of node.children ?? []) visit(child);
  };
  visit(tree);
  for (const edit of edits.sort((left, right) => right.start - left.start))
    source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
  return source;
}

/** Resolve only Markdown destinations; authored prose and code remain unchanged. */
export function resolveComponentDocumentLinks(document, { base = '/', sourceUrl }) {
  validateBase(base);
  const url = new URL(sourceUrl);
  if (!url.pathname.startsWith(base))
    throw new Error('The component source URL must be inside the documentation base.');
  const resolve = (source) => resolveMarkdownLinks(source, { base, sourceUrl: url });
  return {
    ...document,
    description: resolve(document.description),
    introduction: resolve(document.introduction),
    basic: resolve(document.basic),
    api: resolve(document.api),
    examples: document.examples.map((example) => ({
      ...example,
      markdown: resolve(example.markdown),
    })),
  };
}

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? files(file) : file;
      }),
    )
  ).flat();
}

export async function collectComponentDocuments(repository) {
  const docs = path.join(repository, 'apps/docs/docs');
  const documents = [];
  for (const prefix of ['', 'en/']) {
    for (const file of (await files(path.join(docs, prefix, 'components'))).sort()) {
      if (!file.endsWith('.mdx')) continue;
      const relative = path.relative(path.join(docs, prefix, 'components'), file);
      if (componentPageExceptions.has(relative)) continue;
      const document = await readComponentDocument(file);
      if (!document)
        throw new Error(`${file}: component references require static leafDoc metadata.`);
      const language = prefix ? 'en' : 'zh';
      const slug = relative.replace(/\.mdx$/, '').replaceAll(path.sep, '/');
      if (!/^[a-z][a-z0-9-]*$/.test(slug))
        throw new Error(`${file}: component references require a unique top-level slug.`);
      documents.push({
        document,
        language,
        slug,
        file: path.relative(docs, file).replaceAll(path.sep, '/'),
      });
    }
  }
  if (!documents.length) throw new Error('No structured component references were found.');
  for (const component of new Set(documents.map(({ document }) => document.component))) {
    const pair = documents.filter(({ document }) => document.component === component);
    if (pair.length !== 2 || new Set(pair.map(({ language }) => language)).size !== 2)
      throw new Error(
        `${component}: structured documents require one Chinese and one English page.`,
      );
    const structure = ({ document }) =>
      JSON.stringify({
        primaryApi: document.primaryApi,
        apiNames: document.apiNames,
        examples: document.examples.map(({ id }) => id),
      });
    if (structure(pair[0]) !== structure(pair[1]))
      throw new Error(`${component}: bilingual API and example identities/order must match.`);
    if (pair[0].slug !== pair[1].slug)
      throw new Error(`${component}: bilingual component slugs must match.`);
  }
  return documents;
}

export async function exportComponentDocs({ repository, output, base = '/', sourceCommit = null }) {
  validateBase(base);
  const manifest = JSON.parse(
    await readFile(path.join(repository, 'packages/react/package.json'), 'utf8'),
  );
  const documents = await collectComponentDocuments(repository);
  const identity = {
    schemaVersion: 1,
    package: manifest.name,
    version: manifest.version,
    sourceCommit,
    sourceKind: sourceCommit ? 'release' : 'workspace',
  };
  const index = { ...identity, components: [] };
  const write = async (relative, value) => {
    const file = path.join(output, 'ai/v1', relative);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
  };
  for (const { document: original, language, slug, file } of documents) {
    const source = {
      document: file,
      url: `https://ifhover.github.io${base}${file.replace(/\.mdx$/, '.html')}`,
    };
    const document = resolveComponentDocumentLinks(original, { base, sourceUrl: source.url });
    const examples = document.examples.map(({ markdown: _markdown, ...example }) => ({
      ...example,
      document: `${language}/${slug}/examples/${example.id}.json`,
    }));
    const relative = `${language}/${slug}/detail.json`;
    await write(relative, {
      ...identity,
      language,
      source,
      ...componentDetail(document),
      examples,
    });
    for (const example of document.examples)
      await write(`${language}/${slug}/examples/${example.id}.json`, {
        ...identity,
        language,
        source,
        component: document.component,
        ...example,
      });
    index.components.push({
      component: document.component,
      language,
      title: document.title,
      description: document.description,
      primaryApi: document.primaryApi,
      document: relative,
      exampleCount: examples.length,
    });
  }
  await write('index.json', index);
  return index;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { output: { type: 'string' } } });
  const repository = fileURLToPath(new URL('../../../', import.meta.url));
  const index = await exportComponentDocs({
    repository,
    output: path.resolve(values.output ?? path.join(repository, 'apps/docs/doc_build')),
    base: process.env.LEAF_DOCS_BASE ?? '/',
    sourceCommit: process.env.LEAF_DOCS_SOURCE_COMMIT ?? null,
  });
  console.log(
    `Structured component documents: ${index.components.length} pages, ${index.components.reduce((count, component) => count + component.exampleCount, 0)} examples (${index.sourceKind}).`,
  );
}
