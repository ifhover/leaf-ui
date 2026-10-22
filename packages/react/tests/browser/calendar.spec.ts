import { expect, type Locator, test } from '@playwright/test';

async function uniqueColumns(cells: Locator) {
  return cells.evaluateAll((nodes) => {
    const positions = nodes.map((node) => Math.round(node.getBoundingClientRect().left));
    return new Set(positions).size;
  });
}

async function expectBorderlessDays(calendar: Locator, shadowless = true) {
  const styles = await calendar.locator('.leaf-date-picker__day').evaluateAll((nodes) =>
    nodes.map((node) => {
      const style = getComputedStyle(node);
      return {
        borderBlockEnd: style.borderBlockEndWidth,
        borderBlockStart: style.borderBlockStartWidth,
        borderInlineEnd: style.borderInlineEndWidth,
        borderInlineStart: style.borderInlineStartWidth,
        boxShadow: style.boxShadow,
      };
    }),
  );
  expect(styles.length).toBeGreaterThan(0);
  expect(
    styles.every(
      (style) =>
        style.borderBlockEnd === '0px' &&
        style.borderBlockStart === '0px' &&
        style.borderInlineEnd === '0px' &&
        style.borderInlineStart === '0px' &&
        (!shadowless || style.boxShadow === 'none'),
    ),
  ).toBe(true);
}

async function expectNoVisibleDayBorders(calendar: Locator) {
  const colors = await calendar.locator('.leaf-date-picker__day').evaluateAll((nodes) =>
    nodes.flatMap((node) => {
      const style = getComputedStyle(node);
      return [
        style.borderBlockEndColor,
        style.borderBlockStartColor,
        style.borderInlineEndColor,
        style.borderInlineStartColor,
      ];
    }),
  );
  expect(colors.length).toBeGreaterThan(0);
  expect(colors.every((color) => color === 'transparent' || color === 'rgba(0, 0, 0, 0)')).toBe(
    true,
  );
}

for (const theme of ['light', 'dark'] as const) {
  for (const rtl of [false, true]) {
    test(`full calendar is borderless, aligned and stateful: ${theme}, ${rtl ? 'RTL' : 'LTR'}`, async ({
      page,
    }) => {
      await page.goto(`/?fixture=calendar&theme=${theme}${rtl ? '&rtl=1' : ''}`);
      const calendar = page.getByRole('region', { name: 'Full calendar', exact: true });
      await expect(calendar).toBeVisible();
      await expect(calendar).toHaveCSS('direction', rtl ? 'rtl' : 'ltr');
      await expectBorderlessDays(calendar);
      expect(await uniqueColumns(calendar.locator('.leaf-date-picker__day'))).toBe(7);

      const selected = calendar.locator('.leaf-date-picker__day--selected');
      await expect(selected).toHaveCount(1);
      const selectedState = await selected.evaluate((node) => {
        const label = node.querySelector<HTMLElement>('.leaf-calendar__cell-label');
        if (!label) throw new Error('Missing selected date label');
        const cellStyle = getComputedStyle(node);
        const labelStyle = getComputedStyle(label);
        const box = label.getBoundingClientRect();
        return {
          backgroundColor: cellStyle.backgroundColor,
          labelBackground: labelStyle.backgroundColor,
          labelHeight: box.height,
          labelRadius: labelStyle.borderRadius,
          labelWidth: box.width,
        };
      });
      expect(selectedState.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(selectedState.labelBackground).not.toBe('rgba(0, 0, 0, 0)');
      expect(selectedState.labelRadius).toBe('999px');
      expect(Math.abs(selectedState.labelWidth - selectedState.labelHeight)).toBeLessThan(1);

      const today = calendar.locator('[aria-current="date"]');
      await expect(today).toHaveCount(1);
      const todayMarker = await today.locator('.leaf-calendar__cell-label').evaluate((node) => {
        const marker = getComputedStyle(node, '::after');
        return {
          backgroundColor: marker.backgroundColor,
          borderRadius: marker.borderRadius,
          content: marker.content,
          height: marker.height,
          width: marker.width,
        };
      });
      expect(todayMarker.content).not.toBe('none');
      expect(todayMarker.width).toBe('3px');
      expect(todayMarker.height).toBe('3px');
      expect(todayMarker.borderRadius).toBe('50%');
      expect(todayMarker.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');

      await expect(calendar.getByText('Design review', { exact: true })).toHaveCSS(
        'font-size',
        '11px',
      );
    });
  }
}

test('month and year views use open four- and three-column grids', async ({ page }) => {
  await page.goto('/?fixture=calendar');
  const calendar = page.getByRole('region', { name: 'Full calendar', exact: true });
  await calendar.getByRole('button', { name: 'Month', exact: true }).click();
  await expect(calendar.locator('.leaf-calendar')).toHaveAttribute('data-view', 'month');
  expect(await uniqueColumns(calendar.locator('.leaf-date-picker__day'))).toBe(4);
  await expectBorderlessDays(calendar);

  await calendar.getByRole('button', { name: 'Year', exact: true }).click();
  await expect(calendar.locator('.leaf-calendar')).toHaveAttribute('data-view', 'year');
  expect(await uniqueColumns(calendar.locator('.leaf-date-picker__day'))).toBe(3);
  await expectBorderlessDays(calendar);
});

test('dark RTL calendar keeps seven columns without horizontal overflow at 375px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/?fixture=calendar&theme=dark&rtl=1');
  const calendar = page.getByRole('region', { name: 'Full calendar', exact: true });
  await expect(calendar).toHaveCSS('direction', 'rtl');
  expect(await uniqueColumns(calendar.locator('.leaf-date-picker__day'))).toBe(7);
  await expectBorderlessDays(calendar);
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  const cells = await calendar
    .locator('.leaf-date-picker__day')
    .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
  expect(Math.min(...cells)).toBeGreaterThan(30);
});

test('date and date-time popup calendars retain the compact borderless grid', async ({ page }) => {
  await page.goto('/?fixture=calendar');
  await expectBorderlessDays(page.getByRole('region', { name: 'Compact calendar', exact: true }));
  for (const name of ['Date popup', 'Date time popup', 'Date range popup']) {
    await page.getByRole('combobox', { name, exact: true }).click();
    const panel = page
      .locator('.leaf-floating')
      .filter({ has: page.locator('.leaf-calendar') })
      .last();
    await expect(panel).toBeVisible();
    await expect(panel.locator('.leaf-calendar-view--full')).toHaveCount(0);
    await expectNoVisibleDayBorders(panel);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  }
});
