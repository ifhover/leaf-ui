import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Button examples: ${language} ${width} ${appearance}`, async ({ page }, testInfo) => {
        const english = language === 'en';
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${english ? '/en' : ''}/components/button.html`);
        const root = page.locator('html');
        const dark = (await root.getAttribute('class'))?.includes('dark');
        if (Boolean(dark) !== (appearance === 'dark')) {
          const toggle = english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/;
          await page.getByRole('button', { name: toggle }).first().click();
        }
        await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
        const example = (zh: string, en: string) =>
          page.getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true });
        const preview = (zh: string, en: string) =>
          example(zh, en).locator('.leaf-component-example__preview');

        const basic = preview('基础用法', 'Basic usage');
        const save = basic.getByRole('button', { name: english ? 'Save' : '保存', exact: true });
        await expect(basic.getByRole('button')).toHaveCount(1);
        await expect(save).toHaveAttribute('type', 'button');
        await expect(save).toBeEnabled();
        await expect(save).toHaveClass(/leaf-button--outline/);
        await expect(save).toHaveCSS('height', '34px');

        const variants = preview('按钮外观', 'Appearance');
        await expect(variants.getByRole('button')).toHaveCount(4);
        const text = variants.locator('.leaf-button--text');
        await expect(text).toHaveCount(1);
        await expect(text).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        await expect(text).toHaveCSS('height', '34px');
        await text.hover();
        await expect(text).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        await variants.screenshot({ path: testInfo.outputPath('button-variants.png') });

        const sizes = preview('尺寸', 'Sizes');
        for (const [size, height] of [
          ['sm', 28],
          ['md', 34],
          ['lg', 40],
        ] as const) {
          await expect(sizes.locator(`.leaf-button--${size}`)).toHaveCSS('height', `${height}px`);
        }
        const states = preview('禁用与加载', 'Disabled and loading');
        await expect(states.getByRole('button', { disabled: true })).toHaveCount(2);
        await expect(states.locator('button[aria-busy="true"]')).toBeDisabled();

        for (const comparison of [variants, sizes, states, preview('危险操作', 'Danger actions')]) {
          const geometry = await comparison.locator('.leaf-grid').evaluate((grid) => {
            const children = [...grid.children];
            const labels = children
              .filter((_, index) => index % 2 === 0)
              .map((node) => node.getBoundingClientRect());
            const controls = children
              .filter((_, index) => index % 2 === 1)
              .map((node) => node.getBoundingClientRect());
            const [firstLabel] = labels;
            const [firstControl] = controls;
            if (!firstLabel || !firstControl || labels.length !== controls.length) {
              throw new Error('Button comparison must contain matching label/control pairs');
            }
            const pairs = labels.map((label, index) => {
              const control = controls[index];
              if (!control) throw new Error(`Missing button control for comparison row ${index}`);
              return { label, control };
            });
            return {
              labelsAligned: labels.every((box) => Math.abs(box.left - firstLabel.left) < 1),
              controlsAligned: controls.every((box) => Math.abs(box.left - firstControl.left) < 1),
              stacked: pairs.every(({ label, control }) => label.bottom <= control.top),
              beside: pairs.every(({ label, control }) => label.right <= control.left),
            };
          });
          expect(geometry.labelsAligned).toBe(true);
          expect(geometry.controlsAligned).toBe(true);
          expect(width === 375 ? geometry.stacked : geometry.beside).toBe(true);
        }

        const icons = preview('图标', 'Icons');
        await expect(
          icons.getByRole('button', { name: english ? 'Add project' : '添加项目', exact: true }),
        ).toBeVisible();
        await expect(
          icons.getByRole('button', { name: english ? 'Delete project' : '删除项目', exact: true }),
        ).toBeVisible();

        const asyncSave = preview('异步保存', 'Async saving');
        const asyncButton = asyncSave.getByRole('button');
        await expect(asyncSave.getByRole('status')).toHaveText(
          english ? 'Not saved yet' : '尚未保存',
        );
        await page.clock.install();
        await asyncButton.click();
        await expect(asyncButton).toBeDisabled();
        await expect(asyncButton).toHaveAttribute('aria-busy', 'true');
        await expect(asyncButton).toHaveAccessibleName(english ? 'Save changes' : '保存更改');
        const repeatedClicks = await asyncButton.evaluate((node) => {
          let clicks = 0;
          const onClick = () => clicks++;
          node.addEventListener('click', onClick);
          // Native clicks on a loading button must not reach its async handler.
          (node as HTMLButtonElement).click();
          (node as HTMLButtonElement).click();
          node.removeEventListener('click', onClick);
          return clicks;
        });
        expect(repeatedClicks).toBe(0);
        await page.clock.fastForward(1200);
        await expect(asyncSave.getByRole('status')).toHaveText(
          english ? 'Changes saved' : '更改已保存',
        );
        await expect(asyncButton).toBeEnabled();
        await expect(asyncButton).toHaveAccessibleName(english ? 'Save again' : '再次保存');
        await asyncButton.click();
        await expect(asyncButton).toBeDisabled();
        await page.clock.fastForward(1200);
        await expect(asyncButton).toBeEnabled();

        const split = preview('分裂按钮', 'Split button');
        await split.getByRole('button', { name: english ? 'Save' : '保存', exact: true }).click();
        await expect(split.getByRole('status')).toHaveText(english ? 'Saved' : '已保存');
        const more = split.getByRole('button', {
          name: english ? 'More save options' : '更多保存方式',
          exact: true,
        });
        for (const [action, result] of english
          ? ([
              ['Save a copy', 'Copy saved'],
              ['Save draft', 'Draft saved'],
            ] as const)
          : ([
              ['保存副本', '副本已保存'],
              ['存为草稿', '草稿已保存'],
            ] as const)) {
          await more.click();
          const menuItem = page.getByRole('menuitem', { name: action, exact: true });
          await menuItem.click();
          await expect(split.getByRole('status')).toHaveText(result);
          await expect(menuItem).not.toBeVisible();
        }
        await split.screenshot({ path: testInfo.outputPath('button-split.png') });

        for (const [region, source] of [
          [example('基础用法', 'Basic usage'), 'function ButtonBasic'],
          [example('按钮外观', 'Appearance'), 'variant={value}'],
          [example('分裂按钮', 'Split button'), 'function SplitButtonDemo'],
        ] as const) {
          await region
            .getByRole('button', { name: english ? 'Copy code' : '复制代码', exact: true })
            .click();
          await expect
            .poll(() => page.evaluate(() => navigator.clipboard.readText()))
            .toContain(source);
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        expect(errors).toEqual([]);
      });
    }
  }
}
