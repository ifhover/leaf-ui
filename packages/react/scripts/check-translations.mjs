#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/** 与 src/locales/icu.ts 同源的轻量 ICU 参数提取与语法校验，保证 CLI 校验零运行时依赖。 */
function extractIcuArguments(template) {
  let index = 0;
  const args = new Set();

  const skipSpaces = () => {
    while (index < template.length && /\s/.test(template[index])) index++;
  };
  const readTokenUntil = (stopChars) => {
    const start = index;
    while (index < template.length && !stopChars.includes(template[index])) {
      if (template[index] === '{') throw new SyntaxError('Unexpected "{" inside ICU argument');
      index++;
    }
    return template.slice(start, index).trim();
  };
  const walk = (stopAtCloseBrace, inPlural) => {
    while (index < template.length) {
      const ch = template[index];
      if (ch === '}') {
        if (!stopAtCloseBrace) throw new SyntaxError('Unexpected "}" in ICU message');
        return;
      }
      if (ch === '{') {
        index++;
        const name = readTokenUntil(',}');
        if (!name || /\s/.test(name)) throw new SyntaxError('Invalid argument name in ICU message');
        args.add(name);
        if (index >= template.length) throw new SyntaxError('Unclosed "{" in ICU message');
        if (template[index] === '}') {
          index++;
          continue;
        }
        index++;
        const kind = readTokenUntil(',}');
        if (index >= template.length) throw new SyntaxError('Unclosed "{" in ICU message');
        if (kind === 'number' || kind === 'date' || kind === 'time') {
          if (template[index] === ',') {
            index++;
            readTokenUntil('}');
            if (index >= template.length || template[index] !== '}')
              throw new SyntaxError('Unclosed "{" in ICU message');
          }
          index++;
          continue;
        }
        if (kind === 'plural' || kind === 'selectordinal' || kind === 'select') {
          if (template[index] !== ',')
            throw new SyntaxError(`Missing options for "${kind}" in ICU message`);
          index++;
          if (kind !== 'select') {
            skipSpaces();
            if (template.startsWith('offset:', index)) {
              index += 7;
              const match = /^([+-]?\d+)/.exec(template.slice(index));
              if (!match) throw new SyntaxError('Invalid plural offset in ICU message');
              index += match[1].length;
            }
          }
          let hasOther = false;
          const childInPlural = kind !== 'select';
          while (true) {
            skipSpaces();
            if (index >= template.length) throw new SyntaxError('Unclosed "{" in ICU message');
            if (template[index] === '}') {
              index++;
              break;
            }
            const selectorStart = index;
            while (index < template.length && !/[\s{}]/.test(template[index])) index++;
            const selector = template.slice(selectorStart, index);
            if (!selector) throw new SyntaxError('Invalid selector in ICU message');
            if (selector === 'other') hasOther = true;
            skipSpaces();
            if (template[index] !== '{')
              throw new SyntaxError(`Expected "{" after selector "${selector}"`);
            index++;
            walk(true, childInPlural);
            if (template[index] !== '}')
              throw new SyntaxError('Unclosed option branch in ICU message');
            index++;
          }
          if (!hasOther) throw new SyntaxError(`Missing "other" branch in ICU ${kind}`);
          continue;
        }
        throw new SyntaxError(`Unsupported ICU format type "${kind}"`);
      }
      if (ch === "'") {
        const next = template[index + 1];
        if (next === "'") {
          index += 2;
          continue;
        }
        if (next === '{' || next === '}' || (inPlural && next === '#')) {
          index++;
          let closed = false;
          while (index < template.length) {
            if (template[index] === "'") {
              if (template[index + 1] === "'") index += 2;
              else {
                index++;
                closed = true;
                break;
              }
            } else {
              index++;
            }
          }
          if (!closed) throw new SyntaxError('Unterminated quoted string in ICU message');
          continue;
        }
      }
      index++;
    }
    if (stopAtCloseBrace) throw new SyntaxError('Unclosed "{" in ICU message');
  };

  walk(false, false);
  return [...args].sort().join(',');
}

const [file] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
if (!file) {
  console.error('Usage: leaf-ui-check-translations <locale.json> [--allow-partial]');
  process.exitCode = 1;
} else {
  try {
    // This script runs in source during tests and next to the JSON files after packaging.
    let template;
    try {
      template = await readFile(new URL('./en-US.json', import.meta.url), 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      template = await readFile(new URL('../src/locales/en-US.json', import.meta.url), 'utf8');
    }
    const english = JSON.parse(template);
    const translation = JSON.parse(await readFile(resolve(file), 'utf8'));
    const errors = [];
    const missing = [];
    if (translation?.$schema !== undefined && typeof translation.$schema !== 'string')
      errors.push('$schema: expected a string');
    function check(reference, actual, key = '') {
      if (actual === undefined) {
        missing.push(key);
        return;
      }
      if (typeof reference === 'string') {
        if (typeof actual !== 'string') {
          errors.push(`${key}: expected a string`);
          return;
        }
        try {
          if (actual !== '' && extractIcuArguments(reference) !== extractIcuArguments(actual))
            errors.push(`${key}: template arguments differ from English`);
        } catch (error) {
          errors.push(`${key}: ${error.message}`);
        }
      } else if (Array.isArray(reference)) {
        if (
          !Array.isArray(actual) ||
          actual.length !== reference.length ||
          actual.some((item) => typeof item !== 'string')
        )
          errors.push(`${key}: expected ${reference.length} strings`);
      } else {
        if (!actual || typeof actual !== 'object' || Array.isArray(actual)) {
          errors.push(`${key || 'root'}: expected an object`);
          return;
        }
        for (const name of Object.keys(actual))
          if (!Object.hasOwn(reference, name) && (key !== '' || name !== '$schema'))
            errors.push(`${key ? `${key}.` : ''}${name}: unknown key`);
        for (const [name, value] of Object.entries(reference))
          check(value, actual[name], key ? `${key}.${name}` : name);
      }
    }
    check(english, translation);
    for (const error of errors) console.error(error);
    if (missing.length)
      console.log(`Missing translations (${missing.length}): ${missing.join(', ')}`);
    if (errors.length || (missing.length && !process.argv.includes('--allow-partial')))
      process.exitCode = 1;
    else
      console.log(`Translation valid${missing.length ? ' (partial; fallback will be used)' : ''}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
