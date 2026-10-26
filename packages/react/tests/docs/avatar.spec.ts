import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`AvatarGroup examples: ${language} ${width} ${appearance}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${language === 'en' ? '/en' : ''}/components/avatar.html`);
        if (
          Boolean((await page.locator('html').getAttribute('class'))?.includes('dark')) !==
          (appearance === 'dark')
        ) {
          const toggle = language === 'en' ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/;
          await page.getByRole('button', { name: toggle }).first().click();
        }
        await expect(page.getByRole('heading', { level: 1 })).toContainText('AvatarGroup');
        const preview = (zh: string, en: string) =>
          page
            .getByRole('region', {
              name: language === 'en' ? `${en} example` : `${zh}示例`,
              exact: true,
            })
            .locator('.leaf-component-example__preview');
        const basic = preview('基础用法', 'Basic usage');
        const members = basic.locator('.leaf-avatar-group > .leaf-avatar');
        await expect(members).toHaveCount(5);
        const colors = await members.evaluateAll((nodes) =>
          nodes.map((node) => getComputedStyle(node).backgroundColor),
        );
        expect(new Set(colors).size).toBe(5);
        const sizes = preview('尺寸', 'Sizes').locator('.leaf-avatar-group');
        await expect(sizes).toHaveCount(3);
        for (const [index, size] of [28, 40, 56].entries()) {
          await expect(sizes.nth(index).locator('.leaf-avatar').first()).toHaveCSS(
            'width',
            `${size}px`,
          );
        }
        const overflow = preview('头像组折叠', 'Avatar group overflow').getByRole('button');
        await overflow.focus();
        const hidden = page.locator('.leaf-avatar-group__overflow .leaf-avatar');
        await expect(hidden).toHaveCount(2);
        expect(
          await hidden.evaluateAll((nodes) =>
            nodes.map((node) => getComputedStyle(node).backgroundColor),
          ),
        ).toEqual(colors.slice(3));
        await page.locator('.leaf-avatar-group__overflow').screenshot({
          path: test.info().outputPath('avatar-overflow.png'),
        });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await basic.screenshot({ path: test.info().outputPath('avatar-group.png') });
      });
    }
  }
}
