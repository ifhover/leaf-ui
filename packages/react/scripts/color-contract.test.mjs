import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  evaluateColorContract,
  normalizeExpression,
  renderAuditReport,
  resolvePackageRoot,
  scanColorContract,
} from './color-contract.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_TOKENS = [
  '--leaf-color-border',
  '--leaf-color-option-hover',
  '--leaf-color-primary',
  '--leaf-color-primary-alpha-8',
  '--leaf-color-primary-alpha-9',
  '--leaf-color-surface',
  '--leaf-color-text',
  '--leaf-color-text-muted',
];
const DEFAULT_PALETTE = `@mixin light {
  --leaf-color-primary: #1e964f;
  --leaf-color-surface: #ffffff;
  --leaf-color-text: #202020;
  --leaf-color-text-muted: #707070;
  --leaf-color-border: #e2e2e2;
  --leaf-color-option-hover: #ebebeb;
  --leaf-color-primary-alpha-8: rgba(30, 150, 79, 0.08);
  --leaf-color-primary-alpha-9: rgba(30, 150, 79, 0.09);
}

@mixin dark {
  --leaf-color-primary: #83cf9e;
  --leaf-color-surface: #1c1c1c;
  --leaf-color-text: #ededed;
  --leaf-color-text-muted: #aaaaaa;
  --leaf-color-border: #3b3b3b;
  --leaf-color-option-hover: #2f2f2f;
  --leaf-color-primary-alpha-8: rgba(131, 207, 158, 0.08);
  --leaf-color-primary-alpha-9: rgba(131, 207, 158, 0.09);
}
`;

function baseline(overrides = {}) {
  return {
    version: 1,
    globalTokens: DEFAULT_TOKENS,
    recipeFormulas: {},
    reviewedChanges: [],
    fieldFamily: {
      consumers: [],
      primaryFocusConsumers: [],
      ...(overrides.fieldFamily ?? {}),
    },
    debt: {},
    exceptions: {},
    risks: {
      undefinedGlobalTokens: {},
      ...(overrides.risks ?? {}),
    },
    ...overrides,
  };
}

async function writeFixture(root, files) {
  for (const [relative, source] of Object.entries(files)) {
    const file = path.join(root, 'src', ...relative.split('/'));
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, source, 'utf8');
  }
}

async function fixture(t, files, baselineOverrides) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'leaf-color-contract-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await writeFixture(root, {
    'styles/_palette.scss': DEFAULT_PALETTE,
    ...files,
  });
  const scan = await scanColorContract(root);
  const result = evaluateColorContract(scan, baseline(baselineOverrides));
  return { scan, result };
}

function debt(entries) {
  return { debt: entries };
}

test('resolves the package from the script location instead of cwd', () => {
  assert.equal(resolvePackageRoot(), path.resolve(SCRIPT_DIR, '..'));
});

test('rejects a new file with a hardcoded color', async (t) => {
  const { result } = await fixture(
    t,
    {
      'new-component/new-component.scss': '.leaf-new { border: 1px solid #fff; }',
    },
    debt({}),
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /new-component\/new-component\.scss.*hardcodedColors/u);
});

test('rejects a near-identical HEX replacement', async (t) => {
  const { result } = await fixture(
    t,
    {
      'button/button.scss': '.leaf-button { color: #1e9650; }',
    },
    debt({
      'button/button.scss': {
        hardcodedColors: [{ expression: '#1e964f', count: 1 }],
      },
    }),
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /added expression "#1e9650"/u);
});

test('rejects a changed color-mix percentage but ignores line movement', async (t) => {
  const expression = normalizeExpression(
    'color-mix(in srgb, var(--leaf-color-text) 70%, var(--leaf-color-border))',
  );
  const moved = `\n\n\n.leaf-card { color: color-mix(\n  in srgb,\n  var(--leaf-color-text) 70%,\n  var(--leaf-color-border)\n); }`;
  const movedResult = await fixture(
    t,
    { 'card/card.scss': moved },
    debt({
      'card/card.scss': {
        mixFormulas: [{ expression, count: 1 }],
      },
    }),
  );
  assert.equal(movedResult.result.ok, true);

  const changedResult = await fixture(
    t,
    {
      'card/card.scss':
        '.leaf-card { color: color-mix(in srgb, var(--leaf-color-text) 71%, var(--leaf-color-border)); }',
    },
    debt({
      'card/card.scss': {
        mixFormulas: [{ expression, count: 1 }],
      },
    }),
  );
  assert.equal(changedResult.result.ok, false);
  assert.match(changedResult.result.errors.join('\n'), /71%/u);
});

