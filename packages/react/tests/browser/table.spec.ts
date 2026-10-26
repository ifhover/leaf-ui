import { expect, test } from '@playwright/test';
import axe from 'axe-core';
import { expectDataRowStripes, expectShortHeaderSeparators } from './helpers/table-appearance';

const colorChannels = (color: string) => {
  const srgb = color.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)\)$/);
  if (srgb) return srgb.slice(1).map((value) => Number(value) * 255);
  const rgb = color.match(/^rgba?\(([\d.]+),?\s+([\d.]+),?\s+([\d.]+)/);
  if (rgb) return rgb.slice(1).map(Number);
  throw new Error(`Unsupported color: ${color}`);
};
const colorDistance = (left: string, right: string) => {
  const a = colorChannels(left);
  const b = colorChannels(right);
  return Math.hypot(
    (a[0] ?? 0) - (b[0] ?? 0),
    (a[1] ?? 0) - (b[1] ?? 0),
    (a[2] ?? 0) - (b[2] ?? 0),
  );
};

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=table');
});

for (const theme of ['light', 'dark']) {
  for (const width of [1100, 375]) {
    test(`automatic toolbar and pagination APIs: ${theme}, ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?fixture=table&theme=${theme}`);
      const demo = page.getByRole('region', { name: 'Table API demo', exact: true });
      const table = demo.getByRole('table', { name: 'Dynamic pagination', exact: true });
      await expect(table.locator('tbody tr[data-row-id]')).toHaveCount(10);
      await table.getByRole('checkbox', { name: 'Select row: 0', exact: true }).check();
      await demo.getByRole('button', { name: 'Toggle pagination', exact: true }).click();
      await expect(table.locator('tbody tr[data-row-id]')).toHaveCount(14);
      await expect(
        table.getByRole('checkbox', { name: 'Select row: 0', exact: true }),
      ).toBeChecked();
      await demo.getByRole('button', { name: 'Toggle pagination', exact: true }).click();
      await expect(table.locator('tbody tr[data-row-id]')).toHaveCount(10);
      const root = table.locator(
        'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " leaf-data-table ")][1]',
      );
      await root.getByRole('button', { name: 'Next page', exact: true }).click();
      await expect(table.locator('tbody tr[data-row-id]')).toHaveCount(4);
      await demo.getByRole('button', { name: 'Toggle pagination', exact: true }).click();
      await root.getByRole('textbox', { name: 'Search table' }).fill('00000');
      await expect(table.locator('tbody tr[data-row-id]')).toHaveCount(1);
      await demo.getByRole('button', { name: 'Toggle pagination', exact: true }).click();
      await expect(table.locator('tbody tr[data-row-id]')).toHaveCount(1);
      await expect(
        table.getByRole('checkbox', { name: 'Select row: 0', exact: true }),
      ).toBeChecked();
      const pages = demo.getByRole('navigation', { name: 'Unknown pages' });
      await expect(pages).toHaveAttribute('id', 'unknown-total-pages');
      await expect(pages).toHaveCSS('margin-top', '12px');
      await expect(pages.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled();

      const selections = page.getByRole('region', {
        name: 'Controlled selection demos',
        exact: true,
      });
      for (const [label, searchName, rowLabel] of [
        ['成员选择', '搜索表格', '选择行: 1'],
        ['Member selection', 'Search table', 'Select row: 1'],
      ]) {
        const selectedTable = selections.getByRole('table', { name: label, exact: true });
        const root = selectedTable.locator(
          'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " leaf-data-table ")][1]',
        );
        await selectedTable.getByRole('checkbox', { name: rowLabel, exact: true }).check();
        await root.getByRole('textbox', { name: searchName }).fill('Alex');
        await expect(selectedTable.locator('tbody tr[data-row-id]')).toHaveCount(1);
        await expect(
          selectedTable.getByRole('checkbox', { name: rowLabel, exact: true }),
        ).toBeChecked();
        await expect(root.locator('.leaf-data-table__toolbar')).toContainText('1');
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    });
  }
}

