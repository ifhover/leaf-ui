import { expect, type Page } from '@playwright/test';
import axe from 'axe-core';

export async function expectAccessible(page: Page, selector = 'body') {
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async (selector) => {
    const { violations } = await (window as unknown as { axe: typeof axe }).axe.run(selector);
    return violations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    }));
  }, selector);
  expect.soft(violations).toEqual([]);
}
