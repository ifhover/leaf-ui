import { expect, type Locator, type Page, test } from '@playwright/test';
import { expectAccessible } from './helpers/accessibility';

test.use({ viewport: { width: 1100, height: 1000 } });
test.setTimeout(120_000);

async function primarySoftColor(surface: Locator) {
  return surface.evaluate((element) => {
    const probe = document.createElement('span');
    probe.style.backgroundColor = 'var(--leaf-color-primary-soft)';
    element.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });
}

async function expectQuietDialog(
  page: Page,
  dialog: Locator,
  cancelText = 'Cancel',
  cancelVariant: 'outline' = 'outline',
) {
  await expect(dialog.locator('.leaf-modal__header')).toHaveCSS('border-bottom-width', '0px');
  await expect(dialog.locator('.leaf-modal__footer')).toHaveCSS('border-top-width', '0px');
  await expect(dialog.locator('.leaf-modal__footer')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  const cancel = dialog.getByRole('button', { name: cancelText, exact: true });
  await expect(cancel).toHaveClass(new RegExp(`leaf-button--${cancelVariant}`));
  await expect(cancel).toHaveCSS('border-top-width', '1px');
  expect(await cancel.evaluate((element) => getComputedStyle(element).borderTopColor)).not.toBe(
    'rgba(0, 0, 0, 0)',
  );
  const backdrop = page.locator('.leaf-modal-backdrop:visible');
  await expect(backdrop).toHaveCSS('backdrop-filter', 'none', { timeout: 20_000 });
  const [red = 0, green = 0, blue = 0, alpha = 0] = await backdrop.evaluate((element) => {
    const context = document.createElement('canvas').getContext('2d');
    if (!context) throw new Error('Canvas context unavailable');
    context.fillStyle = getComputedStyle(element).backgroundColor;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data];
  });
  expect(Math.max(red, green, blue) - Math.min(red, green, blue)).toBeLessThanOrEqual(4);
  expect(alpha).toBeGreaterThan(0);
  expect(alpha).toBeLessThan(70);
}

test('rich choices retain native form, reset, mouse and keyboard behavior', async ({ page }) => {
  await page.goto('/?fixture=surfaces');
  const form = page.getByRole('form', { name: 'Rich choices' });
  const drive = form.getByRole('checkbox', { name: 'Drive', exact: true });
  await expect(drive).toHaveAccessibleDescription('Read files');
  await form.getByText('Read files', { exact: true }).click();
  await expect(drive).toBeChecked();
  await drive.press('Space');
  await expect(drive).not.toBeChecked();
  const read = form.getByRole('radio', { name: 'Read-only', exact: true });
  await read.focus();
  await read.press('ArrowDown');
  await expect(form.getByRole('radio', { name: 'Always ask', exact: true })).toBeChecked();
  await form.getByRole('button', { name: 'Submit choices', exact: true }).click();
  await expect(form.getByLabel('Submitted choices')).toHaveText(
    '{"services":"mail","policy":"review"}',
  );
  await form.getByRole('button', { name: 'Reset choices', exact: true }).click();
  await expect(read).toBeChecked();
  await expect(form.getByRole('checkbox', { name: 'Unavailable', exact: true })).toBeDisabled();
  await expect(form.getByRole('checkbox', { name: 'Partial selection', exact: true })).toBeChecked({
    indeterminate: true,
  });
});

