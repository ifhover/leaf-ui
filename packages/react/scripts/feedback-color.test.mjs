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
  assert.equal(
    rule('.leaf-alert').background,
    'var(--leaf-component-alert-background,color-mix(in srgb,var(--leaf-color-surface),var(--leaf-color-surface-muted)))',
  );
  assert.equal(
    rule('.leaf-alert__close:hover:not(:disabled)').background,
    'var(--leaf-text-action-background)',
  );
  const error = rule('.leaf-confirm-error');
  assert.equal(error.color, 'var(--leaf-color-danger-ink)');
  assert.equal(error.background, 'var(--leaf-danger-soft-background)');
});

test('dialogs use one content surface and retain regional paint and spacing overrides', async () => {
  for (const component of ['modal', 'drawer']) {
    const rule = await compiledStyles(`${component}/${component}.scss`);
    assert.equal(
      rule(`.leaf-${component}`).background,
      `var(--leaf-component-${component}-background,var(--leaf-color-surface))`,
    );
    const body = rule(`.leaf-${component}__body`);
    assert.equal(body['border-radius'], '0px');
    assert.equal(body['margin-inline'], undefined);
    assert.equal(body['margin-block'], undefined);
    assert.equal(body.background, undefined);
    assert.equal(body.overflow, 'hidden');
  }
  const modal = await compiledStyles('modal/modal.scss');
  assert.equal(
    modal('.leaf-modal__content').padding,
    'var(--leaf-component-modal-padding,var(--leaf-density-dialog-block))',
  );
  assert.equal(
    modal('.leaf-modal--divided > .leaf-modal__footer')['padding-block-start'],
    'var(--leaf-dialog-padding-block)',
  );
  const drawer = await compiledStyles('drawer/drawer.scss');
  assert.equal(
    drawer('.leaf-drawer__content').padding,
    'var(--leaf-component-drawer-padding,var(--leaf-density-dialog-block)var(--leaf-density-dialog-inline))',
  );
});

test('compact modal sections leave the shared confirm shell unchanged', async () => {
  const modal = await compiledStyles('modal/modal.scss');
  const compact = '.leaf-modal:not(.leaf-confirm)';
  assert.equal(
    modal(`${compact} > .leaf-modal__header`).padding,
    'var(--leaf-component-modal-padding,10px var(--leaf-density-dialog-block))',
  );
  assert.equal(modal(`${compact} > .leaf-modal__header`)['padding-inline-end'], undefined);
  assert.equal(
    modal(`${compact} > .leaf-modal__header > .leaf-modal__heading h2`)['font-size'],
    'var(--leaf-component-modal-font-size,var(--leaf-font-size-lg))',
  );
  const close = modal(`${compact} > .leaf-modal__header > .leaf-modal__close`);
  assert.equal(close['box-sizing'], 'border-box');
  assert.equal(close['margin-inline-end'], '-4px');
  assert.equal(close.width, '32px');
  assert.equal(close.height, '32px');
  assert.equal(close.padding, '8px');
  const closeIcon = modal(`${compact} > .leaf-modal__header > .leaf-modal__close > svg`);
  assert.equal(closeIcon.width, '16px');
  assert.equal(closeIcon.height, '16px');
  assert.equal(
    modal(`${compact} > .leaf-modal__header > .leaf-modal__heading h2`)['font-weight'],
    'var(--leaf-heading-weight)',
  );
  assert.equal(close['align-self'], 'center');
  const footer = modal(`${compact} > .leaf-modal__footer`);
  assert.equal(
    footer.padding,
    'var(--leaf-component-modal-padding,calc(var(--leaf-spacing)* 1.5)var(--leaf-density-dialog-block))',
  );
  assert.equal(footer.background, 'var(--leaf-component-modal-footer-background,transparent)');
  assert.equal(
    modal('.leaf-modal--divided > .leaf-modal__header:not(.leaf-modal__header--compact)')[
      'border-block-end'
    ],
    '1px solid var(--leaf-dialog-divider)',
  );
  assert.equal(
    modal('.leaf-modal--divided > .leaf-modal__footer')['border-block-start'],
    '1px solid var(--leaf-dialog-divider)',
  );
  assert.equal(
    modal('.leaf-modal > .leaf-modal__header').padding,
    'var(--leaf-component-modal-padding,var(--leaf-density-dialog-block))',
  );
  assert.equal(modal('.leaf-modal > .leaf-modal__footer')['padding-block-start'], '0px');
  assert.equal(modal('.leaf-modal__close').height, '30px');
  const confirm = await compiledStyles('alert/alert.scss');
  assert.equal(
    confirm('.leaf-confirm > .leaf-modal__header .leaf-modal__heading h2')['font-size'],
    'var(--leaf-component-confirm-font-size,var(--leaf-font-size-lg))',
  );
});

