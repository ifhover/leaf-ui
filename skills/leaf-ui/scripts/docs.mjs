#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export const packageName = '@ifhover/leaf-ui';
export const supportedPackages = [packageName, '@sudden3/leaf-ui'];
export const docsSite = 'https://ifhover.github.io/leaf-ui/';
const versionPattern = /^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)*$/;

export async function resolveInstallation(project, requestedPackage) {
  if (requestedPackage && !supportedPackages.includes(requestedPackage))
    throw new Error(`Unsupported Leaf UI package: ${requestedPackage}`);
  const directory = path.resolve(project);
  const require = createRequire(pathToFileURL(path.join(directory, '__leaf_ui_resolve__.cjs')));
  const installations = [];
  for (const name of requestedPackage ? [requestedPackage] : supportedPackages) {
    let manifestPath;
    try {
      manifestPath = require.resolve(`${name}/package.json`);
    } catch (error) {
      if (!['MODULE_NOT_FOUND', 'ERR_PACKAGE_PATH_NOT_EXPORTED'].includes(error.code)) throw error;
      continue;
    }
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    if (manifest.name !== name || !versionPattern.test(manifest.version))
      throw new Error(`Invalid installed Leaf UI package metadata at ${manifestPath}`);
    const types = manifest.types ?? manifest.exports?.['.']?.import?.types;
    installations.push({
      package: name,
      version: manifest.version,
      project: directory,
      packagePath: manifestPath,
      typesPath: typeof types === 'string' ? path.resolve(path.dirname(manifestPath), types) : null,
    });
  }
  if (installations.length === 0)
    throw new Error(
      `Cannot resolve ${requestedPackage ?? supportedPackages.join(' or ')} from ${directory}. Use the target application directory and install its intended dependency version first.`,
    );
  if (installations.length > 1)
    throw new Error(
      'Both Leaf UI packages resolve from this application. Specify --package @ifhover/leaf-ui or --package @sudden3/leaf-ui to match its imports.',
    );
  return installations[0];
}

export function versionRoot(site, version) {
  if (typeof version !== 'string' || !versionPattern.test(version))
    throw new Error('Documentation requires an exact installed package version.');
  const base = new URL(site.endsWith('/') ? site : `${site}/`);
  if (
    base.protocol !== 'https:' &&
    !(base.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname))
  )
    throw new Error('Documentation must use HTTPS (HTTP is allowed for localhost testing).');
  if (base.username || base.password || base.search || base.hash)
    throw new Error('Documentation base cannot contain credentials, a query or a fragment.');
  return new URL(`v/${version}/`, base);
}

export function pageUrl(root, markdown) {
  if (typeof markdown !== 'string' || !/^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.md$/.test(markdown))
    throw new Error('The API index contains an invalid Markdown path.');
  const url = new URL(markdown, root);
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname))
    throw new Error('Documentation cannot leave the installed version directory.');
  return url;
}

