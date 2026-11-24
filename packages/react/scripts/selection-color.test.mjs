import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compiledStyles } from './compiled-styles.mjs';

test('link buttons brighten on hover and darken on press while danger is a single soft-fill variant', async () => {
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
  const danger = button('.leaf-button:is(.leaf-button--danger)');
  assert.equal(danger['--leaf-button-rest-color'], 'var(--leaf-color-danger)');
  assert.equal(danger['--leaf-button-rest-background'], 'var(--leaf-danger-soft-background)');
  assert.equal(danger['--leaf-button-rest-border'], 'transparent');
  assert.equal(danger['--leaf-button-rest-shadow'], 'none');
  assert.equal(
    danger['--leaf-button-hover-background'],
    'color-mix(in srgb,var(--leaf-danger-soft-active-background)50%,var(--leaf-danger-soft-background))',
  );
  assert.equal(
    danger['--leaf-button-active-background'],
    'var(--leaf-danger-soft-active-background)',
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
  const solid = button('.leaf-button:is(.leaf-button--solid)');
  assert.equal(solid['--leaf-button-rest-shadow'], 'var(--leaf-shadow-control)');
  assert.equal(
    solid['--leaf-button-hover-background'],
    'var(--leaf-component-button-background,var(--leaf-color-primary-hover))',
  );
  assert.equal(solid['--leaf-button-active-background'], 'var(--leaf-button-active)');

  const outline = button('.leaf-button:is(.leaf-button--outline)');
  assert.equal(outline['--leaf-button-rest-color'], 'var(--leaf-color-text)');
  assert.equal(outline['--leaf-button-rest-background'], 'var(--leaf-color-surface)');
  assert.equal(outline['--leaf-button-rest-border'], 'var(--leaf-color-border)');
  assert.equal(outline['--leaf-button-rest-shadow'], 'var(--leaf-shadow-control)');
  assert.equal(
    outline['--leaf-button-hover-color'],
    'var(--leaf-component-button-color,var(--leaf-color-primary-hover))',
  );
  assert.equal(
    outline['--leaf-button-hover-border'],
    'var(--leaf-component-button-border-color,var(--leaf-frame-border-color,var(--leaf-color-primary-hover)))',
  );
  assert.equal(outline['--leaf-button-hover-background'], undefined);
  assert.equal(
    outline['--leaf-button-active-color'],
    'var(--leaf-component-button-color,var(--leaf-color-primary-link-active))',
  );
  assert.equal(outline['--leaf-button-active-background'], 'var(--leaf-button-base-background)');
  assert.equal(
    outline['--leaf-button-active-border'],
    'var(--leaf-component-button-border-color,var(--leaf-frame-border-color,var(--leaf-color-primary-link-active)))',
  );
  const variants =
    '.leaf-button:is(.leaf-button--solid, .leaf-button--outline, .leaf-button--text, .leaf-button--link, .leaf-button--danger)';
  assert.throws(
    () => button(`${variants}:active:not(:disabled):not([data-loading]):not(.leaf-button--link)`),
    /missing compiled rule/u,
  );
  assert.equal(
    button(`${variants}:active:not(:disabled):not([data-loading])`).translate,
    undefined,
  );
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
    button(`${variants}:active:not(:disabled):not([data-loading])`)['border-color'],
    'var(--leaf-component-button-active-border-color,var(--leaf-button-active-border))',
  );
  assert.equal(
    button(`${variants}:disabled`).color,
    'var(--leaf-component-button-disabled-color,var(--leaf-button-base-color))',
  );
});

