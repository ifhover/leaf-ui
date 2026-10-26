import { expect, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Menu documentation: ${language} ${width} ${appearance}`, async ({ page }, testInfo) => {
        const english = language === 'en';
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${english ? '/en' : ''}/components/menu.html`);
        const root = page.locator('html');
        const dark = (await root.getAttribute('class'))?.includes('dark');
        if (Boolean(dark) !== (appearance === 'dark')) {
          await page
            .getByRole('button', {
              name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
            })
            .first()
            .click();
        }
        await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);

        const examples = page.locator('.leaf-component-example');
        const previews = page.locator('.leaf-component-example__preview');
        await expect(previews).toHaveCount(7);
        for (const [index, preview] of (await previews.all()).entries()) {
          const geometry = await preview.evaluate((node) => {
            const container = node.querySelector('.leaf-component-example__preview-content');
            if (!container) throw new Error('Missing preview content');
            const outer = node.getBoundingClientRect();
            const content = container.getBoundingClientRect();
            return {
              centered: Math.abs(content.left + content.width / 2 - outer.left - outer.width / 2),
              fits: content.left >= outer.left && content.right <= outer.right,
              aligned: [...container.querySelectorAll('.leaf-menu')].every(
                (menu) => Math.abs(menu.getBoundingClientRect().left - content.left) < 1,
              ),
            };
          });
          expect(geometry.centered).toBeLessThan(1);
          expect(geometry.fits).toBe(true);
          expect(geometry.aligned).toBe(true);
          await settleAnimations(preview);
          await preview.screenshot({ path: testInfo.outputPath(`preview-${index}.png`) });
        }
        await page
          .getByRole('heading', { level: 1, exact: true, name: english ? 'Menu' : 'Menu 菜单' })
          .scrollIntoViewIfNeeded();
        await page.screenshot({ path: testInfo.outputPath('menu-page.png') });

        const comparison = previews.nth(2);
        const menus = comparison.locator('.leaf-menu');
        await expect(menus).toHaveCount(3);
        for (const menu of await menus.all()) {
          const label = menu.locator('xpath=preceding-sibling::*[1]');
          const labelBox = await label.boundingBox();
          const menuBox = await menu.boundingBox();
          if (!labelBox || !menuBox) throw new Error('Missing appearance comparison');
          expect(labelBox.x).toBeCloseTo(menuBox.x, 0);
          expect(labelBox.y + labelBox.height).toBeLessThanOrEqual(menuBox.y);
        }
        await comparison.screenshot({ path: testInfo.outputPath('appearance-comparison.png') });

        const basic = previews.first();
        await basic
          .getByRole('menuitem', { name: english ? 'Projects' : '项目', exact: true })
          .click();
        const design = basic.getByRole('menuitem', {
          name: english ? 'Design resources' : '设计资源',
          exact: true,
        });
        await expect(design).toBeVisible();
        await design.click();
        await expect(design).toHaveAttribute('aria-current', 'page');
        await design.press('End');
        await expect(
          basic.getByRole('menuitem', { name: english ? 'Settings' : '设置', exact: true }),
        ).toBeFocused();

        const collapse = previews.nth(3);
        await collapse.getByRole('switch').click();
        const collapsedMenu = collapse.locator('.leaf-menu');
        await expect(collapsedMenu).toHaveClass(/leaf-menu--collapsed/);
        await settleAnimations(collapsedMenu);
        await collapse
          .getByRole('menuitem', { name: english ? 'Projects' : '项目', exact: true })
          .click();
        const popup = page.locator('.leaf-dropdown[data-state="open"]');
        await expect(popup).toBeVisible();
        await popup
          .getByRole('menuitem', { name: english ? 'Design resources' : '设计资源', exact: true })
          .click();
        await collapse.getByRole('switch').click();
        await expect(collapsedMenu).not.toHaveClass(/leaf-menu--collapsed/);
        await collapse
          .getByRole('menuitem', { name: english ? 'Projects' : '项目', exact: true })
          .click();
        await expect(
          collapse.getByRole('menuitem', {
            name: english ? 'Design resources' : '设计资源',
            exact: true,
          }),
        ).toHaveAttribute('aria-current', 'page');

        const controlled = previews.nth(5);
        await controlled
          .getByRole('menuitem', { name: english ? 'Settings' : '设置', exact: true })
          .click();
        await expect(controlled.getByRole('status')).toContainText('settings');
        const custom = previews.last();
        await custom.getByRole('button', { name: english ? 'Create project' : '创建项目' }).click();
        await expect(custom.getByRole('status')).toHaveText(
          english ? 'Project created' : '项目已创建',
        );

        const sourceNames = [
          'MenuBasic',
          'MenuGroups',
          'MenuAppearance',
          'MenuCollapsed',
          'MenuExtra',
          'MenuControlled',
          'MenuCustomGroup',
        ];
        for (const [index, name] of sourceNames.entries()) {
          await examples
            .nth(index)
            .getByRole('button', { name: english ? 'Copy code' : '复制代码', exact: true })
            .click();
          await expect
            .poll(() => page.evaluate(() => navigator.clipboard.readText()))
            .toContain(`function ${name}`);
        }
        const appearanceSource = examples.nth(2);
        await expect(appearanceSource).toHaveAttribute('data-collapsible', 'true');
        await appearanceSource
          .getByRole('button', { name: english ? 'Expand code' : '展开代码', exact: true })
          .click();
        await expect(appearanceSource).toHaveAttribute('data-expanded', 'true');
        await appearanceSource
          .getByRole('button', { name: english ? 'Collapse code' : '收起代码', exact: true })
          .click();
        await expect(appearanceSource).toHaveAttribute('data-expanded', 'false');

        if (width === 1280) {
          const primary = comparison.locator('.leaf-menu--primary');
          const colorBefore = await primary.evaluate((node) =>
            getComputedStyle(node).getPropertyValue('--leaf-color-primary'),
          );
          await page
            .getByRole('button', { name: english ? 'Change theme color' : '切换主题色' })
            .click();
          await page.getByRole('button', { name: '#1d9bf0', exact: true }).click();
          await page.keyboard.press('Escape');
          await expect
            .poll(() =>
              primary.evaluate((node) =>
                getComputedStyle(node).getPropertyValue('--leaf-color-primary'),
              ),
            )
            .not.toBe(colorBefore);
          await expect(controlled.getByRole('status')).toContainText('settings');
        }

        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        expect(errors).toEqual([]);
      });
    }
  }
}
