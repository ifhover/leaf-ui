import { expect, type Locator, test } from '@playwright/test';
import axe from 'axe-core';

async function rect(locator: Locator) {
  const bounds = await locator.boundingBox();
  if (!bounds) throw new Error('Expected visible form geometry');
  return { ...bounds, right: bounds.x + bounds.width, bottom: bounds.y + bounds.height };
}

async function expectGroupSpacing(form: Locator, minimumGap: number) {
  const groups = form.getByRole('group');
  await expect(groups).toHaveCount(2);
  const first = await rect(groups.nth(0));
  const second = await rect(groups.nth(1));
  expect(second.y - first.bottom).toBeGreaterThanOrEqual(minimumGap - 0.5);
  for (const group of await groups.all()) {
    const legend = await rect(group.locator('legend'));
    const header = await rect(group.locator('.leaf-form-field__header'));
    const body = await rect(group.locator('.leaf-form-field__body'));
    expect(header.y).toBeGreaterThanOrEqual(legend.bottom - 0.5);
    expect(body.y).toBeGreaterThanOrEqual(legend.bottom - 0.5);
  }
  const vertical = groups.nth(1);
  const header = await rect(vertical.locator('.leaf-form-field__header'));
  const body = await rect(vertical.locator('.leaf-form-field__body'));
  expect(body.y).toBeGreaterThan(header.bottom);
}

for (const [theme, compact, rtl, lang] of [
  ['light', false, false, 'zh'],
  ['dark', true, true, 'en'],
  ['light', true, false, 'en'],
  ['dark', false, false, 'zh'],
] as const) {
  const variant = `${theme}-${compact ? 'compact' : 'comfortable'}-${rtl ? 'rtl' : 'ltr'}-${lang}`;
  test(`${variant}: settings rows, wide controls, feedback and accessibility`, async ({
    page,
  }, testInfo) => {
    await page.goto(
      `/?fixture=form-settings&theme=${theme}&lang=${lang}${compact ? '&compact=1' : ''}${rtl ? '&rtl=1' : ''}`,
    );
    const example = page.getByTestId('settings-example');
    const form = example.locator('form');
    const fields = form.locator(':scope > .leaf-form-field');
    await expect(fields).toHaveCount(3);
    const formBounds = await rect(form);

    for (let index = 0; index < 2; index += 1) {
      const field = fields.nth(index);
      const header = await rect(field.locator('.leaf-form-field__header'));
      const control = await rect(field.locator(index === 0 ? '.leaf-switch' : '.leaf-select'));
      // Both controls keep their intrinsic width and align at the row's trailing edge.
      expect(control.width).toBeLessThan(formBounds.width / 2);
      if (rtl) {
        expect(control.x).toBeCloseTo(formBounds.x, 0);
        expect(header.x).toBeGreaterThanOrEqual(control.right);
      } else {
        expect(control.right).toBeCloseTo(formBounds.right, 0);
        expect(header.right).toBeLessThanOrEqual(control.x);
      }
      expect(control.y).toBeLessThan(header.bottom);
      expect(control.bottom).toBeGreaterThan(header.y);
    }

    for (const index of [1, 2]) {
      await expect(fields.nth(index)).toHaveCSS('border-block-start-width', '1px');
    }
    const wide = fields.nth(2);
    const textarea = wide.getByRole('textbox');
    const description = await rect(wide.locator('.leaf-form-field__summary-description'));
    const textareaBounds = await rect(textarea);
    expect(textareaBounds.x).toBeCloseTo(formBounds.x, 0);
    expect(textareaBounds.width).toBeCloseTo(formBounds.width, 0);
    expect(description.bottom).toBeLessThan(textareaBounds.y);
    await textarea.fill('Keep replies concise.');
    await expect(textarea).toHaveValue('Keep replies concise.');

    const autoSave = example.getByRole('switch');
    await expect(autoSave).toBeChecked();
    await autoSave.click();
    await expect(autoSave).not.toBeChecked();
    await example.getByRole('combobox').focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(example.getByRole('combobox')).toHaveValue('English');

    const workspace = page.getByRole('textbox', { name: 'Workspace name', exact: true });
    await expect(workspace).toHaveAccessibleDescription(
      'The public name of your workspace. Use a name your team recognizes.',
    );
    await page.getByText('Workspace name', { exact: true }).click();
    await expect(workspace).toBeFocused();
    await page.getByRole('button', { name: 'Toggle error' }).click();
    await expect(workspace).toHaveAttribute('aria-invalid', 'true');
    await expect(workspace).toHaveAccessibleDescription(
      'The public name of your workspace. This name is already taken.',
    );
    await expect(page.getByText('Use a name your team recognizes.')).toHaveCount(0);
    await expect(page.getByRole('alert')).toHaveText('This name is already taken.');

    const grouped = page.getByRole('form', { name: 'Grouped settings', exact: true });
    await expectGroupSpacing(grouped, compact ? 16 : 24);

    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as unknown as { axe: typeof axe }).axe.run(document.body);
      return result.violations;
    });
    expect(violations).toEqual([]);
    await page.screenshot({
      path: `.quality/form-settings-${variant}-${testInfo.project.name}.png`,
      fullPage: true,
    });

    await page.setViewportSize({ width: 375, height: 900 });
    const narrowForm = await rect(form);
    for (let index = 0; index < 3; index += 1) {
      const field = fields.nth(index);
      const header = await rect(field.locator('.leaf-form-field__header'));
      const body = await rect(field.locator('.leaf-form-field__body'));
      expect(body.y).toBeGreaterThanOrEqual(header.bottom);
      expect(body.x).toBeCloseTo(narrowForm.x, 0);
      expect(body.right).toBeLessThanOrEqual(375 - 24 + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      375,
    );
    expect((await rect(textarea)).width).toBeCloseTo(narrowForm.width, 0);
    await expectGroupSpacing(grouped, compact ? 16 : 24);
    await page.screenshot({
      path: `.quality/form-settings-mobile-${variant}-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
}
