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
        const previews = page.locator('.leaf-component-example__preview');
        const basic = previews.nth(0).locator('.leaf-card');
        await expect(basic.getByRole('heading')).toHaveCSS('font-size', '16px');
        await expect(basic.getByRole('heading')).toHaveCSS('font-weight', '700');
        await expect(basic.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67');
        expect((await basic.boundingBox())?.width).toBeLessThanOrEqual(380);
        const basicInsets = await basic.evaluate((node) => {
          const heading = node.querySelector('.leaf-card__header');
          const actions = node.querySelector('.leaf-card__footer');
          if (!heading || !actions) throw new Error('Missing card sections');
          const header = getComputedStyle(heading);
          const footer = getComputedStyle(actions);
          return [header.paddingTop, header.paddingLeft, header.paddingRight, footer.paddingBottom];
        });
        expect(basicInsets).toEqual(['20px', '20px', '20px', '20px']);
        await previews.nth(0).screenshot({ path: test.info().outputPath('card-basic.png') });
        const choices = previews.nth(1).locator('.leaf-card');
        await expect(choices).toHaveCount(2);
        await expect(choices.nth(0)).toHaveClass(/leaf-card--selected/);
        await expect(choices.nth(1)).not.toHaveClass(/leaf-card--selected/);
        const person = choices
          .nth(0)
          .getByText(
            language === 'en' ? 'Home care · Available until 3:30 PM' : '上门护理 · 15:30 前空闲',
            { exact: true },
          );
        const description = choices
          .nth(0)
          .getByText(language === 'en' ? '88% match · Verified' : '匹配度 88% · 已认证', {
            exact: true,
          });
        await expect(person).toHaveCSS('font-size', '14px');
        await expect(description).toHaveCSS('font-size', '13px');
        await expect(description).toHaveCSS('line-height', '18px');
        await expect(description).toHaveCSS('font-weight', '400');
        const personBox = await person.boundingBox();
        const descriptionBox = await description.boundingBox();
        expect(descriptionBox?.x).toBeCloseTo(personBox?.x ?? 0, 1);
        for (const choice of await choices.all()) {
          await expect(choice.getByRole('heading')).toHaveCSS('font-size', '16px');
          await expect(choice.getByRole('heading')).toHaveCSS('font-weight', '700');
        }
        if (width === 1280) {
          const first = await choices.nth(0).getByRole('button').boundingBox();
          const second = await choices.nth(1).getByRole('button').boundingBox();
          expect(first?.y).toBeCloseTo(second?.y ?? 0, 1);
        }
        const select = choices.nth(1).getByRole('button');
        await select.focus();
        await select.press('Space');
        await expect(select).toHaveAttribute('aria-pressed', 'true');
        await expect(choices.nth(1)).toHaveClass(/leaf-card--selected/);
        await expect(choices.nth(1)).toHaveCSS('box-shadow', 'none');
        await expect(choices.nth(0)).not.toHaveClass(/leaf-card--selected/);
        await choices.nth(0).getByRole('button').click();
        await expect(choices.nth(0).getByRole('button')).toHaveAttribute('aria-pressed', 'true');
        await previews.nth(1).screenshot({ path: test.info().outputPath('card-selected.png') });
        const sizes = previews.nth(2).locator('.leaf-card');
        const available = await previews
          .nth(2)
          .locator('.leaf-component-example__preview-content')
          .boundingBox();
        for (const [index, size] of [300, 380, 460].entries()) {
          const box = await sizes.nth(index).boundingBox();
          expect(box?.width).toBeCloseTo(Math.min(size, available?.width ?? size), 0);
          await sizes.nth(index).getByRole('tab').nth(1).click();
          await expect(sizes.nth(index).getByRole('tabpanel')).toContainText(
            language === 'en' ? 'guidelines' : '规范',
          );
        }
        await previews.nth(2).screenshot({ path: test.info().outputPath('card-sizes.png') });
        const selectedExample = page.locator('.leaf-component-example').nth(1);
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
          .toContain('selected={active}');
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
