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

test('tables use clean surface headers without leaf-header split lines', async () => {
  const table = await compiledStyles('table/table.scss');
  const surface = table('.leaf-table');
  assert.equal(surface.background, 'var(--leaf-table-surface)');
  assert.equal(
    surface['--leaf-table-header-background'],
    'var(--leaf-component-table-background,var(--leaf-table-surface))',
  );
  assert.equal(surface['border-radius'], 'var(--leaf-table-radius)var(--leaf-table-radius)0 0');
  assert.equal(surface.border, '0px');
  assert.equal(surface['box-shadow'], 'none');
  assert.throws(() => table('.leaf-table__panel'), /missing compiled rule/);
  assert.throws(() => table('.leaf-table__header::after'), /missing compiled rule/);
  assert.equal(table('.leaf-table__header')['clip-path'], undefined);
  assert.throws(
    () =>
      table(
        '.leaf-table__column-header:not(:last-child):not(.leaf-data-table__utility):not([colspan])::after',
      ),
    /missing compiled rule/,
  );
  assert.throws(() => table('.leaf-table__cell[data-pin-edge]::after'), /missing compiled rule/);
});

test('headers use medium weight typography and taller size-dependent padding', async () => {
  const table = await compiledStyles('table/table.scss');
  assert.equal(table('.leaf-table__column-header')['font-size'], 'inherit');
  assert.equal(table('.leaf-table')['line-height'], '1.5714285714');
  assert.equal(table('.leaf-table__column-header')['font-weight'], 'var(--leaf-font-weight,500)');
  assert.equal(
    table('.leaf-table__column-header')['padding-block'],
    'var(--leaf-table-heading-gap)',
  );
  assert.equal(table('.leaf-table')['font-variant-numeric'], 'tabular-nums');
  assert.equal(table('.leaf-table')['--leaf-table-heading-gap'], 'var(--leaf-table-padding-block)');
  assert.equal(table('.leaf-table')['--leaf-table-padding-block'], '10px');
  assert.equal(table('.leaf-table')['--leaf-table-padding-inline'], '14px');
  assert.equal(table('.leaf-table--sm')['--leaf-table-padding-block'], '8px');
  assert.equal(table('.leaf-table--sm')['--leaf-table-padding-inline'], '12px');
  assert.equal(table('.leaf-table--md')['--leaf-table-padding-block'], '10px');
  assert.equal(table('.leaf-table--md')['--leaf-table-padding-inline'], '14px');
  assert.equal(table('.leaf-table--lg')['--leaf-table-padding-block'], '16px');
  assert.equal(table('.leaf-table--lg')['--leaf-table-padding-inline'], '16px');
});

