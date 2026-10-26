import { expect, type Locator, test } from '@playwright/test';

const viewport = (table: Locator) =>
  table.locator('xpath=ancestor::*[contains(@class, "leaf-table__viewport")][1]');

async function expectFeedbackInsideViewport(table: Locator) {
  await expect
    .poll(() =>
      table.evaluate((node) => {
        const visible = node.closest<HTMLElement>('.leaf-table__viewport');
        const title = node.querySelector('.leaf-result__title');
        const icon = node.querySelector('.leaf-result__icon');
        const retry = node.querySelector('.leaf-result__extra button');
        if (!visible || !title || !icon || !retry) return false;
        const bounds = visible.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(title);
        return [
          range.getBoundingClientRect(),
          icon.getBoundingClientRect(),
          retry.getBoundingClientRect(),
        ].every(
          (box) =>
            box.width > 0 &&
            box.left >= bounds.left - 1 &&
            box.right <= bounds.right + 1 &&
            box.top >= bounds.top - 1 &&
            box.bottom <= bounds.bottom + 1,
        );
      }),
    )
    .toBe(true);
}

for (const rtl of [false, true]) {
  for (const width of [375, 1100]) {
    test(`table resize handle survives an hr reset: ${rtl ? 'rtl' : 'ltr'} ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?fixture=table&current-columns=1${rtl ? '&rtl=1' : ''}`);
      await page.addStyleTag({ content: 'hr { height: 0; }' });
      const table = page.getByRole('table', { name: 'Pinned and resizable columns', exact: true });
      const handle = table.getByRole('separator', { name: 'Resize column: Member', exact: true });
      await handle.scrollIntoViewIfNeeded();
      const initial = Number(await handle.getAttribute('aria-valuenow'));
      await expect
        .poll(() => handle.evaluate((node) => node.getBoundingClientRect().height))
        .toBeGreaterThan(0);
      expect(
        await handle.evaluate((node) => {
          const box = node.getBoundingClientRect();
          return (
            document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2) === node
          );
        }),
      ).toBe(true);
      const box = await handle.boundingBox();
      if (!box) throw new Error('Missing resize handle');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + (rtl ? -40 : 40), box.y + box.height / 2);
      await page.mouse.up();
      await expect
        .poll(async () => Number(await handle.getAttribute('aria-valuenow')))
        .toBeGreaterThan(initial + 30);
    });
  }

  test(`table pinning yields to a 283px viewport and restores without state changes: ${rtl ? 'rtl' : 'ltr'}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto(`/?fixture=table&pinning-overflow=1${rtl ? '&rtl=1' : ''}`);
    const demo = page.getByRole('region', { name: 'Pinning overflow demo', exact: true });
    const table = demo.getByRole('table', { name: 'Overflowing pinned columns', exact: true });
    const scroll = viewport(table);
    const start = table.locator('thead th[data-pinned="start"]');
    const end = table.locator('thead th[data-pinned="end"]');
    const handle = start.getByRole('separator', { name: 'Resize column: Name', exact: true });
    const pinning = '{"left":["name"],"right":["projects"]}';
    await expect(scroll).toHaveJSProperty('clientWidth', 283);
    await expect(start).toHaveCSS('position', 'relative');
    await expect(end).toHaveCSS('position', 'relative');
    expect(
      await end.evaluate((node) => getComputedStyle(node, '::before').borderInlineStartWidth),
    ).toBe('0px');
    expect(await start.evaluate((node) => getComputedStyle(node, '::after').display)).toBe('none');
    await handle.scrollIntoViewIfNeeded();
    expect(
      await handle.evaluate((node) => {
        const box = node.getBoundingClientRect();
        return (
          document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2) === node
        );
      }),
    ).toBe(true);
    const box = await handle.boundingBox();
    if (!box) throw new Error('Missing resize handle in narrow pinned table');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + (rtl ? -40 : 40), box.y + box.height / 2);
    await page.mouse.up();
    await expect
      .poll(async () => Number(await handle.getAttribute('aria-valuenow')))
      .toBeGreaterThan(230);
    await demo.getByRole('button', { name: 'Reset column widths', exact: true }).click();
    await expect(handle).toHaveAttribute('aria-valuenow', '200');
    await demo.getByRole('button', { name: 'Toggle projects', exact: true }).click();
    await expect(end).toHaveCount(0);
    await expect(start).toHaveCSS('position', 'sticky');
    await demo.getByRole('button', { name: 'Toggle projects', exact: true }).click();
    await expect(end).toHaveCSS('position', 'relative');
    await handle.press('Home');
    await expect(start).toHaveCSS('position', 'sticky');
    await handle.press('End');
    await expect(start).toHaveCSS('position', 'relative');
    await demo.getByRole('button', { name: 'Reset column widths', exact: true }).click();
    await demo.getByRole('button', { name: 'Toggle container width', exact: true }).click();
    await expect(scroll).toHaveJSProperty('clientWidth', 490);
    await expect(start).toHaveCSS('position', 'sticky');
    await expect(end).toHaveCSS('position', 'sticky');
    const before = { start: await start.boundingBox(), end: await end.boundingBox() };
    await scroll.evaluate((node) => {
      node.scrollTop = 80;
      node.scrollLeft = getComputedStyle(node).direction === 'rtl' ? -80 : 80;
    });
    await expect.poll(() => scroll.evaluate((node) => Math.abs(node.scrollLeft))).toBe(80);
    const after = { start: await start.boundingBox(), end: await end.boundingBox() };
    expect(after.start?.x).toBeCloseTo(before.start?.x ?? 0, 0);
    expect(after.end?.x).toBeCloseTo(before.end?.x ?? 0, 0);
    await demo.getByRole('button', { name: 'Toggle container width', exact: true }).click();
    await expect(start).toHaveCSS('position', 'relative');
    await scroll.evaluate((node) => {
      node.scrollTop = 80;
    });
    const header = await table.locator('thead').boundingBox();
    const viewportBounds = await scroll.boundingBox();
    if (!header || !viewportBounds) throw new Error('Missing fixed table header geometry');
    expect(header.y).toBeCloseTo(viewportBounds.y, 0);
    const lastHandle = end.getByRole('separator', { name: 'Resize column: Projects', exact: true });
    await lastHandle.scrollIntoViewIfNeeded();
    expect(
      await lastHandle.evaluate((node) => {
        const box = node.getBoundingClientRect();
        return (
          document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2) === node
        );
      }),
    ).toBe(true);
    await expect(demo.getByRole('status', { name: 'Pinning state' })).toHaveText(pinning);
    await expect(demo.getByRole('status', { name: 'Pinning changes' })).toHaveText('0');
    await demo.screenshot({ path: testInfo.outputPath('table-pinning-overflow-scrollable.png') });
  });

  for (const theme of ['light', 'dark']) {
    test(`table error remains readable while the wide table scrolls: ${rtl ? 'rtl' : 'ltr'} ${theme}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: 375, height: 900 });
      await page.goto(`/?fixture=table&theme=${theme}${rtl ? '&rtl=1' : ''}`);
      const demo = page.getByRole('region', { name: 'Server table demo', exact: true });
      const table = demo.getByRole('table', { name: 'Remote members', exact: true });
      const scroll = viewport(table);
      await expect(table.locator('tbody tr[data-row-id]')).toHaveCount(5);
      expect(await scroll.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeGreaterThan(
        0,
      );
      await demo.getByRole('button', { name: 'Simulate error', exact: true }).click();
      await expect(table.getByRole('alert')).toContainText('Unable to load members');
      await expect(table).not.toHaveAttribute('aria-busy');
      await table.scrollIntoViewIfNeeded();
      await expectFeedbackInsideViewport(table);
      await scroll.evaluate((node) => {
        node.scrollLeft =
          getComputedStyle(node).direction === 'rtl' ? -node.scrollWidth : node.scrollWidth;
      });
      await expect
        .poll(() => scroll.evaluate((node) => Math.abs(node.scrollLeft)))
        .toBeGreaterThan(0);
      await expectFeedbackInsideViewport(table);
      await demo.screenshot({ path: testInfo.outputPath('table-scrolled-error.png') });
      await page.setViewportSize({ width: 320, height: 900 });
      await expectFeedbackInsideViewport(table);
      await table.getByRole('button', { name: 'Retry', exact: true }).click();
      await expect(table.getByRole('alert')).toHaveCount(0);
      await expect(table).not.toHaveAttribute('aria-busy');
      await expect(table.locator('tbody tr[data-row-id]')).toHaveCount(5);
      expect(await scroll.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeGreaterThan(
        0,
      );
    });
  }
}
