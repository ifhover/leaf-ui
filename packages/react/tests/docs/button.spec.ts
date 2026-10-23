import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Button examples: ${language} ${width} ${appearance}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${language === 'en' ? '/en' : ''}/components/button.html`);
        const dark = (await page.locator('html').getAttribute('class'))?.includes('dark');
        if (Boolean(dark) !== (appearance === 'dark')) {
          const toggle = language === 'en' ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/;
          await page.getByRole('button', { name: toggle }).first().click();
        }
        const preview = page.locator('.leaf-component-example__preview').first();
        const text = preview.locator('.leaf-button--text');
        await expect(text).toHaveCount(1);
        await expect(text).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        expect(await text.evaluate((node) => node.getBoundingClientRect().height)).toBe(34);
        await text.hover();
        await expect(text).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        await preview.screenshot({ path: testInfo.outputPath('button-variants.png') });
        await page
          .locator('.leaf-component-example')
          .first()
          .getByRole('button', {
            name: language === 'en' ? 'Copy code' : '复制代码',
            exact: true,
          })
          .click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('variant="text"');
      });
    }
  }
}
