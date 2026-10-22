import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, '..');
const TARGET_FILES = [
  'filelist/filelist.scss',
  'typography/typography.scss',
  'rate/rate.scss',
  'rate/rate.tsx',
  'avatar/avatar.scss',
  'badge/badge.scss',
  'progress/progress.scss',
  'loadingbar/loadingbar.scss',
  'appbar/appbar.scss',
  'anchor/anchor.scss',
  'breadcrumb/breadcrumb.scss',
];

const ROLE_MATRIX = [
  {
    file: 'filelist/filelist.scss',
    role: 'neutral list-row hover',
    patterns: [/background:\s*var\(--leaf-color-option-hover\)/u],
  },
  {
    file: 'filelist/filelist.scss',
    role: 'brand action and danger action families',
    patterns: [
      /@include mixins\.accent-soft-feedback-family/u,
      /@include mixins\.danger-soft-feedback-family/u,
      /var\(--leaf-accent-soft-background\)/u,
      /var\(--leaf-accent-soft-border\)/u,
      /var\(--leaf-danger-soft-background\)/u,
      /var\(--leaf-danger-soft-active-background\)/u,
    ],
  },
  {
    file: 'filelist/filelist.scss',
    role: 'file-type accents on one neutral icon surface',
    patterns: [
      /__icon[\s\S]*background:\s*var\(--leaf-color-surface-muted\)/u,
      /@include mixins\.status-ink-family\(primary\)/u,
      /@include mixins\.status-ink-family\(info\)/u,
      /@include mixins\.status-ink-family\(warning\)/u,
      /@include mixins\.status-ink-family\(danger\)/u,
      /var\(--leaf-status-ink\)/u,
    ],
  },
  {
    file: 'typography/typography.scss',
    role: 'brand action surface and readable state text',
    patterns: [
      /@include mixins\.accent-soft-feedback-family/u,
      /background:\s*var\(--leaf-accent-soft-background\)/u,
      /@include mixins\.status-ink-family\(primary\)/u,
      /@include mixins\.status-ink-family\(success\)/u,
      /@include mixins\.status-ink-family\(warning\)/u,
      /@include mixins\.status-ink-family\(danger\)/u,
      /color:\s*var\(--leaf-status-ink\)/u,
    ],
  },
  {
    file: 'appbar/appbar.scss',
    role: 'neutral navigation hover and branded selection',
    patterns: [
      /@include mixins\.accent-soft-feedback-family/u,
      /background:\s*var\(--leaf-color-option-hover\)/u,
      /background:\s*var\(--leaf-accent-soft-background\)/u,
      /border:\s*1px solid var\(--leaf-accent-soft-border\)/u,
    ],
  },
  {
    file: 'anchor/anchor.scss',
    role: 'neutral navigation hover and branded current item',
    patterns: [
      /@include mixins\.accent-soft-feedback-family/u,
      /&:hover:not\(\[aria-current\]\)[\s\S]*background:\s*var\(--leaf-color-option-hover\)/u,
      /&\[aria-current\][\s\S]*background:\s*var\(--leaf-accent-soft-background\)/u,
      /border-inline-start-color:\s*var\(--leaf-accent-soft-border\)/u,
    ],
  },
  {
    file: 'breadcrumb/breadcrumb.scss',
    role: 'readable primary hover text',
    patterns: [
      /color:\s*var\(--leaf-color-primary-ink\)/u,
      /text-decoration-color:\s*currentColor/u,
    ],
  },
  {
    file: 'progress/progress.scss',
    role: 'semantic progress indicator',
    patterns: [/var\(--leaf-color-primary-indicator, var\(--leaf-color-primary\)\)/u],
  },
  {
    file: 'loadingbar/loadingbar.scss',
    role: 'semantic loading indicator',
    patterns: [/var\(--leaf-color-primary-indicator, var\(--leaf-color-primary\)\)/u],
  },
  {
    file: 'badge/badge.scss',
    role: 'default danger foreground plus status-specific solid-label foregrounds',
    patterns: [
      /--leaf-badge-on-color:\s*var\(--leaf-color-on-danger\)/u,
      /--leaf-badge-on-color:\s*var\(--leaf-color-on-success\)/u,
      /--leaf-badge-on-color:\s*var\(--leaf-color-on-warning\)/u,
      /--leaf-badge-on-color:\s*var\(--leaf-color-on-info\)/u,
      /color:\s*var\(--leaf-badge-on-color\)/u,
    ],
  },
  {
    file: 'avatar/avatar.scss',
    role: 'avatar separation follows the regional surface',
    patterns: [/border:\s*2px solid var\(--leaf-color-surface\)/u],
  },
];

