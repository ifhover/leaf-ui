import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, openSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkFiles } from './export-ai-docs.mjs';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const platformFiles = [
  'apps/docs/scripts/build-versioned-site.mjs',
  'apps/docs/scripts/export-ai-docs.mjs',
  'apps/docs/src/components/version-path.ts',
  'apps/docs/src/components/version-switcher.tsx',
  'apps/docs/src/components/version-switcher.scss',
  'apps/docs/docs/guide/ai.md',
  'apps/docs/docs/en/guide/ai.md',
];

export function publishedReleases(registry) {
  const versions = Object.entries(registry.versions)
    .filter(([version]) => /^\d+\.\d+\.\d+$/.test(version))
    .map(([version, entry]) => {
      const sourceCommit = entry.gitHead;
      const publishedAt = registry.time[version];
      if (!/^[a-f0-9]{40}$/.test(sourceCommit) || !Number.isFinite(Date.parse(publishedAt)))
        throw new Error(`Published version ${version} has no reproducible source commit or date.`);
      return { version, sourceCommit, publishedAt };
    })
    .sort((a, b) => {
      const left = a.version.split('.').map(Number);
      const right = b.version.split('.').map(Number);
      return right[0] - left[0] || right[1] - left[1] || right[2] - left[2];
    });
  const latest = registry['dist-tags'].latest;
  if (!versions.some((release) => release.version === latest))
    throw new Error('The npm latest tag must refer to a published stable version.');
  return { latest, versions };
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

async function installPlatform(snapshot) {
  const docs = path.join(snapshot, 'apps/docs');
  for (const file of platformFiles.filter((file) => !file.endsWith('build-versioned-site.mjs'))) {
    // 0.1.0 predates English documentation; do not create an incomplete locale.
    if (file.includes('/docs/en/')) {
      try {
        await readFile(path.join(docs, 'docs/en/index.mdx'));
      } catch {
        continue;
      }
    }
    await cp(path.join(repository, file), path.join(snapshot, file));
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
  const response = await fetch('https://registry.npmjs.org/@sudden3%2Fleaf-ui', {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`npm registry returned ${response.status}`);
  const manifest = publishedReleases(await response.json());
  const hash = createHash('sha256').update(base);
  for (const file of platformFiles) hash.update(await readFile(path.join(repository, file)));
  const platformHash = hash.digest('hex').slice(0, 16);
  const cache = path.join(repository, 'apps/docs/.version-cache');
  const output = path.join(repository, 'apps/docs/site_build');
  const staging = await mkdtemp(path.join(tmpdir(), 'leaf-ui-docs-'));
  try {
    for (const release of manifest.versions) {
      const cached = path.join(cache, `${release.version}-${release.sourceCommit}-${platformHash}`);
      let validCache = false;
      try {
        const index = JSON.parse(await readFile(path.join(cached, 'api/index.json'), 'utf8'));
        validCache =
          index.version === release.version && index.sourceCommit === release.sourceCommit;
      } catch {
        // A cache miss builds the exact published commit below.
      }
      if (!validCache) {
        console.log(`Building Leaf UI ${release.version} from npm gitHead ${release.sourceCommit}`);
        await run('git', ['cat-file', '-e', `${release.sourceCommit}^{commit}`], repository);
        const archive = path.join(staging, `${release.version}.tar`);
        const snapshot = path.join(staging, release.version);
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
        if (info.version !== release.version)
          throw new Error(`Source version mismatch for ${release.version}`);
        await installPlatform(snapshot);
        const log = path.join(staging, `${release.version}.log`);
        await run('pnpm', ['install', '--frozen-lockfile'], snapshot, log);
        await run('pnpm', ['build:docs'], snapshot, log, {
          LEAF_DOCS_BASE: `${base}v/${release.version}/`,
          LEAF_DOCS_SITE_BASE: base,
          LEAF_DOCS_SOURCE_COMMIT: release.sourceCommit,
        });
        // cached is always inside the fixed, generated cache directory.
        await rm(cached, { recursive: true, force: true });
        await cp(path.join(snapshot, 'apps/docs/doc_build'), cached, { recursive: true });
      } else {
        console.log(`Using cached documentation for Leaf UI ${release.version}`);
      }
      const destination = path.join(staging, 'site/v', release.version);
      await cp(cached, destination, { recursive: true });
      release.pages = (await walkFiles(destination))
        .filter((file) => file.endsWith('.html'))
        .map((file) => path.relative(destination, file).replaceAll(path.sep, '/'))
        .sort();
    }
    const site = path.join(staging, 'site');
    await writeFile(
      path.join(site, 'versions.json'),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          package: '@sudden3/leaf-ui',
          ...manifest,
        },
        null,
        2,
      )}\n`,
    );
    const latest = manifest.versions.find((release) => release.version === manifest.latest);
    const entryPages = new Set(manifest.versions.flatMap((release) => release.pages));
    for (const page of entryPages) {
      const target = latest.pages.includes(page) ? page : 'components/index.html';
      const destination = path.join(site, page);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, redirectPage(`${base}v/${manifest.latest}/${target}`));
    }
    for (const file of ['llm.txt', 'llms.txt', 'leaf.svg'])
      await cp(path.join(site, 'v', manifest.latest, file), path.join(site, file));
    await writeFile(path.join(site, '.nojekyll'), '');
    // The only replaced output is this repository's fixed generated site directory.
    await rm(output, { recursive: true, force: true });
    await cp(site, output, { recursive: true });
    console.log(`Versioned site ready: ${output} (latest ${manifest.latest})`);
    return manifest;
  } finally {
    // staging is created by mkdtemp above; it never refers to a user checkout.
    await rm(staging, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await buildVersionedSite();
