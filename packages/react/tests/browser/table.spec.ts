import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=table');
});

test('native and data tables fill centered containers without collapsing or overflowing', async ({
  page,
}) => {
  for (const width of [1100, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const label of ['Team members', 'Simple data table']) {
      const table = page.getByRole('table', { name: label });
      const geometry = await table.evaluate((node) => {
        const viewport = node.closest('.leaf-table__viewport');
        const root = node.closest('.leaf-table');
        const container = root?.closest('section')?.querySelector('div');
        return {
          width: root?.getBoundingClientRect().width ?? 0,
          available: container?.getBoundingClientRect().width ?? 0,
          scroll: viewport?.scrollWidth ?? 0,
          client: viewport?.clientWidth ?? 0,
          table: node.getBoundingClientRect().width,
          radius: root ? getComputedStyle(root).borderRadius : '',
          baseRadius: root ? getComputedStyle(root).getPropertyValue('--leaf-radius').trim() : '',
        };
      });
      expect(geometry.width).toBeGreaterThan(200);
      expect(Math.abs(geometry.width - geometry.available)).toBeLessThan(2);
      expect(geometry.table).toBeGreaterThanOrEqual(geometry.client - 1);
      expect(geometry.radius).toBe(geometry.baseRadius);
      if (width === 375) expect(geometry.scroll).toBeGreaterThan(geometry.client);
    }
  }
});

test('keyboard sorting, page selection, filtering, expansion and column visibility share state', async ({
  page,
}) => {
  const demo = page.getByRole('region', { name: 'Data table demo', exact: true });
  const table = demo.getByRole('table');
  await table.getByRole('button', { name: 'Projects: Sort descending' }).focus();
  await page.keyboard.press('Enter');
  await expect(table.locator('th[aria-sort]')).toHaveAttribute('aria-sort', 'descending');
  await table.getByRole('checkbox', { name: 'Select all rows on this page' }).check();
  const selected = await table.locator('tr[data-selected]').count();
  expect(selected).toBeGreaterThan(0);
  await demo.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(demo.getByText(`${selected} selected`, { exact: true })).toBeVisible();
  const search = demo.getByRole('textbox', { name: 'Search table' });
  await search.fill('Riley');
  await expect(
    table.locator('tbody tr[data-row-id] strong').filter({ hasText: 'Riley Chen' }),
  ).toHaveCount(4);
  const expand = table.getByRole('button', { name: /Expand row: Riley/ }).first();
  await expand.click();
  await expect(table.locator('tr[data-detail-row]:not([hidden])')).toHaveCount(1);
  await demo.getByRole('button', { name: 'Columns' }).click();
  const panel = page.getByRole('dialog', { name: 'Columns' });
  await panel.getByRole('checkbox', { name: 'Email' }).uncheck();
  await expect(table.getByRole('columnheader', { name: /Email/ })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
});

test('sticky header and logical pinned columns retain geometry in both directions', async ({
  page,
}) => {
  for (const rtl of [false, true]) {
    await page.goto(`/?fixture=table${rtl ? '&rtl=1' : ''}`);
    const table = page.getByRole('table', { name: 'Pinned and resizable columns' });
    const viewport = table.locator(
      'xpath=ancestor::*[contains(@class, "leaf-table__viewport")][1]',
    );
    const first = table.locator('tbody tr').first().locator('td[data-pinned="start"]');
    const last = table.locator('tbody tr').first().locator('td[data-pinned="end"]');
    const header = table.locator('thead');
    await expect(first).toHaveCSS('width', '230px');
    await expect(last).toHaveCSS('width', '110px');
    await viewport.scrollIntoViewIfNeeded();
    const before = await first.boundingBox();
    const beforeEnd = await last.boundingBox();
    await viewport.evaluate((node) => {
      node.scrollTop = 180;
      node.scrollLeft = getComputedStyle(node).direction === 'rtl' ? -150 : 150;
    });
    const after = await first.boundingBox();
    const afterEnd = await last.boundingBox();
    expect(Math.abs((before?.x ?? 0) - (after?.x ?? 0))).toBeLessThan(2);
    expect(Math.abs((beforeEnd?.x ?? 0) - (afterEnd?.x ?? 0))).toBeLessThan(2);
    const viewportBox = await viewport.boundingBox();
    const headerBox = await header.boundingBox();
    expect(Math.abs((viewportBox?.y ?? 0) - (headerBox?.y ?? 0))).toBeLessThan(2);
  }
});

test('column resizing supports mouse dragging and keyboard bounds without sorting', async ({
  page,
}) => {
  const table = page.getByRole('table', { name: 'Pinned and resizable columns' });
  const handle = table.getByRole('separator', { name: 'Resize column: Member' });
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box) throw new Error('Missing resize handle');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 44, box.y + box.height / 2);
  await page.mouse.up();
  const value = Number(await handle.getAttribute('aria-valuenow'));
  expect(value).toBeGreaterThan(250);
  await handle.focus();
  await page.keyboard.press('Home');
  await expect(handle).toHaveAttribute('aria-valuenow', '160');
  await page.keyboard.press('End');
  await expect(handle).toHaveAttribute('aria-valuenow', '400');
  expect(await table.locator('th[aria-sort]').count()).toBe(0);
});

