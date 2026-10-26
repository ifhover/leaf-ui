import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pageUrl, queryDocs, resolveInstallation, versionRoot } from '../leaf-ui/scripts/docs.mjs';

const packageName = '@sudden3/leaf-ui';
const metadata = (version, installedPackage = packageName) => ({
  package: installedPackage,
  version,
});
const index = (version, name = 'Button', installedPackage = packageName) => ({
  schemaVersion: 1,
  package: installedPackage,
  version,
  exports: [{ name, kind: 'export' }],
  pages: ['en', 'zh'].map((language) => ({
    id: 'components/button',
    language,
    markdown: `${language === 'en' ? 'en/' : ''}components/button.md`,
    symbols: [{ name, kind: 'export' }],
  })),
});
const markdown = (version, installedPackage = packageName) =>
  `> Leaf UI ${version} · Package: ${installedPackage}\n\n# Button\n\n| Property | Type |\n| --- | --- |\n| children | ReactNode |`;
const legacyResponse = (url, data, body) =>
  url.pathname.endsWith('/ai/v1/index.json')
    ? new Response('', { status: 404 })
    : url.pathname.endsWith('.json')
      ? Response.json(data)
      : new Response(body);

test('version roots reject ranges, path escapes and insecure remote sites', () => {
  for (const version of ['latest', '^0.9.0', '../latest', '0.9.0/../../latest', null])
    assert.throws(
      () => versionRoot('https://example.com/docs/', version),
      /exact installed package version/,
    );
  for (const site of [
    'http://example.com/docs/',
    'file:///docs/',
    'https://user:password@example.com/docs/',
    'https://example.com/docs/?version=latest',
    'https://example.com/docs/#latest',
  ])
    assert.throws(() => versionRoot(site, '0.9.0'));
  assert.equal(
    versionRoot('http://127.0.0.1:1234/docs/', '0.9.0-dev.1').href,
    'http://127.0.0.1:1234/docs/v/0.9.0-dev.1/',
  );
});

