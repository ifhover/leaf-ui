import { expect, test } from '@playwright/test';
import { expectAccessible } from './helpers/accessibility';
import { expectShortHeaderSeparators } from './helpers/table-appearance';

for (const appearance of ['light', 'dark']) {
  for (const compact of [false, true]) {
    test(`layered table keeps its header and frame fixed in ${appearance}, ${compact ? 'compact RTL' : 'comfortable'}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: compact ? 375 : 1100, height: 700 });
      await page.goto(
        `/?fixture=table&layered&theme=${appearance}${compact ? '&compact=1&rtl=1' : ''}`,
      );
      const table = page.getByRole('table', { name: 'Layered records', exact: true });
      const root = page.locator('.leaf-table');
      const header = table.locator('thead');
      const viewport = root.locator('.leaf-table__viewport');
      const panel = root.locator('.leaf-table__panel');
      await expect(header).toHaveCSS('position', 'sticky');
      await expectShortHeaderSeparators(table);
      await expect(root).toHaveCSS('box-shadow', 'none');
      await expect(root).toHaveAttribute('data-vertical-overflow', 'true');
      if (await page.evaluate(() => CSS.supports('overscroll-behavior-y', 'contain')))
        await expect(viewport).toHaveCSS('overscroll-behavior-y', 'contain');
      const frame = await panel.boundingBox();
      const heading = await header.boundingBox();
      expect(frame?.y).toBeCloseTo((heading?.y ?? 0) + (heading?.height ?? 0), 0);
      const first = await table.locator('tbody tr').first().boundingBox();
      const windowTop = await page.evaluate(() => window.scrollY);
      await viewport.hover();
      await page.mouse.wheel(0, 160);
      await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(80);
      expect((await table.locator('tbody tr').first().boundingBox())?.y).toBeLessThan(
        first?.y ?? 0,
      );
      expect(await header.boundingBox()).toEqual(heading);
      expect(await panel.boundingBox()).toEqual(frame);
      expect(await page.evaluate(() => window.scrollY)).toBe(windowTop);
      await viewport.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });
      await viewport.hover();
      await page.mouse.wheel(0, 160);
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      expect(await page.evaluate(() => window.scrollY)).toBe(windowTop);
      await viewport.evaluate((node) => {
        const maximum = node.scrollWidth - node.clientWidth;
        node.scrollLeft = getComputedStyle(node).direction === 'rtl' ? -maximum / 2 : maximum / 2;
      });
      const columnEdges = await table.evaluate((node) => ({
        header: node.querySelector('thead tr:last-child th')?.getBoundingClientRect().left,
        body: node.querySelector('tbody tr td')?.getBoundingClientRect().left,
      }));
      expect(columnEdges.header).toBeCloseTo(columnEdges.body ?? 0, 1);
      await page.getByRole('button', { name: 'Change heading' }).click();
      await expect(table.getByRole('columnheader', { name: /People and their/ })).toBeVisible();
      await expectShortHeaderSeparators(table);
      await expect
        .poll(async () => (await panel.boundingBox())?.y ?? 0)
        .toBeGreaterThan(frame?.y ?? 0);
      const expandedHeader = await header.boundingBox();
      const expandedFrame = await panel.boundingBox();
      expect(expandedFrame?.y).toBeCloseTo(
        (expandedHeader?.y ?? 0) + (expandedHeader?.height ?? 0),
        0,
      );
      expect((expandedFrame?.y ?? 0) + (expandedFrame?.height ?? 0)).toBeCloseTo(
        (frame?.y ?? 0) + (frame?.height ?? 0),
        1,
      );
      await root.screenshot({ path: testInfo.outputPath(`table-layered-${appearance}.png`) });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
    });
  }

  test(`layered table keeps native semantics in ${appearance}`, { tag: '@a11y' }, async ({
    page,
  }) => {
    await page.goto(`/?fixture=table&layered&theme=${appearance}`);
    await expectAccessible(page);
  });
}
