import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Tag examples: ${language} ${width} ${appearance}`, async ({ page }, testInfo) => {
        const english = language === 'en';
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${english ? '/en' : ''}/components/tag.html`);
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
        await expect(basic.locator('.leaf-tag--soft')).toHaveCount(1);
        const tagBox = await basic.locator('.leaf-tag').boundingBox();
        expect(tagBox?.width).toBeLessThan(140);
        await expect(page.locator('.leaf-tag--solid')).toHaveCount(0);
        const colors = preview('颜色', 'Colors').locator('.leaf-tag');
        await expect(colors).toHaveCount(6);
        for (const [zh, en, slug] of [
          ['颜色', 'Colors', 'colors'],
          ['标签组', 'Tag selection', 'selection'],
          ['关闭标签', 'Closable tags', 'closable'],
        ] as const) {
          const compact = preview(zh, en);
          const geometry = await compact.evaluate((node) => {
            const content = node.querySelector('.leaf-component-example__preview-content');
            if (!content) throw new Error('Missing compact preview content');
            const tags = [...content.querySelectorAll('.leaf-tag')];
            const row = tags[0]?.parentElement;
            if (!row) throw new Error('Missing compact tag group');
            const outerBox = node.getBoundingClientRect();
            const contentBox = content.getBoundingClientRect();
            const outerStyle = getComputedStyle(node);
            const available =
              node.clientWidth -
              Number.parseFloat(outerStyle.paddingLeft) -
              Number.parseFloat(outerStyle.paddingRight);
            const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
            const groupWidth =
              tags.reduce((sum, tag) => sum + tag.getBoundingClientRect().width, 0) +
              gap * (tags.length - 1);
            const status = content.querySelector('[role="status"]');
            let feedbackWidth = 0;
            if (status) {
              const range = document.createRange();
              range.selectNodeContents(status);
              feedbackWidth = range.getBoundingClientRect().width;
            }
            return {
              centered: Math.abs(
                contentBox.left + contentBox.width / 2 - outerBox.left - outerBox.width / 2,
              ),
              naturalWidth: Math.abs(
                contentBox.width - Math.min(available, Math.max(groupWidth, feedbackWidth)),
              ),
              fits: contentBox.width <= available + 1,
            };
          });
          expect(geometry.centered).toBeLessThan(1);
          expect(geometry.naturalWidth).toBeLessThan(1);
          expect(geometry.fits).toBe(true);
          await compact.screenshot({ path: testInfo.outputPath(`tag-${slug}.png`) });
        }
        const variants = preview('外观', 'Appearance');
        await expect(variants.locator('.leaf-tag--soft')).toHaveCount(1);
        await expect(variants.locator('.leaf-tag--outline')).toHaveCount(1);
        const sizes = preview('尺寸', 'Sizes');
        for (const [size, height] of [
          ['sm', 20],
          ['md', 24],
          ['lg', 28],
        ] as const) {
          await expect(sizes.locator(`.leaf-tag--${size}`)).toHaveCSS('height', `${height}px`);
        }
        const checkable = preview('可选标签', 'Checkable tag').getByRole('button', {
          name: english ? 'Favorites only' : '只看收藏',
          exact: true,
        });
        await expect(checkable).toHaveAttribute('aria-pressed', 'false');
        await checkable.click();
        await expect(checkable).toHaveAttribute('aria-pressed', 'true');
        await checkable.click();
        await expect(checkable).toHaveAttribute('aria-pressed', 'false');

        const selection = preview('标签组', 'Tag selection');
        const design = selection.getByRole('button', {
          name: english ? 'Design' : '设计',
          exact: true,
        });
        const development = selection.getByRole('button', {
          name: english ? 'Development' : '开发',
          exact: true,
        });
        await expect(design).toHaveAttribute('aria-pressed', 'true');
        await expect(development).toHaveAttribute('aria-pressed', 'false');
        await expect(selection.getByRole('status')).toHaveText(
          english ? 'Selected: design' : '已选：design',
        );
        await development.click();
        await expect(development).toHaveAttribute('aria-pressed', 'true');
        await expect(selection.getByRole('status')).toHaveText(
          english ? 'Selected: design, dev' : '已选：design, dev',
        );
        await design.click();
        await expect(selection.getByRole('status')).toHaveText(
          english ? 'Selected: dev' : '已选：dev',
        );
        await development.click();
        await expect(selection.getByRole('status')).toHaveText(
          english ? 'Selected: None' : '已选：无',
        );

        const closable = preview('关闭标签', 'Closable tags');
        await expect(closable.locator('.leaf-tag')).toHaveCount(2);
        await closable.locator('.leaf-tag').filter({ hasText: 'Leaf' }).getByRole('button').click();
        await expect(closable.locator('.leaf-tag')).toHaveCount(1);
        await expect(closable.locator('.leaf-tag')).toHaveText('React');
        await closable
          .locator('.leaf-tag')
          .filter({ hasText: 'React' })
          .getByRole('button')
          .click();
        await expect(closable.locator('.leaf-tag')).toHaveCount(0);
        await expect(closable.getByRole('status')).toHaveText(
          english ? 'All tags closed' : '所有标签已关闭',
        );

        const icons = preview('圆点与图标', 'Dots and icons');
        await expect(icons.locator('.leaf-tag')).toHaveCount(3);
        await expect(icons.locator('.leaf-tag__dot')).toHaveCount(1);
        await expect(icons.locator('.leaf-tag__icon')).toHaveCount(1);
        for (const dot of await icons.locator('.leaf-tag__dot').all()) {
          await expect(dot).toHaveCSS('width', '6px');
          await expect(dot).toHaveCSS('height', '6px');
        }
        await expect(icons.locator('.leaf-tag__icon svg')).toHaveCSS('width', '13px');
        await expect(icons.locator('.leaf-tag__icon svg')).toHaveCSS('height', '13px');
        const noDot = icons
          .locator('.leaf-grid > .leaf-text')
          .filter({ hasText: english ? /^No dot$/ : /^无圆点$/ })
          .locator('xpath=following-sibling::*[1]');
        await expect(noDot.locator('.leaf-tag')).toHaveCount(1);
        await expect(noDot.locator('.leaf-tag__dot, .leaf-tag__icon')).toHaveCount(0);

        for (const comparison of [icons, variants, sizes]) {
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
              throw new Error('Tag comparison must contain matching label/control pairs');
            }
            const pairs = labels.map((label, index) => {
              const control = controls[index];
              if (!control) throw new Error(`Missing tag control for comparison row ${index}`);
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
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        await basic.screenshot({ path: testInfo.outputPath('tag-basic.png') });
        await icons.screenshot({ path: testInfo.outputPath('tag-icons.png') });
        await example('圆点与图标', 'Dots and icons')
          .getByRole('button', { name: english ? 'Copy code' : '复制代码', exact: true })
          .click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('dot={false}');
        expect(errors).toEqual([]);
      });
    }
  }
}
