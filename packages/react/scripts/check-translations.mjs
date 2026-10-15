#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { IntlMessageFormat } from 'intl-messageformat';

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
    function argumentsOf(template) {
      const result = new Set();
      function visit(nodes) {
        for (const node of nodes) {
          if (node.type >= 1 && node.type <= 6) result.add(node.value);
          if (node.options) for (const option of Object.values(node.options)) visit(option.value);
        }
      }
      visit(new IntlMessageFormat(template, 'en-US', undefined, { ignoreTag: true }).getAst());
      return [...result].sort().join(',');
    }
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
          if (actual !== '' && argumentsOf(reference) !== argumentsOf(actual))
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
