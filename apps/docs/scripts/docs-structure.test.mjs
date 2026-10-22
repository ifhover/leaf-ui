import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const docsRoot = fileURLToPath(new URL('../', import.meta.url));
const componentDirs = [
  path.join(docsRoot, 'docs/components'),
  path.join(docsRoot, 'docs/en/components'),
];

// table.mdx is hand-maintained and intentionally reuses one source across several fences.
const SHARED_SOURCE_PAGES = new Set(['table.mdx']);

const GENERIC_TITLES = [
  '更多用法',
  '扩展用法',
  'More examples',
  'Extended features',
  'Interactive example',
];

async function componentPages() {
  const pages = [];
  for (const dir of componentDirs) {
    const entries = await readdir(dir);
    for (const entry of entries.filter((name) => name.endsWith('.mdx'))) {
      pages.push({
        dir,
        name: entry,
        relative: path.relative(docsRoot, path.join(dir, entry)).replaceAll('\\', '/'),
        text: await readFile(path.join(dir, entry), 'utf8'),
      });
    }
  }
  return pages;
}

function headings(text) {
  return text
    .split('\n')
    .filter((line) => /^#{1,6} /.test(line))
    .map((line) => line.replace(/^#+\s+/, '').trim());
}

test('component pages do not repeat a heading', async () => {
  const problems = [];
  for (const page of await componentPages()) {
    const seen = new Map();
    for (const title of headings(page.text)) {
      const count = (seen.get(title) ?? 0) + 1;
      seen.set(title, count);
      if (count === 2) {
        problems.push(`${page.relative}: "${title}"`);
      }
    }
  }
  assert.deepEqual(problems, [], `Repeated headings:\n${problems.join('\n')}`);
});

test('component pages do not use generic example titles', async () => {
  const problems = [];
  for (const page of await componentPages()) {
    for (const title of headings(page.text)) {
      if (GENERIC_TITLES.includes(title)) {
        problems.push(`${page.relative}: "${title}"`);
      }
    }
    for (const match of page.text.matchAll(/<ComponentExample\b[^>]*?title="([^"]+)"/g)) {
      if (GENERIC_TITLES.includes(match[1])) {
        problems.push(`${page.relative}: example title "${match[1]}"`);
      }
    }
  }
  assert.deepEqual(problems, [], `Generic example titles:\n${problems.join('\n')}`);
});

test('each code fence points at its own example source', async () => {
  const problems = [];
  for (const page of await componentPages()) {
    if (SHARED_SOURCE_PAGES.has(page.name)) {
      continue;
    }
    const counts = new Map();
    for (const match of page.text.matchAll(/file="([^"]+\.tsx)"/g)) {
      counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
    }
    for (const [source, count] of counts) {
      if (count > 1) {
        problems.push(`${page.relative}: ${source} used ${count} times`);
      }
    }
  }
  assert.deepEqual(problems, [], `Shared example sources:\n${problems.join('\n')}`);
});

test('color guides derive palette totals and document semantic foreground roles', async () => {
  const colorPages = [
    path.join(docsRoot, 'docs/guide/colors.mdx'),
    path.join(docsRoot, 'docs/en/guide/colors.mdx'),
  ];
  const themePages = [
    path.join(docsRoot, 'docs/guide/theming.mdx'),
    path.join(docsRoot, 'docs/en/guide/theming.mdx'),
  ];
  const paletteSource = await readFile(
    path.join(docsRoot, 'src/components/color-palette.tsx'),
    'utf8',
  );

  for (const page of colorPages) {
    const text = await readFile(page, 'utf8');
    assert.match(text, /PaletteVariableCount/u, `${page} must use the computed palette total`);
    assert.doesNotMatch(text, /\b(?:144|150)\b/u, `${page} must not hardcode the palette total`);
  }

  assert.match(
    paletteSource,
    /export function PaletteVariableCount\(\) \{\s*return fullPaletteCount;/u,
  );
  for (const token of [
    '--leaf-color-success-ink',
    '--leaf-color-warning-ink',
    '--leaf-color-danger-ink',
    '--leaf-color-info-ink',
    '--leaf-color-on-success',
    '--leaf-color-on-info',
  ]) {
    assert.match(paletteSource, new RegExp(token, 'u'));
  }

  for (const page of themePages) {
    const text = await readFile(page, 'utf8');
    for (const token of ['success-ink', 'warning-ink', 'danger-ink', 'info-ink']) {
      assert.match(text, new RegExp(token, 'u'), `${page} must document ${token}`);
    }
    for (const token of ['on-success', 'on-info']) {
      assert.match(text, new RegExp(token, 'u'), `${page} must document ${token}`);
    }
  }
});
