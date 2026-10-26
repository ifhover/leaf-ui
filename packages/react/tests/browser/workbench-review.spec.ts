import { expect, type Locator, test } from '@playwright/test';

async function rect(locator: Locator) {
  const bounds = await locator.boundingBox();
  if (!bounds) throw new Error('Expected visible component geometry');
  return bounds;
}

for (const theme of ['light', 'dark']) {
  test(`${theme}: card drawer keeps long-label forms usable at desktop and narrow widths`, async ({
    page,
  }, info) => {
    await page.goto(`/?fixture=workbench-review&lang=en&theme=${theme}`);
    await page.getByRole('button', { name: 'Review drawer', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Preferences' });
    await expect(dialog).toHaveClass(/leaf-drawer--card/);
    const input = dialog.getByRole('textbox');
    await expect(input).toBeVisible();
    for (const width of [1100, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(async () => (await input.boundingBox())?.width ?? 0).toBeGreaterThan(250);
      const label = await rect(dialog.locator('.leaf-form-field__header'));
      const field = await rect(input);
      expect(field.y).toBeGreaterThan(label.y + label.height);
      const geometry = await dialog.evaluate((panel) => {
        const body = panel.querySelector<HTMLElement>(':scope > .leaf-drawer__body');
        if (!body) throw new Error('Missing drawer body');
        const shell = panel.getBoundingClientRect();
        const content = body.getBoundingClientRect();
        const style = getComputedStyle(body);
        const left = shell.left + panel.clientLeft;
        return {
          overflow: panel.scrollWidth - panel.clientWidth,
          start: content.left - left,
          end: left + panel.clientWidth - content.right,
          marginStart: Number.parseFloat(style.marginLeft),
          marginEnd: Number.parseFloat(style.marginRight),
        };
      });
      expect(geometry.overflow, 'Drawer shell has no horizontal overflow').toBeLessThanOrEqual(1);
      expect(geometry.marginStart).toBeGreaterThan(0);
      expect(geometry.marginEnd).toBeGreaterThan(0);
      expect(geometry.start, 'Card body keeps its starting inset').toBeCloseTo(
        geometry.marginStart,
        0,
      );
      expect(geometry.end, 'Card body keeps its ending inset').toBeCloseTo(geometry.marginEnd, 0);
    }
    await page.screenshot({ path: info.outputPath(`drawer-${theme}.png`), fullPage: true });
  });
}

test('keyboard confirmation and anchor history work without pointer input', async ({ page }) => {
  await page.goto('/?fixture=workbench-review&lang=en');
  const trigger = page.getByRole('button', { name: 'Review confirm', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'OK', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Confirmed', { exact: true })).toBeVisible();
  await expect(trigger).toBeFocused();
  const previous = page.url();
  await page.getByRole('link', { name: 'Destination' }).click();
  await expect(page).toHaveURL(/#review-destination$/);
  await expect(page.locator('#review-destination')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(previous);
});

test('quarter keyboard movement follows its two-column grid', async ({ page }) => {
  await page.goto('/?fixture=workbench-review&lang=en');
  await page.locator('.leaf-date-picker__icon').click();
  const cells = page.locator('.leaf-calendar[data-view="quarter"] .leaf-calendar__cells button');
  await expect(cells).toHaveCount(4);
  await expect
    .poll(async () => (await rect(cells.nth(2))).y - (await rect(cells.nth(0))).y)
    .toBeGreaterThan(1);
  expect((await rect(cells.nth(2))).x).toBeCloseTo((await rect(cells.nth(0))).x, 0);
  expect((await rect(cells.nth(1))).x).toBeGreaterThan((await rect(cells.nth(0))).x);
  await cells.nth(0).focus();
  await page.keyboard.press('ArrowDown');
  await expect(cells.nth(2)).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(cells.nth(0)).toBeFocused();
});

test('density, rounded feedback, dismiss targets and component themes reach their painted surfaces', async ({
  page,
}, info) => {
  await page.goto('/?fixture=workbench-review&lang=en');
  const heights: number[] = [];
  for (const size of ['sm', 'md', 'lg']) {
    const trigger = page.getByTestId(`collapse-${size}`).locator('.leaf-collapse__trigger');
    heights.push((await rect(trigger)).height);
    await expect(trigger).not.toHaveCSS('border-top-left-radius', '0px');
  }
  expect(heights).toEqual([28, 34, 40]);
  for (const selector of ['.leaf-date-picker__icon', '.leaf-tag__close', '.leaf-tabs__close']) {
    const box = await rect(page.locator(selector).first());
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBeGreaterThanOrEqual(24);
  }
  const themed = page.getByTestId('component-themes');
  for (const selector of [
    '.leaf-transfer__panel',
    '.leaf-descriptions',
    '.leaf-file-list__items',
    '.leaf-input-otp__slot',
  ]) {
    const surface = themed.locator(selector).first();
    await expect(surface).toHaveCSS('border-top-left-radius', '3px');
    await expect(surface).toHaveCSS('background-color', 'rgb(240, 245, 242)');
  }
  const transfer = page.getByTestId('narrow-transfer');
  const panels = transfer.locator('.leaf-transfer__panel');
  expect((await rect(panels.first())).width).toBeGreaterThan(300);
  expect((await rect(panels.nth(1))).y).toBeGreaterThan((await rect(panels.first())).y);
  await page.screenshot({ path: info.outputPath('quiet-surfaces.png'), fullPage: true });
});
