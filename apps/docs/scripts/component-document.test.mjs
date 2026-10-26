import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parse } from '@babel/parser';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import {
  applySourceEdits,
  componentDetail,
  orderPrimaryComponentApi,
  parseComponentDocument,
  readComponentDocument,
  remarkComponentDocument,
  selectExamples,
} from './component-document.mjs';
import { exportComponentDocs } from './export-component-docs.mjs';

const repository = path.resolve(import.meta.dirname, '../../..');
const fixture = [
  "import { Demo as Preview } from './demo';",
  "export const leafDoc = { component: 'Demo', primaryApi: 'DemoProps' };",
  '',
  '# Demo',
  '',
  'A component introduction.',
  '',
  '{/* leaf:section basic */}',
  '',
  '## Basic usage',
  '',
  'Basic description.',
  '',
  '<ComponentExample exampleId="basic" preview={<Preview />} fileName="demo.tsx">',
  '',
  '```tsx file="./demo.tsx"',
  '```',
  '',
  '</ComponentExample>',
  '',
  '{/* leaf:section examples */}',
  '',
  '## Examples',
  '',
  '### Controlled selection',
  '',
  'Use a controlled value.',
  '',
  '<ComponentExample exampleId="controlled" preview={<Preview />} fileName="demo.tsx">',
  '',
  '```tsx file="./demo.tsx"',
  '```',
  '',
  '</ComponentExample>',
  '',
  'Keep this trailing responsibility with the example.',
  '',
  '#### Additional notes',
  '',
  'Nested notes belong to the same example.',
  '',
  '{/* leaf:section api */}',
  '',
  '## API',
  '',
  '### DemoProps',
  '',
  'Component props.',
  '',
  '| Property | Type | Default | Description |',
  '| --- | --- | --- | --- |',
  "| `value` | `'a' \\| 'b'` | — | Optional controlled value. |",
  '',
].join('\n');

async function temporary(run) {
  const directory = await mkdtemp(path.join(tmpdir(), 'leaf-component-doc-'));
  try {
    return await run(directory);
  } finally {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
    await rm(directory, { recursive: true, force: true });
  }
}

function sourceOnlyFixture() {
  const start = fixture.indexOf('<ComponentExample exampleId="controlled"');
  const end = fixture.indexOf('</ComponentExample>', start) + '</ComponentExample>'.length;
  return (
    fixture.slice(0, start) +
    [
      '{/* leaf:example controlled */}',
      '',
      '```tsx',
      "import { Demo } from '@ifhover/leaf-ui';",
      'export function Controlled() { return <Demo value="a" />; }',
      '```',
    ].join('\n') +
    fixture.slice(end)
  );
}

test('AST boundaries preserve introductions, trailing prose and nested example headings', () => {
  for (const source of [fixture, fixture.replaceAll('\n', '\r\n')]) {
    const model = parseComponentDocument(source, 'demo.mdx');
    assert.equal(model.component, 'Demo');
    assert.equal(model.examples.length, 1);
    assert.equal(model.examples[0].title, 'Controlled selection');
    assert.deepEqual(model.apiNames, ['DemoProps']);
    assert.equal(
      model.examples[0].nodes.at(-1).children[0].value,
      'Nested notes belong to the same example.',
    );
  }
});

test('code fences containing fake headings and markers cannot change document structure', () => {
  const source = fixture.replace(
    'Basic description.',
    'Basic description.\n\n````mdx\n# Fake component\n## API\n{/* leaf:section examples */}\n```tsx\n// sample\n```\n````',
  );
  const model = parseComponentDocument(source, 'demo.mdx');
  assert.equal(model.examples.length, 1);
  assert.deepEqual(model.apiNames, ['DemoProps']);
});

test('invalid section identity, order and duplicate markers fail with a source location', () => {
  for (const source of [
    fixture.replace('leaf:section basic', 'leaf:section api'),
    fixture.replace('leaf:section api', 'leaf:section invalid'),
    fixture.replace('{/* leaf:section examples */}', ''),
    fixture.replace(
      '{/* leaf:section api */}',
      '{/* leaf:section basic */}\n{/* leaf:section api */}',
    ),
  ])
    assert.throws(
      () => parseComponentDocument(source, 'demo.mdx'),
      /demo\.mdx:\d+:\d+:.*(?:section|Section)/,
    );
});

