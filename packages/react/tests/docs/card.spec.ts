import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Card examples: ${language} ${width} ${appearance}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${language === 'en' ? '/en' : ''}/components/card.html`);
        const root = page.locator('html');
        if (
          Boolean((await root.getAttribute('class'))?.includes('dark')) !==
          (appearance === 'dark')
        ) {
          const toggle = language === 'en' ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/;
          await page.getByRole('button', { name: toggle }).first().click();
        }
        const preview = (zh: string, en: string) =>
          page
            .getByRole('region', {
              name: language === 'en' ? `${en} example` : `${zh}示例`,
              exact: true,
            })
            .locator('.leaf-component-example__preview');
        const basicPreview = preview('基础用法', 'Basic usage');
        const selectedPreview = preview('选中状态', 'Selected state');
        const sizesPreview = preview('尺寸', 'Sizes');
        const basic = basicPreview.locator('.leaf-card');
        await expect(basic.getByRole('heading')).toHaveCSS('font-size', '16px');
        await expect(basic.getByRole('heading')).toHaveCSS('font-weight', '500');
        const contentWidth = await basicPreview
          .locator('.leaf-component-example__preview-content')
          .evaluate((node) => node.getBoundingClientRect().width);
        expect((await basic.boundingBox())?.width).toBeCloseTo(contentWidth, 0);
        expect(contentWidth).toBeLessThanOrEqual(480);
        await basicPreview.screenshot({ path: test.info().outputPath('card-basic.png') });
        const choices = selectedPreview.locator('.leaf-card');
        await expect(
          selectedPreview.locator('.leaf-component-example__preview-content > .leaf-flex'),
        ).toHaveCSS('gap', '16px');
        await expect(choices).toHaveCount(2);
        await expect(choices.nth(0)).toHaveClass(/leaf-card--selected/);
        await expect(choices.nth(1)).not.toHaveClass(/leaf-card--selected/);
        for (const choice of await choices.all()) {
          await expect(choice.getByRole('heading')).toHaveCSS('font-size', '16px');
          await expect(choice.getByRole('heading')).toHaveCSS('font-weight', '500');
        }
        const boxes = await choices.evaluateAll((nodes) =>
          nodes.map((node) => {
            const { left, top, bottom, width } = node.getBoundingClientRect();
            return { left, top, bottom, width };
          }),
        );
        const [firstChoice, secondChoice] = boxes;
        if (!firstChoice || !secondChoice) throw new Error('Missing selected-state card geometry');
        expect(firstChoice.left).toBeCloseTo(secondChoice.left, 1);
        expect(firstChoice.width).toBeCloseTo(secondChoice.width, 0);
        expect(firstChoice.bottom).toBeLessThanOrEqual(secondChoice.top);
        const select = choices.nth(1).getByRole('button');
        await select.focus();
        await select.press('Space');
        await expect(select).toHaveAttribute('aria-pressed', 'true');
        await expect(choices.nth(1)).toHaveClass(/leaf-card--selected/);
        await expect(choices.nth(1)).toHaveCSS('box-shadow', 'none');
        await expect(choices.nth(0)).not.toHaveClass(/leaf-card--selected/);
        await choices.nth(0).getByRole('button').click();
        await expect(choices.nth(0).getByRole('button')).toHaveAttribute('aria-pressed', 'true');
        await selectedPreview.screenshot({ path: test.info().outputPath('card-selected.png') });
        const sizes = sizesPreview.locator('.leaf-card');
        await expect(sizes).toHaveCount(3);
        const available = await sizesPreview
          .locator('.leaf-component-example__preview-content')
          .boundingBox();
        for (const size of await sizes.all()) {
          const box = await size.boundingBox();
          expect(box?.width).toBeCloseTo(available?.width ?? 0, 0);
          await expect(size).toContainText(
            language === 'en' ? 'The same card content.' : '相同的卡片内容。',
          );
        }
        const paddings = await sizes
          .locator('.leaf-card__body')
          .evaluateAll((nodes) =>
            nodes.map((node) => Number.parseFloat(getComputedStyle(node).paddingLeft)),
          );
        expect(paddings[0]).toBeLessThan(paddings[1] ?? 0);
        expect(paddings[1]).toBeLessThan(paddings[2] ?? 0);
        await sizesPreview.screenshot({ path: test.info().outputPath('card-sizes.png') });
        const selectedExample = page.getByRole('region', {
          name: language === 'en' ? 'Selected state example' : '选中状态示例',
          exact: true,
        });
        await selectedExample
          .getByRole('button', {
            name: language === 'en' ? 'Expand code' : '展开代码',
            exact: true,
          })
          .click();
        await expect(selectedExample).toHaveAttribute('data-expanded', 'true');
        await selectedExample
          .getByRole('button', { name: language === 'en' ? 'Copy code' : '复制代码', exact: true })
          .click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('selected={selected === option.key}');
        await selectedExample
          .getByRole('button', {
            name: language === 'en' ? 'Collapse code' : '收起代码',
            exact: true,
          })
          .click();
        await expect(selectedExample).toHaveAttribute('data-expanded', 'false');
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        const card = page.locator('.leaf-component-example__preview .leaf-card--layered');
        await expect(card).toBeVisible();
        const tag = card.locator('.leaf-tag--outline');
        await expect(tag).toHaveText(language === 'en' ? 'In progress' : '进行中');
        const panel = card.locator(':scope > .leaf-card__panel');
        await expect
          .poll(() => tag.evaluate((node) => getComputedStyle(node).backgroundColor))
          .toBe(await panel.evaluate((node) => getComputedStyle(node).backgroundColor));
        if (appearance === 'light')
          await expect(tag).toHaveCSS('background-color', 'rgb(255, 255, 255)');
        await expect(card.locator('.leaf-card__footer')).toHaveCount(0);
        await expect(card.getByRole('button')).toHaveCount(0);
        await expect(card.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
        await expect(card).toContainText(
          language === 'en' ? '6 of 10 tasks completed' : '已完成 6 / 10 项任务',
        );
        expect(
          await card.evaluate((node) => node.scrollWidth - node.clientWidth),
        ).toBeLessThanOrEqual(1);
        await card.screenshot({ path: test.info().outputPath('card-layered.png') });
        const example = page.locator('.leaf-component-example').filter({ has: card });
        const expand = example.getByRole('button', {
          name: language === 'en' ? 'Expand code' : '展开代码',
          exact: true,
        });
        await expand.click();
        await expect(example).toHaveAttribute('data-expanded', 'true');
        await example
          .getByRole('button', { name: language === 'en' ? 'Copy code' : '复制代码', exact: true })
          .click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('percent={60}');
        await example
          .getByRole('button', {
            name: language === 'en' ? 'Collapse code' : '收起代码',
            exact: true,
          })
          .click();
        await expect(example).toHaveAttribute('data-expanded', 'false');
      });
    }
  }
}
