import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compiledStyles } from './compiled-styles.mjs';

test('link buttons brighten on hover and darken on press while respecting explicit paint', async () => {
  const button = await compiledStyles('button/button.scss');
  const base = button('.leaf-button');
  assert.equal(
    base['--leaf-button-ink-hover'],
    'var(--leaf-color-primary-link-hover,var(--leaf-button-ink))',
  );
  assert.equal(
    base['--leaf-button-ink-active'],
    'var(--leaf-color-primary-link-active,var(--leaf-button-active))',
  );
  assert.equal(base['--leaf-button-hover-color'], 'var(--leaf-button-base-color)');
  const danger = button('.leaf-button--danger');
  assert.equal(
    danger['--leaf-button-ink-hover'],
    'var(--leaf-color-danger-link-hover,var(--leaf-button-ink))',
  );
  assert.equal(
    danger['--leaf-button-ink-active'],
    'var(--leaf-color-danger-link-active,var(--leaf-button-active))',
  );
  assert.equal(
    button('.leaf-button--link').transition,
    'color var(--leaf-motion-color)cubic-bezier(0.645,0.045,0.355,1)',
  );
  const link = button('.leaf-button:is(.leaf-button--link)');
  for (const state of ['hover', 'active']) {
    assert.equal(
      link[`--leaf-button-${state}-color`],
      `var(--leaf-component-button-color,var(--leaf-button-ink-${state}))`,
    );
  }
  const variants =
    '.leaf-button:is(.leaf-button--solid, .leaf-button--outline, .leaf-button--text, .leaf-button--link)';
  assert.equal(
    button(`${variants}:hover:not(:disabled):not([data-loading]):where(:not(:focus-visible))`)
      .color,
    'var(--leaf-component-button-hover-color,var(--leaf-button-hover-color))',
  );
  assert.equal(
    button(`${variants}:active:not(:disabled):not([data-loading])`).color,
    'var(--leaf-component-button-active-color,var(--leaf-button-active-color))',
  );
  assert.equal(
    button(`${variants}:disabled`).color,
    'var(--leaf-component-button-disabled-color,var(--leaf-button-base-color))',
  );
});

test('line Tabs use link feedback for unselected text without changing other appearances', async () => {
  const tabs = await compiledStyles('tabs/tabs.scss');
  const line = tabs('.leaf-tabs--line .leaf-tabs__tab');
  assert.equal(
    line['--leaf-tabs-tab-color'],
    'var(--leaf-component-tabs-muted-color,var(--leaf-component-tabs-color,var(--leaf-color-text)))',
  );
  const selected = tabs('.leaf-tabs--line .leaf-tabs__tab[aria-selected=true]');
  assert.equal(
    selected['--leaf-tabs-tab-color'],
    'var(--leaf-component-tabs-color,var(--leaf-color-primary))',
  );
  for (const state of ['hover', 'active']) {
    assert.equal(
      line[`--leaf-tabs-tab-${state}-color`],
      `var(--leaf-component-tabs-color,var(--leaf-color-primary-${state === 'active' ? 'link-active' : 'hover'}))`,
    );
    assert.equal(selected[`--leaf-tabs-tab-${state}-color`], 'var(--leaf-tabs-tab-color)');
  }
  assert.equal(line.transition, 'color calc(var(--leaf-motion-color)* 1.5)ease');
  for (const state of ['hover', 'active']) {
    const selector =
      state === 'hover'
        ? '.leaf-tabs__tab:hover:not(:disabled):where(:not(:focus-visible))'
        : '.leaf-tabs__tab:active:not(:disabled)';
    assert.equal(
      tabs(selector).color,
      `var(--leaf-component-tabs-${state}-color,var(--leaf-tabs-tab-${state}-color))`,
    );
  }
  for (const appearance of ['card', 'segmented']) {
    assert.equal(
      tabs(`.leaf-tabs--${appearance} .leaf-tabs__tab`)['--leaf-tabs-tab-color'],
      'var(--leaf-component-tabs-muted-color,var(--leaf-segmented-muted-color))',
    );
    assert.equal(
      tabs(`.leaf-tabs--${appearance} .leaf-tabs__tab[aria-selected=true]`)[
        '--leaf-tabs-tab-color'
      ],
      'var(--leaf-component-tabs-color,var(--leaf-color-text))',
    );
  }
});

