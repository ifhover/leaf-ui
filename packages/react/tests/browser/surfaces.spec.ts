import { expect, type Page, test } from '@playwright/test';
import axe from 'axe-core';

async function violations(page: Page) {
  await page.addScriptTag({ content: axe.source });
  return page.evaluate(
    async () =>
      (await (window as unknown as { axe: typeof axe }).axe.run(document.body)).violations,
  );
}

test.use({ viewport: { width: 1100, height: 1000 } });
test.setTimeout(120_000);

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
  const header = dialog.locator('.leaf-modal__header');
  const footer = dialog.locator('.leaf-modal__footer');
  await expect(dialog.locator('.leaf-steps--sm')).toHaveCSS('font-size', '14px');
  await expect(dialog.locator('.leaf-steps__icon').first()).toHaveCSS('width', '24px');
  await expect(dialog.locator('.leaf-checkbox--card').first()).toHaveCSS('box-shadow', 'none');
  await expect(dialog.locator('.leaf-checkbox--card').first()).toHaveCSS('border-radius', '12px');
  await expect(header).toHaveCSS('border-bottom-width', '1px');
  await expect(footer).toHaveCSS('border-top-width', '1px');
  await expect(footer).toHaveCSS('background-color', 'rgb(246, 246, 247)');
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
  await dialog.screenshot({ path: `.quality/surface-modal-${testInfo.project.name}.png` });
  await dialog.getByRole('button', { name: 'Save access', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByText('Access settings saved.')).toBeVisible();
});

test('API confirmations keep a compact footer and a bare semantic icon in the body', async ({
  page,
}, testInfo) => {
  await page.goto('/?fixture=surfaces');
  await page.getByRole('button', { name: 'Simple confirmation', exact: true }).click();
  let dialog = page.getByRole('alertdialog', { name: 'Continue', exact: true });
  await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  const heading = await dialog
    .getByRole('heading', { name: 'Continue', exact: true })
    .boundingBox();
  const icon = await dialog.locator('.leaf-confirm__body > .leaf-confirm__icon').boundingBox();
  const text = await dialog.getByText('Keep your current settings?', { exact: true }).boundingBox();
  expect(icon).not.toBeNull();
  expect(heading?.x).toBeCloseTo(icon?.x ?? 0, 0);
  expect(text?.x).toBeGreaterThan((icon?.x ?? 0) + (icon?.width ?? 0));
  await expect(dialog.locator('.leaf-confirm-description')).toHaveCSS('font-size', '15px');
  await expect(dialog.locator('.leaf-modal__header')).toHaveCSS('padding-top', '16px');
  await expect(dialog.locator('.leaf-modal__header')).toHaveCSS('border-bottom-width', '0px');
  await expect(dialog.locator('.leaf-modal__footer')).toHaveCSS('border-top-width', '0px');
  await expect(dialog.locator('.leaf-modal__footer')).toHaveCSS('padding-bottom', '12px');
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
  await dialog.screenshot({ path: `.quality/surface-confirm-${testInfo.project.name}.png` });
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
  await expect(drawer.locator('.leaf-drawer__header')).toHaveCSS('border-bottom-width', '1px');
  await expect(drawer.locator('.leaf-drawer__footer')).toHaveCSS(
    'background-color',
    'rgb(246, 246, 247)',
  );
  await drawer.screenshot({ path: `.quality/surface-drawer-${testInfo.project.name}.png` });
  await drawer.press('Escape');
  await expect(drawer).toBeHidden();
  await page.getByRole('button', { name: 'Spacing only', exact: true }).click();
  const plain = page.getByRole('dialog', { name: 'Spacing only', exact: true });
  await expect(plain.locator('.leaf-modal__header')).toHaveCSS('border-bottom-width', '0px');
  await expect(plain.locator('.leaf-modal__footer')).toHaveCSS('border-top-width', '0px');
  await plain.press('Escape');
  const divided = page.locator('.leaf-card--divided');
  await expect(divided.locator('.leaf-card__header')).toHaveCSS('border-bottom-width', '1px');
  await expect(
    page.locator('.leaf-card:not(.leaf-card--divided)').first().locator('.leaf-card__header'),
  ).toHaveCSS('border-bottom-width', '0px');
});

test('theme settings reach portalled section surfaces and dense choices', async ({ page }) => {
  await page.goto('/?fixture=surfaces&surface-tokens=1&compact=1');
  await expect(
    page.getByRole('checkbox', { name: 'Mail', exact: true }).locator('..').locator('..'),
  ).toHaveCSS('border-radius', '8px');
  await page.getByRole('button', { name: 'Configure access', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Register agent', exact: true });
  await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  await expect(dialog).toHaveCSS('border-radius', '6.4px');
  await expect(dialog.locator('.leaf-modal__header')).toHaveCSS('padding-left', '18px');
  await expect(dialog.locator('.leaf-modal__header')).toHaveCSS(
    'border-bottom-color',
    'rgb(100, 110, 120)',
  );
  const footer = dialog.locator('.leaf-modal__footer');
  const color = await footer.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(color).not.toBe('rgb(246, 246, 247)');
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
        };
      }),
    )
    .toMatchObject({ minHeight: '30px', controlHeight: '30px', currentHeight: '30px' });
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
    path: `.quality/refinement-modal-scroll-${testInfo.project.name}.png`,
  });
  await dialog.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Configure access', exact: true })).toBeFocused();
});

test('mobile, dark and RTL surfaces remain contained, readable and accessible', async ({
  page,
}, testInfo) => {
  for (const { theme, rtl } of [
    { theme: 'light', rtl: false },
    { theme: 'dark', rtl: true },
  ]) {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/?fixture=surfaces&theme=${theme}${rtl ? '&rtl=1' : ''}`);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(await violations(page)).toEqual([]);
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
    expect(await violations(page)).toEqual([]);
    await dialog.screenshot({
      path: `.quality/surface-mobile-${theme}-${testInfo.project.name}.png`,
    });
    await dialog.press('Escape');
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Delete project', exact: true }).click();
    const confirm = page.getByRole('alertdialog', {
      name: 'Delete project',
      exact: true,
    });
    await expect(confirm).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
    expect(await violations(page)).toEqual([]);
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
