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
  const alertRule = await compiledStyles('alert/alert.scss');
  assert.equal(alertRule('.leaf-alert')['--leaf-status-ink'], 'var(--leaf-color-text)');
  for (const tone of ['success', 'warning', 'danger', 'error']) {
    assert.equal(
      alertRule(`.leaf-alert--${tone}`)['--leaf-feedback-color'],
      `var(--leaf-color-${tone === 'error' ? 'danger' : tone})`,
    );
  }
  assert.throws(() => alertRule('.leaf-alert--info'), /missing compiled rule/u);

  for (const [file, prefix, property] of [
    ['notification/notification.scss', '.leaf-notification--', '--leaf-notification-color'],
    ['message/message.scss', '.leaf-message--', '--leaf-feedback-color'],
    ['popconfirm/popconfirm.scss', '.leaf-popconfirm__icon--', 'color'],
  ]) {
    const rule = await compiledStyles(file);
    for (const tone of ['info', 'success', 'warning', 'danger', 'error']) {
      assert.equal(
        rule(`${prefix}${tone}`)[property],
        `var(--leaf-color-${tone === 'error' ? 'danger' : tone})`,
      );
    }
  }
});

test('compiled alert and close button use their intended feedback roles', async () => {
  const rule = await compiledStyles('alert/alert.scss');
  assert.equal(rule('.leaf-alert__title')['font-weight'], '500');
  assert.equal(
    rule('.leaf-alert__icon').color,
    'var(--leaf-component-alert-color,var(--leaf-status-ink))',
  );
  assert.equal(
    rule('.leaf-alert__title').color,
    'var(--leaf-component-alert-color,var(--leaf-status-ink))',
  );
  assert.equal(rule('.leaf-alert')['--leaf-status-ink'], 'var(--leaf-color-text)');
  assert.equal(rule('.leaf-alert')['--leaf-alert-background'], 'var(--leaf-color-surface)');
  assert.equal(rule('.leaf-alert')['--leaf-alert-border-color'], 'var(--leaf-color-border)');
  assert.equal(
    rule('.leaf-alert')['--leaf-alert-frame-border'],
    'var(--leaf-frame-border-color,var(--leaf-alert-border-color))',
  );
  assert.equal(rule('.leaf-alert--success')['--leaf-status-ink'], 'var(--leaf-color-success-ink)');
  assert.equal(rule('.leaf-alert--warning')['--leaf-status-ink'], 'var(--leaf-color-warning-ink)');
  assert.equal(rule('.leaf-alert--danger')['--leaf-status-ink'], 'var(--leaf-color-danger-ink)');
  assert.equal(rule('.leaf-alert').padding, 'var(--leaf-component-alert-padding,10px 12px)');
  assert.match(
    rule('.leaf-alert').border,
    /^var\(--leaf-component-alert-border-width,var\(--leaf-border-width,1px\)\)solid/u,
  );
  assert.equal(
    rule('.leaf-alert')['border-radius'],
    'var(--leaf-component-alert-radius,var(--leaf-radius))',
  );
  assert.equal(
    rule('.leaf-alert').font,
    'var(--leaf-font-size)/var(--leaf-line-height)var(--leaf-font-family)',
  );
  assert.throws(() => rule('.leaf-alert[data-description]'), /missing compiled rule/u);
  assert.throws(
    () => rule('.leaf-alert[data-description] .leaf-alert__title'),
    /missing compiled rule/u,
  );
  assert.equal(
    rule('.leaf-alert').background,
    'var(--leaf-component-alert-background,var(--leaf-alert-background))',
  );
  for (const tone of ['success', 'warning', 'danger']) {
    const toneRule = rule(`.leaf-alert--${tone}`);
    assert.equal(toneRule['--leaf-feedback-soft'], `var(--leaf-color-${tone}-soft)`);
    assert.equal(
      toneRule['--leaf-alert-background'],
      'color-mix(in srgb,var(--leaf-feedback-soft)50%,var(--leaf-color-surface))',
    );
    assert.equal(
      toneRule['--leaf-alert-border-color'],
      'color-mix(in srgb,var(--leaf-feedback-color)25%,var(--leaf-color-border))',
    );
    assert.equal(toneRule['--leaf-alert-frame-border'], 'var(--leaf-alert-border-color)');
  }
  assert.equal(
    rule('.leaf-alert__close:hover:not(:disabled)').background,
    'var(--leaf-text-action-background)',
  );
  assert.throws(() => rule('.leaf-confirm-error'), /missing compiled rule/u);
});

