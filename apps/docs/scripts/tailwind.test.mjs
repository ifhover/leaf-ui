import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { renderTailwindTheme } from '../../../packages/react/scripts/build-tailwind.mjs';

const docsRoot = fileURLToPath(new URL('../', import.meta.url));
const libraryRoot = fileURLToPath(new URL('../../../packages/react/', import.meta.url));
// An isolated dependency directory can exercise earlier compiler versions with the same cases.
const compilerRoot = process.env.LEAF_TAILWIND_COMPAT_ROOT
  ? path.resolve(process.env.LEAF_TAILWIND_COMPAT_ROOT)
  : docsRoot;
const requireCompiler = createRequire(path.join(compilerRoot, 'package.json'));
const tailwind3 = requireCompiler('tailwindcss-v3');
const tailwind4 = requireCompiler('@tailwindcss/postcss');
const postcss = requireCompiler('postcss');
const requireLibrary = createRequire(path.join(libraryRoot, 'package.json'));
const { build } = requireLibrary('esbuild');
const { outputFiles } = await build({
  stdin: {
    contents:
      "export { default as preset } from './tailwind'; export { leafTailwindTokens as tokens } from './tailwind-tokens';",
    resolveDir: path.join(libraryRoot, 'src'),
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
});
const { preset, tokens } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
);
const cssTheme = renderTailwindTheme(tokens);
test('Tailwind exposes semantic shades, neutral steps and semantic usage roles', () => {
  const semanticShades = ['light-3', 'light-7', 'light-9', 'dark-1', 'dark-3', 'dark-7', 'dark-9'];
  const neutralSteps = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  for (const family of ['primary', 'success', 'danger', 'warning', 'info']) {
    for (const shade of semanticShades)
      assert.equal(
        tokens.colors[`leaf-${family}-${shade}`],
        `var(--leaf-color-${family}-${shade})`,
      );
    for (const step of neutralSteps)
      assert.equal(tokens.colors[`leaf-${family}-${step}`], undefined);
    for (const role of ['soft', 'soft-hover', 'soft-active', 'ink', 'border'])
      assert.equal(tokens.colors[`leaf-${family}-${role}`], `var(--leaf-color-${family}-${role})`);
    assert.equal(tokens.colors[`leaf-on-${family}`], `var(--leaf-color-on-${family})`);
  }
  for (const step of neutralSteps)
    assert.equal(tokens.colors[`leaf-neutral-${step}`], `var(--leaf-color-neutral-${step})`);
  for (const shade of semanticShades)
    assert.equal(tokens.colors[`leaf-neutral-${shade}`], undefined);
  assert.equal(
    Object.keys(tokens.colors).filter((name) =>
      /^leaf-(?:primary|success|danger|warning|info)-\d+$/u.test(name),
    ).length,
    0,
  );
});
const utilityPrefixes = {
  colors: 'bg',
  borderRadius: 'rounded',
  spacing: 'p',
  fontFamily: 'font',
  fontSize: 'text',
  lineHeight: 'leading',
  fontWeight: 'font',
  boxShadow: 'shadow',
  transitionDuration: 'duration',
  transitionTimingFunction: 'ease',
  zIndex: 'z',
};
const tokenClasses = Object.entries(utilityPrefixes).flatMap(([group, prefix]) =>
  Object.keys(tokens[group]).map((name) => `${prefix}-${name}`),
);
const extraClasses = [
  'p-4',
  'rounded-lg',
  'bg-red-500',
  'text-sm',
  'text-leaf-primary',
  'border-leaf-border',
  'ring-leaf-focus',
  'fill-leaf-success',
  'stroke-leaf-info',
  'h-leaf-control',
  'min-h-leaf-control',
  'min-w-leaf-control',
  'gap-leaf-sm',
  'hover:bg-leaf-option-hover',
  'focus-visible:ring-leaf-focus',
  'md:p-leaf-lg',
];
const guideFiles = ['guide/tailwindcss.mdx', 'en/guide/tailwindcss.mdx'].map((file) =>
  path.join(docsRoot, 'docs', file),
);
const guides = await Promise.all(guideFiles.map((file) => readFile(file, 'utf8')));
const examples = await Promise.all(
  guides.flatMap((guide, index) =>
    [...guide.matchAll(/\bfile="([^"]+\.tsx)"/g)].map((match) =>
      readFile(path.resolve(path.dirname(guideFiles[index]), match[1]), 'utf8'),
    ),
  ),
);
const guideClasses = examples.flatMap((source) =>
  [...source.matchAll(/className="([^"]+)"/g)].flatMap((match) => match[1].split(/\s+/)),
);
for (const guide of guides) {
  assert.match(guide, /leaf-primary-light-9/u);
  assert.doesNotMatch(
    guide,
    /leaf-(?:primary|success|danger|warning|info)-(?:100|200|300|400|500|600|700|800|900)\b/u,
  );
}
const commonClasses = [...new Set([...tokenClasses, ...extraClasses, ...guideClasses])];

