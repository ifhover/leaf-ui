import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { extractExampleSource } from './example-source.mjs';

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMdx);
const sectionNames = ['basic', 'examples', 'api'];
const identifier = /^[a-z][a-z0-9-]*$/;

function fail(file, node, message) {
  const location = node?.position?.start;
  throw new Error(
    `${file ?? 'component document'}${location ? `:${location.line}:${location.column}` : ''}: ${message}`,
  );
}

function text(node) {
  return node.value ?? node.children?.map(text).join('') ?? '';
}

function descendants(node, predicate) {
  return [
    ...(predicate(node) ? [node] : []),
    ...(node.children ?? []).flatMap((child) => descendants(child, predicate)),
  ];
}

function attribute(node, name) {
  return node.attributes?.find((item) => item.type === 'mdxJsxAttribute' && item.name === name);
}

function marker(node, file) {
  if (node.type !== 'mdxFlowExpression') return null;
  const comments = node.data?.estree?.comments ?? [];
  const comment = comments.find((item) => item.value.trim().startsWith('leaf:section'));
  if (!comment) return null;
  const match = /^leaf:section (basic|examples|api)$/.exec(comment.value.trim());
  if (!match || node.data.estree.body.length || comments.length !== 1)
    fail(file, node, 'Expected a standalone leaf:section basic, examples or api comment.');
  return match[1];
}

function exampleMarker(node, file) {
  if (node.type !== 'mdxFlowExpression') return null;
  const comments = node.data?.estree?.comments ?? [];
  const comment = comments.find((item) => item.value.trim().startsWith('leaf:example'));
  if (!comment) return null;
  const match = /^leaf:example ([a-z][a-z0-9-]*)$/.exec(comment.value.trim());
  if (!match || node.data.estree.body.length || comments.length !== 1)
    fail(file, node, 'Expected a standalone leaf:example stable-id comment.');
  return match[1];
}

