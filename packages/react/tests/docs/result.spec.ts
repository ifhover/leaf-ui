import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Result examples: ${language} ${width} ${appearance}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${language === 'en' ? '/en' : ''}/components/result.html`);
        const root = page.locator('html');
        const dark = Boolean((await root.getAttribute('class'))?.includes('dark'));
        if (dark !== (appearance === 'dark')) {
          await page
            .getByRole('button', {
              name: language === 'en' ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
            })
            .first()
            .click();
        }
        await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
        const examples = page.locator('.leaf-component-example');
        const sizes = examples.nth(2);
        for (const [size, pixels] of [
          ['sm', 36],
          ['md', 48],
        ] as const) {
          const result = sizes.locator(`.leaf-result--${size}`);
          await expect(result).toBeVisible();
          await expect(result.locator('svg')).toHaveCSS('width', `${pixels}px`);
          await expect(result.locator('.leaf-result__icon')).toHaveCSS(
            'background-color',
            'rgba(0, 0, 0, 0)',
          );
        }
        const danger = examples.nth(1).locator('.leaf-result--danger');
        await expect(danger.locator('.lucide-circle-alert')).toHaveCount(1);
        await expect(danger.locator('.leaf-result__icon')).toHaveCSS('color', 'rgb(221, 63, 46)');
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        await sizes
          .getByRole('button', {
            name: language === 'en' ? 'Copy code' : '复制代码',
            exact: true,
          })
          .click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('size="sm"');
        expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('size="md"');
        await sizes.locator('.leaf-component-example__preview').screenshot({
          path: testInfo.outputPath('result-sizes.png'),
          animations: 'disabled',
        });
        await danger.screenshot({
          path: testInfo.outputPath('result-danger.png'),
          animations: 'disabled',
        });
      });
    }
  }
}
