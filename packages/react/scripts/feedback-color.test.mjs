import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const PACKAGE_ROOT = path.resolve(import.meta.dirname, '..');
const FEEDBACK_FILES = [
  'alert/alert.scss',
  'notification/notification.scss',
  'popconfirm/popconfirm.scss',
  'message/message.scss',
];
const RETIRED_FEEDBACK_PROPERTIES = [
  '--leaf-feedback-color-border-12',
  '--leaf-feedback-color-surface-5',
  '--leaf-feedback-color-alpha-10',
  '--leaf-feedback-color-alpha-15',
  '--leaf-feedback-color-alpha-8',
  '--leaf-notification-color-alpha-9',
  '--leaf-popconfirm-icon-background',
];

async function readSource(relativePath) {
  return fs.readFile(path.join(PACKAGE_ROOT, 'src', relativePath), 'utf8');
}

async function feedbackSources() {
  const entries = await Promise.all(
    FEEDBACK_FILES.map(async (file) => [file, await readSource(file)]),
  );
  return new Map(entries);
}

function block(source, selector) {
  const start = source.indexOf(selector);
  assert.notEqual(start, -1, `Expected ${selector} in source`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index++) {
    if (source[index] === '{') depth++;
    if (source[index] === '}') depth--;
    if (depth === 0) return source.slice(open + 1, index);
  }
  assert.fail(`Unclosed block for ${selector}`);
}

async function allStyleSources(directory = path.join(PACKAGE_ROOT, 'src')) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const sources = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) sources.push(...(await allStyleSources(file)));
    if (entry.isFile() && entry.name.endsWith('.scss')) sources.push(file);
  }
  return sources;
}

test('retired feedback derivations have no remaining declarations', async () => {
  const sources = await feedbackSources();
  for (const [file, source] of sources) {
    for (const property of RETIRED_FEEDBACK_PROPERTIES) {
      assert.doesNotMatch(source, new RegExp(`${property}\\s*:`, 'u'), `${file}: ${property}`);
    }
  }

  for (const file of await allStyleSources()) {
    const source = await fs.readFile(file, 'utf8');
    for (const property of RETIRED_FEEDBACK_PROPERTIES) {
      assert.doesNotMatch(source, new RegExp(`${property}\\s*:`, 'u'), file);
    }
  }
});

test('each local feedback property is consumed in its owning component styles', async () => {
  const sources = await feedbackSources();
  for (const [file, source] of sources) {
    const definitions = new Set(
      [...source.matchAll(/(--leaf-[\w-]+)\s*:/gu)].map((match) => match[1]),
    );
    for (const property of definitions) {
      assert.match(source, new RegExp(`var\\(${property}(?:,|\\))`, 'u'), `${file}: ${property}`);
    }
  }
});

test('feedback components retain their semantic color assignments', async () => {
  const [alert, notification, popconfirm, message] = await Promise.all(
    FEEDBACK_FILES.map(readSource),
  );

  for (const type of ['info', 'success', 'warning']) {
    const icon = block(popconfirm, `&--${type} {`);
    assert.match(icon, new RegExp(`color: var\\(--leaf-color-${type}\\)`, 'u'));
  }
  const dangerIcon = block(popconfirm, '&--danger,');
  assert.match(dangerIcon, /color: var\(--leaf-color-danger\)/u);
  assert.match(popconfirm, /&--error\s*\{(?=[\s\S]*?color: var\(--leaf-color-danger\))/u);

  assert.match(alert, /--leaf-feedback-color: var\(--leaf-color-success\)/u);
  assert.match(alert, /--leaf-feedback-color: var\(--leaf-color-info\)/u);
  assert.match(alert, /--leaf-feedback-color: var\(--leaf-color-warning\)/u);
  assert.match(alert, /--leaf-feedback-color: var\(--leaf-color-danger\)/u);
  assert.match(
    notification,
    /@each \$type in info, success, warning, danger, error\s*\{[\s\S]*?--leaf-notification-color: var\(--leaf-color-#\{if\(sass\(\$type == error\): danger; else: \$type\)\}\)/u,
  );
  assert.match(
    message,
    /@each \$type in info, success, warning, danger, error\s*\{[\s\S]*?--leaf-feedback-color: var\(--leaf-color-#\{if\(sass\(\$type == error\): danger; else: \$type\)\}\)/u,
  );
});

test('alert close uses the shared neutral option hover', async () => {
  const source = await readSource('alert/alert.scss');
  const close = block(source, '&__close {');
  assert.match(close, /&:hover\s*\{[\s\S]*?background:\s*var\(--leaf-color-option-hover\);/u);
  assert.doesNotMatch(source, /--leaf-color-border-surface-35/u);
});

test('confirm error uses the shared danger option family and readable danger ink', async () => {
  const source = await readSource('alert/alert.scss');
  const confirm = block(source, '.leaf-confirm {');
  const error = block(source, '.leaf-confirm-error {');

  assert.match(source, /@use '\.\.\/styles\/mixins' as mixins;/u);
  assert.match(confirm, /@include mixins\.danger-soft-feedback-family;/u);
  assert.match(error, /color:\s*var\(--leaf-color-danger-ink\);/u);
  assert.match(error, /background:\s*var\(--leaf-danger-soft-background\);/u);
  assert.doesNotMatch(source, /--leaf-color-danger-alpha-7/u);
});
