export type IcuNode =
  | { type: 'literal'; value: string }
  | { type: 'argument'; name: string }
  | { type: 'pound' }
  | { type: 'number'; name: string; style: string }
  | { type: 'date' | 'time'; name: string; style: string }
  | { type: 'select'; name: string; options: Record<string, IcuNode[]> }
  | {
      type: 'plural' | 'selectordinal';
      name: string;
      offset: number;
      options: Record<string, IcuNode[]>;
    };

export interface IcuFormatterCaches {
  numbers: Map<string, Intl.NumberFormat>;
  dates: Map<string, Intl.DateTimeFormat>;
  plurals: Map<string, Intl.PluralRules>;
}

const DATE_PRESETS: Record<string, Intl.DateTimeFormatOptions> = {
  short: { month: 'numeric', day: 'numeric', year: '2-digit' },
  medium: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric' },
  full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
};

const TIME_PRESETS: Record<string, Intl.DateTimeFormatOptions> = {
  short: { hour: 'numeric', minute: 'numeric' },
  medium: { hour: 'numeric', minute: 'numeric', second: 'numeric' },
  long: { hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' },
  full: { hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' },
};

function pushLiteral(nodes: IcuNode[], text: string) {
  if (!text) return;
  const last = nodes.at(-1);
  if (last?.type === 'literal') last.value += text;
  else nodes.push({ type: 'literal', value: text });
}

/** 轻量递归下降 ICU MessageFormat 解析器（支持插值、复数、序数、选择与日期数字格式）。 */
export function parseIcu(template: string): IcuNode[] {
  let index = 0;

  const skipSpaces = () => {
    while (index < template.length && /\s/.test(template[index] as string)) index++;
  };

  const parseSegment = (stopAtCloseBrace: boolean, inPlural: boolean): IcuNode[] => {
    const nodes: IcuNode[] = [];
    while (index < template.length) {
      const ch = template[index] as string;
      if (ch === '}') {
        if (!stopAtCloseBrace) throw new SyntaxError('Unexpected "}" in ICU message');
        return nodes;
      }
      if (ch === '{') {
        nodes.push(parsePlaceholder());
        continue;
      }
      if (inPlural && ch === '#') {
        index++;
        nodes.push({ type: 'pound' });
        continue;
      }
      if (ch === "'") {
        const next = template[index + 1];
        if (next === "'") {
          index += 2;
          pushLiteral(nodes, "'");
          continue;
        }
        if (next === '{' || next === '}' || (inPlural && next === '#')) {
          index++;
          let escaped = '';
          let closed = false;
          while (index < template.length) {
            const inner = template[index] as string;
            if (inner === "'") {
              if (template[index + 1] === "'") {
                escaped += "'";
                index += 2;
              } else {
                index++;
                closed = true;
                break;
              }
            } else {
              escaped += inner;
              index++;
            }
          }
          if (!closed) throw new SyntaxError('Unterminated quoted string in ICU message');
          pushLiteral(nodes, escaped);
          continue;
        }
        index++;
        pushLiteral(nodes, "'");
        continue;
      }
      const start = index;
      while (index < template.length) {
        const current = template[index] as string;
        if (current === '{' || current === '}' || current === "'" || (inPlural && current === '#'))
          break;
        index++;
      }
      pushLiteral(nodes, template.slice(start, index));
    }
    if (stopAtCloseBrace) throw new SyntaxError('Unclosed "{" in ICU message');
    return nodes;
  };

  const readTokenUntil = (stopChars: string) => {
    const start = index;
    while (index < template.length && !stopChars.includes(template[index] as string)) {
      if (template[index] === '{') throw new SyntaxError('Unexpected "{" inside ICU argument');
      index++;
    }
    return template.slice(start, index).trim();
  };

  const parsePlaceholder = (): IcuNode => {
    index++; // 跳过 '{'
    const name = readTokenUntil(',}');
    if (!name || /\s/.test(name)) throw new SyntaxError('Invalid argument name in ICU message');
    if (index >= template.length) throw new SyntaxError('Unclosed "{" in ICU message');
    if (template[index] === '}') {
      index++;
      return { type: 'argument', name };
    }
    index++; // 跳过 ','
    const kind = readTokenUntil(',}');
    if (index >= template.length) throw new SyntaxError('Unclosed "{" in ICU message');
    if (kind === 'number' || kind === 'date' || kind === 'time') {
      let style = '';
      if (template[index] === ',') {
        index++;
        style = readTokenUntil('}');
        if (index >= template.length || template[index] !== '}')
          throw new SyntaxError('Unclosed "{" in ICU message');
      }
      index++;
      if (style && kind === 'number' && style !== 'integer' && style !== 'percent')
        throw new SyntaxError(`Unsupported number style "${style}" in ICU message`);
      if (style && (kind === 'date' || kind === 'time') && !(style in DATE_PRESETS))
        throw new SyntaxError(`Unsupported ${kind} style "${style}" in ICU message`);
      return { type: kind, name, style };
    }
    if (kind === 'plural' || kind === 'selectordinal' || kind === 'select') {
      if (template[index] !== ',')
        throw new SyntaxError(`Missing options for "${kind}" in ICU message`);
      index++;
      let offset = 0;
      if (kind !== 'select') {
        skipSpaces();
        if (template.startsWith('offset:', index)) {
          index += 7;
          const match = /^([+-]?\d+)/.exec(template.slice(index));
          const digits = match?.[1];
          if (!digits) throw new SyntaxError('Invalid plural offset in ICU message');
          offset = Number(digits);
          index += digits.length;
        }
      }
      const options: Record<string, IcuNode[]> = Object.create(null);
      const childInPlural = kind !== 'select';
      while (true) {
        skipSpaces();
        if (index >= template.length) throw new SyntaxError('Unclosed "{" in ICU message');
        if (template[index] === '}') {
          index++;
          break;
        }
        const selectorStart = index;
        while (index < template.length && !/[\s{}]/.test(template[index] as string)) {
          index++;
        }
        const selector = template.slice(selectorStart, index);
        if (!selector) throw new SyntaxError('Invalid selector in ICU message');
        skipSpaces();
        if (template[index] !== '{')
          throw new SyntaxError(`Expected "{" after selector "${selector}"`);
        index++;
        options[selector] = parseSegment(true, childInPlural);
        if (template[index] !== '}') throw new SyntaxError('Unclosed option branch in ICU message');
        index++;
      }
      if (!Object.hasOwn(options, 'other'))
        throw new SyntaxError(`Missing "other" branch in ICU ${kind}`);
      return kind === 'select'
        ? { type: 'select', name, options }
        : { type: kind, name, offset, options };
    }
    throw new SyntaxError(`Unsupported ICU format type "${kind}"`);
  };

  return parseSegment(false, false);
}

/** 收集模板用到的全部参数名（排序后去重）。 */
export function extractIcuArguments(template: string): string[] {
  const args = new Set<string>();
  const visit = (nodes: readonly IcuNode[]) => {
    for (const node of nodes) {
      if (node.type !== 'literal' && node.type !== 'pound') args.add(node.name);
      if ('options' in node) {
        for (const branch of Object.values(node.options)) visit(branch);
      }
    }
  };
  visit(parseIcu(template));
  return [...args].sort();
}

function getNumberFormatter(
  locale: string,
  options: Intl.NumberFormatOptions | undefined,
  cache: Map<string, Intl.NumberFormat>,
) {
  const key = options ? `${locale}:${JSON.stringify(options)}` : locale;
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter;
}

function getDateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
  cache: Map<string, Intl.DateTimeFormat>,
) {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter;
}

function getPluralRules(
  locale: string,
  type: Intl.PluralRuleType,
  cache: Map<string, Intl.PluralRules>,
) {
  const key = `${locale}:${type}`;
  let rules = cache.get(key);
  if (!rules) {
    rules = new Intl.PluralRules(locale, { type });
    cache.set(key, rules);
  }
  return rules;
}

function requireArg(
  values: Record<string, string | number | Date>,
  name: string,
): string | number | Date {
  const value = values[name];
  if (value === undefined) throw new RangeError(`Missing ICU argument "${name}"`);
  return value;
}

/** 依据区域习惯格式化日期/数字，依据句源语言判断复数分类。 */
export function formatIcu(
  nodes: readonly IcuNode[],
  locale: string,
  pluralLocale: string,
  values: Record<string, string | number | Date>,
  caches: IcuFormatterCaches,
  poundValue?: number,
): string {
  let result = '';
  for (const node of nodes) {
    switch (node.type) {
      case 'literal':
        result += node.value;
        break;
      case 'argument':
        result += String(requireArg(values, node.name));
        break;
      case 'pound':
        result +=
          poundValue !== undefined
            ? getNumberFormatter(locale, undefined, caches.numbers).format(poundValue)
            : '#';
        break;
      case 'number': {
        const num = Number(requireArg(values, node.name));
        const options: Intl.NumberFormatOptions | undefined =
          node.style === 'integer'
            ? { maximumFractionDigits: 0 }
            : node.style === 'percent'
              ? { style: 'percent' }
              : undefined;
        result += getNumberFormatter(locale, options, caches.numbers).format(num);
        break;
      }
      case 'date':
      case 'time': {
        const raw = requireArg(values, node.name);
        const date = raw instanceof Date ? raw : new Date(raw);
        const presets = node.type === 'date' ? DATE_PRESETS : TIME_PRESETS;
        const options = presets[node.style || 'medium'] ?? presets.medium;
        result += getDateFormatter(
          locale,
          options as Intl.DateTimeFormatOptions,
          caches.dates,
        ).format(date);
        break;
      }
      case 'select': {
        const key = String(requireArg(values, node.name));
        const branch =
          (Object.hasOwn(node.options, key) ? node.options[key] : undefined) ??
          node.options.other ??
          [];
        result += formatIcu(branch, locale, pluralLocale, values, caches, poundValue);
        break;
      }
      case 'plural':
      case 'selectordinal': {
        const raw = Number(requireArg(values, node.name));
        const adjusted = raw - node.offset;
        const exactKey = `=${raw}`;
        let branch = Object.hasOwn(node.options, exactKey) ? node.options[exactKey] : undefined;
        if (!branch) {
          const ruleType = node.type === 'selectordinal' ? 'ordinal' : 'cardinal';
          const category = getPluralRules(pluralLocale, ruleType, caches.plurals).select(adjusted);
          branch =
            (Object.hasOwn(node.options, category) ? node.options[category] : undefined) ??
            node.options.other ??
            [];
        }
        result += formatIcu(branch, locale, pluralLocale, values, caches, adjusted);
        break;
      }
    }
  }
  return result;
}
