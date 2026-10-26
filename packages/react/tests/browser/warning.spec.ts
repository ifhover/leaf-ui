import { readability } from '@ctrl/tinycolor';
import { expect, test } from '@playwright/test';

for (const mode of ['light', 'dark'] as const) {
  test(`warning colors stay consistent and soft ink readable in ${mode} and custom scopes`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=warning&theme=${mode}`);
    const expected = 'rgb(211, 139, 17)';
    for (const selector of ['.leaf-alert__icon', '.leaf-result__icon'])
      await expect(page.locator(selector)).toHaveCSS('color', expected);
    await expect(page.locator('.leaf-input')).toHaveCSS('border-color', expected);
    await expect(page.locator('.leaf-badge__indicator')).toHaveCSS('background-color', expected);
    for (const variant of ['soft']) {
      const colors = await page.locator(`.leaf-tag--${variant}`).evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          foreground: style.color,
          background: style.backgroundColor,
        };
      });
      expect(readability(colors.foreground, colors.background)).toBeGreaterThanOrEqual(4.5);
    }
    await expect(page.locator('.leaf-tag--outline .leaf-tag__dot')).toHaveCSS(
      'background-color',
      expected,
    );
    await page.getByRole('button', { name: 'Message warning', exact: true }).click();
    await expect(page.locator('.leaf-message__icon')).toHaveCSS('color', expected);
    await page.getByRole('button', { name: 'Notification warning', exact: true }).click();
    await expect(page.locator('.leaf-notification__icon')).toHaveCSS('color', expected);
    await page.getByRole('button', { name: 'Popconfirm warning', exact: true }).click();
    await expect(page.locator('.leaf-popconfirm__icon')).toHaveCSS('color', expected);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Confirm warning', exact: true }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Warning confirmation' });
    await expect(dialog.locator('.leaf-confirm__icon')).toHaveCSS('color', expected);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Change warning color', exact: true }).click();
    const custom = 'rgb(232, 88, 12)';
    for (const selector of [
      '.leaf-alert__icon',
      '.leaf-result__icon',
      '.leaf-message__icon',
      '.leaf-notification__icon',
    ])
      await expect(page.locator(selector)).toHaveCSS('color', custom);
    await page.getByRole('button', { name: 'Confirm warning', exact: true }).click();
    await expect(dialog.locator('.leaf-confirm__icon')).toHaveCSS('color', custom);
  });
}