test('dialog sections align icons, descriptions and actions, and preserve rich choices', async ({
  page,
}, testInfo) => {
  await page.goto('/?fixture=surfaces');
  const trigger = page.getByRole('button', { name: 'Configure access', exact: true });
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Register agent', exact: true });
  await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  await expect(dialog).toHaveAccessibleDescription(
    'Give the agent an identity, then grant the access it needs.',
  );
  await expect(dialog.locator('.leaf-steps--sm')).toHaveCSS('font-size', '14px');
  await expect(dialog.locator('.leaf-steps__icon').first()).toHaveCSS('width', '24px');
  await expect(dialog.locator('.leaf-checkbox--card').first()).toHaveCSS('box-shadow', 'none');
  await expect(dialog.locator('.leaf-checkbox--card').first()).toHaveCSS('border-radius', '12px');
  await expectQuietDialog(page, dialog, 'Back');
  const bounds = await dialog.evaluate((element) => {
    const box = (selector: string) =>
      element.querySelector(selector)?.getBoundingClientRect().toJSON();
    return {
      body: box('.leaf-modal__body'),
      header: box('.leaf-modal__header'),
      close: box('.leaf-modal__close'),
      action: box('.leaf-modal__footer .leaf-button:last-child'),
    };
  });
  expect((bounds.close?.x ?? 0) + (bounds.close?.width ?? 0)).toBeCloseTo(
    (bounds.action?.x ?? 0) + (bounds.action?.width ?? 0),
    0,
  );
  await dialog.getByText('Read and organize messages', { exact: true }).click();
  await expect(dialog.getByRole('checkbox', { name: 'Mail', exact: true })).not.toBeChecked();
  await dialog.screenshot({
    path: test.info().outputPath(`surface-modal-${testInfo.project.name}.png`),
  });
  await dialog.getByRole('button', { name: 'Save access', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByText('Access settings saved.')).toBeVisible();
});

test('API confirmations align a bare icon with a bold compact title', async ({
  page,
}, testInfo) => {
  await page.goto('/?fixture=surfaces');
  await page.getByRole('button', { name: 'Simple confirmation', exact: true }).click();
  let dialog = page.getByRole('alertdialog', { name: 'Continue', exact: true });
  await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  const heading = await dialog.locator('.leaf-confirm__title').boundingBox();
  const icon = await dialog.locator('.leaf-modal__header .leaf-confirm__icon').boundingBox();
  const text = await dialog.getByText('Keep your current settings?', { exact: true }).boundingBox();
  expect(icon).not.toBeNull();
  expect((heading?.y ?? 0) + (heading?.height ?? 0) / 2).toBeCloseTo(
    (icon?.y ?? 0) + (icon?.height ?? 0) / 2,
    0,
  );
  expect(text?.x).toBeCloseTo(heading?.x ?? 0, 0);
  expect(text?.x).toBeGreaterThan((icon?.x ?? 0) + (icon?.width ?? 0));
  await expect(dialog.getByRole('heading')).toHaveCSS('font-size', '16px');
  await expect(dialog.getByRole('heading')).toHaveCSS('font-weight', '700');
  await expect(dialog.locator('.leaf-confirm-description')).toHaveCSS('font-size', '14px');
  const headingRow = await dialog.getByRole('heading').boundingBox();
  expect((text?.y ?? 0) - (headingRow?.y ?? 0) - (headingRow?.height ?? 0)).toBeCloseTo(8, 0);
  await expect(dialog.locator('.leaf-modal__header')).toHaveCSS('padding-top', '20px');
  await expectQuietDialog(page, dialog, 'Cancel');
  await expect(dialog.locator('.leaf-modal__footer')).toHaveCSS('padding-bottom', '20px');
  await expect(dialog.locator('.leaf-confirm__icon')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  await expect(dialog).toHaveAccessibleDescription('Keep your current settings?');
  await dialog.press('Escape');
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'Delete project', exact: true }).click();
  dialog = page.getByRole('alertdialog', { name: 'Delete project', exact: true });
  await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  const confirm = dialog.getByRole('button', { name: 'OK', exact: true });
  await expect(dialog.locator('.leaf-modal__header .leaf-modal__icon')).toHaveCount(0);
  await expect(dialog.locator('.leaf-confirm__icon .lucide-circle-alert')).toHaveCount(1);
  await expect(confirm).toBeEnabled();
  await dialog.screenshot({
    path: test.info().outputPath(`surface-confirm-${testInfo.project.name}.png`),
  });
  await confirm.click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText('Project deleted.')).toBeVisible();
});

