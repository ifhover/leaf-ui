import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import { resolveBaselinePath, resolvePackageRoot, scanColorContract } from './color-contract.mjs';
import { compiledStyles, styleDeclarations } from './compiled-styles.mjs';

const root = resolvePackageRoot();
const require = createRequire(path.join(root, 'package.json'));
const sass = require('sass-embedded');
const compile = (source) =>
  sass.compileStringAsync(source, { loadPaths: [path.join(root, 'src/styles')] });

test('family recipes compile supported semantic variants', async () => {
  const result = await compile(`@use 'mixins' as colors;
    .sample {
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
  assert.match(result.css, /--leaf-accent-halo-focus-color:/u);
  assert.match(result.css, /--leaf-segmented-selected-background: var\(--leaf-color-surface\)/u);
  assert.match(result.css, /--leaf-danger-soft-background: var\(--leaf-color-danger-soft\)/u);
  assert.match(
    result.css,
    /--leaf-calendar-selected-background: var\(--leaf-color-primary-soft\)/u,
  );
  assert.match(result.css, /--leaf-status-label-foreground: var\(--leaf-color-on-info\)/u);
  assert.match(result.css, /--leaf-status-label-background: var\(--leaf-color-success-soft\)/u);
  assert.match(
    result.css,
    /--leaf-status-label-close-background: color-mix\(in srgb, currentColor 10%, transparent\)/u,
  );
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

test('fields default to primary focus while retaining validation and explicit neutral variants', async () => {
  const { css } = await compile(`@use 'mixins' as colors;
    .default { @include colors.field(example); }
    .explicit { @include colors.field(example, primary); }
    .neutral { @include colors.field(example, neutral); }
  `);
  const styles = styleDeclarations(css);
  assert.deepEqual(styles('.default'), styles('.explicit'));
  assert.equal(styles('.default')['--leaf-field-color'], 'var(--leaf-color-primary)');
  assert.equal(styles('.default')['--leaf-field-hover-color'], 'var(--leaf-color-primary-hover)');
  assert.equal(
    styles('.default')['--leaf-field-hover-border'],
    'var(--leaf-component-example-border-color,var(--leaf-frame-border-color,var(--leaf-field-hover-color)))',
  );
  assert.equal(
    styles('.default')['--leaf-field-ring'],
    'color-mix(in srgb,var(--leaf-field-color)10%,transparent)',
  );
  assert.equal(styles('.default')['--leaf-field-focus-shadow'], '0 0 0 2px var(--leaf-field-ring)');
  assert.equal(styles('.neutral')['--leaf-field-color'], 'var(--leaf-color-text-muted)');
  assert.equal(styles('.neutral')['--leaf-field-hover-color'], 'var(--leaf-color-border-hover)');
  assert.equal(
    styles('.default[data-status=error]')['--leaf-field-color'],
    'var(--leaf-color-danger)',
  );
  assert.equal(
    styles('.default[data-status=error]')['--leaf-field-hover-border'],
    'var(--leaf-field-color)',
  );
  assert.equal(
    styles('.default[data-status=warning]')['--leaf-field-color'],
    'var(--leaf-color-warning)',
  );
  assert.equal(
    styles('.default[data-status=warning]')['--leaf-field-hover-border'],
    'var(--leaf-field-color)',
  );
  assert.equal(
    styles(
      '.default:hover:not([data-disabled]):not(:disabled):where(:not(:focus-within):not([data-open]))',
    )['border-color'],
    'var(--leaf-component-example-hover-border-color,var(--leaf-field-hover-border))',
  );
  assert.equal(
    styles('.default:is(:focus-within, [data-open]):not([data-disabled]):not(:disabled)')[
      'box-shadow'
    ],
    'var(--leaf-component-example-focus-shadow,var(--leaf-field-focus-shadow))',
  );

  const input = await compiledStyles('input/input.scss');
  assert.equal(
    input('.leaf-input:focus-within:not([data-disabled]) .leaf-input__affix').color,
    'var(--leaf-color-text)',
  );

  const typography = await compiledStyles('typography/typography.scss');
  assert.equal(
    typography('.leaf-text__editor')['--leaf-field-ring'],
    'color-mix(in srgb,var(--leaf-color-primary)10%,transparent)',
  );
  assert.equal(typography('.leaf-text__editor:focus')['border-color'], 'var(--leaf-color-primary)');

  const otp = await compiledStyles('inputotp/inputotp.scss');
  const slot = otp('.leaf-input-otp__slot');
  assert.equal(slot['--leaf-otp-focus-color'], 'var(--leaf-color-primary)');
  assert.equal(
    slot['--leaf-field-ring'],
    'color-mix(in srgb,var(--leaf-otp-focus-color)10%,transparent)',
  );
  assert.equal(
    slot['box-shadow'],
    'var(--leaf-component-input-otp-shadow,var(--leaf-control-shadow,0 0 0 0 transparent))',
  );
  assert.equal(
    otp('.leaf-input-otp__slot[data-active]')['border-color'],
    'var(--leaf-otp-focus-color)',
  );
  assert.equal(
    otp('.leaf-input-otp__slot[data-active]')['box-shadow'],
    'var(--leaf-component-input-otp-focus-shadow,var(--leaf-field-focus-shadow))',
  );
  assert.equal(
    otp('.leaf-input-otp[data-status=error] .leaf-input-otp__slot')['--leaf-otp-focus-color'],
    'var(--leaf-color-danger)',
  );
  assert.equal(
    otp('.leaf-input-otp[data-status=warning] .leaf-input-otp__slot')['--leaf-otp-focus-color'],
    'var(--leaf-color-warning)',
  );
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

test('dialog overlays avoid light-dark() and root tokens default color-scheme to light', async () => {
  const { css } = await compile(`@use 'mixins' as colors;
    .backdrop { @include colors.overlay-family; }
    .spotlight { @include colors.overlay-family(spotlight); }
  `);
  const rules = styleDeclarations(css, 'overlay-family');
  const light = rules('.backdrop');
  assert.ok(!light['--leaf-overlay-background'].includes('light-dark('));
  assert.ok(!light['--leaf-overlay-fallback-background'].includes('light-dark('));
  assert.match(light['--leaf-overlay-background'], /28%/u);
  assert.match(light['--leaf-overlay-fallback-background'], /36%/u);

  const dark = rules(
    '[data-leaf-theme=dark] .backdrop:not([data-leaf-theme=dark] [data-leaf-theme=light] .backdrop)',
  );
  assert.match(dark['--leaf-overlay-background'], /55%/u);
  assert.match(dark['--leaf-overlay-fallback-background'], /62%/u);

  assert.match(rules('.spotlight')['--leaf-overlay-background'], /45%/u);
  assert.match(
    rules(
      '[data-leaf-theme=dark] .spotlight:not([data-leaf-theme=dark] [data-leaf-theme=light] .spotlight)',
    )['--leaf-overlay-background'],
    /68%/u,
  );

  for (const file of ['modal/modal.scss', 'drawer/drawer.scss']) {
    const compiled = await compiledStyles(file);
    const backdrop = compiled(
      file.startsWith('modal/') ? '.leaf-modal-backdrop' : '.leaf-drawer-backdrop',
    );
    assert.ok(!backdrop['--leaf-overlay-background'].includes('light-dark('), file);
  }

  const tokens = await compiledStyles('styles/tokens.scss');
  assert.equal(tokens(':root')['color-scheme'], 'light');
  assert.equal(tokens('[data-leaf-theme=dark]')['color-scheme'], 'dark');
});

test('pressed side presets lock button state tokens so hover and active do not alter selected paint', async () => {
  const calendar = await compiledStyles('shared/calendar.scss');
  const pressed = calendar(
    '.leaf-picker-presets.leaf-picker-presets--side > .leaf-button[aria-pressed=true]',
  );
  assert.equal(pressed.background, undefined);
  assert.equal(pressed.color, undefined);
  assert.equal(pressed['--leaf-button-rest-background'], 'var(--leaf-calendar-range-background)');
  assert.equal(pressed['--leaf-button-rest-color'], 'var(--leaf-color-primary)');
  assert.equal(pressed['--leaf-button-hover-background'], 'var(--leaf-calendar-range-background)');
  assert.equal(pressed['--leaf-button-active-background'], 'var(--leaf-calendar-range-background)');
  assert.equal(pressed['--leaf-button-hover-color'], 'var(--leaf-color-primary)');
  assert.equal(pressed['--leaf-button-active-color'], 'var(--leaf-color-primary)');
});
