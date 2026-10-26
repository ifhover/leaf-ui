import assert from 'node:assert/strict';
import test from 'node:test';
import { styleDeclarations } from './compiled-styles.mjs';

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
