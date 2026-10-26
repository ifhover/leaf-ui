import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Confirm examples: ${language} ${width} ${appearance}`, async ({ page }, testInfo) => {
        const en = language === 'en';
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${en ? '/en' : ''}/components/confirm.html`);
        const root = page.locator('html');
        if (
          Boolean((await root.getAttribute('class'))?.includes('dark')) !==
          (appearance === 'dark')
        ) {
          await page
            .getByRole('button', {
              name: en ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
            })
            .first()
            .click();
        }
        const examples = page.locator('.leaf-component-example');
        await expect(examples).toHaveCount(4);
        await examples
          .first()
          .getByRole('button', { name: en ? 'Save changes' : '保存更改', exact: true })
          .click();
        const dialog = page.getByRole('alertdialog');
        await expect(dialog).toHaveAccessibleName(en ? 'Save changes?' : '保存更改？');
        await dialog
          .getByRole('button', { name: en ? 'Keep editing' : '继续编辑', exact: true })
          .click();
        await expect(dialog).toBeHidden();
        for (const label of en
          ? ['Information', 'Success', 'Warning']
          : ['信息提示', '成功提示', '警告确认']) {
          await examples.nth(1).getByRole('button', { name: label, exact: true }).click();
          await expect(dialog.locator('.leaf-confirm__icon')).toBeVisible();
          if (label === 'Success' || label === '成功提示') {
            await expect(
              dialog.getByRole('button', { name: en ? 'Cancel' : '取消', exact: true }),
            ).toHaveCount(0);
          }
          await page.keyboard.press('Escape');
          await expect(dialog).toBeHidden();
        }
        await examples
          .nth(2)
          .getByRole('button', { name: en ? 'Delete project' : '删除项目', exact: true })
          .click();
        await dialog.getByRole('button', { name: en ? 'OK' : '确定', exact: true }).click();
        await expect(dialog).toBeHidden();
        await examples
          .nth(3)
          .getByRole('button', { name: en ? 'Submit with retry' : '提交与重试', exact: true })
          .click();
        const accept = dialog.getByRole('button', { name: en ? 'OK' : '确定', exact: true });
        await accept.click();
        await expect(dialog.getByRole('alert')).toHaveText(
          en ? 'Unable to submit. Please try again.' : '暂时无法提交，请重试。',
        );
        await expect(accept).toBeEnabled();
        const bounds = await dialog.boundingBox();
        expect(bounds).not.toBeNull();
        expect((bounds?.y ?? 0) + (bounds?.height ?? 0) / 2).toBeLessThan(450);
        await page.screenshot({ path: testInfo.outputPath('confirm-retry.png') });
        await accept.click();
        await expect(dialog).toBeHidden();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
        const source = examples.nth(3);
        await source
          .getByRole('button', { name: en ? 'Expand code' : '展开代码', exact: true })
          .click();
        await source
          .getByRole('button', { name: en ? 'Copy code' : '复制代码', exact: true })
          .click();
        expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('attempts');
        await source
          .getByRole('button', { name: en ? 'Collapse code' : '收起代码', exact: true })
          .click();
      });
    }
  }
}
