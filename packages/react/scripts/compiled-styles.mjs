import assert from 'node:assert/strict';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import * as sass from 'sass-embedded';

export async function compiledStyles(file) {
  const { css } = await sass.compileAsync(path.resolve(import.meta.dirname, '..', 'src', file));
  return styleDeclarations(css, file);
}

export function styleDeclarations(css, label = 'stylesheet') {
  const dom = new JSDOM('<style></style>');
  const element = dom.window.document.querySelector('style');
  element.textContent = css;
  const rules = [...element.sheet.cssRules];
  const result = rules
    .filter((rule) => rule.selectorText)
    .map((rule) => ({
      selector: rule.selectorText,
      selectors: rule.selectorText.split(',').map((item) => item.trim()),
      declarations: Object.fromEntries(
        Array.from({ length: rule.style.length }, (_, index) => {
          const property = rule.style[index];
          return [
            property,
            rule.style
              .getPropertyValue(property)
              .replace(/\s+/gu, ' ')
              .replace(/\s*([(),])\s*/gu, '$1')
              .trim(),
          ];
        }),
      ),
    }));
  dom.window.close();
  return (selector) => {
    const matches = result.filter(
      (rule) => rule.selector === selector || rule.selectors.includes(selector),
    );
    assert.ok(matches.length, `${label}: missing compiled rule ${selector}`);
    return Object.assign({}, ...matches.map((rule) => rule.declarations));
  };
}
