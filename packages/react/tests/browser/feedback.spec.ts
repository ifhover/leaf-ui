import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1100, height: 900 } });
test.setTimeout(120_000);

test('contact actions remain aligned with inputs when validation adds an error', async ({
  page,
}) => {
  await page.goto('/?fixture=feedback');
  const row = page.locator('.leaf-form-list .leaf-form-field').first();
  const input = row.locator('.leaf-input');
  const remove = row.getByRole('button', { name: '移除', exact: true });
  for (const validate of [false, true]) {
    if (validate) await page.getByRole('button', { name: '检查表单' }).click();
    const fieldBox = await input.boundingBox();
    const actionBox = await remove.boundingBox();
    expect(fieldBox).not.toBeNull();
    expect(actionBox).not.toBeNull();
    expect(Math.abs((fieldBox?.y ?? 0) - (actionBox?.y ?? 0))).toBeLessThan(1);
  }
});

test('alerts with descriptions use an integer text stack', async ({ page }) => {
  await page.goto('/?fixture=feedback');
  const alert = page.locator('.leaf-alert').filter({ hasText: 'Changes saved' });
  await expect(alert).toHaveCSS('line-height', '20px');
  await expect(alert.locator('.leaf-alert__description')).toHaveCSS('line-height', '18px');
  expect(await alert.evaluate((node) => node.getBoundingClientRect().height)).toBe(70);
});

test('modal form shares the footer edge and uses balanced spacing', async ({ page }) => {
  await page.goto('/?fixture=feedback');
  await page.getByRole('button', { name: '编辑项目' }).click();
  const dialog = page.getByRole('dialog', { name: '项目设置' });
  await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  const input = await dialog.locator('.leaf-input').boundingBox();
  const save = await dialog.getByRole('button', { name: '保存', exact: true }).boundingBox();
  expect((input?.x ?? 0) + (input?.width ?? 0)).toBeCloseTo((save?.x ?? 0) + (save?.width ?? 0), 0);
  await expect(dialog.locator('.leaf-modal__header')).toHaveCSS('padding-top', '20px');
  await expect(dialog.locator('.leaf-modal__footer')).toHaveCSS('padding-bottom', '20px');
  const heading = await dialog.locator('h2').boundingBox();
  const form = await dialog.locator('form').boundingBox();
  const select = await dialog.locator('.leaf-select').boundingBox();
  const titleGap = (form?.y ?? 0) - (heading?.y ?? 0) - (heading?.height ?? 0);
  const footerGap = (save?.y ?? 0) - (select?.y ?? 0) - (select?.height ?? 0);
  expect(titleGap).toBeGreaterThanOrEqual(16);
  expect(footerGap).toBeCloseTo(20, 0);
});

for (const surface of ['modal', 'drawer']) {
  test(`${surface} defaults to a gray mask without blur and retains explicit opt-in`, async ({
    page,
  }) => {
    await page.goto('/?fixture=feedback');
    const trigger = page.getByRole('button', {
      name: surface === 'modal' ? '编辑项目' : 'Open feedback drawer',
      exact: true,
    });
    const backdrop = page.locator(`.leaf-${surface}-backdrop`);
    for (let cycle = 0; cycle < 2; cycle++) {
      await trigger.click();
      await expect(backdrop).toHaveCSS('backdrop-filter', 'none');
      await expect(backdrop).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.24)');
      await expect(backdrop).toHaveCSS('transition-property', 'opacity');
      await page.keyboard.press('Escape');
      await expect(page.locator(`.leaf-${surface}-mask`)).toBeHidden();
    }
    await page.getByRole('button', { name: 'Toggle mask blur' }).click();
    await trigger.click();
    await expect(backdrop).toHaveCSS(
      'backdrop-filter',
      surface === 'modal' ? 'blur(12px)' : 'blur(3px)',
    );
  });
}

test('drawer and message enter without spring or text scaling', async ({ page }) => {
  await page.goto('/?fixture=feedback');
  await page.getByRole('button', { name: 'Show feedback message' }).click();
  const message = page.locator('.leaf-message');
  await expect(message).toHaveCSS('transition-timing-function', 'cubic-bezier(0.22, 1, 0.36, 1)');
  const transform = await message.evaluate(
    (node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).a,
  );
  expect(transform).toBe(1);
  await page.getByRole('button', { name: 'Open feedback drawer' }).click();
  await expect(page.locator('.leaf-drawer')).toHaveCSS(
    'transition-timing-function',
    'cubic-bezier(0.22, 1, 0.36, 1), cubic-bezier(0.22, 1, 0.36, 1)',
  );
});