test('10000 variable rows virtualize, retain editing focus, remeasure details and reach the end', async ({
  page,
}) => {
  const table = page.getByRole('table', { name: 'Large table' });
  const viewport = table.locator('xpath=ancestor::*[contains(@class, "leaf-table__viewport")][1]');
  await expect(table.locator('tr[data-row-id]')).not.toHaveCount(0);
  expect(await table.locator('tr[data-row-id]').count()).toBeLessThan(40);
  await expect(table).toHaveAttribute('aria-rowcount', '10001');
  const input = table.getByRole('textbox', { name: 'Edit Person 00000' });
  await input.fill('My draft');
  await viewport.evaluate((node) => {
    node.scrollTop = 4000;
  });
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('My draft');
  expect(await table.locator('tr[data-row-id]').count()).toBeLessThan(45);
  await page.getByRole('button', { name: 'Toggle virtual width' }).click();
  await viewport.evaluate((node) => {
    node.scrollTop = 0;
  });
  const expand = table.getByRole('button', { name: 'Expand row: 0', exact: true });
  await expand.click();
  await expect(table).toHaveAttribute('aria-rowcount', '10002');
  await expect(table.locator('[data-detail-row="0"]')).toHaveAttribute('aria-rowindex', '3');
  await expect(table.locator('[data-row-id="1"]')).toHaveAttribute('aria-rowindex', '4');
  await expect(table.locator('[data-detail-row="0"]')).toBeVisible();
  // Row measurement runs through ResizeObserver. Read one consistent layout
  // and wait for the measured detail to replace the virtual height estimate.
  await expect
    .poll(() =>
      table.evaluate((node) => {
        const first = node.querySelector('[data-row-id="0"]')?.getBoundingClientRect();
        const detail = node.querySelector('[data-detail-row="0"]')?.getBoundingClientRect();
        const second = node.querySelector('[data-row-id="1"]')?.getBoundingClientRect();
        if (!first || !detail || !second) return Number.POSITIVE_INFINITY;
        return Math.abs(second.y - first.bottom - detail.height);
      }),
    )
    .toBeLessThan(0.5);
  await viewport.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await expect(table.getByRole('textbox', { name: 'Edit Person 09999' })).toBeVisible();
  expect(await table.locator('tr[data-row-id]').count()).toBeLessThan(45);
});

