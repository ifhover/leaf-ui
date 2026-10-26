import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, openSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { walkFiles } from './export-ai-docs.mjs';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
export const platformFiles = [
  'apps/docs/scripts/build-versioned-site.mjs',
  'apps/docs/scripts/export-ai-docs.mjs',
  'apps/docs/scripts/component-metadata.mjs',
  'apps/docs/scripts/example-source.mjs',
  'apps/docs/scripts/example-source.d.mts',
  'apps/docs/src/components/version-path.ts',
  'apps/docs/src/components/version-switcher.tsx',
  'apps/docs/src/components/version-switcher.scss',
  'apps/docs/docs/guide/ai.md',
  'apps/docs/docs/en/guide/ai.md',
];

const currentPackage = '@ifhover/leaf-ui';
const legacyPackage = '@sudden3/leaf-ui';

function compareVersions(a, b) {
  const left = a.version.split('.').map(Number);
  const right = b.version.split('.').map(Number);
  return right[0] - left[0] || right[1] - left[1] || right[2] - left[2];
}

export function publishedReleases(registry, { allowEmpty = false } = {}) {
  if (![currentPackage, legacyPackage].includes(registry.name))
    throw new Error('Unsupported npm package in documentation release metadata.');
  const versions = Object.entries(registry.versions)
    .filter(([version]) => /^\d+\.\d+\.\d+$/.test(version))
    .map(([version, entry]) => {
      const sourceCommit = entry.gitHead;
      const publishedAt = registry.time[version];
      if (!/^[a-f0-9]{40}$/.test(sourceCommit) || !Number.isFinite(Date.parse(publishedAt)))
        throw new Error(`Published version ${version} has no reproducible source commit or date.`);
      if (entry.name && entry.name !== registry.name)
        throw new Error(`Published version ${version} has mismatched package metadata.`);
      return { package: registry.name, version, sourceCommit, publishedAt };
    })
    .sort(compareVersions);
  if (allowEmpty && versions.length === 0) return null;
  const latest = registry['dist-tags'].latest;
  if (!versions.some((release) => release.version === latest))
    throw new Error('The npm latest tag must refer to a published stable version.');
  return { package: registry.name, latest, versions };
}

export function mergePublishedReleases(current, legacy) {
  const preferred = current ?? legacy;
  if (!preferred) throw new Error('No published stable Leaf UI documentation source.');
  const releases = new Map();
  for (const source of [current, legacy].filter(Boolean)) {
    for (const release of source.versions) {
      if (releases.has(release.version))
        throw new Error(
          `Version ${release.version} exists in both npm packages. Publish the new package with a distinct higher version to preserve /v/${release.version}/.`,
        );
      releases.set(release.version, release);
    }
  }
  if (current && legacy && compareVersions({ version: current.latest }, legacy.versions[0]) >= 0)
    throw new Error(
      `The new npm package's stable latest must be higher than legacy ${legacy.versions[0].version}.`,
    );
  return {
    package: preferred.package,
    latest: preferred.latest,
    versions: [...releases.values()].sort(compareVersions),
  };
}

export async function loadPublishedReleases(fetcher = fetch) {
  const responses = await Promise.all(
    [currentPackage, legacyPackage].map(async (name) => {
      const response = await fetcher(`https://registry.npmjs.org/${name.replace('/', '%2F')}`, {
        signal: AbortSignal.timeout(30000),
      });
      if (name === currentPackage && response.status === 404) return null;
      if (!response.ok) throw new Error(`npm registry returned ${response.status} for ${name}`);
      const registry = await response.json();
      if (registry.name !== name) throw new Error(`npm registry package mismatch for ${name}`);
      return publishedReleases(registry, { allowEmpty: name === currentPackage });
    }),
  );
  return mergePublishedReleases(...responses);
}

async function run(command, args, cwd, log, env = {}) {
  const fd = log ? openSync(log, 'a') : null;
  try {
    await new Promise((resolve, reject) => {
      const windowsPnpm = process.platform === 'win32' && command === 'pnpm';
      const pnpmCommands = {
        'install --frozen-lockfile': 'pnpm install --frozen-lockfile',
        'build:docs': 'pnpm build:docs',
      };
      if (windowsPnpm && !pnpmCommands[args.join(' ')]) throw new Error('Unsupported pnpm command');
      const child = spawn(
        windowsPnpm ? (process.env.ComSpec ?? 'cmd.exe') : command,
        windowsPnpm ? ['/d', '/s', '/c', pnpmCommands[args.join(' ')]] : args,
        {
          cwd,
          env: { ...process.env, ...env },
          stdio: fd === null ? 'inherit' : ['ignore', fd, fd],
          // cmd receives one of the two fixed literals above; no interpolated shell arguments.
          shell: false,
          windowsHide: true,
        },
      );
      child.on('error', reject);
      child.on('exit', (code) =>
        code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)),
      );
    });
  } catch (error) {
    if (log) console.error((await readFile(log, 'utf8')).slice(-12000));
    throw error;
  } finally {
    if (fd !== null) closeSync(fd);
  }
}