test('rejects a changed numeric derived token', async (t) => {
  const { result } = await fixture(
    t,
    {
      'slider/slider.scss':
        '.leaf-slider { box-shadow: 0 0 0 4px var(--leaf-color-primary-alpha-9); }',
    },
    debt({
      'slider/slider.scss': {
        derivedTokenUsages: [{ expression: 'var(--leaf-color-primary-alpha-8)', count: 1 }],
      },
    }),
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /primary-alpha-9/u);
});

test('rejects copying a derived token consumption', async (t) => {
  const { result } = await fixture(
    t,
    {
      'tree/tree.scss': `.leaf-tree {
  background: var(--leaf-color-primary-alpha-8);
  color: var(--leaf-color-primary-alpha-8);
}`,
    },
    debt({
      'tree/tree.scss': {
        derivedTokenUsages: [{ expression: 'var(--leaf-color-primary-alpha-8)', count: 1 }],
      },
    }),
  );
  assert.equal(result.ok, false);
  assert.match(
    result.errors.join('\n'),
    /increased "var\(--leaf-color-primary-alpha-8\)" from 1 to 2/u,
  );
});

test('accepts debt reduction', async (t) => {
  const { result } = await fixture(
    t,
    {
      'tree/tree.scss': '.leaf-tree { background: var(--leaf-color-primary-alpha-8); }',
    },
    debt({
      'tree/tree.scss': {
        derivedTokenUsages: [{ expression: 'var(--leaf-color-primary-alpha-8)', count: 2 }],
      },
    }),
  );
  assert.equal(result.ok, true);
});

test('accepts registered exceptions and ignores prop-passed colors', async (t) => {
  const { result } = await fixture(
    t,
    {
      'colorpicker/colorpicker.scss': `.leaf-color-picker {
  background: #fff;
  border-color: #fff;
}`,
      'colorpicker/colorpicker.tsx':
        'export const swatch = (color: string) => ({ style: { color } });',
    },
    {
      exceptions: {
        'colorpicker/colorpicker.scss': {
          hardcodedColors: [{ expression: '#fff', count: 2 }],
        },
      },
    },
  );
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.stats.debtOccurrences, 0);
});

test('rejects a new field-family consumer with its own border paint', async (t) => {
  const { result } = await fixture(
    t,
    {
      'new-field/new-field.scss': `.leaf-new-field {
  @include mixins.field('new-field');
  border-color: var(--leaf-color-text-muted);
}`,
    },
    {},
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /new field-family consumer/u);
  assert.match(result.errors.join('\n'), /border-color:var\(--leaf-color-text-muted\)/u);
});

test('counts reviewed structural borders separately from remaining field paint debt', async (t) => {
  const file = 'colorpicker/colorpicker.scss';
  const expression = 'border:1px solid var(--leaf-color-border)';
  const limits = {
    fieldFamily: { consumers: [file], primaryFocusConsumers: [] },
    debt: { [file]: { fieldFamilyBorders: [{ expression, count: 1 }] } },
    exceptions: {
      [file]: {
        fieldFamilyBorders: [
          { expression, count: 1, reason: 'Format-switch frame, not the field shell.' },
        ],
      },
    },
  };
  const rule = '&__part { border: 1px solid var(--leaf-color-border); }';
  const valid = await fixture(
    t,
    {
      [file]: `.leaf-color-picker { @include mixins.field('color-picker'); ${rule.repeat(2)} }`,
    },
    limits,
  );
  assert.equal(valid.result.ok, true);
  assert.equal(valid.result.stats.debtOccurrences, 1);
  const invalid = await fixture(
    t,
    {
      [file]: `.leaf-color-picker { @include mixins.field('color-picker'); ${rule.repeat(3)} }`,
    },
    limits,
  );
  assert.equal(invalid.result.ok, false);
  assert.match(invalid.result.errors.join('\n'), /from 2 to 3/u);
});

test('counts adjacent field-family border declarations independently', async (t) => {
  const { scan, result } = await fixture(
    t,
    {
      'new-field/new-field.scss':
        ".leaf-new { @include mixins.field('new-field'); border: 1px solid transparent; border-color: var(--leaf-color-text-muted); }",
    },
    {
      fieldFamily: {
        consumers: ['new-field/new-field.scss'],
      },
    },
  );
  const entries = Object.fromEntries(
    (scan.findings['new-field/new-field.scss']?.fieldFamilyBorders ?? []).map(
      ({ expression, count }) => [expression, count],
    ),
  );
  assert.equal(entries['border:1px solid transparent'], 1);
  assert.equal(entries['border-color:var(--leaf-color-text-muted)'], 1);
  assert.equal(result.ok, false);
});

