import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import * as sass from 'sass-embedded';
import { compiledStyles, styleDeclarations } from './compiled-styles.mjs';

test('style contracts ignore formatting, declaration order and selector grouping', () => {
  const first = styleDeclarations(
    '.sample { color: var(--ink, var(--fallback)); background: var(--surface); }',
  );
  const second = styleDeclarations(
    '.other, .sample { background: var( --surface ); color: var(--ink,var(--fallback)); }',
  );
  assert.deepEqual(first('.sample'), second('.sample'));
});

test('style contracts retain changed values and later declarations and reject missing selectors', () => {
  const rule = styleDeclarations(
    '.sample { color: red; } .sample { color: blue; } :is(.a,.b) { color: green; }',
  );
  assert.equal(rule('.sample').color, 'blue');
  assert.equal(rule(':is(.a,.b)').color, 'green');
  assert.throws(() => rule('.missing'), /missing compiled rule/u);
});

test('style contracts unwrap rules inside named @layer blocks', () => {
  const rule = styleDeclarations('@layer leaf-ui { .sample { color: red; width: 240px; } }');
  assert.equal(rule('.sample').color, 'red');
  assert.equal(rule('.sample').width, '240px');
});

test('floating arrows swap dimensions on left/right sides and stay visible outside scrollbars', async () => {
  for (const [file, prefix, size, borderWidth] of [
    ['tooltip/tooltip.scss', '.leaf-tooltip', '8px', '0px'],
    ['popover/popover.scss', '.leaf-popover', '10px', 'var(--leaf-surface-border,1px)'],
  ]) {
    const styles = await compiledStyles(file);
    assert.equal(styles(`${prefix}.leaf-floating.leaf-scrollbar`).overflow, 'visible');
    const root = styles(prefix);
    assert.equal(root['--leaf-floating-arrow-size'], size);
    assert.equal(root['--leaf-floating-arrow-border-width'], borderWidth);
    const base = styles(`${prefix}::before`);
    assert.equal(base.width, 'var(--leaf-floating-arrow-size)');
    assert.equal(base.height, 'var(--leaf-floating-arrow-size)');
    const top = styles(`${prefix}[data-side=top]::before`);
    assert.equal(top.bottom, '0px');
    assert.equal(top.left, 'var(--leaf-floating-arrow-x,50%)');
    const bottom = styles(`${prefix}[data-side=bottom]::before`);
    assert.equal(bottom.top, '0px');
    assert.equal(bottom.left, 'var(--leaf-floating-arrow-x,50%)');
    const left = styles(`${prefix}[data-side=left]::before`);
    assert.equal(left.right, '0px');
    assert.equal(left.top, 'var(--leaf-floating-arrow-y,50%)');
    const right = styles(`${prefix}[data-side=right]::before`);
    assert.equal(right.left, '0px');
    assert.equal(right.top, 'var(--leaf-floating-arrow-y,50%)');
  }
});

test('button styles shrink padding only on the icon side with rtl mirroring and override priority', async () => {
  const styles = await compiledStyles('button/button.scss');
  const base = styles('.leaf-button');
  assert.equal(base['--leaf-button-padding-x'], '15px');
  assert.equal(base['--leaf-button-icon-padding-x'], '11px');
  assert.equal(base['--leaf-button-padding-inline-start'], 'var(--leaf-button-padding-x)');
  assert.equal(base['--leaf-button-padding-inline-end'], 'var(--leaf-button-padding-x)');
  assert.equal(
    base.padding,
    'var(--leaf-component-button-padding,0 var(--leaf-button-padding-inline-end)0 var(--leaf-button-padding-inline-start))',
  );
  const small = styles('.leaf-button--sm');
  assert.equal(small['--leaf-button-padding-x'], '11px');
  assert.equal(small['--leaf-button-icon-padding-x'], '7px');
  const large = styles('.leaf-button--lg');
  assert.equal(large['--leaf-button-padding-x'], '19px');
  assert.equal(large['--leaf-button-icon-padding-x'], '15px');
  assert.equal(
    styles('.leaf-button:where(:dir(rtl))').padding,
    'var(--leaf-component-button-padding,0 var(--leaf-button-padding-inline-start)0 var(--leaf-button-padding-inline-end))',
  );

  const startRule = styles(
    '.leaf-button:not(.leaf-button--link):is(:has([data-icon=inline-start]),\n' +
      '  :not([data-loading]):not([data-leading-text]):has(> svg:not(.leaf-button__spinner):not([data-icon]):first-child))',
  );
  assert.equal(
    startRule['--leaf-button-padding-inline-start'],
    'var(--leaf-button-icon-padding-x)',
  );
  assert.equal(startRule['--leaf-button-padding-inline-end'], undefined);

  const endRule = styles(
    '.leaf-button:not(.leaf-button--link):is(:not([data-loading]):has([data-icon=inline-end]),\n' +
      '  :has(> :not(svg)[data-icon=inline-end], > :not(svg) [data-icon=inline-end]),\n' +
      '  :not([data-loading]):not([data-trailing-text]):has(> svg:not(.leaf-button__spinner):not([data-icon]):last-child))',
  );
  assert.equal(endRule['--leaf-button-padding-inline-end'], 'var(--leaf-button-icon-padding-x)');
  assert.equal(endRule['--leaf-button-padding-inline-start'], undefined);

  assert.equal(styles('.leaf-button--link').padding, '0px');
  assert.equal(styles('.leaf-button--icon').padding, '0px');
});