test('main API identity is explicit, first and unique', () => {
  assert.throws(
    () => parseComponentDocument(fixture.replace('### DemoProps', '### DemoItemProps'), 'demo.mdx'),
    /DemoProps must be the first/,
  );
  const duplicate = fixture + fixture.slice(fixture.indexOf('### DemoProps'));
  assert.throws(() => parseComponentDocument(duplicate, 'demo.mdx'), /Duplicate API/);
  const legacyHeading = fixture.replace('### DemoProps', '### Demo API');
  assert.deepEqual(parseComponentDocument(legacyHeading).apiNames, ['DemoProps']);
});

test('API signatures, constrained aliases and lowercase hook identities do not require fake tables', () => {
  const signature =
    fixture
      .replace("primaryApi: 'DemoProps'", "primaryApi: 'useDemo'")
      .replace('### DemoProps', '### useDemo API')
      .slice(0, -fixture.slice(fixture.indexOf('| Property |')).length) +
    '`useDemo(options?: DemoOptions): DemoApi`\n';
  assert.deepEqual(parseComponentDocument(signature).apiNames, ['useDemo']);
  const alias = `${fixture}\n### DemoRowKey\n\nOnly required string or number fields are accepted.\n\n\`type DemoRowKey<TData> = keyof TData | ((record: TData) => string | number)\`\n`;
  assert.deepEqual(parseComponentDocument(alias).apiNames, ['DemoProps', 'DemoRowKey']);
  assert.throws(
    () =>
      parseComponentDocument(
        alias.replace(
          'type DemoRowKey<TData> = keyof TData | ((record: TData) => string | number)',
          'DemoRowKey',
        ),
      ),
    /table, an explicit signature/,
  );
  const reference = `${fixture}\n### SharedProps API\n\nReuse the [Shared API](shared#shared-api) parameters.\n`;
  assert.deepEqual(parseComponentDocument(reference).apiNames, ['DemoProps', 'SharedProps']);
  assert.throws(
    () => parseComponentDocument(reference.replace('(shared#shared-api)', '(#sharedprops-api)')),
    /named cross-page API reference/,
  );
});

test('source range edits compose length changes once and parent wrappers own nested conversions', () => {
  const source = 'abcdefghij';
  assert.equal(
    applySourceEdits(source, [
      { start: 2, end: 4, value: 'IGNORED NESTED LINK CONVERSION' },
      { start: 0, end: 6, value: 'WHOLE' },
      { start: 6, end: 8, value: 'NEIGHBOR' },
    ]),
    'WHOLENEIGHBORij',
  );
  assert.equal(
    applySourceEdits(source, [
      { start: 0, end: 2, value: 'first' },
      { start: 0, end: 2, value: 'last' },
    ]),
    'lastcdefghij',
  );
  assert.throws(
    () =>
      applySourceEdits(source, [
        { start: 0, end: 4, value: '' },
        { start: 2, end: 6, value: '' },
      ]),
    /partially overlap/,
  );
  assert.throws(
    () => applySourceEdits(source, [{ start: -1, end: 4, value: '' }]),
    /original source range/,
  );
});

test('metadata and imports precede the title and no visible preamble is silently omitted', () => {
  const metadata = "export const leafDoc = { component: 'Demo', primaryApi: 'DemoProps' };";
  assert.throws(
    () =>
      parseComponentDocument(
        fixture
          .replace(metadata, '')
          .replace('A component introduction.', `A component introduction.\n\n${metadata}`),
      ),
    /before the H1/,
  );
  assert.throws(
    () => parseComponentDocument(fixture.replace('# Demo', 'A discarded preamble.\n\n# Demo')),
    /may precede the H1/,
  );
  const start = fixture.indexOf('### Controlled selection');
  const end = fixture.indexOf('{/* leaf:section api */}');
  assert.equal(
    parseComponentDocument(fixture.slice(0, start) + fixture.slice(end)).examples.length,
    0,
  );
});

test('API generation moves the whole primary block first and remains idempotent', () => {
  const source = fixture.replace(
    '### DemoProps',
    '### DemoItem\n\nItem data.\n\n| Property | Type | Description |\n| --- | --- | --- |\n| key | string | Stable identity. |\n\n### DemoProps',
  );
  const ordered = orderPrimaryComponentApi(source, 'demo.mdx');
  const model = parseComponentDocument(ordered, 'demo.mdx');
  assert.deepEqual(model.apiNames, ['DemoProps', 'DemoItem']);
  assert.ok(ordered.indexOf('Optional controlled value.') < ordered.indexOf('Stable identity.'));
  assert.equal(orderPrimaryComponentApi(ordered), ordered);
});

