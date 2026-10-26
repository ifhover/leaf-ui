import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en'] as const) {
  for (const width of [1280, 375] as const) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`FileList examples: ${language} ${width} ${appearance}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${language === 'en' ? '/en' : ''}/components/file-list.html`);
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
        const basic = examples.nth(0);
        const picture = examples.nth(1);
        const cards = examples.nth(2);

        await expect(basic.locator('.leaf-file-list__item')).toHaveCount(3);
        await expect(picture.locator('.leaf-file-list__icon img')).toHaveCount(2);
        await expect(cards.locator('.leaf-file-list__item')).toHaveCount(3);
        await expect(cards.locator('.leaf-file-list__icon img')).toHaveCount(2);
        await expect(cards.locator('.leaf-file-list__extension')).toHaveText('TXT');

        const cardTops = await cards
          .locator('.leaf-file-list__item')
          .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
        if (width === 1280) {
          expect(Math.max(...cardTops) - Math.min(...cardTops)).toBeLessThan(1);
        } else {
          expect(cardTops[1]).toBeGreaterThan((cardTops[0] ?? 0) + 80);
        }

        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);

        await cards
          .getByRole('button', {
            name: language === 'en' ? 'Copy code' : '复制代码',
            exact: true,
          })
          .click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('listType="picture-card"');

        if (width === 1280 && appearance === 'light') {
          const previewButton = cards
            .locator('.leaf-file-list__item')
            .first()
            .locator('button.leaf-file-list__action')
            .first();
          await previewButton.click();
          const dialog = page.getByRole('dialog');
          await expect(dialog).toBeVisible();
          await page.keyboard.press('Escape');
          await expect(dialog).toBeHidden();

          await page.screenshot({
            path: testInfo.outputPath(`docs-file-list-${language}-${width}-${appearance}.png`),
            fullPage: true,
            animations: 'disabled',
          });
        }
      });
    }
  }
}
