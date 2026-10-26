import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en'] as const) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Image examples: ${language} ${width} ${appearance}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${language === 'en' ? '/en' : ''}/components/image.html`);
        const root = page.locator('html');
        if (
          Boolean((await root.getAttribute('class'))?.includes('dark')) !==
          (appearance === 'dark')
        ) {
          await page
            .getByRole('button', {
              name: language === 'en' ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
            })
            .first()
            .click();
        }
        const states = page.getByRole('region', {
          name: language === 'en' ? 'Empty and failed images example' : '空图片与加载失败示例',
          exact: true,
        });
        await expect(states.locator('.leaf-image')).toHaveCount(3);
        const placeholders = states.locator('.leaf-image__fallback');
        await expect(placeholders).toHaveCount(2);
        for (const index of [0, 1])
          await expect(placeholders.nth(index).locator('span')).toBeVisible();
        await expect(
          states.locator(
            `.leaf-image__placeholder[role="img"][aria-label="${language === 'en' ? 'Image unavailable' : '图片暂不可用'}"]`,
          ),
        ).toHaveText(language === 'en' ? 'Image unavailable' : '图片暂不可用');
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        await states.screenshot({ path: testInfo.outputPath('states.png') });
        const service = page.getByRole('region', {
          name: language === 'en' ? 'Imperative preview example' : '命令式预览示例',
          exact: true,
        });
        await service
          .getByRole('button', {
            name: language === 'en' ? 'Start with the second image' : '从第二张开始预览',
          })
          .click();
        await expect(page.locator('.leaf-image-viewer__count')).toHaveText('2 / 3');
        await expect(
          page.getByRole('button', {
            name: language === 'en' ? 'Actual size (1:1)' : '原始尺寸（1:1）',
          }),
        ).toBeEnabled();
        await expect(page.locator('.yarl__portal')).toHaveCSS('opacity', '1');
        const tools = page.locator('.leaf-image-viewer__tools');
        const bounds = await tools.boundingBox();
        if (!bounds) throw new Error('Missing viewer toolbar');
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
        await page.screenshot({ path: testInfo.outputPath('preview.png') });
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
      });
    }
  }
}
