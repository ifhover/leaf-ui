import { readability } from '@ctrl/tinycolor';
import { expect, test } from '@playwright/test';

for (const appearance of ['light', 'dark']) {
  test(`text avatar colors and overrides: ${appearance}`, async ({ page }) => {
    await page.goto(`/?fixture=avatar&theme=${appearance}`);
    const group = page.locator('[aria-label="Members"]');
    const colors = () =>
      group
        .locator(':scope > .leaf-avatar')
        .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backgroundColor));
    const before = await colors();
    expect(new Set(before).size).toBe(3);
    await page.getByRole('button', { name: 'Toggle members' }).click();
    await expect(group.locator(':scope > .leaf-avatar')).toHaveCount(6);
    const after = await colors();
    expect(after.slice(0, 3)).toEqual(before);
    expect(new Set(after).size).toBe(5);
    expect(after[5]).toBe(after[0]);
    for (const member of await page
      .locator(
        '[aria-label="Members"] > .leaf-avatar, [aria-label="Custom palette"] > .leaf-avatar',
      )
      .all()) {
      const paint = await member.evaluate((node) => {
        const css = getComputedStyle(node);
        return { color: css.color, background: css.backgroundColor };
      });
      expect(readability(paint.color, paint.background)).toBeGreaterThanOrEqual(4.5);
    }
    expect(
      await page
        .locator('[aria-label="Custom palette"] > .leaf-avatar')
        .first()
        .evaluate((node) => getComputedStyle(node).backgroundColor),
    ).not.toBe(after[0]);
    const standalone = page.getByRole('img', { name: 'Standalone' });
    await expect(page.getByRole('img', { name: 'Failed image' })).toHaveCSS(
      'background-color',
      after[0] ?? '',
    );
    await expect(page.getByRole('img', { name: 'Guest' })).toHaveCSS(
      'background-color',
      await standalone.evaluate((node) => getComputedStyle(node).backgroundColor),
    );
    await expect(page.getByRole('img', { name: 'Themed' })).toHaveCSS(
      'background-color',
      'rgb(32, 48, 64)',
    );
    await expect(page.getByRole('img', { name: 'Themed' })).toHaveCSS(
      'color',
      'rgb(255, 255, 255)',
    );
    await expect(page.getByRole('img', { name: 'Inline' })).toHaveCSS(
      'background-color',
      'rgb(60, 70, 80)',
    );
    await page.getByRole('button', { name: 'Toggle members' }).click();
    const more = group.getByRole('button', { name: /3/ });
    await more.focus();
    const hidden = page.locator('.leaf-avatar-group__overflow');
    await expect(hidden).toBeVisible();
    expect(
      await hidden
        .locator('.leaf-avatar')
        .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backgroundColor)),
    ).toEqual(after.slice(3));
    await page.screenshot({ path: test.info().outputPath(`avatar-${appearance}.png`) });
  });
}