test('remote pagination retains rows during refresh and retries errors', async ({ page }) => {
  const demo = page.getByRole('region', { name: 'Server table demo', exact: true });
  const table = demo.getByRole('table');
  await expect(table.locator('[data-row-id]')).toHaveCount(5);
  await demo.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(table).toHaveAttribute('aria-busy', 'true');
  await expect(table.locator('[data-row-id]')).toHaveCount(5);
  await expect(table.locator('[data-row-id="member-6"]')).toBeVisible();
  await demo.getByRole('button', { name: 'Simulate error' }).click();
  await expect(table.getByRole('alert')).toContainText('Unable to load members');
  await table.getByRole('button', { name: 'Retry' }).click();
  await expect(table.locator('[data-row-id="member-6"]')).toBeVisible();
});

test('rows and columns reorder by keyboard and pointer without replacing table semantics', async ({
  page,
}) => {
  const table = page.getByRole('table', { name: 'Reorderable team' });
  const rowHandle = table.getByRole('button', { name: 'Reorder row: Alex Morgan' });
  await rowHandle.scrollIntoViewIfNeeded();
  await rowHandle.focus();
  await page.keyboard.press('Space');
  await expect(table.locator('tr[data-dragging]')).toHaveAttribute('data-row-id', 'alex');
  await page.keyboard.press('ArrowDown');
  await expect(
    page.locator('[role="status"]').filter({ hasText: 'Move to Sam Taylor' }),
  ).toBeVisible();
  await page.keyboard.press('Space');
  await expect(table.locator('tbody tr').first()).toHaveAttribute('data-row-id', 'sam');
  const columnHandle = table.getByRole('button', { name: 'Reorder column: Member' });
  await columnHandle.focus();
  await page.keyboard.press('Space');
  await expect(table.locator('th[data-dragging]')).toContainText('Member');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[role="status"]').filter({ hasText: 'Move to Team' })).toBeVisible();
  await page.keyboard.press('Space');
  await expect(table.locator('th').nth(1)).toContainText('Team');
  await page.goto('/?fixture=table');
  await expect(
    page.getByRole('table', { name: 'Remote members' }).locator('tbody tr[data-row-id]'),
  ).toHaveCount(5);
  await table.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const active = table.getByRole('button', { name: 'Reorder row: Jordan Lee' });
  const target = table.getByRole('button', { name: 'Reorder row: Alex Morgan' });
  await active.hover();
  const activeBox = await active.boundingBox();
  const targetBox = await target.boundingBox();
  if (!activeBox || !targetBox) throw new Error('Missing drag handles');
  await page.mouse.move(activeBox.x + 12, activeBox.y + 12);
  await page.mouse.down();
  await page.mouse.move(activeBox.x + 12, activeBox.y + 20);
  await expect(table.locator('tr[data-dragging]')).toHaveAttribute('data-row-id', 'jordan');
  await page.mouse.move(targetBox.x + 12, targetBox.y + 12, { steps: 10 });
  await expect(
    page.locator('[role="status"]').filter({ hasText: 'Move to Alex Morgan' }),
  ).toBeVisible();
  await page.mouse.up();
  await expect(table.locator('tbody tr').first()).toHaveAttribute('data-row-id', 'jordan');
  expect(await table.getAttribute('role')).not.toBe('grid');
});

test('mobile width scrolls inside table and component theme tokens are consumed', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 850 });
  const table = page.getByRole('table', { name: 'Team members' });
  const geometry = await table
    .locator('xpath=ancestor::*[contains(@class, "leaf-table__viewport")][1]')
    .evaluate((node) => ({ client: node.clientWidth, scroll: node.scrollWidth }));
  expect(geometry.scroll).toBeGreaterThan(geometry.client);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
  const themed = page.getByRole('table', { name: 'Custom theme' });
  await expect(themed.getByRole('cell')).toHaveCSS('padding', '8px 12px');
  await expect(themed).toHaveCSS('font-size', '13px');
});

