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
  'anchor/anchor.scss',
  'breadcrumb/breadcrumb.scss',
];

test('simple tables keep square content surfaces and one softened 2px header divider', async () => {
  const table = await compiledStyles('table/table.scss');
  const simple = table('.leaf-table--simple');
  assert.equal(simple.background, 'var(--leaf-table-surface)');
  assert.equal(simple['--leaf-table-header-background'], 'var(--leaf-table-surface)');
  assert.equal(simple['border-radius'], '0px');
  assert.equal(simple.border, '0px');
  assert.equal(table('.leaf-table--simple .leaf-table__panel').display, 'none');
  const divider = table('.leaf-table--simple .leaf-table__header::after');
  assert.equal(
    divider['border-block-end'],
    '2px solid var(--leaf-component-table-border-color,var(--leaf-frame-border-color,var(--leaf-table-frame-color)))',
  );
  assert.equal(divider['inset-block-end'], '0px');
  assert.equal(divider['inset-inline'], '0px');
  assert.equal(divider['pointer-events'], 'none');
  assert.equal(table('.leaf-table__header')['clip-path'], undefined);
  assert.equal(table('.leaf-table--simple .leaf-table__column-header::before').display, 'none');
  assert.equal(
    table('.leaf-table--simple .leaf-table__cell[data-pin-edge]::after').content,
    'none',
  );
});

test('simple headers use the base font size independently of layered sizes', async () => {
  const table = await compiledStyles('table/table.scss');
  assert.equal(
    table('.leaf-table--simple .leaf-table__column-header')['font-size'],
    'var(--leaf-font-size)',
  );
  assert.equal(
    table('.leaf-table__column-header')['font-size'],
    'max(12px,var(--leaf-font-size)- 2px)',
  );
  assert.equal(
    table('.leaf-table--lg .leaf-table__column-header')['font-size'],
    'var(--leaf-font-size-sm)',
  );
});

test('segmented progress keeps the outer track radius and removes inner fill curves', async () => {
  const progress = await compiledStyles('progress/progress.scss');
  assert.equal(
    progress('.leaf-progress__track--segments > .leaf-progress__fill')['border-radius'],
    '0px',
  );
  assert.equal(progress('.leaf-progress__track')['border-radius'], '100px');
});

test('table variants retain theme-aware ink, stripes and explicit frame paint overrides', async () => {
  const table = await compiledStyles('table/table.scss');
  const palette = table('.leaf-table');
  assert.equal(
    palette['--leaf-table-header-color'],
    'var(--leaf-component-table-color,var(--leaf-color-text-muted))',
  );
  assert.equal(
    palette['--leaf-table-frame-color'],
    'color-mix(in srgb,var(--leaf-color-divider)70%,var(--leaf-table-surface))',
  );
  assert.equal(
    palette['--leaf-table-surface'],
    'var(--leaf-component-table-background,var(--leaf-color-surface))',
  );
  assert.equal(
    palette['--leaf-table-striped-background'],
    'color-mix(in srgb,var(--leaf-table-text)2%,var(--leaf-table-surface))',
  );
  assert.equal(
    table('.leaf-table--striped .leaf-table__body > .leaf-table__row > .leaf-table__cell')[
      'border-block-end'
    ],
    '0px',
  );
  assert.equal(
    table('.leaf-table__cell')['border-block-end'],
    '1px solid var(--leaf-color-divider)',
  );
});

test('table outer cell insets exclude fixed-width utility columns in both directions', async () => {
  const table = await compiledStyles('tabletanstack/tabletanstack.scss');
  const utility = table('.leaf-data-table__utility');
  assert.equal(utility.width, '44px');
  assert.equal(utility['padding-inline'], '8px');
  for (const rtl of [false, true]) {
    for (const [position, edge, side] of [
      ['first', 'start', rtl ? 'right' : 'left'],
      ['last', 'end', rtl ? 'left' : 'right'],
    ]) {
      const selector = `${rtl ? '[dir=rtl] ' : ''}.leaf-table__row:not([aria-hidden=true]) > .leaf-table__cell:${position}-child:not(.leaf-table__state-cell):not(.leaf-data-table__utility)`;
      assert.equal(
        table(selector)[`padding-inline-${edge}`],
        `var(--leaf-component-table-padding-${side},calc(var(--leaf-table-padding-inline)+ var(--leaf-table-inset)))`,
      );
    }
  }
});

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
  {
    file: 'filelist/filelist.scss',
    variable: '--leaf-button-rest-color',
    consumer: 'button/button.scss',
    reason: 'FileList rests its private text actions in muted ink.',
  },
  {
    file: 'filelist/filelist.scss',
    variable: '--leaf-text-action-color',
    consumer: 'styles/_mixins.scss',
    reason: 'FileList download links rest in muted ink through the shared text action.',
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

test('Card headings use appearance-aware ink while retaining the component color override', async () => {
  const card = await compiledStyles('card/card.scss');
  assert.equal(
    card('.leaf-card-title')['--leaf-card-title-color'],
    'var(--leaf-component-card-color,light-dark(#000,var(--leaf-color-text)))',
  );
  assert.equal(card('.leaf-card-title').color, 'var(--leaf-card-title-color)');
  assert.equal(card('.leaf-card__title').color, 'var(--leaf-card-title-color)');
});

test('cover-only Cards round the cover as the final content surface', async () => {
  const card = await compiledStyles('card/card.scss');
  const cover = card('.leaf-card__cover');
  assert.equal(cover['border-start-start-radius'], 'inherit');
  assert.equal(cover['border-start-end-radius'], 'inherit');
  assert.equal(cover.overflow, 'hidden');
  assert.equal(cover['border-end-start-radius'], undefined);
  assert.equal(cover['border-end-end-radius'], undefined);
  const finalCover = card('.leaf-card__cover:last-child');
  assert.equal(finalCover['border-end-start-radius'], 'inherit');
  assert.equal(finalCover['border-end-end-radius'], 'inherit');
  assert.equal(card('.leaf-card').overflow, undefined);
  assert.equal(card('.leaf-card__panel').overflow, undefined);
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