test('dialogs use one content surface and retain regional paint and spacing overrides', async () => {
  for (const component of ['modal', 'drawer']) {
    const rule = await compiledStyles(`${component}/${component}.scss`);
    const shell = rule(`.leaf-${component}`);
    assert.equal(
      shell.background,
      `var(--leaf-component-${component}-background,var(--leaf-color-surface))`,
    );
    assert.equal(
      shell.padding,
      'var(--leaf-dialog-padding-block)var(--leaf-dialog-padding-right)var(--leaf-dialog-padding-bottom)var(--leaf-dialog-padding-left)',
    );
    assert.equal(shell.gap, 'var(--leaf-dialog-gap)');
    const body = rule(`.leaf-${component}__body`);
    assert.equal(body.width, 'auto');
    assert.equal(body['max-width'], 'none');
    assert.equal(body['border-radius'], '0px');
    assert.equal(
      body['margin-inline'],
      'calc(-1 * var(--leaf-dialog-padding-start))calc(-1 * var(--leaf-dialog-padding-end))',
    );
    assert.equal(body['margin-block'], undefined);
    assert.equal(body.background, undefined);
    assert.equal(body.overflow, 'hidden');
    const scrollbarBody = rule(`.leaf-${component} > .leaf-${component}__body.leaf-scrollbar`);
    assert.equal(scrollbarBody.width, 'auto');
    assert.equal(scrollbarBody['max-width'], 'none');
    assert.equal(scrollbarBody['border-radius'], '0px');
    assert.equal(
      rule(`.leaf-${component} > .leaf-${component}__body > .leaf-${component}__viewport`)[
        'overscroll-behavior'
      ],
      'contain',
    );
    assert.equal(rule(`.leaf-${component}__content > :first-child`)['margin-block-start'], '0px');
    assert.equal(rule(`.leaf-${component}__content > :last-child`)['margin-block-end'], '0px');
  }
  const modal = await compiledStyles('modal/modal.scss');
  assert.equal(
    modal('.leaf-modal__content').padding,
    '0 var(--leaf-dialog-padding-end)0 var(--leaf-dialog-padding-start)',
  );
  assert.equal(
    modal(
      '.leaf-modal[data-body-padding] > .leaf-modal__body > .leaf-modal__viewport > .leaf-modal__content',
    ).padding,
    'var(--leaf-modal-body-padding)',
  );
  assert.equal(
    modal('.leaf-modal--divided > .leaf-modal__footer')['border-block-start'],
    '1px solid var(--leaf-dialog-divider)',
  );
  assert.equal(
    modal('.leaf-modal--divided > .leaf-modal__footer').padding,
    'var(--leaf-dialog-footer-padding-top)var(--leaf-dialog-padding-end)var(--leaf-dialog-footer-padding-bottom)var(--leaf-dialog-padding-start)',
  );
  const drawer = await compiledStyles('drawer/drawer.scss');
  assert.equal(
    drawer('.leaf-drawer__footer').background,
    'var(--leaf-component-drawer-footer-background,transparent)',
  );
  assert.equal(
    drawer('.leaf-drawer__content').padding,
    '0 var(--leaf-dialog-padding-end)0 var(--leaf-dialog-padding-start)',
  );
  assert.equal(
    drawer(
      '.leaf-drawer[data-body-padding] > .leaf-drawer__body > .leaf-drawer__viewport > .leaf-drawer__content',
    ).padding,
    'var(--leaf-drawer-body-padding)',
  );
});

