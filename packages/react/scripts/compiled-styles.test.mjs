import assert from 'node:assert/strict';
import test from 'node:test';
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
  for (const [file, prefix] of [
    ['tooltip/tooltip.scss', '.leaf-tooltip'],
    ['popover/popover.scss', '.leaf-popover'],
  ]) {
    const styles = await compiledStyles(file);
    assert.equal(styles(`${prefix}.leaf-floating.leaf-scrollbar`).overflow, 'visible');
    const base = styles(`${prefix}::before`);
    assert.equal(base.width, '16px');
    assert.equal(base.height, '5px');
    const top = styles(`${prefix}[data-side=top]::before`);
    assert.equal(top.bottom, '-4px');
    assert.equal(top.left, '50%');
    const bottom = styles(`${prefix}[data-side=bottom]::before`);
    assert.equal(bottom.top, '-4px');
    assert.equal(bottom.left, '50%');
    const left = styles(`${prefix}[data-side=left]::before`);
    assert.equal(left.width, '5px');
    assert.equal(left.height, '16px');
    assert.equal(left.right, '-4px');
    assert.equal(left.top, '50%');
    const right = styles(`${prefix}[data-side=right]::before`);
    assert.equal(right.width, '5px');
    assert.equal(right.height, '16px');
    assert.equal(right.left, '-4px');
    assert.equal(right.top, '50%');
  }
});
