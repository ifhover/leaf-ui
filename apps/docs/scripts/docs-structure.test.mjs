import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { componentPageExceptions } from './export-component-docs.mjs';

const docsRoot = fileURLToPath(new URL('../', import.meta.url));
const componentDirs = [
  path.join(docsRoot, 'docs/components'),
  path.join(docsRoot, 'docs/en/components'),
];
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
      if (count === 2) problems.push(`${page.relative}: "${title}"`);
    }
  }
  assert.deepEqual(problems, [], `Repeated headings:\n${problems.join('\n')}`);
});

test('component pages do not use generic example titles', async () => {
  const problems = [];
  for (const page of await componentPages()) {
    for (const title of headings(page.text)) {
      if (GENERIC_TITLES.includes(title)) problems.push(`${page.relative}: "${title}"`);
    }
    for (const match of page.text.matchAll(/<ComponentExample\b[^>]*?title="([^"]+)"/g)) {
      if (GENERIC_TITLES.includes(match[1]))
        problems.push(`${page.relative}: example title "${match[1]}"`);
    }
  }
  assert.deepEqual(problems, [], `Generic example titles:\n${problems.join('\n')}`);
});

test('each code fence points at its own example source', async () => {
  const problems = [];
  for (const page of await componentPages()) {
    const counts = new Map();
    for (const match of page.text.matchAll(/file="([^"]+\.tsx)"/g)) {
      counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
    }
    for (const [source, count] of counts) {
      if (count > 1) problems.push(`${page.relative}: ${source} used ${count} times`);
    }
  }
  assert.deepEqual(problems, [], `Shared example sources:\n${problems.join('\n')}`);
});

test('component API references follow usage under one API heading', async () => {
  for (const page of await componentPages()) {
    if (componentPageExceptions.has(page.name)) continue;
    const api = /^## API\s*$/mu.exec(page.text);
    assert.ok(api, `${page.relative}: outer API heading`);
    assert.doesNotMatch(
      page.text.slice(api.index + api[0].length),
      /^## /mu,
      `${page.relative}: reference sections remain nested under API`,
    );
  }
});

test('color guides show semantic shades and a matching editable surface example', async () => {
  for (const language of ['', 'en/']) {
    const page = await readFile(path.join(docsRoot, `docs/${language}guide/colors.mdx`), 'utf8');
    assert.equal([...page.matchAll(/<ColorPalette\s*\/>/gu)].length, 1);
    assert.match(page, /<ThemeColors\s*\/>/u);
    assert.match(page, /file="[^"]*theming\/colors.tsx"/u);
    assert.match(page, /44/u);
    const example = await readFile(
      path.join(docsRoot, `src/examples/${language}theming/colors.tsx`),
      'utf8',
    );
    assert.match(example, /mutedSurfaceColor:\s*colors\.mutedSurface/u);
    assert.match(example, /onPrimaryColor:\s*foreground/u);
    assert.doesNotMatch(
      page,
      /用途与映射|高级参考|Purpose.*Mapping|Advanced Reference|family="(?:scenes|reference)"/u,
    );
    const tokensPage = await readFile(
      path.join(docsRoot, `docs/${language}api/theme-tokens.mdx`),
      'utf8',
    );
    assert.match(tokensPage, /mutedSurfaceColor[^\n]*--leaf-color-surface-muted/u);
    assert.match(tokensPage, /Tabs[^\n]*Card[^\n]*(?:日期|date)/u);
    const mutedSurfaceRow = tokensPage
      .split('\n')
      .find((line) => line.includes('`mutedSurfaceColor`'));
    assert.doesNotMatch(mutedSurfaceRow, /DataTable|Modal/u);
  }
});

test('API directory links resolve to component API headings in both languages', async () => {
  for (const language of ['', 'en/']) {
    const directory = await readFile(path.join(docsRoot, `docs/${language}api/index.mdx`), 'utf8');
    const links = [...directory.matchAll(/\]\(\/(?:en\/)?components\/([^/#]+)#([^)]+)\)/gu)];
    assert.ok(links.length > 70, 'Component API directory is populated');
    for (const [, slug, anchor] of links) {
      const page = await readFile(
        path.join(docsRoot, `docs/${language}components/${slug}.mdx`),
        'utf8',
      );
      const headings = [...page.matchAll(/^#{2,3} (.*API.*)$/gmu)].map((match) =>
        match[1].toLowerCase().replaceAll(' ', '-'),
      );
      assert.ok(headings.includes(anchor), `${language}${slug}#${anchor} resolves`);
    }
  }
});