test('modal and confirm share unified header weight, spacing, footer background, mini and danger modes', async () => {
  const modal = await compiledStyles('modal/modal.scss');
  assert.equal(
    modal('.leaf-modal > .leaf-modal__header > .leaf-modal__heading h2')['font-size'],
    'var(--leaf-component-modal-font-size,var(--leaf-font-size-lg))',
  );
  assert.equal(
    modal('.leaf-modal > .leaf-modal__header > .leaf-modal__heading h2')['font-weight'],
    'var(--leaf-font-weight,500)',
  );
  assert.equal(modal('.leaf-modal__description')['margin-block-start'], 'var(--leaf-spacing-sm)');
  const close = modal('.leaf-modal__close');
  assert.equal(close['box-sizing'], 'border-box');
  assert.equal(close.width, '32px');
  assert.equal(close.height, '32px');
  assert.equal(close.padding, '8px');
  const closeIcon = modal('.leaf-modal__close > svg');
  assert.equal(closeIcon.width, '16px');
  assert.equal(closeIcon.height, '16px');
  const floatingClose = modal('.leaf-modal > .leaf-modal__close');
  assert.equal(floatingClose.position, 'absolute');
  assert.equal(
    floatingClose['inset-block-start'],
    'max(4px,var(--leaf-dialog-close-block)+(var(--leaf-line-height-lg)- 32px)/ 2)',
  );
  assert.equal(floatingClose['inset-inline-end'], 'max(4px,var(--leaf-dialog-close-inline)- 8px)');
  assert.throws(
    () => modal('.leaf-modal__tab-extra > .leaf-modal__close'),
    /missing compiled rule/u,
  );
  const footer = modal('.leaf-modal > .leaf-modal__footer');
  assert.equal(
    footer.background,
    'var(--leaf-component-modal-footer-background,color-mix(in srgb,var(--leaf-component-modal-background,var(--leaf-color-surface)),var(--leaf-color-surface-muted)))',
  );
  assert.equal(modal('.leaf-modal__footer').gap, '8px');
  assert.throws(() => modal('.leaf-modal__actions'), /missing compiled rule/u);
  const undividedFooter = modal('.leaf-modal:not(.leaf-modal--divided) > .leaf-modal__footer');
  assert.equal(
    undividedFooter['margin-inline'],
    'calc(-1 * var(--leaf-dialog-padding-start))calc(-1 * var(--leaf-dialog-padding-end))',
  );
  assert.equal(undividedFooter['margin-block-end'], 'calc(-1 * var(--leaf-dialog-padding-bottom))');
  assert.equal(
    modal('.leaf-modal--divided:not(.leaf-modal--mini)')['--leaf-dialog-close-block'],
    'var(--leaf-modal-close-inset-top,var(--leaf-dialog-header-padding-top))',
  );
  assert.equal(
    modal(
      '.leaf-modal--divided:not(.leaf-modal--mini) > .leaf-modal__header:not(.leaf-modal__header--compact)',
    )['border-block-end'],
    '1px solid var(--leaf-dialog-divider)',
  );
  assert.equal(
    modal('.leaf-modal--divided > .leaf-modal__footer')['border-block-start'],
    '1px solid var(--leaf-dialog-divider)',
  );
  assert.equal(modal('.leaf-modal__header').padding, '0px');
  assert.equal(
    modal('.leaf-modal[data-header-padding] > .leaf-modal__header').padding,
    'var(--leaf-modal-header-padding,var(--leaf-dialog-padding-block)var(--leaf-dialog-padding-end)0 var(--leaf-dialog-padding-start))',
  );
  assert.equal(modal('.leaf-modal__footer').padding, '0px');
  assert.equal(
    modal('.leaf-modal[data-footer-padding] > .leaf-modal__footer').padding,
    'var(--leaf-modal-footer-padding,var(--leaf-spacing-md)var(--leaf-dialog-padding-end)var(--leaf-dialog-padding-bottom)var(--leaf-dialog-padding-start))',
  );

  assert.equal(modal('.leaf-modal__icon').background, 'var(--leaf-color-surface-muted)');
  assert.equal(
    modal('.leaf-modal > .leaf-modal__header > .leaf-modal__icon').color,
    'var(--leaf-color-text)',
  );

  const dangerIcon = modal('.leaf-modal--danger > .leaf-modal__header > .leaf-modal__icon');
  assert.equal(dangerIcon['--leaf-status-label-base'], 'var(--leaf-color-danger)');
  assert.equal(dangerIcon['--leaf-status-label-background'], 'var(--leaf-color-danger-soft)');
  assert.equal(dangerIcon.color, 'var(--leaf-status-label-base)');
  assert.equal(dangerIcon.background, 'var(--leaf-status-label-background)');

  const mini = modal('.leaf-modal--mini');
  assert.equal(mini['--leaf-dialog-icon-size'], 'calc(var(--leaf-control-height-lg)+ 2px)');
  const miniHeader = modal('.leaf-modal--mini > .leaf-modal__header');
  assert.equal(miniHeader['flex-direction'], 'column');
  assert.equal(miniHeader['align-items'], 'center');
  assert.equal(miniHeader['text-align'], 'center');
  assert.equal(
    modal('.leaf-modal--mini > .leaf-modal__header > .leaf-modal__icon')['border-radius'],
    'var(--leaf-radius)',
  );
  assert.equal(
    modal(
      '.leaf-modal--mini.leaf-modal--closable > .leaf-modal__header:not(.leaf-modal__header--icon) > .leaf-modal__heading:last-child',
    )['padding-inline'],
    'var(--leaf-dialog-close-clearance)',
  );
  const miniFooter = modal('.leaf-modal--mini > .leaf-modal__footer');
  assert.equal(miniFooter.display, 'grid');
  assert.equal(miniFooter['grid-auto-flow'], 'column');
  assert.equal(miniFooter['grid-auto-columns'], 'minmax(0,1fr)');
  assert.equal(modal('.leaf-modal--mini > .leaf-modal__footer > .leaf-button').width, '100%');

  const drawer = await compiledStyles('drawer/drawer.scss');
  assert.equal(drawer('.leaf-drawer__footer').gap, '8px');
  const drawerFloatingClose = drawer('.leaf-drawer > .leaf-drawer__close');
  assert.equal(drawerFloatingClose.position, 'absolute');
  assert.equal(
    drawerFloatingClose['inset-inline-end'],
    'max(4px,var(--leaf-dialog-close-inline)- 8px)',
  );
  assert.throws(
    () => drawer('.leaf-drawer__tab-extra > .leaf-drawer__close'),
    /missing compiled rule/u,
  );
  const confirm = await compiledStyles('alert/alert.scss');
  assert.equal(
    confirm('.leaf-confirm > .leaf-modal__header .leaf-modal__heading h2')['font-size'],
    'var(--leaf-component-confirm-font-size,var(--leaf-font-size-lg))',
  );
  for (const tone of ['success', 'warning', 'danger']) {
    const rule = confirm(`.leaf-confirm--${tone} > .leaf-modal__header > .leaf-modal__icon`);
    assert.equal(rule['--leaf-status-label-base'], `var(--leaf-color-${tone})`);
    assert.equal(rule['--leaf-status-label-background'], `var(--leaf-color-${tone}-soft)`);
    assert.equal(rule.color, 'var(--leaf-status-label-base)');
    assert.equal(rule.background, 'var(--leaf-status-label-background)');
  }
  assert.throws(
    () => confirm('.leaf-confirm--info > .leaf-modal__header > .leaf-modal__icon'),
    /missing compiled rule/u,
  );
});