for (const theme of ['light', 'dark']) {
  for (const compact of [false, true]) {
    test(`default frame, shadow and striped row dividers: ${theme}, ${compact ? 'compact' : 'comfortable'}`, async ({
      page,
    }, testInfo) => {
      await page.goto(`/?fixture=table&theme=${theme}${compact ? '&compact=1' : ''}`);
      // Check the public data-and-columns entry without explicit appearance props.
      for (const name of ['Team members']) {
        const table = page.getByRole('table', { name, exact: true });
        const root = table.locator('xpath=ancestor::div[contains(@class, "leaf-table--md")][1]');
        await expect(root).toHaveCSS('border-top-width', '1px');
        await expect(root).toHaveCSS('border-radius', '12px');
        await expect(root).toHaveCSS('box-shadow', 'none');
        const panel = root.locator('.leaf-table__panel');
        const shadow = await panel.evaluate((node) => getComputedStyle(node, '::before').boxShadow);
        expect(shadow).toContain('0px 2px 6px');
        expect(shadow).toContain('0px 1px 2px');
        const colors = await root.evaluate((node) => {
          const divider = document.createElement('div');
          divider.style.backgroundColor = 'var(--leaf-color-divider)';
          document.body.append(divider);
          const dividerColor = getComputedStyle(divider).backgroundColor;
          divider.remove();
          const style = getComputedStyle(node.querySelector('.leaf-table__panel') ?? node);
          const surface = document.createElement('div');
          surface.style.backgroundColor = 'var(--leaf-table-surface)';
          node.append(surface);
          const surfaceColor = getComputedStyle(surface).backgroundColor;
          surface.remove();
          return {
            border: style.borderTopColor,
            divider: dividerColor,
            surface: surfaceColor,
          };
        });
        const frameDistance = colorDistance(colors.border, colors.surface);
        expect(frameDistance).toBeGreaterThan(0);
        expect(frameDistance).toBeLessThan(colorDistance(colors.divider, colors.surface));
        await expectShortHeaderSeparators(table);
        await expect(table.locator('thead th').first()).toHaveCSS('border-bottom-width', '0px');
        await expect(table.locator('thead th').first()).toHaveCSS(
          'background-color',
          await root.evaluate((node) => getComputedStyle(node).backgroundColor),
        );
        await expect(table.locator('tbody tr').first().locator('td').first()).toHaveCSS(
          'border-right-width',
          '0px',
        );
        const cells = table.locator('tbody tr > td:first-child');
        await expect(cells.first()).toHaveCSS('background-color', colors.surface);
        await expect(cells.first()).toHaveCSS('border-bottom-width', '0px');
        const backgrounds = await cells.evaluateAll((nodes) =>
          nodes.map((node) => getComputedStyle(node).backgroundColor),
        );
        expect(backgrounds[0]).not.toBe(backgrounds[1]);
        expect(backgrounds[0]).toBe(backgrounds[2]);
      }

      const demo = page.getByRole('region', { name: 'Table appearance demo', exact: true });
      const table = demo.getByRole('table');
      const root = demo.locator('.leaf-table');
      for (const bordered of [false, true]) {
        await demo
          .getByRole('checkbox', { name: 'Body column dividers', exact: true })
          .setChecked(bordered);
        await expectShortHeaderSeparators(table);
        for (const striped of [false, true]) {
          await demo.getByRole('checkbox', { name: 'Striped rows' }).setChecked(striped);
          await page.mouse.move(0, 0);
          await expect(root).toHaveCSS('border-top-width', '1px');
          await expect(root).toHaveCSS('border-radius', '12px');
          await expect(table.locator('thead th').first()).toHaveCSS('border-bottom-width', '0px');
          const cells = table.locator('tbody tr > td:first-child');
          const header = table.locator('thead th').first();
          await expect(header).toHaveCSS('font-weight', '500');
          await expect(header).toHaveCSS(
            'background-color',
            await root.evaluate((node) => getComputedStyle(node).backgroundColor),
          );
          expect(await header.evaluate((node) => getComputedStyle(node).color)).not.toBe(
            await cells.first().evaluate((node) => getComputedStyle(node).color),
          );
          await expect(cells.first()).toHaveCSS('border-right-width', bordered ? '1px' : '0px');
          await expect(cells.first()).toHaveCSS('border-bottom-width', striped ? '0px' : '1px');
          await expect(cells.last()).toHaveCSS('border-bottom-width', '0px');
          await expect
            .poll(async () => {
              const colors = await cells.evaluateAll((nodes) =>
                nodes.map((node) => getComputedStyle(node).backgroundColor),
              );
              return colors[0] === colors[1];
            })
            .toBe(!striped);
          const surface = await root.evaluate((node) => {
            const probe = document.createElement('div');
            probe.style.backgroundColor = 'var(--leaf-table-surface)';
            node.append(probe);
            const color = getComputedStyle(probe).backgroundColor;
            probe.remove();
            return color;
          });
          await expect(cells.first()).toHaveCSS('background-color', surface);
          if (striped) {
            expect(
              await cells.nth(1).evaluate((node) => getComputedStyle(node).backgroundColor),
            ).not.toBe(surface);
          }
          // Both ordinary and striped rows must visibly respond to hover and resolve to one color.
          const hoverColors: string[] = [];
          for (const cell of [cells.nth(0), cells.nth(1)]) {
            await cell.evaluate((node) =>
              Promise.all(
                node.getAnimations().map((animation) => animation.finished.catch(() => {})),
              ),
            );
            const rest = await cell.evaluate((node) => getComputedStyle(node).backgroundColor);
            await cell.hover();
            await expect
              .poll(() => cell.evaluate((node) => getComputedStyle(node).backgroundColor))
              .not.toBe(rest);
            await cell.evaluate((node) =>
              Promise.all(
                node.getAnimations().map((animation) => animation.finished.catch(() => {})),
              ),
            );
            hoverColors.push(await cell.evaluate((node) => getComputedStyle(node).backgroundColor));
            await page.mouse.move(0, 0);
            await expect(cell).toHaveCSS('background-color', rest);
          }
          expect(hoverColors[0]).toBe(hoverColors[1]);
        }
      }
      await demo.getByRole('checkbox', { name: 'Body column dividers', exact: true }).uncheck();
      await demo.screenshot({
        path: testInfo.outputPath(`table-${theme}-${compact ? 'compact' : 'comfortable'}.png`),
      });
    });
  }
}

