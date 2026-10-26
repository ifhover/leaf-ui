import { expect, type Page, test } from '@playwright/test';

const profiles = [
  { width: 1280, appearance: 'light' },
  { width: 375, appearance: 'dark' },
] as const;

async function openContentPage(
  page: Page,
  component: 'typography' | 'statistic',
  english: boolean,
  { width, appearance }: (typeof profiles)[number],
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: appearance, reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
  if (component === 'statistic') {
    await page.clock.install({ time: new Date('2026-10-26T12:00:00Z') });
    await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
  }
  await page.goto(`${english ? '/en' : ''}/components/${component}.html`);
  const root = page.locator('html');
  const dark = (await root.getAttribute('class'))?.includes('dark');
  if (Boolean(dark) !== (appearance === 'dark')) {
    const toggle = english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/;
    await page.getByRole('button', { name: toggle }).first().click();
  }
  await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return {
    errors,
    preview: (zh: string, en: string) =>
      page
        .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
        .locator('.leaf-component-example__preview'),
  };
}

for (const english of [false, true]) {
  for (const profile of profiles) {
    const suffix = `${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`;

    test(`Typography examples: ${suffix}`, async ({ page }) => {
      const { preview, errors } = await openContentPage(page, 'typography', english, profile);
      const original = english ? 'Project notes' : '项目说明';
      const basic = preview('基础用法', 'Basic usage');
      await expect(
        basic.getByRole('heading', { level: 3, name: original, exact: true }),
      ).toBeVisible();
      await expect(basic.locator('p.leaf-paragraph')).toHaveCount(1);
      const apiLink = basic.getByRole('link', {
        name: english ? 'Read the API' : '查看 API',
        exact: true,
      });
      await expect(apiLink).toHaveAttribute('href', '#typography-api');
      await expect(page.locator('#typography-api')).toHaveCount(1);

      const copy = preview('复制', 'Copy');
      await expect(copy.locator('.leaf-text__content')).toHaveText(original);
      await page.evaluate(() => navigator.clipboard.writeText('Before typography copy'));
      await copy
        .getByRole('button', { name: english ? 'Copy text' : '复制文本', exact: true })
        .click();
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(original);

      const editable = preview('编辑', 'Edit');
      const edit = editable.getByRole('button', {
        name: english ? 'Edit text' : '编辑文本',
        exact: true,
      });
      const editor = editable.getByRole('textbox', {
        name: english ? 'Edit text' : '编辑文本',
        exact: true,
      });
      const rendered = editable.locator('.leaf-text__content');
      const updated = english ? 'Updated project notes' : '更新后的项目说明';
      await expect(rendered).toHaveText(original);
      await edit.click();
      await expect(editor).toBeFocused();
      await expect(editor).toHaveValue(original);
      await editor.fill(updated);
      await editor.press('Enter');
      await expect(editor).toHaveCount(0);
      await expect(rendered).toHaveText(updated);
      await edit.click();
      await expect(editor).toHaveValue(updated);
      await editor.fill(english ? 'Discard this change' : '不保存这次修改');
      await editor.press('Escape');
      await expect(editor).toHaveCount(0);
      await expect(rendered).toHaveText(updated);
      await edit.click();
      await expect(editor).toHaveValue(updated);
      await editor.press('Escape');
      await expect(rendered).toHaveText(updated);

      const ellipsis = preview('段落省略', 'Paragraph truncation');
      const content = ellipsis.locator('.leaf-paragraph .leaf-text__content');
      const toggle = ellipsis.getByRole('button');
      await expect(toggle).toHaveAccessibleName(english ? 'Expand' : '展开');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(content).toHaveCSS('-webkit-line-clamp', '2');
      const collapsed = await content.evaluate((node) => ({
        height: node.getBoundingClientRect().height,
        clipped: node.scrollHeight > node.clientHeight,
      }));
      expect(collapsed.clipped).toBe(true);
      await toggle.click();
      await expect(toggle).toHaveAccessibleName(english ? 'Collapse' : '收起');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(content).not.toHaveClass(/leaf-text__content--ellipsis/);
      expect(await content.evaluate((node) => node.getBoundingClientRect().height)).toBeGreaterThan(
        collapsed.height,
      );
      await toggle.click();
      await expect(toggle).toHaveAccessibleName(english ? 'Expand' : '展开');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(content).toHaveCSS('-webkit-line-clamp', '2');
      const restoredHeight = await content.evaluate((node) => node.getBoundingClientRect().height);
      expect(Math.abs(restoredHeight - collapsed.height)).toBeLessThan(1);
      expect(errors).toEqual([]);
    });

    test(`Statistic examples: ${suffix}`, async ({ page }) => {
      const { preview, errors } = await openContentPage(page, 'statistic', english, profile);
      const animation = preview('数值动画', 'Value animation');
      const number = animation.locator('.leaf-statistic__number');
      const target = animation.locator('.leaf-statistic__accessible');
      await expect(number).toHaveText('1,000.00');
      await expect(target).toHaveText('1,286.50');
      await page.clock.runFor(1100);
      await expect(number).toHaveText('1,286.50');
      await expect(number).not.toHaveAttribute('aria-hidden');
      await expect(target).toHaveCount(0);

      const basic = preview('基础用法', 'Basic usage');
      await expect(basic.locator('.leaf-statistic__title')).toHaveText(
        english ? 'Active users' : '活跃用户',
      );
      await expect(basic.locator('.leaf-statistic__number')).toHaveText('1,286');
      const formatting = preview('数值格式', 'Number formatting');
      await expect(formatting.locator('.leaf-grid > .leaf-text')).toHaveText(
        english ? ['Amount', 'Percentage'] : ['金额', '百分比'],
      );
      const amount = formatting.locator('.leaf-statistic').filter({ hasText: '¥' });
      await expect(amount.locator('.leaf-statistic__number')).toHaveText('12,856.80');
      const percentage = formatting.locator('.leaf-statistic').filter({ hasText: '%' });
      await expect(percentage.locator('.leaf-statistic__number')).toHaveText('12.5');
      await expect(percentage.locator('.leaf-statistic__suffix')).toHaveText('%');

      await animation
        .getByRole('button', { name: english ? 'Increase' : '增加', exact: true })
        .click();
      await expect(number).toHaveText('1,286.50');
      await expect(target).toHaveText('1,786.50');
      await page.clock.runFor(1100);
      await expect(number).toHaveText('1,786.50');
      await expect(target).toHaveCount(0);
      await animation
        .getByRole('button', { name: english ? 'Decrease' : '减少', exact: true })
        .click();
      await expect(target).toHaveText('1,286.50');
      await page.clock.runFor(1100);
      await expect(number).toHaveText('1,286.50');
      await animation
        .getByRole('button', {
          name: english ? 'Replay from 1,000' : '从 1,000 重播',
          exact: true,
        })
        .click();
      await expect(number).toHaveText('1,000.00');
      await expect(target).toHaveText('1,286.50');
      await page.clock.runFor(1100);
      await expect(number).toHaveText('1,286.50');
      await expect(target).toHaveCount(0);

      const countdown = preview('倒计时', 'Countdown');
      const remaining = countdown.locator('.leaf-statistic__number');
      const feedback = countdown.getByRole('status');
      const restart = countdown.getByRole('button', {
        name: english ? 'Restart' : '重新开始',
        exact: true,
      });
      const running = english ? 'Counting down' : '倒计时进行中';
      const finished = english ? 'Countdown finished' : '倒计时已结束';
      await restart.click();
      await expect(remaining).toHaveText('00:10');
      await expect(feedback).toHaveText(running);
      await page.clock.fastForward(9000);
      await expect(remaining).toHaveText('00:01');
      await expect(feedback).toHaveText(running);
      await page.clock.fastForward(1000);
      await expect(remaining).toHaveText('00:00');
      await expect(feedback).toHaveText(finished);
      await page.clock.fastForward(2000);
      await expect(remaining).toHaveText('00:00');
      await expect(feedback).toHaveText(finished);
      await restart.click();
      await expect(remaining).toHaveText('00:10');
      await expect(feedback).toHaveText(running);
      await page.clock.fastForward(9000);
      await expect(remaining).toHaveText('00:01');
      await expect(feedback).toHaveText(running);
      await page.clock.fastForward(1000);
      await expect(remaining).toHaveText('00:00');
      await expect(feedback).toHaveText(finished);
      expect(errors).toEqual([]);
    });
  }
}