async function readUrl(url, fetcher, { allowMissing = false } = {}) {
  const response = await fetcher(url, { redirect: 'error', signal: AbortSignal.timeout(15000) });
  if (allowMissing && response.status === 404) {
    await response.body?.cancel();
    return null;
  }
  if (!response.ok) throw new Error(`Documentation request returned ${response.status}: ${url}`);
  const limit = 1024 * 1024;
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new Error('Documentation response exceeds the single-page limit (1 MiB).');
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

function structured(condition, message) {
  if (!condition) throw new Error(`Invalid structured documentation: ${message}.`);
}

function text(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateIdentity(value, installation, commit) {
  structured(
    value?.schemaVersion === 1 &&
      value.package === installation.package &&
      value.version === installation.version,
    'metadata does not match the installed package/version or supported schema',
  );
  structured(
    value.sourceKind === 'release' && /^[a-f0-9]{40}$/i.test(value.sourceCommit ?? ''),
    'expected a release snapshot, not workspace documentation',
  );
  if (commit)
    structured(value.sourceCommit === commit, 'source commits do not match across responses');
}

export function structuredUrl(root, document) {
  if (
    typeof document !== 'string' ||
    !/^(?:index\.json|(?:en|zh)\/[a-z][a-z0-9-]*\/(?:detail\.json|examples\/[a-z][a-z0-9-]*\.json))$/.test(
      document,
    )
  )
    throw new Error('The structured index contains an invalid document path.');
  return new URL(`ai/v1/${document}`, root);
}

function validateSource(value, page, root, version) {
  const document = page.markdown.replace(/\.md$/, '.mdx');
  const html = page.markdown.replace(/\.md$/, '.html');
  // Mirrors may serve the original release JSON without changing its canonical source URL.
  const urls = [new URL(html, root).href, new URL(html, versionRoot(docsSite, version)).href];
  structured(
    value?.document === document && urls.includes(value.url),
    'source does not identify the selected versioned page',
  );
}

function selectExamples(examples, selectors) {
  const selected = [];
  for (const selector of selectors) {
    const matches = examples.filter((example) =>
      /^\d+$/.test(selector)
        ? example.index === Number(selector)
        : example.id === selector || example.title.toLowerCase() === selector.toLowerCase(),
    );
    if (matches.length !== 1)
      throw new Error(
        `Example ${JSON.stringify(selector)} ${matches.length ? 'is ambiguous' : 'was not found'}. Available: ${examples.map(({ index, id, title }) => `${index}:${id} (${title})`).join('; ') || '(none)'}`,
      );
    if (!selected.includes(matches[0])) selected.push(matches[0]);
  }
  return selected;
}

async function queryComponent({ installation, page, root, index, examples, fetcher }) {
  const source = await readUrl(structuredUrl(root, 'index.json'), fetcher, {
    allowMissing: true,
  });
  if (source === null) return null;
  const catalog = JSON.parse(source);
  structured(
    /^[a-f0-9]{40}$/i.test(index.sourceCommit ?? ''),
    'the API index must identify its release commit for structured queries',
  );
  validateIdentity(catalog, installation, index.sourceCommit);
  structured(Array.isArray(catalog.components), 'missing component catalog');
  const slug = page.id.slice('components/'.length);
  const relative = `${page.language}/${slug}/detail.json`;
  const matches = catalog.components.filter((item) => item?.document === relative);
  structured(matches.length === 1, 'missing or duplicate selected component catalog entry');
  const entry = matches[0];
  structured(
    entry.language === page.language &&
      [entry.component, entry.title, entry.description, entry.primaryApi].every(text) &&
      Number.isSafeInteger(entry.exampleCount) &&
      entry.exampleCount >= 0,
    'invalid component catalog entry',
  );
  const detail = JSON.parse(await readUrl(structuredUrl(root, entry.document), fetcher));
  validateIdentity(detail, installation, catalog.sourceCommit);
  validateSource(detail.source, page, root, installation.version);
  structured(
    detail.component === entry.component &&
      detail.language === entry.language &&
      detail.title === entry.title &&
      detail.description === entry.description &&
      detail.primaryApi === entry.primaryApi &&
      Array.isArray(detail.apiNames) &&
      detail.apiNames[0] === detail.primaryApi &&
      detail.apiNames.every(text) &&
      new Set(detail.apiNames).size === detail.apiNames.length &&
      [detail.description, detail.introduction, detail.basic, detail.api].every(text),
    'component details do not match the catalog',
  );
  structured(
    Array.isArray(detail.examples) && detail.examples.length === entry.exampleCount,
    'example list does not match the catalog',
  );
  const ids = new Set();
  for (const [offset, example] of detail.examples.entries()) {
    structured(
      example &&
        /^[a-z][a-z0-9-]*$/.test(example.id) &&
        example.id !== 'basic' &&
        !ids.has(example.id) &&
        example.index === offset + 1 &&
        text(example.title) &&
        !('markdown' in example) &&
        example.document === `${page.language}/${slug}/examples/${example.id}.json`,
      'invalid example identity, order or document path',
    );
    ids.add(example.id);
  }
  if (!examples.length) return { mode: 'component', page: detail.source.url, detail };
  const selected = selectExamples(detail.examples, examples);
  const documents = [];
  for (const example of selected) {
    const full = JSON.parse(await readUrl(structuredUrl(root, example.document), fetcher));
    validateIdentity(full, installation, catalog.sourceCommit);
    validateSource(full.source, page, root, installation.version);
    structured(
      full.component === detail.component &&
        full.language === detail.language &&
        full.id === example.id &&
        full.index === example.index &&
        full.title === example.title &&
        full.source.url === detail.source.url &&
        text(full.markdown),
      'example response does not match its requested identity',
    );
    documents.push(full);
  }
  return {
    mode: 'examples',
    page: detail.source.url,
    component: detail.component,
    language: detail.language,
    examples: documents,
  };
}

export async function queryDocs({
  installation,
  api,
  guide,
  list = false,
  lang = 'en',
  examples = [],
  site = docsSite,
  fetcher = fetch,
}) {
  if ([Boolean(api), Boolean(guide), Boolean(list)].filter(Boolean).length > 1)
    throw new Error('Query one API, one guide or the export list at a time.');
  if (
    !Array.isArray(examples) ||
    examples.some((value) =>
      typeof value === 'number'
        ? !Number.isSafeInteger(value) || value < 1
        : typeof value !== 'string' || !text(value),
    )
  )
    throw new Error('Example selectors must be a non-empty index, ID or exact title.');
  if (examples.length && !api) throw new Error('--examples requires --api.');
  examples = examples.map((value) => String(value).trim());
  if (!['en', 'zh'].includes(lang)) throw new Error('Supported languages: en, zh.');
  if (!supportedPackages.includes(installation.package))
    throw new Error(`Unsupported installed Leaf UI package: ${installation.package}`);
  const installedPackage = installation.package;
  const root = versionRoot(site, installation.version);
  const index = JSON.parse(await readUrl(new URL('api/index.json', root), fetcher));
  if (
    index.schemaVersion !== 1 ||
    index.package !== installedPackage ||
    index.version !== installation.version ||
    !Array.isArray(index.pages) ||
    !Array.isArray(index.exports)
  )
    throw new Error(
      `Documentation metadata does not match installed ${installedPackage}@${installation.version}.`,
    );
  const metadata = { ...installation, documentation: root.href };
  if (list)
    return {
      metadata,
      exports: index.exports,
      guides: [
        ...new Set(
          index.pages
            .filter((page) => page.id?.startsWith('guide/'))
            .map((page) => page.id.slice(6)),
        ),
      ],
    };
  if (!api && !guide) return { metadata };
  if (api && !index.exports.some((entry) => entry.name === api))
    throw new Error(
      `${api} is not exported by ${installedPackage}@${installation.version}. No newer version will be substituted.`,
    );
  const matches = index.pages.filter((page) =>
    api ? page.symbols?.some((entry) => entry.name === api) : page.id === `guide/${guide}`,
  );
  const page =
    matches.find((candidate) => candidate.language === lang) ??
    matches.find((candidate) => ['en', 'zh'].includes(candidate.language));
  if (!page)
    throw new Error(
      `No documentation for ${api ?? guide} in Leaf UI ${installation.version}. Inspect the installed declarations if needed.`,
    );
  const url = pageUrl(root, page.markdown);
  if (api && /^components\/[a-z][a-z0-9-]*$/.test(page.id)) {
    const component = await queryComponent({
      installation,
      page,
      root,
      index,
      examples,
      fetcher,
    });
    if (component) return { metadata, ...component };
  }
  if (examples.length)
    throw new Error(
      'Structured examples are unavailable for this version/page. Query --api without --examples to read its complete original Markdown; no newer version will be substituted.',
    );
  const markdown = await readUrl(url, fetcher);
  const identity = markdown.split('\n', 1)[0].trimEnd().split(' · ');
  if (
    identity[0] !== `> Leaf UI ${installation.version}` ||
    identity[1] !== `Package: ${installedPackage}`
  )
    throw new Error('The Markdown page does not identify the installed package version.');
  return {
    metadata,
    mode: api ? 'legacy-page' : 'page',
    page: url.href,
    ...(api
      ? {
          notice:
            'Structured component details are unavailable for this version/page; returning its complete original Markdown, including all examples.',
        }
      : {}),
    markdown,
  };
}

export function formatDocs(result) {
  if (result.mode === 'component') {
    const { introduction, basic, api, language, examples } = result.detail;
    return [
      introduction,
      basic,
      api,
      `## ${language === 'zh' ? '示例索引' : 'Example index'}`,
      examples.length
        ? examples.map(({ index, id, title }) => `${index}. ${title} (ID: \`${id}\`)`).join('\n')
        : language === 'zh'
          ? '无其他示例。'
          : 'No additional examples.',
    ].join('\n\n');
  }
  if (result.mode === 'examples')
    return result.examples.map(({ markdown }) => markdown).join('\n\n');
  return result.markdown ?? null;
}

export async function main(args = process.argv.slice(2)) {
  const { values } = parseArgs({
    args,
    options: {
      project: { type: 'string', default: process.cwd() },
      package: { type: 'string' },
      api: { type: 'string' },
      guide: { type: 'string' },
      lang: { type: 'string', default: 'en' },
      examples: { type: 'string', multiple: true },
      json: { type: 'boolean', default: false },
      list: { type: 'boolean', default: false },
      'docs-site': { type: 'string', default: docsSite },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(
      'Usage: node docs.mjs --project <app> [--api <export> | --guide <name> | --list] [--lang en|zh] [--examples <index|id|title>] [--json] [--package @ifhover/leaf-ui|@sudden3/leaf-ui]\nRepeat --examples to select multiple complete blocks (one selector per flag). Requires --api. Default: complete basic usage + API + example index. Old versions return a labeled full Markdown page; example selection never falls back to another version. --json emits one JSON value. --docs-site supports a self-hosted versioned documentation site.',
    );
    return;
  }
  const installation = await resolveInstallation(values.project, values.package);
  let result;
  try {
    result = await queryDocs({
      installation,
      api: values.api,
      guide: values.guide,
      list: values.list,
      lang: values.lang,
      examples: values.examples,
      site: values['docs-site'],
    });
  } catch (error) {
    throw new Error(
      `${error.message}\nInstalled: ${installation.package}@${installation.version}\nDeclarations: ${installation.typesPath ?? '(not declared by the package)'}`,
      { cause: error },
    );
  }
  const markdown = formatDocs(result);
  if (values.json || !markdown) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(JSON.stringify(result.metadata, null, 2));
    if (result.notice) console.log(`\nNotice: ${result.notice}`);
    console.log(`\nSource: ${result.page}\n\n${markdown}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(
      `Leaf UI documentation: ${error.message}\nNo fallback to latest was performed. Check the installed declarations or report the missing version documentation.`,
    );
    process.exitCode = 1;
  }
}