for (const theme of ['light', 'dark']) {
  test(`expandable rows use shared buttons and keep alternating backgrounds: ${theme}`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=table&theme=${theme}${theme === 'dark' ? '&compact=1&rtl=1' : ''}`);
    const demo = page.getByRole('region', { name: 'Data table demo', exact: true });
    const table = demo.getByRole('table');
    await expect(table.locator('tbody > tr[data-row-id]')).toHaveCount(5);
    await expect(table.locator('tbody > tr[data-detail-row][hidden]')).toHaveCount(5);
    await expectDataRowStripes(table);
    const expand = table.getByRole('button', {
      name: 'Expand row: Alex Morgan (member-1)',
      exact: true,
    });
    await expect(expand).toHaveClass(/\bleaf-button--text\b/);
    await expect(expand).toHaveClass(/\bleaf-button--icon-only\b/);
    await expect(expand).toHaveAttribute('type', 'button');
    const geometry = await expand.evaluate((button) => {
      const bounds = button.getBoundingClientRect();
      const cell = button.closest('td')?.getBoundingClientRect();
      return { width: bounds.width, height: bounds.height, cellWidth: cell?.width ?? 0 };
    });
    expect(geometry.width).toBe(geometry.height);
    expect(geometry.width).toBeGreaterThanOrEqual(24);
    expect(geometry.width).toBeLessThanOrEqual(geometry.cellWidth);
    await expand.focus();
    await expect(expand).toBeFocused();
    await expect(expand).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    const collapse = table.getByRole('button', {
      name: 'Collapse row: Alex Morgan (member-1)',
      exact: true,
    });
    await expect(collapse).toHaveAttribute('aria-expanded', 'true');
    await expect(table.locator('[data-detail-row="member-1"]')).toBeVisible();
    await expect(collapse.locator('.leaf-data-table__expand-icon')).toHaveCSS(
      'rotate',
      theme === 'dark' ? '-90deg' : '90deg',
    );
    await expectDataRowStripes(table);
    await page.keyboard.press('Space');
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    await expect(table.locator('[data-detail-row="member-1"]')).toBeHidden();
    await expectDataRowStripes(table);
    await demo.getByRole('button', { name: 'Next page', exact: true }).click();
    await page.mouse.move(0, 0);
    await expectDataRowStripes(table);
    await table.getByRole('button', { name: 'Projects: Sort descending', exact: true }).click();
    await page.mouse.move(0, 0);
    await expectDataRowStripes(table);
    await demo.getByRole('textbox', { name: 'Search table' }).fill('Riley');
    await expect(table.locator('tbody > tr[data-row-id]')).toHaveCount(4);
    await expectDataRowStripes(table);
  });
}

test('data tables fill centered containers without collapsing or overflowing', async ({ page }) => {
  for (const width of [1100, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const label of ['Team members']) {
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
        };
      });
      expect(geometry.width).toBeGreaterThan(200);
      expect(Math.abs(geometry.width - geometry.available)).toBeLessThan(2);
      expect(geometry.table).toBeGreaterThanOrEqual(geometry.client - 1);
      expect(geometry.radius).toBe('12px');
      if (width === 375) expect(geometry.scroll).toBeGreaterThan(geometry.client);
    }
  }
});

test('basic and pinned-column demos share the same default header and row heights', async ({
  page,
}) => {
  const measure = (name: string, page: import('@playwright/test').Page) => {
    const table = page.getByRole('table', { name });
    return table.evaluate((node) => ({
      header: node.querySelector('thead th')?.getBoundingClientRect().height ?? 0,
      row: node.querySelector('tbody tr')?.getBoundingClientRect().height ?? 0,
    }));
  };
  const basic = await measure('Team members', page);
  const pinned = await measure('Pinned and resizable columns', page);
  expect(Math.abs(basic.header - pinned.header), JSON.stringify({ basic, pinned })).toBeLessThan(1);
  expect(Math.abs(basic.row - pinned.row), JSON.stringify({ basic, pinned })).toBeLessThan(1);
});

test('keyboard sorting, page selection, filtering, expansion and column visibility share state', async ({
  page,
}) => {
  const demo = page.getByRole('region', { name: 'Data table demo', exact: true });
  const table = demo.getByRole('table');
  const gap = await table
    .locator('.leaf-data-table__sort')
    .first()
    .evaluate((node) => {
      const label = node.querySelector('span')?.getBoundingClientRect();
      const icon = node.querySelector('svg')?.getBoundingClientRect();
      return label && icon ? icon.left - label.right : -1;
    });
  expect(gap).toBeCloseTo(4, 0);
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
  await page.setViewportSize({ width: 640, height: 900 });
  for (const rtl of [false, true]) {
    await page.goto(`/?fixture=table${rtl ? '&rtl=1' : ''}`);
    const table = page.getByRole('table', { name: 'Pinned and resizable columns' });
    const viewport = table.locator(
      'xpath=ancestor::*[contains(@class, "leaf-table__viewport")][1]',
    );
    const first = table.locator('tbody tr').first().locator('td[data-pinned="start"]');
    const last = table.locator('tbody tr').first().locator('td[data-pinned="end"]');
    const header = table.locator('thead');
    const edgeShadows = () =>
      table.evaluate((node) => {
        const firstPinned = node.querySelector('td[data-pinned="start"][data-pin-edge]');
        const lastPinned = node.querySelector('td[data-pinned="end"][data-pin-edge]');
        return [firstPinned, lastPinned].map((cell) =>
          cell ? getComputedStyle(cell, '::after').backgroundImage !== 'none' : false,
        );
      });
    await expect(first).toHaveCSS('width', '230px');
    await expect(last).toHaveCSS('width', '110px');
    await viewport.scrollIntoViewIfNeeded();
    await expect.poll(edgeShadows).toEqual([false, true]);
    const before = await first.boundingBox();
    const beforeEnd = await last.boundingBox();
    await viewport.evaluate((node) => {
      node.scrollTop = 180;
      const maximum = node.scrollWidth - node.clientWidth;
      node.scrollLeft = getComputedStyle(node).direction === 'rtl' ? -maximum / 2 : maximum / 2;
    });
    await expect.poll(edgeShadows).toEqual([true, true]);
    await expectShortHeaderSeparators(table);
    const after = await first.boundingBox();
    const afterEnd = await last.boundingBox();
    expect(Math.abs((before?.x ?? 0) - (after?.x ?? 0))).toBeLessThan(2);
    expect(Math.abs((beforeEnd?.x ?? 0) - (afterEnd?.x ?? 0))).toBeLessThan(2);
    const viewportBox = await viewport.boundingBox();
    const headerBox = await header.boundingBox();
    expect(Math.abs((viewportBox?.y ?? 0) - (headerBox?.y ?? 0))).toBeLessThan(2);
    await viewport.evaluate((node) => {
      const maximum = node.scrollWidth - node.clientWidth;
      node.scrollLeft = getComputedStyle(node).direction === 'rtl' ? -maximum : maximum;
    });
    await expect.poll(edgeShadows).toEqual([true, false]);
    await viewport.evaluate((node) => {
      node.scrollLeft = 0;
    });
    await expect.poll(edgeShadows).toEqual([false, true]);
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
  await expectDataRowStripes(table);
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
  await page.mouse.move(0, 0);
  await expectDataRowStripes(table);
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
  await expectDataRowStripes(table);
});

test('remote pagination retains rows during refresh and retries errors', async ({ page }) => {
  const demo = page.getByRole('region', { name: 'Server table demo', exact: true });
  const table = demo.getByRole('table');
  await expect(table.locator('[data-row-id]')).toHaveCount(5);
  await demo.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(table).toHaveAttribute('aria-busy', 'true');
  await expect(table.locator('[data-row-id]')).toHaveCount(5);
  await expect(table.locator('[data-row-id="1"]')).toBeVisible();
  await expect(table.locator('[data-row-id="6"]')).toBeVisible();
  await demo.getByRole('button', { name: 'Simulate error' }).click();
  await expect(table.getByRole('alert')).toContainText('Unable to load members');
  await expect(table.getByRole('alert')).toHaveClass(/leaf-result--danger/);
  await expect(table.locator('.leaf-result__icon')).toHaveCSS('width', '48px');
  await table.getByRole('button', { name: 'Retry' }).click();
  await expect(table.locator('[data-row-id="6"]')).toBeVisible();
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
  await expect(
    page.locator('[role="status"]').filter({ hasText: 'Move to Alex Morgan' }),
  ).toBeVisible();
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
  const headerColors: string[] = [];
  for (const theme of ['light', 'dark']) {
    await page.goto(`/?fixture=table&theme=${theme}`);
    headerColors.push(
      await themed.getByRole('columnheader').evaluate((node) => getComputedStyle(node).color),
    );
  }
  expect(headerColors[0]).toBe(headerColors[1]);
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
    for (const name of ['Team members']) {
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

test('data tables pass axe in both themes and reduced motion', { tag: '@a11y' }, async ({
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
    expect.soft(violations).toEqual([]);
  }
});

test('group collapse animates without moving columns, changing stripes or replacing retained rows', async ({
  page,
}) => {
  const table = page.getByRole('table', { name: 'Members grouped by team', exact: true });
  await table.scrollIntoViewIfNeeded();
  const result = await table.evaluate(async (node) => {
    const table = node as HTMLTableElement;
    table.style.setProperty('--leaf-motion-duration', '1000ms');
    const trigger = table.querySelector<HTMLButtonElement>('button[aria-expanded]');
    if (!trigger) throw new Error('Missing group trigger');
    const child = trigger.closest('tr')?.nextElementSibling as HTMLTableRowElement;
    const identity = child.firstElementChild?.firstElementChild;
    const columns = () =>
      Array.from(
        table.tHead?.querySelectorAll('th') ?? [],
        (cell) => cell.getBoundingClientRect().width,
      );
    const colors = () =>
      Array.from(
        table.querySelectorAll<HTMLButtonElement>('button[aria-expanded]'),
        (button) => getComputedStyle(button.closest('td') as HTMLTableCellElement).backgroundColor,
      );
    const before = {
      height: table.getBoundingClientRect().height,
      y: table.getBoundingClientRect().y,
      scroll: window.scrollY,
      columns: columns(),
      colors: colors(),
    };
    trigger.click();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    const middle = table.getBoundingClientRect().height;
    const inaccessibleWhileClosing =
      child.getAttribute('aria-hidden') === 'true' && child.hasAttribute('inert');
    const finish = async () => {
      for (const animation of table.getAnimations({ subtree: true })) animation.finish();
      await new Promise(requestAnimationFrame);
    };
    trigger.click();
    await new Promise(requestAnimationFrame);
    const reverse = table.getBoundingClientRect().height;
    await finish();
    const restored = table.getBoundingClientRect().height;
    trigger.click();
    await new Promise(requestAnimationFrame);
    await finish();
    const after = {
      height: table.getBoundingClientRect().height,
      y: table.getBoundingClientRect().y,
      scroll: window.scrollY,
      columns: columns(),
      colors: colors(),
    };
    const retained = child.isConnected && child.firstElementChild?.firstElementChild === identity;
    const hidden = child.hidden;
    // Native row separators must also end at the last visible row after collapsing the final group.
    table.closest('.leaf-table')?.classList.remove('leaf-table--striped');
    for (const button of table.querySelectorAll<HTMLButtonElement>('button[aria-expanded="true"]'))
      button.click();
    await new Promise(requestAnimationFrame);
    await finish();
    const lastVisible = Array.from(table.tBodies[0]?.rows ?? [])
      .filter((row) => !row.hidden)
      .at(-1);
    const finalDivider = getComputedStyle(
      lastVisible?.cells[0] as HTMLTableCellElement,
    ).borderBottomWidth;
    return {
      before,
      middle,
      reverse,
      restored,
      after,
      retained,
      hidden,
      inaccessibleWhileClosing,
      finalDivider,
    };
  });
  expect(result.middle).toBeLessThan(result.before.height);
  expect(result.middle).toBeGreaterThan(result.after.height);
  expect(result.reverse).toBeLessThan(result.before.height);
  expect(Math.abs(result.restored - result.before.height)).toBeLessThan(1);
  expect(result.after.columns).toEqual(result.before.columns);
  expect(result.after.colors).toEqual(result.before.colors);
  expect(Math.abs(result.after.y - result.before.y)).toBeLessThan(1);
  expect(result.after.scroll).toBe(result.before.scroll);
  expect(result.retained).toBe(true);
  expect(result.hidden).toBe(true);
  expect(result.inaccessibleWhileClosing).toBe(true);
  expect(result.finalDivider).toBe('0px');
});

test('group collapse respects reduced motion while retaining child content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const table = page.getByRole('table', { name: 'Members grouped by team', exact: true });
  const result = await table.evaluate(async (node) => {
    const trigger = node.querySelector<HTMLButtonElement>('button[aria-expanded]');
    if (!trigger) throw new Error('Missing group trigger');
    const child = trigger.closest('tr')?.nextElementSibling as HTMLTableRowElement;
    const content = child.firstElementChild?.firstElementChild;
    trigger.click();
    await new Promise(requestAnimationFrame);
    const immediate = child.hidden;
    const animations = node.getAnimations({ subtree: true }).length;
    trigger.click();
    await new Promise(requestAnimationFrame);
    return {
      immediate,
      animations,
      retained: child.firstElementChild?.firstElementChild === content,
      restored: !child.hidden,
    };
  });
  expect(result).toEqual({ immediate: true, animations: 0, retained: true, restored: true });
});