test('attached button group carries split-button dividers across variants without leaf-split-button', async () => {
  const styles = await compiledStyles('button/button.scss');
  assert.throws(() => styles('.leaf-split-button'), /missing compiled rule \.leaf-split-button/);

  const attached = styles('.leaf-button-group--attached');
  assert.equal(attached.isolation, 'isolate');
  assert.equal(attached.gap, '0px');

  assert.equal(styles('.leaf-button-group--attached > .leaf-button')['z-index'], '1');
  assert.equal(
    styles('.leaf-button-group--attached > .leaf-button + .leaf-button:not(.leaf-button--outline)')[
      'margin-inline-start'
    ],
    '0px',
  );
  assert.equal(
    styles('.leaf-button-group--attached > .leaf-button--outline')[
      '--leaf-button-group-divider-color'
    ],
    'var(--leaf-component-button-border-color,var(--leaf-frame-border-color,var(--leaf-color-border)))',
  );
  assert.equal(
    styles(
      '.leaf-button-group--attached > .leaf-button--outline:not(:last-child):not(:hover):not(:active)',
    )['border-inline-end-color'],
    'var(--leaf-button-group-divider-color)',
  );
  assert.equal(
    styles(
      '.leaf-button-group--attached > .leaf-button--outline:not(:first-child):not(:hover):not(:active)',
    )['border-inline-start-color'],
    'var(--leaf-button-group-divider-color)',
  );

  const attachedDivider = styles(
    '.leaf-button-group--attached > .leaf-button + .leaf-button::before',
  );
  assert.equal(attachedDivider.width, '1px');
  assert.equal(attachedDivider['inset-block'], 'calc(-1 * var(--leaf-button-border-width))');
  assert.equal(
    styles('.leaf-button-group--attached > .leaf-button + .leaf-button.leaf-button--link::before')[
      'inset-block'
    ],
    '0px',
  );
  assert.match(
    styles('.leaf-button-group--attached > .leaf-button + .leaf-button.leaf-button--solid::before')
      .background,
    /var\(--leaf-button-on-color\)/,
  );
  assert.match(
    styles('.leaf-button-group--attached > .leaf-button + .leaf-button.leaf-button--danger::before')
      .background,
    /var\(--leaf-color-danger-border\)/,
  );
  assert.equal(
    styles('.leaf-button-group--attached > .leaf-button + .leaf-button.leaf-button--link')[
      'margin-inline-start'
    ],
    '8px',
  );
  assert.equal(
    styles('.leaf-button-group--attached > .leaf-button--outline + .leaf-button::before').display,
    'none',
  );
});