test('default sticky headers and body-only overlay tracks preserve page wheel scrolling', async ({
  page,
}) => {
  const plain = page.getByRole('table', { name: 'Team members' });
  const plainViewport = plain.locator(
    'xpath=ancestor::*[contains(@class, "leaf-table__viewport")][1]',
  );
  await expect(plain.locator('thead')).toHaveCSS('position', 'sticky');
  await plainViewport.scrollIntoViewIfNeeded();
  await plain.getByRole('cell', { name: 'alex@example.com' }).hover();
  expect(await plainViewport.evaluate((node) => node.scrollHeight <= node.clientHeight)).toBe(true);
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 250);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 30);
  const pinned = page.getByRole('table', { name: 'Pinned and resizable columns' });
  const viewport = pinned.locator('xpath=ancestor::*[contains(@class, "leaf-table__viewport")][1]');
  const root = pinned.locator('xpath=ancestor::*[contains(@class, "leaf-table__scroll-area")][1]');
  const track = root.locator('.leaf-scrollbar__bar--vertical');
  await viewport.scrollIntoViewIfNeeded();
  await expect(track).toBeAttached();
  const header = await pinned.locator('thead').boundingBox();
  const bar = await track.boundingBox();
  expect(bar?.y ?? 0).toBeGreaterThanOrEqual((header?.y ?? 0) + (header?.height ?? 0));
  expect(
    await viewport.evaluate((node) => node.clientWidth === node.getBoundingClientRect().width),
  ).toBe(true);
  await viewport.evaluate((node) => {
    node.scrollTop = 120;
  });
  const viewportBox = await viewport.boundingBox();
  const sticky = await pinned.locator('thead').boundingBox();
  expect(Math.abs((viewportBox?.y ?? 0) - (sticky?.y ?? 0))).toBeLessThan(2);
});

test('container-driven horizontal overflow uses an overlay scrollbar and updates after resizing', async ({
  page,
}) => {
  for (const rtl of [false, true]) {
    await page.goto(`/?fixture=table${rtl ? '&rtl=1' : ''}`);
    await page.setViewportSize({ width: 375, height: 900 });
    for (const name of ['Team members', 'Simple data table']) {
      const table = page.getByRole('table', { name });
      const root = table.locator(
        'xpath=ancestor::*[contains(@class, "leaf-table__scroll-area")][1]',
      );
      const viewport = root.locator('.leaf-table__viewport');
      const bar = root.locator('.leaf-scrollbar__bar--horizontal');
      await expect(bar).toBeAttached();
      await expect(root.locator('.leaf-scrollbar__bar--vertical')).toHaveCount(0);
      await expect(viewport).toHaveCSS('scrollbar-width', 'none');
      await root.hover();
      await expect(bar).toHaveCSS('opacity', '1');
      await expect(bar).toHaveCSS('position', 'absolute');
      const control = bar.getByRole('scrollbar');
      await control.focus();
      await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight');
      await expect
        .poll(() => viewport.evaluate((node) => Math.abs(node.scrollLeft)))
        .toBeGreaterThan(0);
      const pageBefore = await page.evaluate(() => window.scrollY);
      await root.hover();
      await page.mouse.wheel(0, 220);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(pageBefore + 20);
    }
    await page.setViewportSize({ width: 1536, height: 900 });
    const table = page.getByRole('table', { name: 'Team members' });
    const root = table.locator('xpath=ancestor::*[contains(@class, "leaf-table__scroll-area")][1]');
    await expect(root.locator('.leaf-scrollbar__bar--horizontal')).toHaveCount(0);
  }
});

test('native and interactive tables pass axe in both themes and reduced motion', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    await page.goto(`/?fixture=table&theme=${theme}`);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () =>
      (
        await (window as unknown as { axe: typeof axe }).axe.run(
          document.querySelector('main') as HTMLElement,
          {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
          },
        )
      ).violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
      })),
    );
    expect(violations).toEqual([]);
  }
});
