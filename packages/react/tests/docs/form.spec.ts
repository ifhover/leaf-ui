import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Form examples: ${language} ${width} ${appearance}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${language === 'en' ? '/en' : ''}/components/form.html`);
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
        await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
        const previews = page.locator('.leaf-component-example__preview');
        const basic = previews.nth(0);
        const actions = basic.locator('.leaf-form-field__body').last();
        const submit = actions.getByRole('button').first();
        await expect(submit).toBeVisible();
        await expect(submit).toHaveClass(/leaf-button--solid/);
        await expect(basic.locator('form')).toHaveCSS('row-gap', '16px');
        await expect(basic.locator('form')).toHaveCSS('--leaf-form-label-width', '112px');
        await expect(
          page
            .getByRole('region', {
              name: language === 'en' ? 'Error summary example' : '错误汇总示例',
              exact: true,
            })
            .getByRole('button', {
              name: language === 'en' ? 'Validate' : '检查表单',
              exact: true,
            }),
        ).toHaveClass(/leaf-button--solid/);
        expect(
          await submit.evaluate((node) =>
            Math.abs(
              node.getBoundingClientRect().left -
                (node.closest('.leaf-form-field__body') as HTMLElement).getBoundingClientRect()
                  .left,
            ),
          ),
        ).toBeLessThan(1);
        const labels = previews.nth(1);
        const form = labels.locator('form');
        await expect(form).toHaveCSS('--leaf-form-label-width', '140px');
        const fields = form.locator('.leaf-form-field');
        await expect(fields).toHaveCount(3);
        for (const index of [0, 1, 2]) {
          const expectedWidth = index === 2 ? 80 : 140;
          const field = fields.nth(index);
          await expect(field).toHaveCSS('--leaf-form-label-width', `${expectedWidth}px`);
          if (width === 1280) {
            expect(
              await field
                .locator('.leaf-form-field__header')
                .evaluate((node) => node.getBoundingClientRect().width),
            ).toBe(expectedWidth);
          } else {
            const header = await field.locator('.leaf-form-field__header').boundingBox();
            const body = await field.locator('.leaf-form-field__body').boundingBox();
            if (!header || !body) throw new Error('Missing stacked form field');
            expect(body.y).toBeGreaterThanOrEqual(header.y + header.height);
          }
        }
        const settings = previews.nth(2).locator('.leaf-form-field');
        await expect(settings.nth(1)).toHaveCSS('padding-block-start', '12px');
        await expect(settings.nth(1)).toHaveCSS('border-block-start-style', 'dashed');
        await expect(settings.nth(2)).toHaveCSS('border-block-start-style', 'dashed');
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        const example = page.locator('.leaf-component-example').nth(1);
        await example
          .getByRole('button', {
            name: language === 'en' ? 'Copy code' : '复制代码',
            exact: true,
          })
          .click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('labelWidth={140}');
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('labelWidth={80}');
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .not.toContain("'auto'");
        await previews.nth(0).screenshot({ path: test.info().outputPath('form-basic.png') });
        await previews.nth(2).screenshot({ path: test.info().outputPath('form-settings.png') });
      });
    }
  }
}
