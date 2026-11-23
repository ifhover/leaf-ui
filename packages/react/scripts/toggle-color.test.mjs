import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compiledStyles } from './compiled-styles.mjs';

test('Radio uses primary checked borders, neutral unchecked hover and Ant Design timing without press scaling', async () => {
  const radio = await compiledStyles('radio/radio.scss');
  const checked = radio('.leaf-radio__input:checked');
  const primaryBorder = 'var(--leaf-component-radio-border-color,var(--leaf-color-primary))';
  assert.equal(checked['border-color'], primaryBorder);
  assert.equal(checked['--leaf-choice-border'], primaryBorder);
  assert.equal(checked['--leaf-choice-hover-border'], 'var(--leaf-choice-border)');
  assert.equal(checked.background, 'var(--leaf-color-primary)');
  const card = radio('.leaf-radio--card');
  assert.equal(card['align-items'], 'flex-start');
  assert.equal(card['min-height'], 'var(--leaf-current-control-height)');
  assert.equal(card.padding, 'var(--leaf-component-radio-padding,10px 12px)');
  assert.equal(
    radio('.leaf-radio--card .leaf-radio__control')['margin-block-start'],
    'max(0px,(var(--leaf-line-height)- 18px)/ 2)',
  );
  const checkedCard = radio('.leaf-radio--card:has(.leaf-radio__input:checked)');
  assert.equal(checkedCard['border-color'], primaryBorder);
  assert.equal(checkedCard.background, 'var(--leaf-color-primary-soft)');
  assert.equal(
    radio('.leaf-radio--card:has(.leaf-radio__input:checked) .leaf-radio__icon').background,
    'var(--leaf-color-surface)',
  );
  assert.throws(
    () => radio('.leaf-radio--card:hover:not([data-disabled])'),
    /missing compiled rule/u,
  );
  const uncheckedCardHover = radio(
    '.leaf-radio--card:hover:not([data-disabled]):not(:has(.leaf-radio__input:checked))',
  );
  assert.equal(uncheckedCardHover['border-color'], 'var(--leaf-color-border-hover)');
  assert.equal(uncheckedCardHover.background, 'var(--leaf-color-surface-muted)');
  for (const state of ['hover', 'active']) {
    const selector =
      state === 'hover'
        ? '.leaf-radio:hover:not([data-disabled]) .leaf-radio__input:not(:disabled):where(:not(:focus-visible))'
        : '.leaf-radio:active:not([data-disabled]) .leaf-radio__input:not(:disabled)';
    const paint = radio(selector);
    assert.equal(
      paint['border-color'],
      `var(--leaf-component-radio-${state}-border-color,var(--leaf-choice-hover-border,var(--leaf-color-text-muted)))`,
    );
    assert.equal(paint.transform, undefined);
  }
  assert.equal(
    radio('.leaf-radio__input').transition,
    'border-color var(--leaf-motion-duration)ease,background-color var(--leaf-motion-duration)ease',
  );
  const mark = radio('.leaf-radio__mark');
  assert.equal(mark.transform, undefined);
  assert.equal(mark['clip-path'], 'circle(0% at 50% 50%)');
  assert.equal(
    mark.transition,
    'opacity calc(var(--leaf-motion-duration)* 1.5)cubic-bezier(0.78,0.14,0.15,0.86),clip-path calc(var(--leaf-motion-duration)* 1.5)cubic-bezier(0.78,0.14,0.15,0.86)',
  );
  assert.equal(
    radio('.leaf-radio__input:checked ~ .leaf-radio__mark')['clip-path'],
    'circle(75% at 50% 50%)',
  );
  assert.equal(mark.background, 'var(--leaf-color-on-primary)');
  assert.throws(() => radio('.leaf-radio__input:indeterminate'), /missing compiled rule/u);
  assert.throws(
    () => radio('.leaf-radio--card:has(.leaf-radio__input:indeterminate)'),
    /missing compiled rule/u,
  );

  // The shared mixins retain Checkbox's primary and frame overrides.
  const checkbox = await compiledStyles('checkbox/checkbox.scss');
  assert.equal(
    checkbox('.leaf-checkbox__input:checked')['border-color'],
    'var(--leaf-frame-border-color,var(--leaf-color-primary))',
  );
  assert.equal(
    checkbox('.leaf-checkbox__input:indeterminate')['border-color'],
    'var(--leaf-frame-border-color,var(--leaf-color-primary))',
  );
  const checkboxCard = checkbox('.leaf-checkbox--card');
  assert.equal(checkboxCard['align-items'], 'flex-start');
  assert.equal(checkboxCard['min-height'], 'var(--leaf-current-control-height)');
  assert.equal(checkboxCard.padding, 'var(--leaf-component-checkbox-padding,10px 12px)');
  assert.equal(
    checkbox('.leaf-checkbox--card .leaf-checkbox__control')['margin-block-start'],
    'max(0px,(var(--leaf-line-height)- 18px)/ 2)',
  );
  const checkedCheckboxCard = checkbox('.leaf-checkbox--card:has(.leaf-checkbox__input:checked)');
  assert.equal(checkedCheckboxCard['border-color'], 'var(--leaf-color-primary)');
  assert.equal(checkedCheckboxCard.background, 'var(--leaf-color-primary-soft)');
  assert.equal(
    checkbox('.leaf-checkbox--card:has(.leaf-checkbox__input:checked) .leaf-checkbox__icon')
      .background,
    'var(--leaf-color-surface)',
  );
  const indeterminateCard = checkbox(
    '.leaf-checkbox--card:has(.leaf-checkbox__input:indeterminate)',
  );
  assert.equal(indeterminateCard['border-color'], 'var(--leaf-color-primary)');
  assert.equal(indeterminateCard.background, 'var(--leaf-color-primary-soft)');
  assert.equal(
    checkbox('.leaf-checkbox--card:has(.leaf-checkbox__input:indeterminate) .leaf-checkbox__icon')
      .background,
    'var(--leaf-color-surface)',
  );
  assert.throws(
    () => checkbox('.leaf-checkbox--card:hover:not([data-disabled])'),
    /missing compiled rule/u,
  );
  assert.equal(
    checkbox(
      '.leaf-checkbox--card:hover:not([data-disabled]):not(:has(.leaf-checkbox__input:checked)):not(:has(.leaf-checkbox__input:indeterminate))',
    ).background,
    'var(--leaf-color-surface-muted)',
  );
  for (const [component, file] of [
    ['checkbox', 'checkbox/checkbox.scss'],
    ['radio', 'radio/radio.scss'],
  ]) {
    const choice = await compiledStyles(file);
    assert.equal(
      choice(`.leaf-${component}--card`)['border-radius'],
      `var(--leaf-component-${component}-radius,var(--leaf-current-radius,var(--leaf-radius)))`,
    );
    assert.equal(
      choice(`.leaf-${component}-group--list .leaf-${component}-group__options`)['border-radius'],
      `var(--leaf-component-${component}-radius,var(--leaf-radius))`,
    );
    assert.equal(
      choice(
        `.leaf-${component}--described:not(.leaf-${component}--card) .leaf-${component}__control`,
      )['margin-block-start'],
      'max(0px,(var(--leaf-line-height)- 18px)/ 2)',
    );
    const disabled = choice(`.leaf-${component}__input:disabled`);
    assert.equal(disabled['--leaf-choice-background'], 'var(--leaf-color-surface-muted)');
    assert.equal(disabled['--leaf-choice-border'], 'var(--leaf-color-border)');
    const selectedDisabledSelectors = [`.leaf-${component}__input:disabled:checked`];
    if (component === 'checkbox') {
      selectedDisabledSelectors.push(`.leaf-${component}__input:disabled:indeterminate`);
    }
    for (const selector of selectedDisabledSelectors) {
      const selectedDisabled = choice(selector);
      assert.equal(selectedDisabled['--leaf-choice-background'], 'var(--leaf-color-border)');
      assert.equal(selectedDisabled['--leaf-choice-border'], 'var(--leaf-color-border)');
    }
  }
});