test('select and dropdown popups reduce outer padding while dropdown tightens row height, group padding and submenu arrow gap', async () => {
  const select = await compiledStyles('select/select.scss');
  assert.equal(
    select('.leaf-floating.leaf-select__panel')['--leaf-surface-padding'],
    'var(--leaf-component-floating-padding,4px)',
  );
  assert.equal(select('.leaf-select__group').padding, '6px 10px 2px');

  const dropdown = await compiledStyles('dropdown/dropdown.scss');
  assert.equal(
    dropdown('.leaf-dropdown')['--leaf-surface-padding'],
    'var(--leaf-component-dropdown-padding,var(--leaf-component-floating-padding,4px))',
  );
  assert.equal(
    dropdown('.leaf-dropdown--sm > .leaf-floating__viewport')['--leaf-dropdown-option-height'],
    'var(--leaf-component-dropdown-height-sm,var(--leaf-control-height-sm))',
  );
  assert.equal(
    dropdown('.leaf-dropdown--md > .leaf-floating__viewport')['--leaf-dropdown-option-height'],
    'var(--leaf-component-dropdown-height,max(24px,var(--leaf-control-height)- 2px))',
  );
  assert.equal(
    dropdown('.leaf-dropdown--lg > .leaf-floating__viewport')['--leaf-dropdown-option-height'],
    'var(--leaf-component-dropdown-height-lg,max(28px,var(--leaf-control-height-lg)- 4px))',
  );
  const option = dropdown('.leaf-dropdown:not(.leaf-menu__popup) .leaf-floating__option');
  assert.equal(
    option['min-height'],
    'var(--leaf-dropdown-option-height,max(24px,var(--leaf-control-height)- 2px))',
  );
  assert.equal(
    dropdown('.leaf-dropdown:not(.leaf-menu__popup) .leaf-floating__option > svg').width,
    'max(12px,1em - 1px)',
  );
  assert.equal(
    dropdown('.leaf-dropdown:not(.leaf-menu__popup) .leaf-floating__option[aria-haspopup=menu]')[
      'padding-inline-end'
    ],
    'max(4px,var(--leaf-dropdown-option-padding,8px)- 4px)',
  );
  assert.equal(
    dropdown('.leaf-dropdown__group').padding,
    '4px var(--leaf-dropdown-option-padding,8px)2px',
  );
  assert.throws(
    () => dropdown('[aria-expanded=true] .leaf-dropdown__arrow'),
    /missing compiled rule/,
  );
});

async function compiledHoverMediaStyles(file) {
  const { css } = await sass.compileAsync(path.resolve(import.meta.dirname, '..', 'src', file));
  const dom = new JSDOM(`<style>${css}</style>`);
  const chunks = [];
  const visit = (rules) => {
    for (const rule of rules) {
      if (rule.conditionText === '(hover: hover)') {
        chunks.push([...rule.cssRules].map((inner) => inner.cssText).join('\n'));
      } else if ('cssRules' in rule) {
        visit(rule.cssRules);
      }
    }
  };
  visit(dom.window.document.querySelector('style').sheet.cssRules);
  dom.window.close();
  return styleDeclarations(chunks.join('\n'), `${file} @media (hover: hover)`);
}

test('calendar cells keep row spacing without changing weekday header spacing', async () => {
  const calendar = await compiledStyles('shared/calendar.scss');
  assert.equal(calendar('.leaf-calendar__weekdays').gap, '0px');
  assert.equal(calendar('.leaf-calendar__cells').gap, '4px 0');
});

