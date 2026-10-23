import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { compiledStyles } from './compiled-styles.mjs';

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

test('compiled feedback components retain semantic assignments and the danger alias', async () => {
  for (const [file, prefix, property] of [
    ['alert/alert.scss', '.leaf-alert--', '--leaf-feedback-color'],
    ['notification/notification.scss', '.leaf-notification--', '--leaf-notification-color'],
    ['message/message.scss', '.leaf-message--', '--leaf-feedback-color'],
    ['popconfirm/popconfirm.scss', '.leaf-popconfirm__icon--', 'color'],
  ]) {
    const rule = await compiledStyles(file);
    for (const tone of ['info', 'success', 'warning', 'danger', 'error']) {
      assert.equal(
        rule(file.startsWith('alert/') && tone === 'success' ? '.leaf-alert' : `${prefix}${tone}`)[
          property
        ],
        `var(--leaf-color-${tone === 'error' ? 'danger' : tone})`,
      );
    }
  }
});

test('compiled alert close and confirm error use their intended feedback roles', async () => {
  const rule = await compiledStyles('alert/alert.scss');
  assert.equal(rule('.leaf-alert__close:hover').background, 'var(--leaf-color-option-hover)');
  const error = rule('.leaf-confirm-error');
  assert.equal(error.color, 'var(--leaf-color-danger-ink)');
  assert.equal(error.background, 'var(--leaf-danger-soft-background)');
});
