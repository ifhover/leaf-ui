import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { versionTarget } from '../src/components/version-path.ts';
import { publishedReleases, redirectPage } from './build-versioned-site.mjs';
import { exportAiDocs } from './export-ai-docs.mjs';

test('version switch preserves the page, language and anchor when available', () => {
  const release = {
    version: '0.2.0',
    pages: ['en/components/button.html', 'components/index.html', 'index.html'],
  };
  assert.deepEqual(
    versionTarget(
      '/leaf-ui/',
      '/leaf-ui/v/0.3.0/en/components/button.html',
      '#button-api',
      release,
    ),
    { href: '/leaf-ui/v/0.2.0/en/components/button.html#button-api', exact: true },
  );
  assert.equal(
    versionTarget('/leaf-ui/', '/leaf-ui/en/components/button', '#button-api', release).href,
    '/leaf-ui/v/0.2.0/en/components/button.html#button-api',
  );
  assert.equal(
    versionTarget('/', '/v/0.3.0/components/', '', release).href,
    '/v/0.2.0/components/index.html',
  );
});

test('missing pages fall back without an unrelated anchor; old Chinese-only releases work', () => {
  const release = {
    version: '0.1.0',
    pages: [
      'components/button.html',
      'components/index.html',
      'guide/introduction.html',
      'index.html',
    ],
  };
  assert.deepEqual(
    versionTarget('/leaf-ui/', '/leaf-ui/v/0.3.0/en/components/menu.html', '#menu-api', release),
    { href: '/leaf-ui/v/0.1.0/components/index.html', exact: false },
  );
  assert.equal(
    versionTarget('/leaf-ui/', '/leaf-ui/v/0.3.0/en/components/button.html', '#api', release).href,
    '/leaf-ui/v/0.1.0/components/button.html',
  );
  assert.equal(
    versionTarget('/leaf-ui/', '/leaf-ui/v/0.3.0/guide/ssr.html', '', release).href,
    '/leaf-ui/v/0.1.0/guide/introduction.html',
  );
});

test('versions are discovered from published npm metadata and source commits', () => {
  const sha = 'a'.repeat(40);
  const data = {
    'dist-tags': { latest: '0.10.0' },
    versions: {
      '0.2.0': { gitHead: sha },
      '0.10.0': { gitHead: sha },
      '0.11.0-beta.1': { gitHead: sha },
    },
    time: { '0.2.0': '2026-10-04', '0.10.0': '2026-10-05' },
  };
  assert.deepEqual(
    publishedReleases(data).versions.map((version) => version.version),
    ['0.10.0', '0.2.0'],
  );
  assert.throws(
    () => publishedReleases({ ...data, 'dist-tags': { latest: '0.99.0' } }),
    /published stable version/,
  );
  assert.throws(() => publishedReleases({ ...data, versions: { '0.2.0': {} } }), /reproducible/);
  assert.match(
    redirectPage('/leaf-ui/v/0.3.0/components/button.html'),
    /location.search\+location.hash/,
  );
});

test('AI index comes from snapshot exports and maps nested types to component docs', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'leaf-ui-export-test-'));
  const output = path.join(root, 'output');
  try {
    await mkdir(path.join(root, 'packages/react/src'), { recursive: true });
    await mkdir(path.join(output, 'components'), { recursive: true });
    await writeFile(
      path.join(root, 'packages/react/package.json'),
      JSON.stringify({ version: '0.1.0' }),
    );
    await writeFile(
      path.join(root, 'packages/react/src/index.ts'),
      "export { Button } from './button';\nexport type { ButtonProps } from './button';\nexport type { TextareaAutoSize } from './textarea/textarea';",
    );
    await writeFile(
      path.join(output, 'components/button.md'),
      '# Button\n\n| property | type |\n| --- | --- |\n| children | ReactNode |',
    );
    await writeFile(path.join(output, 'components/textarea.md'), '# Textarea\n');
    await writeFile(path.join(output, 'llms.txt'), '# Leaf UI\n\n## Components\n');
    const result = await exportAiDocs({
      repository: root,
      output,
      base: '/leaf-ui/v/0.1.0/',
      sourceCommit: 'a'.repeat(40),
    });
    assert.equal(result.version, '0.1.0');
    assert.equal(
      result.exports.some((entry) => entry.name === 'Menu'),
      false,
    );
    assert.ok(
      result.pages
        .find((page) => page.id === 'components/button')
        .symbols.some((entry) => entry.name === 'ButtonProps'),
    );
    assert.ok(
      result.pages
        .find((page) => page.id === 'components/textarea')
        .symbols.some((entry) => entry.name === 'TextareaAutoSize'),
    );
    assert.match(
      await readFile(path.join(output, 'components/button.md'), 'utf8'),
      /https:\/\/ifhover.github.io\/leaf-ui\/v\/0.1.0\/components\/button.html/,
    );
    assert.equal(
      await readFile(path.join(output, 'llm.txt'), 'utf8'),
      await readFile(path.join(output, 'llms.txt'), 'utf8'),
    );
    assert.match(
      await readFile(path.join(output, 'llm.txt'), 'utf8'),
      /\/v\/0.1.0\/api\/index.json/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
