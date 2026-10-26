import { expect, type Locator, test } from '@playwright/test';

for (const suffix of ['', '&theme=dark&rtl=1', '&mobile=1']) {
  test(`field defaults stay stable before and after selection ${suffix || 'desktop'}`, async ({
    page,
  }) => {
    if (suffix.includes('mobile')) await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(`/?fixture=picker-surfaces&refinements${suffix}`);
    for (const [name, width] of [
      ['Width input', 240],
      ['Width number', 240],
      ['Width search', 240],
      ['Width select', 240],
      ['Width cascader', 240],
      ['Width tree', 240],
      ['Width autocomplete', 240],
      ['Card date', 240],
      ['Card date time', 240],
      ['Card time', 240],
      ['Card time range', 240],
      ['Card date range', 300],
      ['Card date time range', 380],
      ['Explicit width', 320],
      ['Narrow container', 180],
      ['Form input', 320],
      ['Form number', 320],
      ['Form tree', 320],
      ['Form range', 320],
      ['Form extended range', 320],
    ] as const) {
      const field = page.getByRole(
        name.includes('number') || name === 'Width number'
          ? 'spinbutton'
          : name.includes('input') ||
              name === 'Explicit width' ||
              name === 'Narrow container' ||
              name === 'Width search'
            ? 'textbox'
            : 'combobox',
        { name, exact: true },
      );
      const box = await field.evaluate((node) => {
        const root =
          node.closest('.leaf-input-search') ??
          node.closest(
            '.leaf-input, .leaf-input-number, .leaf-select, .leaf-tree-select, .leaf-autocomplete, .leaf-cascader, .leaf-date-picker',
          );
        return root?.getBoundingClientRect().width ?? 0;
      });
      const available = await page
        .locator('.picker-surfaces-fixture')
        .evaluate((node) => node.clientWidth);
      expect(box, name).toBeCloseTo(Math.min(width, available), 0);
    }
    const select = page.getByRole('combobox', { name: 'Width select', exact: true });
    const before = await select.evaluate(
      (node) => node.closest('.leaf-select')?.getBoundingClientRect().width,
    );
    await select.click();
    await page.getByRole('option', { name: /^A much longer selected/ }).click();
    expect(
      await select.evaluate((node) => node.closest('.leaf-select')?.getBoundingClientRect().width),
    ).toBe(before);
    for (const label of [
      'Card date',
      'Card date time',
      'Card date range',
      'Card date time range',
      'Card time',
      'Card time range',
    ]) {
      const input = page.getByRole('combobox', { name: label, exact: true });
      const root = input.locator('..');
      const width = (await root.boundingBox())?.width;
      await input.click();
      await input.press('ControlOrMeta+A');
      await input.press('Delete');
      await input.press('Escape');
      expect((await root.boundingBox())?.width, label).toBe(width);
    }
    expect(
      await page
        .getByRole('textbox', { name: 'Full textarea' })
        .evaluate((node) => node.getBoundingClientRect().width),
    ).toBeCloseTo(320, 0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);
  });

  test(`range card segments, gapless cells and week hover ${suffix || 'desktop'}`, async ({
    page,
  }, testInfo) => {
    if (suffix.includes('mobile')) await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(`/?fixture=picker-surfaces&refinements${suffix}`);
    for (const name of ['Card date', 'Month gaps', 'Quarter gaps', 'Year gaps']) {
      const input = page.getByRole('combobox', { name, exact: true });
      await input.click();
      const panel = page.locator('.leaf-picker-panel[data-state="open"]');
      await expect(panel).toHaveCSS('scale', '1');
      const grid = panel.locator('.leaf-calendar__cells');
      await expect(grid).toHaveCSS('gap', '0px');
      for (const cell of await grid.locator('.leaf-calendar__cell').all()) {
        await expect(cell).toHaveCSS('padding', '0px');
        const button = cell.getByRole('button');
        expect((await button.boundingBox())?.width).toBeCloseTo(
          (await cell.boundingBox())?.width ?? 0,
          0,
        );
      }
      await input.press('Escape');
    }
    const week = page.getByRole('combobox', { name: 'Week hover', exact: true });
    await week.click();
    let panel = page.locator('.leaf-picker-panel[data-state="open"]');
    await panel.getByRole('button', { name: '2026-10-14', exact: true }).hover();
    const hovered = panel.locator('.leaf-calendar__cell--week-hover');
    await expect(hovered).toHaveCount(7);
    for (const day of await hovered.getByRole('button').all()) {
      await expect(day).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.04)');
      await expect(day).toHaveCSS('box-shadow', 'none');
    }
    await panel.screenshot({ path: testInfo.outputPath('week-hover.png') });
    await week.press('Escape');
    const range = page.getByRole('combobox', { name: 'Card date range', exact: true });
    await range.click();
    panel = page.locator('.leaf-picker-panel[data-state="open"]');
    const segments = panel.locator('.leaf-range-panel__endpoints');
    expect((await segments.boundingBox())?.width).toBeLessThan(230);
    await expect(segments.getByRole('button', { name: 'Start', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await range.press('ControlOrMeta+A');
    await range.press('Delete');
    await range.press('Escape');
    await range.click();
    await panel.getByRole('button', { name: '2026-10-16', exact: true }).click();
    await panel.getByRole('button', { name: '2026-10-21', exact: true }).hover();
    await expect(panel.locator('.leaf-date-picker__day--preview')).toHaveCSS('box-shadow', 'none');
    await panel.screenshot({ path: testInfo.outputPath('range-card.png') });
    await range.press('Escape');
  });
}

test('long time formats have stable wider defaults without clipping the value', async ({
  page,
}) => {
  await page.goto('/?fixture=picker-surfaces&seconds&12h');
  for (const [name, width] of [
    ['Card date time', 280],
    ['Card date time range', 440],
    ['Card time range', 300],
  ] as const) {
    const input = page.getByRole('combobox', { name, exact: true });
    const root = input.locator('..');
    expect((await root.boundingBox())?.width).toBeCloseTo(width, 0);
    expect(await input.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(
      1,
    );
    await input.click();
    await input.press('ControlOrMeta+A');
    await input.press('Delete');
    await input.press('Escape');
    expect((await root.boundingBox())?.width).toBeCloseTo(width, 0);
  }
});

test('composite search fields keep filling their own containers', async ({ page }) => {
  await page.goto('/?fixture=picker-surfaces&internal-widths');
  const fillsContainer = async (root: Locator) => {
    const metrics = await root.evaluate((node) => {
      const parent = node.parentElement;
      if (!parent) throw new Error('Missing search container');
      const style = getComputedStyle(parent);
      return {
        width: (node as HTMLElement).offsetWidth,
        available:
          parent.clientWidth -
          Number.parseFloat(style.paddingLeft) -
          Number.parseFloat(style.paddingRight),
      };
    });
    expect(metrics.width).toBeGreaterThan(240);
    expect(metrics.width).toBeCloseTo(metrics.available, 0);
  };
  const transferSearches = page.locator('.leaf-transfer__search > .leaf-input');
  await expect(transferSearches).toHaveCount(2);
  for (const input of await transferSearches.all()) {
    await fillsContainer(input);
  }
  await page.getByRole('combobox', { name: 'Internal cascade' }).click();
  await fillsContainer(page.locator('.leaf-cascader__search > .leaf-input'));
  await page.keyboard.press('Escape');
});
