import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compiledStyles } from './compiled-styles.mjs';

test('compiled option and selection consumers expose their shared family roles', async () => {
  for (const [component, family, property, value] of [
    ['dropdown', 'danger-soft', 'background', 'danger-soft'],
    ['menu', 'danger-soft', 'active-background', 'danger-soft-active'],
    ['pagination', 'accent-soft', 'border', 'primary-border'],
    ['transfer', 'accent-soft', 'background', 'primary-soft'],
    ['upload', 'accent-soft', 'border', 'primary-border'],
    ['splitter', 'accent-soft', 'border', 'primary-border'],
    ['tree', 'accent-soft', 'background', 'primary-soft'],
  ]) {
    const rule = await compiledStyles(`${component}/${component}.scss`);
    assert.equal(
      rule(`.leaf-${component}`)[`--leaf-${family}-${property}`],
      `var(--leaf-color-${value})`,
    );
  }
});

test('compiled solid selections retain base fills, foregrounds and visible boundaries', async () => {
  for (const [file, selector, border] of [
    [
      'calendar/calendar.scss',
      '.leaf-calendar-view__cell[aria-selected=true] .leaf-calendar-view__day:not(:disabled) .leaf-calendar-view__number',
      'box-shadow',
    ],
    ['datepicker/datepicker.scss', '.leaf-date-picker__day--selected', 'box-shadow'],
    ['steps/steps.scss', '[data-status=finish] .leaf-steps__icon', 'border-color'],
  ]) {
    const rule = await compiledStyles(file);
    const selected = rule(selector);
    assert.equal(selected.background, 'var(--leaf-color-primary)');
    assert.equal(selected.color, 'var(--leaf-color-on-primary)');
    assert.ok(selected[border].includes('--leaf-color-primary-'), `${file}: selected boundary`);
  }
});

test('compiled tree drag preview keeps the medium shadow role', async () => {
  const rule = await compiledStyles('tree/tree.scss');
  assert.equal(rule('.leaf-tree__drag-preview')['box-shadow'], 'var(--leaf-shadow-md)');
});

test('Menu popup and inline rows share text and interaction paint', async () => {
  const menu = await compiledStyles('menu/menu.scss');
  for (const selector of [
    '.leaf-menu__item',
    '.leaf-menu__popup.leaf-dropdown .leaf-floating__option',
  ]) {
    assert.equal(
      menu(selector).color,
      'var(--leaf-menu-item-color,var(--leaf-menu-unselected-color))',
    );
    assert.equal(
      menu(
        `${selector}:is(:hover, :focus-visible, :active):not(:disabled):not([aria-disabled=true])`,
      ).background,
      'transparent',
    );
  }
  assert.equal(menu('.leaf-menu__popup.leaf-dropdown').color, menu('.leaf-menu').color);
  assert.equal(menu('.leaf-menu__popup.leaf-dropdown .leaf-dropdown__arrow').color, 'inherit');
});

test('neutral Menu uses the requested light fill without changing other appearances', async () => {
  const menu = await compiledStyles('menu/menu.scss');
  for (const selector of ['.leaf-menu', '.leaf-menu__popup']) {
    const palette = menu(selector);
    assert.equal(
      palette['--leaf-menu-unselected-color'],
      'color-mix(in srgb,currentColor 80%,var(--leaf-color-surface))',
    );
    assert.equal(
      palette['--leaf-menu-neutral-background'],
      'light-dark(rgb(241 241 242),rgba(0,0,0,0.08))',
    );
    for (const state of ['hover', 'selected', 'active']) {
      assert.equal(
        palette[`--leaf-menu-${state}-background`],
        'var(--leaf-menu-neutral-background)',
      );
    }
  }
  for (const selector of ['.leaf-menu--raised', '.leaf-menu__popup--raised']) {
    const palette = menu(selector);
    assert.equal(palette['--leaf-menu-selected-background'], 'var(--leaf-color-surface)');
    assert.equal(palette['--leaf-menu-hover-opacity'], '0');
    assert.equal(palette['--leaf-menu-active-background'], 'rgba(0,0,0,0.04)');
  }
  for (const selector of ['.leaf-menu--primary', '.leaf-menu__popup--primary']) {
    const palette = menu(selector);
    assert.equal(palette['--leaf-menu-selected-background'], 'var(--leaf-color-primary-alpha-10)');
    assert.equal(palette['--leaf-menu-hover-opacity'], '0');
    assert.equal(palette['--leaf-menu-active-background'], 'var(--leaf-color-primary-alpha-4)');
  }
});

test('choice rows retain Select feedback independently of the neutral Menu appearance', async () => {
  for (const [file, selector] of [
    ['select/select.scss', '.leaf-select__panel .leaf-floating__option'],
    ['tree/tree.scss', '.leaf-tree__row'],
    ['autocomplete/autocomplete.scss', '.leaf-autocomplete__panel .leaf-floating__option'],
    ['mentions/mentions.scss', '.leaf-mentions__panel .leaf-floating__option'],
    ['cascader/cascader.scss', '.leaf-cascader__column .leaf-floating__option'],
    ['dropdown/dropdown.scss', '.leaf-dropdown:not(.leaf-menu__popup) .leaf-floating__option'],
  ]) {
    const rule = await compiledStyles(file);
    assert.equal(rule(selector).color, 'inherit', file);
    const layer = rule(`${selector}::before`);
    assert.equal(layer.background, 'transparent', file);
    assert.equal(layer.inset, '0px', file);
    assert.equal(
      layer.transition,
      'background-color var(--leaf-motion-color)var(--leaf-motion-easing)',
      file,
    );
    const active = rule(
      `${selector}:is(:hover, :focus-visible, :active, [data-highlighted=true]):not(:disabled):not([aria-disabled=true]):not([data-disabled])::before`,
    );
    assert.equal(active.background, 'color-mix(in srgb,rgba(0,0,0,0.08),transparent)', file);
    assert.equal(
      rule(`${selector}:is([aria-selected=true], [aria-checked=true], [data-selected])`).color,
      'inherit',
      file,
    );
    assert.equal(
      rule(`${selector}:is(:disabled, [aria-disabled=true], [data-disabled])`).color,
      'var(--leaf-color-text-muted)',
      file,
    );
  }
});
