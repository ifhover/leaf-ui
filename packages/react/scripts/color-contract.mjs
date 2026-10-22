import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PACKAGE_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_BASELINE_PATH = path.join(SCRIPT_DIR, 'color-contract-baseline.json');
const SOURCE_EXTENSIONS = new Set(['.scss', '.ts', '.tsx']);
const TEST_OR_FIXTURE_SEGMENT = /^(?:__tests__|__mocks__|fixtures?|docs?)$/u;
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$/u;
const DECLARATION_FILE = /\.d\.[cm]?ts$/u;
const GENERATED_PALETTE = 'styles/_palette.scss';
const PUBLIC_RECIPE_FILE = 'styles/_mixins.scss';
const GLOBAL_DEFINITION_ONLY_FILES = new Set([
  'color-recipes.ts',
  'colors.ts',
  'styles/tokens.scss',
  'tailwind-tokens.ts',
]);
const CONSUMPTION_DEFINITION_ONLY_FILES = new Set([
  ...GLOBAL_DEFINITION_ONLY_FILES,
  GENERATED_PALETTE,
]);
const HARDCODED_COLOR_CATEGORY = 'hardcodedColors';
const MIX_FORMULA_CATEGORY = 'mixFormulas';
const DERIVED_TOKEN_CATEGORY = 'derivedTokenUsages';
const FIELD_BORDER_CATEGORY = 'fieldFamilyBorders';
const FINDING_CATEGORIES = [
  HARDCODED_COLOR_CATEGORY,
  MIX_FORMULA_CATEGORY,
  DERIVED_TOKEN_CATEGORY,
  FIELD_BORDER_CATEGORY,
];
const GLOBAL_COLOR_TOKEN = /^--leaf-color-[a-z0-9-]+$/u;
const GLOBAL_COLOR_TOKEN_TEXT = '--leaf-color-[a-z0-9-]+';
const COLOR_VAR = new RegExp(`var\\(\\s*(${GLOBAL_COLOR_TOKEN_TEXT})\\s*(,)?`, 'giu');
const NUMERIC_DERIVED_TOKEN = new RegExp(
  `var\\(\\s*(${GLOBAL_COLOR_TOKEN_TEXT}-\\d+(?:\\.\\d+)?)\\s*[,)]`,
  'giu',
);
const FIELD_INCLUDE = /@include\s+(?:[a-z0-9_-]+\.)?field\s*\(/iu;
const PRIMARY_FIELD_INCLUDE = (component) =>
  new RegExp(
    `@include\\s+(?:[a-z0-9_-]+\\.)?field\\(\\s*['"]${component}['"]\\s*,\\s*['"]primary['"]\\s*\\)`,
    'iu',
  );
const FIELD_PAINT_DECLARATION =
  /(?:^|(?<=[;{}]))\s*(border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?|--leaf-field-(?:rest-border|color))\s*:\s*([^;{}]+);/gimu;

export function resolvePackageRoot() {
  return DEFAULT_PACKAGE_ROOT;
}

export function resolveBaselinePath() {
  return DEFAULT_BASELINE_PATH;
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function compareText(left, right) {
  return left.localeCompare(right, 'en');
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/(^|[^:])\/\/[^\n\r]*/gu, '$1');
}

export function normalizeExpression(value) {
  return value
    .replace(/#[0-9a-f]{3,8}\b/giu, (match) => match.toLowerCase())
    .replace(/\s+/gu, ' ')
    .replace(/\s*([(),:/])\s*/gu, '$1')
    .trim();
}

function addExpression(target, expression) {
  const normalized = normalizeExpression(expression);
  if (!normalized) return;
  target.set(normalized, (target.get(normalized) ?? 0) + 1);
}

function mapToEntries(map) {
  return [...map.entries()]
    .sort(([left], [right]) => compareText(left, right))
    .map(([expression, count]) => ({ expression, count }));
}

function groupByFile(records) {
  const result = {};
  for (const record of records) {
    result[record.file] ??= {};
    result[record.file][record.category] ??= new Map();
    result[record.file][record.category].set(
      record.expression,
      (result[record.file][record.category].get(record.expression) ?? 0) + record.count,
    );
  }
  for (const categories of Object.values(result)) {
    for (const [category, expressions] of Object.entries(categories)) {
      categories[category] = mapToEntries(expressions);
    }
  }
  return result;
}

function isSourcePath(relativePath) {
  const extension = path.posix.extname(relativePath);
  if (!SOURCE_EXTENSIONS.has(extension)) return false;
  if (TEST_FILE.test(relativePath) || DECLARATION_FILE.test(relativePath)) return false;
  return !relativePath.split('/').some((segment) => TEST_OR_FIXTURE_SEGMENT.test(segment));
}

async function listFiles(directory, root = directory) {
  const result = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await listFiles(absolute, root)));
    } else if (entry.isFile()) {
      const relative = toPosix(path.relative(root, absolute));
      if (isSourcePath(relative)) result.push(relative);
    }
  }
  return result.sort(compareText);
}