test('bordered tables add an outer frame without altering internal dividers', async () => {
  const table = await compiledStyles('table/table.scss');
  const bordered = table('.leaf-table--bordered');
  assert.equal(
    bordered.border,
    'var(--leaf-table-border-width)solid var(--leaf-table-border-color)',
  );
  assert.equal(bordered['border-radius'], 'var(--leaf-table-radius)');
  assert.throws(() => table('.leaf-table--bordered .leaf-table__cell'), /missing compiled rule/);
  assert.equal(
    table('.leaf-table--bordered .leaf-table__state-row > .leaf-table__cell')['border-block-end'],
    '0px',
  );
  assert.equal(
    table(
      '.leaf-table--bordered .leaf-table__footer > .leaf-table__row:last-child > .leaf-table__cell',
    )['border-block-end'],
    '0px',
  );
  assert.equal(
    table(
      '.leaf-table--bordered .leaf-table__table:not(:has(> .leaf-table__footer)) .leaf-table__row[data-last-visible] > .leaf-table__cell',
    )['border-block-end'],
    '0px',
  );
  assert.equal(
    table(
      '.leaf-table--bordered .leaf-table__table:not(:has([data-row-id])) > :last-child > .leaf-table__row:last-child > .leaf-table__cell',
    )['border-block-end'],
    '0px',
  );
  assert.equal(
    table(
      '.leaf-table__header > .leaf-table__row:not(:last-child) > .leaf-table__column-header[data-leaf-header-group]',
    )['border-block-end'],
    '0px',
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

test('tables use muted header ink, soft divider rule, neutral stripes matching hover and 1px header divider', async () => {
  const table = await compiledStyles('table/table.scss');
  const palette = table('.leaf-table');
  assert.equal(
    palette['--leaf-table-header-color'],
    'var(--leaf-component-table-color,var(--leaf-color-text-muted))',
  );
  assert.equal(
    palette['--leaf-table-divider'],
    'var(--leaf-component-table-border-color,var(--leaf-frame-border-color,var(--leaf-color-divider)))',
  );
  assert.equal(
    palette['--leaf-table-border-color'],
    'var(--leaf-component-table-border-color,var(--leaf-frame-border-color,var(--leaf-color-border)))',
  );
  assert.equal(
    palette['--leaf-table-surface'],
    'var(--leaf-component-table-background,var(--leaf-color-surface))',
  );
  assert.equal(palette['--leaf-table-striped-background'], 'var(--leaf-table-hover-background)');
  assert.equal(
    palette['--leaf-table-hover-background'],
    'color-mix(in srgb,var(--leaf-color-option-hover)25%,var(--leaf-table-surface))',
  );
  assert.equal(palette['--leaf-table-selected-background'], 'var(--leaf-color-surface-muted)');
  assert.equal(palette['--leaf-table-selected-hover-background'], undefined);
  assert.equal(
    table(
      '.leaf-table__body > .leaf-table__row:not(.leaf-table__state-row):not([data-selected]):hover',
    )['--leaf-table-row-background'],
    'var(--leaf-table-hover-background)',
  );
  assert.equal(
    table('.leaf-table__body > .leaf-table__row[data-selected]')['--leaf-table-row-background'],
    'var(--leaf-table-selected-background)',
  );
  assert.throws(
    () => table('.leaf-table__body > .leaf-table__row[data-selected]:hover'),
    /missing compiled rule/,
  );
  assert.equal(
    table('.leaf-table--striped .leaf-table__body > .leaf-table__row[data-striped]')[
      '--leaf-table-row-base'
    ],
    'var(--leaf-table-striped-background)',
  );
  assert.equal(
    table('.leaf-table--striped .leaf-table__body > .leaf-table__row > .leaf-table__cell')[
      'border-block-end'
    ],
    '0px',
  );
  assert.equal(
    table('.leaf-table--striped .leaf-table__footer > .leaf-table__row > .leaf-table__cell')[
      'border-block-end'
    ],
    '0px',
  );
  assert.equal(
    table('.leaf-table__cell')['border-block-end'],
    'var(--leaf-table-border-width)solid var(--leaf-table-divider)',
  );
  assert.equal(
    table('.leaf-table__header > .leaf-table__row:last-child > .leaf-table__column-header')[
      'border-block-end'
    ],
    '1px solid var(--leaf-table-divider)',
  );
  assert.equal(
    table(
      '.leaf-table__header > .leaf-table__row:not(:last-child) > .leaf-table__column-header:not([data-leaf-header-group])[rowspan]',
    )['border-block-end'],
    '1px solid var(--leaf-table-divider)',
  );
});

test('table outer cell insets exclude fixed-width utility columns in both directions', async () => {
  const table = await compiledStyles('tabletanstack/tabletanstack.scss');
  const utility = table('.leaf-data-table__utility');
  assert.equal(table('.leaf-data-table__selection').width, '34px');
  assert.throws(
    () => table('.leaf-table--bordered .leaf-data-table__selection'),
    /missing compiled rule/,
  );
  assert.equal(table('.leaf-data-table__expansion').width, '48px');
  assert.equal(utility['padding-inline'], '8px');
  assert.equal(table('.leaf-table__cell.leaf-data-table__utility')['padding-inline'], '8px');
  assert.throws(
    () => table('.leaf-table__cell.leaf-data-table__record-cell'),
    /missing compiled rule/,
  );
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
  const sort = table('.leaf-data-table__sort');
  assert.equal(sort.display, 'inline-flex');
  assert.equal(sort['max-width'], '100%');
  assert.equal(sort.width, undefined);
  assert.equal(
    table('.leaf-data-table__sort-arrow[data-direction]').color,
    'var(--leaf-color-text)',
  );
  assert.equal(table('.leaf-data-table__sort-arrow[data-direction=asc]').rotate, '180deg');
  assert.equal(
    table('.leaf-data-table .leaf-table__cell[data-ellipsis]')['text-overflow'],
    'ellipsis',
  );
  assert.equal(
    table('.leaf-data-table .leaf-table__cell[data-ellipsis] > .leaf-data-table__row-content')[
      'text-overflow'
    ],
    'ellipsis',
  );

  const cardTable = table('.leaf-data-table--card .leaf-data-table__card .leaf-table');
  assert.equal(
    cardTable['--leaf-table-inset'],
    'calc(var(--leaf-card-padding)- var(--leaf-table-padding-inline))',
  );
  assert.equal(
    table(
      '.leaf-data-table--card .leaf-data-table__card > .leaf-card__panel:first-child > .leaf-card__body:first-child > .leaf-data-table__content:last-child .leaf-table',
    )['border-radius'],
    'var(--leaf-data-table-card-inner-radius)',
  );
  assert.equal(
    table(
      '.leaf-data-table--card .leaf-data-table__card > .leaf-card__panel:first-child > .leaf-card__body:first-child > .leaf-data-table__content:not(:last-child) .leaf-table',
    )['border-radius'],
    'var(--leaf-data-table-card-inner-radius)var(--leaf-data-table-card-inner-radius)0 0',
  );
  for (const selector of [
    '.leaf-data-table--card .leaf-data-table__card > .leaf-card__header + .leaf-card__panel > .leaf-card__body > .leaf-data-table__content:last-child .leaf-table',
    '.leaf-data-table--card .leaf-data-table__card > .leaf-card__panel > .leaf-card__body:not(:first-child) > .leaf-data-table__content:last-child .leaf-table',
  ]) {
    assert.equal(
      table(selector)['border-radius'],
      '0 0 var(--leaf-data-table-card-inner-radius)var(--leaf-data-table-card-inner-radius)',
    );
  }
  for (const selector of [
    '.leaf-data-table--card .leaf-data-table__card > .leaf-card__header + .leaf-card__panel > .leaf-card__body > .leaf-data-table__content:not(:last-child) .leaf-table',
    '.leaf-data-table--card .leaf-data-table__card > .leaf-card__panel > .leaf-card__body:not(:first-child) > .leaf-data-table__content:not(:last-child) .leaf-table',
  ]) {
    assert.equal(table(selector)['border-radius'], '0px');
  }
  const cardFooter = table(
    '.leaf-data-table--card .leaf-data-table__card .leaf-data-table__footer',
  );
  assert.equal(cardFooter['margin-block-start'], '0px');
  assert.equal(cardFooter.padding, 'min(16px,var(--leaf-card-padding))var(--leaf-card-padding)');
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
    variable: '--leaf-button-icon-size',
    consumer: 'button/button.scss',
    reason: 'FileList constrains the private ButtonControl icon size.',
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
      'var(--leaf-color-primary)',
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

test('Card headings use text role while retaining the component color override', async () => {
  const card = await compiledStyles('card/card.scss');
  assert.equal(
    card('.leaf-card-title')['--leaf-card-title-color'],
    'var(--leaf-component-card-color,var(--leaf-color-text))',
  );
  assert.equal(card('.leaf-card-title').color, 'var(--leaf-card-title-color)');
  assert.equal(card('.leaf-card__title').color, 'var(--leaf-card-title-color)');
  assert.equal(card('.leaf-card__description')['font-size'], 'var(--leaf-font-size-sm)');
  assert.equal(card('.leaf-card__description')['line-height'], 'var(--leaf-line-height-sm)');
  assert.equal(card('.leaf-card__footer').gap, '8px');
  assert.equal(
    card('.leaf-card__footer').background,
    'var(--leaf-component-card-footer-background,color-mix(in srgb,var(--leaf-card-surface),var(--leaf-color-surface-muted)))',
  );
  assert.equal(
    card('.leaf-card--divided > .leaf-card__panel > .leaf-card__footer')['border-block-start'],
    '1px solid var(--leaf-component-card-border-color,var(--leaf-color-divider))',
  );
  assert.throws(() => card('.leaf-card--selected'), /missing compiled rule/u);
  assert.throws(() => card('.leaf-card--layered'), /missing compiled rule/u);
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

test('Cards keep independent section padding fallbacks when header-only tabs or cover precede the body', async () => {
  const card = await compiledStyles('card/card.scss');
  assert.equal(
    card('.leaf-card__body').padding,
    'var(--leaf-card-body-padding,var(--leaf-component-card-padding,var(--leaf-card-body-default-padding)))',
  );
  assert.equal(
    card('.leaf-card__body:not(:last-child)')['--leaf-card-body-default-padding'],
    'var(--leaf-card-padding)var(--leaf-card-padding)min(16px,var(--leaf-card-padding))',
  );
  assert.equal(
    card('.leaf-card__header + .leaf-card__panel > .leaf-card__body:first-child')[
      '--leaf-card-body-default-padding'
    ],
    '0 var(--leaf-card-padding)var(--leaf-card-padding)',
  );
  assert.equal(
    card(
      '.leaf-card__tabs:has(> .leaf-tabs__panels > .leaf-tabs__panel:not([hidden])) + .leaf-card__body',
    )['--leaf-card-body-default-padding'],
    '0 var(--leaf-card-padding)var(--leaf-card-padding)',
  );
  assert.equal(card('.leaf-card__cover + .leaf-card__tabs')['border-start-start-radius'], '0px');
  assert.equal(
    card('.leaf-card__cover + .leaf-card__tabs > .leaf-tabs__header')['border-start-end-radius'],
    '0px',
  );
  assert.equal(
    card('.leaf-card__tabs.leaf-tabs--line > .leaf-tabs__header::before')['border-block-end-color'],
    'var(--leaf-component-card-border-color,var(--leaf-frame-border-color,var(--leaf-color-divider)))',
  );
});

test('Modal and Drawer omit embedded tab bars and headerless dividers', async () => {
  const modal = await compiledStyles('modal/modal.scss');
  assert.throws(
    () => modal('.leaf-modal--divided > .leaf-modal__header:not(.leaf-modal__header--compact)'),
    /missing compiled rule/u,
  );
  assert.throws(() => modal('.leaf-dialog-tabs'), /missing compiled rule/u);

  const drawer = await compiledStyles('drawer/drawer.scss');
  assert.throws(
    () => drawer('.leaf-drawer--divided > .leaf-drawer__header:not(.leaf-drawer__header--compact)'),
    /missing compiled rule/u,
  );
  assert.throws(() => drawer('.leaf-dialog-tabs'), /missing compiled rule/u);
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

test('select hides input carets when readonly or closed', async () => {
  const select = await compiledStyles('select/select.scss');
  const readonlyInput = select('.leaf-select__input:read-only');
  assert.equal(readonlyInput.cursor, 'pointer');
  assert.equal(readonlyInput['caret-color'], 'transparent');
  assert.equal(readonlyInput['user-select'], 'none');
  const closedInput = select('.leaf-select:not([data-open]) .leaf-select__input');
  assert.equal(closedInput['caret-color'], 'transparent');
});
