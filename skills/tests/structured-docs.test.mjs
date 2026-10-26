import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { exportComponentDocs } from '../../apps/docs/scripts/export-component-docs.mjs';
import { formatDocs, queryDocs } from '../leaf-ui/scripts/docs.mjs';

const packageName = '@ifhover/leaf-ui';
const version = '9.8.7';
const commit = 'a'.repeat(40);
const base = `/leaf-ui/v/${version}/`;
const site = 'https://ifhover.github.io/leaf-ui/';
const rootUrl = `https://ifhover.github.io${base}`;
const installation = { package: packageName, version };
const script = fileURLToPath(new URL('../leaf-ui/scripts/docs.mjs', import.meta.url));
const exampleSpecs = [
  ['controlled', 'Controlled, compact selection', 'EXAMPLE_CONTROLLED'],
  ['async', 'Async choices', 'EXAMPLE_ASYNC'],
  ['keyboard', 'Focused keyboard input', 'EXAMPLE_KEYBOARD'],
];
const routes = new Map();
let temporary;
let project;

function exampleBlock(language, [id, title, sentinel]) {
  return [
    `### ${language === 'zh' ? 'ZH ' : ''}${title}`,
    '',
    `${language.toUpperCase()} ${sentinel}: keep **authored emphasis**, \`inline code\` and  double spaces.`,
    '',
    `{/* leaf:example ${id} */}`,
    '',
    '```tsx',
    `const selected = '${sentinel}';`,
    '  console.log(selected);',
    '```',
    '',
    '#### Nested notes',
    '',
    `Trailing ${sentinel} responsibility belongs to this complete example.`,
  ].join('\n');
}

function componentPage(language) {
  return [
    "import { BasicPreview } from './basic';",
    "export const leafDoc = { component: 'Demo', primaryApi: 'DemoProps' };",
    '',
    `# Demo${language === 'zh' ? ' ZH' : ''}`,
    '',
    `${language.toUpperCase()} original **introduction** with \`inline code\` and [SSR](/guide/ssr).`,
    '',
    'Additional introduction context must survive extraction.',
    '',
    '{/* leaf:section basic */}',
    '',
    '## Basic usage',
    '',
    'A complete basic description, not a generated summary.',
    '',
    '<ComponentExample exampleId="basic" preview={<BasicPreview />} fileName="basic.tsx">',
    '',
    '```tsx file="./basic.tsx"',
    '```',
    '',
    '</ComponentExample>',
    '',
    'Basic trailing prose must remain with the code.',
    '',
    '{/* leaf:section examples */}',
    '',
    '## Examples',
    '',
    ...exampleSpecs.flatMap((spec) => [exampleBlock(language, spec), '']),
    '{/* leaf:section api */}',
    '',
    '## API',
    '',
    '### DemoProps',
    '',
    'The main component API always comes first.',
    '',
    '| Property | Type | Default | Description |',
    '| --- | --- | --- | --- |',
    "| `value` | `'a' \\| 'b'` | `'a'` | Preserve this full API row. |",
    '',
    '### DemoItemProps',
    '',
    'The exported item type shares this component reference.',
    '',
    '| Property | Type | Default | Description |',
    '| --- | --- | --- | --- |',
    '| `label` | `string` | - | Item label. |',
    '',
  ].join('\n');
}

async function write(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, value);
}