function extractFunctionCalls(source, names) {
  const result = [];
  const sortedNames = [...names].sort((left, right) => right.length - left.length);
  const lower = source.toLowerCase();
  for (let index = 0; index < source.length; index += 1) {
    const name = sortedNames.find((candidate) => lower.startsWith(candidate, index));
    if (!name) continue;
    const before = source[index - 1];
    if (before && /[a-z0-9_-]/iu.test(before)) continue;
    let open = index + name.length;
    while (/\s/u.test(source[open] ?? '')) open += 1;
    if (source[open] !== '(') continue;
    let depth = 0;
    let end = -1;
    for (let cursor = open; cursor < source.length; cursor += 1) {
      if (source[cursor] === '(') depth += 1;
      if (source[cursor] === ')') {
        depth -= 1;
        if (depth === 0) {
          end = cursor + 1;
          break;
        }
      }
    }
    if (end < 0) continue;
    result.push(source.slice(index, end));
    index = end - 1;
  }
  return result;
}

function collectHardcodedColors(source) {
  const clean = stripComments(source);
  const expressions = new Map();
  for (const match of clean.matchAll(/#[0-9a-f]{3,8}\b/giu)) addExpression(expressions, match[0]);
  for (const call of extractFunctionCalls(clean, ['rgba', 'hsla', 'rgb', 'hsl'])) {
    if (/^(?:rgba?|hsla?)\(\s*[-+]?(?:\d|\.\d)/iu.test(call)) addExpression(expressions, call);
  }
  for (const match of clean.matchAll(/(?<![\w-])(?:white|black)(?![\w-])/giu))
    addExpression(expressions, match[0]);
  return mapToEntries(expressions);
}

function collectMixFormulas(source) {
  const expressions = new Map();
  for (const call of extractFunctionCalls(stripComments(source), ['color-mix']))
    addExpression(expressions, call);
  return mapToEntries(expressions);
}

function collectDerivedTokenUsages(source) {
  const expressions = new Map();
  for (const match of stripComments(source).matchAll(NUMERIC_DERIVED_TOKEN))
    addExpression(expressions, `var(${match[1]})`);
  return mapToEntries(expressions);
}

function collectFieldFamilyBorders(source) {
  const expressions = new Map();
  const clean = stripComments(source);
  for (const match of clean.matchAll(FIELD_PAINT_DECLARATION)) {
    addExpression(expressions, `${match[1]}:${match[2]}`);
  }
  return mapToEntries(expressions);
}

function parseRecipes(source) {
  const recipes = {};
  const duplicate = [];
  const regex =
    /['"](--leaf-color-[a-z0-9-]+)['"]\s*:\s*\[\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/gu;
  for (const match of source.matchAll(regex)) {
    const token = match[1];
    if (recipes[token]) duplicate.push(token);
    recipes[token] = [match[2], match[3], Number(match[4])];
  }
  return { recipes, duplicate };
}

function parsePaletteTokens(source) {
  const light = new Set();
  const dark = new Set();
  let mode;
  for (const line of source.split(/\r?\n/u)) {
    if (/^\s*@mixin\s+light\b/u.test(line)) mode = 'light';
    else if (/^\s*@mixin\s+dark\b/u.test(line)) mode = 'dark';
    const match = line.match(new RegExp(`^\\s*(${GLOBAL_COLOR_TOKEN_TEXT})\\s*:`, 'u'));
    if (!match) continue;
    if (mode === 'light') light.add(match[1]);
    if (mode === 'dark') dark.add(match[1]);
  }
  return { light, dark };
}

function parseTokenAliases(source) {
  const aliases = new Set();
  const regex = new RegExp(`^\\s*(${GLOBAL_COLOR_TOKEN_TEXT})\\s*:`, 'gimu');
  for (const match of source.matchAll(regex)) aliases.add(match[1]);
  return aliases;
}

function parseLiteralDerivedTokens(source) {
  const tokens = new Set();
  const regex = new RegExp(`['"\`](${GLOBAL_COLOR_TOKEN_TEXT})['"\`]\\s*\\]?\\s*=`, 'gu');
  for (const match of source.matchAll(regex)) tokens.add(match[1]);
  return tokens;
}

function parseThemeOverrideTokens(source) {
  const tokens = new Set();
  const start = source.indexOf('const tokenVariables = {');
  if (start < 0) return tokens;
  const end = source.indexOf('\n};', start);
  const block = source.slice(start, end < 0 ? source.length : end);
  for (const match of block.matchAll(/['"](color-[a-z0-9-]+)['"]/gu))
    tokens.add(`--leaf-${match[1]}`);
  return tokens;
}

function collectGlobalDefinitions(contents) {
  const sources = new Map();
  const add = (token, source) => {
    if (!GLOBAL_COLOR_TOKEN.test(token)) return;
    if (!sources.has(token)) sources.set(token, new Set());
    sources.get(token).add(source);
  };
  const palette = parsePaletteTokens(contents.get(GENERATED_PALETTE) ?? '');
  for (const token of [...palette.light, ...palette.dark]) add(token, 'palette');

  const recipes = parseRecipes(contents.get('color-recipes.ts') ?? '');
  for (const token of Object.keys(recipes.recipes)) add(token, 'recipe');
  for (const token of parseLiteralDerivedTokens(contents.get('colors.ts') ?? ''))
    add(token, 'derived');
  for (const token of parseTokenAliases(contents.get('styles/tokens.scss') ?? ''))
    add(token, 'alias');
  for (const token of parseThemeOverrideTokens(contents.get('theme.ts') ?? ''))
    add(token, 'override');

  const definitionRegex = new RegExp(`(${GLOBAL_COLOR_TOKEN_TEXT})\\s*:`, 'gu');
  for (const [file, source] of contents) {
    if (
      file === GENERATED_PALETTE ||
      file === 'color-recipes.ts' ||
      file === 'colors.ts' ||
      file === 'styles/tokens.scss' ||
      file === 'theme.ts'
    )
      continue;
    for (const match of stripComments(source).matchAll(definitionRegex))
      add(match[1], `component:${file}`);
  }

  return {
    palette,
    recipes: recipes.recipes,
    duplicateRecipes: recipes.duplicate,
    sources,
    tokens: [...sources.keys()].sort(compareText),
  };
}

function classifyConsumer(file) {
  if (file.startsWith('shared/') || file.startsWith('styles/')) return 'shared';
  if (file.startsWith('config-provider/') || file === 'theme.ts') return 'infrastructure';
  return 'component';
}

function collectTokenConsumption(
  contents,
  defaultDefinedTokens,
  definedTokens,
  optionalOnlyTokens,
) {
  const tokens = new Map();
  const risks = [];
  const optionalWithFallback = [];
  const unknownWithFallback = [];
  for (const [file, source] of contents) {
    if (CONSUMPTION_DEFINITION_ONLY_FILES.has(file)) continue;
    const clean = stripComments(source);
    for (const match of clean.matchAll(COLOR_VAR)) {
      const token = match[1];
      const hasFallback = Boolean(match[2]);
      const kind = classifyConsumer(file);
      if (!tokens.has(token))
        tokens.set(token, {
          componentFiles: new Set(),
          sharedFiles: new Set(),
          infrastructureFiles: new Set(),
          occurrences: 0,
        });
      const record = tokens.get(token);
      record[`${kind}Files`].add(file);
      record.occurrences += 1;

      if (!defaultDefinedTokens.has(token) && !hasFallback) {
        risks.push({ file, token });
      } else if (!defaultDefinedTokens.has(token) && hasFallback) {
        if (optionalOnlyTokens.has(token)) optionalWithFallback.push({ file, token });
        if (!definedTokens.has(token)) unknownWithFallback.push({ file, token });
      }
    }
  }

  const serialized = {};
  for (const token of [...tokens.keys()].sort(compareText)) {
    const record = tokens.get(token);
    serialized[token] = {
      componentFiles: [...record.componentFiles].sort(compareText),
      sharedFiles: [...record.sharedFiles].sort(compareText),
      infrastructureFiles: [...record.infrastructureFiles].sort(compareText),
      occurrences: record.occurrences,
    };
  }
  return {
    tokens: serialized,
    risks: groupByFile(
      risks.map(({ file, token }) => ({
        file,
        category: 'undefinedGlobalTokens',
        expression: `var(${token})`,
        count: 1,
      })),
    ),
    optionalWithFallback,
    unknownWithFallback,
  };
}

function collectFindings(contents, fieldConsumers) {
  const records = [];
  for (const [file, source] of contents) {
    if (CONSUMPTION_DEFINITION_ONLY_FILES.has(file) || file === PUBLIC_RECIPE_FILE) continue;
    for (const finding of collectHardcodedColors(source))
      records.push({ file, category: HARDCODED_COLOR_CATEGORY, ...finding });
    for (const finding of collectMixFormulas(source))
      records.push({ file, category: MIX_FORMULA_CATEGORY, ...finding });
    for (const finding of collectDerivedTokenUsages(source))
      records.push({ file, category: DERIVED_TOKEN_CATEGORY, ...finding });
    if (fieldConsumers.includes(file))
      for (const finding of collectFieldFamilyBorders(source))
        records.push({ file, category: FIELD_BORDER_CATEGORY, ...finding });
  }
  return groupByFile(records);
}

function collectFieldFamily(contents) {
  const consumers = [];
  for (const [file, source] of contents) {
    if (file.endsWith('.scss') && file !== PUBLIC_RECIPE_FILE && FIELD_INCLUDE.test(source))
      consumers.push(file);
  }
  return consumers.sort(compareText);
}

export async function scanColorContract(packageRoot = DEFAULT_PACKAGE_ROOT) {
  const sourceRoot = path.join(packageRoot, 'src');
  const relativeFiles = await listFiles(sourceRoot);
  const contents = new Map();
  for (const file of relativeFiles) {
    contents.set(file, await fs.readFile(path.join(sourceRoot, file), 'utf8'));
  }

  const definitions = collectGlobalDefinitions(contents);
  const defaultDefinedTokens = new Set(
    [...definitions.sources.entries()]
      .filter(([, sources]) => [...sources].some((source) => source !== 'override'))
      .map(([token]) => token),
  );
  const definedTokens = new Set(definitions.tokens);
  const optionalOnlyTokens = new Set(
    [...definitions.sources.entries()]
      .filter(([, sources]) => sources.size === 1 && sources.has('override'))
      .map(([token]) => token),
  );
  const consumption = collectTokenConsumption(
    contents,
    defaultDefinedTokens,
    definedTokens,
    optionalOnlyTokens,
  );
  const fieldConsumers = collectFieldFamily(contents);
  const findings = collectFindings(contents, fieldConsumers);
  const sharedSource = contents.get(PUBLIC_RECIPE_FILE) ?? '';
  const sharedRecipeExpressions = {
    hardcodedColors: collectHardcodedColors(sharedSource),
    mixFormulas: collectMixFormulas(sharedSource),
    derivedTokenUsages: collectDerivedTokenUsages(sharedSource),
  };
  const paletteMismatch = {
    lightOnly: [...definitions.palette.light]
      .filter((token) => !definitions.palette.dark.has(token))
      .sort(compareText),
    darkOnly: [...definitions.palette.dark]
      .filter((token) => !definitions.palette.light.has(token))
      .sort(compareText),
  };

  return {
    packageRoot,
    sourceRoot,
    files: relativeFiles,
    contents,
    findings,
    sharedRecipeExpressions,
    fieldFamily: {
      consumers: fieldConsumers,
    },
    definitions: {
      tokens: definitions.tokens,
      sources: Object.fromEntries(
        [...definitions.sources.entries()]
          .sort(([left], [right]) => compareText(left, right))
          .map(([token, sources]) => [token, [...sources].sort(compareText)]),
      ),
      recipes: definitions.recipes,
      duplicateRecipes: definitions.duplicateRecipes,
      paletteMismatch,
    },
    consumption,
  };
}

function expressionMap(entries = []) {
  const counts = new Map();
  for (const { expression, count } of entries)
    counts.set(expression, (counts.get(expression) ?? 0) + count);
  return counts;
}

function allowedEntries(baseline, file, category) {
  return [
    ...(baseline.debt?.[file]?.[category] ?? []),
    ...(baseline.exceptions?.[file]?.[category] ?? []),
  ];
}

function compareFindings(scan, baseline, errors) {
  for (const [file, categories] of Object.entries(scan.findings)) {
    for (const [category, currentEntries] of Object.entries(categories)) {
      const allowed = expressionMap(allowedEntries(baseline, file, category));
      for (const { expression, count } of currentEntries) {
        const expected = allowed.get(expression);
        if (expected === undefined) {
          errors.push(
            `${file} [${category}] added expression "${expression}" (${count} occurrence${count === 1 ? '' : 's'}).`,
          );
        } else if (count > expected) {
          errors.push(
            `${file} [${category}] increased "${expression}" from ${expected} to ${count}.`,
          );
        }
      }
    }
  }
}

function compareSharedRecipes(scan, baseline, errors) {
  for (const [category, entries] of Object.entries(scan.sharedRecipeExpressions)) {
    const allowed = expressionMap(baseline.sharedRecipeExpressions?.[category]);
    for (const { expression, count } of entries) {
      if (count > (allowed.get(expression) ?? 0)) {
        errors.push(
          `${PUBLIC_RECIPE_FILE} [sharedRecipeExpressions.${category}] unreviewed expression "${expression}" (${count} occurrences); review the family recipe before updating its registry.`,
        );
      }
    }
  }
}

function compareRisks(scan, baseline, errors) {
  const registered = baseline.risks?.undefinedGlobalTokens ?? {};
  for (const [file, categories] of Object.entries(scan.consumption.risks)) {
    for (const { expression, count } of categories.undefinedGlobalTokens ?? []) {
      const expected = expressionMap(registered[file] ?? []).get(expression);
      if (expected === undefined) {
        errors.push(
          `${file} [undefinedGlobalTokens] added "${expression}" without a default definition or fallback (${count} occurrence${count === 1 ? '' : 's'}).`,
        );
      } else if (count > expected) {
        errors.push(
          `${file} [undefinedGlobalTokens] increased "${expression}" from ${expected} to ${count}.`,
        );
      }
    }
  }
}

function reviewMatches(baseline, kind, token, formula) {
  return (baseline.reviewedChanges ?? []).some((change) => {
    if (change.kind !== kind || change.token !== token) return false;
    if (!String(change.reason ?? '').trim()) return false;
    if (formula === undefined) return true;
    return (
      Array.isArray(change.formula) &&
      change.formula.length === 3 &&
      change.formula[0] === formula[0] &&
      change.formula[1] === formula[1] &&
      change.formula[2] === formula[2]
    );
  });
}

function compareGlobalTokens(scan, baseline, errors) {
  const expected = new Set(baseline.globalTokens ?? []);
  const current = new Set(scan.definitions.tokens);
  for (const token of [...current].sort(compareText)) {
    if (!expected.has(token) && !reviewMatches(baseline, 'global-token-add', token))
      errors.push(`Added global color token ${token}; register an explicit review entry.`);
  }
  for (const token of [...expected].sort(compareText)) {
    if (!current.has(token) && !reviewMatches(baseline, 'global-token-remove', token))
      errors.push(`Removed global color token ${token}; register an explicit review entry.`);
  }
}

function compareRecipes(scan, baseline, errors) {
  const expected = baseline.recipeFormulas ?? {};
  const current = scan.definitions.recipes;
  for (const token of Object.keys(current).sort(compareText)) {
    const formula = current[token];
    const previous = expected[token];
    if (!previous) {
      if (!reviewMatches(baseline, 'recipe-add', token, formula))
        errors.push(`Added color recipe ${token}; register an explicit review entry.`);
      continue;
    }
    if (previous[0] !== formula[0] || previous[1] !== formula[1] || previous[2] !== formula[2]) {
      if (!reviewMatches(baseline, 'recipe-change', token, formula))
        errors.push(
          `Changed color recipe ${token} from [${previous.join(', ')}] to [${formula.join(', ')}]; register an explicit review entry.`,
        );
    }
  }
  for (const token of Object.keys(expected).sort(compareText)) {
    if (!current[token] && !reviewMatches(baseline, 'recipe-remove', token))
      errors.push(`Removed color recipe ${token}; register an explicit review entry.`);
  }
}

function validateFieldFamily(scan, baseline, errors) {
  const registered = new Set(baseline.fieldFamily?.consumers ?? []);
  for (const file of scan.fieldFamily.consumers) {
    if (!registered.has(file))
      errors.push(
        `${file} is a new field-family consumer; register it in fieldFamily.consumers after review.`,
      );
  }
  for (const file of baseline.fieldFamily?.primaryFocusConsumers ?? []) {
    const source = scan.contents?.get?.(file);
    if (!source) {
      errors.push(`${file} is missing from the field-family primary-focus contract.`);
      continue;
    }
    const component = path.posix.basename(path.posix.dirname(file));
    if (!PRIMARY_FIELD_INCLUDE(component).test(source))
      errors.push(
        `${file} must call @include mixins.field('${component}', 'primary') for focused/open paint.`,
      );
    if (/--leaf-field-(?:color|rest-border)\s*:/u.test(source))
      errors.push(
        `${file} must not redefine --leaf-field-color or --leaf-field-rest-border; use the shared field variant.`,
      );
  }
  for (const [file, component] of Object.entries(
    baseline.fieldFamily?.neutralFocusConsumers ?? {},
  )) {
    const source = stripComments(scan.contents?.get?.(file) ?? '');
    const include = source.match(
      /@include\s+(?:[a-z0-9_-]+\.)?field\(\s*['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]+)['"]\s*)?\)/iu,
    );
    if (!include || include[1] !== component || (include[2] && include[2] !== 'neutral'))
      errors.push(`${file} must retain the shared neutral field variant for ${component}.`);
    if (/--leaf-field-(?:color|rest-border)\s*:/u.test(source))
      errors.push(`${file} must not redefine field-shell color; use the shared field recipe.`);
  }
}

function validateDefinitionHealth(scan, errors, warnings) {
  for (const token of scan.definitions.paletteMismatch.lightOnly)
    errors.push(`Generated palette token ${token} exists only in light mode.`);
  for (const token of scan.definitions.paletteMismatch.darkOnly)
    errors.push(`Generated palette token ${token} exists only in dark mode.`);
  for (const duplicate of scan.definitions.duplicateRecipes)
    errors.push(`Duplicate color recipe ${duplicate}.`);
  const known = new Set(scan.definitions.tokens);
  for (const { file, token } of scan.consumption.unknownWithFallback) {
    if (!known.has(token)) warnings.push(`${file} consumes unregistered ${token} with a fallback.`);
  }
}

export function evaluateColorContract(scan, baseline) {
  const errors = [];
  const warnings = [];
  compareGlobalTokens(scan, baseline, errors);
  compareRecipes(scan, baseline, errors);
  compareFindings(scan, baseline, errors);
  compareSharedRecipes(scan, baseline, errors);
  compareRisks(scan, baseline, errors);
  validateFieldFamily(scan, baseline, errors);
  validateDefinitionHealth(scan, errors, warnings);
  const riskCount = Object.values(scan.consumption.risks).reduce(
    (total, categories) =>
      total +
      (categories.undefinedGlobalTokens ?? []).reduce(
        (categoryTotal, entry) => categoryTotal + entry.count,
        0,
      ),
    0,
  );
  return {
    ok: errors.length === 0,
    errors,
    warnings: [...new Set(warnings)].sort(compareText),
    stats: {
      scannedFiles: scan.files.length,
      globalTokens: scan.definitions.tokens.length,
      recipes: Object.keys(scan.definitions.recipes).length,
      fieldConsumers: scan.fieldFamily.consumers.length,
      undefinedRiskOccurrences: riskCount,
      debtOccurrences: FINDING_CATEGORIES.reduce(
        (total, category) =>
          total + countDebtEntries(scan.findings, baseline.exceptions, category).occurrences,
        0,
      ),
    },
  };
}

function countDebtEntries(findings, exceptions, category) {
  let expressions = 0;
  let occurrences = 0;
  for (const [file, categories] of Object.entries(findings)) {
    const exceptionCounts = expressionMap(exceptions?.[file]?.[category]);
    for (const entry of categories[category] ?? []) {
      const debtCount = Math.max(0, entry.count - (exceptionCounts.get(entry.expression) ?? 0));
      if (!debtCount) continue;
      expressions += 1;
      occurrences += debtCount;
    }
  }
  return { expressions, occurrences };
}

function countBaselineEntries(section, category) {
  let expressions = 0;
  let occurrences = 0;
  for (const categories of Object.values(section ?? {})) {
    for (const entry of categories?.[category] ?? []) {
      expressions += 1;
      occurrences += entry.count;
    }
  }
  return { expressions, occurrences };
}

function sourceSummary(sources) {
  return Object.entries(sources)
    .map(([source, count]) => `${source} ${count}`)
    .join(', ');
}

function formatTokenConsumption(scan) {
  const generated = scan.definitions.tokens
    .filter((token) =>
      (scan.definitions.sources[token] ?? []).some((source) => source !== 'override'),
    )
    .sort(compareText);
  const rows = generated.map((token) => {
    const consumption = scan.consumption.tokens[token] ?? {
      componentFiles: [],
      sharedFiles: [],
      infrastructureFiles: [],
      occurrences: 0,
    };
    return `| \`${token}\` | ${consumption.componentFiles.length} | ${consumption.sharedFiles.length + consumption.infrastructureFiles.length} | ${consumption.occurrences} |`;
  });
  return [
    '| Token | Component files | Shared/infrastructure files | Occurrences |',
    '| --- | ---: | ---: | ---: |',
    ...rows,
  ].join('\n');
}

function formatExceptions(exceptions) {
  const lines = [];
  for (const [file, categories] of Object.entries(exceptions ?? {}).sort(([left], [right]) =>
    compareText(left, right),
  )) {
    lines.push(`### \`${file}\``);
    for (const category of FINDING_CATEGORIES) {
      for (const entry of categories[category] ?? []) {
        lines.push(
          `- ${category}: \`${entry.expression}\` x${entry.count} - ${entry.reason ?? 'No reason recorded.'}`,
        );
      }
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}

function formatFindings(findings, exceptions) {
  const lines = [];
  for (const [file, categories] of Object.entries(findings).sort(([left], [right]) =>
    compareText(left, right),
  )) {
    const fileLines = [];
    for (const category of FINDING_CATEGORIES) {
      const entries = categories[category] ?? [];
      if (!entries.length) continue;
      const exceptionCounts = expressionMap(exceptions?.[file]?.[category]);
      const debtEntries = entries
        .map((entry) => ({
          expression: entry.expression,
          count: Math.max(0, entry.count - (exceptionCounts.get(entry.expression) ?? 0)),
        }))
        .filter((entry) => entry.count > 0);
      if (!debtEntries.length) continue;
      fileLines.push(`- ${category}:`);
      for (const { expression, count } of debtEntries)
        fileLines.push(`  - \`${expression}\` x${count}`);
    }
    if (!fileLines.length) continue;
    lines.push(`### \`${file}\``, ...fileLines, '');
  }
  return lines.join('\n').trimEnd();
}

export function renderAuditReport(scan, evaluation, baseline) {
  const hardcodedDebt = countDebtEntries(
    scan.findings,
    baseline.exceptions,
    HARDCODED_COLOR_CATEGORY,
  );
  const mixDebt = countDebtEntries(scan.findings, baseline.exceptions, MIX_FORMULA_CATEGORY);
  const derivedDebt = countDebtEntries(scan.findings, baseline.exceptions, DERIVED_TOKEN_CATEGORY);
  const fieldDebt = countDebtEntries(scan.findings, baseline.exceptions, FIELD_BORDER_CATEGORY);
  const exceptionHardcoded = countBaselineEntries(baseline.exceptions, HARDCODED_COLOR_CATEGORY);
  const exceptionMix = countBaselineEntries(baseline.exceptions, MIX_FORMULA_CATEGORY);
  const sourceCounts = {};
  for (const sources of Object.values(scan.definitions.sources))
    for (const source of sources) sourceCounts[source] = (sourceCounts[source] ?? 0) + 1;
  const zeroComponentConsumers = scan.definitions.tokens.filter(
    (token) =>
      (scan.definitions.sources[token] ?? []).some((source) => source !== 'override') &&
      (scan.consumption.tokens[token]?.componentFiles.length ?? 0) === 0,
  );
  const overrideOnlyTokens = scan.definitions.tokens.filter(
    (token) =>
      (scan.definitions.sources[token] ?? []).length === 1 &&
      scan.definitions.sources[token][0] === 'override',
  );
  const riskLines = [];
  for (const [file, categories] of Object.entries(scan.consumption.risks)) {
    for (const entry of categories.undefinedGlobalTokens ?? [])
      riskLines.push(`- \`${file}\`: \`${entry.expression}\` x${entry.count}`);
  }
  const optionalLines = scan.consumption.optionalWithFallback.map(
    ({ file, token }) => `- \`${file}\`: \`var(${token}, ...)\``,
  );
  const unknownFallbackLines = scan.consumption.unknownWithFallback.map(
    ({ file, token }) =>
      `- \`${file}\`: \`var(${token}, ...)\` (fallback present; no registered definition).`,
  );
  const overrideOnlyLines = overrideOnlyTokens.map((token) => {
    const usage = scan.consumption.tokens[token] ?? {
      componentFiles: [],
      sharedFiles: [],
      infrastructureFiles: [],
      occurrences: 0,
    };
    return `- \`${token}\`: ${usage.componentFiles.length} component files, ${usage.sharedFiles.length + usage.infrastructureFiles.length} shared/infrastructure files, ${usage.occurrences} occurrences.`;
  });
  const fieldLines = scan.fieldFamily.consumers.map((file) => {
    const entries = scan.findings[file]?.[FIELD_BORDER_CATEGORY] ?? [];
    return `- \`${file}\`: ${entries.length} controlled border expression${entries.length === 1 ? '' : 's'}`;
  });
  return `# Leaf UI color contract audit

> This file records existing migration debt, reviewed exceptions, and structural contracts. It is not a compliance claim and does not mean the existing component colors have been migrated.

Snapshot: 0.9.0 dirty worktree, generated from a static source scan. The checker compares normalized expressions and occurrence counts, not line numbers.

## Scope

- Scanned: \`packages/react/src/**/*.scss|ts|tsx\`.
- Excluded from consumption/debt: generated \`styles/_palette.scss\`, \`*.test.*\`, \`*.spec.*\`, fixtures, and declaration files.
- Not counted as reuse: \`colors.ts\`, \`color-recipes.ts\`, \`tailwind-tokens.ts\`, \`styles/tokens.scss\`, and \`styles/_palette.scss\`.
- Shared \`styles/_mixins.scss\` formulas, fixed colors and numeric-token usages have a separate reviewed registry, not component debt. New expressions and increased counts require review; state behavior still requires browser acceptance.
- Static limits: this is a declaration/expression scanner, not a CSS cascade engine. Dynamic SCSS interpolation, portal overrides, inline styles supplied by applications, and computed values are outside its proof.

## Current totals

| Metric | Expressions | Occurrences |
| --- | ---: | ---: |
| Hardcoded color debt | ${hardcodedDebt.expressions} | ${hardcodedDebt.occurrences} |
| Component color-mix debt | ${mixDebt.expressions} | ${mixDebt.occurrences} |
| Numeric derived-token debt | ${derivedDebt.expressions} | ${derivedDebt.occurrences} |
| Field-family border debt | ${fieldDebt.expressions} | ${fieldDebt.occurrences} |
| Legal hardcoded-color exceptions | ${exceptionHardcoded.expressions} | ${exceptionHardcoded.occurrences} |
| Legal color-mix exceptions | ${exceptionMix.expressions} | ${exceptionMix.occurrences} |

Registered undefined-token risk occurrences: ${evaluation.stats.undefinedRiskOccurrences}.

Global color tokens: ${scan.definitions.tokens.length}. Color recipes: ${Object.keys(scan.definitions.recipes).length}. Field-family consumers: ${scan.fieldFamily.consumers.length}.

Definition source counts (a token may have multiple sources): ${sourceSummary(sourceCounts)}.

## Global token review

The baseline includes the union of palette output, recipe keys, literal derived outputs from \`colors.ts\`, token aliases, theme override mappings, and any other global definitions. New or removed global \`--leaf-color-*\` tokens fail until an explicit review entry is added. \`_palette.scss\` is an output inventory only and is never counted as a consumer.

Optional override tokens and unknown fallback names remain visible in the audit. They are not treated as normal component reuse.

## Field-family contract

${fieldLines.join('\n')}

Input and Select must call \`mixins.field(..., 'primary')\` and must not redefine \`--leaf-field-color\` or \`--leaf-field-rest-border\`. The shared expression registry prevents unreviewed formula growth but does not prove internal state precedence; changes there require the documented browser comparison. Inner native-control resets, structural dividers and popup-only paint are separately reviewed exceptions, not duplicated field-shell recipes.

## Undefined or optional tokens

### Override-only global tokens

${overrideOnlyLines.length ? overrideOnlyLines.join('\n') : '- None.'}

### Registered undefined risks

${riskLines.length ? riskLines.join('\n') : '- None.'}

### Optional-only consumers with fallback

${optionalLines.length ? [...new Set(optionalLines)].join('\n') : '- None.'}

### Unknown consumers with fallback

${unknownFallbackLines.length ? [...new Set(unknownFallbackLines)].join('\n') : '- None.'}

## Generated token consumption

Counts are direct static \`var(--leaf-color-*)\` consumers. Generated definitions, token aliases, tests, fixtures, and documentation do not count as reuse. A shared recipe counts as one shared file, not as proof that every component using that recipe paints the token.

${formatTokenConsumption(scan)}

### Tokens with zero direct component consumers

${zeroComponentConsumers.length ? zeroComponentConsumers.map((token) => `- \`${token}\``).join('\n') : '- None.'}

## Existing debt detail

${formatFindings(scan.findings, baseline.exceptions)}

## Reviewed exceptions

These entries are controlled exceptions, not compliance claims. Their exact expression and count are part of the baseline.

${formatExceptions(baseline.exceptions)}

## Priority migration

1. Field shell: outer field shells already share the field recipe; continue reviewing the ColorPicker private value input without confusing native border resets, internal dividers or swatch outlines with duplicated shell paint. Retain neutral focus variants; only Input/Select opt into primary focus.
2. Option and surface families: migrate remaining numeric derived-token consumers in Menu, Calendar, Dropdown, and related popup surfaces to shared family recipes. Table/DataTable now consume the shared table-family recipe, including defined selected/action fallbacks.
3. Neutral shadows and overlays: consolidate remaining hardcoded black/white alpha paint in theme and component SCSS without changing resting geometry.
4. Optional/compatibility inputs: keep \`primarySoftColor\` as an optional override with family-local fallbacks, not a default-generated global token. The historical \`surface-alpha-80\` CSS override remains supported with a table-surface fallback; its unknown-name warning is intentional until compatibility cleanup is separately reviewed.
5. Generated token cleanup: review zero-consumer tokens only after removing all consumers; removal is a separate reviewed recipe/palette change.

## Not completed

- No visual or browser acceptance was performed by this checker.
- No attempt was made to prove full CSS cascade, Shadow DOM, portal, inline-style, or dynamic interpolation behavior.
- Existing debt is not migrated by this audit. Exceptions are allowed cases, not compliant replacements for new component defaults.
- \`_mixins.scss\` state behavior and computed field focus, validation, disabled, and custom-theme paint remain browser-test responsibilities.
`;
}

async function loadBaseline(baselinePath = DEFAULT_BASELINE_PATH) {
  return JSON.parse(await fs.readFile(baselinePath, 'utf8'));
}

async function main() {
  const baselinePath = resolveBaselinePath();
  const baseline = await loadBaseline(baselinePath);
  const scan = await scanColorContract(resolvePackageRoot());
  const evaluation = evaluateColorContract(scan, baseline);
  if (!evaluation.ok) {
    console.error('Color contract check failed:');
    for (const error of evaluation.errors) console.error(`- ${error}`);
    console.error(
      'Update the baseline only after manual review; this command has no --update mode.',
    );
    process.exitCode = 1;
    return;
  }
  console.log(
    `Color contract baseline passed: ${evaluation.stats.scannedFiles} files, ${evaluation.stats.globalTokens} global tokens, ${evaluation.stats.recipes} recipes, ${evaluation.stats.fieldConsumers} field consumers.`,
  );
  console.log(
    `${evaluation.stats.debtOccurrences} registered debt occurrences and ${evaluation.stats.undefinedRiskOccurrences} undefined-token risk occurrences remain; this is not a compliance claim.`,
  );
  for (const warning of evaluation.warnings) console.warn(`Warning: ${warning}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(`Color contract check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
