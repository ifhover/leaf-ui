import assert from 'node:assert/strict';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import * as sass from 'sass-embedded';

export async function compiledStyles(file) {
  const { css } = await sass.compileAsync(path.resolve(import.meta.dirname, '..', 'src', file));
  return styleDeclarations(css, file);
}

// 仅展开 @layer 块；CSSStyleRule 在新版 jsdom 中也带 cssRules，不能把有 selectorText 的规则吞掉
const flattenLayerRules = (ruleList) =>
  [...ruleList].flatMap((rule) =>
    !rule.selectorText && !('conditionText' in rule) && 'cssRules' in rule
      ? flattenLayerRules(rule.cssRules)
      : [rule],
  );

// 仅按顶层逗号拆分选择器列表，避免把 :is(a, b) / [attr="a,b"] 括号内的逗号误切开
function splitTopLevelSelectors(selectorText) {
  const selectors = [];
  let start = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  for (let i = 0; i < selectorText.length; i++) {
    const ch = selectorText[i];
    if (ch === '(') parenDepth++;
    else if (ch === ')' && parenDepth > 0) parenDepth--;
    else if (ch === '[') bracketDepth++;
    else if (ch === ']' && bracketDepth > 0) bracketDepth--;
    else if (ch === ',' && parenDepth === 0 && bracketDepth === 0) {
      selectors.push(selectorText.slice(start, i).trim());
      start = i + 1;
    }
  }
  selectors.push(selectorText.slice(start).trim());
  return selectors;
}

export function styleDeclarations(css, label = 'stylesheet') {
  const dom = new JSDOM('<style></style>');
  const element = dom.window.document.querySelector('style');
  element.textContent = css;
  const rules = flattenLayerRules(element.sheet.cssRules);
  const result = rules
    .filter((rule) => rule.selectorText)
    .map((rule) => ({
      selector: rule.selectorText,
      selectors: splitTopLevelSelectors(rule.selectorText),
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
