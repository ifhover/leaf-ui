import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

const profiles = [
  { width: 1280, appearance: 'light' },
  { width: 375, appearance: 'dark' },
] as const;

async function openExamples(
  page: Page,
  english: boolean,
  { width, appearance }: (typeof profiles)[number],
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: appearance, reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
  await page.goto(`${english ? '/en' : ''}/components/table.html`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const root = page.locator('html');
  if (Boolean((await root.getAttribute('class'))?.includes('dark')) !== (appearance === 'dark')) {
    await page
      .getByRole('button', {
        name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
      })
      .first()
      .click();
  }
  await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
  await expect(page.locator('.leaf-component-example__preview')).toHaveCount(13);
  return {
    errors,
    preview: (zh: string, en: string) =>
      page
        .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
        .locator('.leaf-component-example__preview'),
  };
}

async function expectLayout(page: Page) {
  const previews = await page
    .locator('.leaf-component-example__preview-content')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const preview = node.closest('.leaf-component-example__preview');
        if (!preview) throw new Error('Missing table example preview');
        const inner = node.getBoundingClientRect();
        const outer = preview.getBoundingClientRect();
        return {
          centered: Math.abs(inner.left + inner.width / 2 - (outer.left + outer.width / 2)) < 1,
          contained: inner.left >= outer.left - 1 && inner.right <= outer.right + 1,
          overflow: node.scrollWidth - node.clientWidth,
        };
      }),
    );
  for (const preview of previews) {
    expect(preview.centered).toBe(true);
    expect(preview.contained).toBe(true);
    expect(preview.overflow).toBeLessThanOrEqual(1);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}

const rowIds = (table: Locator) =>
  table
    .locator('tbody tr[data-row-id]')
    .evaluateAll((rows) => rows.map((row) => row.getAttribute('data-row-id')));

const viewport = (table: Locator) =>
  table.locator('xpath=ancestor::*[contains(@class, "leaf-table__viewport")][1]');

