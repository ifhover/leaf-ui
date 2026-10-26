import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parse } from '@babel/parser';
import { versionTarget } from '../src/components/version-path.ts';
import {
  apiDefaultCell,
  apiSectionMatch,
  orderApiSections,
  properties,
  readApiRows,
  removeDuplicateApiSections,
  replaceApiTable,
} from './api-model.mjs';
import { rehypeApiTypes } from './api-type-display.mjs';
import {
  extractExampleMarkdown,
  extractExampleSource,
  localizeExampleSource,
  remarkExampleSource,
} from './example-source.mjs';

test('API type links keep one code expression without changing links or other cells', () => {
  const text = (value) => ({ type: 'text', value });
  const element = (tagName, children, properties = {}) => ({
    type: 'element',
    tagName,
    children,
    properties,
  });
  const code = (value) => element('code', [text(value)]);
  const reference = (name, href) => element('a', [code(name)], { href });
  for (const label of ['Type', '类型']) {
    const type = element('td', [
      code('Partial<Omit<'),
      reference('InputProps', '/components/input#input-api'),
      code(", 'key' | 'ref'>> | "),
      reference('LeafTheme', '#leaftheme'),
    ]);
    const property = element('td', [code('Input')]);
    const description = element('td', [reference('InputProps', '/components/input#input-api')]);
    const unrelated = structuredClone(description);
    const tree = element('table', [
      element('thead', [
        element('tr', [
          element('th', [text('Property')]),
          element('th', [text(label)]),
          element('th', [text('Description')]),
        ]),
      ]),
      element('tbody', [element('tr', [property, type, description])]),
    ]);
    rehypeApiTypes()(tree);
    assert.deepEqual(tree.properties.className, ['leaf-api-table']);
    assert.equal(type.children.length, 1);
    const expression = type.children[0];
    assert.equal(expression.tagName, 'code');
    assert.deepEqual(
      expression.children
        .filter((node) => node.tagName === 'a')
        .map((node) => node.properties.href),
      ['/components/input#input-api', '#leaftheme'],
    );
    assert.equal(
      expression.children
        .map((node) => (node.type === 'text' ? node.value : node.children[0].value))
        .join(''),
      "Partial<Omit<InputProps, 'key' | 'ref'>> | LeafTheme",
    );
    assert.equal(
      expression.children.some(
        (node) => node.tagName === 'code' || node.children?.some((part) => part.tagName === 'code'),
      ),
      false,
    );
    assert.deepEqual(property.children, [code('Input')]);
    assert.deepEqual(description, unrelated);
    const once = structuredClone(tree);
    rehypeApiTypes()(tree);
    assert.deepEqual(tree, once);
  }
});