const COLOR_EXCEPTIONS = [
  {
    file: 'rate/rate.scss',
    expression: '#ffc53d',
    count: 1,
    reason: 'Rating gold is a distinct rating semantic, not warning feedback.',
  },
  {
    file: 'rate/rate.tsx',
    expression: '#ef5350',
    count: 1,
    reason: 'Public colorByValue default remains API-compatible and rating-specific.',
  },
  {
    file: 'rate/rate.tsx',
    expression: '#f49b23',
    count: 1,
    reason: 'Public colorByValue default remains API-compatible and rating-specific.',
  },
  {
    file: 'rate/rate.tsx',
    expression: '#ffc53d',
    count: 1,
    reason: 'Public colorByValue default remains API-compatible and rating-specific.',
  },
  {
    file: 'filelist/filelist.scss',
    expression: '#111',
    count: 1,
    reason: 'Static video letterboxing belongs to media content, not a theme surface.',
  },
  {
    file: 'progress/progress.scss',
    expression: 'rgb(255 255 255 / 0.35)',
    count: 1,
    reason: 'The light band is a motion/readability effect rather than a color role.',
  },
];

const RATIO_EFFECT_EXCEPTIONS = [
  {
    file: 'typography/typography.scss',
    expression: 'var(--leaf-color-warning-alpha-16)',
    count: 1,
    reason: 'Mark highlighting is an inline-content effect and is not a state surface.',
  },
  {
    file: 'loadingbar/loadingbar.scss',
    expression: 'var(--leaf-color-primary-alpha-55)',
    count: 1,
    reason: 'The loading-bar glow is an effect over the semantic progress indicator.',
  },
];

const EXTERNAL_CUSTOM_PROPERTY_CONSUMERS = [
  {
    file: 'filelist/filelist.scss',
    variable: '--leaf-button-height',
    consumer: 'button/button.scss',
    reason: 'FileList constrains the private ButtonControl height.',
  },
  {
    file: 'filelist/filelist.scss',
    variable: '--leaf-button-radius',
    consumer: 'button/button.scss',
    reason: 'FileList constrains the private ButtonControl radius.',
  },
];

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/(^|[^:])\/\/[^\n\r]*/gu, '$1');
}

function normalizeExpression(value) {
  return value
    .replace(/\s+/gu, ' ')
    .replace(/\s*\/\s*/gu, ' / ')
    .trim();
}