function ruleFor(root, className) {
  const selector = `.${className.replaceAll(/[:/]/g, '\\$&')}`;
  let found;
  root.walkRules((rule) => {
    if (rule.selector === selector) found = rule;
  });
  return found;
}

for (const version of [3, 4]) {
  const packageVersion = requireCompiler(
    `${version === 3 ? 'tailwindcss-v3' : 'tailwindcss'}/package.json`,
  ).version;
  test(`Tailwind ${packageVersion} compiles every mapped token and the guide examples`, async () => {
    const classes = [
      ...commonClasses,
      ...(version === 4 ? ['bg-leaf-primary/50', 'text-leaf-muted/75'] : []),
    ];
    const html = `<section class="${classes.join(' ')}"></section>`;
    let result;
    if (version === 3) {
      result = await postcss([
        tailwind3({
          content: [{ raw: html, extension: 'html' }],
          presets: [preset],
          corePlugins: { preflight: false },
        }),
      ]).process('@tailwind utilities;', { from: undefined });
    } else {
      const directory = await mkdtemp(path.join(compilerRoot, '.tailwind-test-'));
      try {
        await writeFile(path.join(directory, 'input.html'), html);
        result = await postcss([tailwind4({ optimize: false })]).process(
          `@import "tailwindcss/theme.css" layer(theme);\n@import "tailwindcss/utilities.css" source(none);\n@source "./input.html";\n${cssTheme}`,
          { from: path.join(directory, 'input.css') },
        );
      } finally {
        assert.ok(directory.startsWith(path.join(compilerRoot, '.tailwind-test-')));
        await rm(directory, { recursive: true, force: true });
      }
    }
    for (const className of classes.filter((name) => !name.includes(':'))) {
      assert.ok(ruleFor(result.root, className), `Tailwind ${version}: ${className} exists`);
    }
    for (const [group, prefix] of Object.entries(utilityPrefixes)) {
      for (const [name, value] of Object.entries(tokens[group])) {
        const rule = ruleFor(result.root, `${prefix}-${name}`);
        assert.ok(
          rule.toString().includes(value),
          `Tailwind ${version}: ${prefix}-${name} reads the Leaf variable on the element`,
        );
      }
    }
    const color = ruleFor(result.root, 'bg-leaf-primary');
    assert.ok(
      color.nodes.some(
        (node) => node.prop === 'background-color' && node.value === 'var(--leaf-color-primary)',
      ),
    );
    if (version === 4)
      assert.match(ruleFor(result.root, 'bg-leaf-primary/50').toString(), /color-mix\(/);
    assert.match(ruleFor(result.root, 'text-leaf').toString(), /--leaf-line-height/);
    assert.match(result.css, /hover\\:bg-leaf-option-hover/);
    assert.match(result.css, /focus-visible\\:ring-leaf-focus/);
    assert.match(result.css, /md\\:p-leaf-lg/);
  });
}

test('the preset satisfies the official Tailwind 3 Config type without Tailwind runtime imports', async () => {
  const directory = await mkdtemp(path.join(docsRoot, '.tailwind-test-'));
  try {
    const source = path.join(libraryRoot, 'src/tailwind').replaceAll('\\', '/');
    await writeFile(
      path.join(directory, 'config.ts'),
      `import type { Config } from 'tailwindcss-v3';\nimport leafPreset from ${JSON.stringify(source)};\nexport default { content: [], presets: [leafPreset] } satisfies Config;\n`,
    );
    await writeFile(
      path.join(directory, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          noEmit: true,
          strict: true,
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          types: [],
          skipLibCheck: false,
        },
        files: ['./config.ts'],
      }),
    );
    const compiler = path.join(
      path.dirname(requireLibrary.resolve('typescript/package.json')),
      'bin/tsc',
    );
    execFileSync(process.execPath, [compiler, '--project', path.join(directory, 'tsconfig.json')], {
      stdio: 'pipe',
    });
  } finally {
    assert.ok(directory.startsWith(path.join(docsRoot, '.tailwind-test-')));
    await rm(directory, { recursive: true, force: true });
  }
});
