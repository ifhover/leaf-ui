import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`Result keeps bare icons and compact typography in ${theme}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/?fixture=feedback&theme=${theme}`);
    const results = page.locator('.leaf-result');
    await expect(results).toHaveCount(6);
    for (const result of await results.all()) {
      const icon = result.locator('.leaf-result__icon');
      await expect(icon).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(icon).toHaveCSS('border-top-width', '0px');
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
      await expect(result.locator('.leaf-result__description')).toHaveCSS('font-size', '13px');
      const small = await result.evaluate((node) => node.classList.contains('leaf-result--sm'));
      await expect(icon.locator('svg')).toHaveCSS('width', small ? '36px' : '48px');
      await expect(icon.locator('svg')).toHaveCSS('height', small ? '36px' : '48px');
      await expect(result.locator('.leaf-result__title')).toHaveCSS(
        'font-size',
        small ? '14px' : '16px',
      );
    }
    await expect(page.locator('.leaf-result--danger .lucide-circle-alert')).toHaveCount(2);
    for (const icon of await page.locator('.leaf-result--danger .leaf-result__icon').all()) {
      await expect(icon).toHaveCSS('color', 'rgb(221, 63, 46)');
    }
    await expect(page.locator('.leaf-result--success .lucide-check')).toBeVisible();
    await expect(page.locator('.leaf-result--warning .lucide-triangle-alert')).toBeVisible();
    await expect(page.locator('.leaf-result--info .lucide-info')).toBeVisible();
    await expect(page.locator('.leaf-result--empty .lucide-inbox')).toBeVisible();
    const variants = page.getByRole('region', { name: 'Result variants' });
    await variants.screenshot({
      path: testInfo.outputPath(`result-${theme}.png`),
      animations: 'disabled',
    });
  });
}
