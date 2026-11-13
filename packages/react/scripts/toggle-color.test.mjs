import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compiledStyles } from './compiled-styles.mjs';

test('Radio uses primary borders and Ant Design selection timing without press scaling', async () => {
  const radio = await compiledStyles('radio/radio.scss');
  const checked = radio('.leaf-radio__input:checked');
  const primaryBorder = 'var(--leaf-component-radio-border-color,var(--leaf-color-primary))';
  assert.equal(checked['border-color'], primaryBorder);
  assert.equal(checked['--leaf-choice-border'], primaryBorder);
  assert.equal(checked.background, 'var(--leaf-color-primary)');
  assert.equal(
    radio('.leaf-radio--card:has(.leaf-radio__input:checked)')['border-color'],
    primaryBorder,
  );
  for (const state of ['hover', 'active']) {
    const selector =
      state === 'hover'
        ? '.leaf-radio:hover:not([data-disabled]) .leaf-radio__input:not(:disabled):where(:not(:focus-visible))'
        : '.leaf-radio:active:not([data-disabled]) .leaf-radio__input:not(:disabled)';
    const paint = radio(selector);
    assert.equal(
      paint['border-color'],
      `var(--leaf-component-radio-${state}-border-color,${primaryBorder})`,
    );
    assert.equal(paint.transform, undefined);
  }
  assert.equal(
    radio('.leaf-radio__input').transition,
    'border-color var(--leaf-motion-duration)ease,background-color var(--leaf-motion-duration)ease',
  );
  const mark = radio('.leaf-radio__mark');
  assert.equal(mark.transform, 'scale(0)');
  assert.equal(
    mark.transition,
    'opacity calc(var(--leaf-motion-duration)* 1.5)cubic-bezier(0.78,0.14,0.15,0.86),transform calc(var(--leaf-motion-duration)* 1.5)cubic-bezier(0.78,0.14,0.15,0.86)',
  );
  assert.equal(radio('.leaf-radio__input:checked ~ .leaf-radio__mark').transform, 'scale(1)');
  assert.equal(mark.background, 'var(--leaf-color-on-primary)');
  assert.throws(() => radio('.leaf-radio__input:indeterminate'), /missing compiled rule/u);
  assert.throws(
    () => radio('.leaf-radio--card:has(.leaf-radio__input:indeterminate)'),
    /missing compiled rule/u,
  );

  // The shared mixins retain Checkbox's existing indicator and frame overrides.
  const checkbox = await compiledStyles('checkbox/checkbox.scss');
  assert.equal(
    checkbox('.leaf-checkbox__input:checked')['border-color'],
    'var(--leaf-frame-border-color,var(--leaf-color-primary-indicator,var(--leaf-color-primary)))',
  );
  assert.equal(
    checkbox('.leaf-checkbox__input:indeterminate')['border-color'],
    'var(--leaf-frame-border-color,var(--leaf-color-primary-indicator,var(--leaf-color-primary)))',
  );
  assert.equal(
    checkbox('.leaf-checkbox--card:has(.leaf-checkbox__input:indeterminate)')['border-color'],
    'var(--leaf-color-primary-indicator,var(--leaf-color-primary))',
  );
  for (const [component, file] of [
    ['checkbox', 'checkbox/checkbox.scss'],
    ['radio', 'radio/radio.scss'],
  ]) {
    const choice = await compiledStyles(file);
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
  assert.ok(
    track['--leaf-switch-track-background'].includes(
      'light-dark(var(--leaf-color-option-hover),var(--leaf-color-option-hover))',
    ),
  );
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
  assert.ok(track['--leaf-switch-track-border'].includes('var(--leaf-color-primary-indicator,'));
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
