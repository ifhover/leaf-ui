import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const traverse = traverseModule.default ?? traverseModule;
const mdxParser = unified().use(remarkParse).use(remarkMdx);

function walk(node, visitor, parent, key) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visitor, parent, key);
    return;
  }
  visitor(node, parent, key);
  for (const [childKey, child] of Object.entries(node)) {
    if (!['loc', 'tokens', 'comments'].includes(childKey) && child && typeof child === 'object')
      walk(child, visitor, node, childKey);
  }
}

function bindings(node) {
  if (!node) return [];
  if (node.type === 'Identifier') return [node.name];
  if (node.type === 'ObjectPattern')
    return node.properties.flatMap((property) => bindings(property.value ?? property.argument));
  if (node.type === 'ArrayPattern') return node.elements.flatMap(bindings);
  if (node.type === 'AssignmentPattern') return bindings(node.left);
  if (node.type === 'RestElement') return bindings(node.argument);
  return [];
}

/** Specialize documentation-only language props without changing demo state or preview code. */
export function localizeExampleSource(source, english = false) {
  const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  const languageBindings = new Set();
  const replacements = new Map();
  traverse(ast, {
    Function(fn) {
      if (fn.node.params.length !== 1) return;
      const parameter = fn.node.params[0];
      const pattern = parameter.type === 'AssignmentPattern' ? parameter.left : parameter;
      if (pattern.type !== 'ObjectPattern' || pattern.properties.length !== 1) return;
      const property = pattern.properties[0];
      if (property.type !== 'ObjectProperty' || property.key.name !== 'english') return;
      const binding = fn.scope.getBinding('english');
      if (binding?.kind !== 'param') return;
      languageBindings.add(binding);
      replacements.set(parameter, '');
    },
  });
  if (!languageBindings.size) return source;
  const booleanValue = (reference) => {
    if (
      reference.isIdentifier({ name: 'english' }) &&
      languageBindings.has(reference.scope.getBinding('english'))
    )
      return english;
    if (reference.isUnaryExpression({ operator: '!' })) {
      const value = booleanValue(reference.get('argument'));
      return value === undefined ? undefined : !value;
    }
    return undefined;
  };
  const helpers = new Map();
  traverse(ast, {
    VariableDeclarator(declaration) {
      const fn = declaration.get('init');
      if (!fn.isArrowFunctionExpression() || !fn.get('body').isConditionalExpression()) return;
      const body = fn.get('body');
      const value = booleanValue(body.get('test'));
      if (value === undefined) return;
      const selected = value ? body.node.consequent : body.node.alternate;
      const parameter = fn.node.params.findIndex(
        (item) => item.type === 'Identifier' && item.name === selected.name,
      );
      if (parameter < 0 || declaration.parent.declarations.length !== 1) return;
      helpers.set(declaration.scope.getBinding(declaration.node.id.name), parameter);
      replacements.set(declaration.parent, '');
    },
  });
  traverse(ast, {
    ConditionalExpression(expression) {
      const value = booleanValue(expression.get('test'));
      if (value !== undefined)
        replacements.set(
          expression.node,
          value ? expression.node.consequent : expression.node.alternate,
        );
    },
    LogicalExpression(expression) {
      const value = booleanValue(expression.get('left'));
      if (value === undefined) return;
      if (
        (expression.node.operator === '&&' && value) ||
        (expression.node.operator === '||' && !value)
      )
        replacements.set(expression.node, expression.node.right);
      else replacements.set(expression.node, String(value));
    },
    CallExpression(call) {
      if (!call.get('callee').isIdentifier()) return;
      const parameter = helpers.get(call.scope.getBinding(call.node.callee.name));
      const argument = call.node.arguments[parameter];
      if (parameter !== undefined && argument) replacements.set(call.node, argument);
    },
    JSXAttribute(attribute) {
      if (attribute.node.name.name === 'english') replacements.set(attribute.node, '');
    },
    ReferencedIdentifier(reference) {
      if (
        reference.node.name === 'english' &&
        languageBindings.has(reference.scope.getBinding('english'))
      )
        replacements.set(reference.node, String(english));
    },
  });
  const render = (node) => {
    const replacement = replacements.get(node);
    if (replacement !== undefined)
      return typeof replacement === 'string' ? replacement : render(replacement);
    const children = Object.entries(node)
      .filter(([key]) => !['loc', 'tokens', 'comments'].includes(key))
      .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
      .filter(
        (child) =>
          child &&
          typeof child === 'object' &&
          typeof child.type === 'string' &&
          child.start >= node.start &&
          child.end <= node.end,
      )
      .sort((a, b) => a.start - b.start || b.end - a.end);
    let text = '',
      offset = node.start;
    for (const child of children) {
      if (child.start < offset) continue;
      text += source.slice(offset, child.start) + render(child);
      offset = child.end;
    }
    return text + source.slice(offset, node.end);
  };
  return render(ast.program);
}