test('shared clear button hovers over trailing edges with left fade and reserves no field width', async () => {
  const clear = await compiledStyles('shared/_clear.scss');
  assert.equal(clear('.leaf-clear').transition, 'opacity var(--leaf-motion-duration,200ms)ease');
  const overlay = clear('.leaf-clear:not(.leaf-clear--anchored):not(.leaf-clear--inline)');
  assert.equal(overlay.position, 'absolute');
  assert.equal(overlay['inset-inline-end'], 'var(--leaf-clear-end,0px)');
  assert.equal(
    overlay.background,
    'linear-gradient(to right,transparent,var(--leaf-clear-surface)16px)',
  );
  assert.equal(overlay['pointer-events'], 'none');
  assert.equal(
    clear('[data-direction=rtl] .leaf-clear:not(.leaf-clear--anchored):not(.leaf-clear--inline)')
      .background,
    'linear-gradient(to left,transparent,var(--leaf-clear-surface)16px)',
  );
  assert.equal(
    clear('.leaf-clear--before-arrow:not(.leaf-clear--anchored):not(.leaf-clear--inline)')[
      'inset-inline-end'
    ],
    'var(--leaf-clear-end,29px)',
  );
  assert.equal(
    clear('.leaf-clear__button')['border-radius'],
    'min(8px,max(0px,var(--leaf-current-radius,var(--leaf-radius))- 3px))',
  );

  const hover = await compiledHoverMediaStyles('shared/_clear.scss');
  assert.equal(hover('.leaf-clear:not(.leaf-clear--always)').opacity, '0');
  assert.equal(
    hover('.leaf-clear:not(.leaf-clear--always) .leaf-clear__button')['pointer-events'],
    'none',
  );
  assert.equal(hover(':hover > .leaf-clear:not(.leaf-clear--always)').opacity, '1');
  assert.equal(hover('.leaf-clear:not(.leaf-clear--always):has(:focus-visible)').opacity, '1');
  assert.equal(
    hover(':hover > .leaf-clear:not(.leaf-clear--always) .leaf-clear__button')['pointer-events'],
    'auto',
  );

  const input = await compiledStyles('input/input.scss');
  assert.equal(input('.leaf-clear--anchored').width, '0px');
  assert.equal(input('.leaf-clear--anchored > .leaf-clear__float').position, 'absolute');
  assert.equal(
    input('.leaf-input__native:has(+ .leaf-clear:last-child)')['padding-inline-end'],
    'var(--leaf-density-field-padding)',
  );

  const select = await compiledStyles('select/select.scss');
  assert.throws(() => select('.leaf-select[data-clearable]'), /missing compiled rule/);
  const treeSelect = await compiledStyles('treeselect/treeselect.scss');
  assert.throws(() => treeSelect('.leaf-tree-select[data-clearable]'), /missing compiled rule/);
  const datePicker = await compiledStyles('datepicker/datepicker.scss');
  assert.throws(
    () => datePicker('.leaf-date-picker[data-clearable] .leaf-date-picker__input'),
    /missing compiled rule/,
  );
});