test('examples require stable IDs, prose, source fences and a single title source', () => {
  for (const [source, error] of [
    [fixture.replace('exampleId="controlled"', 'exampleId="basic"'), /exampleId/],
    [fixture.replace('exampleId="controlled"', 'exampleId={name}'), /exampleId/],
    [
      fixture
        .replace('Use a controlled value.', '')
        .replace('Keep this trailing responsibility with the example.', '')
        .replace('Nested notes belong to the same example.', ''),
      /prose description/,
    ],
    [
      fixture.replace('exampleId="controlled"', 'exampleId="controlled" title="Duplicate"'),
      /title only/,
    ],
    [
      fixture.replace(
        '```tsx file="./demo.tsx"\n```',
        '```tsx file="./demo.tsx"\nconst duplicate = true;\n```',
      ),
      /do not copy code/,
    ],
  ])
    assert.throws(() => parseComponentDocument(source, 'demo.mdx'), error);
});

test('unsupported MDX is reported, and static metadata is never evaluated', () => {
  assert.throws(
    () =>
      parseComponentDocument(
        fixture.replace('Basic description.', '<UnknownWidget />\n\nBasic description.'),
      ),
    /Unsupported MDX/,
  );
  assert.throws(
    () => parseComponentDocument(fixture.replace("component: 'Demo'", 'component: getComponent()')),
    /literal/,
  );
  assert.ok(
    parseComponentDocument(
      fixture.replace(
        '# Demo',
        'export const ignored = (() => { throw new Error("must not execute"); })();\n\n# Demo',
      ),
    ),
  );
  assert.equal(parseComponentDocument('# Legacy page\n\nUnchanged.'), null);
});

test('unsupported preview props and wrapper content fail rather than changing exported code silently', () => {
  for (const preview of [
    '<Preview value="custom" />',
    '<Preview {...props} />',
    '<Preview english={language} />',
    '<Preview english="true" />',
    '<Preview>Unexported content</Preview>',
  ])
    assert.throws(
      () => parseComponentDocument(fixture.replace('<Preview />', preview)),
      /self-closing named preview/,
    );
  for (const preview of [
    '<Preview english />',
    '<Preview english={true} />',
    '<Preview english={false} />',
  ])
    assert.ok(parseComponentDocument(fixture.replace('<Preview />', preview)));
  assert.throws(
    () =>
      parseComponentDocument(fixture.replace('exampleId="basic"', 'exampleId="basic" {...props}')),
    /spread or duplicate/,
  );
  assert.throws(
    () =>
      parseComponentDocument(
        fixture.replace('</ComponentExample>', 'Unexported prose.\n\n</ComponentExample>'),
      ),
    /one complete source code fence/,
  );
});

test('remark injects the Markdown heading title without changing source code or visible headings', () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMdx)
    .use(remarkComponentDocument);
  const tree = processor.runSync(processor.parse(fixture), { value: fixture, path: 'demo.mdx' });
  const examples = tree.children.filter((node) => node.name === 'ComponentExample');
  assert.deepEqual(
    examples.map((node) => node.attributes.find((attribute) => attribute.name === 'title').value),
    ['Basic usage', 'Controlled selection'],
  );
  assert.equal(
    tree.children.filter((node) => node.type === 'heading' && node.depth === 2).length,
    3,
  );
  const filled = processor.parse(fixture);
  for (const node of filled.children.filter((node) => node.name === 'ComponentExample'))
    node.children[0].value = 'export function Demo() { return null; }';
  assert.doesNotThrow(() => processor.runSync(filled, { value: fixture, path: 'demo.mdx' }));
});