export function extractExampleSource(source, names, options = {}) {
  source = localizeExampleSource(source, options.english);
  const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  const entries = ast.program.body.flatMap((statement) => {
    const declaration = statement.declaration ?? statement;
    if (statement.type === 'ImportDeclaration') return [];
    if (declaration.type === 'VariableDeclaration')
      return declaration.declarations.map((item) => ({
        statement,
        declaration: item,
        names: bindings(item.id),
      }));
    return [{ statement, declaration, names: declaration.id ? [declaration.id.name] : [] }];
  });
  const byName = new Map(entries.flatMap((entry) => entry.names.map((name) => [name, entry])));
  const imports = new Set(
    ast.program.body
      .filter((statement) => statement.type === 'ImportDeclaration')
      .flatMap((statement) => statement.specifiers.map((specifier) => specifier.local.name)),
  );
  const dependencies = new Map(entries.map((entry) => [entry, new Set()]));
  traverse(ast, {
    'Identifier|JSXIdentifier'(reference) {
      const { node, parent, key, scope } = reference;
      const jsx =
        node.type === 'JSXIdentifier' &&
        (['JSXOpeningElement', 'JSXClosingElement'].includes(parent.type) ||
          (parent.type === 'JSXMemberExpression' && key === 'object'));
      if (!jsx && !reference.isReferencedIdentifier()) return;
      if (
        (key === 'key' && !parent.computed && !parent.shorthand) ||
        (key === 'property' && !parent.computed) ||
        parent.type === 'JSXAttribute'
      )
        return;
      const binding = scope.getBinding(node.name);
      if (binding && !binding.scope.path.isProgram()) return;
      if (!binding && !byName.has(node.name) && !imports.has(node.name)) return;
      const entry = entries.find(
        (item) => node.start >= item.declaration.start && node.end <= item.declaration.end,
      );
      if (entry) dependencies.get(entry).add(node.name);
    },
  });
  const selected = new Set();
  const used = new Set();
  const pending = Array.isArray(names) ? [...names] : [names];
  for (const name of pending) {
    const entry = byName.get(name);
    if (!entry) continue;
    if (selected.has(entry)) continue;
    selected.add(entry);
    for (const identifier of dependencies.get(entry)) {
      used.add(identifier);
      if (byName.has(identifier)) pending.push(identifier);
    }
  }
  if (!selected.size) throw new Error(`Example export not found: ${pending.join(', ')}`);
  const output = [];
  const importLines = [];
  for (const statement of ast.program.body) {
    if (statement.type === 'ImportDeclaration') {
      if (!statement.specifiers.length) {
        importLines.push(source.slice(statement.start, statement.end));
        continue;
      }
      const specifiers = statement.specifiers.filter((specifier) => used.has(specifier.local.name));
      if (!specifiers.length) continue;
      const head = specifiers.filter((item) => item.type !== 'ImportSpecifier');
      const named = specifiers.filter((item) => item.type === 'ImportSpecifier');
      importLines.push(
        `import ${statement.importKind === 'type' ? 'type ' : ''}${[
          ...head.map((item) => source.slice(item.start, item.end)),
          ...(named.length
            ? [`{ ${named.map((item) => source.slice(item.start, item.end)).join(', ')} }`]
            : []),
        ].join(', ')} from ${source.slice(statement.source.start, statement.source.end)};`,
      );
      continue;
    }
    const included = entries.filter(
      (entry) => entry.statement === statement && selected.has(entry),
    );
    if (!included.length) continue;
    const declaration = statement.declaration ?? statement;
    if (declaration.type === 'VariableDeclaration')
      output.push(
        `${statement.type === 'ExportNamedDeclaration' ? 'export ' : ''}${declaration.kind} ${included.map((entry) => source.slice(entry.declaration.start, entry.declaration.end)).join(', ')};`,
      );
    else output.push(source.slice(statement.start, statement.end));
  }
  return `${[importLines.join('\n'), ...output].filter(Boolean).join('\n\n')}\n`;
}

