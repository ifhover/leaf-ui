import { expect, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

for (const { language, width, appearance } of [
  { language: 'zh', width: 1280, appearance: 'light' },
  { language: 'zh', width: 375, appearance: 'dark' },
  { language: 'en', width: 1280, appearance: 'dark' },
  { language: 'en', width: 375, appearance: 'light' },
] as const) {
  test(`dropdown docs content and sizes: ${language} ${width} ${appearance}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: appearance });
    await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
    await page.goto(`${language === 'en' ? '/en' : ''}/components/dropdown.html`);
    if (
      Boolean((await page.locator('html').getAttribute('class'))?.includes('dark')) !==
      (appearance === 'dark')
    ) {
      await page
        .getByRole('button', {
          name: language === 'en' ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
        })
        .first()
        .click();
    }
    const example = (zh: string, en: string) =>
      page
        .getByRole('region', {
          name: language === 'en' ? `${en} example` : `${zh}示例`,
          exact: true,
        })
        .locator('.leaf-component-example__preview');
    await example('右侧内容', 'Trailing content').getByRole('button').click();
    const panel = page.locator('.leaf-dropdown[data-state="open"]');
    await settleAnimations(panel);
    const labels = panel.locator('.leaf-dropdown__label');
    for (const label of await labels.all()) {
      expect(await label.evaluate((node) => node.getBoundingClientRect().height)).toBeLessThan(25);
    }
    expect(await panel.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath('extra.png') });
    await page.keyboard.press('Escape');
    for (const [size, chinese, english, height, font] of [
      ['sm', '小', 'Small', 28, 13],
      ['md', '默认', 'Default', 34, 14],
      ['lg', '大', 'Large', 40, 16],
    ] as const) {
      await example('菜单尺寸', 'Menu sizes')
        .getByRole('group', { name: language === 'en' ? english : chinese, exact: true })
        .getByRole('button')
        .click();
      await settleAnimations(panel);
      const row = panel.getByRole('menuitem').first();
      await expect(row).toHaveCSS('font-size', `${font}px`);
      await expect(row).toHaveCSS('min-height', `${height}px`);
      await page.screenshot({ path: test.info().outputPath(`${size}.png`) });
      await page.keyboard.press('Escape');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
