import { expect, test } from '@playwright/test';

for (const variant of ['light', 'dark', 'rtl', 'narrow', 'reduced', 'tokens']) {
  test(`visual contract: ${variant}`, async ({ page }, testInfo) => {
    if (variant === 'narrow') await page.setViewportSize({ width: 375, height: 900 });
    if (variant === 'reduced') await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(
      `/?fixture=visual&theme=${variant === 'dark' ? 'dark' : 'light'}${variant === 'rtl' ? '&rtl=1' : ''}${variant === 'tokens' ? '&tokens=1' : ''}`,
    );
    await expect(page.getByRole('heading', { name: 'Theme and direction' })).toBeVisible();
    for (const [size, height] of [
      ['sm', 28],
      ['md', 34],
      ['lg', 40],
    ] as const) {
      const expectedHeight = height + (variant === 'tokens' ? 4 : 0);
      const button = page.getByTestId(`button-${size}`);
      expect(Math.round((await button.boundingBox())?.height ?? 0)).toBe(expectedHeight);
      if (variant === 'tokens') await expect(button).toHaveCSS('border-radius', '2px');
    }
    await expect(page.getByRole('textbox', { name: 'Invalid name' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(page.getByRole('textbox', { name: 'Disabled name' })).toBeDisabled();
    const root = page.locator('main');
    for (const picker of await page.locator('.leaf-color-picker').all()) {
      const bounds = await picker.boundingBox();
      const triggerBounds = await picker.locator('.leaf-color-picker__trigger').boundingBox();
      expect(bounds?.width ?? 0).toBeGreaterThanOrEqual((triggerBounds?.width ?? 0) - 1);
    }
    if (variant === 'dark')
      await expect(root).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
    if (variant === 'rtl') {
      await expect(root).toHaveCSS('direction', 'rtl');
      const tabs = page.getByRole('tab');
      await tabs.first().focus();
      await page.keyboard.press('ArrowLeft');
      await expect(tabs.nth(1)).toBeFocused();
    }
    if (variant === 'narrow') {
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        376,
      );
    }
    if (variant === 'reduced') {
      const duration = await page
        .getByTestId('button-md')
        .evaluate((node) => getComputedStyle(node).transitionDuration);
      expect(duration.split(',').every((value) => parseFloat(value) <= 0.01)).toBe(true);
    }
    await testInfo.attach(`visual-${variant}`, {
      body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
      contentType: 'image/png',
    });
  });
}
