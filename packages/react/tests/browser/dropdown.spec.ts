import { expect, type Locator, test } from '@playwright/test';
import { settleAnimations } from './helpers/motion';

async function bounds(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Missing dropdown geometry');
  return box;
}

for (const theme of ['light', 'dark']) {
  for (const width of [1100, 375]) {
    test(`dropdown content sizing and scale: ${theme} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?fixture=dropdown&theme=${theme}`);
      const panel = page.locator('.leaf-dropdown[data-state="open"]');
      await page.getByRole('button', { name: 'Short menu', exact: true }).click();
      await settleAnimations(panel);
      expect((await bounds(panel)).width).toBe(160);
      await page.keyboard.press('Escape');

      const heights: number[] = [];
      const iconWidths: number[] = [];
      const paddings: number[] = [];
      for (const [size, font, height] of [
        ['sm', 13, 28],
        ['md', 14, 34],
        ['lg', 16, 40],
      ] as const) {
        await page.getByRole('button', { name: `${size} menu`, exact: true }).click();
        await settleAnimations(panel);
        const row = panel.getByRole('menuitem', { name: 'Copy link Ctrl C', exact: true });
        await expect(row).toHaveCSS('font-size', `${font}px`);
        heights.push((await bounds(row)).height);
        expect(heights.at(-1)).toBe(height);
        iconWidths.push((await bounds(row.locator('svg'))).width);
        paddings.push(
          await row.evaluate((node) => Number.parseFloat(getComputedStyle(node).paddingLeft)),
        );
        const label = row.locator('.leaf-dropdown__label');
        expect((await bounds(label)).height).toBeLessThan(25);
        expect((await bounds(row.locator('.leaf-dropdown__extra'))).width).toBeLessThan(
          (await bounds(row)).width / 2,
        );
        await panel.getByRole('menuitem', { name: 'More CSV', exact: true }).hover();
        const nested = page.getByRole('menuitem', { name: 'Nested action', exact: true });
        await expect(nested).toHaveCSS('font-size', `${font}px`);
        await expect(nested).toHaveCSS('min-height', `${height}px`);
        const nestedPanel = page.locator('.leaf-dropdown[data-state="open"]').last();
        await settleAnimations(nestedPanel);
        const nestedBox = await bounds(nestedPanel);
        expect(nestedBox.x).toBeGreaterThanOrEqual(0);
        expect(nestedBox.x + nestedBox.width).toBeLessThanOrEqual(width);
        await page.screenshot({ path: test.info().outputPath(`${size}.png`) });
        await nested.press('Escape');
        await page.keyboard.press('Escape');
      }
      for (const values of [heights, iconWidths, paddings]) {
        const [small, medium, large] = values;
        if (small === undefined || medium === undefined || large === undefined)
          throw new Error('Missing dropdown size measurement');
        expect(small).toBeLessThan(medium);
        expect(medium).toBeLessThan(large);
      }

      await page.getByRole('button', { name: 'Content menu', exact: true }).click();
      await settleAnimations(panel);
      expect((await bounds(panel)).width).toBeGreaterThan(220);
      const contentLabel = panel.locator('.leaf-dropdown__label');
      if (width === 1100) expect((await bounds(contentLabel)).height).toBeLessThan(25);
      const box = await bounds(panel);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      await page.screenshot({ path: test.info().outputPath('content.png') });
      await page.keyboard.press('Escape');

      for (const [name, expectedWidth] of [
        ['Fixed menu', 180],
        ['Limited menu', 240],
      ] as const) {
        await page.getByRole('button', { name, exact: true }).click();
        await settleAnimations(panel);
        expect((await bounds(panel)).width).toBe(expectedWidth);
        expect((await bounds(panel.locator('.leaf-dropdown__label'))).height).toBeGreaterThan(25);
        expect(await panel.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
        await page.keyboard.press('Escape');
      }
      await page.getByRole('button', { name: 'Token menu', exact: true }).click();
      await expect(panel.getByRole('menuitem').first()).toHaveCSS('font-size', '18px');
    });
  }
}