function moduleMetadata(tree, file) {
  const imports = new Map();
  let metadata;
  for (const node of tree.children) {
    if (node.type !== 'mdxjsEsm') continue;
    const ast = parse(node.value, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
    for (const statement of ast.program.body) {
      if (statement.type === 'ImportDeclaration') {
        for (const specifier of statement.specifiers) {
          if (specifier.type !== 'ImportSpecifier') continue;
          imports.set(specifier.local.name, {
            name: specifier.imported.name ?? specifier.imported.value,
            source: statement.source.value,
          });
        }
      }
      if (statement.type !== 'ExportNamedDeclaration') continue;
      for (const declaration of statement.declaration?.declarations ?? []) {
        if (declaration.id.name !== 'leafDoc') continue;
        if (
          metadata ||
          statement.declaration.kind !== 'const' ||
          declaration.init?.type !== 'ObjectExpression'
        )
          fail(file, node, 'leafDoc must be one static exported const object.');
        metadata = {};
        for (const property of declaration.init.properties) {
          const key = property.key?.name ?? property.key?.value;
          if (
            property.type !== 'ObjectProperty' ||
            property.computed ||
            property.value.type !== 'StringLiteral' ||
            !['component', 'primaryApi'].includes(key) ||
            key in metadata
          )
            fail(file, node, 'leafDoc only accepts literal component and primaryApi strings.');
          metadata[key] = property.value.value;
        }
        if (
          !/^(?:[A-Z]\w*|use[A-Z]\w*)$/.test(metadata.component ?? '') ||
          !/^[A-Za-z_$][\w$]*$/.test(metadata.primaryApi ?? '')
        )
          fail(file, node, 'leafDoc requires component and primaryApi export names.');
      }
    }
  }
  return { metadata, imports };
}

function exampleBlock(nodes, file, basic, index) {
  const heading = nodes[0];
  const expectedDepth = basic ? 2 : 3;
  if (heading?.type !== 'heading' || heading.depth !== expectedDepth)
    fail(file, heading, `Expected an H${expectedDepth} example heading.`);
  const examples = nodes.flatMap((node) =>
    descendants(node, (child) => child.name === 'ComponentExample'),
  );
  const identities = nodes.flatMap((node) => {
    const id = exampleMarker(node, file);
    return id ? [{ node, id }] : [];
  });
  if (examples.length > 1 || (examples.length && identities.length))
    fail(file, heading, 'Use one ComponentExample or one leaf:example identity, not both.');
  if (!examples.length) {
    if (basic || identities.length !== 1 || identities[0].id === 'basic')
      fail(file, heading, 'Each example needs one ComponentExample or one stable leaf:example ID.');
    if (!nodes.slice(1).some((node) => node.type === 'paragraph' && text(node).trim()))
      fail(file, heading, 'Each example needs a prose description.');
    const fences = nodes.flatMap((node) => descendants(node, (child) => child.type === 'code'));
    if (
      !fences.length ||
      fences.some(
        (node) => !node.lang || !node.value.trim() || /(?:^|\s)file=/.test(node.meta ?? ''),
      )
    )
      fail(file, heading, 'A source-only example needs non-empty, labeled, inline code fences.');
    return {
      id: identities[0].id,
      index,
      title: text(heading),
      nodes,
      node: null,
      markerNode: identities[0].node,
    };
  }
  const example = examples[0];
  if (!nodes.includes(example))
    fail(file, example, 'ComponentExample must be a direct child of its section.');
  const attributes = example.attributes;
  if (
    attributes.some((item) => item.type !== 'mdxJsxAttribute') ||
    new Set(attributes.map((item) => item.name)).size !== attributes.length
  )
    fail(file, example, 'ComponentExample cannot use spread or duplicate attributes.');
  const id = attribute(example, 'exampleId')?.value;
  if (
    typeof id !== 'string' ||
    !identifier.test(id) ||
    (basic && id !== 'basic') ||
    (!basic && id === 'basic')
  )
    fail(file, example, 'Use a unique literal exampleId; reserve basic for the basic example.');
  if (attribute(example, 'title'))
    fail(file, example, 'Write the example title only in its Markdown heading.');
  const description = nodes.slice(1).filter((node) => node !== example && node.type !== 'heading');
  if (!description.some((node) => node.type === 'paragraph' && text(node).trim()))
    fail(file, heading, 'Each example needs a prose description.');
  const preview = attribute(example, 'preview')?.value;
  if (preview?.type !== 'mdxJsxAttributeValueExpression')
    fail(file, example, 'Expected a static JSX preview.');
  const expression = parse(`(${preview.value})`, { plugins: ['typescript', 'jsx'] }).program.body[0]
    ?.expression;
  if (
    expression?.type !== 'JSXElement' ||
    expression.openingElement.name.type !== 'JSXIdentifier' ||
    !expression.openingElement.selfClosing ||
    expression.openingElement.attributes.length > 1 ||
    expression.openingElement.attributes.some(
      (item) =>
        item.type !== 'JSXAttribute' ||
        item.name.name !== 'english' ||
        (item.value &&
          (item.value.type !== 'JSXExpressionContainer' ||
            item.value.expression.type !== 'BooleanLiteral')),
    )
  )
    fail(
      file,
      example,
      'Use a self-closing named preview with only an optional literal english boolean.',
    );
  const code = example.children.filter((node) => node.type === 'code');
  if (
    code.length !== 1 ||
    example.children.length !== 1 ||
    !['tsx', 'ts', 'jsx', 'js'].includes(code[0].lang)
  )
    fail(file, example, 'Each preview example needs one complete source code fence.');
  const source = code[0].meta?.match(/(?:^|\s)file="([^"]+)"(?:\s|$)/)?.[1];
  if (!source || code[0].value.trim())
    fail(file, code[0], 'Reference the example source with file="..."; do not copy code into MDX.');
  return {
    id,
    index,
    title: text(heading),
    nodes,
    node: example,
    code: code[0],
    source,
    preview: expression,
  };
}