function collectHardcodedColors(source) {
  const clean = stripComments(source);
  const expressions = [];
  for (const match of clean.matchAll(/#[0-9a-f]{3,8}\b/giu))
    expressions.push(normalizeExpression(match[0]));
  for (const match of clean.matchAll(/(?:rgba?|hsla?)\([^)]*\)/giu))
    expressions.push(normalizeExpression(match[0]));
  for (const match of clean.matchAll(/(?<![\w-])(?:white|black)(?![\w-])/giu))
    expressions.push(normalizeExpression(match[0]));
  return expressions;
}

function countByExpression(expressions) {
  const result = new Map();
  for (const expression of expressions) result.set(expression, (result.get(expression) ?? 0) + 1);
  return result;
}

function exceptionKey({ file, expression }) {
  return `${file}\0${expression}`;
}

async function readTargets() {
  const entries = await Promise.all(
    TARGET_FILES.map(async (file) => [
      file,
      await fs.readFile(path.join(PACKAGE_ROOT, 'src', file), 'utf8'),
    ]),
  );
  return new Map(entries);
}

function assertRegistered(actual, registry) {
  const expected = countByExpression(registry.map(exceptionKey));
  assert.equal(expected.size, registry.length, 'Each registered exception must be unique.');
  assert.deepEqual(
    [...actual.keys()].sort(),
    [...expected.keys()].sort(),
    'Every and only registered exception must be present.',
  );
  for (const [key, count] of expected)
    assert.equal(actual.get(key), count, `Unexpected ${key.replace('\0', ' ')} occurrence count.`);
}

test('content and status components consume the intended semantic color roles', async () => {
  const sources = await readTargets();
  assert.equal(ROLE_MATRIX.length > 0, true);

  for (const { file, role, patterns } of ROLE_MATRIX) {
    const source = sources.get(file);
    assert.ok(source, `Missing color role consumer ${file}.`);
    for (const pattern of patterns)
      assert.match(source, pattern, `${file} must retain its ${role} mapping.`);
  }
});

test('FileList keeps semantic icon accents on a single neutral surface', async () => {
  const source = (
    await fs.readFile(path.join(PACKAGE_ROOT, 'src/filelist/filelist.scss'), 'utf8')
  ).replace(/\/\*[\s\S]*?\*\//gu, '');
  const iconBlock = source.slice(source.indexOf('&__icon'), source.indexOf('&__details'));

  assert.match(iconBlock, /background:\s*var\(--leaf-color-surface-muted\)/u);
  assert.doesNotMatch(iconBlock, /--leaf-file-surface/u);
  assert.doesNotMatch(iconBlock, /(?:primary|info|warning|danger)-surface-/u);
});

test('FileList and Typography do not retain direct status text-80 debt', async () => {
  const sources = await readTargets();
  for (const file of ['filelist/filelist.scss', 'typography/typography.scss']) {
    assert.doesNotMatch(
      sources.get(file),
      /var\(--leaf-color-(?:primary|success|warning|danger|info)-text-80\)/u,
      `${file} must use the shared status ink family.`,
    );
  }
});

test('FileList status and danger actions use readable ink roles', async () => {
  const source = (
    await fs.readFile(path.join(PACKAGE_ROOT, 'src/filelist/filelist.scss'), 'utf8')
  ).replace(/\/\*[\s\S]*?\*\//gu, '');

  assert.doesNotMatch(source, /color:\s*var\(--leaf-color-danger\)/u);
  assert.match(
    source,
    /&__actions &__remove \{[\s\S]*@include mixins\.status-ink-family\(danger\);[\s\S]*color:\s*var\(--leaf-status-ink\);[\s\S]*border-color:\s*transparent;/u,
  );
});

test('Rate keeps its rating-specific defaults without reclassifying them as warning', async () => {
  const sources = await readTargets();
  const styles = sources.get('rate/rate.scss');
  const component = sources.get('rate/rate.tsx');

  assert.match(styles, /--leaf-rate-color:\s*#ffc53d/u);
  assert.doesNotMatch(styles, /--leaf-color-warning/u);
  assert.match(component, /colors = \['#ef5350', '#f49b23', '#ffc53d'\]/u);
  assert.match(component, /Rating colors stay API-driven and distinct from warning feedback/u);
});

test('color exceptions are explicit and the registry has no idle entries', async () => {
  const sources = await readTargets();
  const actual = new Map();

  for (const file of TARGET_FILES) {
    for (const expression of collectHardcodedColors(sources.get(file)))
      actual.set(
        exceptionKey({ file, expression }),
        (actual.get(exceptionKey({ file, expression })) ?? 0) + 1,
      );
  }

  assertRegistered(actual, COLOR_EXCEPTIONS);
});

test('ratio-based visual effects are registered without idle entries', async () => {
  const sources = await readTargets();
  const actual = new Map();

  for (const file of TARGET_FILES) {
    const clean = stripComments(sources.get(file));
    for (const match of clean.matchAll(
      /var\(--leaf-color-[a-z0-9-]+-(?:alpha|surface)-\d+(?:\.\d+)?\)/gu,
    ))
      actual.set(
        exceptionKey({ file, expression: match[0] }),
        (actual.get(exceptionKey({ file, expression: match[0] })) ?? 0) + 1,
      );
  }

  assertRegistered(actual, RATIO_EFFECT_EXCEPTIONS);
});

test('every local custom property has a consumer in its component source', async () => {
  const sources = await readTargets();
  const external = new Map(
    EXTERNAL_CUSTOM_PROPERTY_CONSUMERS.map((entry) => [
      exceptionKey({ file: entry.file, expression: entry.variable }),
      entry,
    ]),
  );

  for (const [file, source] of sources) {
    if (!file.endsWith('.scss')) continue;
    const clean = stripComments(source);
    const declarations = new Set(
      [...clean.matchAll(/^\s*(--leaf-[a-z0-9-]+)\s*:/gimu)].map((match) => match[1]),
    );
    for (const variable of declarations) {
      const key = exceptionKey({ file, expression: variable });
      const externalConsumer = external.get(key);
      if (externalConsumer) {
        const consumer = await fs.readFile(
          path.join(PACKAGE_ROOT, 'src', externalConsumer.consumer),
          'utf8',
        );
        assert.match(
          consumer,
          new RegExp(`var\\(\\s*${variable.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\s*[,)]`, 'u'),
          externalConsumer.reason,
        );
        external.delete(key);
      } else {
        assert.match(
          clean,
          new RegExp(`var\\(\\s*${variable.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\s*[,)]`, 'u'),
          `${file} declares ${variable} but never consumes it.`,
        );
      }
    }
  }
  assert.deepEqual(
    [...external.keys()],
    [],
    'Every external custom-property consumer must be used.',
  );
});

test('the scoped migration does not add global color tokens', async () => {
  const sources = await readTargets();
  for (const [file, source] of sources) {
    if (!file.endsWith('.scss')) continue;
    assert.doesNotMatch(
      stripComments(source),
      /^\s*--leaf-color-[a-z0-9-]+\s*:/gimu,
      `${file} must reuse existing global color tokens.`,
    );
  }
});
