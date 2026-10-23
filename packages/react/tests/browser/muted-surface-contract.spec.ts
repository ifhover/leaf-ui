import { expect, type Locator, type Page, test } from '@playwright/test';

const initialMutedSurface = 'rgb(244, 243, 239)';
const updatedMutedSurface = 'rgb(218, 228, 220)';
const nestedMutedSurface = 'rgb(46, 58, 70)';
const explicitPaint = 'rgb(201, 73, 41)';

test.setTimeout(120_000);

async function tokenColor(scope: Locator, token: string) {
  return scope.evaluate((node, variable) => {
    const probe = document.createElement('span');
    probe.hidden = true;
    probe.style.color = `var(${variable})`;
    node.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

async function surfaceColor(page: Page, prefix: string) {
  return tokenColor(page.getByTestId(`${prefix}-muted-samples`), '--leaf-color-surface');
}

async function expectLayeredSurfaces(page: Page, prefix: string, muted: string, surface: string) {
  const tabs = page.getByTestId(`${prefix}-tabs`);
  await expect(tabs.locator('.leaf-tabs__list')).toHaveCSS('background-color', muted);
  const indicator = tabs.locator('.leaf-tabs__indicator');
  await expect(indicator).toHaveAttribute('data-visible', 'true');
  await expect(indicator).toHaveCSS('background-color', surface);

  const card = page.getByTestId(`${prefix}-card`);
  await expect(card).toHaveCSS('background-color', muted);
  await expect(card.locator(':scope > .leaf-card__panel')).toHaveCSS('background-color', surface);
  const table = page.getByTestId(`${prefix}-table`);
  await expect(table.locator('.leaf-table')).toHaveCSS('background-color', muted);
  await expect(table.locator('thead th')).toHaveCSS('background-color', muted);
  await expect(table.locator('tbody td')).toHaveCSS('background-color', surface);
}

async function expectPortalSurfaces(page: Page, prefix: string, muted: string, surface: string) {
  await page.getByRole('button', { name: `Open ${prefix} modal`, exact: true }).click();
  const modal = page.locator('.leaf-modal-mask:not([hidden]) .leaf-modal');
  await expect(modal).toHaveCSS('background-color', muted);
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();

  await page.getByRole('combobox', { name: `${prefix} card date`, exact: true }).click();
  const datePanel = page.locator('.leaf-date-picker__panel.leaf-picker-panel--card:visible');
  await expect(datePanel).toHaveCSS('background-color', muted);
  await expect(datePanel.locator('.leaf-calendar')).toHaveCSS('background-color', surface);
  await page.keyboard.press('Escape');
  await expect(datePanel).not.toBeVisible();

  await page.getByRole('button', { name: `${prefix} color`, exact: true }).click();
  const picker = page.locator('.leaf-color-picker__panel:visible');
  await expect(picker.locator('.leaf-color-picker__formats')).toHaveCSS('background-color', muted);
  await expect(picker.locator('.leaf-color-picker__formats button[aria-pressed="true"]')).toHaveCSS(
    'background-color',
    surface,
  );
  await page.keyboard.press('Escape');
  await expect(picker).not.toBeVisible();
}

async function expectMutedSurfaces(page: Page, prefix: string, muted: string) {
  const surface = await surfaceColor(page, prefix);
  await expectLayeredSurfaces(page, prefix, muted, surface);
  await expectPortalSurfaces(page, prefix, muted, surface);
}

for (const theme of ['light', 'dark'] as const) {
  test(`${theme} muted surface paints every shared canvas exactly while selection stays on surface`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=muted-surface-contract&theme=${theme}`);
    const provider = page.getByTestId('muted-outer');
    expect(
      await provider.evaluate((node) => node.style.getPropertyValue('--leaf-color-surface-muted')),
    ).toBe(initialMutedSurface);
    await expectMutedSurfaces(page, 'outer', initialMutedSurface);
  });

  test(`${theme} nested muted paint updates by JS and survives portals without leaking`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=muted-surface-contract&theme=${theme}`);
    const outerSurface = await surfaceColor(page, 'outer');
    const nestedSurface = await surfaceColor(page, 'nested');
    await expectLayeredSurfaces(page, 'outer', initialMutedSurface, outerSurface);
    await expectLayeredSurfaces(page, 'nested', nestedMutedSurface, nestedSurface);

    await page.getByTestId('update-muted-surface').click();
    await expectLayeredSurfaces(page, 'outer', updatedMutedSurface, outerSurface);
    await expectLayeredSurfaces(page, 'nested', nestedMutedSurface, nestedSurface);
    await expectPortalSurfaces(page, 'outer', updatedMutedSurface, outerSurface);
    await expectPortalSurfaces(page, 'nested', nestedMutedSurface, nestedSurface);
  });

  test(`${theme} component paint overrides the muted family without replacing selected surfaces`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=muted-surface-contract&theme=${theme}`);
    const surface = await surfaceColor(page, 'explicit');

    const tabs = page.getByTestId('explicit-tabs');
    await expect(tabs.locator('.leaf-tabs__list')).toHaveCSS('background-color', explicitPaint);
    const indicator = tabs.locator('.leaf-tabs__indicator');
    await expect(indicator).toHaveAttribute('data-visible', 'true');
    await expect(indicator).toHaveCSS('background-color', surface);

    const card = page.getByTestId('explicit-card');
    await expect(card).toHaveCSS('background-color', initialMutedSurface);
    await expect(card.locator(':scope > .leaf-card__panel')).toHaveCSS(
      'background-color',
      explicitPaint,
    );
    const table = page.getByTestId('explicit-table');
    await expect(table.locator('thead th')).toHaveCSS('background-color', explicitPaint);
    await expect(table.locator('tbody td')).toHaveCSS('background-color', explicitPaint);

    await page.getByRole('button', { name: 'Open explicit modal', exact: true }).click();
    const modal = page.locator('.leaf-modal-mask:not([hidden]) .leaf-modal');
    await expect(modal).toHaveCSS('background-color', explicitPaint);
    await page.keyboard.press('Escape');

    await page.getByRole('combobox', { name: 'explicit card date', exact: true }).click();
    const datePanel = page.locator('.leaf-date-picker__panel.leaf-picker-panel--card:visible');
    await expect(datePanel).toHaveCSS('background-color', initialMutedSurface);
    await expect(datePanel.locator('.leaf-calendar')).toHaveCSS('background-color', explicitPaint);
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'explicit color', exact: true }).click();
    const picker = page.locator('.leaf-color-picker__panel:visible');
    await expect(picker).toHaveCSS('background-color', explicitPaint);
    await expect(picker.locator('.leaf-color-picker__formats')).toHaveCSS(
      'background-color',
      initialMutedSurface,
    );
    await expect(
      picker.locator('.leaf-color-picker__formats button[aria-pressed="true"]'),
    ).toHaveCSS('background-color', surface);
    await page.keyboard.press('Escape');
  });
}

test('shared canvas screenshots cover wide, narrow and warm dark surfaces', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Canvas evidence is captured once in Chromium.');

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?fixture=muted-surface-contract&theme=light');
  await expectLayeredSurfaces(
    page,
    'outer',
    initialMutedSurface,
    await surfaceColor(page, 'outer'),
  );
  await page.screenshot({
    path: test.info().outputPath('semantic-shades-canvas-light-1440.png'),
    fullPage: true,
    animations: 'disabled',
  });

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/?fixture=muted-surface-contract&theme=light');
  await expectLayeredSurfaces(
    page,
    'outer',
    initialMutedSurface,
    await surfaceColor(page, 'outer'),
  );
  await page.screenshot({
    path: test.info().outputPath('semantic-shades-canvas-light-390.png'),
    fullPage: true,
    animations: 'disabled',
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?fixture=muted-surface-contract&theme=dark');
  await expectLayeredSurfaces(
    page,
    'outer',
    initialMutedSurface,
    await surfaceColor(page, 'outer'),
  );
  await page.screenshot({
    path: test.info().outputPath('semantic-shades-canvas-dark-1440.png'),
    fullPage: true,
    animations: 'disabled',
  });
});
