import { expect, type Locator, test } from '@playwright/test';

async function rect(locator: Locator) {
  const bounds = await locator.boundingBox();
  if (!bounds) throw new Error('Expected visible transfer surface');
  return bounds;
}

for (const theme of ['light', 'dark']) {
  for (const virtual of [false, true]) {
    test(`${theme}: ${virtual ? 'virtual' : 'regular'} lists share inset card surfaces and retain transfer behavior`, async ({
      page,
    }) => {
      await page.goto(`/?fixture=transfer&theme=${theme}${virtual ? '&virtual' : ''}`);
      const transfer = page.getByTestId('transfer');
      const panels = transfer.locator('.leaf-transfer__panel');
      const bodies = transfer.locator('.leaf-transfer__body');
      const reference = page.locator('.leaf-card--layered');
      const canvas = await reference.evaluate((node) => getComputedStyle(node).backgroundColor);
      const surface = await reference
        .locator('.leaf-card__panel')
        .evaluate((node) => getComputedStyle(node).backgroundColor);
      expect(canvas).not.toEqual(surface);
      for (let side = 0; side < 2; side++) {
        await expect(panels.nth(side)).toHaveCSS('background-color', canvas);
        await expect(panels.nth(side)).toHaveCSS('box-shadow', 'none');
        await expect(bodies.nth(side)).toHaveCSS('background-color', surface);
        await expect(bodies.nth(side)).toHaveCSS('border-top-left-radius', '7px');
        await expect(bodies.nth(side)).not.toHaveCSS('box-shadow', 'none');
        await expect(panels.nth(side).locator('header')).toHaveCSS('border-bottom-width', '0px');
        const panel = await rect(panels.nth(side));
        const body = await rect(bodies.nth(side));
        expect(body.x - panel.x).toBe(5);
        expect(panel.x + panel.width - body.x - body.width).toBe(5);
      }
      await expect(bodies.first().getByRole('textbox')).toBeVisible();
      await panels.first().getByRole('checkbox', { name: 'Alice Engineering' }).check();
      const selected = panels.first().locator('.leaf-transfer__item[data-selected]');
      await selected.evaluate(async (node) => {
        await Promise.all(node.getAnimations().map((animation) => animation.finished));
      });
      const selectedPaint = await selected.evaluate(
        (node) => getComputedStyle(node).backgroundColor,
      );
      await selected.hover();
      await expect(selected).toHaveCSS('background-color', selectedPaint);
      await transfer.getByRole('button', { name: 'Move to selected', exact: true }).click();
      await expect(
        panels.nth(1).getByRole('checkbox', { name: 'Alice Engineering' }),
      ).toBeVisible();
      await panels.nth(1).getByRole('checkbox', { name: 'Alice Engineering' }).check();
      await transfer.getByRole('button', { name: 'Move to available', exact: true }).click();
      await expect(
        panels.first().getByRole('checkbox', { name: 'Alice Engineering' }),
      ).toBeVisible();
      await panels.first().getByRole('textbox').fill('not-found');
      await expect(bodies.first().getByText('No items', { exact: true })).toBeVisible();
      await panels.first().getByRole('textbox').clear();
      await expect(
        panels.first().getByRole('checkbox', { name: 'Carol', exact: true }),
      ).toBeDisabled();
      await page.getByRole('heading', { name: 'Transfer surfaces', exact: true }).click();
      await page.mouse.move(0, 0);
      await page.screenshot({
        path: test.info().outputPath(`transfer-${theme}-${virtual ? 'virtual' : 'regular'}.png`),
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
}

test('explicit component paint reaches both surfaces and clamps small inner radii', async ({
  page,
}) => {
  await page.goto('/?fixture=transfer&custom');
  const panel = page.getByTestId('transfer').locator('.leaf-transfer__panel').first();
  const body = panel.locator('.leaf-transfer__body');
  await expect(panel).toHaveCSS('background-color', 'rgb(240, 245, 242)');
  await expect(panel).toHaveCSS('border-top-left-radius', '3px');
  await expect(panel).toHaveCSS('border-top-color', 'rgb(100, 110, 105)');
  await expect(panel.locator('header')).toHaveCSS('background-color', 'rgb(230, 235, 232)');
  await expect(body).toHaveCSS('background-color', 'rgb(240, 245, 242)');
  await expect(body).toHaveCSS('border-top-left-radius', '0px');
  await expect(body).toHaveCSS('box-shadow', 'none');
});

test('a nested muted surface token colors only the canvas, not the inner content', async ({
  page,
}) => {
  await page.goto('/?fixture=transfer&muted&theme=dark');
  const transfer = page.getByTestId('transfer');
  for (const panel of await transfer.locator('.leaf-transfer__panel').all()) {
    await expect(panel).toHaveCSS('background-color', 'rgb(244, 243, 239)');
    await expect(panel.locator('.leaf-transfer__body')).not.toHaveCSS(
      'background-color',
      'rgb(244, 243, 239)',
    );
  }
});

test('narrow RTL panels retain their inset surfaces without search and when disabled', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?fixture=transfer&rtl=1&no-search&disabled');
  const transfer = page.getByTestId('transfer');
  const panels = transfer.locator('.leaf-transfer__panel');
  await expect(transfer).toHaveCSS('direction', 'rtl');
  await expect(transfer.getByRole('textbox')).toHaveCount(0);
  for (const checkbox of await transfer.getByRole('checkbox').all()) {
    await expect(checkbox).toBeDisabled();
  }
  const first = await rect(panels.first());
  const second = await rect(panels.nth(1));
  expect(second.y).toBeGreaterThan(first.y + first.height);
  expect(first.width).toBeLessThanOrEqual(327);
  await expect(panels.first()).toHaveCSS('transition-duration', '0s');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await page.screenshot({
    path: test.info().outputPath('transfer-narrow-rtl-disabled.png'),
    fullPage: true,
    animations: 'disabled',
  });
});
