import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';

const modules = new Map();

/** Retain hand-written descriptions from both three- and four-column API tables. */
export function readApiRows(section) {
  const result = new Map();
  for (const line of section.split('\n')) {
    if (!line.startsWith('| `')) continue;
    const cells = line
      .split(/(?<!\\)\|/u)
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 3) continue;
    const names = [...cells[0].matchAll(/`([^`]+)`/gu)].flatMap((match) =>
      match[1].split(/\s*\/\s*/u),
    );
    const hasDefault = cells.length >= 4;
    const defaults = hasDefault ? cells[2].replace(/^`|`$/gu, '').split(/\s+\/\s+/u) : [];
    for (const [index, name] of names.entries()) {
      const value =
        hasDefault && defaults.length === names.length && names.length > 1
          ? `\`${defaults[index]}\``
          : hasDefault
            ? cells[2]
            : '—';
      result.set(name, {
        type: cells[1],
        defaultValue: value,
        description: cells[hasDefault ? 3 : 2],
      });
    }
  }
  return result;
}
async function modulePath(base, relative) {
  const target = path.resolve(path.dirname(base), relative);
  for (const candidate of [target, `${target}.ts`, `${target}.tsx`, `${target}/index.ts`]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {}
  }
  return null;
}
async function load(file) {
  if (modules.has(file)) return modules.get(file);
  const code = await readFile(file, 'utf8');
  const ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  const result = {
    file,
    code,
    declarations: new Map(),
    imports: new Map(),
    exports: [],
    defaults: new Map(),
  };
  modules.set(file, result);
  function visit(node, owner) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression')
      owner = node.id?.name ? `${node.id.name}Props` : owner;
    if (
      owner &&
      node.type === 'ObjectProperty' &&
      node.key.type === 'Identifier' &&
      node.value.type === 'AssignmentPattern'
    ) {
      const value = node.value.right;
      if (
        ['StringLiteral', 'NumericLiteral', 'BooleanLiteral', 'NullLiteral'].includes(value.type)
      ) {
        const defaults = result.defaults.get(owner) ?? new Map();
        defaults.set(node.key.name, code.slice(value.start, value.end));
        result.defaults.set(owner, defaults);
      }
    }
    for (const value of Object.values(node))
      if (Array.isArray(value))
        value.forEach((child) => {
          visit(child, owner);
        });
      else if (value && typeof value === 'object') visit(value, owner);
  }
  visit(ast.program);
  for (const statement of ast.program.body) {
    const node = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (node && ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration'].includes(node.type))
      result.declarations.set(node.id.name, node);
    if (node?.type === 'VariableDeclaration')
      for (const variable of node.declarations)
        if (variable.id.type === 'Identifier') result.declarations.set(variable.id.name, variable);
    if (statement.type === 'ImportDeclaration' && statement.source.value.startsWith('.')) {
      for (const specifier of statement.specifiers)
        if (specifier.type === 'ImportSpecifier')
          result.imports.set(specifier.local.name, {
            relative: statement.source.value,
            imported: specifier.imported.name,
          });
    }
    if (statement.type === 'ExportNamedDeclaration' && statement.source) {
      for (const specifier of statement.specifiers)
        result.imports.set(specifier.exported.name, {
          relative: statement.source.value,
          imported: specifier.local.name,
        });
    }
    if (statement.type === 'ExportAllDeclaration') result.exports.push(statement.source.value);
  }
  return result;
}
export async function declaration(file, name, visited = new Set()) {
  if (!file || visited.has(`${file}/${name}`)) return null;
  visited.add(`${file}/${name}`);
  const module = await load(file);
  if (module.declarations.has(name)) return { module, node: module.declarations.get(name) };
  const imported = module.imports.get(name);
  if (imported)
    return declaration(await modulePath(file, imported.relative), imported.imported, visited);
  for (const relative of module.exports) {
    const result = await declaration(await modulePath(file, relative), name, visited);
    if (result) return result;
  }
  return null;
}
const sourceType = (module, node) =>
  module.code
    .slice(node.start, node.end)
    .replace(/\s+/gu, ' ')
    .trim()
    .replace(/^\|\s*/u, '');
