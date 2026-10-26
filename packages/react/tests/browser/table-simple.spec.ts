import { expect, test } from '@playwright/test';
import axe from 'axe-core';
import { expectSimpleTableSurface } from './helpers/table-appearance';

for (const theme of ['light', 'dark']) {
  for (const width of [1100, 375]) {
    for (const compact of [false, true]) {
      test(`simple appearance: ${theme}, ${width}px, compact=${compact}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/?fixture=table&simple=1&theme=${theme}${compact ? '&compact=1' : ''}`);
        await page.mouse.move(0, 0);
        const table = page.getByRole('table', { name: 'Simple table', exact: true });
        await expectSimpleTableSurface(table);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await table
          .locator('xpath=ancestor::div[contains(@class, "leaf-table--simple")][1]')
          .screenshot({
            path: test.info().outputPath('simple-table.png'),
          });
      });
    }
  }

  test(`simple grouped pinned headers retain scrolling and selection: ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 550, height: 900 });
    await page.goto(`/?fixture=table&simple=1&theme=${theme}${theme === 'dark' ? '&rtl=1' : ''}`);
    const table = page.getByRole('table', { name: 'Simple pinned records' });
    await page.mouse.move(0, 0);
    await expectSimpleTableSurface(table);
    const root = table.locator('xpath=ancestor::div[contains(@class, "leaf-table--simple")][1]');
    const viewport = root.locator('.leaf-table__viewport');
    const header = table.locator('thead');
    await viewport.scrollIntoViewIfNeeded();
    const before = await header.boundingBox();
    const pinned = table.locator('tbody tr').first().locator('td[data-pinned]').first();
    await viewport.evaluate((node) => {
      node.scrollTop = 50;
      node.scrollLeft = getComputedStyle(node).direction === 'rtl' ? -180 : 180;
    });
    await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
    expect((await header.boundingBox())?.y).toBe(before?.y);
    const pinnedAtEdge = await pinned.boundingBox();
    const viewportBox = await viewport.boundingBox();
    expect(pinnedAtEdge).not.toBeNull();
    expect(pinnedAtEdge?.x).toBe(
      theme === 'dark'
        ? (viewportBox?.x ?? 0) + (viewportBox?.width ?? 0) - (pinnedAtEdge?.width ?? 0)
        : viewportBox?.x,
    );
    await viewport.evaluate((node) => {
      node.scrollLeft = getComputedStyle(node).direction === 'rtl' ? -220 : 220;
    });
    expect((await pinned.boundingBox())?.x).toBe(pinnedAtEdge?.x);
    expect(await pinned.evaluate((node) => getComputedStyle(node, '::after').content)).toBe('none');
    await viewport.evaluate((node) => {
      node.scrollTop = 0;
    });
    const nameHeader = table.getByRole('columnheader', { name: /Name/ });
    await nameHeader.getByRole('button').click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    const selected = table.getByRole('checkbox', { name: 'Select row: 0', exact: true });
    await selected.check();
    const nativeTable = await table.elementHandle();
    await page.getByRole('button', { name: 'Toggle simple appearance' }).click();
    await expect(root).toHaveCount(0);
    await expect(selected).toBeChecked();
    expect(await table.evaluate((node, previous) => node === previous, nativeTable)).toBe(true);
    await page.getByRole('button', { name: 'Toggle simple appearance' }).click();
    await expect(root).toHaveCount(1);
    await expect(selected).toBeChecked();
    await root.screenshot({ path: test.info().outputPath('simple-grouped-pinned.png') });
  });

  test(`simple tables pass axe: ${theme}`, { tag: '@a11y' }, async ({ page }) => {
    await page.goto(`/?fixture=table&simple=1&theme=${theme}`);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(
      async () =>
        (
          await (window as unknown as { axe: typeof axe }).axe.run(
            document.querySelector('main') as HTMLElement,
          )
        ).violations,
    );
    expect(violations).toEqual([]);
  });
}