test('select multiple reduces start padding and sizes internal tags as small tags', async () => {
  const select = await compiledStyles('select/select.scss');
  assert.equal(
    select('.leaf-select:where(:dir(rtl))').padding,
    'var(--leaf-component-select-padding,0 var(--leaf-density-field-padding)0 var(--leaf-select-end-padding))',
  );
  const treeSelect = await compiledStyles('treeselect/treeselect.scss');
  assert.equal(
    treeSelect('.leaf-tree-select:where(:dir(rtl))').padding,
    'var(--leaf-component-tree-select-padding,0 var(--leaf-density-field-padding)0 var(--leaf-tree-select-end-padding))',
  );
  assert.equal(
    select('.leaf-select--multiple')['padding-inline'],
    'var(--leaf-component-select-padding-left,calc(var(--leaf-density-field-padding)/ 2))var(--leaf-component-select-padding-right,var(--leaf-select-end-padding))',
  );
  const tag = select('.leaf-selection__tag');
  assert.match(tag.height, /min\(20px,/);
  assert.equal(tag['border-radius'], 'max(0px,var(--leaf-radius)- 6px)');
  const tagClose = select('.leaf-selection__tag > button');
  assert.equal(tagClose.width, '16px');
  assert.equal(tagClose.height, '16px');
});

test('cascader popups reduce outer padding and space options cleanly inside columns and search results', async () => {
  const cascader = await compiledStyles('cascader/cascader.scss');
  assert.equal(
    cascader('.leaf-floating.leaf-cascader__panel')['--leaf-surface-padding'],
    'var(--leaf-component-floating-padding,4px)',
  );
  assert.equal(
    cascader('.leaf-cascader__column + .leaf-cascader__column')['border-inline-start'],
    '1px solid var(--leaf-color-divider)',
  );
  for (const list of ['.leaf-cascader__column', '.leaf-cascader__search-list']) {
    const content = cascader(`${list} > .leaf-scrollbar__viewport > .leaf-scrollbar__content`);
    assert.equal(content.display, 'flex');
    assert.equal(content['flex-direction'], 'column');
    assert.equal(content.gap, '2px');
  }
});

test('popover, tooltip and color-picker popups retain their padding, surface vars and borders in full styles', async () => {
  const { css } = await sass.compileAsync(
    path.resolve(import.meta.dirname, '..', 'src', 'styles/index.scss'),
  );
  const full = styleDeclarations(css, 'styles/index.scss');
  const popover = full('.leaf-popover');
  assert.equal(
    popover['--leaf-popover-radius'],
    'var(--leaf-component-popover-radius,var(--leaf-radius-md))',
  );
  assert.equal(
    popover['--leaf-surface-padding-top'],
    'var(--leaf-component-popover-padding-top,var(--leaf-popover-padding-block))',
  );
  assert.equal(
    popover['--leaf-surface-padding-left'],
    'var(--leaf-component-popover-padding-left,var(--leaf-popover-padding-inline))',
  );
  assert.match(popover.padding, /var\(--leaf-component-popover-padding,/);
  assert.equal(
    popover['border-color'],
    'var(--leaf-component-popover-border-color,var(--leaf-component-floating-border-color,var(--leaf-frame-border-color,var(--leaf-color-border))))',
  );
  assert.equal(
    full('.leaf-floating')['--leaf-surface-padding'],
    'var(--leaf-component-floating-padding,6px)',
  );
  assert.match(full('.leaf-tooltip').padding, /var\(--leaf-component-tooltip-padding,/);
  assert.equal(full('.leaf-color-picker__panel').padding, '0px');

  // Ensure .leaf-floating padding never appears after subclass popups due to @extend reordering.
  const lastFloatingIndex = css.lastIndexOf('.leaf-floating {');
  assert.ok(lastFloatingIndex >= 0);
  for (const cleanSelector of [
    '.leaf-tooltip {',
    '.leaf-popover {',
    '.leaf-color-picker__panel {',
  ]) {
    const index = css.indexOf(cleanSelector);
    assert.ok(index > lastFloatingIndex, `${cleanSelector} must appear after .leaf-floating`);
  }

  const popconfirm = await compiledStyles('popconfirm/popconfirm.scss');
  assert.equal(popconfirm('.leaf-popconfirm__description')['margin-top'], '4px');
  assert.equal(
    popconfirm('.leaf-popconfirm__description')['line-height'],
    'var(--leaf-line-height-sm)',
  );
  assert.equal(popconfirm('.leaf-popconfirm__actions')['margin-top'], '12px');

  const popoverViewport = full('.leaf-popover > .leaf-floating__viewport');
  assert.equal(popoverViewport['box-sizing'], 'border-box');
  assert.equal(popoverViewport.width, 'auto');
  assert.equal(popoverViewport.height, 'auto');
  assert.equal(popoverViewport.margin, '-4px');
  assert.equal(popoverViewport.padding, '4px');

  const inputNumber = await compiledStyles('inputnumber/inputnumber.scss');
  assert.equal(
    inputNumber('.leaf-input-number--split').gap,
    'var(--leaf-component-input-number-gap,8px)',
  );
  assert.equal(
    inputNumber('.leaf-input-number--split .leaf-input-number__input')['text-align'],
    'center',
  );
  const inputNumberField = inputNumber('.leaf-input-number__field');
  assert.equal(inputNumberField.width, 'auto');
  assert.equal(inputNumberField['min-width'], '0px');
  assert.equal(inputNumberField.height, 'var(--leaf-current-control-height)');
});

test('loading compiles standalone animation variants, color overrides, and reduced-motion rules', async () => {
  const loading = await compiledStyles('loading/loading.scss');
  const standalone = loading('.leaf-loading:not(.leaf-loading--wrapped)');
  assert.equal(standalone.display, 'flex');
  assert.equal(standalone['align-items'], 'center');
  assert.equal(standalone['justify-content'], 'center');

  const state = loading('.leaf-loading__state');
  assert.equal(state.display, 'flex');
  assert.equal(state['align-items'], 'center');
  assert.equal(state['justify-content'], 'center');
  assert.equal(state.width, '100%');
  assert.equal(state.height, '100%');

  const ringBefore = loading('.leaf-loading__ring::before');
  assert.equal(ringBefore.width, '78%');
  assert.equal(ringBefore.height, '78%');
  assert.equal(ringBefore['border-width'], 'max(2px,var(--leaf-spinner-size)* 0.095)');
  assert.equal(ringBefore['border-style'], 'solid');
  assert.equal(
    ringBefore['border-color'],
    'currentcolor var(--leaf-color-border)var(--leaf-color-border)',
  );
  assert.equal(ringBefore['border-top-color'], 'currentcolor');

  const spinner = loading('.leaf-loading__spinner');
  assert.match(spinner.animation, /--leaf-motion-animation,\s*leaf-loading-spin/);

  for (const selector of [
    '.leaf-loading__spinner',
    '.leaf-loading__ring',
    '.leaf-loading__dual',
    '.leaf-loading__orbit',
    '.leaf-loading__chase',
    '.leaf-loading__dots',
    '.leaf-loading__wave',
    '.leaf-loading__bars',
    '.leaf-loading__pulse',
    '.leaf-loading__grid',
    '.leaf-loading__blocks',
    '.leaf-loading__flip',
  ]) {
    const graphic = loading(selector);
    assert.equal(graphic.width, 'var(--leaf-spinner-size)');
    assert.equal(graphic.height, 'var(--leaf-spinner-size)');
    assert.equal(graphic.color, 'var(--leaf-component-loading-color,var(--leaf-color-primary))');
  }

  assert.equal(loading('.leaf-loading__orbit-track')['border-color'], 'var(--leaf-color-border)');
  assert.equal(loading('.leaf-loading__dual-outer')['border-color'], 'currentcolor transparent');
  const pulseRing = loading('.leaf-loading__pulse-ring');
  assert.equal(pulseRing['background-color'] ?? pulseRing.background, 'currentcolor');
  assert.equal(pulseRing['border-radius'], '50%');
});

test('pagination preserves button icon padding shrink and keeps solid active page static and unclickable', async () => {
  const styles = await compiledStyles('pagination/pagination.scss');
  const nav = styles('.leaf-pagination > .leaf-button.leaf-pagination__nav');
  assert.equal(nav.gap, '4px');
  assert.equal(nav.padding, undefined);

  const pageButton = styles(
    '.leaf-pagination > .leaf-button:not(.leaf-pagination__nav):not(.leaf-pagination__jump)',
  );
  assert.equal(pageButton.padding, '0px 8px');
  assert.equal(
    styles(
      '.leaf-pagination__entry > .leaf-button:not(.leaf-pagination__nav):not(.leaf-pagination__jump)',
    ).padding,
    '0px 8px',
  );
  assert.equal(styles('.leaf-pagination__jump').padding, '0px');
  assert.equal(
    styles('.leaf-pagination > .leaf-button:not([aria-current=page])')['--leaf-button-rest-color'],
    'var(--leaf-component-pagination-color,var(--leaf-color-text))',
  );

  const active = styles(
    '.leaf-pagination > .leaf-pagination__entry > .leaf-button[aria-current=page]',
  );
  assert.equal(active.color, 'var(--leaf-button-base-color)');
  assert.equal(active.background, 'var(--leaf-button-base-background)');
  assert.equal(active['border-color'], 'var(--leaf-button-base-border)');
  assert.equal(active['box-shadow'], 'var(--leaf-button-base-shadow)');
  assert.equal(active.opacity, '1');
  assert.equal(active.cursor, 'default');
  assert.equal(active.translate, undefined);

  const disabledActive = styles(
    '.leaf-pagination[data-disabled] > .leaf-pagination__entry > .leaf-button[aria-current=page]:disabled',
  );
  assert.equal(disabledActive.opacity, '0.45');
  assert.equal(disabledActive.cursor, 'not-allowed');
});

test('P2 compiled styles keep masonry fallback chain, restrained steps/float motion, and timeline/progress fixes', async () => {
  const { css: masonryCss } = await compiledStyles('masonry/masonry.scss').then(async () => ({
    css: (await import('sass-embedded')).compile(
      path.resolve(import.meta.dirname, '../src/masonry/masonry.scss'),
    ).css,
  }));
  assert.match(
    masonryCss,
    /@media \(min-width: 992px\)[\s\S]*--leaf-masonry-columns-lg,\s*var\(--leaf-masonry-columns-md/u,
  );
  assert.match(
    masonryCss,
    /@media \(min-width: 1200px\)[\s\S]*--leaf-masonry-columns-xl,\s*var\(--leaf-masonry-columns-lg/u,
  );

  const steps = await compiledStyles('steps/steps.scss');
  assert.equal(steps('.leaf-steps--sm')['--leaf-steps-icon-size'], '24px');
  assert.equal(steps('.leaf-steps--lg')['--leaf-steps-icon-size'], '28px');
  assert.equal(steps('.leaf-steps--dot .leaf-steps__icon').width, 'var(--leaf-steps-icon-size)');
  assert.equal(
    steps('.leaf-steps--dot [data-status=error] .leaf-steps__icon').color,
    'var(--leaf-color-danger)',
  );

  const timeline = await compiledStyles('timeline/timeline.scss');
  assert.equal(timeline('.leaf-timeline__dot')['box-shadow'], undefined);
  assert.equal(timeline('.leaf-timeline__item:not(:last-child)::before').top, '21px');
  assert.equal(timeline('.leaf-timeline__dot--custom').border, '0px');
  assert.equal(timeline('.leaf-timeline__dot:has(svg)').border, '0px');

  const progress = await compiledStyles('progress/progress.scss');
  assert.equal(progress('.leaf-progress__fill--success').background, 'var(--leaf-color-success)');
  assert.equal(
    progress('.leaf-progress:dir(rtl)')['--leaf-progress-travel-animation'],
    'leaf-progress-travel-rtl',
  );

  const floatBtn = await compiledStyles('floatbutton/floatbutton.scss');
  assert.equal(floatBtn('.leaf-float-button.leaf-button--sm')['--leaf-float-button-size'], '36px');
  assert.equal(
    floatBtn('.leaf-float-button.leaf-button--icon-sm')['--leaf-float-button-size'],
    '36px',
  );
  assert.equal(floatBtn('.leaf-float-button.leaf-button--lg')['--leaf-float-button-size'], '52px');
  assert.equal(
    floatBtn('.leaf-float-button.leaf-button--icon-lg')['--leaf-float-button-size'],
    '52px',
  );
  assert.equal(floatBtn('.leaf-float-group__action').transform, undefined);
});

test('P3 compiled styles keep restrained BackTop motion, Popconfirm error typography, Avatar border, and virtual Tree lines', async () => {
  const backtop = await compiledStyles('backtop/backtop.scss');
  assert.equal(backtop('.leaf-back-top').transform, 'translateY(12px)');

  const popconfirm = await compiledStyles('popconfirm/popconfirm.scss');
  assert.equal(popconfirm('.leaf-popconfirm__error')['font-size'], 'var(--leaf-font-size-sm)');
  assert.equal(popconfirm('.leaf-popconfirm__error')['line-height'], 'var(--leaf-line-height-sm)');

  const upload = await compiledStyles('upload/upload.scss');
  assert.equal(
    upload('.leaf-upload__avatar[data-filled]').border,
    'var(--leaf-border-width,1px)solid var(--leaf-color-divider)',
  );

  const tree = await compiledStyles('tree/tree.scss');
  assert.equal(tree('.leaf-tree--lines .leaf-tree__row').position, 'relative');
  assert.equal(
    tree('.leaf-tree--lines .leaf-tree__indent-line')['border-inline-start'],
    '1px dashed var(--leaf-color-border)',
  );

  const rateCss = (await import('sass-embedded')).compile(
    path.resolve(import.meta.dirname, '../src/rate/rate.scss'),
  ).css;
  assert.match(rateCss, /@media \(forced-colors: active\)[\s\S]*\.leaf-rate__empty/u);
});

test('button isolates text variant from frame borders and keeps neutral borderColor scoped to outline', async () => {
  const styles = await compiledStyles('button/button.scss');
  const solid = styles('.leaf-button:is(.leaf-button--solid)');
  assert.equal(solid['--leaf-button-rest-border'], 'transparent');
  assert.equal(
    solid['--leaf-button-frame-border'],
    'var(--leaf-frame-border-color,var(--leaf-button-rest-border))',
  );
  assert.equal(
    styles('.leaf-button:is(.leaf-button--outline)')['--leaf-button-rest-border'],
    'var(--leaf-color-border)',
  );
  const text = styles('.leaf-button:is(.leaf-button--text)');
  assert.equal(text['--leaf-button-frame-border'], 'var(--leaf-button-rest-border)');
  const base = styles(
    '.leaf-button:is(.leaf-button--solid, .leaf-button--outline, .leaf-button--text, .leaf-button--link, .leaf-button--danger)',
  );
  assert.equal(
    base['--leaf-button-base-border'],
    'var(--leaf-component-button-border-color,var(--leaf-button-frame-border))',
  );
});
