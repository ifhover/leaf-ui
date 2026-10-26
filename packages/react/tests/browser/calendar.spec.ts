import { expect, type Locator, test } from '@playwright/test';

async function uniqueColumns(cells: Locator) {
  return cells.evaluateAll((nodes) => {
    const positions = nodes.map((node) => Math.round(node.getBoundingClientRect().left));
    return new Set(positions).size;
  });
}

for (const theme of ['light', 'dark'] as const) {
  for (const rtl of [false, true]) {
    test(`full calendar uses a hairline month grid and solid selection: ${theme}, ${rtl ? 'RTL' : 'LTR'}`, async ({
      page,
    }) => {
      await page.goto(`/?fixture=calendar&theme=${theme}${rtl ? '&rtl=1' : ''}`);
      const calendar = page.getByRole('region', { name: 'Full calendar', exact: true });
      await expect(calendar).toBeVisible();
      await expect(calendar).toHaveCSS('direction', rtl ? 'rtl' : 'ltr');
      const days = calendar.locator('.leaf-calendar-view__day');
      expect(await uniqueColumns(days)).toBe(7);

      // Cells are separated by shared divider hairlines, not individual frames.
      const divider = await calendar.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-calendar-view-line').trim(),
      );
      expect(divider).not.toBe('');
      const lines = await calendar
        .locator('.leaf-calendar-view__cell + .leaf-calendar-view__cell')
        .first()
        .evaluate((node) => getComputedStyle(node).borderInlineStartWidth);
      expect(lines).toBe('1px');
      // Hairlines must remain distinguishable from the calendar surface in both themes.
      const paint = await calendar.evaluate((node) => {
        const cell = node.querySelector('.leaf-calendar-view__cell + .leaf-calendar-view__cell');
        return {
          line: cell ? getComputedStyle(cell).borderInlineStartColor : '',
          surface: getComputedStyle(node).backgroundColor,
        };
      });
      expect(paint.line).not.toBe(paint.surface);
      const dayBorders = await days.evaluateAll((nodes) =>
        nodes.every((node) => getComputedStyle(node).borderTopWidth === '0px'),
      );
      expect(dayBorders).toBe(true);

      const selected = calendar.locator('[role="gridcell"][aria-selected="true"]');
      await expect(selected).toHaveCount(1);
      const state = await selected.evaluate((cell, isRtl) => {
        const day = cell.querySelector<HTMLElement>('.leaf-calendar-view__day');
        const label = cell.querySelector<HTMLElement>('.leaf-calendar-view__number');
        if (!day || !label) throw new Error('Missing selected day');
        const dayBox = day.getBoundingClientRect();
        const box = label.getBoundingClientRect();
        return {
          labelBackground: getComputedStyle(label).backgroundColor,
          labelRadius: getComputedStyle(label).borderRadius,
          height: box.height,
          width: box.width,
          // Numerals sit at the inline end edge, like desktop calendar apps.
          endGap: isRtl ? box.left - dayBox.left : dayBox.right - box.right,
          topGap: box.top - dayBox.top,
        };
      }, rtl);
      expect(state.labelBackground).not.toBe('rgba(0, 0, 0, 0)');
      // A disc for ordinary numerals; the first of a month widens it to a pill ("Oct 1").
      expect(state.labelRadius).toBe('999px');
      expect(state.height).toBe(26);
      expect(state.width).toBeGreaterThanOrEqual(state.height);
      expect(state.endGap).toBeLessThan(10);
      expect(state.topGap).toBeLessThan(10);

      // Today is marked by primary ink only, so it never competes with the selected disc.
      const today = calendar.locator('[aria-current="date"] .leaf-calendar-view__number');
      await expect(today).toHaveCount(1);
      await expect(today).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(calendar.getByText('Design review', { exact: true })).toHaveCSS(
        'font-size',
        '12px',
      );
      // Tags become full-width event bars inside the cell.
      const event = calendar.locator('.leaf-calendar-view__content > .leaf-tag');
      const [eventWidth, contentWidth] = await event.evaluate((node) => [
        node.getBoundingClientRect().width,
        (node.parentElement as HTMLElement).getBoundingClientRect().width,
      ]);
      expect(eventWidth).toBeCloseTo(contentWidth, 0);
    });
  }
}