test('requires review for formulas inside shared recipes without counting them as debt', async (t) => {
  const sharedRecipeExpressions = {
    mixFormulas: [
      {
        expression: normalizeExpression(
          'color-mix(in srgb, var(--leaf-color-text) 45%, var(--leaf-color-border))',
        ),
        count: 1,
      },
    ],
    hardcodedColors: [{ expression: 'rgb(0 0 0/0.05)', count: 1 }],
  };
  const files = {
    'styles/_mixins.scss': `@mixin field($component) {
  --leaf-field-color: color-mix(in srgb, var(--leaf-color-text) 45%, var(--leaf-color-border));
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}`,
  };
  const unreviewed = await fixture(t, files, {});
  assert.equal(unreviewed.result.ok, false);
  assert.match(unreviewed.result.errors.join('\n'), /unreviewed expression/u);
  const { result } = await fixture(t, files, { sharedRecipeExpressions });
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.stats.debtOccurrences, 0);
  const changed = await fixture(
    t,
    {
      'styles/_mixins.scss': files['styles/_mixins.scss'].replace('45%', '46%'),
    },
    { sharedRecipeExpressions },
  );
  assert.equal(changed.result.ok, false);
  assert.match(changed.result.errors.join('\n'), /46%/u);
});

test('requires Input and Select to use the shared primary field variant', async (t) => {
  const files = {
    'input/input.scss': `.leaf-input {
  @include mixins.field('input');
  --leaf-field-color: var(--leaf-color-primary);
}`,
    'select/select.scss': `.leaf-select {
  @include mixins.field('select');
  --leaf-field-color: var(--leaf-color-primary);
}`,
  };
  const invalid = await fixture(t, files, {
    fieldFamily: {
      consumers: ['input/input.scss', 'select/select.scss'],
      primaryFocusConsumers: ['input/input.scss', 'select/select.scss'],
    },
  });
  assert.equal(invalid.result.ok, false);
  assert.match(invalid.result.errors.join('\n'), /field\('input', 'primary'\)/u);
  assert.match(invalid.result.errors.join('\n'), /must not redefine --leaf-field-color/u);

  const valid = await fixture(
    t,
    {
      'input/input.scss': `.leaf-input {
  @include mixins.field('input', 'primary');
}`,
      'select/select.scss': `.leaf-select {
  @include mixins.field('select', 'primary');
}`,
    },
    {
      fieldFamily: {
        consumers: ['input/input.scss', 'select/select.scss'],
        primaryFocusConsumers: ['input/input.scss', 'select/select.scss'],
      },
    },
  );
  assert.equal(valid.result.ok, true);
});

test('rejects a new global color token', async (t) => {
  const { result } = await fixture(
    t,
    {
      'styles/_palette.scss': `${DEFAULT_PALETTE.replace(
        '--leaf-color-primary-alpha-9: rgba(30, 150, 79, 0.09);',
        '--leaf-color-primary-alpha-9: rgba(30, 150, 79, 0.09);\n  --leaf-color-new-family: #123456;',
      ).replace(
        '--leaf-color-primary-alpha-9: rgba(131, 207, 158, 0.09);',
        '--leaf-color-primary-alpha-9: rgba(131, 207, 158, 0.09);\n  --leaf-color-new-family: #123456;',
      )}`,
    },
    {},
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /Added global color token --leaf-color-new-family/u);
});

test('does not let neutral fields silently opt into primary focus', async (t) => {
  const limits = {
    fieldFamily: {
      consumers: ['textarea/textarea.scss'],
      primaryFocusConsumers: [],
      neutralFocusConsumers: { 'textarea/textarea.scss': 'textarea' },
    },
  };
  for (const call of ["field('textarea')", "field('textarea', 'neutral')"]) {
    const valid = await fixture(
      t,
      {
        'textarea/textarea.scss': `.leaf-textarea { @include mixins.${call}; }`,
      },
      limits,
    );
    assert.equal(valid.result.ok, true);
  }
  const invalid = await fixture(
    t,
    {
      'textarea/textarea.scss': ".leaf-textarea { @include mixins.field('textarea', 'primary'); }",
    },
    limits,
  );
  assert.equal(invalid.result.ok, false);
  assert.match(invalid.result.errors.join('\n'), /retain the shared neutral field variant/u);
});

