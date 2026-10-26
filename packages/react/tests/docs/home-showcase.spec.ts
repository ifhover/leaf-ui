import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 960, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Homepage showcase: ${language} ${width} ${appearance}`, async ({ page }) => {
        const english = language === 'en';
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (message.type() === 'error') errors.push(message.text());
        });
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(english ? '/en/' : '/');
        if (
          Boolean((await page.locator('html').getAttribute('class'))?.includes('dark')) !==
          (appearance === 'dark')
        ) {
          await page.locator('.leaf-docs-theme-button').click();
        }
        const showroom = page.getByRole('region', {
          name: english ? 'Component scene preview' : '组件场景预览',
          exact: true,
        });
        const scenes = showroom.getByRole('tablist', {
          name: english ? 'Preview scene' : '预览场景',
        });
        await expect(scenes.getByRole('tab')).toHaveCount(2);
        await expect(scenes.getByRole('tab', { name: english ? 'Files' : '文件' })).toHaveCount(0);
        const url = page.url();
        const components = showroom.locator('.leaf-component-scene');
        await expect(
          components.getByRole('heading', {
            name: english ? 'Sign in to Leaf' : '登录 Leaf 工作台',
          }),
        ).toBeVisible();
        const actions = components.getByRole('region', {
          name: english ? 'Quick actions' : '常用操作',
          exact: true,
        });
        await expect(actions).toBeVisible();
        await expect(actions.getByRole('button')).toHaveCount(4);
        const tags = components.getByRole('region', {
          name: english ? 'Status & tags' : '状态与标签',
          exact: true,
        });
        await expect(tags).toBeVisible();
        await expect(tags.locator('.leaf-tag')).toHaveCount(6);
        if (width > 1000) {
          const bottoms = await components
            .locator(':scope > .leaf-component-scene__column')
            .evaluateAll((columns) =>
              columns.map((column) => column.getBoundingClientRect().bottom),
            );
          expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThan(80);
        }

        for (const button of await components.getByRole('button').all()) await button.click();
        await components.getByRole('tab', { name: '30D', exact: true }).click();
        await expect(components.getByRole('tab', { name: '7D', exact: true })).toHaveAttribute(
          'aria-selected',
          'true',
        );
        for (const control of await components.locator('input[type="checkbox"]').all()) {
          const checked = await control.isChecked();
          await control.click();
          expect(await control.isChecked()).toBe(checked);
        }
        for (const radio of await components.getByRole('radio').all()) {
          await radio.click();
          await expect(components.locator('input[type="radio"][value="team"]')).toBeChecked();
        }
        for (const input of await components
          .locator('input:not([type="checkbox"]):not([type="radio"])')
          .all()) {
          await expect(input).toHaveAttribute('readonly', '');
        }
        const colors = showroom.getByRole('group', {
          name: english ? 'Scene accent' : '场景主题色',
        });
        const blue = colors.getByRole('button', { name: english ? 'Blue' : '亮蓝', exact: true });
        await blue.click();
        await expect(blue).toHaveAttribute('aria-pressed', 'true');
        await colors.getByRole('button', { name: english ? 'Theme green' : '主题绿' }).click();
        if (width <= 640) {
          for (const card of await components
            .locator('.leaf-component-scene__column > .leaf-card')
            .all()) {
            const dimensions = await card.evaluate((node) => ({
              card: node.getBoundingClientRect().width,
              column: node.parentElement?.getBoundingClientRect().width ?? 0,
            }));
            expect(Math.abs(dimensions.card - dimensions.column)).toBeLessThanOrEqual(1);
          }
        }
        await components.screenshot({ path: test.info().outputPath('components.png') });

        await scenes
          .getByRole('tab', { name: english ? 'Workspace' : '工作台', exact: true })
          .click();
        const workspace = showroom.locator('.leaf-workspace');
        await expect(workspace).toBeVisible();
        const menu = workspace.locator('.leaf-menu--raised');
        if (width > 860) {
          await expect(menu).toBeVisible();
          await menu.getByRole('menuitem', { name: english ? /Projects/ : /项目/ }).click();
          await expect(menu.locator('[data-selected]')).toContainText(
            english ? 'Overview' : '概览',
          );
        } else {
          await expect(menu).toBeHidden();
        }
        for (const button of await workspace.getByRole('button').all()) await button.click();
        await expect(page).toHaveURL(url);
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(page.locator('.leaf-message, .leaf-notification')).toHaveCount(0);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        expect(await workspace.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
        await showroom.screenshot({ path: test.info().outputPath('workspace.png') });

        await scenes
          .getByRole('tab', { name: english ? 'Components' : '组件', exact: true })
          .click();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        expect(await components.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(
          true,
        );
        expect(errors).toEqual([]);
      });
    }
  }
}