test('example language props and translation helpers disappear while real locale state remains', () => {
  const source = `import { Button } from '@ifhover/leaf-ui';
export function Demo({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => english ? en : zh;
  return <Button aria-label={english ? 'Save changes' : '保存修改'}>{t('保存', 'Save')}</Button>;
}
export function LocaleDemo() {
  const [english, setEnglish] = useState(false);
  return <Switch checked={english} onChange={() => setEnglish(!english)} />;
}`;
  for (const english of [false, true]) {
    const code = extractExampleSource(source, 'Demo', { english });
    parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
    assert.doesNotMatch(code, /english|const t\s*=|\bt\(/);
    assert.match(code, english ? /Save changes/ : /保存修改/);
    assert.doesNotMatch(code, english ? /保存/ : /Save/);
  }
  assert.match(localizeExampleSource(source), /checked=\{english\}/);
  const nested =
    'export function Demo({ english = false }) { return <p>{english ? "A" : !english ? "乙" : "B"}</p>; }';
  assert.match(extractExampleSource(nested, 'Demo'), /"乙"/);
});

import { exportAiDocs, publicApi, walkFiles } from './export-ai-docs.mjs';

test('example code keeps only the selected preview and its scoped dependencies', () => {
  const source = `import { Button, Input, type ButtonProps } from '@ifhover/leaf-ui';
import { useState } from 'react';
import './demo.scss';
type Settings = { tone: ButtonProps['variant'] };
const initial: Settings = { tone: 'outline' }, unused = 'Unused constant';
function format(value: string) { return value.toUpperCase(); }
export function OtherDemo() { return <Input />; }
export function ActiveDemo() {
  const [label] = useState('Save');
  const OtherDemo = 'local variable';
  return <Button variant={initial.tone} title={OtherDemo}>{format(label)}</Button>;
}`;
  const selected = extractExampleSource(source, 'ActiveDemo');
  assert.match(selected, /from '@ifhover\/leaf-ui';\nimport \{ useState \}/);
  assert.match(selected, /type ButtonProps/);
  assert.match(selected, /type Settings/);
  assert.match(selected, /function format/);
  assert.match(selected, /const OtherDemo = 'local variable'/);
  assert.match(selected, /import '\.\/demo.scss'/);
  assert.doesNotMatch(selected, /function OtherDemo|Unused constant|\bInput\b/);
  parse(selected, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  assert.throws(() => extractExampleSource(source, 'MissingDemo'), /Example export not found/);
});

test('rendered and AI example code resolve aliases to the same export', () => {
  const source =
    'export function First() { return <span>First</span>; }\nexport function Second() { return <span>Second</span>; }';
  const mdx = `import { First as Preview } from './basic';\n\n<ComponentExample title="Demo" preview={<Preview />} fileName="basic.tsx">\n\n\`\`\`tsx file="./basic.tsx"\n\`\`\`\n\n</ComponentExample>`;
  const markdown = `\`\`\`tsx file="./basic.tsx"\n${source}\n\`\`\``;
  const extracted = extractExampleMarkdown(markdown, mdx);
  assert.match(extracted, /function First/);
  assert.doesNotMatch(extracted, /function Second/);
  const code = { type: 'code', lang: 'tsx', meta: 'file="./basic.tsx"', value: source };
  const tree = {
    children: [
      { type: 'mdxjsEsm', value: "import { First as Preview } from './basic';" },
      {
        type: 'mdxJsxFlowElement',
        name: 'ComponentExample',
        attributes: [{ name: 'preview', value: { value: '<Preview />' } }],
        children: [code],
      },
    ],
  };
  remarkExampleSource()(tree);
  assert.equal(code.value.trim(), extractExampleSource(source, 'First').trim());
});

test('rendered and AI example code agree on static preview language props', () => {
  const source = `export function First({ english = false }: { english?: boolean }) {
  return <span>{english ? 'English' : 'Chinese'}</span>;
}`;
  for (const [preview, english] of [
    ['<Preview />', false],
    ['<Preview english />', true],
    ['<Preview english={true} />', true],
    ['<Preview english={false} />', false],
    ['<Preview title="english " />', false],
  ]) {
    const mdx = `import { First as Preview } from './basic';

<ComponentExample preview={${preview}} width={360} fileName="basic.tsx">

\`\`\`tsx file="./basic.tsx"
\`\`\`

</ComponentExample>`;
    const markdown = `\`\`\`tsx file="./basic.tsx"\n${source}\n\`\`\``;
    const expected = extractExampleSource(source, 'First', { english }).trim();
    const code = { type: 'code', lang: 'tsx', meta: 'file="./basic.tsx"', value: source };
    const tree = {
      children: [
        { type: 'mdxjsEsm', value: "import { First as Preview } from './basic';" },
        {
          type: 'mdxJsxFlowElement',
          name: 'ComponentExample',
          attributes: [{ name: 'preview', value: { value: preview } }],
          children: [code],
        },
      ],
    };
    remarkExampleSource()(tree);
    assert.equal(code.value.trim(), expected, preview);
    assert.equal(
      extractExampleMarkdown(markdown, mdx),
      `\`\`\`tsx file="./basic.tsx"\n${expected}\n\`\`\``,
      preview,
    );
    assert.match(expected, english ? /'English'/ : /'Chinese'/);
    assert.doesNotMatch(expected, english ? /'Chinese'/ : /'English'/);
  }
});

test('rendered and AI examples reject ambiguous or dynamic preview language props', () => {
  const source = 'export function First() { return <span />; }';
  for (const preview of [
    '<First english={language} />',
    '<First english="false" />',
    '<First english={undefined} />',
    '<First {...props} />',
    '<First english english={false} />',
    '<><First english /><First english={false} /></>',
  ]) {
    const message = /literal boolean|spread or duplicate|different english values/;
    const code = { type: 'code', lang: 'tsx', meta: 'file="./basic.tsx"', value: source };
    const tree = {
      children: [
        {
          type: 'mdxJsxFlowElement',
          name: 'ComponentExample',
          attributes: [{ name: 'preview', value: { value: preview } }],
          children: [code],
        },
      ],
    };
    const mdx = `<ComponentExample preview={${preview}} fileName="basic.tsx">

\`\`\`tsx file="./basic.tsx"
\`\`\`

</ComponentExample>`;
    assert.throws(() => remarkExampleSource()(tree), message, preview);
    assert.throws(
      () => extractExampleMarkdown(`\`\`\`tsx file="./basic.tsx"\n${source}\n\`\`\``, mdx),
      message,
      preview,
    );
  }
});

test('every component preview has a valid, independently extracted code sample', async () => {
  const directory = path.resolve(import.meta.dirname, '../docs');
  let count = 0;
  for (const file of (await walkFiles(directory)).filter((candidate) =>
    candidate.endsWith('.mdx'),
  )) {
    const document = await readFile(file, 'utf8');
    for (const example of document.matchAll(/<ComponentExample\b[\s\S]*?<\/ComponentExample>/g)) {
      for (const fence of example[0].matchAll(
        /```(?:tsx|ts|jsx|js)[^\n]*\bfile="([^"]+)"[^\n]*\n[\s\S]*?```/g,
      )) {
        const source = await readFile(path.resolve(path.dirname(file), fence[1]), 'utf8');
        const markdown = `${fence[0].slice(0, fence[0].indexOf('\n'))}\n${source}\n\`\`\``;
        try {
          const extracted = extractExampleMarkdown(
            markdown,
            document.slice(0, document.indexOf('<ComponentExample')) + example[0],
          );
          const code = extracted.slice(extracted.indexOf('\n') + 1, extracted.lastIndexOf('\n```'));
          assert.doesNotMatch(
            code,
            /\{\s*english\s*=|english\s*\?:/,
            'No documentation-only language API',
          );
          assert.doesNotMatch(
            code,
            /from\s+['"]\./,
            'Copied examples have no missing local modules',
          );
          parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
          });
        } catch (error) {
          throw new Error(`${file}: ${fence[1]}: ${error.message}`, { cause: error });
        }
        count++;
      }
    }
  }
  assert.ok(count > 400, `Expected all component examples, received ${count}`);
  const basic = await readFile(path.resolve(directory, '../src/examples/table/basic.tsx'), 'utf8');
  assert.doesNotMatch(
    extractExampleSource(basic, 'TableBasic'),
    /TableStates|TableSimple|useState|<Table[\s.>]/,
  );
  assert.match(extractExampleSource(basic, 'TableBasic'), /<DataTable/);
});

test('merged mode APIs deduplicate top-level unions without breaking callback signatures', async () => {
  const entry = path.resolve(import.meta.dirname, '../../../packages/react/src/index.ts');
  const input = await properties(entry, 'InputNumberProps');
  assert.equal(input.get('value').type, 'number | null | string');
  assert.match(input.get('onChange').type, /\(value: number \| null\) => void/);
  assert.match(input.get('onChange').type, /\(value: string \| null\) => void/);
  const tree = await properties(entry, 'TreeSelectProps');
  assert.equal(tree.get('value').type, 'string | null | readonly string[]');
});

test('component defaults stay scoped to their own function rather than sibling components', async () => {
  const entry = path.resolve(import.meta.dirname, '../../../packages/react/src/index.ts');
  assert.equal((await properties(entry, 'TextProps')).get('underline').defaultValue, undefined);
  assert.equal(
    (await properties(entry, 'ParagraphProps')).get('underline').defaultValue,
    undefined,
  );
  assert.equal((await properties(entry, 'LinkProps')).get('underline').defaultValue, 'true');
});

import {
  installPlatform,
  loadPublishedReleases,
  mergePublishedReleases,
  platformFiles,
  publishedReleases,
  redirectPage,
} from './build-versioned-site.mjs';

test('API tables retain data-type descriptions and split grouped defaults correctly', () => {
  const rows = readApiRows(
    '| `node` | `TreeNode` | Operated node |\n| `multiple / selectable` | `boolean` | `false / true` | Allow multiple / selection |\n| `filter` | `string \\| false` | — | Custom filter |',
  );
  assert.deepEqual(rows.get('node'), {
    type: '`TreeNode`',
    defaultValue: '—',
    description: 'Operated node',
  });
  assert.equal(rows.get('multiple').defaultValue, '`false`');
  assert.equal(rows.get('selectable').defaultValue, '`true`');
  assert.equal(rows.get('filter').description, 'Custom filter');
});

test('API section lookup keeps the first table in document order and removes duplicates', () => {
  const document = [
    '# Demo',
    '',
    '## Types',
    '',
    '### DemoOption',
    '',
    '| Property | Type | Default | Description |',
    '| --- | --- | --- | --- |',
    '| `value` | `string` | Required | First table |',
    '',
    '## Usage',
    '',
    'Use the option type.',
    '',
    '## DemoOption',
    '',
    '| Property | Type | Default | Description |',
    '| --- | --- | --- | --- |',
    '| `value` | `string` | — | Duplicate table |',
  ].join('\n');
  const single =
    '## DemoOption\n\n| Property | Type | Description |\n| --- | --- | --- |\n| `value` | `string` | Single table |';
  assert.equal(
    removeDuplicateApiSections(single, ['DemoOption']).match(/^## DemoOption$/gmu)?.length,
    1,
  );
  assert.equal(apiSectionMatch(document, 'DemoOption').heading, 'DemoOption');
  assert.match(apiSectionMatch(document, 'DemoOption').match[0], /First table/u);
  const cleaned = removeDuplicateApiSections(document, ['DemoOption']);
  assert.equal(cleaned.match(/^#{2,6} DemoOption\r?$/gmu)?.length, 1);
  assert.match(cleaned, /First table/u);
  assert.doesNotMatch(cleaned, /Duplicate table/u);
});

test('API section lookup preserves wrappers around nested prop tables', () => {
  for (const newline of ['\n', '\r\n']) {
    const document = [
      '# Avatar',
      '',
      '## AvatarGroup API',
      '',
      'Group properties.',
      '',
      '### AvatarGroupProps API',
      '',
      '| Property | Type | Default | Description |',
      '| --- | --- | --- | --- |',
      '| `shape` | `string` | — | Avatar shape |',
      '',
      '## Avatar API',
      '',
      'Avatar properties.',
    ].join(newline);
    const found = apiSectionMatch(document, 'AvatarGroupProps');
    assert.equal(found.heading, 'AvatarGroupProps API');
    assert.equal(readApiRows(found.match[2]).get('shape').description, 'Avatar shape');
    const cleaned = removeDuplicateApiSections(document, ['AvatarGroupProps']);
    assert.equal(cleaned, document);
    assert.equal(
      readApiRows(apiSectionMatch(cleaned, 'AvatarGroupProps').match[2]).get('shape').description,
      'Avatar shape',
    );
    assert.equal(removeDuplicateApiSections(cleaned, ['AvatarGroupProps']), cleaned);
  }
});

test('API section ordering preserves complete blocks and non-API context across heading levels and line endings', () => {
  const names = ['GridProps', 'RowProps', 'ColProps'];
  for (const newline of ['\n', '\r\n']) {
    for (let level = 2; level <= 6; level++) {
      const heading = '#'.repeat(level);
      const prefix = ['# Grid', '', 'Introduction.', '', '## API', '', ''].join(newline);
      const col = [
        `${heading} ColProps API`,
        '',
        'Column description.',
        '',
        '| Property | Description |',
        '| --- | --- |',
        '| `span` | Column span |',
        ...(level < 6 ? ['', `${heading}# Details`, '', 'Column details.'] : []),
        '',
        '',
      ].join(newline);
      const context = [`${heading} Notes`, '', 'Keep unrelated notes here.', '', ''].join(newline);
      const grid = [`${heading} Grid API`, '', 'Grid description.', '', ''].join(newline);
      const row = [`${heading} RowProps`, '', 'Row description.', '', ''].join(newline);
      const suffix = ['# Footer', '', 'Keep footer.', ''].join(newline);
      const document = prefix + col + context + grid + row + suffix;
      const ordered = orderApiSections(document, names);
      assert.equal(ordered, prefix + grid + context + row + col + suffix);
      for (const name of names) {
        assert.equal(
          apiSectionMatch(ordered, name).match[0],
          apiSectionMatch(document, name).match[0],
        );
      }
      assert.equal(orderApiSections(ordered, names), ordered);
    }
  }
});

test('API section ordering ignores missing names and repeated names or aliases', () => {
  const col = '### ColProps API\n\nColumn description.\n\n';
  const grid = '### Grid API\n\nGrid description.\n\n';
  const row = '### Row API\n\nRow description.\n\n';
  const document = col + grid + row;
  assert.equal(
    orderApiSections(document, [
      'MissingProps',
      'GridProps',
      'GridProps',
      'Grid',
      'RowProps',
      'ColProps',
    ]),
    grid + row + col,
  );
  assert.equal(orderApiSections(document, []), document);
  assert.equal(orderApiSections(document, ['MissingProps']), document);
  assert.equal(orderApiSections(document, ['GridProps', 'MissingProps']), document);
  assert.equal(
    orderApiSections('Plain document without API headings.', ['GridProps']),
    'Plain document without API headings.',
  );
});

test('API section ordering preserves safe mixed-level blocks without moving surrounding prose', () => {
  const names = ['GridProps', 'RowProps', 'ColProps'];
  for (const newline of ['\n', '\r\n']) {
    const prefix = ['# Grid', '', 'Introduction.', '', ''].join(newline);
    const col = ['#### Col API', '', 'Column description.', '', ''].join(newline);
    const firstContext = ['## Notes', '', 'Keep first notes.', '', ''].join(newline);
    const grid = ['### GridProps API', '', 'Grid description.', '', ''].join(newline);
    const secondContext = ['## More notes', '', 'Keep second notes.', '', ''].join(newline);
    const row = ['##### RowProps', '', 'Row description.', '', ''].join(newline);
    const suffix = ['# Footer', '', 'Keep footer.', ''].join(newline);
    const document = prefix + col + firstContext + grid + secondContext + row + suffix;
    const ordered = orderApiSections(document, names);
    assert.equal(ordered, prefix + grid + firstContext + row + secondContext + col + suffix);
    assert.equal(orderApiSections(ordered, names), ordered);
  }
});

test('API section ordering leaves overlapping sections untouched', () => {
  const document =
    '## Grid API\n\nGrid description.\n\n### Row API\n\nNested row.\n\n## Col API\n\nColumn description.\n';
  assert.equal(orderApiSections(document, ['ColProps', 'RowProps', 'GridProps']), document);
});

test('API section ordering refuses moves that would swallow context or join an EOF body to a heading', () => {
  for (const document of [
    '## Col API\n\nColumn description.\n\n# Boundary\n\nKeep boundary.\n\n### Grid API\n\nGrid description.\n\n### Notes\n\nKeep notes.\n',
    '### Col API\n\nColumn description.\n\n### Grid API\n\nGrid description without a final newline.',
  ]) {
    assert.equal(orderApiSections(document, ['GridProps', 'ColProps']), document);
  }
});

test('API table replacement respects its offset and is idempotent with LF and CRLF', () => {
  const table = '| Property | Description |\n| --- | --- |\n| `value` | New value |';
  for (const newline of ['\n', '\r\n']) {
    const heading = `## DemoOption${newline}`;
    const body = [
      '',
      'Intro paragraph.',
      '',
      '| Property | Description |',
      '| --- | --- |',
      '| `value` | Old value |',
      '',
      'Trailing paragraph.',
    ].join(newline);
    const first = replaceApiTable(heading, body, table);
    assert.match(first, /Intro paragraph\./u);
    assert.match(first, /Trailing paragraph\./u);
    assert.doesNotMatch(first, /Old value/u);
    assert.equal(first.match(/\| `value` \|/gu)?.length, 1);
    assert.equal(replaceApiTable(heading, first.slice(heading.length), table), first);
  }
});

test('theme-token reference has one table and no duplicate properties for every public type', async () => {
  for (const locale of ['', 'en/']) {
    const document = await readFile(
      new URL(`../docs/${locale}api/theme-tokens.mdx`, import.meta.url),
      'utf8',
    );
    for (const name of [
      'LeafThemeTokens',
      'LeafComponentTokens',
      'LeafComponentStateTokens',
      'LeafThemeStyle',
    ]) {
      const body = apiSectionMatch(document, name)?.match[2] ?? '';
      assert.equal([...body.matchAll(/^\| (?:Property|属性) \|/gmu)].length, 1, `${locale}${name}`);
      const properties = [...body.matchAll(/^\| `([^`]+)` \|/gmu)].map((match) => match[1]);
      assert.equal(properties.length, new Set(properties).size, `${locale}${name}`);
    }
  }
});

test('optional API values are not marked required directly from declarations', async () => {
  const entry = path.resolve(import.meta.dirname, '../../../packages/react/src/index.ts');
  for (const [name, property] of [
    ['AutoCompleteProps', 'value'],
    ['CascaderProps', 'value'],
    ['SelectProps', 'value'],
    ['SliderProps', 'value'],
  ]) {
    const value = (await properties(entry, name)).get(property);
    assert.equal(value?.optional, true, `${name}.${property} should remain optional`);
  }
});

test('API defaults distinguish required, explicit, previous and absent values', () => {
  assert.equal(apiDefaultCell({ optional: false, english: true }), 'Required');
  assert.equal(apiDefaultCell({ optional: false, english: false }), '必填');
  assert.equal(apiDefaultCell({ optional: true, english: true }), '—');
  assert.equal(
    apiDefaultCell({ optional: true, english: true, previousDefault: '`previous`' }),
    '`previous`',
  );
  assert.equal(apiDefaultCell({ optional: false, english: true, override: '—' }), '—');
});

test('API defaults use the declared parameter type for composed table roots', async () => {
  const root = path.resolve(import.meta.dirname, '../../..');
  const adapter = path.join(root, 'packages/react/src/tabletanstack/index.ts');
  assert.equal((await properties(adapter, 'DataTableProps')).get('size').defaultValue, "'md'");
  assert.equal(
    (await properties(adapter, 'DataTableProps')).get('pagination').defaultValue,
    'true',
  );
  const props = await properties(adapter, 'DataTableProps');
  assert.equal(props.get('table').type, 'TanStackTable<TData>');
  assert.equal(props.get('toolbar').type, 'ReactNode');
  assert.equal(
    (await properties(adapter, 'DataTableInstanceProps')).get('size').defaultValue,
    "'md'",
  );
  assert.equal(
    (await properties(adapter, 'UseDataTableOptions')).get('pagination').defaultValue,
    'true',
  );
});

test('AI discovery publishes DataTable as the only table component at the canonical subpath', async () => {
  const root = path.resolve(import.meta.dirname, '../../..');
  const api = await publicApi(root);
  assert.ok(
    !api.some((item) =>
      /^Table(?:Props|Row|Cell|Body|Header|Footer|Caption|ColumnHeader|State|Empty|Loading|Error)?(?:Props)?$/.test(
        item.name,
      ),
    ),
  );
  assert.equal(api.find((item) => item.name === 'DataTable')?.importPath, '@ifhover/leaf-ui/table');
  assert.equal(api.find((item) => item.name === 'DataTableRowReorderInfo')?.kind, 'type');
  assert.equal(api.find((item) => item.name === 'DataTableRowProps')?.kind, 'type');
  assert.equal(api.find((item) => item.name === 'DataTableCellProps')?.kind, 'type');
  for (const name of [
    'useDataTable',
    'UseDataTableOptions',
    'DataTableInstanceProps',
    'DataTableRowKey',
    'DataTableColumnDef',
  ])
    assert.equal(api.find((item) => item.name === name)?.importPath, '@ifhover/leaf-ui/table');
});

test('AI discovery preserves native Table and adapter imports in historical snapshots', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'leaf-ui-table-api-test-'));
  try {
    await mkdir(path.join(root, 'packages/react/src/table'), { recursive: true });
    await mkdir(path.join(root, 'packages/react/src/tabletanstack'), { recursive: true });
    await writeFile(
      path.join(root, 'packages/react/package.json'),
      JSON.stringify({ name: '@sudden3/leaf-ui', version: '0.6.0' }),
    );
    await writeFile(
      path.join(root, 'packages/react/src/index.ts'),
      "export { Table } from './table';",
    );
    await writeFile(
      path.join(root, 'packages/react/src/table/index.ts'),
      "export { Table } from './table';",
    );
    await writeFile(
      path.join(root, 'packages/react/src/tabletanstack/index.ts'),
      "export { DataTable } from './tabletanstack';",
    );
    const api = await publicApi(root);
    assert.equal(api.find((item) => item.name === 'Table')?.importPath, '@sudden3/leaf-ui');
    assert.equal(
      api.find((item) => item.name === 'DataTable')?.importPath,
      '@sudden3/leaf-ui/table/tanstack',
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('scoped component defaults retain public discovery and built-in API defaults', async () => {
  const root = path.resolve(import.meta.dirname, '../../..');
  const entry = path.join(root, 'packages/react/src/index.ts');
  const api = await publicApi(root);
  assert.equal(api.find((item) => item.name === 'LeafComponentDefaults')?.kind, 'type');
  assert.ok(!api.some((item) => item.name === 'LeafMessages'));
  const config = await properties(entry, 'ConfigProviderProps');
  assert.equal(config.get('components').type, 'LeafComponentDefaults');
  assert.ok(!config.has('messages') && !config.has('textMessages'));
  assert.equal((await properties(entry, 'ButtonProps')).get('size').defaultValue, "'md'");
  assert.equal((await properties(entry, 'InputProps')).get('size').defaultValue, "'md'");
  assert.equal((await properties(entry, 'InputProps')).get('allowClear').defaultValue, 'false');
  assert.equal((await properties(entry, 'InputSearchProps')).get('loading').defaultValue, 'false');
  assert.equal((await properties(entry, 'SelectProps')).get('size').defaultValue, "'md'");
  const defaults = await properties(entry, 'LeafComponentDefaults');
  for (const name of ['Button', 'Input', 'InputSearch', 'Select', 'Modal'])
    assert.match(defaults.get(name).type, /\| null/u);
  assert.match(defaults.get('Select').type, /'options'/u);
  assert.match(defaults.get('Modal').type, /'open'/u);
  assert.equal((await properties(entry, 'ModalProps')).get('width').defaultValue, '480');
});

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
      '0.3.0',
    ),
    { href: '/leaf-ui/v/0.2.0/en/components/button.html#button-api', exact: true },
  );
  assert.equal(
    versionTarget('/leaf-ui/', '/leaf-ui/en/components/button', '#button-api', release, '0.3.0')
      .href,
    '/leaf-ui/v/0.2.0/en/components/button.html#button-api',
  );
  assert.equal(
    versionTarget('/', '/v/0.3.0/components/', '', release, '0.3.0').href,
    '/v/0.2.0/components/index.html',
  );
});

test('latest version uses the root URL when returning from an older version', () => {
  const release = {
    version: '0.3.0',
    pages: ['en/components/button.html', 'components/index.html', 'index.html'],
  };
  assert.deepEqual(
    versionTarget(
      '/leaf-ui/',
      '/leaf-ui/v/0.2.0/en/components/button.html',
      '#button-api',
      release,
      '0.3.0',
    ),
    { href: '/leaf-ui/en/components/button.html#button-api', exact: true },
  );
  assert.equal(
    versionTarget('/leaf-ui/', '/leaf-ui/components/', '', release, '0.3.0').href,
    '/leaf-ui/components/index.html',
  );
  assert.equal(
    versionTarget('/leaf-ui/', '/leaf-ui/v/0.2.0/components/missing.html', '#api', release, '0.3.0')
      .href,
    '/leaf-ui/components/index.html',
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
    versionTarget(
      '/leaf-ui/',
      '/leaf-ui/v/0.3.0/en/components/menu.html',
      '#menu-api',
      release,
      '0.3.0',
    ),
    { href: '/leaf-ui/v/0.1.0/components/index.html', exact: false },
  );
  assert.equal(
    versionTarget(
      '/leaf-ui/',
      '/leaf-ui/v/0.3.0/en/components/button.html',
      '#api',
      release,
      '0.3.0',
    ).href,
    '/leaf-ui/v/0.1.0/components/button.html',
  );
  assert.equal(
    versionTarget('/leaf-ui/', '/leaf-ui/v/0.3.0/guide/ssr.html', '', release, '0.3.0').href,
    '/leaf-ui/v/0.1.0/guide/introduction.html',
  );
});

test('versions are discovered from published npm metadata and source commits', () => {
  const sha = 'a'.repeat(40);
  const data = {
    name: '@sudden3/leaf-ui',
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
  assert.match(redirectPage('/leaf-ui/components/index.html'), /location.search\+location.hash/);
});

for (const [packageName, version] of [
  ['@sudden3/leaf-ui', '0.1.0'],
  ['@ifhover/leaf-ui', '0.5.0'],
])
  test(`AI export uses ${packageName} metadata from its isolated snapshot`, async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'leaf-ui-export-test-'));
    const output = path.join(root, 'output');
    try {
      await mkdir(path.join(root, 'packages/react/src'), { recursive: true });
      await mkdir(path.join(output, 'components'), { recursive: true });
      await mkdir(path.join(root, 'apps/docs/docs/components'), { recursive: true });
      await mkdir(path.join(output, 'en/components'), { recursive: true });
      await writeFile(
        path.join(root, 'packages/react/package.json'),
        JSON.stringify({ name: packageName, version }),
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
      const source =
        'export function First() { return <span>First</span>; }\nexport function Second() { return <span>Second</span>; }';
      const document =
        'import { First as Preview } from \'./basic\';\n\n<ComponentExample title="Demo" preview={<Preview />} fileName="basic.tsx">\n\n```tsx file="./basic.tsx"\n```\n\n</ComponentExample>';
      await writeFile(path.join(root, 'apps/docs/docs/components/button.mdx'), document);
      await writeFile(
        path.join(output, 'components/button.md'),
        `# Button\n\n\`\`\`tsx file="./basic.tsx"\n${source}\n\`\`\``,
      );
      await writeFile(path.join(output, 'en/components/textarea.md'), '# Textarea English\n');
      await writeFile(path.join(output, 'llms-full.txt'), 'Stale bundle');
      await writeFile(path.join(output, 'en/llms-full.txt'), 'Stale bundle');
      // Run from the staged historical snapshot, which has no current workspace dependencies.
      const scripts = platformFiles.filter(
        (file) =>
          file.startsWith('apps/docs/scripts/') && !file.endsWith('build-versioned-site.mjs'),
      );
      for (const file of scripts) {
        const target = path.join(root, file);
        await mkdir(path.dirname(target), { recursive: true });
        await cp(new URL(`../../../${file}`, import.meta.url), target);
      }
      execFileSync(
        process.execPath,
        [path.join(root, 'apps/docs/scripts/export-ai-docs.mjs'), root, output],
        {
          env: {
            ...process.env,
            LEAF_DOCS_BASE: `/leaf-ui/v/${version}/`,
            LEAF_DOCS_SOURCE_COMMIT: 'a'.repeat(40),
            LEAF_DOCS_EXAMPLE_SOURCE: new URL('./example-source.mjs', import.meta.url).href,
          },
          stdio: 'pipe',
        },
      );
      const result = JSON.parse(await readFile(path.join(output, 'api/index.json'), 'utf8'));
      assert.equal(result.package, packageName);
      assert.equal(result.version, version);
      assert.ok(result.exports.every((entry) => entry.importPath === packageName));
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
        new RegExp(
          `https://ifhover.github.io/leaf-ui/v/${version.replaceAll('.', '\\.')}/components/button.html`,
        ),
      );
      assert.equal(
        await readFile(path.join(output, 'llm.txt'), 'utf8'),
        await readFile(path.join(output, 'llms.txt'), 'utf8'),
      );
      assert.match(
        await readFile(path.join(output, 'llm.txt'), 'utf8'),
        new RegExp(`/v/${version.replaceAll('.', '\\.')}/api/index.json`),
      );
      const code = await readFile(path.join(output, 'components/button.md'), 'utf8');
      assert.ok(code.startsWith(`> Leaf UI ${version} · Package: ${packageName} · Source: `));
      assert.match(code, /function First/);
      assert.doesNotMatch(code, /function Second/);
      const bundle = await readFile(path.join(output, 'llms-full.txt'), 'utf8');
      assert.ok(bundle.includes(`Leaf UI ${version} · Package: ${packageName}`));
      assert.match(bundle, /function First/);
      assert.doesNotMatch(bundle, /function Second|Textare[a] English|Stale bundle/);
      assert.match(
        await readFile(path.join(output, 'en/llms-full.txt'), 'utf8'),
        /Textarea English/,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

test('AI references own configuration types without changing historical snapshot destinations', async () => {
  for (const separateReferences of [false, true]) {
    const root = await mkdtemp(path.join(tmpdir(), 'leaf-ui-reference-test-'));
    const output = path.join(root, 'output');
    try {
      await mkdir(path.join(root, 'packages/react/src'), { recursive: true });
      await writeFile(
        path.join(root, 'packages/react/package.json'),
        JSON.stringify({ name: '@ifhover/leaf-ui', version: '0.5.0' }),
      );
      await writeFile(
        path.join(root, 'packages/react/src/index.ts'),
        [
          "export { Button } from './button';",
          "export { ConfigProvider } from './config-provider';",
          "export type { LeafComponentDefaults } from './config-provider';",
          "export type { LeafThemeTokens } from './theme';",
          "export type { LeafComponentTokens, LeafThemeStyle } from './theme';",
          "export type { PopupOptions } from './shared/floating';",
          ...(separateReferences
            ? ["export type { LeafTranslation, LeafTranslations } from './locales/types';"]
            : []),
          ...(separateReferences
            ? []
            : ["export type { LeafMessages } from './config-provider/context';"]),
        ].join('\n'),
      );
      const references = {
        LeafComponentDefaults: 'api/component-defaults',
        LeafThemeTokens: 'api/theme-tokens',
        LeafComponentTokens: 'api/theme-tokens',
        LeafThemeStyle: 'api/theme-tokens',
        PopupOptions: 'api/popup-options',
        ...(separateReferences
          ? { LeafTranslation: 'api/translations', LeafTranslations: 'api/translations' }
          : {}),
        ...(!separateReferences ? { LeafMessages: 'components/config-provider' } : {}),
      };
      for (const prefix of ['', 'en/']) {
        const pages = {
          'components/button': '# Button\n',
          'components/config-provider': '# ConfigProvider\n',
          'guide/theming': '# Theming\n',
          ...(!separateReferences ? { 'guide/control-contracts': '# Popup contracts\n' } : {}),
          ...(separateReferences
            ? Object.fromEntries(
                Object.entries(references).map(([name, page]) => [page, `# ${name}\n`]),
              )
            : {}),
        };
        for (const [page, content] of Object.entries(pages)) {
          const file = path.join(output, `${prefix}${page}.md`);
          await mkdir(path.dirname(file), { recursive: true });
          await writeFile(file, content);
        }
      }
      await mkdir(path.join(output, 'api'), { recursive: true });
      await writeFile(path.join(output, 'api/index.html'), '<h1>API reference</h1>');
      await writeFile(path.join(output, 'llms.txt'), '# Leaf UI\n');
      const resources = [
        'en-US.json',
        'zh-CN.json',
        'zh-TW.json',
        'ja-JP.json',
        'ko-KR.json',
        'schema.json',
      ];
      if (separateReferences) {
        await mkdir(path.join(root, 'packages/react/src/locales'), { recursive: true });
        for (const name of resources)
          await writeFile(
            path.join(root, 'packages/react/src/locales', name),
            JSON.stringify({ snapshot: '0.5.0', file: name }),
          );
      }
      const index = await exportAiDocs({
        repository: root,
        output,
        base: '/leaf-ui/v/0.5.0/',
        sourceCommit: 'b'.repeat(40),
      });
      for (const [name, reference] of Object.entries(references)) {
        for (const language of ['zh', 'en']) {
          const owners = index.pages.filter(
            (page) =>
              page.language === language && page.symbols.some((symbol) => symbol.name === name),
          );
          assert.deepEqual(
            owners.map((page) => page.id),
            [
              separateReferences
                ? reference
                : ['LeafThemeTokens', 'LeafComponentTokens', 'LeafThemeStyle'].includes(name)
                  ? 'guide/theming'
                  : name === 'PopupOptions'
                    ? 'guide/control-contracts'
                    : 'components/config-provider',
            ],
          );
          if (separateReferences) {
            const markdown = await readFile(path.join(output, owners[0].markdown), 'utf8');
            assert.ok(markdown.includes('Leaf UI 0.5.0 · Package: @ifhover/leaf-ui'));
            assert.ok(markdown.includes(`/v/0.5.0/${owners[0].html}`));
          }
        }
      }
      assert.equal(
        await readFile(path.join(output, 'api/index.html'), 'utf8'),
        '<h1>API reference</h1>',
      );
      assert.equal(
        JSON.parse(await readFile(path.join(output, 'api/index.json'), 'utf8')).version,
        '0.5.0',
      );
      for (const name of resources) {
        const file = path.join(output, 'locales', name);
        if (separateReferences)
          assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), {
            snapshot: '0.5.0',
            file: name,
          });
        else await assert.rejects(readFile(file), { code: 'ENOENT' });
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

const registryFixture = (name, version, commit = 'a'.repeat(40)) => ({
  name,
  'dist-tags': { latest: version },
  versions: { [version]: { name, gitHead: commit } },
  time: { [version]: '2026-10-11T00:00:00Z' },
});

test('new npm scope becomes default while legacy releases retain their package and source', () => {
  const current = publishedReleases(registryFixture('@ifhover/leaf-ui', '0.5.0', 'b'.repeat(40)));
  const legacy = publishedReleases(registryFixture('@sudden3/leaf-ui', '0.4.2'));
  const merged = mergePublishedReleases(current, legacy);
  assert.equal(merged.package, '@ifhover/leaf-ui');
  assert.equal(merged.latest, '0.5.0');
  assert.deepEqual(merged.versions, [...current.versions, ...legacy.versions]);
  assert.deepEqual(mergePublishedReleases(null, legacy), legacy);
  assert.throws(
    () =>
      mergePublishedReleases(
        publishedReleases(registryFixture('@ifhover/leaf-ui', '0.4.2')),
        legacy,
      ),
    /exists in both npm packages/,
  );
  assert.throws(
    () =>
      mergePublishedReleases(
        publishedReleases(registryFixture('@ifhover/leaf-ui', '0.3.1')),
        legacy,
      ),
    /must be higher than legacy 0.4.2/,
  );
});

test('unpublished or prerelease-only new package keeps the published default; registry failures are not hidden', async () => {
  const legacy = registryFixture('@sudden3/leaf-ui', '0.4.2');
  for (const current of [null, registryFixture('@ifhover/leaf-ui', '0.5.0-dev.1')]) {
    const requests = [];
    const manifest = await loadPublishedReleases(async (url) => {
      requests.push(url);
      return url.includes('@ifhover')
        ? current
          ? Response.json(current)
          : new Response('', { status: 404 })
        : Response.json(legacy);
    });
    assert.equal(manifest.package, '@sudden3/leaf-ui');
    assert.equal(manifest.latest, '0.4.2');
    assert.equal(manifest.versions.length, 1);
    assert.equal(requests.length, 2);
  }
  await assert.rejects(
    loadPublishedReleases(async (url) =>
      url.includes('@ifhover') ? new Response('', { status: 503 }) : Response.json(legacy),
    ),
    /503/,
  );
  await assert.rejects(
    loadPublishedReleases(async () => Response.json(legacy)),
    /package mismatch/,
  );
});

test('historical platform overlays resolve components and installation instructions from the snapshot package', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'leaf-ui-platform-test-'));
  try {
    for (const packageName of ['@sudden3/leaf-ui', '@ifhover/leaf-ui']) {
      const snapshot = path.join(root, packageName.slice(1).replace('/', '-'));
      const docs = path.join(snapshot, 'apps/docs');
      await mkdir(path.join(snapshot, 'packages/react'), { recursive: true });
      await mkdir(path.join(docs, 'theme'), { recursive: true });
      await mkdir(path.join(docs, 'docs/en'), { recursive: true });
      await writeFile(
        path.join(snapshot, 'packages/react/package.json'),
        JSON.stringify({ name: packageName, version: '0.5.0' }),
      );
      await writeFile(path.join(docs, 'docs/en/index.mdx'), '# Leaf UI');
      await writeFile(path.join(docs, 'rspress.config.ts'), 'export default {};');
      await writeFile(
        path.join(docs, 'theme/index.tsx'),
        'export function Layout() { return null; }',
      );
      await installPlatform(snapshot);
      const switcher = await readFile(
        path.join(docs, 'src/components/version-switcher.tsx'),
        'utf8',
      );
      assert.ok(switcher.includes(`from '${packageName}'`));
      for (const relative of ['docs/guide/ai.md', 'docs/en/guide/ai.md']) {
        assert.ok(
          (await readFile(path.join(docs, relative), 'utf8')).includes(`\`${packageName}\``),
        );
      }
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('AI infrastructure links use only design guides available in each snapshot locale', async (t) => {
  const repository = path.resolve(import.meta.dirname, '../../..');
  for (const scenario of [
    { name: 'old bilingual snapshot without design guides', guides: {} },
    { name: 'snapshot with both MDX guides', guides: { '': 'mdx', 'en/': 'mdx' } },
    { name: 'snapshot with both Markdown guides', guides: { '': 'md', 'en/': 'md' } },
    { name: 'snapshot with only the Chinese guide', guides: { '': 'mdx' } },
    { name: 'snapshot with only the English guide', guides: { 'en/': 'md' } },
    { name: 'Chinese-only snapshot', guides: {}, english: false },
  ]) {
    await t.test(scenario.name, async () => {
      const snapshot = await mkdtemp(path.join(tmpdir(), 'leaf-ui-guide-overlay-test-'));
      try {
        const docs = path.join(snapshot, 'apps/docs');
        await mkdir(path.join(snapshot, 'packages/react'), { recursive: true });
        await mkdir(path.join(docs, 'theme'), { recursive: true });
        await writeFile(
          path.join(snapshot, 'packages/react/package.json'),
          JSON.stringify({ name: '@sudden3/leaf-ui', version: '0.3.0' }),
        );
        await writeFile(path.join(docs, 'rspress.config.ts'), 'export default {};');
        await writeFile(
          path.join(docs, 'theme/index.tsx'),
          'export function Layout() { return null; }',
        );
        if (scenario.english !== false) {
          await mkdir(path.join(docs, 'docs/en'), { recursive: true });
          await writeFile(path.join(docs, 'docs/en/index.mdx'), '# Leaf UI');
        }
        for (const [locale, extension] of Object.entries(scenario.guides)) {
          const guide = path.join(docs, `docs/${locale}guide/design-standards.${extension}`);
          await mkdir(path.dirname(guide), { recursive: true });
          await writeFile(guide, `# Original ${locale || 'Chinese'} release guide\n`);
        }
        await installPlatform(snapshot);
        for (const [locale, label] of [
          ['', '界面设计与组合'],
          ['en/', 'Interface design and composition'],
        ]) {
          const relative = `apps/docs/docs/${locale}guide/ai.md`;
          const target = path.join(snapshot, relative);
          if (locale && scenario.english === false) {
            await assert.rejects(readFile(target), { code: 'ENOENT' });
            continue;
          }
          const source = (await readFile(path.join(repository, relative), 'utf8')).replaceAll(
            '@ifhover/leaf-ui',
            '@sudden3/leaf-ui',
          );
          const link = `[${label}](/${locale}guide/design-standards)`;
          assert.ok(source.includes(link));
          const extension = scenario.guides[locale];
          assert.equal(
            await readFile(target, 'utf8'),
            extension ? source : source.replaceAll(link, label),
          );
          for (const candidate of ['md', 'mdx']) {
            const guide = path.join(docs, `docs/${locale}guide/design-standards.${candidate}`);
            if (candidate === extension) {
              assert.equal(
                await readFile(guide, 'utf8'),
                `# Original ${locale || 'Chinese'} release guide\n`,
              );
            } else await assert.rejects(readFile(guide), { code: 'ENOENT' });
          }
        }
        assert.ok(
          !(await readFile(path.join(docs, 'rspress.config.ts'), 'utf8')).includes('deadLinks'),
        );
      } finally {
        await rm(snapshot, { recursive: true, force: true });
      }
    });
  }
});
