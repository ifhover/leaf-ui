import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const sourcePath = path.resolve(import.meta.dirname, '..', 'src', 'switch', 'switch.scss');
const source = await fs.readFile(sourcePath, 'utf8');
const normalized = source.replace(/\s+/gu, ' ');

test('switch colors use shared semantic roles without local derivations', () => {
  assert.doesNotMatch(source, /#[0-9a-f]{3,8}\b/iu);
  assert.doesNotMatch(source, /\b(?:rgba?|hsla?)\s*\(/iu);
  assert.doesNotMatch(source, /color-mix\s*\(/iu);
  assert.doesNotMatch(source, /var\(\s*--leaf-color-[\w-]+-\d+(?:\.\d+)?\s*[,)]/iu);
  assert.match(normalized, /&__thumb \{[\s\S]*?background: var\(--leaf-color-text-muted\);/u);
  assert.match(normalized, /&__thumb \{[\s\S]*?color: var\(--leaf-color-surface\);/u);
  assert.match(
    normalized,
    /&__input:checked \+ &__track &__thumb \{ color: var\(--leaf-color-primary-indicator\); background: var\(--leaf-color-on-primary\);/u,
  );
});

test('switch hover and press keep the track paint while explicit states remain', () => {
  for (const state of ['hover', 'active']) {
    assert.match(
      normalized,
      new RegExp(
        `@include mixins\\.state-paint\\( switch, ${state}, inherit, var\\(--leaf-switch-track-background\\),`,
        'u',
      ),
    );
  }

  for (const state of ['focus', 'disabled']) {
    assert.match(normalized, new RegExp(`@include mixins\\.state-paint\\( switch, ${state},`, 'u'));
  }

  assert.match(
    normalized,
    /&__input:checked \+ &__track \{[\s\S]*?--leaf-switch-track-background: var\(--leaf-color-primary-indicator, var\(--leaf-color-primary\)\);/u,
  );
});
