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
      '.leaf-calendar-view .leaf-date-picker__day--selected:not(:disabled) .leaf-calendar__cell-label',
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

test('default Menu retains its own neutral palette while choice rows share Select feedback', async () => {
  const menu = await compiledStyles('menu/menu.scss');
  const palette = menu('.leaf-menu');
  assert.equal(
    palette['--leaf-menu-unselected-color'],
    'color-mix(in srgb,currentColor 80%,var(--leaf-color-surface))',
  );
  assert.equal(palette['--leaf-menu-neutral-background'], 'rgba(0,0,0,0.08)');
  for (const [file, selector] of [
    ['select/select.scss', '.leaf-select__panel .leaf-floating__option'],
    ['tree/tree.scss', '.leaf-tree__row'],
    ['autocomplete/autocomplete.scss', '.leaf-autocomplete__panel .leaf-floating__option'],
    ['mentions/mentions.scss', '.leaf-mentions__panel .leaf-floating__option'],
    ['cascader/cascader.scss', '.leaf-cascader__column .leaf-floating__option'],
    ['dropdown/dropdown.scss', '.leaf-dropdown:not(.leaf-menu__popup) .leaf-floating__option'],
  ]) {
    const rule = await compiledStyles(file);
    assert.equal(
      rule(selector).color,
      'color-mix(in srgb,currentColor 70%,var(--leaf-color-surface))',
      file,
    );
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
  }
});