test('modal heading icons use compact borderless theme-radius surfaces and smaller descriptions', async () => {
  const modal = await compiledStyles('modal/modal.scss');
  const compact = '.leaf-modal:not(.leaf-confirm)';
  assert.equal(
    modal(`${compact} > .leaf-modal__header.leaf-modal__header--icon`).padding,
    'var(--leaf-component-modal-padding,var(--leaf-spacing-md)var(--leaf-density-dialog-block))',
  );
  assert.equal(modal(compact)['--leaf-dialog-icon-size'], 'var(--leaf-control-height-lg)');
  const icon = modal(`${compact} > .leaf-modal__header > .leaf-modal__icon`);
  assert.equal(icon['align-self'], 'center');
  assert.equal(icon.border, '0px');
  assert.equal(icon['border-radius'], 'var(--leaf-radius-md)');
  const glyph = modal(`${compact} > .leaf-modal__header > .leaf-modal__icon > svg`);
  assert.equal(glyph.width, '20px');
  assert.equal(glyph.height, '20px');
  assert.equal(
    modal(`${compact} > .leaf-modal__header > .leaf-modal__heading > .leaf-modal__description`)[
      'font-size'
    ],
    'var(--leaf-font-size-sm)',
  );
  assert.equal(modal('.leaf-modal__icon')['border-radius'], '50%');
  assert.equal(modal('.leaf-modal__description')['font-size'], 'var(--leaf-font-size)');
});

test('modal dividers reuse softened surface paint and the smaller radius without changing Confirm', async () => {
  const modal = await compiledStyles('modal/modal.scss');
  const surface = modal('.leaf-modal:not(.leaf-confirm)');
  assert.equal(
    surface['--leaf-modal-frame-color'],
    'color-mix(in srgb,var(--leaf-color-divider)70%,var(--leaf-component-modal-background,var(--leaf-color-surface)))',
  );
  assert.equal(
    surface['--leaf-dialog-divider'],
    'var(--leaf-component-modal-border-color,var(--leaf-modal-frame-color))',
  );
  assert.equal(
    surface['border-radius'],
    'var(--leaf-component-modal-radius,var(--leaf-radius-md))',
  );
  const shared = modal('.leaf-modal');
  assert.equal(
    shared['--leaf-dialog-divider'],
    'var(--leaf-component-modal-border-color,var(--leaf-color-divider))',
  );
  assert.equal(shared['border-radius'], 'var(--leaf-component-modal-radius,var(--leaf-radius-lg))');
});

test('modal footer leaves gaps to action groups while Confirm and Drawer retain their spacing', async () => {
  const modal = await compiledStyles('modal/modal.scss');
  assert.equal(modal('.leaf-modal__footer').gap, undefined);
  assert.equal(modal('.leaf-modal > .leaf-modal__footer').gap, undefined);
  assert.equal(modal('.leaf-modal:not(.leaf-confirm) > .leaf-modal__footer').gap, undefined);
  const actions = modal('.leaf-modal__actions');
  assert.equal(actions.display, 'flex');
  assert.equal(actions.gap, '8px');
  assert.equal(actions['flex-wrap'], 'wrap');
  const confirm = await compiledStyles('alert/alert.scss');
  assert.equal(confirm('.leaf-confirm > .leaf-modal__footer').gap, '8px');
  const drawer = await compiledStyles('drawer/drawer.scss');
  assert.equal(drawer('.leaf-drawer__footer').gap, '8px');
});
