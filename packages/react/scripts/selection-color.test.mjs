import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_ROOT = path.resolve(SCRIPT_DIR, '..', 'src');

const FAMILY_CONSUMERS = {
  'dropdown/dropdown.scss': {
    family: 'danger-soft-feedback-family',
    variables: ['--leaf-danger-soft-background', '--leaf-danger-soft-active-background'],
    forbiddenTokens: ['var(--leaf-color-danger-surface-6)', 'var(--leaf-color-danger-surface-8)'],
  },
  'menu/menu.scss': {
    family: 'danger-soft-feedback-family',
    variables: ['--leaf-danger-soft-background', '--leaf-danger-soft-active-background'],
    forbiddenTokens: ['var(--leaf-color-danger-surface-6)', 'var(--leaf-color-danger-surface-8)'],
  },
  'pagination/pagination.scss': {
    family: 'accent-soft-feedback-family',
    variables: ['--leaf-accent-soft-background', '--leaf-accent-soft-border'],
    forbiddenTokens: ['var(--leaf-color-primary-surface-8)', 'var(--leaf-color-primary-border-24)'],
  },
  'transfer/transfer.scss': {
    family: 'accent-soft-feedback-family',
    variables: ['--leaf-accent-soft-background'],
    forbiddenTokens: ['var(--leaf-color-primary-surface-8)'],
  },
  'upload/upload.scss': {
    family: 'accent-soft-feedback-family',
    variables: ['--leaf-accent-soft-background', '--leaf-accent-soft-border'],
    forbiddenTokens: [
      'var(--leaf-color-primary-surface-7)',
      'var(--leaf-color-primary-surface-8)',
      'var(--leaf-color-primary-alpha-10)',
    ],
  },
  'splitter/splitter.scss': {
    family: 'accent-soft-feedback-family',
    variables: ['--leaf-accent-soft-border'],
    forbiddenTokens: ['var(--leaf-color-primary-surface-28)'],
  },
  'tree/tree.scss': {
    family: 'accent-soft-feedback-family',
    variables: ['--leaf-accent-soft-background'],
    forbiddenTokens: [
      'var(--leaf-color-primary-alpha-12)',
      'var(--leaf-color-border-alpha-55)',
      '#0002',
    ],
  },
};

const COMPANION_FAMILY_CONSUMERS = {
  'upload/upload.scss': {
    family: 'accent-halo-family',
    variables: ['--leaf-accent-halo-color'],
  },
};

// Menu's three appearances are a deliberate visual exception. Only numeric-token
// budgets already present in that design may remain.
const RATIO_TOKEN_BUDGET = {
  'menu/menu.scss': {
    '--leaf-color-primary-alpha-10': 1,
    '--leaf-color-primary-alpha-4': 1,
  },
};

const RATIO_TOKEN = /var\(\s*(--leaf-color-[a-z0-9-]+-\d+(?:\.\d+)?)\s*[,)]/giu;

function countMatches(source, expression) {
  return [...source.matchAll(expression)].length;
}

function ratioTokenUsage(source) {
  const usage = {};
  for (const match of source.matchAll(RATIO_TOKEN)) {
    usage[match[1]] = (usage[match[1]] ?? 0) + 1;
  }
  return usage;
}

test('migrated component roots consume shared option and selection families', async () => {
  const contracts = Object.entries(FAMILY_CONSUMERS).map(([file, contract]) => [file, contract]);
  contracts.push(...Object.entries(COMPANION_FAMILY_CONSUMERS));

  for (const [file, contract] of contracts) {
    const source = await fs.readFile(path.join(SOURCE_ROOT, ...file.split('/')), 'utf8');
    assert.match(
      source,
      new RegExp(`@include\\s+(?:mixins\\.)?${contract.family}\\s*;`, 'u'),
      `${file} must include mixins.${contract.family} at its component root`,
    );
    for (const variable of contract.variables) {
      assert.match(
        source,
        new RegExp(`var\\(${variable}\\)`, 'u'),
        `${file} must consume ${variable}`,
      );
    }
    for (const token of contract.forbiddenTokens ?? []) {
      assert.equal(
        source.includes(token),
        false,
        `${file} must not bypass the family with ${token}`,
      );
    }
  }

  const inputNumber = await fs.readFile(
    path.join(SOURCE_ROOT, 'inputnumber', 'inputnumber.scss'),
    'utf8',
  );
  assert.doesNotMatch(inputNumber, /--leaf-color-primary-surface-10/u);
  assert.equal(
    countMatches(inputNumber, /background:\s*var\(--leaf-color-option-hover\)/gu) >= 3,
    true,
    'InputNumber step controls must use the ordinary option feedback role',
  );
});

test('migrated families do not add numeric color ratios', async () => {
  const files = new Set([...Object.keys(FAMILY_CONSUMERS), 'inputnumber/inputnumber.scss']);

  for (const file of files) {
    const source = await fs.readFile(path.join(SOURCE_ROOT, ...file.split('/')), 'utf8');
    const actual = ratioTokenUsage(source);
    const allowed = RATIO_TOKEN_BUDGET[file] ?? {};
    for (const [token, count] of Object.entries(actual)) {
      assert.ok(
        count <= (allowed[token] ?? 0),
        `${file} added ${token} (${count} occurrence${count === 1 ? '' : 's'})`,
      );
    }
  }
});

test('Tree keeps its drag preview on the existing medium shadow role', async () => {
  const tree = await fs.readFile(path.join(SOURCE_ROOT, 'tree', 'tree.scss'), 'utf8');
  assert.match(tree, /\.leaf-tree__drag-preview\s*\{[^}]*box-shadow:\s*var\(--leaf-shadow-md\);/su);
});