test('Tabs increase large spacing and keep Card insets with explicit height overrides', async () => {
  const tabs = await compiledStyles('tabs/tabs.scss');
  const large = tabs('.leaf-tabs--lg');
  assert.equal(large['--leaf-tabs-item-padding'], '18px');
  assert.equal(large['--leaf-tabs-item-gap'], '8px');
  assert.equal(large['--leaf-tabs-track-padding'], '4px');
  for (const selector of [
    '.leaf-tabs__track',
    '.leaf-tabs--card .leaf-tabs__track',
    '.leaf-tabs--segmented .leaf-tabs__track',
  ]) {
    assert.match(tabs(selector).gap, /--leaf-component-tabs-gap/);
    assert.match(tabs(selector).gap, /--leaf-tabs-item-gap/);
  }
  const card = await compiledStyles('card/card.scss');
  assert.equal(
    card('.leaf-card__tabs > .leaf-tabs__header .leaf-tabs__tab')['padding-inline'],
    'var(--leaf-tabs-item-padding,10px)',
  );
  for (const [selector, suffix] of [
    ['.leaf-card__tabs', ''],
    ['.leaf-card__tabs.leaf-tabs--sm', '-sm'],
    ['.leaf-card__tabs.leaf-tabs--lg', '-lg'],
  ]) {
    assert.equal(
      card(selector)['--leaf-current-control-height'],
      `var(--leaf-component-tabs-height${suffix},calc(var(--leaf-control-height${suffix})- 4px))`,
    );
  }
  assert.equal(
    card('.leaf-card > .leaf-card__tabs:first-child > .leaf-tabs__header')[
      '--leaf-card-tab-heading-height'
    ].replace(/\s+/g, ''),
    'max(var(--leaf-current-control-height),calc(var(--leaf-card-title-line-height)+var(--leaf-card-heading-gap)*2-4px))',
  );
  for (const property of ['padding', 'gap']) {
    assert.equal(tabs('.leaf-tabs')[`--leaf-tabs-item-${property}`], 'initial');
  }
});

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
    assert.equal(palette['--leaf-menu-selected-color'], 'var(--leaf-color-primary)');
    assert.equal(palette['--leaf-menu-hover-color'], 'var(--leaf-color-primary)');
    assert.equal(
      palette['--leaf-menu-selected-background'],
      'color-mix(in srgb,var(--leaf-color-primary)5%,transparent)',
    );
    assert.equal(palette['--leaf-menu-hover-opacity'], '0');
    assert.equal(palette['--leaf-menu-active-background'], 'var(--leaf-color-primary-alpha-4)');
    assert.equal(palette['--leaf-menu-hover-background'], 'transparent');
  }
});

test('ColorPicker uses shared Input geometry and centers swatch-only triggers', async () => {
  const picker = await compiledStyles('colorpicker/colorpicker.scss');
  const input = await compiledStyles('input/input.scss');
  for (const property of ['border-radius', 'border', 'height', 'padding-inline']) {
    assert.equal(picker('.leaf-input')[property], input('.leaf-input')[property]);
  }
  assert.equal(
    picker('.leaf-color-picker:not([data-show-text]) .leaf-color-picker__trigger')[
      'justify-content'
    ],
    'center',
  );
});

test('Input fills its shell and only rounds native edges that meet the outer frame', async () => {
  const input = await compiledStyles('input/input.scss');
  assert.equal(input('.leaf-input')['padding-inline'], '0px');
  const native = input('.leaf-input__native');
  assert.equal(native.width, '100%');
  assert.equal(native.height, '100%');
  assert.equal(native.padding, '0px');
  assert.equal(native['border-radius'], '0px');
  for (const [child, side] of [
    ['first', 'start'],
    ['last', 'end'],
  ]) {
    const edge = input(`.leaf-input__native:${child}-child`);
    assert.equal(edge[`padding-inline-${side}`], 'var(--leaf-density-field-padding)');
    for (const corner of ['start', 'end']) {
      assert.equal(
        edge[`border-${corner}-${side}-radius`],
        'max(0px,var(--leaf-component-input-radius,var(--leaf-radius))- var(--leaf-field-border-width))',
      );
      assert.equal(
        input(`.leaf-input-group--compact > *:not(:${child}-child) > .leaf-input__native`)[
          `border-${corner}-${side}-radius`
        ],
        '0px',
      );
    }
    assert.equal(
      input(`.leaf-input > :${child}-child:not(.leaf-input__native)`)[`margin-inline-${side}`],
      'var(--leaf-density-field-padding)',
    );
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
