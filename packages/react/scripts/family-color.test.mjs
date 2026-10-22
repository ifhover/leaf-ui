import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import { resolveBaselinePath, resolvePackageRoot, scanColorContract } from './color-contract.mjs';

const root = resolvePackageRoot();
const require = createRequire(path.join(root, 'package.json'));
const sass = require('sass-embedded');
const compile = (source) =>
  sass.compileStringAsync(source, { loadPaths: [path.join(root, 'src/styles')] });

test('family recipes compile supported semantic variants', async () => {
  const result = await compile(`@use 'mixins' as colors;
    .sample {
      @include colors.accent-soft-feedback-family;
      @include colors.danger-soft-feedback-family;
      @include colors.panel-canvas-family;
      @include colors.segmented-surface-family;
      @include colors.accent-halo-family;
      @include colors.calendar-selection-family;
    }
    @each $tone in primary, success, warning, danger, info {
      .label-#{$tone} { @include colors.status-label-family($tone); }
    }
    .dialog { @include colors.overlay-family; }
    .spotlight { @include colors.overlay-family(spotlight); }
    .field-error { @include colors.field-status(error); }
    .field-warning { @include colors.field-status(warning); }
  `);
  assert.match(result.css, /--leaf-accent-soft-background:/u);
  assert.match(result.css, /--leaf-status-label-foreground: var\(--leaf-color-on-info\)/u);
  assert.match(result.css, /--leaf-field-color: var\(--leaf-color-danger\)/u);
});

test('recipes reject invented visual variants instead of silently picking a color', async () => {
  for (const expression of [
    'field(input, purple)',
    'field-status(success)',
    'overlay-family(pale)',
    'status-ink-family(custom)',
    'status-label-family(custom)',
  ]) {
    await assert.rejects(
      compile(`@use 'mixins' as colors; .test { @include colors.${expression}; }`),
      /Unknown/u,
    );
  }
});

test('panel, segmented and halo consumers select recipes without choosing numeric shades', async () => {
  const consumers = {
    'modal/modal.scss': ['panel-canvas-family', 'overlay-family'],
    'drawer/drawer.scss': ['overlay-family'],
    'tour/tour.scss': ['overlay-family'],
    'tabs/tabs.scss': ['segmented-surface-family'],
    'colorpicker/colorpicker.scss': ['segmented-surface-family', 'field-status'],
    'shared/calendar.scss': ['panel-canvas-family', 'calendar-selection-family'],
    'calendar/calendar.scss': ['calendar-selection-family'],
    'inputotp/inputotp.scss': ['accent-halo-family'],
    'slider/slider.scss': ['accent-halo-family'],
  };
  for (const [file, families] of Object.entries(consumers)) {
    const source = await fs.readFile(path.join(root, 'src', file), 'utf8');
    for (const family of families)
      assert.ok(source.includes(`mixins.${family}`), `${file}: ${family}`);
    assert.doesNotMatch(source, /var\(--leaf-color-[\w-]+-\d+(?:\.\d+)?[,)\s]/u, file);
    assert.doesNotMatch(source, /color-mix\(/u, file);
  }
});

test('reviewed exception budgets have no dormant permission to reintroduce removed colors', async () => {
  const baseline = JSON.parse(await fs.readFile(resolveBaselinePath(), 'utf8'));
  const scan = await scanColorContract(root);
  for (const [file, categories] of Object.entries(baseline.exceptions)) {
    for (const [category, entries] of Object.entries(categories)) {
      for (const entry of entries) {
        const actual = scan.findings[file]?.[category]?.find(
          (item) => item.expression === entry.expression,
        );
        assert.ok(entry.reason?.trim(), `${file}: exception needs a responsibility`);
        assert.ok(actual, `${file}: removed expression still allowed: ${entry.expression}`);
        assert.ok(actual.count >= entry.count, `${file}: obsolete occurrence allowance`);
      }
    }
  }
});

test('every public component export has a color responsibility in the inventory', async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  const inventory = await fs.readFile(path.join(root, 'COLOR-MIGRATION.md'), 'utf8');
  const entries = Object.keys(manifest.exports).filter(
    (entry) =>
      entry !== '.' &&
      entry !== './package.json' &&
      entry !== './tailwind' &&
      !entry.includes('locales') &&
      !entry.includes('style') &&
      !entry.endsWith('.css'),
  );
  const rows = inventory.split('\n').filter((line) => /^\| \d+ \|/u.test(line));
  const documented = rows.map((line) => line.split('|').slice(2, -1).join('|')).join('\n');
  for (const entry of entries)
    assert.ok(documented.includes(`\`${entry.slice(2)}\``), `${entry}: missing color review`);
  // Table's core and adapter paths intentionally share one implementation row.
  assert.equal(rows.length, entries.length - 1);
});
