import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { evaluateColorContract, scanColorContract } from './color-contract.mjs';

async function fixture(t, files, baseline = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'leaf-scale-color-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  for (const [relative, source] of Object.entries(files)) {
    const file = path.join(root, 'src', ...relative.split('/'));
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, source, 'utf8');
  }
  const scan = await scanColorContract(root);
  return {
    scan,
    result: evaluateColorContract(scan, {
      version: 1,
      globalTokens: [],
      recipeFormulas: {},
      reviewedChanges: [],
      fieldFamily: { consumers: [], primaryFocusConsumers: [] },
      debt: {},
      exceptions: {},
      risks: { undefinedGlobalTokens: {} },
      sharedRecipeExpressions: {},
      ...baseline,
    }),
  };
}

test('new components cannot select a semantic shade or a neutral numeric step', async (t) => {
  const semantic = await fixture(t, {
    'new-component/new-component.scss': '.leaf-new { color: var(--leaf-color-primary-light-9); }',
  });
  assert.equal(semantic.result.ok, false);
  assert.match(semantic.result.errors.join('\n'), /directly selects semantic color shade/u);
  assert.match(semantic.result.errors.join('\n'), /primary-light-9/u);
  assert.ok(semantic.scan.findings['new-component/new-component.scss'].scaleStepUsages);
  assert.equal(
    semantic.scan.findings['new-component/new-component.scss'].derivedTokenUsages,
    undefined,
  );

  const neutral = await fixture(t, {
    'new-component/new-component.scss': '.leaf-new { color: var(--leaf-color-neutral-300); }',
  });
  assert.equal(neutral.result.ok, false);
  assert.match(
    neutral.result.errors.join('\n'),
    /new-component\/new-component\.scss.*scaleStepUsages.*neutral-300/u,
  );
  assert.equal(
    neutral.scan.findings['new-component/new-component.scss'].derivedTokenUsages,
    undefined,
  );
});

test('legacy semantic numeric steps are not reinterpreted as the new shade contract', async (t) => {
  const { scan } = await fixture(t, {
    'new-component/new-component.scss': '.leaf-new { color: var(--leaf-color-primary-300); }',
  });
  assert.equal(scan.findings['new-component/new-component.scss'].scaleStepUsages, undefined);
  assert.deepEqual(scan.findings['new-component/new-component.scss'].derivedTokenUsages, [
    { expression: 'var(--leaf-color-primary-300)', count: 1 },
  ]);
});

test('the color-scale generator is a definition source, not component debt', async (t) => {
  const { scan, result } = await fixture(
    t,
    {
      'color-scale.ts': `export const scale = { 100: '#ffffff', 300: '#cccccc', 900: '#111111' };`,
      'new-component/new-component.scss': '.leaf-new { color: var(--leaf-color-text); }',
      'styles/_palette.scss': `@mixin light {
  --leaf-color-text: #202020;
}
@mixin dark {
  --leaf-color-text: #ededed;
}`,
    },
    { globalTokens: ['--leaf-color-text'] },
  );

  assert.equal(scan.findings['color-scale.ts'], undefined);
  assert.equal(result.ok, true, result.errors.join('\n'));
});

test('shared recipes cannot introduce an unreviewed color-scale step', async (t) => {
  const { result } = await fixture(t, {
    'styles/_mixins.scss': `@mixin new-family {
  color: var(--leaf-color-danger-dark-3);
}`,
  });

  assert.equal(result.ok, false);
  assert.match(
    result.errors.join('\n'),
    /styles\/_mixins\.scss.*sharedRecipeExpressions\.scaleStepUsages.*danger-dark-3/u,
  );
});

test('semantic shade generation modules are definition sources, not debt', async (t) => {
  const { scan, result } = await fixture(
    t,
    {
      'color-shades.ts': `export const semanticColorShadeSteps = ['light-3', 'light-7', 'light-9', 'dark-1', 'dark-3', 'dark-7', 'dark-9'] as const;`,
      'colors.ts': `export const token = 'var(--leaf-color-primary-light-9)';`,
      'new-component/new-component.scss': '.leaf-new { color: var(--leaf-color-text); }',
      'styles/_palette.scss': `@mixin light {
  --leaf-color-text: #202020;
}
@mixin dark {
  --leaf-color-text: #ededed;
}`,
    },
    { globalTokens: ['--leaf-color-text'] },
  );

  assert.equal(scan.findings['color-shades.ts'], undefined);
  assert.equal(scan.findings['colors.ts'], undefined);
  assert.equal(result.ok, true, result.errors.join('\n'));
});