test('modal heading icons use compact borderless theme-radius surfaces and smaller descriptions', async () => {
  const modal = await compiledStyles('modal/modal.scss');
  assert.equal(
    modal('.leaf-modal')['--leaf-dialog-heading-gap'],
    'var(--leaf-component-modal-gap,var(--leaf-dialog-gap))',
  );
  assert.equal(modal('.leaf-modal__header').gap, 'var(--leaf-dialog-heading-gap)');
  assert.equal(modal('.leaf-modal')['--leaf-dialog-icon-size'], 'var(--leaf-control-height-lg)');
  const icon = modal('.leaf-modal > .leaf-modal__header > .leaf-modal__icon');
  assert.equal(icon['align-self'], 'flex-start');
  assert.equal(icon.border, '0px');
  assert.equal(icon['border-radius'], 'var(--leaf-radius)');
  assert.equal(
    modal('.leaf-modal--mini > .leaf-modal__header > .leaf-modal__icon')['align-self'],
    'center',
  );
  const glyph = modal('.leaf-modal > .leaf-modal__header > .leaf-modal__icon > svg');
  assert.equal(glyph.width, '20px');
  assert.equal(glyph.height, '20px');
  assert.equal(
    modal('.leaf-modal > .leaf-modal__header > .leaf-modal__heading > .leaf-modal__description')[
      'font-size'
    ],
    'var(--leaf-font-size-sm)',
  );
  assert.equal(
    modal(
      '.leaf-modal--mini > .leaf-modal__header > .leaf-modal__heading > .leaf-modal__description',
    )['font-size'],
    'var(--leaf-font-size)',
  );
  const drawer = await compiledStyles('drawer/drawer.scss');
  assert.equal(
    drawer('.leaf-drawer')['--leaf-dialog-heading-gap'],
    'var(--leaf-component-drawer-gap,var(--leaf-dialog-gap))',
  );
  assert.equal(drawer('.leaf-drawer__header').gap, 'var(--leaf-dialog-heading-gap)');
  assert.equal(drawer('.leaf-drawer__icon')['border-radius'], '50%');
  assert.equal(drawer('.leaf-drawer__heading h2')['font-weight'], 'var(--leaf-font-weight,500)');
  assert.equal(drawer('.leaf-drawer__description')['font-size'], 'var(--leaf-font-size-sm)');
  assert.equal(drawer('.leaf-drawer__description')['line-height'], 'var(--leaf-line-height-sm)');
  assert.equal(drawer('.leaf-drawer-mask')['--leaf-drawer-offset'], 'var(--leaf-spacing-sm)');
  assert.equal(drawer('.leaf-drawer-mask').overflow, 'clip');
  assert.equal(drawer('.leaf-drawer-mask').padding, 'var(--leaf-drawer-offset)');
  assert.equal(
    drawer('.leaf-drawer-mask--right')['--leaf-drawer-enter'],
    'translate3d(calc(100% + var(--leaf-drawer-offset)),0,0)',
  );
  assert.equal(
    drawer('.leaf-drawer')['border-radius'],
    'var(--leaf-component-drawer-radius,var(--leaf-radius-lg))',
  );
  assert.equal(drawer('.leaf-drawer')['will-change'], 'transform');
  assert.equal(
    drawer('.leaf-drawer').transition,
    'transform calc(var(--leaf-motion-duration)* 2.5)cubic-bezier(0.32,0.72,0,1)',
  );
  assert.equal(
    drawer('.leaf-drawer-mask[data-state=closing] .leaf-drawer')['transition-duration'],
    'calc(var(--leaf-motion-duration)* 1.5)',
  );
  assert.equal(
    drawer('.leaf-drawer-mask[data-state=closing] .leaf-drawer')['transition-timing-function'],
    'cubic-bezier(0.32,0.72,0,1)',
  );
  assert.equal(
    drawer('.leaf-drawer-mask[data-state=closing] .leaf-drawer-backdrop')['transition-duration'],
    'calc(var(--leaf-motion-duration)* 1.5)',
  );
  assert.equal(drawer('.leaf-drawer__swipe-bar')['border-radius'], '999px');
});