async function cleanSnapshots(staging, buildError) {
  try {
    await rm(staging, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch (error) {
    if (buildError) console.error(`Temporary snapshot cleanup failed: ${error.message}`);
    else throw error;
  }
}

async function adaptSnapshotAiGuide(source, target) {
  for (const extension of ['md', 'mdx']) {
    try {
      await readFile(path.join(path.dirname(target), `design-standards.${extension}`));
      return source;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  // Old releases keep their own guides; only unlink the unavailable infrastructure reference.
  return source.replace(/\[([^\]\r\n]+)\]\(\/(?:en\/)?guide\/design-standards\)/g, '$1');
}

export async function installPlatform(snapshot) {
  const docs = path.join(snapshot, 'apps/docs');
  const { name } = JSON.parse(
    await readFile(path.join(snapshot, 'packages/react/package.json'), 'utf8'),
  );
  if (![currentPackage, legacyPackage].includes(name))
    throw new Error('Unsupported Leaf UI snapshot package.');
  for (const file of platformFiles.filter((file) => !file.endsWith('build-versioned-site.mjs'))) {
    // 0.1.0 predates English documentation; do not create an incomplete locale.
    if (file.includes('/docs/en/')) {
      try {
        await readFile(path.join(docs, 'docs/en/index.mdx'));
      } catch {
        continue;
      }
    }
    const target = path.join(snapshot, file);
    await mkdir(path.dirname(target), { recursive: true });
    if (
      file.endsWith('version-switcher.tsx') ||
      file.includes('/docs/guide/') ||
      file.includes('/docs/en/guide/')
    ) {
      // Infrastructure overlays must use the package present in this published snapshot.
      const source = await readFile(path.join(repository, file), 'utf8');
      const localized = source.replaceAll(currentPackage, name);
      await writeFile(
        target,
        file.endsWith('/guide/ai.md') ? await adaptSnapshotAiGuide(localized, target) : localized,
      );
    } else {
      await cp(path.join(repository, file), target);
    }
  }
  await rename(path.join(docs, 'rspress.config.ts'), path.join(docs, 'rspress.release.config.ts'));
  await writeFile(
    path.join(docs, 'rspress.config.ts'),
    `import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import release from './rspress.release.config';
const directory = path.dirname(fileURLToPath(import.meta.url));
const addGuide = (sidebar: any, english: boolean) => {
  if (!sidebar) return;
  for (const [prefix, sections] of Object.entries(sidebar)) {
    if (!prefix.endsWith('/guide/')) continue;
    const items = (sections as any[])[0]?.items;
    if (items && !items.some((item: any) => item.link === '/guide/ai'))
      items.push({ text: english ? 'AI & Skills' : 'AI 与 Skills', link: '/guide/ai' });
  }
};
addGuide(release.themeConfig?.sidebar, false);
for (const locale of release.themeConfig?.locales ?? []) addGuide(locale.sidebar, locale.lang === 'en');
export default {
  ...release,
  base: process.env.LEAF_DOCS_BASE,
  siteOrigin: 'https://ifhover.github.io',
  llms: true,
  plugins: [
    ...(release.plugins ?? []).filter((plugin: any) => plugin.name !== 'leaf-ui-ai-docs'),
    { name: 'leaf-ui-ai-docs', afterBuild(config: any, isProd: boolean) {
      if (isProd) execFileSync(process.execPath, [path.join(directory, 'scripts/export-ai-docs.mjs'),
        path.resolve(directory, '../..'), path.resolve(directory, config.outDir ?? 'doc_build')], { stdio: 'inherit' });
    } },
  ],
  themeConfig: { ...release.themeConfig, llmsUI: { placement: 'outline', viewOptions: ['markdownLink'] } },
  builderConfig: {
    ...release.builderConfig,
    source: { ...release.builderConfig?.source, define: {
      ...release.builderConfig?.source?.define,
      __LEAF_DOCS_SITE_BASE__: JSON.stringify(process.env.LEAF_DOCS_SITE_BASE),
    } },
  },
};
`,
  );
  const themePath = path.join(docs, 'theme/index.tsx');
  const theme = await readFile(themePath, 'utf8');
  if (!theme.includes('VersionSwitcher')) {
    await rename(themePath, path.join(docs, 'theme/release-theme.tsx'));
    await writeFile(
      themePath,
      `import { type LayoutProps } from '@rspress/core/theme-original';
import { Layout as ReleaseLayout } from './release-theme';
import { VersionSwitcher } from '../src/components/version-switcher';
export * from './release-theme';
export function Layout(props: LayoutProps) {
  return <ReleaseLayout {...props} afterNavTitle={<><VersionSwitcher />{props.afterNavTitle}</>} />;
}
`,
    );
  }
}

export function redirectPage(target) {
  const safeTarget = JSON.stringify(target).replaceAll('<', '\\u003c');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Leaf UI</title><link rel="canonical" href="https://ifhover.github.io${target}"><script>location.replace(${safeTarget}+location.search+location.hash)</script></head><body><a href="${target}">Open Leaf UI documentation</a></body></html>\n`;
}

export async function buildVersionedSite() {
  const base = `${(process.env.LEAF_DOCS_BASE || '/leaf-ui/').replace(/\/$/, '')}/`;
  if (!/^\/(?:[\w-]+\/)*$/.test(base))
    throw new Error('LEAF_DOCS_BASE must be an absolute site path.');
  const manifest = await loadPublishedReleases();
  const hash = createHash('sha256').update(base);
  for (const file of platformFiles) hash.update(await readFile(path.join(repository, file)));
  const platformHash = hash.digest('hex').slice(0, 16);
  const cache = path.join(repository, 'apps/docs/.version-cache');
  const output = path.join(repository, 'apps/docs/site_build');
  const staging = await mkdtemp(path.join(tmpdir(), 'leaf-ui-docs-'));
  let buildError;
  try {
    const buildSnapshot = async (release, docsBase, variant) => {
      const cached = path.join(
        cache,
        `${variant}-${release.package.slice(1).replace('/', '-')}-${release.version}-${release.sourceCommit}-${platformHash}`,
      );
      let validCache = false;
      try {
        const index = JSON.parse(await readFile(path.join(cached, 'api/index.json'), 'utf8'));
        validCache =
          index.package === release.package &&
          index.version === release.version &&
          index.sourceCommit === release.sourceCommit;
      } catch {
        // A cache miss builds the exact published commit below.
      }
      if (!validCache) {
        console.log(
          `Building Leaf UI ${release.version} at ${docsBase} from npm gitHead ${release.sourceCommit}`,
        );
        await run('git', ['cat-file', '-e', `${release.sourceCommit}^{commit}`], repository);
        const archive = path.join(staging, `${variant}-${release.version}.tar`);
        const snapshot = path.join(staging, `${variant}-${release.version}`);
        await mkdir(snapshot);
        await run(
          'git',
          ['archive', '--format=tar', `--output=${archive}`, release.sourceCommit],
          repository,
        );
        await run('tar', ['-xf', archive, '-C', snapshot], repository);
        const info = JSON.parse(
          await readFile(path.join(snapshot, 'packages/react/package.json'), 'utf8'),
        );
        if (info.name !== release.package || info.version !== release.version)
          throw new Error(
            `Source package or version mismatch for ${release.package}@${release.version}`,
          );
        await installPlatform(snapshot);
        const log = path.join(staging, `${variant}-${release.version}.log`);
        await run('pnpm', ['install', '--frozen-lockfile'], snapshot, log);
        await run('pnpm', ['build:docs'], snapshot, log, {
          LEAF_DOCS_BASE: docsBase,
          LEAF_DOCS_SITE_BASE: base,
          LEAF_DOCS_SOURCE_COMMIT: release.sourceCommit,
          LEAF_DOCS_EXAMPLE_SOURCE: pathToFileURL(
            path.join(repository, 'apps/docs/scripts/example-source.mjs'),
          ).href,
        });
        // cached is always inside the fixed, generated cache directory.
        await rm(cached, { recursive: true, force: true });
        await cp(path.join(snapshot, 'apps/docs/doc_build'), cached, { recursive: true });
      } else {
        console.log(`Using cached documentation for Leaf UI ${release.version} at ${docsBase}`);
      }
      return cached;
    };
    for (const release of manifest.versions) {
      const cached = await buildSnapshot(release, `${base}v/${release.version}/`, 'version');
      const destination = path.join(staging, 'site/v', release.version);
      await cp(cached, destination, { recursive: true });
      release.pages = (await walkFiles(destination))
        .filter((file) => file.endsWith('.html'))
        .map((file) => path.relative(destination, file).replaceAll(path.sep, '/'))
        .sort();
    }
    const site = path.join(staging, 'site');
    const latest = manifest.versions.find((release) => release.version === manifest.latest);
    // Build the same published source with the root base so routes, assets and search
    // use the default URL directly. Fixed /v/X.Y.Z/ copies remain available to skills.
    const latestRoot = await buildSnapshot(latest, base, 'latest');
    await cp(latestRoot, site, { recursive: true });
    await writeFile(
      path.join(site, 'versions.json'),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          ...manifest,
        },
        null,
        2,
      )}\n`,
    );
    const entryPages = new Set(manifest.versions.flatMap((release) => release.pages));
    for (const page of entryPages) {
      if (latest.pages.includes(page)) continue;
      const target = `${page.startsWith('en/') ? 'en/' : ''}components/index.html`;
      const destination = path.join(site, page);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, redirectPage(`${base}${target}`));
    }
    await writeFile(path.join(site, '.nojekyll'), '');
    // The only replaced output is this repository's fixed generated site directory.
    await rm(output, { recursive: true, force: true });
    await cp(site, output, { recursive: true });
    console.log(`Versioned site ready: ${output} (latest ${manifest.latest})`);
    return manifest;
  } catch (error) {
    buildError = error;
    throw error;
  } finally {
    // staging is created by mkdtemp above; it never refers to a user checkout.
    await cleanSnapshots(staging, buildError);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await buildVersionedSite();