before(async () => {
  temporary = await mkdtemp(path.join(tmpdir(), 'leaf-skill-structured-'));
  const repository = path.join(temporary, 'repository');
  const output = path.join(temporary, 'site');
  project = path.join(temporary, 'application');
  const manifest = { name: packageName, version };
  await write(path.join(repository, 'packages/react/package.json'), JSON.stringify(manifest));
  for (const language of ['en', 'zh']) {
    const directory = path.join(
      repository,
      'apps/docs/docs',
      language === 'en' ? 'en/components' : 'components',
    );
    await write(path.join(directory, 'demo.mdx'), componentPage(language));
    await write(
      path.join(directory, 'basic.tsx'),
      'import { Demo } from \'@ifhover/leaf-ui\';\nexport function BasicPreview() { return <Demo value="BASIC_SOURCE_EXACT" />; }\n',
    );
  }
  const catalog = await exportComponentDocs({
    repository,
    output,
    base,
    sourceCommit: commit,
  });
  const documents = [
    'index.json',
    ...catalog.components.flatMap(({ document, language }) => [
      document,
      ...exampleSpecs.map(([id]) => `${language}/demo/examples/${id}.json`),
    ]),
  ];
  for (const document of documents)
    routes.set(
      `ai/v1/${document}`,
      JSON.parse(await readFile(path.join(output, 'ai/v1', document), 'utf8')),
    );
  const symbols = [
    { name: 'Demo', kind: 'export' },
    { name: 'DemoProps', kind: 'type' },
    { name: 'DemoItemProps', kind: 'type' },
  ];
  routes.set('api/index.json', {
    schemaVersion: 1,
    package: packageName,
    version,
    sourceCommit: commit,
    exports: symbols,
    pages: ['en', 'zh'].map((language) => ({
      id: 'components/demo',
      language,
      markdown: `${language === 'en' ? 'en/' : ''}components/demo.md`,
      symbols,
    })),
  });
  for (const language of ['en', 'zh'])
    routes.set(
      `${language === 'en' ? 'en/' : ''}components/demo.md`,
      `> Leaf UI ${version} · Package: ${packageName}\n\n# Demo\n\nLEGACY_ALL_EXAMPLES\n`,
    );
  await write(
    path.join(project, 'package.json'),
    JSON.stringify({ dependencies: { [packageName]: '^0.1.0' } }),
  );
  await write(
    path.join(project, 'node_modules', packageName, 'package.json'),
    JSON.stringify({
      ...manifest,
      types: './dist/index.d.ts',
      exports: { './package.json': './package.json' },
    }),
  );
});

after(async () => {
  if (!temporary) return;
  const resolved = path.resolve(temporary);
  assert.equal(path.dirname(resolved), path.resolve(tmpdir()));
  assert.ok(path.basename(resolved).startsWith('leaf-skill-structured-'));
  await rm(resolved, { recursive: true, force: true });
});

function changed(document, edit) {
  const value = structuredClone(routes.get(document));
  edit(value);
  return value;
}

function transport(overrides = {}, requestRoot = rootUrl) {
  const requests = [];
  const fetcher = async (url, options) => {
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
    assert.ok(url.href.startsWith(requestRoot), `Unexpected version or origin: ${url}`);
    const document = url.href.slice(requestRoot.length);
    requests.push(document);
    const value = Object.hasOwn(overrides, document) ? overrides[document] : routes.get(document);
    if (value instanceof Error) throw value;
    if (value instanceof Response) return value;
    if (value === undefined) return new Response('', { status: 404 });
    return typeof value === 'string' ? new Response(value) : Response.json(value);
  };
  return { requests, fetcher };
}

async function query(options = {}, overrides = {}) {
  const { requests, fetcher } = transport(overrides);
  const result = await queryDocs({ installation, api: 'Demo', site, fetcher, ...options });
  return { requests, result };
}

const detailRequests = ['api/index.json', 'ai/v1/index.json', 'ai/v1/en/demo/detail.json'];

