import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { compiledStyles } from './compiled-styles.mjs';

const PACKAGE_ROOT = path.resolve(import.meta.dirname, '..');
const TARGET_FILES = [
  'filelist/filelist.scss',
  'typography/typography.scss',
  'rate/rate.scss',
  'avatar/avatar.scss',
  'badge/badge.scss',
  'progress/progress.scss',
  'loadingbar/loadingbar.scss',
  'appbar/appbar.scss',
  'anchor/anchor.scss',
  'breadcrumb/breadcrumb.scss',
];

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/(^|[^:])\/\/[^\n\r]*/gu, '$1');
}

function exceptionKey({ file, expression }) {
  return `${file}\0${expression}`;
}

async function readTargets() {
  return new Map(
    await Promise.all(
      TARGET_FILES.map(async (file) => [
        file,
        await fs.readFile(path.join(PACKAGE_ROOT, 'src', file), 'utf8'),
      ]),
    ),
  );
}

const EXTERNAL_CUSTOM_PROPERTY_CONSUMERS = [
  {
    file: 'filelist/filelist.scss',
    variable: '--leaf-button-height',
    consumer: 'button/button.scss',
    reason: 'FileList constrains the private ButtonControl height.',
  },
  {
    file: 'filelist/filelist.scss',
    variable: '--leaf-button-radius',
    consumer: 'button/button.scss',
    reason: 'FileList constrains the private ButtonControl radius.',
  },
];

test('compiled content components retain semantic roles independent of SCSS layout', async () => {
  for (const [file, selector, property, value] of [
    ['avatar/avatar.scss', '.leaf-avatar', 'border', '2px solid var(--leaf-color-surface)'],
    ['badge/badge.scss', '.leaf-badge', '--leaf-badge-on-color', 'var(--leaf-color-on-danger)'],
    [
      'progress/progress.scss',
      '.leaf-progress',
      '--leaf-progress-color',
      'var(--leaf-color-primary-indicator,var(--leaf-color-primary))',
    ],
    ['rate/rate.scss', '.leaf-rate', '--leaf-rate-color', '#ffc53d'],
    [
      'filelist/filelist.scss',
      '.leaf-file-list__icon',
      'background',
      'var(--leaf-color-surface-muted)',
    ],
    [
      'tag/tag.scss',
      '.leaf-tag',
      '--leaf-tag-close-background',
      'var(--leaf-status-label-close-background)',
    ],
  ]) {
    const rule = await compiledStyles(file);
    assert.equal(rule(selector)[property], value, `${file}: ${property}`);
  }
});

test('every local custom property has a consumer in its component source', async () => {
  const sources = await readTargets();
  const external = new Map(
    EXTERNAL_CUSTOM_PROPERTY_CONSUMERS.map((entry) => [
      exceptionKey({ file: entry.file, expression: entry.variable }),
      entry,
    ]),
  );

  for (const [file, source] of sources) {
    if (!file.endsWith('.scss')) continue;
    const clean = stripComments(source);
    const declarations = new Set(
      [...clean.matchAll(/^\s*(--leaf-[a-z0-9-]+)\s*:/gimu)].map((match) => match[1]),
    );
    for (const variable of declarations) {
      const key = exceptionKey({ file, expression: variable });
      const externalConsumer = external.get(key);
      if (externalConsumer) {
        const consumer = await fs.readFile(
          path.join(PACKAGE_ROOT, 'src', externalConsumer.consumer),
          'utf8',
        );
        assert.match(
          consumer,
          new RegExp(`var\\(\\s*${variable.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\s*[,)]`, 'u'),
          externalConsumer.reason,
        );
        external.delete(key);
      } else {
        assert.match(
          clean,
          new RegExp(`var\\(\\s*${variable.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\s*[,)]`, 'u'),
          `${file} declares ${variable} but never consumes it.`,
        );
      }
    }
  }
  assert.deepEqual(
    [...external.keys()],
    [],
    'Every external custom-property consumer must be used.',
  );
});