test('drawer and cards share section styling while spacing-only surfaces stay available', async ({
  page,
}, testInfo) => {
  await page.goto('/?fixture=surfaces');
  await page.getByRole('button', { name: 'Notification preferences', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Notification preferences', exact: true });
  await expect(drawer).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  await expect(drawer).toHaveAccessibleDescription('Choose the right update frequency for you.');
  await expect(drawer.locator('.leaf-drawer__header')).toHaveCSS('border-bottom-width', '0px');
  await expect(drawer.locator('.leaf-drawer__footer')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  await expect(drawer.getByRole('radio', { name: 'Weekly', exact: true })).toBeChecked();
  const daily = drawer.getByRole('radio', { name: 'Daily', exact: true });
  await expect(daily).toHaveAccessibleDescription('A daily team activity digest');
  await daily.check();
  await expect(daily).toBeChecked();
  await expect(drawer.getByText('Important alerts stay enabled', { exact: true })).toBeVisible();
  await drawer.screenshot({
    path: test.info().outputPath(`surface-drawer-${testInfo.project.name}.png`),
  });
  await drawer.press('Escape');
  await expect(drawer).toBeHidden();
  await page.getByRole('button', { name: 'Spacing only', exact: true }).click();
  const plain = page.getByRole('dialog', { name: 'Spacing only', exact: true });
  await expect(plain.locator('.leaf-modal__header')).toHaveCSS('border-bottom-width', '0px');
  await expect(plain.locator('.leaf-modal__footer')).toHaveCSS('border-top-width', '0px');
  await plain.press('Escape');
  await expect(plain).toBeHidden();
  await page.getByRole('button', { name: 'Divided dialog', exact: true }).click();
  const dividedDialog = page.getByRole('dialog', { name: 'Divided dialog', exact: true });
  await expect(dividedDialog.locator('.leaf-modal__header')).toHaveCSS(
    'border-bottom-width',
    '1px',
  );
  await expect(dividedDialog.locator('.leaf-modal__footer')).toHaveCSS('border-top-width', '1px');
  await expect(dividedDialog.locator('.leaf-modal__footer')).toHaveCSS(
    'background-color',
    'rgb(245, 245, 245)',
  );
  await dividedDialog.press('Escape');
  const card = page
    .locator('.leaf-card')
    .filter({ has: page.locator('.leaf-card__footer') })
    .first();
  await expect(card.locator('.leaf-card__header')).toHaveCSS('border-bottom-width', '0px');
  await expect(card.locator('.leaf-card__footer')).toHaveCSS('border-top-width', '0px');
});

test('theme settings reach portalled section surfaces and dense choices', async ({ page }) => {
  await page.goto('/?fixture=surfaces&surface-tokens=1&compact=1');
  await expect(
    page.getByRole('checkbox', { name: 'Mail', exact: true }).locator('..').locator('..'),
  ).toHaveCSS('border-radius', '8px');
  await page.getByRole('button', { name: 'Configure access', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Register agent', exact: true });
  await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  await expect(dialog).toHaveCSS('border-radius', '8px');
  await expect(dialog.locator('.leaf-modal__header')).toHaveCSS('padding-left', '18px');
  const footer = dialog.locator('.leaf-modal__footer');
  const color = await footer.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(color).not.toBe('rgb(245, 245, 245)');
  const primarySoft = await primarySoftColor(footer);
  expect(primarySoft).not.toBe('rgba(0, 0, 0, 0)');
  await expect(footer).toHaveCSS('background-color', primarySoft);
  await expect
    .poll(() =>
      dialog.getByRole('button', { name: 'Save access', exact: true }).evaluate((node) => {
        const css = getComputedStyle(node);
        const portal = node.closest('.leaf-portal-scope');
        return {
          minHeight: css.minHeight,
          controlHeight: css.getPropertyValue('--leaf-control-height').trim(),
          currentHeight: css.getPropertyValue('--leaf-current-control-height').trim(),
          buttonHeight: css.getPropertyValue('--leaf-button-height').trim(),
          componentHeight: css.getPropertyValue('--leaf-component-button-height').trim(),
          portalHeight: portal
            ? getComputedStyle(portal).getPropertyValue('--leaf-control-height').trim()
            : '',
          scopeHeights: [...document.querySelectorAll('.surface-fixture [data-leaf-scope]')].map(
            (scope) => getComputedStyle(scope).getPropertyValue('--leaf-control-height').trim(),
          ),
        };
      }),
    )
    .toMatchObject({
      minHeight: '30px',
      controlHeight: '30px',
      currentHeight: '30px',
      portalHeight: '30px',
      scopeHeights: ['30px'],
    });
  await dialog.press('Escape');
  await expect(dialog).toBeHidden();
  await page.getByRole('button', { name: 'Notification preferences', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Notification preferences', exact: true });
  await expect(drawer).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const drawerFooter = drawer.locator('.leaf-drawer__footer');
  await expect(drawerFooter).toHaveCSS('background-color', await primarySoftColor(drawerFooter));
});

test('long modal content scrolls through Scrollbar without moving the heading or actions', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 700, height: 500 });
  await page.goto('/?fixture=surfaces');
  await page.getByRole('button', { name: 'Configure access', exact: true }).press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Register agent', exact: true });
  await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  const body = dialog.locator('.leaf-modal__body.leaf-scrollbar');
  const viewport = body.getByRole('region', { name: 'Register agent', exact: true });
  await expect(body.getByRole('scrollbar', { name: 'Vertical scrollbar' })).toBeAttached();
  const header = dialog.locator('.leaf-modal__header');
  const footer = dialog.locator('.leaf-modal__footer');
  const before = { header: await header.boundingBox(), footer: await footer.boundingBox() };
  await viewport.hover();
  await page.mouse.wheel(0, 240);
  await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(80);
  expect((await header.boundingBox())?.y).toBeCloseTo(before.header?.y ?? 0, 0);
  expect((await footer.boundingBox())?.y).toBeCloseTo(before.footer?.y ?? 0, 0);
  await dialog.screenshot({
    path: test.info().outputPath(`refinement-modal-scroll-${testInfo.project.name}.png`),
  });
  await dialog.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Configure access', exact: true })).toBeFocused();
});

test('mobile, dark and RTL surfaces remain contained and readable', async ({ page }, testInfo) => {
  for (const { theme, rtl } of [
    { theme: 'light', rtl: false },
    { theme: 'dark', rtl: true },
  ]) {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/?fixture=surfaces&theme=${theme}${rtl ? '&rtl=1' : ''}`);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.getByRole('button', { name: 'Configure access', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Register agent', exact: true });
    await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
    const overflow = await dialog.evaluate((element) => ({
      width: element.scrollWidth,
      clientWidth: element.clientWidth,
      body: element.querySelector('.leaf-modal__body')?.getBoundingClientRect().height,
      height: element.getBoundingClientRect().height,
    }));
    expect(overflow.width).toBeLessThanOrEqual(overflow.clientWidth + 1);
    expect(overflow.height).toBeLessThanOrEqual(812 - 48);
    const actions = dialog.locator('.leaf-modal__footer');
    const cancel = await actions.getByRole('button', { name: 'Back', exact: true }).boundingBox();
    const save = await actions
      .getByRole('button', { name: 'Save access', exact: true })
      .boundingBox();
    const status = await actions.locator(':scope > span').boundingBox();
    expect(cancel).not.toBeNull();
    expect(save).not.toBeNull();
    expect(status).not.toBeNull();
    expect(cancel?.y).toBeCloseTo(save?.y ?? 0, 0);
    expect((status?.y ?? 0) + (status?.height ?? 0)).toBeLessThanOrEqual((save?.y ?? 0) + 1);
    await dialog.screenshot({
      path: test.info().outputPath(`surface-mobile-${theme}-${testInfo.project.name}.png`),
    });
    await dialog.press('Escape');
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Delete project', exact: true }).click();
    const confirm = page.getByRole('alertdialog', {
      name: 'Delete project',
      exact: true,
    });
    await expect(confirm).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
    await confirm.press('Escape');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?fixture=surfaces');
  await page.getByRole('button', { name: 'Configure access', exact: true }).click();
  await expect(page.getByRole('dialog').locator('.leaf-modal__close')).toHaveCSS(
    'transition-duration',
    '0s',
  );
});

for (const [theme, rtl] of [
  ['light', false],
  ['dark', true],
] as const) {
  test(`mobile surfaces accessibility in ${theme}`, { tag: '@a11y' }, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/?fixture=surfaces&theme=${theme}${rtl ? '&rtl=1' : ''}`);
    await expectAccessible(page);
    await page.getByRole('button', { name: 'Configure access', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Register agent', exact: true });
    await expect(dialog).toHaveCSS('opacity', '1');
    await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await expectAccessible(page);
    await dialog.press('Escape');
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Delete project', exact: true }).click();
    await expect(
      page.getByRole('alertdialog', { name: 'Delete project', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('alertdialog')).toHaveCSS('opacity', '1');
    await expect(page.getByRole('alertdialog')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await expectAccessible(page);
  });
}