function previewNames(value, aliases = new Map()) {
  const names = [...value.matchAll(/<([A-Z]\w*)\b/g)].map(
    (match) => aliases.get(match[1]) ?? match[1],
  );
  return [...new Set(names)];
}

function previewEnglish(value) {
  if (!value.trim()) return false;
  const ast = parse(`(${value})`, { plugins: ['typescript', 'jsx'] });
  const languages = new Set();
  walk(ast, (node) => {
    if (node.type !== 'JSXOpeningElement') return;
    const attributes = node.attributes.filter((attribute) => attribute.name?.name === 'english');
    if (
      node.attributes.some((attribute) => attribute.type === 'JSXSpreadAttribute') ||
      attributes.length > 1
    )
      throw new Error('Example preview cannot use spread or duplicate english attributes.');
    const attribute = attributes[0];
    if (!attribute) {
      languages.add(false);
      return;
    }
    if (
      attribute.value &&
      (attribute.value.type !== 'JSXExpressionContainer' ||
        attribute.value.expression.type !== 'BooleanLiteral')
    )
      throw new Error('Example preview english must be shorthand or a literal boolean.');
    languages.add(attribute.value ? attribute.value.expression.value : true);
  });
  if (languages.size > 1)
    throw new Error('Example preview cannot mix different english values in one code sample.');
  return languages.values().next().value ?? false;
}

function importAliases(source) {
  const aliases = new Map();
  const imports = source.replace(/```[\s\S]*?```/g, '');
  for (const match of imports.matchAll(
    /^import\s+(?:type\s+)?(?:\{[^}]*\}|[^;\n]+)\s+from\s+['"][^'"]+['"];?/gm,
  )) {
    const ast = parse(match[0], { sourceType: 'module', plugins: ['typescript', 'jsx'] });
    for (const statement of ast.program.body)
      for (const specifier of statement.specifiers ?? [])
        if (specifier.type === 'ImportSpecifier')
          aliases.set(specifier.local.name, specifier.imported.name ?? specifier.imported.value);
  }
  return aliases;
}

export function remarkExampleSource() {
  return (tree) => {
    const aliases = new Map();
    for (const node of tree.children ?? []) {
      if (node.type !== 'mdxjsEsm') continue;
      const ast = parse(node.value, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
      for (const statement of ast.program.body) {
        if (statement.type !== 'ImportDeclaration') continue;
        for (const specifier of statement.specifiers)
          if (specifier.type === 'ImportSpecifier')
            aliases.set(specifier.local.name, specifier.imported.name ?? specifier.imported.value);
      }
    }
    walk(tree, (node) => {
      if (
        !['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type) ||
        node.name !== 'ComponentExample'
      )
        return;
      const preview = node.attributes.find((attribute) => attribute.name === 'preview');
      const value = preview?.value?.value ?? '';
      const names = previewNames(value, aliases);
      if (!names.length) return;
      const english = previewEnglish(value);
      for (const code of node.children.filter((child) => child.type === 'code'))
        if (/\bfile=/.test(code.meta ?? '') && ['tsx', 'ts', 'jsx', 'js'].includes(code.lang))
          code.value = extractExampleSource(code.value, names, { english });
    });
  };
}

export function extractExampleMarkdown(markdown, mdx) {
  const aliases = importAliases(mdx);
  const examples = [];
  walk(mdxParser.parse(mdx), (node) => {
    if (
      !['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type) ||
      node.name !== 'ComponentExample'
    )
      return;
    const preview = node.attributes.find((attribute) => attribute.name === 'preview');
    const value = preview?.value?.value ?? '';
    const names = previewNames(value, aliases);
    const english = previewEnglish(value);
    for (const code of node.children.filter((child) => child.type === 'code')) {
      const file = code.meta?.match(/\bfile="([^"]+)"/)?.[1];
      if (file && ['tsx', 'ts', 'jsx', 'js'].includes(code.lang))
        examples.push({
          file,
          names,
          english,
        });
    }
  });
  const queue = new Map();
  for (const example of examples) {
    const items = queue.get(example.file) ?? [];
    items.push(example);
    queue.set(example.file, items);
  }
  return markdown.replace(
    /(```(?:tsx|ts|jsx|js)[^\n]*\bfile="([^"]+)"[^\n]*\n)([\s\S]*?)(\n```)/g,
    (fence, opening, file, source, closing) => {
      const example = queue.get(file)?.shift();
      if (!example?.names.length) return fence;
      return opening + extractExampleSource(source, example.names, example).trimEnd() + closing;
    },
  );
}