test('rejects recipe changes without review and accepts an explicit review record', async (t) => {
  const changedRecipe = `export const colorRecipes = {
  '--leaf-color-primary-alpha-8': ['primary', 'surface', 12],
};`;
  const unreviewed = await fixture(
    t,
    { 'color-recipes.ts': changedRecipe },
    {
      recipeFormulas: {
        '--leaf-color-primary-alpha-8': ['primary', 'alpha', 8],
      },
    },
  );
  assert.equal(unreviewed.result.ok, false);
  assert.match(unreviewed.result.errors.join('\n'), /Changed color recipe/u);

  const reviewed = await fixture(
    t,
    { 'color-recipes.ts': changedRecipe },
    {
      recipeFormulas: {
        '--leaf-color-primary-alpha-8': ['primary', 'alpha', 8],
      },
      reviewedChanges: [
        {
          kind: 'recipe-change',
          token: '--leaf-color-primary-alpha-8',
          formula: ['primary', 'surface', 12],
          reason: 'Reviewed against the shared surface family contract.',
        },
      ],
    },
  );
  assert.equal(reviewed.result.ok, true);
});

test('flags an undefined default token and accepts a registered risk baseline', async (t) => {
  const files = {
    'table/table.scss':
      '.leaf-table { --leaf-table-row-background: var(--leaf-color-primary-soft); }',
  };
  const unregistered = await fixture(t, files, {});
  assert.equal(unregistered.result.ok, false);
  assert.match(unregistered.result.errors.join('\n'), /undefinedGlobalTokens/u);
  assert.match(unregistered.result.errors.join('\n'), /--leaf-color-primary-soft/u);

  const registered = await fixture(t, files, {
    risks: {
      undefinedGlobalTokens: {
        'table/table.scss': [{ expression: 'var(--leaf-color-primary-soft)', count: 1 }],
      },
    },
  });
  assert.equal(registered.result.ok, true);
  assert.equal(registered.result.stats.undefinedRiskOccurrences, 1);
});

test('classifies an override-only primary-soft token by fallback presence', async (t) => {
  const theme = `const tokenVariables = {
  primarySoftColor: 'color-primary-soft',
};`;
  const tokens = [...DEFAULT_TOKENS, '--leaf-color-primary-soft'];
  const withFallback = await fixture(
    t,
    {
      'theme.ts': theme,
      'table/table.scss':
        '.leaf-table { background: var(--leaf-color-primary-soft, var(--leaf-color-surface)); }',
    },
    { globalTokens: tokens },
  );
  assert.equal(withFallback.result.ok, true);
  assert.equal(withFallback.scan.consumption.risks['table/table.scss'], undefined);
  assert.deepEqual(withFallback.scan.consumption.optionalWithFallback, [
    { file: 'table/table.scss', token: '--leaf-color-primary-soft' },
  ]);
  assert.deepEqual(withFallback.scan.consumption.unknownWithFallback, []);

  const withoutFallback = await fixture(
    t,
    {
      'theme.ts': theme,
      'table/table.scss': '.leaf-table { background: var(--leaf-color-primary-soft); }',
    },
    { globalTokens: tokens },
  );
  assert.equal(withoutFallback.result.ok, false);
  assert.deepEqual(withoutFallback.scan.consumption.risks, {
    'table/table.scss': {
      undefinedGlobalTokens: [{ expression: 'var(--leaf-color-primary-soft)', count: 1 }],
    },
  });
  assert.deepEqual(withoutFallback.scan.consumption.optionalWithFallback, []);
});

test('reports unknown fallback names separately from optional theme overrides', async (t) => {
  const { scan, result } = await fixture(
    t,
    {
      'table/table.scss':
        '.leaf-table { background: var(--leaf-color-surface-alpha-80, var(--leaf-color-surface)); }',
    },
    debt({
      'table/table.scss': {
        derivedTokenUsages: [{ expression: 'var(--leaf-color-surface-alpha-80)', count: 1 }],
      },
    }),
  );
  assert.equal(result.ok, true);
  assert.deepEqual(scan.consumption.optionalWithFallback, []);
  assert.deepEqual(scan.consumption.unknownWithFallback, [
    { file: 'table/table.scss', token: '--leaf-color-surface-alpha-80' },
  ]);
  assert.match(result.warnings.join('\n'), /unregistered --leaf-color-surface-alpha-80/u);
  assert.match(
    renderAuditReport(scan, result, baseline()),
    /Unknown consumers with fallback\n\n- `table\/table.scss`: `var\(--leaf-color-surface-alpha-80, ...\)`/u,
  );
});