test('compiled switch pairs a neutral off track with a light thumb in both appearances', async () => {
  const rule = await compiledStyles('switch/switch.scss');
  const track = rule('.leaf-switch__track');
  assert.ok(track['--leaf-switch-track-background'].includes('var(--leaf-color-option-hover)'));
  assert.ok(!track['--leaf-switch-track-background'].includes('light-dark('));
  assert.ok(track['--leaf-switch-track-border'].includes('var(--leaf-switch-track-background)'));
  const resting = rule('.leaf-switch__thumb');
  assert.equal(resting.background, 'light-dark(var(--leaf-color-surface),var(--leaf-color-text))');
  assert.equal(resting.color, 'light-dark(var(--leaf-color-text-muted),var(--leaf-color-surface))');
  assert.equal(rule('.leaf-switch__spinner').color, 'currentcolor');
});

test('compiled switch pairs the checked primary fill with its explicit foreground', async () => {
  const rule = await compiledStyles('switch/switch.scss');
  const checked = rule('.leaf-switch__input:checked + .leaf-switch__track .leaf-switch__thumb');
  assert.equal(checked.background, 'var(--leaf-color-on-primary)');
  assert.equal(checked.color, 'var(--leaf-color-primary)');
  const track = rule('.leaf-switch__input:checked + .leaf-switch__track');
  assert.equal(track['--leaf-switch-track-background'], 'var(--leaf-color-primary)');
  assert.ok(track['--leaf-switch-track-border'].includes('var(--leaf-color-primary)'));
});

test('compiled switch states retain the resting track as fallback', async () => {
  const rule = await compiledStyles('switch/switch.scss');
  for (const [state, selector] of [
    [
      'hover',
      '.leaf-switch:hover:not([data-disabled]):where(:not(:has(input:focus-visible))) .leaf-switch__track',
    ],
    ['active', '.leaf-switch:active:not([data-disabled]) .leaf-switch__track'],
    ['focus', '.leaf-switch__input:focus-visible:not(:disabled) + .leaf-switch__track'],
    ['disabled', '.leaf-switch[data-disabled] .leaf-switch__track'],
  ]) {
    const paint = rule(selector);
    assert.ok(paint.background.includes(`--leaf-component-switch-${state}-background`));
    assert.ok(paint.background.includes('var(--leaf-switch-track-background)'));
  }
});
