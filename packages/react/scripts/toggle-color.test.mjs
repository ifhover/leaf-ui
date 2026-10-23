import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compiledStyles } from './compiled-styles.mjs';

test('compiled switch pairs the checked primary fill with its explicit foreground', async () => {
  const rule = await compiledStyles('switch/switch.scss');
  const resting = rule('.leaf-switch__thumb');
  assert.equal(resting.background, 'var(--leaf-color-text-muted)');
  assert.equal(resting.color, 'var(--leaf-color-surface)');
  const checked = rule('.leaf-switch__input:checked + .leaf-switch__track .leaf-switch__thumb');
  assert.equal(checked.background, 'var(--leaf-color-on-primary)');
  assert.equal(checked.color, 'var(--leaf-color-primary)');
  assert.equal(rule('.leaf-switch__spinner').color, 'var(--leaf-color-primary)');
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