function staticLink(node, model) {
  if (!['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type) || node.name !== 'a')
    return null;
  const attributes = node.attributes;
  if (
    attributes.some((item) => item.type !== 'mdxJsxAttribute') ||
    new Set(attributes.map((item) => item.name)).size !== attributes.length
  )
    fail(model.file, node, 'Links cannot use spread or duplicate attributes.');
  if (
    attributes.length === 1 &&
    attributes[0].name === 'id' &&
    typeof attributes[0].value === 'string' &&
    attributes[0].value.length &&
    !node.children.length
  )
    return { node, value: null };
  if (attributes.some((item) => !['href', 'download', 'target', 'rel'].includes(item.name)))
    fail(
      model.file,
      node,
      'Only static href/download/target/rel links and empty ID anchors are supported.',
    );
  let href = attribute(node, 'href')?.value;
  if (href?.type === 'mdxJsxAttributeValueExpression') {
    const expression = parse(`(${href.value})`, { plugins: ['typescript', 'jsx'] }).program.body[0]
      ?.expression;
    const imported = model.imports.get(expression?.callee?.name);
    if (
      expression?.type !== 'CallExpression' ||
      expression.callee.type !== 'Identifier' ||
      imported?.name !== 'withBase' ||
      imported.source !== '@rspress/core/runtime' ||
      expression.arguments.length !== 1 ||
      expression.arguments[0].type !== 'StringLiteral'
    )
      fail(
        model.file,
        node,
        'Dynamic links only support the imported withBase with one literal path.',
      );
    href = expression.arguments[0].value;
  }
  const download = attribute(node, 'download')?.value;
  if (typeof href !== 'string' || !href || (download != null && typeof download !== 'string'))
    fail(model.file, node, 'Links require a literal href and optional literal download attribute.');
  for (const name of ['target', 'rel']) {
    const item = attribute(node, name);
    if (item && typeof item.value !== 'string')
      fail(model.file, node, `Link ${name} must be a literal string.`);
  }
  if (
    !/^(?:https?:\/\/|mailto:|\/|#|[\w.-])/.test(href) ||
    (/^[a-z][\w+.-]*:/i.test(href) && !/^(?:https?:|mailto:)/i.test(href))
  )
    fail(model.file, node, 'Unsupported link URL.');
  if (
    !node.children.length ||
    descendants(node, (child) => child !== node && child.type.startsWith('mdx')).length
  )
    fail(model.file, node, 'Link labels must be static Markdown.');
  const label = model.source.slice(
    node.children[0].position.start.offset,
    node.children.at(-1).position.end.offset,
  );
  return { node, value: `[${label}](<${href.replaceAll('>', '%3E')}>)` };
}

function referenceDefinitions(tree, file, source) {
  const definitions = new Map();
  for (const node of descendants(tree, (child) => child.type === 'definition')) {
    const previous = definitions.get(node.identifier);
    if (previous && (previous.url !== node.url || previous.title !== node.title))
      fail(file, node, `Conflicting reference definition ${node.identifier}.`);
    definitions.set(node.identifier, previous ?? node);
  }
  for (const node of descendants(tree, (child) =>
    ['linkReference', 'imageReference'].includes(child.type),
  )) {
    if (!definitions.has(node.identifier))
      fail(file, node, `Missing reference definition ${node.identifier}.`);
  }
  // CommonMark leaves unresolved explicit references as plain text.
  for (const node of descendants(tree, (child) => child.type === 'text')) {
    const raw = source.slice(node.position.start.offset, node.position.end.offset);
    const unresolved = /(?<!\\)\[[^\]\r\n]+\]\[([^\]\r\n]+)\]/.exec(raw);
    if (unresolved) fail(file, node, `Missing reference definition ${unresolved[1]}.`);
  }
  return definitions;
}

function explicitApiDefinition(nodes, name) {
  const names = name.endsWith('Props') ? [name] : [name, `${name}Props`];
  const escaped = names.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const alternatives = escaped.join('|');
  const signature = new RegExp(
    `(?:^|\\b)(?:${alternatives})(?:<[^]*>)?\\([^]*\\)\\s*(?::|=>)\\s*\\S`,
  );
  const alias = new RegExp(`(?:^|\\b)(?:type\\s+)?(?:${alternatives})(?:<[^]*>)?\\s*=\\s*\\S`);
  const declaration = new RegExp(
    `\\b(?:interface|(?:declare\\s+)?function|(?:const|let|var))\\s+(?:${alternatives})(?:<[^]*>)?(?:\\s+extends[^]*?)?\\s*(?:\\{|\\(|:)`,
  );
  return nodes
    .flatMap((node) => descendants(node, (child) => ['inlineCode', 'code'].includes(child.type)))
    .some(
      (node) =>
        signature.test(node.value) || alias.test(node.value) || declaration.test(node.value),
    );
}

function apiReference(nodes, name) {
  const labels = [name, name.replace(/Props$/, '')];
  return nodes
    .flatMap((node) => descendants(node, (child) => child.type === 'link'))
    .some(
      (node) => labels.includes(text(node).replace(/ API$/, '')) && /^[^#]+#[^#]+$/.test(node.url),
    );
}

export function analyzeComponentDocument(tree, source, file) {
  const { metadata, imports } = moduleMetadata(tree, file);
  if (!metadata) return null;
  const headings = tree.children.filter((node) => node.type === 'heading' && node.depth === 1);
  if (headings.length !== 1) fail(file, headings[1], 'Expected exactly one component H1.');
  const title = headings[0];
  if (!text(title).startsWith(metadata.component))
    fail(file, title, 'The H1 must start with the component name.');
  const marks = tree.children.flatMap((node, index) => {
    const section = marker(node, file);
    return section ? [{ section, index, node }] : [];
  });
  if (marks.map((item) => item.section).join(',') !== sectionNames.join(','))
    fail(file, marks[0]?.node, 'Sections must appear exactly once, in basic, examples, api order.');
  const titleIndex = tree.children.indexOf(title);
  for (const [index, node] of tree.children.entries()) {
    if (index < titleIndex && !['mdxjsEsm', 'definition'].includes(node.type))
      fail(
        file,
        node,
        'Only imports, static metadata and reference definitions may precede the H1.',
      );
    if (index > titleIndex && node.type === 'mdxjsEsm')
      fail(file, node, 'Place imports and component metadata before the H1.');
  }
  if (titleIndex >= marks[0].index) fail(file, title, 'The introduction must precede basic usage.');
  const introduction = tree.children.slice(titleIndex, marks[0].index);
  if (!introduction.slice(1).some((node) => node.type === 'paragraph' && text(node).trim()))
    fail(file, title, 'The component needs a short introduction.');
  if (introduction.slice(1).some((node) => node.type === 'heading'))
    fail(file, title, 'Unexpected heading before basic usage.');
  const sections = Object.fromEntries(
    marks.map((mark, index) => [
      mark.section,
      tree.children.slice(mark.index + 1, marks[index + 1]?.index),
    ]),
  );
  for (const name of sectionNames) {
    const nodes = sections[name];
    if (
      nodes[0]?.type !== 'heading' ||
      nodes[0].depth !== 2 ||
      nodes.slice(1).some((node) => node.type === 'heading' && node.depth < 3)
    )
      fail(file, nodes[0], `The ${name} section needs exactly one H2.`);
  }
  const basic = exampleBlock(sections.basic, file, true, 0);
  const examples = [];
  for (const node of sections.examples.slice(1)) {
    if (node.type === 'heading' && node.depth === 3) examples.push([node]);
    else if (examples.length) examples.at(-1).push(node);
    else fail(file, node, 'Place example content under an H3, not directly under Examples.');
  }
  const blocks = examples.map((nodes, index) => exampleBlock(nodes, file, false, index + 1));
  if (new Set(blocks.map((block) => block.id)).size !== blocks.length)
    fail(file, sections.examples[0], 'Duplicate exampleId.');
  const api = [];
  for (const node of sections.api.slice(1)) {
    if (node.type === 'heading' && node.depth === 3) api.push([node]);
    else if (api.length) api.at(-1).push(node);
    else fail(file, node, 'Place API descriptions under their H3 entry.');
  }
  const names = api.map((nodes) => {
    const name = text(nodes[0]).replace(/ API$/, '');
    return name === metadata.component && metadata.primaryApi === `${name}Props`
      ? metadata.primaryApi
      : name;
  });
  if (names[0] !== metadata.primaryApi)
    fail(file, api[0]?.[0], `${metadata.primaryApi} must be the first API entry.`);
  if (new Set(names).size !== names.length) fail(file, sections.api[0], 'Duplicate API entry.');
  for (const [index, nodes] of api.entries()) {
    if (!nodes.slice(1).some((node) => node.type === 'paragraph' && text(node).trim()))
      fail(file, nodes[0], 'Each API entry needs an introduction.');
    const tables = nodes.flatMap((node) => descendants(node, (child) => child.type === 'table'));
    if (
      !tables.length &&
      !explicitApiDefinition(nodes, names[index]) &&
      !apiReference(nodes, names[index])
    )
      fail(
        file,
        nodes[0],
        'Each API entry needs a table, an explicit signature/type definition or a named cross-page API reference.',
      );
    for (const table of tables) {
      const columns = table.children[0]?.children.length;
      if (
        ![3, 4].includes(columns) ||
        table.children.length < 2 ||
        table.children.some((row) => row.children.length !== columns)
      )
        fail(file, table, 'Expected a non-empty three- or four-column API table.');
    }
  }
  const result = {
    ...metadata,
    title: text(title),
    source,
    file,
    imports,
    introduction,
    basic,
    examples: blocks,
    api: sections.api,
    apiNames: names,
    definitions: referenceDefinitions(tree, file, source),
    conversions: [],
  };
  const known = new Set([basic.node, ...blocks.map((block) => block.node ?? block.markerNode)]);
  const disclosures = sections.api.filter((node) => node.name === 'details');
  for (const node of disclosures) {
    const first = node.children[0];
    const summary =
      first?.type === 'paragraph' && first.children.length === 1 ? first.children[0] : first;
    if (
      node.attributes.length !== 1 ||
      node.attributes[0].type !== 'mdxJsxAttribute' ||
      node.attributes[0].name !== 'className' ||
      node.attributes[0].value !== 'leaf-api-details' ||
      summary?.name !== 'summary' ||
      summary.attributes.length ||
      !text(summary).trim() ||
      node.children.length < 2 ||
      descendants(node, (child) => child.type === 'heading' || child.name === 'summary').length !==
        1
    )
      fail(
        file,
        node,
        'API disclosures need a static leaf-api-details class, one summary and content; keep headings outside.',
      );
    known.add(node);
    known.add(summary);
  }
  for (const node of descendants(tree, (child) => child.type.startsWith('mdx'))) {
    if (node.type === 'mdxjsEsm' || marker(node, file)) continue;
    if (known.has(node)) continue;
    const link = staticLink(node, result);
    if (link) {
      if (link.value !== null) result.conversions.push(link);
      continue;
    }
    fail(
      file,
      node,
      `Unsupported MDX node ${node.name ?? node.type}; add an explicit conversion instead of dropping it.`,
    );
  }
  // Expand disclosures in AI output, applying nested link conversions before replacing the wrapper.
  for (const node of disclosures) {
    const first = node.children[0];
    const summary = first.name === 'summary' ? first : first.children[0];
    result.conversions.push({
      node,
      value: `${sourceSlice(result, summary.children)}\n\n${sourceSlice(result, node.children.slice(1))}`,
    });
  }
  return result;
}

export function remarkComponentDocument() {
  return (tree, file) => {
    const source = String(file.value);
    if (!source.includes('leafDoc')) return;
    // Rspress can fill file-backed fences before user plugins run. Validate the
    // authored source, then decorate the compiler's tree without replacing it.
    const model = parseComponentDocument(source, file.path);
    if (!model) return;
    const titles = new Map(
      [model.basic, ...model.examples].map((block) => [block.id, block.title]),
    );
    for (const node of descendants(tree, (child) => child.name === 'ComponentExample')) {
      const title = titles.get(attribute(node, 'exampleId')?.value);
      if (!title) fail(file.path, node, 'Compiled example lost its stable exampleId.');
      node.attributes.push({ type: 'mdxJsxAttribute', name: 'title', value: title });
    }
  };
}

export function parseComponentDocument(source, file) {
  return analyzeComponentDocument(processor.parse({ value: source, path: file }), source, file);
}

/** Move complete API blocks, never individual tables or rows. */
export function orderPrimaryComponentApi(source, file) {
  const tree = processor.parse({ value: source, path: file });
  const { metadata } = moduleMetadata(tree, file);
  if (!metadata) return source;
  const start = tree.children.findIndex((node) => marker(node, file) === 'api');
  if (start < 0) fail(file, tree, 'Missing API section marker.');
  const entries = tree.children
    .slice(start + 1)
    .filter((node) => node.type === 'heading' && node.depth === 3);
  const primary = entries.findIndex((node) => {
    const name = text(node).replace(/ API$/, '');
    return (
      name === metadata.primaryApi ||
      (name === metadata.component && metadata.primaryApi === `${name}Props`)
    );
  });
  if (primary < 0) fail(file, entries[0], `Missing primary API ${metadata.primaryApi}.`);
  if (primary === 0) return source;
  const blocks = entries.map((node, index) =>
    source.slice(
      node.position.start.offset,
      entries[index + 1]?.position.start.offset ?? source.length,
    ),
  );
  const order = [
    primary,
    ...entries.map((_node, index) => index).filter((index) => index !== primary),
  ];
  return (
    source.slice(0, entries[0].position.start.offset) +
    order
      .map((index) => `${blocks[index].trimEnd()}\n\n`)
      .join('')
      .trimEnd() +
    '\n'
  );
}

/** @internal Apply original-source ranges once; a parent replacement owns its children. */
export function applySourceEdits(source, edits) {
  for (const edit of edits)
    if (
      !Number.isInteger(edit.start) ||
      !Number.isInteger(edit.end) ||
      edit.start < 0 ||
      edit.end < edit.start ||
      edit.end > source.length
    )
      throw new Error('Source edits must stay within the original source range.');
  const selected = edits
    .filter(
      (edit, index) =>
        !edits.some(
          (parent, parentIndex) =>
            parentIndex !== index &&
            parent.start <= edit.start &&
            parent.end >= edit.end &&
            (parent.start !== edit.start || parent.end !== edit.end || parentIndex > index),
        ),
    )
    .sort((left, right) => right.start - left.start);
  for (let index = 1; index < selected.length; index++)
    if (selected[index].end > selected[index - 1].start)
      throw new Error('Source edits cannot partially overlap.');
  let output = source;
  for (const edit of selected)
    output = output.slice(0, edit.start) + edit.value + output.slice(edit.end);
  return output;
}

function sourceSlice(model, nodes, replacements = []) {
  const start = nodes[0].position.start.offset;
  const end = nodes.at(-1).position.end.offset;
  const markers = nodes
    .flatMap((node) => descendants(node, (child) => exampleMarker(child, model.file) !== null))
    .map((node) => ({ node, value: '' }));
  const edits = [...model.conversions, ...markers, ...replacements]
    .filter(({ node }) => node.position.start.offset >= start && node.position.end.offset <= end)
    .map(({ node, value }) => ({
      start: node.position.start.offset - start,
      end: node.position.end.offset - start,
      value,
    }));
  let output = applySourceEdits(model.source.slice(start, end), edits);
  const references = new Set(
    nodes
      .flatMap((node) =>
        descendants(node, (child) => ['linkReference', 'imageReference'].includes(child.type)),
      )
      .map((node) => node.identifier),
  );
  for (const id of references) {
    const definition = model.definitions.get(id);
    if (definition.position.start.offset >= start && definition.position.end.offset <= end)
      continue;
    output += `\n\n${model.source.slice(definition.position.start.offset, definition.position.end.offset)}`;
  }
  return output.trim();
}

async function renderExample(model, block) {
  if (!block.node) return sourceSlice(model, block.nodes);
  const imported = model.imports.get(block.preview.openingElement.name.name);
  if (!imported) fail(model.file, block.node, 'The preview must resolve to a named import.');
  const sourcePath = path.resolve(path.dirname(model.file), block.source);
  const importedPath = path.resolve(path.dirname(model.file), imported.source);
  if (sourcePath.replace(/\.[cm]?[jt]sx?$/, '') !== importedPath.replace(/\.[cm]?[jt]sx?$/, ''))
    fail(
      model.file,
      block.node,
      'The preview import and code fence must reference the same source.',
    );
  const source = await readFile(sourcePath, 'utf8');
  const english = block.preview.openingElement.attributes.some(
    (item) =>
      item.name?.name === 'english' && (!item.value || item.value.expression?.value === true),
  );
  const code = extractExampleSource(source, imported.name, { english }).trimEnd();
  if (/from\s+['"]\./.test(code))
    fail(model.file, block.node, 'Extracted examples must not depend on missing relative modules.');
  const fence = '`'.repeat(
    Math.max(3, ...[...code.matchAll(/`+/g)].map((match) => match[0].length + 1)),
  );
  return sourceSlice(model, block.nodes, [
    {
      node: block.node,
      value: `${fence}${block.code.lang}\n${code}\n${fence}`,
    },
  ]);
}

export async function readComponentDocument(file) {
  const source = await readFile(file, 'utf8');
  const model = parseComponentDocument(source, file);
  if (!model) return null;
  const description = model.introduction.find((node) => node.type === 'paragraph');
  return {
    component: model.component,
    primaryApi: model.primaryApi,
    title: model.title,
    description: model.source
      .slice(description.position.start.offset, description.position.end.offset)
      .trim(),
    introduction: sourceSlice(model, model.introduction),
    basic: await renderExample(model, model.basic),
    api: sourceSlice(model, model.api),
    apiNames: model.apiNames,
    examples: await Promise.all(
      model.examples.map(async (block) => ({
        id: block.id,
        index: block.index,
        title: block.title,
        markdown: await renderExample(model, block),
      })),
    ),
  };
}

export function componentDetail(document) {
  const { examples, ...detail } = document;
  return { ...detail, examples: examples.map(({ markdown: _markdown, ...example }) => example) };
}

export function selectExamples(document, selectors) {
  if (!selectors.length) throw new Error('Select at least one example by index, ID or title.');
  const result = [];
  for (const selector of selectors) {
    const value = String(selector);
    const matches = document.examples.filter((example) =>
      /^\d+$/.test(value)
        ? example.index === Number(value)
        : example.id === value || example.title.toLocaleLowerCase() === value.toLocaleLowerCase(),
    );
    if (matches.length !== 1)
      throw new Error(
        `Example ${value} ${matches.length ? 'is ambiguous' : 'was not found'}. Available: ${document.examples.map((example) => `${example.index}:${example.id} (${example.title})`).join(', ')}`,
      );
    if (!result.includes(matches[0])) result.push(matches[0]);
  }
  return result;
}
