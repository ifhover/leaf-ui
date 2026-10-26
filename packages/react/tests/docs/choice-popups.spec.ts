import { expect, type Locator, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

async function radius(locator: Locator) {
  return locator.evaluate((node) => getComputedStyle(node).borderTopLeftRadius);
}

async function expectChoice(panel: Locator, row: Locator, field: Locator) {
  await expect(panel).toHaveCSS('border-top-left-radius', await radius(field));
  await expect(row).toHaveCSS(
    'border-radius',
    `${Math.max(0, Number.parseFloat(await radius(panel)) - 2)}px`,
  );
  await expect(row).toHaveCSS('min-height', '34px');
  await row.hover();
  await expect
    .poll(() => row.evaluate((node) => getComputedStyle(node, '::before').backgroundColor))
    .toBe('rgba(0, 0, 0, 0.04)');
  await expect(panel.locator('.leaf-tree__highlight, .leaf-floating__highlight')).toHaveCount(0);
}

for (const { language, width, appearance } of [
  { language: 'zh', width: 1280, appearance: 'light' },
  { language: 'zh', width: 375, appearance: 'dark' },
  { language: 'en', width: 1280, appearance: 'dark' },
  { language: 'en', width: 375, appearance: 'light' },
] as const) {
  test(`choice popup examples: ${language} ${width} ${appearance}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: appearance });
    await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const component of ['tree-select', 'cascader', 'date-picker', 'dropdown', 'tree']) {
      await page.goto(`${language === 'en' ? '/en' : ''}/components/${component}.html`);
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
      const preview = page.locator('.leaf-component-example__preview').first();
      if (component === 'tree') {
        const row = preview.locator('.leaf-tree__row').nth(1);
        await row.scrollIntoViewIfNeeded();
        await expect(row).toHaveCSS('border-radius', '6px');
        await row.hover();
        await expect
          .poll(() => row.evaluate((node) => getComputedStyle(node, '::before').backgroundColor))
          .toBe('rgba(0, 0, 0, 0.04)');
        await expect(preview.locator('.leaf-tree__highlight')).toHaveCount(0);
      } else if (component === 'dropdown') {
        const trigger = preview.getByRole('button', {
          name: language === 'en' ? 'More actions' : '更多操作',
        });
        await trigger.click();
        const panel = page.locator('.leaf-dropdown[data-state="open"]');
        await settleAnimations(panel);
        const row = panel.getByRole('menuitem').first();
        await expectChoice(panel, row, trigger);
        await expect(row).toHaveCSS('gap', '12px');
        const gap = await row.evaluate((node) => {
          const icon = node.querySelector('svg')?.getBoundingClientRect();
          const label = node.querySelector('.leaf-dropdown__label')?.getBoundingClientRect();
          return icon && label ? label.left - icon.right : null;
        });
        expect(gap).toBe(12);
      } else {
        const input = preview.getByRole('combobox').first();
        await input.click();
        const panel = page.locator('.leaf-floating[data-state="open"]');
        await settleAnimations(panel);
        const field = preview.locator(`.leaf-${component}`).first();
        await expect(panel).toHaveCSS('border-top-left-radius', await radius(field));
        if (component !== 'date-picker') {
          const row = panel
            .locator(component === 'tree-select' ? '.leaf-tree__row' : '.leaf-floating__option')
            .first();
          await expectChoice(panel, row, field);
        } else {
          await expect(panel.locator('.leaf-calendar')).toBeVisible();
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: test.info().outputPath(`${component}.png`) });
      await page.keyboard.press('Escape');
    }
    expect(errors).toEqual([]);
  });
}