test('modal dividers use the shared divider role and medium radius across modal and confirm', async () => {
  const modal = await compiledStyles('modal/modal.scss');
  const shared = modal('.leaf-modal');
  assert.equal(
    shared['--leaf-dialog-divider'],
    'var(--leaf-component-modal-border-color,var(--leaf-color-divider))',
  );
  assert.equal(shared['border-radius'], 'var(--leaf-component-modal-radius,var(--leaf-radius-md))');
  assert.equal(
    shared['box-shadow'],
    'var(--leaf-component-modal-shadow,var(--leaf-surface-shadow,var(--leaf-shadow-md)))',
  );
  const confirm = await compiledStyles('alert/alert.scss');
  assert.equal(
    confirm('.leaf-confirm')['border-radius'],
    'var(--leaf-component-confirm-radius,var(--leaf-component-modal-radius,var(--leaf-radius-md)))',
  );
  assert.equal(
    confirm('.leaf-confirm')['box-shadow'],
    'var(--leaf-component-confirm-shadow,var(--leaf-component-modal-shadow,var(--leaf-surface-shadow,var(--leaf-shadow-md))))',
  );
});

test('result icons share rounded tray geometry with neutral empty and soft semantic badges', async () => {
  const result = await compiledStyles('result/result.scss');
  const base = result('.leaf-result');
  assert.equal(base['--leaf-result-color'], 'var(--leaf-color-text)');
  assert.equal(base['--leaf-result-icon-bg'], 'var(--leaf-color-surface-muted)');
  assert.equal(base['--leaf-result-icon-border'], undefined);
  assert.equal(base.padding, 'var(--leaf-component-result-padding,20px 16px)');

  const tray = result('.leaf-result__icon:not(:has(> img))');
  assert.equal(tray.width, '40px');
  assert.equal(tray.height, '40px');
  assert.equal(tray.border, '0px');
  assert.equal(tray['border-radius'], 'var(--leaf-radius)');
  assert.equal(tray.background, 'var(--leaf-result-icon-bg)');

  const svg = result('.leaf-result__icon:not(:has(> img)) > svg');
  assert.equal(svg.width, '20px');
  assert.equal(svg.height, '20px');

  assert.equal(result('.leaf-result__icon').margin, '0 auto var(--leaf-spacing-md)');
  assert.equal(result('.leaf-result__title')['font-size'], 'var(--leaf-font-size-lg)');
  assert.equal(result('.leaf-result__title')['line-height'], 'var(--leaf-line-height-lg)');
  assert.equal(result('.leaf-result__description')['font-size'], 'var(--leaf-font-size-sm)');
  assert.equal(result('.leaf-result__description')['line-height'], 'var(--leaf-line-height-sm)');
  assert.equal(
    result('.leaf-result__title + .leaf-result__description')['margin-top'],
    'var(--leaf-spacing-sm)',
  );
  assert.equal(result('.leaf-result__content')['margin-top'], 'var(--leaf-spacing-lg)');
  assert.equal(result('.leaf-result__extra')['margin-top'], 'var(--leaf-spacing-md)');
  assert.throws(() => result('.leaf-result--sm'), /missing compiled rule/u);
  assert.throws(() => result('.leaf-result--info'), /missing compiled rule/u);

  for (const [selector, tone] of [
    ['success', 'success'],
    ['warning', 'warning'],
    ['danger', 'danger'],
    ['error', 'danger'],
  ]) {
    const rule = result(`.leaf-result--${selector}`);
    assert.equal(rule['--leaf-status-label-base'], `var(--leaf-color-${tone})`);
    assert.equal(rule['--leaf-status-label-background'], `var(--leaf-color-${tone}-soft)`);
    assert.equal(rule['--leaf-result-color'], 'var(--leaf-status-label-base)');
    assert.equal(rule['--leaf-result-icon-bg'], 'var(--leaf-status-label-background)');
  }
});