test('resolve installed packages independently for two apps, ignoring dependency ranges', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'leaf-ui-skill-test-'));
  try {
    for (const [app, version, installedPackage] of [
      ['old', '0.2.0', '@sudden3/leaf-ui'],
      ['new', '0.5.0', '@ifhover/leaf-ui'],
    ]) {
      const directory = path.join(root, app);
      const dependency = path.join(directory, 'node_modules', installedPackage);
      await mkdir(dependency, { recursive: true });
      await writeFile(
        path.join(directory, 'package.json'),
        JSON.stringify({ dependencies: { [installedPackage]: '^0.1.0' } }),
      );
      await writeFile(
        path.join(dependency, 'package.json'),
        JSON.stringify({
          name: installedPackage,
          version,
          types: './dist/esm/index.d.ts',
          exports: { './package.json': './package.json' },
        }),
      );
      const resolved = await resolveInstallation(directory);
      assert.equal(resolved.package, installedPackage);
      assert.equal(resolved.version, version);
      assert.equal(resolved.typesPath, path.join(dependency, 'dist/esm/index.d.ts'));
    }
    await assert.rejects(resolveInstallation(root), /Cannot resolve/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('an application resolving both scopes must select the package matching its imports', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'leaf-ui-two-scopes-test-'));
  try {
    for (const [name, version] of [
      ['@ifhover/leaf-ui', '0.5.0'],
      ['@sudden3/leaf-ui', '0.4.2'],
    ]) {
      const dependency = path.join(root, 'node_modules', name);
      await mkdir(dependency, { recursive: true });
      await writeFile(
        path.join(dependency, 'package.json'),
        JSON.stringify({
          name,
          version,
          exports: { './package.json': './package.json' },
        }),
      );
      assert.equal((await resolveInstallation(root, name)).package, name);
      assert.equal((await resolveInstallation(root, name)).version, version);
    }
    await assert.rejects(resolveInstallation(root), /Both Leaf UI packages/);
    await assert.rejects(
      resolveInstallation(root, 'another-package'),
      /Unsupported Leaf UI package/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('new scope reads its exact version and refuses the other scope even with an identical version', async () => {
  const installedPackage = '@ifhover/leaf-ui';
  const installation = metadata('0.5.0', installedPackage);
  const correctIndex = index('0.5.0', 'Button', installedPackage);
  const result = await queryDocs({
    installation,
    api: 'Button',
    fetcher: async (url) => legacyResponse(url, correctIndex, markdown('0.5.0', installedPackage)),
  });
  assert.equal(result.metadata.package, installedPackage);
  assert.equal(result.page, 'https://ifhover.github.io/leaf-ui/v/0.5.0/en/components/button.md');
  await assert.rejects(
    queryDocs({
      installation,
      api: 'Button',
      fetcher: async () => Response.json(index('0.5.0')),
    }),
    /metadata does not match/,
  );
  for (const otherPackage of ['@sudden3/leaf-ui', '@ifhover/leaf-ui-other']) {
    await assert.rejects(
      queryDocs({
        installation,
        api: 'Button',
        fetcher: async (url) => legacyResponse(url, correctIndex, markdown('0.5.0', otherPackage)),
      }),
      /does not identify/,
    );
  }
});

test('a legacy query probes structured support and retrieves only its exact original page', async () => {
  const requests = [];
  const result = await queryDocs({
    installation: metadata('0.2.0'),
    api: 'Button',
    fetcher: async (url, options) => {
      requests.push(url.href);
      assert.equal(options.redirect, 'error');
      return legacyResponse(url, index('0.2.0'), markdown('0.2.0'));
    },
  });
  assert.deepEqual(requests, [
    'https://ifhover.github.io/leaf-ui/v/0.2.0/api/index.json',
    'https://ifhover.github.io/leaf-ui/v/0.2.0/ai/v1/index.json',
    'https://ifhover.github.io/leaf-ui/v/0.2.0/en/components/button.md',
  ]);
  assert.match(result.markdown, /Leaf UI 0.2.0/);
  assert.equal(result.mode, 'legacy-page');
  assert.match(result.notice, /complete original Markdown/);
});

test('missing export rejects on the index and never requests latest', async () => {
  const requests = [];
  await assert.rejects(
    queryDocs({
      installation: metadata('0.1.0'),
      api: 'Menu',
      fetcher: async (url) => {
        requests.push(url.href);
        return Response.json(index('0.1.0'));
      },
    }),
    /Menu is not exported/,
  );
  assert.equal(requests.length, 1);
  assert.match(requests[0], /\/v\/0.1.0\//);
});

test('reject a wrong version or package in metadata and Markdown', async () => {
  for (const badIndex of [index('0.3.0'), { ...index('0.2.0'), package: 'another-package' }])
    await assert.rejects(
      queryDocs({
        installation: metadata('0.2.0'),
        api: 'Button',
        fetcher: async () => Response.json(badIndex),
      }),
      /metadata does not match/,
    );
  await assert.rejects(
    queryDocs({
      installation: metadata('0.2.0'),
      api: 'Button',
      fetcher: async (url) => legacyResponse(url, index('0.2.0'), markdown('0.3.0')),
    }),
    /does not identify/,
  );
});

test('language fallback keeps the installed version', async () => {
  const data = index('0.1.0');
  data.pages = data.pages.filter((page) => page.language === 'zh');
  const result = await queryDocs({
    installation: metadata('0.1.0'),
    api: 'Button',
    fetcher: async (url) => legacyResponse(url, data, markdown('0.1.0')),
  });
  assert.equal(result.page, 'https://ifhover.github.io/leaf-ui/v/0.1.0/components/button.md');
});

test('exported types and guides resolve to one page', async () => {
  const data = index('0.3.0', 'ButtonProps');
  data.exports[0].kind = 'type';
  data.pages.push({ id: 'guide/ssr', language: 'en', markdown: 'en/guide/ssr.md', symbols: [] });
  const fetcher = async (url) => legacyResponse(url, data, markdown('0.3.0'));
  assert.match(
    (await queryDocs({ installation: metadata('0.3.0'), api: 'ButtonProps', fetcher })).page,
    /button.md$/,
  );
  assert.match(
    (await queryDocs({ installation: metadata('0.3.0'), guide: 'ssr', fetcher })).page,
    /guide\/ssr.md$/,
  );
});

test('design guidance returns the exact bilingual original without component-data requests', async () => {
  for (const language of ['en', 'zh']) {
    const data = index('0.9.0');
    const document = `${language === 'en' ? 'en/' : ''}guide/design-standards.md`;
    data.pages.push({ id: 'guide/design-standards', language, markdown: document, symbols: [] });
    const original = `${markdown('0.9.0')}\n\n## ${language === 'en' ? 'Color roles' : '颜色角色'}\n\nUse \`--leaf-color-surface-muted\` and retain user overrides.\n\n\`\`\`css\n.page { gap: var(--leaf-spacing-lg); }\n\`\`\`\n`;
    const requests = [];
    const result = await queryDocs({
      installation: metadata('0.9.0'),
      guide: 'design-standards',
      lang: language,
      fetcher: async (url) => {
        requests.push(url.href);
        return url.pathname.endsWith('/api/index.json')
          ? Response.json(data)
          : new Response(original);
      },
    });
    const root = 'https://ifhover.github.io/leaf-ui/v/0.9.0/';
    assert.deepEqual(requests, [`${root}api/index.json`, `${root}${document}`]);
    assert.equal(result.mode, 'page');
    assert.equal(result.markdown, original);
  }
});

test('network failures and malicious page paths cannot select another version', async () => {
  await assert.rejects(
    queryDocs({
      installation: metadata('0.2.0'),
      api: 'Button',
      fetcher: async () => new Response('', { status: 404 }),
    }),
    /returned 404/,
  );
  const root = new URL('https://ifhover.github.io/leaf-ui/v/0.2.0/');
  for (const invalid of [
    '../0.3.0/components/button.md',
    '/components/button.md',
    'https://example.com/a.md',
    '%2e%2e/a.md',
    'en/../../latest/a.md',
  ])
    assert.throws(() => pageUrl(root, invalid), /invalid Markdown path/);
  const data = index('0.2.0');
  data.pages[0].markdown = '../0.3.0/components/button.md';
  let calls = 0;
  await assert.rejects(
    queryDocs({
      installation: metadata('0.2.0'),
      api: 'Button',
      fetcher: async () => {
        calls++;
        return Response.json(data);
      },
    }),
    /invalid Markdown path/,
  );
  assert.equal(calls, 1);
});