function merge(properties, additions) {
  for (const [key, value] of additions) {
    const existing = properties.get(key);
    if (!existing) properties.set(key, value);
    else if (existing.type !== value.type) {
      const types = [...new Set([existing.type, value.type])];
      properties.set(key, {
        ...value,
        optional: existing.optional || value.optional,
        type: types.map((type) => (type.includes('=>') ? `(${type})` : type)).join(' | '),
      });
    }
  }
  return properties;
}
export async function properties(file, name) {
  const found = await declaration(file, name);
  if (!found) return new Map();
  const visited = new Set();
  async function flatten(module, node) {
    if (!node) return new Map();
    if (node.type === 'TSParenthesizedType') return flatten(module, node.typeAnnotation);
    if (node.type === 'TSIntersectionType' || node.type === 'TSUnionType') {
      const result = new Map();
      for (const type of node.types) merge(result, await flatten(module, type));
      return result;
    }
    if (node.type === 'TSExpressionWithTypeArguments' || node.type === 'TSTypeReference') {
      const id = node.expression?.name ?? node.typeName?.name;
      const args = node.typeParameters?.params ?? node.typeArguments?.params ?? [];
      if (['Omit', 'Pick', 'Partial', 'Required', 'Readonly'].includes(id)) {
        const base = await flatten(module, args[0]);
        const keys = args[1]
          ? (sourceType(module, args[1])
              .match(/['"]([^'"]+)['"]/gu)
              ?.map((item) => item.slice(1, -1)) ?? [])
          : [];
        if (id === 'Omit') for (const key of keys) base.delete(key);
        if (id === 'Pick') for (const key of base.keys()) if (!keys.includes(key)) base.delete(key);
        if (id === 'Partial' || id === 'Required')
          for (const value of base.values()) value.optional = id === 'Partial';
        return base;
      }
      const key = `${module.file}/${id}`;
      if (!id || visited.has(key)) return new Map();
      const referenced = await declaration(module.file, id);
      if (!referenced) return new Map();
      visited.add(key);
      const result = await flatten(referenced.module, referenced.node);
      visited.delete(key);
      return result;
    }
    if (node.type === 'TSTypeAliasDeclaration') return flatten(module, node.typeAnnotation);
    if (node.type === 'TSTypeQuery' && node.exprName.type === 'Identifier') {
      const referenced = await declaration(module.file, node.exprName.name);
      return referenced ? flatten(referenced.module, referenced.node) : new Map();
    }
    if (node.type === 'VariableDeclarator') return flatten(module, node.init);
    if (node.type === 'ObjectExpression') {
      const result = new Map();
      for (const property of node.properties) {
        if (property.type !== 'ObjectProperty') continue;
        const key = property.key.name ?? property.key.value;
        const value = property.value;
        const type =
          value.type === 'ArrayExpression'
            ? 'string[]'
            : value.type === 'StringLiteral'
              ? 'string'
              : value.type === 'BooleanLiteral'
                ? 'boolean'
                : 'number';
        result.set(key, { type, optional: false });
      }
      return result;
    }
    if (node.type === 'TSInterfaceDeclaration' || node.type === 'TSTypeLiteral') {
      const result = new Map();
      for (const parent of node.extends ?? []) merge(result, await flatten(module, parent));
      for (const property of node.body?.body ?? node.members ?? []) {
        if (property.type === 'TSPropertySignature') {
          const key = property.key.name ?? property.key.value;
          result.set(key, {
            type: sourceType(module, property.typeAnnotation?.typeAnnotation ?? property),
            optional: !!property.optional,
          });
        }
        if (property.type === 'TSMethodSignature') {
          const key = property.key.name;
          result.set(key, {
            type: `(${property.parameters.map((param) => sourceType(module, param)).join(', ')}) => ${sourceType(module, property.typeAnnotation.typeAnnotation)}`,
            optional: !!property.optional,
          });
        }
        if (property.type === 'TSIndexSignature')
          result.set(
            `[${property.parameters.map((param) => sourceType(module, param)).join(', ')}]`,
            { type: sourceType(module, property.typeAnnotation.typeAnnotation), optional: true },
          );
      }
      return result;
    }
    return new Map();
  }
  const result = await flatten(found.module, found.node);
  for (const [key, value] of result) value.defaultValue = found.module.defaults.get(name)?.get(key);
  return result;
}
export async function typeExpression(file, name) {
  const found = await declaration(file, name);
  if (!found) return '';
  return found.node.type === 'TSTypeAliasDeclaration'
    ? sourceType(found.module, found.node.typeAnnotation)
    : '';
}