test('line Tabs use primary selection feedback and sliding indicator without solid or pill variants', async () => {
  const tabs = await compiledStyles('tabs/tabs.scss');
  const line = tabs('.leaf-tabs--line > .leaf-tabs__header .leaf-tabs__tab');
  assert.equal(
    line['--leaf-tabs-tab-color'],
    'var(--leaf-component-tabs-muted-color,var(--leaf-component-tabs-color,var(--leaf-color-text)))',
  );
  assert.equal(
    line['--leaf-tabs-tab-hover-color'],
    'var(--leaf-component-tabs-color,var(--leaf-color-primary-hover))',
  );
  assert.equal(
    line['--leaf-tabs-tab-active-color'],
    'var(--leaf-component-tabs-color,var(--leaf-color-primary-link-active))',
  );
  const selected = tabs(
    '.leaf-tabs--line > .leaf-tabs__header .leaf-tabs__tab[aria-selected=true]',
  );
  assert.equal(
    selected['--leaf-tabs-tab-color'],
    'var(--leaf-component-tabs-color,var(--leaf-color-primary))',
  );
  for (const state of ['hover', 'active']) {
    assert.equal(selected[`--leaf-tabs-tab-${state}-color`], 'var(--leaf-tabs-tab-color)');
  }
  assert.equal(line.transition, 'color calc(var(--leaf-motion-color)* 1.5)ease');
  assert.equal(selected['text-shadow'], '0 0 0.25px currentColor');
  for (const state of ['hover', 'active']) {
    const selector =
      state === 'hover'
        ? '.leaf-tabs__tab:hover:not(:disabled):not([aria-selected=true]):where(:not(:focus-visible))'
        : '.leaf-tabs__tab:active:not(:disabled):not([aria-selected=true])';
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
  assert.equal(
    tabs('.leaf-tabs__indicator::after').background,
    'var(--leaf-component-tabs-indicator-color,var(--leaf-color-primary))',
  );
  assert.equal(
    tabs('.leaf-tabs--segmented .leaf-tabs__indicator')['box-shadow'],
    'var(--leaf-component-tabs-indicator-shadow,var(--leaf-shadow-sm))',
  );
  for (const selector of [
    '.leaf-tabs--solid.leaf-tabs--card .leaf-tabs__indicator',
    '.leaf-tabs--solid.leaf-tabs--segmented .leaf-tabs__indicator',
    '.leaf-tabs--pill.leaf-tabs--segmented .leaf-tabs__list',
    '.leaf-tabs--pill.leaf-tabs--segmented .leaf-tabs__indicator',
  ]) {
    assert.throws(() => tabs(selector), /missing compiled rule/u);
  }
});

test('line Tabs share 0.17.x spacing, bottom hairline divider, and sliding indicator', async () => {
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
  const lineRoot = tabs('.leaf-tabs--line');
  assert.equal(lineRoot['--leaf-tabs-item-gap'], '32px');
  assert.equal(lineRoot['--leaf-tabs-line-padding-block'], '12px');
  assert.equal(
    lineRoot['--leaf-tabs-line-height'],
    'calc(var(--leaf-component-tabs-font-size,var(--leaf-current-font-size))+ 8px)',
  );
  assert.equal(
    lineRoot['--leaf-current-control-height'],
    'var(--leaf-component-tabs-height,calc(var(--leaf-tabs-line-height)+ var(--leaf-tabs-line-padding-block)*2))',
  );
  const lineSm = tabs('.leaf-tabs--line.leaf-tabs--sm');
  assert.equal(lineSm['--leaf-tabs-line-padding-block'], '8px');
  assert.equal(lineSm['--leaf-current-font-size'], 'var(--leaf-font-size)');
  assert.equal(tabs('.leaf-tabs--line.leaf-tabs--lg')['--leaf-tabs-line-padding-block'], '16px');
  const line = tabs('.leaf-tabs--line > .leaf-tabs__header .leaf-tabs__tab');
  assert.equal(line['padding-inline'], '0px');
  assert.equal(line['border-radius'], '0px');
  assert.equal(line['min-height'], 'var(--leaf-current-control-height)');
  assert.equal(line['line-height'], 'var(--leaf-tabs-line-height)');
  assert.match(
    tabs('.leaf-tabs--line > .leaf-tabs__header .leaf-tabs__indicator[data-animate=true]')
      .transition,
    /transform calc\(var\(--leaf-motion-color\)\* 1\.5\)/,
  );
  const headerDivider = tabs('.leaf-tabs--line > .leaf-tabs__header::before');
  assert.equal(headerDivider['border-block-end'], '1px solid');
  assert.equal(
    headerDivider['border-block-end-color'],
    'var(--leaf-component-tabs-border-color,var(--leaf-color-divider))',
  );
  const bottomRule = tabs(
    '.leaf-tabs--line.leaf-tabs--bottom > .leaf-tabs__header::before, .leaf-tabs--line.leaf-tabs--bottom > .leaf-tabs__header .leaf-tabs__indicator::after',
  );
  assert.equal(bottomRule.top, '0px');
  assert.equal(bottomRule.bottom, 'auto');
  assert.throws(
    () => tabs('.leaf-tabs--line > .leaf-tabs__header .leaf-tabs__tab::after'),
    /missing compiled rule/u,
  );
  const card = await compiledStyles('card/card.scss');
  assert.equal(card('.leaf-card__tabs')['--leaf-current-control-height'], undefined);
  const cardHeader = card('.leaf-card__tabs > .leaf-tabs__header');
  assert.equal(cardHeader['padding-block'], '0px');
  assert.equal(cardHeader['min-height'], undefined);
  assert.equal(cardHeader['border-block-end'], undefined);
  for (const property of ['padding', 'gap']) {
    assert.equal(tabs('.leaf-tabs')[`--leaf-tabs-item-${property}`], 'initial');
  }
});

test('field popup text follows scoped control typography while keeping explicit font overrides', async () => {
  for (const [file, selector, component] of [
    ['select/select.scss', '.leaf-floating.leaf-select__panel', 'select'],
    ['autocomplete/autocomplete.scss', '.leaf-floating.leaf-autocomplete__panel', 'auto-complete'],
    ['cascader/cascader.scss', '.leaf-floating.leaf-cascader__panel', 'cascader'],
    ['treeselect/treeselect.scss', '.leaf-floating.leaf-tree-select__panel', 'tree-select'],
    ['datepicker/datepicker.scss', '.leaf-floating.leaf-picker-panel', 'date-picker'],
  ]) {
    const rule = await compiledStyles(file);
    assert.equal(
      rule(selector)['font-size'],
      `var(--leaf-component-${component}-font-size,var(--leaf-current-font-size,var(--leaf-font-size)))`,
      file,
    );
  }
  const mentions = await compiledStyles('mentions/mentions.scss');
  assert.equal(
    mentions('.leaf-floating.leaf-mentions__panel')['font-size'],
    'var(--leaf-component-mentions-font-size,var(--leaf-component-textarea-font-size,var(--leaf-current-font-size,var(--leaf-font-size))))',
  );
  const treeSelect = await compiledStyles('treeselect/treeselect.scss');
  assert.equal(
    treeSelect('.leaf-tree-select__panel .leaf-tree')['font-size'],
    'var(--leaf-component-tree-font-size,inherit)',
  );
});

test('compiled option and selection consumers expose their shared family roles', async () => {
  for (const [component, family, property, value] of [
    ['dropdown', 'danger-soft', 'background', 'danger-soft'],
    ['menu', 'danger-soft', 'active-background', 'danger-soft-hover'],
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
  ]) {
    const rule = await compiledStyles(file);
    const selected = rule(selector);
    assert.equal(selected.background, 'var(--leaf-color-primary)');
    assert.equal(selected.color, 'var(--leaf-color-on-primary)');
    assert.ok(selected[border].includes('--leaf-color-primary'), `${file}: selected boundary`);
  }
  const steps = await compiledStyles('steps/steps.scss');
  const finished = steps('[data-status=finish] .leaf-steps__icon');
  assert.equal(finished.background, 'var(--leaf-color-text)');
  assert.equal(finished.color, 'var(--leaf-color-surface)');
  assert.equal(finished['border-color'], 'var(--leaf-color-text)');
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

test('neutral Menu separates hover choice paint from muted surface selection without changing other appearances', async () => {
  const menu = await compiledStyles('menu/menu.scss');
  for (const selector of ['.leaf-menu', '.leaf-menu__popup']) {
    const palette = menu(selector);
    assert.equal(
      palette['--leaf-menu-unselected-color'],
      'color-mix(in srgb,currentColor 80%,var(--leaf-color-surface))',
    );
    assert.equal(palette['--leaf-menu-neutral-background'], 'var(--leaf-color-surface-muted)');
    assert.equal(
      palette['--leaf-menu-hover-background'],
      'color-mix(in srgb,var(--leaf-color-option-hover)32%,transparent)',
    );
    for (const state of ['selected', 'active']) {
      assert.equal(
        palette[`--leaf-menu-${state}-background`],
        'var(--leaf-menu-neutral-background)',
      );
    }
  }
  assert.equal(menu('.leaf-menu__item::before').inset, '0px');
  assert.equal(menu('.leaf-menu__submenu .leaf-menu__item').height, undefined);
  assert.equal(
    menu('.leaf-menu__submenu .leaf-menu__item')['min-height'],
    'max(24px,var(--leaf-control-height)- 2px)',
  );
  assert.equal(
    menu('.leaf-menu__popup.leaf-dropdown .leaf-floating__option')['min-height'],
    'max(24px,var(--leaf-control-height)- 2px)',
  );
  for (const selector of ['.leaf-menu--raised', '.leaf-menu__popup--raised']) {
    const palette = menu(selector);
    assert.equal(palette['--leaf-menu-selected-background'], 'var(--leaf-color-surface)');
    assert.equal(palette['--leaf-menu-selected-shadow'], 'var(--leaf-shadow-xs)');
    assert.equal(palette['--leaf-menu-hover-opacity'], '0');
    assert.equal(
      palette['--leaf-menu-active-background'],
      'color-mix(in srgb,var(--leaf-color-option-hover)32%,transparent)',
    );
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
        'max(0px,var(--leaf-component-input-radius,var(--leaf-current-radius,var(--leaf-radius)))- var(--leaf-field-border-width))',
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

test('choice rows retain neutral hover while accent-selected popups keep primary-soft selection immune to hover', async () => {
  for (const [file, selector, selectedAccent] of [
    ['select/select.scss', '.leaf-select__panel .leaf-floating__option', true],
    ['cascader/cascader.scss', '.leaf-cascader__panel .leaf-floating__option', true],
    ['timepicker/timepicker.scss', '.leaf-time-picker__column .leaf-floating__option', true],
    ['tree/tree.scss', '.leaf-tree__row', false],
    ['autocomplete/autocomplete.scss', '.leaf-autocomplete__panel .leaf-floating__option', false],
    ['mentions/mentions.scss', '.leaf-mentions__panel .leaf-floating__option', false],
    [
      'dropdown/dropdown.scss',
      '.leaf-dropdown:not(.leaf-menu__popup) .leaf-floating__option',
      false,
    ],
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
    const activeSelector = selectedAccent
      ? `${selector}:is(:hover, :focus-visible, :active, [data-highlighted=true]):not(:disabled):not([aria-disabled=true]):not([data-disabled]):not([aria-selected=true]):not([data-selected])::before`
      : `${selector}:is(:hover, :focus-visible, :active, [data-highlighted=true]):not(:disabled):not([aria-disabled=true]):not([data-disabled])::before`;
    assert.equal(
      rule(activeSelector).background,
      'color-mix(in srgb,var(--leaf-color-option-hover)32%,transparent)',
      file,
    );
    if (selectedAccent) {
      assert.equal(
        rule(`${selector}:is([aria-selected=true], [data-selected])::before`).background,
        'var(--leaf-color-primary-soft)',
        file,
      );
    }
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
  const treeSelect = await compiledStyles('treeselect/treeselect.scss');
  const treeSelectRow = '.leaf-tree-select__panel .leaf-tree__row';
  assert.equal(
    treeSelect(`${treeSelectRow}:is([aria-selected=true], [data-selected])::before`).background,
    'var(--leaf-color-primary-soft)',
  );
  assert.equal(
    treeSelect(
      `${treeSelectRow}:is([aria-selected=true], [data-selected]):is(:hover, :focus-visible, :active, [data-highlighted=true]):not(:disabled):not([aria-disabled=true]):not([data-disabled])::before`,
    ).background,
    'var(--leaf-color-primary-soft)',
  );
});