for (const english of [false, true]) {
  for (const profile of profiles) {
    const suffix = `${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`;

    test(`Table selection, search, visibility, and pagination examples: ${suffix}`, async ({
      page,
    }, testInfo) => {
      const { preview, errors } = await openExamples(page, english, profile);
      const selection = preview('行选择', 'Row selection');
      const table = selection.getByRole('table');
      const alex = table.getByRole('checkbox', {
        name: english ? 'Select row: Alex Morgan' : '选择行: Alex Morgan',
        exact: true,
      });
      const all = table.getByRole('checkbox', {
        name: english ? 'Select all rows on this page' : '选择本页所有行',
        exact: true,
      });
      const clear = selection.getByRole('button', {
        name: english ? 'Clear selection' : '清空选择',
        exact: true,
      });
      await expect(clear).toBeDisabled();
      await alex.check();
      await expect(alex).toBeChecked();
      await expect(all).toHaveJSProperty('indeterminate', true);
      await expect(selection.locator('.leaf-text')).toContainText(/1/);
      await all.check();
      await expect(selection.locator('.leaf-text')).toContainText(/3/);
      await expect(table.locator('tbody input:checked')).toHaveCount(3);
      await selection.screenshot({ path: testInfo.outputPath('table-selection-all.png') });
      await clear.click();
      await expect(table.locator('input:checked')).toHaveCount(0);
      await expect(clear).toBeDisabled();

      const search = preview('搜索与列管理', 'Search and column controls');
      const members = search.getByRole('table');
      const next = search.getByRole('button', {
        name: english ? 'Next page' : '下一页',
        exact: true,
      });
      await expect
        .poll(() => rowIds(members))
        .toEqual(['member-1', 'member-2', 'member-3', 'member-4', 'member-5']);
      await next.click();
      await expect
        .poll(() => rowIds(members))
        .toEqual(['member-6', 'member-7', 'member-8', 'member-9', 'member-10']);
      const input = search.getByRole('textbox', {
        name: english ? 'Search table' : '搜索表格',
        exact: true,
      });
      await input.fill('Alex');
      await expect
        .poll(() => rowIds(members))
        .toEqual(['member-1', 'member-4', 'member-7', 'member-10', 'member-13']);
      await next.click();
      await expect
        .poll(() => rowIds(members))
        .toEqual(['member-16', 'member-19', 'member-22', 'member-25']);
      await expect(next).toBeDisabled();
      await input.fill('');
      await expect(members.locator('tbody tr[data-row-id]')).toHaveCount(5);
      const columns = search.getByRole('button', {
        name: english ? 'Columns' : '显示列',
        exact: true,
      });
      await columns.click();
      const popup = page.getByRole('dialog', { name: english ? 'Columns' : '显示列', exact: true });
      await expect(
        popup.getByRole('checkbox', { name: english ? 'Member' : '成员', exact: true }),
      ).toBeDisabled();
      const team = popup.getByRole('checkbox', { name: english ? 'Team' : '团队', exact: true });
      await team.uncheck();
      await expect(
        members.getByRole('columnheader', { name: english ? 'Team' : '团队', exact: true }),
      ).toHaveCount(0);
      await popup.screenshot({ path: testInfo.outputPath('table-column-visibility.png') });
      await team.check();
      await popup.press('Escape');
      await expect(popup).toBeHidden();
      await expect(columns).toBeFocused();
      await search.screenshot({ path: testInfo.outputPath('table-search-and-columns.png') });
      await expectLayout(page);
      expect(errors).toEqual([]);
    });

    test(`Table grouping, editing, and row-column reorder examples: ${suffix}`, async ({
      page,
    }, testInfo) => {
      const { preview, errors } = await openExamples(page, english, profile);
      const grouping = preview('分组与聚合', 'Grouping and aggregation');
      const grouped = grouping.getByRole('table');
      const visibleRows = grouped.locator('tbody > tr[data-row-id]:not([hidden])');
      await expect(visibleRows).toHaveCount(10);
      await expect(grouped.getByText(english ? /Total:\s*16/ : /合计:\s*16/)).toBeVisible();
      await expect(grouped.getByText(english ? /Total:\s*20/ : /合计:\s*20/)).toBeVisible();
      const group = grouped.locator('button[aria-expanded]').first();
      await group.click();
      await expect(group).toHaveAttribute('aria-expanded', 'false');
      await expect(visibleRows).toHaveCount(6);
      await grouping.screenshot({ path: testInfo.outputPath('table-group-collapsed.png') });
      await group.press('Enter');
      await expect(visibleRows).toHaveCount(10);

      const editing = preview('编辑单元格', 'Editable cells');
      const first = editing.getByRole('textbox', {
        name: english ? 'Name: 1' : '姓名: 1',
        exact: true,
      });
      await first.fill(english ? 'Updated Alex' : '更新后的 Alex');
      await first.press('Tab');
      await expect(first).toHaveValue(english ? 'Updated Alex' : '更新后的 Alex');
      await expect(
        editing.getByRole('textbox', { name: english ? 'Name: 2' : '姓名: 2', exact: true }),
      ).toHaveValue('Sam');
      await editing.screenshot({ path: testInfo.outputPath('table-edited-cell.png') });

      const ordering = preview('行和列重排', 'Row and column reordering');
      const reordered = ordering.getByRole('table');
      const rowHandle = reordered.getByRole('button', {
        name: english ? 'Reorder row: Alex Morgan' : '移动行: Alex Morgan',
        exact: true,
      });
      await rowHandle.focus();
      await rowHandle.press('Space');
      await expect(reordered.locator('tr[data-dragging]')).toHaveAttribute('data-row-id', 'alex');
      await page.keyboard.press('ArrowDown');
      await expect(
        page
          .getByRole('status')
          .filter({ hasText: english ? 'Move to Sam Taylor' : '移至 Sam Taylor' }),
      ).toBeVisible();
      await page.keyboard.press('Space');
      await expect.poll(() => rowIds(reordered)).toEqual(['sam', 'alex', 'jordan']);
      const column = reordered.getByRole('button', {
        name: english ? 'Reorder column: Member' : '移动列: 成员',
        exact: true,
      });
      await column.focus();
      await column.press('Space');
      await expect(reordered.locator('th[data-dragging]')).toContainText(
        english ? 'Member' : '成员',
      );
      await page.keyboard.press('ArrowRight');
      await expect(
        page.getByRole('status').filter({ hasText: english ? 'Move to Team' : '移至 团队' }),
      ).toBeVisible();
      await page.keyboard.press('Space');
      await expect(reordered.locator('th').nth(1)).toContainText(english ? 'Team' : '团队');
      await expect(reordered).not.toHaveAttribute('role', 'grid');
      await settleAnimations(ordering);
      await ordering.screenshot({ path: testInfo.outputPath('table-reordered-rows-columns.png') });
      await expectLayout(page);
      expect(errors).toEqual([]);
    });

    test(`Table pointer column resize hit area: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, english, profile);
      const sizing = preview('固定列与列宽调整', 'Pinning and resizing');
      const pinned = sizing.getByRole('table');
      const handle = pinned.getByRole('separator', {
        name: english ? 'Resize column: Member' : '调整列宽: 成员',
        exact: true,
      });
      await handle.scrollIntoViewIfNeeded();
      await expect
        .poll(() => handle.evaluate((node) => node.getBoundingClientRect().height))
        .toBeGreaterThan(0);
      expect(
        await handle.evaluate((node) => {
          const box = node.getBoundingClientRect();
          const target = document.elementFromPoint(
            box.left + box.width / 2,
            box.top + box.height / 2,
          );
          return target === node || (target !== null && node.contains(target));
        }),
      ).toBe(true);
      const box = await handle.boundingBox();
      if (!box) throw new Error('Missing column resize handle');
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 40, box.y + box.height / 2);
      await page.mouse.up();
      await expect
        .poll(async () => Number(await handle.getAttribute('aria-valuenow')))
        .toBeGreaterThan(200);
      await sizing.screenshot({ path: testInfo.outputPath('table-pointer-column-resized.png') });
      await expectLayout(page);
      expect(errors).toEqual([]);
    });

    test(`Table keyboard resizing, pinning, and ten-thousand virtual rows examples: ${suffix}`, async ({
      page,
    }, testInfo) => {
      const { preview, errors } = await openExamples(page, english, profile);
      const sizing = preview('固定列与列宽调整', 'Pinning and resizing');
      const pinned = sizing.getByRole('table');
      const handle = pinned.getByRole('separator', {
        name: english ? 'Resize column: Member' : '调整列宽: 成员',
        exact: true,
      });
      await handle.scrollIntoViewIfNeeded();
      await handle.press('Home');
      await expect(handle).toHaveAttribute('aria-valuenow', '160');
      await handle.press('End');
      await expect(handle).toHaveAttribute('aria-valuenow', '320');
      await sizing
        .getByRole('button', { name: english ? 'Reset widths' : '重置列宽', exact: true })
        .click();
      await expect(handle).toHaveAttribute('aria-valuenow', '200');
      const scroll = viewport(pinned);
      const start = pinned.locator('thead th[data-pinned="start"]');
      const end = pinned.locator('thead th[data-pinned="end"]');
      await scroll.scrollIntoViewIfNeeded();
      await expect(start).toHaveCSS('position', profile.width === 375 ? 'relative' : 'sticky');
      await expect(end).toHaveCSS('position', profile.width === 375 ? 'relative' : 'sticky');
      const beforeOffset = await scroll.evaluate((node) => node.scrollLeft);
      const before = { start: await start.boundingBox(), end: await end.boundingBox() };
      await scroll.evaluate((node) => {
        node.scrollLeft = node.scrollWidth;
      });
      if (profile.width === 375)
        await expect.poll(() => scroll.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
      const scrollDelta = (await scroll.evaluate((node) => node.scrollLeft)) - beforeOffset;
      const after = { start: await start.boundingBox(), end: await end.boundingBox() };
      const movement = profile.width === 375 ? scrollDelta : 0;
      expect(after.start?.x).toBeCloseTo((before.start?.x ?? 0) - movement, 0);
      expect(after.end?.x).toBeCloseTo((before.end?.x ?? 0) - movement, 0);
      await sizing.screenshot({ path: testInfo.outputPath('table-pinned-resized-reset.png') });

      const virtual = preview('虚拟滚动', 'Virtual scrolling');
      const large = virtual.getByRole('table');
      await expect(large).toHaveAttribute('aria-rowcount', '10001');
      await expect(large.locator('tbody tr[data-row-id]')).not.toHaveCount(0);
      expect(await large.locator('tbody tr[data-row-id]').count()).toBeLessThan(60);
      const listViewport = viewport(large);
      // Measurements may change the total height after newly mounted rows render.
      await expect
        .poll(() =>
          listViewport.evaluate(async (node) => {
            node.scrollTop = node.scrollHeight;
            await new Promise<void>((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
            );
            const row = node.querySelector('tr[data-row-id="10000"]');
            const header = node.querySelector('thead');
            if (!row || !header) return false;
            const visible = node.getBoundingClientRect();
            const item = row.getBoundingClientRect();
            const sticky = header.getBoundingClientRect();
            return (
              item.height > 0 &&
              item.top >= Math.max(visible.top, sticky.bottom) - 1 &&
              item.bottom <= visible.bottom + 1
            );
          }),
        )
        .toBe(true);
      expect(await large.locator('tbody tr[data-row-id]').count()).toBeLessThan(60);
      await virtual.screenshot({ path: testInfo.outputPath('table-virtual-last-row.png') });
      await expectLayout(page);
      expect(errors).toEqual([]);
    });

    test(`Table empty-loading-error and server retry examples: ${suffix}`, async ({
      page,
    }, testInfo) => {
      const { preview, errors } = await openExamples(page, english, profile);
      const states = preview('空数据、加载和错误', 'Empty, loading, and error');
      const table = states.getByRole('table');
      await expect(
        table.getByText(english ? 'No data' : '暂无数据', { exact: true }),
      ).toBeVisible();
      await states
        .getByRole('button', { name: english ? 'Loading' : '加载中', exact: true })
        .click();
      await expect(table).toHaveAttribute('aria-busy', 'true');
      await states.screenshot({ path: testInfo.outputPath('table-loading.png') });
      await states
        .getByRole('button', { name: english ? 'Error' : '加载失败', exact: true })
        .click();
      await expect(table.getByRole('alert')).toContainText(
        english ? 'Unable to load members' : '成员加载失败',
      );
      await states.screenshot({ path: testInfo.outputPath('table-error.png') });
      await table.getByRole('button', { name: english ? 'Retry' : '重试', exact: true }).click();
      await expect(table.getByRole('alert')).toHaveCount(0);
      await expect(
        table.getByText(english ? 'No data' : '暂无数据', { exact: true }),
      ).toBeVisible();

      const remote = preview('服务端排序与分页', 'Server sorting and pagination');
      const server = remote.getByRole('table');
      await expect.poll(() => rowIds(server)).toEqual(['1', '2', '3', '4', '5']);
      await remote
        .getByRole('button', { name: english ? 'Next page' : '下一页', exact: true })
        .click();
      await expect(server).toHaveAttribute('aria-busy', 'true');
      await expect.poll(() => rowIds(server)).toEqual(['6', '7', '8', '9', '10']);
      await remote
        .getByRole('button', { name: english ? 'Simulate error' : '模拟失败', exact: true })
        .click();
      await expect(server).toHaveAttribute('aria-busy', 'true');
      await expect(server.getByRole('alert')).toContainText(
        english ? 'Unable to load members' : '成员加载失败',
      );
      await remote.screenshot({ path: testInfo.outputPath('table-server-request-error.png') });
      await server.getByRole('button', { name: english ? 'Retry' : '重试', exact: true }).click();
      await expect(server).toHaveAttribute('aria-busy', 'true');
      await expect(server).not.toHaveAttribute('aria-busy');
      await expect.poll(() => rowIds(server)).toEqual(['6', '7', '8', '9', '10']);
      await expect(server.getByRole('alert')).toHaveCount(0);
      await remote.screenshot({ path: testInfo.outputPath('table-server-retried-page-two.png') });
      await expectLayout(page);
      expect(errors).toEqual([]);
    });

    test(`Table error-feedback stays inside the visible viewport: ${suffix}`, async ({
      page,
    }, testInfo) => {
      const { preview, errors } = await openExamples(page, english, profile);
      const remote = preview('服务端排序与分页', 'Server sorting and pagination');
      const server = remote.getByRole('table');
      await expect(server).not.toHaveAttribute('aria-busy');
      await expect.poll(() => rowIds(server)).toEqual(['1', '2', '3', '4', '5']);
      await remote
        .getByRole('button', { name: english ? 'Simulate error' : '模拟失败', exact: true })
        .click();
      await expect(server.getByRole('alert')).toContainText(
        english ? 'Unable to load members' : '成员加载失败',
      );
      await expect(server).not.toHaveAttribute('aria-busy');
      await settleAnimations(remote);
      await remote.scrollIntoViewIfNeeded();
      const geometry = await server.evaluate((node) => {
        const visible = node.closest<HTMLElement>('.leaf-table__viewport');
        const alert = node.querySelector('[role="alert"]');
        const title = alert?.querySelector('.leaf-result__title');
        const icon = alert?.querySelector('.leaf-result__icon');
        const retry = alert?.querySelector('button');
        if (!visible || !title || !icon || !retry)
          throw new Error('Missing table feedback geometry');
        const range = document.createRange();
        range.selectNodeContents(title);
        const bounds = (box: DOMRect) => ({
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
        });
        return {
          viewport: bounds(visible.getBoundingClientRect()),
          scrollLeft: visible.scrollLeft,
          clientWidth: visible.clientWidth,
          scrollWidth: visible.scrollWidth,
          content: [
            { name: 'title text', ...bounds(range.getBoundingClientRect()) },
            { name: 'icon', ...bounds(icon.getBoundingClientRect()) },
            { name: 'retry', ...bounds(retry.getBoundingClientRect()) },
          ],
        };
      });
      await remote.screenshot({ path: testInfo.outputPath('table-error-feedback-viewport.png') });
      await testInfo.attach('table-error-feedback-geometry', {
        body: JSON.stringify(geometry, null, 2),
        contentType: 'application/json',
      });
      await expectLayout(page);
      expect(errors).toEqual([]);
      expect(geometry.scrollLeft).toBe(0);
      for (const content of geometry.content) {
        expect(content.left, `${content.name} left edge`).toBeGreaterThanOrEqual(
          geometry.viewport.left - 1,
        );
        expect(content.right, `${content.name} right edge`).toBeLessThanOrEqual(
          geometry.viewport.right + 1,
        );
        expect(content.top, `${content.name} top edge`).toBeGreaterThanOrEqual(
          geometry.viewport.top - 1,
        );
        expect(content.bottom, `${content.name} bottom edge`).toBeLessThanOrEqual(
          geometry.viewport.bottom + 1,
        );
      }
    });
  }
}
