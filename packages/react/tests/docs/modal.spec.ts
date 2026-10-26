import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    test(`Modal defaults: ${language} ${width}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: 'light' });
      await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      await page.goto(`${language === 'en' ? '/en' : ''}/components/modal.html`);
      const root = page.locator('html');
      if ((await root.getAttribute('class'))?.includes('dark')) {
        await page
          .getByRole('button', {
            name: language === 'en' ? /Switch to light theme/ : /切换到浅色主题/,
          })
          .first()
          .click();
      }
      await expect(root).not.toHaveClass(/dark/);
      await page
        .getByRole('button', {
          name: language === 'en' ? 'Edit title' : '编辑标题',
          exact: true,
        })
        .click();
      const dialog = page.getByRole('dialog', {
        name: language === 'en' ? 'Edit title' : '编辑标题',
        exact: true,
      });
      await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      const backdrop = page.locator('.leaf-modal-backdrop:visible');
      await expect(backdrop).toHaveCSS('backdrop-filter', 'none');
      await expect(backdrop).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.24)');
      await expect(dialog.locator('.leaf-modal__header')).toHaveCSS('padding-top', '20px');
      await expect(dialog.locator('.leaf-modal__header')).toHaveCSS('padding-left', '20px');
      await expect(dialog.locator('.leaf-modal__footer')).toHaveCSS('padding-right', '20px');
      await expect(dialog.locator('.leaf-modal__footer')).toHaveCSS('padding-bottom', '20px');
      await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
      await page.screenshot({ path: testInfo.outputPath('modal-default.png') });
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    });
  }
}
