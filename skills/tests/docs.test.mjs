import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pageUrl, queryDocs, resolveInstallation } from '../leaf-ui/scripts/docs.mjs';

const packageName = '@sudden3/leaf-ui';
const metadata = (version) => ({ package: packageName, version });
const index = (version, name = 'Button') => ({
  schemaVersion: 1,
  package: packageName,
  version,
  exports: [{ name, kind: 'export' }],
  pages: ['en', 'zh'].map((language) => ({
    id: 'components/button',
    language,
    markdown: `${language === 'en' ? 'en/' : ''}components/button.md`,
    symbols: [{ name, kind: 'export' }],
  })),
});
const markdown = (version) =>
  `> Leaf UI ${version} · Package: ${packageName}\n\n# Button\n\n| Property | Type |\n| --- | --- |\n| children | ReactNode |`;

test('resolve installed packages independently for two apps, ignoring dependency ranges', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'leaf-ui-skill-test-'));
  try {
    for (const [app, version] of [
      ['old', '0.2.0'],
      ['new', '0.3.0'],
    ]) {
      const directory = path.join(root, app);
      const dependency = path.join(directory, 'node_modules/@sudden3/leaf-ui');
      await mkdir(dependency, { recursive: true });
      await writeFile(
        path.join(directory, 'package.json'),
        JSON.stringify({ dependencies: { [packageName]: '^0.1.0' } }),
      );
      await writeFile(
        path.join(dependency, 'package.json'),
        JSON.stringify({
          name: packageName,
          version,
          types: './dist/esm/index.d.ts',
          exports: { './package.json': './package.json' },
        }),
      );
      const resolved = await resolveInstallation(directory);
      assert.equal(resolved.version, version);
      assert.equal(resolved.typesPath, path.join(dependency, 'dist/esm/index.d.ts'));
    }
    await assert.rejects(resolveInstallation(root), /Cannot resolve/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('a query fetches only the exact version index and requested Markdown', async () => {
  const requests = [];
  const result = await queryDocs({
    installation: metadata('0.2.0'),
    api: 'Button',
    fetcher: async (url, options) => {
      requests.push(url.href);
      assert.equal(options.redirect, 'error');
      return new Response(
        url.pathname.endsWith('.json') ? JSON.stringify(index('0.2.0')) : markdown('0.2.0'),
      );
    },
  });
  assert.deepEqual(requests, [
    'https://ifhover.github.io/leaf-ui/v/0.2.0/api/index.json',
    'https://ifhover.github.io/leaf-ui/v/0.2.0/en/components/button.md',
  ]);
  assert.match(result.markdown, /Leaf UI 0.2.0/);
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
      fetcher: async (url) =>
        new Response(
          url.pathname.endsWith('.json') ? JSON.stringify(index('0.2.0')) : markdown('0.3.0'),
        ),
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
    fetcher: async (url) =>
      new Response(url.pathname.endsWith('.json') ? JSON.stringify(data) : markdown('0.1.0')),
  });
  assert.equal(result.page, 'https://ifhover.github.io/leaf-ui/v/0.1.0/components/button.md');
});

test('exported types and guides resolve to one page', async () => {
  const data = index('0.3.0', 'ButtonProps');
  data.exports[0].kind = 'type';
  data.pages.push({ id: 'guide/ssr', language: 'en', markdown: 'en/guide/ssr.md', symbols: [] });
  const fetcher = async (url) =>
    new Response(url.pathname.endsWith('.json') ? JSON.stringify(data) : markdown('0.3.0'));
  assert.match(
    (await queryDocs({ installation: metadata('0.3.0'), api: 'ButtonProps', fetcher })).page,
    /button.md$/,
  );
  assert.match(
    (await queryDocs({ installation: metadata('0.3.0'), guide: 'ssr', fetcher })).page,
    /guide\/ssr.md$/,
  );
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