test('full calendar keyboard, toolbar and year overview', async ({ page }) => {
  await page.goto('/?fixture=calendar');
  const calendar = page.getByRole('region', { name: 'Full calendar', exact: true });
  const grid = calendar.getByRole('grid');
  const title = await grid.getAttribute('aria-labelledby');
  const label = async () =>
    page.evaluate((id) => document.getElementById(id ?? '')?.textContent ?? '', title);
  const initial = await label();

  await calendar.locator('[data-active="true"]').focus();
  await page.keyboard.press('PageDown');
  await expect.poll(label).not.toBe(initial);
  await expect(calendar.locator('[data-active="true"]')).toBeFocused();
  await calendar.getByRole('button', { name: 'Today', exact: true }).click();
  await expect.poll(label).toBe(initial);

  await calendar.getByRole('button', { name: 'Year', exact: true }).click();
  await expect(calendar).toHaveAttribute('data-view', 'months');
  const months = calendar.locator('.leaf-calendar-view__month');
  await expect(months).toHaveCount(12);
  expect(await uniqueColumns(months)).toBe(4);
  await expect(months.first().locator('.leaf-calendar-view__mini-day').first()).toBeAttached();
  await months.nth(2).click();
  await expect(calendar).toHaveAttribute('data-view', 'days');
  await expect(calendar.locator('[data-active="true"]')).toBeFocused();
});

test('dark RTL calendar keeps seven columns without horizontal overflow at 375px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/?fixture=calendar&theme=dark&rtl=1');
  const calendar = page.getByRole('region', { name: 'Full calendar', exact: true });
  await expect(calendar).toHaveCSS('direction', 'rtl');
  const days = calendar.locator('.leaf-calendar-view__day');
  expect(await uniqueColumns(days)).toBe(7);
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  const widths = await days.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().width),
  );
  expect(Math.min(...widths)).toBeGreaterThan(30);
  // Narrow layouts center numerals and switch to narrow weekday names.
  await expect(calendar.locator('.leaf-calendar-view__weekday-narrow').first()).toBeVisible();
  await expect(calendar.locator('.leaf-calendar-view__weekday-short').first()).toBeHidden();
  // Dotted Tags collapse to their event dot while keeping the label as the day description.
  const event = calendar.locator('.leaf-calendar-view__content > .leaf-tag');
  await expect(event).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(event.locator('.leaf-tag__dot')).toBeVisible();
  await expect(calendar.getByRole('button', { description: 'Release' })).toHaveCount(1);
});

test('compact calendar uses circular targets and a title month picker', async ({ page }) => {
  await page.goto('/?fixture=calendar');
  const calendar = page.getByRole('region', { name: 'Compact calendar', exact: true });
  const box = await calendar.boundingBox();
  expect(box?.width).toBe(296);
  const selected = calendar.locator(
    '[role="gridcell"][aria-selected="true"] .leaf-calendar-view__number',
  );
  await expect(selected).toHaveCSS('border-radius', '999px');
  const size = await selected.boundingBox();
  expect(size?.width).toBe(30);
  expect(size?.height).toBe(30);
  // The title is a disclosure button: it keeps focus and exposes the expanded state.
  const toggle = calendar.locator('.leaf-calendar-view__title--toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(calendar).toHaveAttribute('data-view', 'months');
  expect(await uniqueColumns(calendar.locator('.leaf-calendar-view__month'))).toBe(3);
  await expect(calendar.locator('.leaf-calendar-view__month[tabindex="0"]')).toHaveCount(1);
});

test('date and date-time popup calendars keep their own picker panel', async ({ page }) => {
  await page.goto('/?fixture=calendar');
  for (const name of ['Date popup', 'Date time popup', 'Date range popup']) {
    await page.getByRole('combobox', { name, exact: true }).click();
    const panel = page
      .locator('.leaf-floating')
      .filter({ has: page.locator('.leaf-calendar') })
      .last();
    await expect(panel).toBeVisible();
    await expect(panel.locator('.leaf-calendar-view')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  }
});
