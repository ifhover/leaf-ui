#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export const packageName = '@sudden3/leaf-ui';
export const docsSite = 'https://ifhover.github.io/leaf-ui/';

export async function resolveInstallation(project) {
  const directory = path.resolve(project);
  const require = createRequire(pathToFileURL(path.join(directory, '__leaf_ui_resolve__.cjs')));
  let manifestPath;
  try {
    manifestPath = require.resolve(`${packageName}/package.json`);
  } catch {
    throw new Error(
      `Cannot resolve ${packageName} from ${directory}. Use the target application directory and install its intended dependency version first.`,
    );
  }
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (
    manifest.name !== packageName ||
    !/^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)*$/.test(manifest.version)
  )
    throw new Error(`Invalid installed Leaf UI package metadata at ${manifestPath}`);
  const types = manifest.types ?? manifest.exports?.['.']?.import?.types;
  return {
    package: packageName,
    version: manifest.version,
    project: directory,
    packagePath: manifestPath,
    typesPath: typeof types === 'string' ? path.resolve(path.dirname(manifestPath), types) : null,
  };
}

export function versionRoot(site, version) {
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

async function readUrl(url, fetcher) {
  const response = await fetcher(url, { redirect: 'error', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Documentation request returned ${response.status}: ${url}`);
  const text = await response.text();
  if (text.length > 1024 * 1024)
    throw new Error('Documentation response exceeds the single-page limit.');
  return text;
}

export async function queryDocs({
  installation,
  api,
  guide,
  list = false,
  lang = 'en',
  site = docsSite,
  fetcher = fetch,
}) {
  if (api && guide) throw new Error('Query one API or one guide at a time.');
  if (!['en', 'zh'].includes(lang)) throw new Error('Supported languages: en, zh.');
  const root = versionRoot(site, installation.version);
  const index = JSON.parse(await readUrl(new URL('api/index.json', root), fetcher));
  if (
    index.schemaVersion !== 1 ||
    index.package !== packageName ||
    index.version !== installation.version ||
    !Array.isArray(index.pages) ||
    !Array.isArray(index.exports)
  )
    throw new Error(
      `Documentation metadata does not match installed ${packageName}@${installation.version}.`,
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
      `${api} is not exported by ${packageName}@${installation.version}. No newer version will be substituted.`,
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
  const markdown = await readUrl(url, fetcher);
  if (!markdown.startsWith(`> Leaf UI ${installation.version} · Package: ${packageName}`))
    throw new Error('The Markdown page does not identify the installed package version.');
  return { metadata, page: url.href, markdown };
}

export async function main(args = process.argv.slice(2)) {
  const { values } = parseArgs({
    args,
    options: {
      project: { type: 'string', default: process.cwd() },
      api: { type: 'string' },
      guide: { type: 'string' },
      lang: { type: 'string', default: 'en' },
      list: { type: 'boolean', default: false },
      'docs-site': { type: 'string', default: docsSite },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(
      'Usage: node docs.mjs --project <app> [--api <export> | --guide <name> | --list] [--lang en|zh]\nUses the exact installed Leaf UI version. --docs-site supports a self-hosted versioned documentation site.',
    );
    return;
  }
  const installation = await resolveInstallation(values.project);
  console.log(JSON.stringify(installation, null, 2));
  const result = await queryDocs({
    installation,
    api: values.api,
    guide: values.guide,
    list: values.list,
    lang: values.lang,
    site: values['docs-site'],
  });
  if (result.markdown) console.log(`\nSource: ${result.page}\n\n${result.markdown}`);
  else console.log(JSON.stringify(result, null, 2));
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
