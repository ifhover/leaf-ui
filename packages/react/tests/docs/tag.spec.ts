import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Tag examples: ${language} ${width} ${appearance}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${language === 'en' ? '/en' : ''}/components/tag.html`);
        const root = page.locator('html');
        const dark = (await root.getAttribute('class'))?.includes('dark');
        if (Boolean(dark) !== (appearance === 'dark')) {
          const toggle = language === 'en' ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/;
          await page.getByRole('button', { name: toggle }).first().click();
        }
        const basic = page.locator('.leaf-component-example__preview').first();
        await expect(basic.locator('.leaf-tag--soft:visible')).toHaveCount(6);
        await expect(basic.locator('.leaf-tag--outline:visible')).toHaveCount(6);
        await expect(page.locator('.leaf-tag--solid')).toHaveCount(0);
        for (const [name, height] of (language === 'en'
          ? [
              ['Small', 20],
              ['Large', 28],
              ['Default', 24],
            ]
          : [
              ['小', 20],
              ['大', 28],
              ['默认', 24],
            ]) as [string, number][]) {
          await basic.getByRole('tab', { name, exact: true }).click();
          const tags = basic.locator('.leaf-tag:visible');
          await expect(tags).toHaveCount(12);
          await expect(tags.first()).toHaveCSS('height', `${height}px`);
        }
        const icons = page.locator('.leaf-component-example__preview').nth(1);
        await expect(icons.locator('.leaf-tag__dot')).toHaveCount(8);
        await expect(icons.locator('.leaf-tag__icon')).toHaveCount(2);
        for (const dot of await icons.locator('.leaf-tag__dot').all()) {
          await expect(dot).toHaveCSS('width', '6px');
          await expect(dot).toHaveCSS('height', '6px');
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        await basic.screenshot({ path: testInfo.outputPath('tag-basic.png') });
        await icons.screenshot({ path: testInfo.outputPath('tag-icons.png') });
        const example = page.locator('.leaf-component-example').nth(1);
        await example
          .getByRole('button', { name: language === 'en' ? 'Copy code' : '复制代码', exact: true })
          .click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('dot={false}');
      });
    }
  }
}