test('source materialization resolves aliased imports, preserves the full block and avoids preview markup', async () => {
  await temporary(async (directory) => {
    const file = path.join(directory, 'demo.mdx');
    await writeFile(file, fixture);
    await writeFile(
      path.join(directory, 'demo.tsx'),
      'export function Demo() { return <button>Run</button>; }\nexport function Other() { return <div>Unused</div>; }',
    );
    const document = await readComponentDocument(file);
    assert.match(document.basic, /export function Demo/);
    assert.doesNotMatch(document.basic, /Other|ComponentExample|file="|leaf:section/);
    assert.match(document.examples[0].markdown, /Keep this trailing responsibility/);
    assert.match(document.examples[0].markdown, /#### Additional notes/);
    assert.match(document.api, /Optional controlled value/);
    const detail = componentDetail(document);
    assert.ok(detail.basic.includes('export function Demo'));
    assert.equal(detail.api, document.api);
    assert.equal('markdown' in detail.examples[0], false);
    assert.doesNotMatch(JSON.stringify(detail), /Keep this trailing responsibility/);
    await writeFile(file, fixture.replace("from './demo'", "from './different'"));
    await assert.rejects(readComponentDocument(file), /same source/);
  });
});

test('source-only examples preserve complete original code and notes with one explicit identity', async () => {
  const source = sourceOnlyFixture();
  const parsed = parseComponentDocument(source);
  assert.equal(parsed.examples[0].id, 'controlled');
  assert.equal(parsed.examples[0].node, null);
  assert.throws(
    () => parseComponentDocument(source.replace('leaf:example controlled', 'leaf:example basic')),
    /stable leaf:example ID/,
  );
  assert.throws(
    () =>
      parseComponentDocument(
        source.replace(
          'leaf:example controlled',
          'leaf:example controlled */}\n{/* leaf:example another',
        ),
      ),
    /stable leaf:example ID/,
  );
  assert.throws(
    () =>
      parseComponentDocument(
        fixture.replace(
          'Use a controlled value.',
          'Use a controlled value.\n\n{/* leaf:example extra */}',
        ),
      ),
    /not both/,
  );
  assert.throws(
    () =>
      parseComponentDocument(
        source.replace(
          'import { Demo } from \'@ifhover/leaf-ui\';\nexport function Controlled() { return <Demo value="a" />; }',
          '',
        ),
      ),
    /non-empty/,
  );
  await temporary(async (directory) => {
    const file = path.join(directory, 'demo.mdx');
    await writeFile(file, source);
    await writeFile(path.join(directory, 'demo.tsx'), 'export function Demo() { return null; }');
    const document = await readComponentDocument(file);
    assert.match(document.examples[0].markdown, /export function Controlled/);
    assert.match(document.examples[0].markdown, /Keep this trailing responsibility/);
    assert.doesNotMatch(document.examples[0].markdown, /leaf:example/);
  });
});

test('reference links retain their original definitions even when the definition lives outside the queried block', async () => {
  await temporary(async (directory) => {
    const file = path.join(directory, 'demo.mdx');
    const source = `${fixture
      .replace('Basic description.', 'Basic description with [a guide][guide].')
      .replace(
        'Use a controlled value.',
        'Use a controlled value with [the same guide][guide].',
      )}\n[guide]: ../guide/start "Start guide"\n`;
    await writeFile(file, source);
    await writeFile(path.join(directory, 'demo.tsx'), 'export function Demo() { return null; }');
    const document = await readComponentDocument(file);
    assert.match(document.basic, /\[guide\]: \.\.\/guide\/start "Start guide"/);
    assert.match(document.examples[0].markdown, /\[guide\]: \.\.\/guide\/start/);
    assert.throws(
      () =>
        parseComponentDocument(fixture.replace('Basic description.', 'Read [the guide][missing].')),
      /Missing reference definition missing/,
    );
    assert.throws(
      () => parseComponentDocument(`${source}\n[guide]: ./different\n`),
      /Conflicting reference definition/,
    );
  });
});

test('static download links and known withBase literals are converted without evaluating arbitrary expressions', async () => {
  await temporary(async (directory) => {
    const file = path.join(directory, 'demo.mdx');
    const source =
      "import { withBase as resourcePath } from '@rspress/core/runtime';\n" +
      fixture.replace(
        'Basic description.',
        "Basic description. Download <a href={resourcePath('/locales/en-US.json')} download>English JSON</a>.",
      );
    await writeFile(file, source);
    await writeFile(path.join(directory, 'demo.tsx'), 'export function Demo() { return null; }');
    const document = await readComponentDocument(file);
    assert.match(document.basic, /\[English JSON\]\(<\/locales\/en-US\.json>\)/);
    assert.doesNotMatch(document.basic, /<a|resourcePath/);
    assert.throws(
      () =>
        parseComponentDocument(
          source.replace("resourcePath('/locales/en-US.json')", 'resourcePath(getPath())'),
        ),
      /withBase with one literal/,
    );
    assert.throws(
      () =>
        parseComponentDocument(
          source.replace(
            "href={resourcePath('/locales/en-US.json')}",
            'href="javascript:alert(1)"',
          ),
        ),
      /Unsupported link URL/,
    );
    assert.ok(
      parseComponentDocument(
        source.replace("href={resourcePath('/locales/en-US.json')}", 'href="/locales/en-US.json"'),
      ),
    );
  });
});

test('example selection supports multiple indices, IDs and exact titles, deduplicating in request order', () => {
  const document = {
    examples: [
      { index: 1, id: 'first', title: 'First example', markdown: 'Full first block' },
      { index: 2, id: 'second', title: 'Second example', markdown: 'Full second block' },
    ],
  };
  assert.deepEqual(
    selectExamples(document, ['2', 'First example', 'second']).map(({ id }) => id),
    ['second', 'first'],
  );
  for (const selectors of [[], ['0'], ['3'], ['first', 'missing']])
    assert.throws(() => selectExamples(document, selectors));
  document.examples[1].title = 'First example';
  assert.throws(() => selectExamples(document, ['First example']), /ambiguous/);
});

test('real Menu and Select pilots retain all examples and complete original API tables in both languages', async () => {
  for (const slug of ['menu', 'select']) {
    const documents = [];
    for (const language of ['', 'en/']) {
      const file = path.join(repository, `apps/docs/docs/${language}components/${slug}.mdx`);
      const document = await readComponentDocument(file);
      documents.push(document);
      assert.equal(document.examples.length, slug === 'menu' ? 6 : 14);
      assert.equal(document.apiNames[0], document.primaryApi);
      for (const block of [document.basic, ...document.examples.map(({ markdown }) => markdown)]) {
        assert.doesNotMatch(block, /<ComponentExample|leaf:section|file="/);
        const code = /```tsx\n([\s\S]*?)\n```/.exec(block)?.[1];
        assert.ok(code);
        parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
      }
      const raw = await readFile(file, 'utf8');
      assert.equal(document.api, raw.slice(raw.indexOf('## API')).trim());
    }
    assert.deepEqual(
      documents[0].examples.map(({ id }) => id),
      documents[1].examples.map(({ id }) => id),
    );
    assert.deepEqual(documents[0].apiNames, documents[1].apiNames);
  }
});

test('build export produces detail and separate complete example files with workspace provenance', async () => {
  await temporary(async (output) => {
    const index = await exportComponentDocs({ repository, output });
    const expected = [];
    for (const prefix of ['', 'en/']) {
      const directory = path.join(repository, `apps/docs/docs/${prefix}components`);
      for (const name of await readdir(directory)) {
        if (!name.endsWith('.mdx')) continue;
        const source = await readFile(path.join(directory, name), 'utf8');
        if (parseComponentDocument(source, path.join(directory, name)))
          expected.push(`${prefix ? 'en' : 'zh'}/${name.slice(0, -4)}/detail.json`);
      }
    }
    assert.deepEqual(index.components.map(({ document }) => document).sort(), expected.sort());
    for (const language of ['zh', 'en'])
      for (const slug of ['menu', 'select'])
        assert.ok(expected.includes(`${language}/${slug}/detail.json`));
    assert.equal(index.sourceKind, 'workspace');
    assert.equal(index.sourceCommit, null);
    for (const item of index.components) {
      const detail = JSON.parse(await readFile(path.join(output, 'ai/v1', item.document), 'utf8'));
      assert.equal(detail.package, index.package);
      assert.equal(detail.version, index.version);
      assert.equal(detail.primaryApi, detail.apiNames[0]);
      assert.ok(detail.basic.includes('```tsx'));
      for (const example of detail.examples) {
        assert.equal('markdown' in example, false);
        const full = JSON.parse(
          await readFile(path.join(output, 'ai/v1', example.document), 'utf8'),
        );
        assert.equal(full.id, example.id);
        assert.match(full.markdown, /```(?:tsx|ts|jsx|js|diff)/);
      }
    }
  });
});
