import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { readComponentDocument } from './component-document.mjs';
import { exportComponentDocs, resolveComponentDocumentLinks } from './export-component-docs.mjs';

const repository = path.resolve(import.meta.dirname, '../../..');
const base = '/leaf-ui/v/0.9.0/';
const sourceUrl = `https://ifhover.github.io${base}en/components/demo.html`;

function document(markdown) {
  return {
    component: 'Demo',
    primaryApi: 'DemoProps',
    title: 'Demo',
    description: markdown,
    introduction: markdown,
    basic: markdown,
    api: markdown,
    apiNames: ['DemoProps'],
    examples: [{ id: 'other', index: 1, title: 'Other', markdown }],
  };
}

test('document links resolve against the version base and bilingual source page', () => {
  const markdown = [
    '[Related](button#button-api "Keep this title")',
    '[API](/api/popup-options?mode=all#placement)',
    '[English](/en/guide/installation#install)',
    '[Locale](</locales/en-US.json>)',
    '[Source page](./upload.mdx?mode=all#upload-api)',
    '[Markdown page](../guide/ai.md#usage)',
    '[Anchor](#demoprops-api)',
    '[Based](/leaf-ui/v/0.9.0/components/menu.html#menu-api)',
    '[Asset](/public/example?download=1)',
    '[Guide][guide]',
    '',
    '[guide]: ../guide/start "Reference title"',
  ].join('\n');
  const original = document(markdown);
  const resolved = resolveComponentDocumentLinks(original, { base, sourceUrl });
  const expected = [
    `[Related](https://ifhover.github.io${base}en/components/button.html#button-api "Keep this title")`,
    `[API](https://ifhover.github.io${base}api/popup-options.html?mode=all#placement)`,
    `[English](https://ifhover.github.io${base}en/guide/installation.html#install)`,
    `[Locale](<https://ifhover.github.io${base}locales/en-US.json>)`,
    `[Source page](https://ifhover.github.io${base}en/components/upload.html?mode=all#upload-api)`,
    `[Markdown page](https://ifhover.github.io${base}en/guide/ai.html#usage)`,
    `[Anchor](${sourceUrl}#demoprops-api)`,
    `[Based](https://ifhover.github.io${base}components/menu.html#menu-api)`,
    `[Asset](https://ifhover.github.io${base}public/example?download=1)`,
    '[Guide][guide]',
    '',
    `[guide]: https://ifhover.github.io${base}en/guide/start.html "Reference title"`,
  ].join('\n');
  for (const field of ['description', 'introduction', 'basic', 'api'])
    assert.equal(resolved[field], expected, field);
  assert.equal(resolved.examples[0].markdown, expected);
  assert.equal(original.basic, markdown, 'the raw extracted document is not mutated');
  assert.deepEqual(resolved.apiNames, original.apiNames);
  assert.deepEqual(resolveComponentDocumentLinks(resolved, { base, sourceUrl }), resolved);
});

test('external destinations, code, prose, labels and formatting remain unchanged', () => {
  const unchanged = [
    'Prose uses [an external link](https://example.com/a?b=1#c).',
    '[Email](mailto:hello@example.com) and [embedded](data:text/plain,hello).',
    '![Remote](//cdn.example.com/image.png "Remote title")',
    '<https://example.com/autolink>',
    '`[Inline code](/api/not-a-link)`',
    '',
    '```md',
    '[Fenced code](/api/not-a-link)',
    '[ref]: /guide/not-a-link',
    '```',
    '',
    '    [Indented code](/api/not-a-link)',
  ].join('\r\n');
  const original = document(unchanged);
  const resolved = resolveComponentDocumentLinks(original, { base, sourceUrl });
  assert.deepEqual(resolved, original);
});

test('nested labels, images, references and escaped destination parentheses are preserved', () => {
  const markdown = [
    '[A **nested [label]** and `](`](/api/popup-options "Title (kept)")',
    '![Image `](` and [brackets]](/public/diagram\\(small\\).svg "Image title")',
    '[![Nested image](/public/icon.svg)](menu#menu-api)',
    '[Escaped\\] label](/components/menu)',
    '[Reference][with\\]bracket]',
    '',
    '[with\\]bracket]: </en/api/translations> "Definition title"',
  ].join('\r\n');
  const resolved = resolveComponentDocumentLinks(document(markdown), { base, sourceUrl });
  const expected = markdown
    .replace('](/api/popup-options ', `](https://ifhover.github.io${base}api/popup-options.html `)
    .replace(
      '](/public/diagram\\(small\\).svg ',
      `](https://ifhover.github.io${base}public/diagram\\(small\\).svg `,
    )
    .replace('](/public/icon.svg)', `](https://ifhover.github.io${base}public/icon.svg)`)
    .replace(
      '](menu#menu-api)',
      `](https://ifhover.github.io${base}en/components/menu.html#menu-api)`,
    )
    .replace('](/components/menu)', `](https://ifhover.github.io${base}components/menu.html)`)
    .replace(
      '</en/api/translations>',
      `<https://ifhover.github.io${base}en/api/translations.html>`,
    );
  assert.equal(resolved.basic, expected);
});

test('root deployments work and an unrelated source URL cannot use a different base', () => {
  assert.equal(
    resolveComponentDocumentLinks(document('[API](/api/popup-options#placement)'), {
      sourceUrl: 'https://example.com/components/demo.html',
    }).basic,
    '[API](https://example.com/api/popup-options.html#placement)',
  );
  assert.throws(
    () => resolveComponentDocumentLinks(document(''), { base: 'relative/', sourceUrl }),
    /absolute documentation base/,
  );
  assert.throws(
    () => resolveComponentDocumentLinks(document(''), { base: '/other/', sourceUrl }),
    /inside the documentation base/,
  );
});

test('non-root exports resolve current ConfigProvider withBase links without changing extraction', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'leaf-component-links-'));
  try {
    await exportComponentDocs({ repository, output, base });
    for (const language of ['zh', 'en']) {
      const prefix = language === 'en' ? 'en/' : '';
      const raw = await readComponentDocument(
        path.join(repository, `apps/docs/docs/${prefix}components/config-provider.mdx`),
      );
      const original = raw.examples.find(({ id }) => id === 'translations').markdown;
      assert.ok(original.includes('(</locales/en-US.json>)'));
      const example = JSON.parse(
        await readFile(
          path.join(output, `ai/v1/${language}/config-provider/examples/translations.json`),
          'utf8',
        ),
      );
      assert.ok(
        example.markdown.includes(`(<https://ifhover.github.io${base}locales/en-US.json>)`),
      );
      assert.ok(
        example.markdown.includes(
          `(https://ifhover.github.io${base}${prefix}api/translations.html)`,
        ),
      );
      assert.equal(
        example.markdown,
        resolveComponentDocumentLinks(raw, { base, sourceUrl: example.source.url }).examples.find(
          ({ id }) => id === 'translations',
        ).markdown,
      );
      const fileList = JSON.parse(
        await readFile(path.join(output, `ai/v1/${language}/file-list/detail.json`), 'utf8'),
      );
      assert.ok(
        fileList.introduction.includes(
          `(https://ifhover.github.io${base}${prefix}components/upload.html)`,
        ),
        'existing MDX source links resolve to the published HTML page',
      );
    }
  } finally {
    assert.equal(path.dirname(path.resolve(output)), path.resolve(tmpdir()));
    await rm(output, { recursive: true, force: true });
  }
});
