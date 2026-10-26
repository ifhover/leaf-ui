import { expect, type Page, test } from '@playwright/test';

for (const english of [false, true]) {
  for (const profile of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Scalar documentation interactions: ${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: profile.width, height: 900 });
        await page.emulateMedia({ colorScheme: profile.appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      });

      const preview = (page: Page, chineseTitle: string, englishTitle: string) =>
        page
          .getByRole('region', {
            name: english ? `${englishTitle} example` : `${chineseTitle}示例`,
            exact: true,
          })
          .locator('.leaf-component-example__preview');

      const visit = async (page: Page, slug: string) => {
        await page.goto(`${english ? '/en' : ''}/components/${slug}.html`);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        const root = page.locator('html');
        const dark = (await root.getAttribute('class'))?.includes('dark');
        if (Boolean(dark) !== (profile.appearance === 'dark')) {
          await page
            .getByRole('button', {
              name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
            })
            .first()
            .click();
        }
        await expect(root).toHaveClass(profile.appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
      };

      test('Slider respects marks and range bounds, previews values and commits on completion', async ({
        page,
      }) => {
        await visit(page, 'slider');

        const marks = preview(page, '离散刻度', 'Discrete marks');
        const discount = marks.getByRole('slider', {
          name: english ? 'Discount' : '折扣',
          exact: true,
        });
        await expect(discount).toHaveValue('25');
        await discount.press('ArrowRight');
        await expect(discount).toHaveValue('60');
        await discount.press('ArrowLeft');
        await expect(discount).toHaveValue('25');
        await marks.getByRole('button', { name: '60', exact: true }).click();
        await expect(discount).toHaveValue('60');

        const range = preview(page, '区间选择', 'Range');
        const start = range.getByRole('slider', {
          name: english ? 'Budget range Start' : '预算范围 开始',
          exact: true,
        });
        const end = range.getByRole('slider', {
          name: english ? 'Budget range End' : '预算范围 结束',
          exact: true,
        });
        await expect(start).toHaveValue('20');
        await expect(end).toHaveValue('70');
        await start.press('End');
        await expect(start).toHaveValue('70');
        await expect(end).toHaveValue('70');
        await end.press('Home');
        await expect(start).toHaveValue('70');
        await expect(end).toHaveValue('70');
        await start.press('Home');
        await expect(start).toHaveValue('0');
        await end.press('Home');
        await expect(end).toHaveValue('0');

        const states = preview(page, '只读与禁用', 'Read only and disabled');
        const readOnly = states.getByRole('slider', {
          name: english ? 'Read only' : '只读',
          exact: true,
        });
        await expect(readOnly).toHaveAttribute('aria-readonly', 'true');
        await readOnly.press('End');
        await expect(readOnly).toHaveValue('45');
        const disabled = states.getByRole('slider', {
          name: english ? 'Disabled' : '禁用',
          exact: true,
        });
        await expect(disabled).toBeDisabled();
        await expect(disabled).toHaveValue('45');

        const tooltip = preview(page, '数值提示', 'Value tooltip');
        const tooltipSlider = tooltip.getByRole('slider', {
          name: english ? 'Volume' : '音量',
          exact: true,
        });
        await tooltipSlider.focus();
        const valueTooltip = page.getByRole('tooltip');
        await expect(valueTooltip).toBeVisible();
        await expect(valueTooltip).toHaveText('35%');
        await tooltipSlider.press('ArrowRight');
        await expect(tooltipSlider).toHaveValue('36');
        await expect(valueTooltip).toHaveText('36%');

        const controlled = preview(page, '受控值与操作完成', 'Controlled value and completion');
        const volume = controlled.getByRole('slider', {
          name: english ? 'Volume' : '音量',
          exact: true,
        });
        const committed = controlled.getByRole('status');
        await expect(volume).toHaveValue('35');
        await expect(committed).toHaveText(english ? 'Committed: 35' : '已确认：35');
        await volume.focus();
        await page.keyboard.down('ArrowRight');
        await expect(volume).toHaveValue('36');
        await expect(
          controlled.getByText(english ? 'Current value: 36' : '当前值：36', { exact: true }),
        ).toBeVisible();
        await expect(committed).toHaveText(english ? 'Committed: 35' : '已确认：35');
        await page.keyboard.up('ArrowRight');
        await expect(committed).toHaveText(english ? 'Committed: 36' : '已确认：36');
        await controlled
          .getByRole('button', { name: english ? 'Reset' : '重置', exact: true })
          .click();
        await expect(volume).toHaveValue('35');
        await expect(
          controlled.getByText(english ? 'Current value: 35' : '当前值：35', { exact: true }),
        ).toBeVisible();
        await expect(committed).toHaveText(english ? 'Committed: 35' : '已确认：35');
      });

      test('Rate clears to zero, selects half stars and preserves locked and controlled values', async ({
        page,
      }) => {
        await visit(page, 'rate');

        const ratingName = english ? 'Project rating' : '项目评分';
        const basic = preview(page, '基础用法', 'Basic usage').getByRole('radiogroup', {
          name: ratingName,
          exact: true,
        });
        const initialRating = basic.getByRole('radio', { name: '3 / 5', exact: true });
        await expect(initialRating).toBeChecked();
        await initialRating.click();
        await expect(basic.getByRole('radio', { checked: true })).toHaveCount(0);

        const half = preview(page, '半星评分', 'Half-star ratings').getByRole('radiogroup', {
          name: ratingName,
          exact: true,
        });
        const halfRating = half.getByRole('radio', { name: '3.5 / 5', exact: true });
        await expect(halfRating).toBeChecked();
        await halfRating.press('ArrowRight');
        await expect(half.getByRole('radio', { name: '4 / 5', exact: true })).toBeChecked();
        await expect(halfRating).not.toBeChecked();
        await half.getByRole('radio', { name: '4 / 5', exact: true }).press('ArrowLeft');
        await expect(halfRating).toBeChecked();

        const states = preview(page, '只读与禁用', 'Read only and disabled');
        const readOnly = states.getByRole('radiogroup', {
          name: english ? 'Read-only rating' : '只读评分',
          exact: true,
        });
        await expect(readOnly).toHaveAttribute('aria-readonly', 'true');
        const readOnlyRating = readOnly.getByRole('radio', { name: '3 / 5', exact: true });
        await expect(readOnlyRating).toHaveAttribute('aria-disabled', 'true');
        await readOnlyRating.focus();
        await expect(readOnlyRating).toBeFocused();
        await readOnlyRating.press('End');
        await readOnlyRating.press('Delete');
        await expect(readOnlyRating).toBeChecked();
        await expect(readOnly.getByRole('radio', { checked: true })).toHaveCount(1);
        const disabled = states.getByRole('radiogroup', {
          name: english ? 'Disabled rating' : '禁用评分',
          exact: true,
        });
        await expect(disabled).toHaveAttribute('aria-disabled', 'true');
        await expect(disabled.getByRole('radio')).toHaveCount(5);
        for (const radio of await disabled.getByRole('radio').all()) {
          await expect(radio).toBeDisabled();
        }
        await expect(disabled.getByRole('radio', { name: '3 / 5', exact: true })).toBeChecked();

        const controlled = preview(page, '受控评分', 'Controlled rating');
        const rating = controlled.getByRole('radiogroup', { name: ratingName, exact: true });
        const feedback = controlled.getByRole('status');
        await rating.getByRole('radio', { name: '3 / 5', exact: true }).press('End');
        const maximum = rating.getByRole('radio', { name: '5 / 5', exact: true });
        await expect(maximum).toBeChecked();
        await expect(feedback).toHaveText(english ? 'Current rating: 5' : '当前评分：5');
        await maximum.press('Delete');
        await expect(rating.getByRole('radio', { checked: true })).toHaveCount(0);
        await expect(feedback).toHaveText(english ? 'Current rating: 0' : '当前评分：0');
        await controlled
          .getByRole('button', { name: english ? 'Reset' : '重置', exact: true })
          .click();
        await expect(rating.getByRole('radio', { name: '3 / 5', exact: true })).toBeChecked();
        await expect(feedback).toHaveText(english ? 'Current rating: 3' : '当前评分：3');
      });

      test('Progress clamps updates, reports success and exposes determinate values accurately', async ({
        page,
      }) => {
        await visit(page, 'progress');

        const controlled = preview(page, '更新进度', 'Updating progress');
        const upload = controlled.getByRole('progressbar', {
          name: english ? 'Upload progress' : '上传进度',
          exact: true,
        });
        const decrease = controlled.getByRole('button', {
          name: english ? 'Decrease' : '减少',
          exact: true,
        });
        const increase = controlled.getByRole('button', {
          name: english ? 'Increase' : '增加',
          exact: true,
        });
        await expect(upload).toHaveAttribute('aria-valuemin', '0');
        await expect(upload).toHaveAttribute('aria-valuemax', '100');
        await expect(upload).toHaveAttribute('aria-valuenow', '45');
        await decrease.click();
        await expect(upload).toHaveAttribute('aria-valuenow', '35');
        await expect(upload).toHaveAttribute('aria-valuetext', '35%');
        for (let index = 0; index < 4; index += 1) await decrease.click();
        await expect(upload).toHaveAttribute('aria-valuenow', '0');
        await expect(upload).toHaveAttribute('aria-valuetext', '0%');
        await expect(upload).toHaveAttribute('data-status', 'normal');
        await expect(decrease).toBeDisabled();
        await expect(increase).toBeEnabled();
        for (let index = 0; index < 10; index += 1) await increase.click();
        await expect(upload).toHaveAttribute('aria-valuenow', '100');
        await expect(upload).toHaveAttribute('aria-valuetext', '100%');
        await expect(upload).toHaveAttribute('data-status', 'success');
        await expect(upload).not.toHaveAttribute('data-active', 'true');
        await expect(increase).toBeDisabled();
        await expect(decrease).toBeEnabled();

        const indeterminate = preview(page, '不确定进度', 'Indeterminate progress').getByRole(
          'progressbar',
          {
            name: english ? 'Processing files' : '正在处理文件',
            exact: true,
          },
        );
        await expect(indeterminate).toHaveAttribute('data-indeterminate', 'true');
        await expect(indeterminate).not.toHaveAttribute('aria-valuenow');
        await expect(indeterminate).toHaveAttribute(
          'aria-valuetext',
          english ? 'Loading' : '处理中',
        );
        await expect(indeterminate.locator('.leaf-progress__info')).toHaveCount(0);

        const steps = preview(page, '分步进度', 'Stepped progress').getByRole('progressbar', {
          name: english ? 'Review progress' : '检查进度',
          exact: true,
        });
        await expect(steps).toHaveAttribute('aria-valuenow', '60');
        await expect(steps).toHaveAttribute('aria-valuetext', '60%');
        await expect(steps.locator('.leaf-progress__step')).toHaveCount(10);
        await expect(steps.locator('.leaf-progress__step[data-filled]')).toHaveCount(6);

        const segments = preview(page, '分段进度', 'Segmented progress').getByRole('progressbar', {
          name: english ? 'File processing progress' : '文件处理进度',
          exact: true,
        });
        await expect(segments).toHaveAttribute('aria-valuenow', '75');
        await expect(segments).toHaveAttribute('aria-valuetext', '75%');
        await expect(segments.locator('.leaf-progress__info')).toHaveText('75%');
        await expect(segments.locator('.leaf-progress__fill')).toHaveCount(2);
        expect(
          await segments
            .locator('.leaf-progress__fill')
            .evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).style.width)),
        ).toEqual(['35%', '40%']);
      });
    });
  }
}