test('real generated details retain complete basic/API text without fetching ordinary examples', async () => {
  const { requests, result } = await query();
  assert.deepEqual(requests, detailRequests);
  assert.equal(result.mode, 'component');
  assert.deepEqual(result.detail, routes.get('ai/v1/en/demo/detail.json'));
  assert.equal(result.metadata.version, version);
  assert.equal(result.metadata.package, packageName);
  assert.equal(result.metadata.documentation, rootUrl);
  assert.equal(result.detail.sourceCommit, commit);
  assert.equal(result.detail.sourceKind, 'release');
  assert.deepEqual(result.detail.apiNames, ['DemoProps', 'DemoItemProps']);
  const formatted = formatDocs(result);
  assert.equal((formatted.match(/^# Demo$/gm) ?? []).length, 1);
  for (const section of ['introduction', 'basic', 'api'])
    assert.ok(formatted.includes(result.detail[section]), `Lost original ${section}`);
  assert.match(formatted, /BASIC_SOURCE_EXACT/);
  assert.match(formatted, /Basic trailing prose must remain/);
  assert.match(formatted, /\| `value` \| `'a' \\\| 'b'` \|/);
  for (const [id, title, sentinel] of exampleSpecs) {
    assert.ok(formatted.includes(`${title} (ID: \`${id}\`)`));
    assert.ok(!formatted.includes(sentinel), 'Unselected example body leaked into details');
  }
  assert.doesNotMatch(formatted, /leaf:section|leaf:example|<ComponentExample|LEGACY_ALL/);
});

test('exported prop types are component aliases, not separate or abbreviated API pages', async () => {
  for (const api of ['DemoProps', 'DemoItemProps']) {
    const { requests, result } = await query({ api });
    assert.deepEqual(requests, detailRequests);
    assert.deepEqual(result.detail, routes.get('ai/v1/en/demo/detail.json'));
  }
});

test('multiple index, ID and comma-containing full-title selectors deduplicate in requested order', async () => {
  const { requests, result } = await query({
    api: 'DemoItemProps',
    examples: [2, 'controlled', 'ASYNC CHOICES', 'Controlled, compact selection', '2'],
  });
  assert.deepEqual(requests, [
    ...detailRequests,
    'ai/v1/en/demo/examples/async.json',
    'ai/v1/en/demo/examples/controlled.json',
  ]);
  assert.equal(result.mode, 'examples');
  assert.deepEqual(
    result.examples.map(({ id }) => id),
    ['async', 'controlled'],
  );
  const expected = ['async', 'controlled'].map((id) =>
    routes.get(`ai/v1/en/demo/examples/${id}.json`),
  );
  assert.deepEqual(result.examples, expected);
  assert.equal(formatDocs(result), expected.map(({ markdown }) => markdown).join('\n\n'));
  assert.doesNotMatch(formatDocs(result), /EXAMPLE_KEYBOARD|BASIC_SOURCE_EXACT|## API/);
  assert.match(formatDocs(result), / {2}console\.log\(selected\);/);
  assert.match(formatDocs(result), /#### Nested notes/);
  assert.match(formatDocs(result), /Trailing EXAMPLE_CONTROLLED responsibility/);
  assert.ok(
    formatDocs(result).includes('keep **authored emphasis**, `inline code` and  double spaces.'),
  );
});

test('requested Chinese details and fallback both stay on the same release and actual page language', async () => {
  for (const fallback of [false, true]) {
    const overrides = fallback
      ? {
          'api/index.json': changed('api/index.json', (value) => {
            value.pages = value.pages.filter(({ language }) => language === 'zh');
          }),
        }
      : {};
    const { result, requests } = await query(
      { lang: fallback ? 'en' : 'zh', examples: ['controlled'] },
      overrides,
    );
    assert.equal(result.language, 'zh');
    assert.equal(result.page, `${rootUrl}components/demo.html`);
    assert.deepEqual(requests, [
      'api/index.json',
      'ai/v1/index.json',
      'ai/v1/zh/demo/detail.json',
      'ai/v1/zh/demo/examples/controlled.json',
    ]);
    assert.match(formatDocs(result), /ZH EXAMPLE_CONTROLLED/);
  }
});

test('a different-base self-hosted mirror can serve untouched generated canonical details and examples', async () => {
  const mirror = 'https://mirror.example/handbook/component-library/';
  const mirrorRoot = `${mirror}v/${version}/`;
  for (const lang of ['en', 'zh']) {
    const detailDocument = `ai/v1/${lang}/demo/detail.json`;
    const details = transport({}, mirrorRoot);
    const result = await queryDocs({
      installation,
      api: 'DemoProps',
      lang,
      site: mirror,
      fetcher: details.fetcher,
    });
    assert.deepEqual(result.detail, routes.get(detailDocument));
    assert.equal(result.metadata.documentation, mirrorRoot);
    assert.equal(result.page, routes.get(detailDocument).source.url);
    assert.deepEqual(details.requests, ['api/index.json', 'ai/v1/index.json', detailDocument]);
    const examples = transport({}, mirrorRoot);
    const selected = await queryDocs({
      installation,
      api: 'Demo',
      examples: ['controlled'],
      lang,
      site: mirror,
      fetcher: examples.fetcher,
    });
    const exampleDocument = `ai/v1/${lang}/demo/examples/controlled.json`;
    assert.deepEqual(selected.examples, [routes.get(exampleDocument)]);
    assert.equal(selected.page, result.page);
    assert.deepEqual(examples.requests, [...details.requests, exampleDocument]);
  }
});

test('self-hosted provenance permits only the exact canonical or mirror page, consistently across responses', async () => {
  const mirror = 'https://mirror.example/handbook/component-library/';
  const mirrorRoot = `${mirror}v/${version}/`;
  const detailDocument = 'ai/v1/en/demo/detail.json';
  const exampleDocument = 'ai/v1/en/demo/examples/controlled.json';
  const mirrorPage = `${mirrorRoot}en/components/demo.html`;
  const sourceAt = (document, url) =>
    changed(document, (value) => {
      value.source.url = url;
    });
  const mirrorSource = transport(
    {
      [detailDocument]: sourceAt(detailDocument, mirrorPage),
      [exampleDocument]: sourceAt(exampleDocument, mirrorPage),
    },
    mirrorRoot,
  );
  const result = await queryDocs({
    installation,
    api: 'Demo',
    examples: ['controlled'],
    site: mirror,
    fetcher: mirrorSource.fetcher,
  });
  assert.equal(result.page, mirrorPage);
  assert.equal(result.examples[0].source.url, mirrorPage);
  for (const url of [
    `https://foreign.example/leaf-ui/v/${version}/en/components/demo.html`,
    'https://ifhover.github.io/leaf-ui/v/9.8.8/en/components/demo.html',
    `${mirror}v/9.8.8/en/components/demo.html`,
    `https://mirror.example/leaf-ui/v/${version}/en/components/demo.html`,
  ]) {
    const details = transport({ [detailDocument]: sourceAt(detailDocument, url) }, mirrorRoot);
    await assert.rejects(
      queryDocs({
        installation,
        api: 'Demo',
        site: mirror,
        fetcher: details.fetcher,
      }),
      /Invalid structured/,
    );
    assert.deepEqual(details.requests, detailRequests);
    const examples = transport({ [exampleDocument]: sourceAt(exampleDocument, url) }, mirrorRoot);
    await assert.rejects(
      queryDocs({
        installation,
        api: 'Demo',
        examples: ['controlled'],
        site: mirror,
        fetcher: examples.fetcher,
      }),
      /Invalid structured/,
    );
    assert.deepEqual(examples.requests, [...detailRequests, exampleDocument]);
  }
  for (const overrides of [
    { [exampleDocument]: sourceAt(exampleDocument, mirrorPage) },
    { [detailDocument]: sourceAt(detailDocument, mirrorPage) },
  ]) {
    const { fetcher, requests } = transport(overrides, mirrorRoot);
    await assert.rejects(
      queryDocs({
        installation,
        api: 'Demo',
        examples: ['controlled'],
        site: mirror,
        fetcher,
      }),
      /Invalid structured/,
    );
    assert.deepEqual(requests, [...detailRequests, exampleDocument]);
  }
});

test('invalid and ambiguous selectors fail before downloading any example body', async () => {
  for (const examples of [['0'], ['999'], ['missing'], ['Controlled'], ['1', 'missing']]) {
    const { requests, fetcher } = transport();
    await assert.rejects(
      queryDocs({ installation, api: 'Demo', examples, fetcher }),
      /not found.*Available:/,
    );
    assert.deepEqual(requests, detailRequests);
  }
  const duplicate = changed('ai/v1/en/demo/detail.json', (value) => {
    value.examples[1].title = value.examples[0].title;
  });
  const { requests, fetcher } = transport({ 'ai/v1/en/demo/detail.json': duplicate });
  await assert.rejects(
    queryDocs({ installation, api: 'Demo', examples: [exampleSpecs[0][1]], fetcher }),
    /ambiguous/,
  );
  assert.deepEqual(requests, detailRequests);
});

test('components without ordinary examples still return complete details and reject example selection clearly', async () => {
  for (const lang of ['en', 'zh']) {
    const document = `ai/v1/${lang}/demo/detail.json`;
    const overrides = {
      'ai/v1/index.json': changed('ai/v1/index.json', (value) => {
        value.components.find((entry) => entry.language === lang).exampleCount = 0;
      }),
      [document]: changed(document, (value) => {
        value.examples = [];
      }),
    };
    const { result, requests } = await query({ lang }, overrides);
    assert.equal(result.mode, 'component');
    assert.deepEqual(result.detail.examples, []);
    assert.ok(formatDocs(result).includes(result.detail.basic));
    assert.ok(formatDocs(result).includes(result.detail.api));
    assert.doesNotMatch(formatDocs(result), /\(ID:/);
    assert.deepEqual(requests, ['api/index.json', 'ai/v1/index.json', document]);
    const selected = transport(overrides);
    await assert.rejects(
      queryDocs({ installation, api: 'Demo', lang, examples: ['1'], fetcher: selected.fetcher }),
      /not found.*\(none\)/,
    );
    assert.deepEqual(selected.requests, requests);
  }
});

test('metadata and export discovery never download structured details or examples', async () => {
  for (const list of [false, true]) {
    const { requests, fetcher } = transport();
    const result = await queryDocs({ installation, list, fetcher });
    assert.deepEqual(requests, ['api/index.json']);
    assert.equal(formatDocs(result), null);
    if (list) assert.deepEqual(result.exports, routes.get('api/index.json').exports);
  }
});

test('invalid query options and unavailable exports make no unnecessary network requests', async () => {
  for (const options of [
    { api: 'Demo', examples: [' '] },
    { api: 'Demo', examples: 'controlled' },
    { examples: ['controlled'] },
    { guide: 'ssr', examples: ['controlled'] },
    { api: 'Demo', lang: 'fr' },
    { api: 'Demo', guide: 'ssr' },
  ]) {
    const { fetcher, requests } = transport();
    await assert.rejects(queryDocs({ installation, fetcher, ...options }));
    assert.deepEqual(requests, []);
  }
  const { fetcher, requests } = transport();
  await assert.rejects(
    queryDocs({ installation, api: 'NewerComponent', fetcher }),
    /not exported.*No newer version/,
  );
  assert.deepEqual(requests, ['api/index.json']);
});

test('structured support requires the API mapping and catalog to identify the same release commit', async () => {
  for (const sourceCommit of [undefined, null, 'invalid', 'b'.repeat(40)]) {
    const { fetcher, requests } = transport({
      'api/index.json': changed('api/index.json', (value) => {
        value.sourceCommit = sourceCommit;
      }),
    });
    await assert.rejects(queryDocs({ installation, api: 'Demo', fetcher }), /commit|release/i);
    assert.ok(requests.length <= 2);
    assert.ok(requests.every((request) => request.endsWith('index.json')));
  }
});

test('workspace, foreign-version, foreign-package and unsupported structured catalogs never fall back', async () => {
  for (const edit of [
    (value) => {
      value.sourceKind = 'workspace';
    },
    (value) => {
      value.sourceCommit = null;
    },
    (value) => {
      value.sourceCommit = 'b'.repeat(40);
    },
    (value) => {
      value.version = '9.8.8';
    },
    (value) => {
      value.package = '@sudden3/leaf-ui';
    },
    (value) => {
      value.schemaVersion = 2;
    },
    (value) => {
      value.components = [];
    },
  ]) {
    const { fetcher, requests } = transport({
      'ai/v1/index.json': changed('ai/v1/index.json', edit),
    });
    await assert.rejects(queryDocs({ installation, api: 'Demo', fetcher }), /Invalid structured/);
    assert.deepEqual(requests, ['api/index.json', 'ai/v1/index.json']);
  }
});

test('detail provenance, main-API order and example paths are checked before any example fetch', async () => {
  for (const edit of [
    (value) => {
      value.sourceKind = 'workspace';
    },
    (value) => {
      value.sourceCommit = 'b'.repeat(40);
    },
    (value) => {
      value.version = '9.8.8';
    },
    (value) => {
      value.language = 'zh';
    },
    (value) => {
      value.component = 'OtherComponent';
    },
    (value) => {
      value.source.document = 'components/demo.mdx';
    },
    (value) => {
      value.source.url = `${rootUrl}en/components/other.html`;
    },
    (value) => {
      value.apiNames.reverse();
    },
    (value) => {
      value.examples[0].document = '../latest/examples/controlled.json';
    },
    (value) => {
      value.examples[0].markdown = 'Unexpected inline example body';
    },
  ]) {
    const { fetcher, requests } = transport({
      'ai/v1/en/demo/detail.json': changed('ai/v1/en/demo/detail.json', edit),
    });
    await assert.rejects(
      queryDocs({ installation, api: 'Demo', examples: ['controlled'], fetcher }),
      /Invalid structured/,
    );
    assert.deepEqual(requests, detailRequests);
  }
});

test('each selected example response must retain its own identity, page and release provenance', async () => {
  const document = 'ai/v1/en/demo/examples/controlled.json';
  for (const edit of [
    (value) => {
      value.id = 'keyboard';
    },
    (value) => {
      value.index = 2;
    },
    (value) => {
      value.title = 'Other title';
    },
    (value) => {
      value.language = 'zh';
    },
    (value) => {
      value.sourceKind = 'workspace';
    },
    (value) => {
      value.sourceCommit = 'b'.repeat(40);
    },
    (value) => {
      value.version = '9.8.8';
    },
    (value) => {
      value.source.url = 'https://example.com/latest/demo.html';
    },
    (value) => {
      value.source.document = 'components/demo.mdx';
    },
    (value) => {
      value.markdown = '';
    },
  ]) {
    const { fetcher, requests } = transport({ [document]: changed(document, edit) });
    await assert.rejects(
      queryDocs({ installation, api: 'Demo', examples: ['controlled'], fetcher }),
      /Invalid structured/,
    );
    assert.deepEqual(requests, [...detailRequests, document]);
  }
});

test('only a missing structured catalog enables labeled legacy Markdown; example selection remains unsupported', async () => {
  const overrides = {
    'ai/v1/index.json': new Response('', { status: 404 }),
    'api/index.json': changed('api/index.json', (value) => {
      delete value.sourceCommit;
    }),
  };
  const { result, requests } = await query({}, overrides);
  assert.equal(result.mode, 'legacy-page');
  assert.match(result.notice, /complete original Markdown/);
  assert.equal(formatDocs(result), routes.get('en/components/demo.md'));
  assert.deepEqual(requests, ['api/index.json', 'ai/v1/index.json', 'en/components/demo.md']);
  const selected = transport(overrides);
  await assert.rejects(
    queryDocs({ installation, api: 'Demo', examples: ['1'], fetcher: selected.fetcher }),
    /unavailable.*complete original Markdown.*no newer version/is,
  );
  assert.deepEqual(selected.requests, ['api/index.json', 'ai/v1/index.json']);
});

test('network, HTTP, malformed JSON and missing detail/example failures never fall back to legacy/latest', async () => {
  for (const [document, failure] of [
    ['ai/v1/index.json', new Response('', { status: 500 })],
    ['ai/v1/index.json', new Response('', { status: 302, headers: { Location: '/latest/' } })],
    ['ai/v1/index.json', new TypeError('Network unavailable')],
    ['ai/v1/index.json', '{malformed JSON'],
    ['ai/v1/en/demo/detail.json', new Response('', { status: 404 })],
    ['ai/v1/en/demo/examples/controlled.json', new Response('', { status: 404 })],
  ]) {
    const { fetcher, requests } = transport({ [document]: failure });
    await assert.rejects(
      queryDocs({ installation, api: 'Demo', examples: ['controlled'], fetcher }),
    );
    assert.equal(requests.at(-1), document);
    assert.ok(requests.every((request) => request.endsWith('.json')));
  }
});

test('oversized UTF-8 JSON is byte-limited and its response stream is canceled without fallback', async () => {
  const document = 'ai/v1/en/demo/detail.json';
  const detail = changed(document, (value) => {
    value.basic = '\u4e2d'.repeat(600_000);
  });
  const source = JSON.stringify(detail);
  assert.ok(source.length < 1024 * 1024, 'Character count alone must not trigger this limit');
  const bytes = new TextEncoder().encode(source);
  assert.ok(bytes.byteLength > 1024 * 1024);
  let offset = 0;
  let canceled = false;
  const stream = new ReadableStream({
    pull(controller) {
      if (offset >= bytes.byteLength) {
        controller.close();
        return;
      }
      controller.enqueue(bytes.subarray(offset, offset + 65_536));
      offset += 65_536;
    },
    cancel() {
      canceled = true;
    },
  });
  const { fetcher, requests } = transport();
  await assert.rejects(
    queryDocs({
      installation,
      api: 'Demo',
      fetcher: async (url, options) => {
        if (url.href === rootUrl + document) {
          requests.push(document);
          return new Response(stream);
        }
        return fetcher(url, options);
      },
    }),
    /1 MiB|limit/,
  );
  assert.equal(canceled, true);
  assert.deepEqual(requests, detailRequests);
});

async function withServer(run, overrides = {}) {
  const requests = [];
  const server = createServer(async (request, response) => {
    try {
      assert.equal(request.method, 'GET');
      assert.ok(request.url.startsWith(base));
      const document = request.url.slice(base.length);
      requests.push(document);
      const value = Object.hasOwn(overrides, document) ? overrides[document] : routes.get(document);
      if (value instanceof Response) {
        response.writeHead(value.status, Object.fromEntries(value.headers));
        response.end(await value.clone().text());
        return;
      }
      if (value === undefined) {
        response.writeHead(404);
        response.end();
        return;
      }
      if (typeof value === 'string') {
        response.end(value);
        return;
      }
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(value));
    } catch (error) {
      response.writeHead(500);
      response.end(error.message);
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    return await run(`http://127.0.0.1:${server.address().port}/leaf-ui/`, requests);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
}

async function cli(docsSite, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [script, '--project', project, '--docs-site', docsSite, ...args],
      { cwd: temporary, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Leaf UI CLI timed out against its isolated local HTTP fixture.'));
    }, 20_000);
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('close', (code) => {
      clearTimeout(timeout);
      resolve({ code, stdout, stderr });
    });
  });
}

test('real CLI resolves installed exact version and emits one JSON value for component details', async () => {
  await withServer(async (docsSite, requests) => {
    const { code, stdout, stderr } = await cli(docsSite, ['--api', 'DemoProps', '--json']);
    assert.equal(code, 0, stderr);
    assert.equal(stderr, '');
    const result = JSON.parse(stdout);
    assert.equal(result.mode, 'component');
    assert.equal(result.metadata.version, version);
    assert.equal(result.metadata.package, packageName);
    assert.equal(result.metadata.project, project);
    assert.equal(result.detail.sourceCommit, commit);
    assert.equal(result.page, `${rootUrl}en/components/demo.html`);
    assert.deepEqual(result.detail.source, routes.get('ai/v1/en/demo/detail.json').source);
    assert.equal(result.metadata.documentation, `${docsSite}v/${version}/`);
    assert.ok(result.metadata.typesPath.endsWith(path.join('dist', 'index.d.ts')));
    assert.deepEqual(requests, detailRequests);
    assert.doesNotMatch(stdout, /EXAMPLE_CONTROLLED|EXAMPLE_ASYNC|EXAMPLE_KEYBOARD/);
  });
});

test('real CLI repeated --examples preserves comma titles, selection order and deduplication in JSON', async () => {
  await withServer(async (docsSite, requests) => {
    const { code, stdout, stderr } = await cli(docsSite, [
      '--api',
      'Demo',
      '--examples',
      '2',
      '--examples',
      'Controlled, compact selection',
      '--examples',
      'async',
      '--examples',
      '1',
      '--json',
    ]);
    assert.equal(code, 0, stderr);
    const result = JSON.parse(stdout);
    assert.deepEqual(
      result.examples.map(({ id }) => id),
      ['async', 'controlled'],
    );
    assert.deepEqual(requests, [
      ...detailRequests,
      'ai/v1/en/demo/examples/async.json',
      'ai/v1/en/demo/examples/controlled.json',
    ]);
    assert.doesNotMatch(stdout, /EXAMPLE_KEYBOARD|BASIC_SOURCE_EXACT/);
    for (const example of result.examples)
      assert.equal(
        example.markdown,
        routes.get(`ai/v1/en/demo/examples/${example.id}.json`).markdown,
      );
  });
});

test('real CLI readable output retains original blocks without duplicate headings or unselected bodies', async () => {
  await withServer(async (docsSite) => {
    const detail = await cli(docsSite, ['--api', 'Demo']);
    assert.equal(detail.code, 0, detail.stderr);
    assert.equal((detail.stdout.match(/^# Demo$/gm) ?? []).length, 1);
    assert.ok(detail.stdout.includes(`Source: ${rootUrl}en/components/demo.html`));
    assert.match(detail.stdout, /BASIC_SOURCE_EXACT/);
    assert.doesNotMatch(detail.stdout, /EXAMPLE_CONTROLLED|EXAMPLE_ASYNC|EXAMPLE_KEYBOARD/);
    const selected = await cli(docsSite, ['--api', 'Demo', '--examples', 'keyboard']);
    assert.equal(selected.code, 0, selected.stderr);
    assert.ok(
      selected.stdout.includes(routes.get('ai/v1/en/demo/examples/keyboard.json').markdown),
    );
    assert.doesNotMatch(selected.stdout, /EXAMPLE_CONTROLLED|EXAMPLE_ASYNC|BASIC_SOURCE_EXACT/);
  });
});

test('real CLI labels old complete pages and fails unsupported selection or redirects without fallback', async () => {
  await withServer(
    async (docsSite, requests) => {
      const old = await cli(docsSite, ['--api', 'Demo']);
      assert.equal(old.code, 0, old.stderr);
      assert.match(old.stdout, /Notice:.*complete original Markdown/);
      assert.match(old.stdout, /LEGACY_ALL_EXAMPLES/);
      requests.length = 0;
      const unsupported = await cli(docsSite, ['--api', 'Demo', '--examples', '1', '--json']);
      assert.equal(unsupported.code, 1);
      assert.equal(unsupported.stdout, '');
      assert.match(unsupported.stderr, /unavailable.*No fallback to latest/is);
      assert.deepEqual(requests, ['api/index.json', 'ai/v1/index.json']);
    },
    { 'ai/v1/index.json': new Response('', { status: 404 }) },
  );
  await withServer(
    async (docsSite, requests) => {
      const redirected = await cli(docsSite, ['--api', 'Demo', '--json']);
      assert.equal(redirected.code, 1);
      assert.equal(redirected.stdout, '');
      assert.match(redirected.stderr, /No fallback to latest/);
      assert.deepEqual(requests, ['api/index.json', 'ai/v1/index.json']);
    },
    {
      'ai/v1/index.json': new Response('', { status: 302, headers: { Location: '/latest/' } }),
    },
  );
});
