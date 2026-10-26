import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

async function expectStepStates(list: Locator, states: readonly string[], current: number) {
  const items = list.getByRole('listitem');
  await expect(items).toHaveCount(states.length);
  for (const [index, state] of states.entries()) {
    await expect(items.nth(index)).toHaveAttribute('data-status', state);
  }
  await expect(list.locator('[aria-current="step"]')).toHaveCount(1);
  await expect(items.nth(current)).toHaveAttribute('aria-current', 'step');
}

for (const english of [false, true]) {
  for (const profile of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Steps and Tabs documentation: ${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`, () => {
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

      test('Steps controls the current index and separates direction, error, dots and step progress', async ({
        page,
      }) => {
        await visit(page, 'steps');

        const basic = preview(page, '基础用法', 'Basic usage').getByRole('list', {
          name: english ? 'Task steps' : '任务步骤',
          exact: true,
        });
        await expectStepStates(basic, ['finish', 'process', 'wait'], 1);
        await expect(basic.getByRole('button')).toHaveCount(0);
        await expect(basic).toHaveCSS('flex-direction', 'row');

        const controlled = preview(page, '受控切换', 'Controlled steps');
        const steps = controlled.getByRole('list', {
          name: english ? 'Selectable steps' : '可切换步骤',
          exact: true,
        });
        await expectStepStates(steps, ['process', 'wait', 'wait'], 0);
        await expect(steps.getByRole('button')).toHaveCount(3);
        for (const button of await steps.getByRole('button').all()) {
          await expect(button).toBeEnabled();
        }
        await steps.getByRole('button', { name: english ? 'Review' : '确认', exact: true }).click();
        await expectStepStates(steps, ['finish', 'process', 'wait'], 1);
        await expect(controlled.getByRole('status')).toHaveText(
          english ? 'Current step: Review' : '当前步骤：确认',
        );
        await steps.getByRole('button', { name: english ? 'Done' : '完成', exact: true }).click();
        await expectStepStates(steps, ['finish', 'finish', 'process'], 2);
        await expect(controlled.getByRole('status')).toHaveText(
          english ? 'Current step: Done' : '当前步骤：完成',
        );
        await steps.getByRole('button', { name: english ? 'Create' : '创建', exact: true }).click();
        await expectStepStates(steps, ['process', 'wait', 'wait'], 0);
        await expect(controlled.getByRole('status')).toHaveText(
          english ? 'Current step: Create' : '当前步骤：创建',
        );

        const vertical = preview(page, '纵向排列', 'Vertical layout').getByRole('list');
        await expect(vertical).toHaveCSS('flex-direction', 'column');
        await expectStepStates(vertical, ['finish', 'process', 'wait'], 1);
        await expect(vertical.locator('.leaf-steps__description')).toHaveCount(3);
        const geometry = await vertical.getByRole('listitem').evaluateAll((nodes) =>
          nodes.map((node) => {
            const bounds = node.getBoundingClientRect();
            return { x: bounds.x, y: bounds.y, bottom: bounds.bottom };
          }),
        );
        const [first, ...remaining] = geometry;
        if (!first) throw new Error('Missing vertical steps geometry');
        let previous = first;
        for (const bounds of remaining) {
          expect(bounds.x).toBeCloseTo(first.x, 0);
          expect(bounds.y).toBeGreaterThanOrEqual(previous.bottom - 1);
          previous = bounds;
        }

        const error = preview(page, '错误状态', 'Error state').getByRole('list');
        await expectStepStates(error, ['finish', 'error', 'wait'], 1);
        await expect(error.getByRole('listitem').nth(1).locator('.lucide-x')).toHaveCount(1);

        const dots = preview(page, '点状步骤', 'Dot steps').getByRole('list');
        await expectStepStates(dots, ['finish', 'process', 'wait'], 1);
        await expect(dots.locator('.leaf-steps__dot')).toHaveCount(3);
        await expect(dots.locator('.leaf-steps__progress, .leaf-steps__icon svg')).toHaveCount(0);
        await expect(basic.locator('.leaf-steps__dot, .leaf-steps__progress')).toHaveCount(0);

        const progress = preview(page, '步骤内进度', 'Progress within a step').getByRole('list');
        await expectStepStates(progress, ['finish', 'process', 'wait'], 1);
        await expect(progress.locator('.leaf-steps__progress')).toHaveCount(1);
        const current = progress.locator('[aria-current="step"]');
        await expect(current.locator('.leaf-steps__progress')).toHaveCount(1);
        await expect(current.locator('.leaf-steps__description')).toHaveText('65%');
        const dashArray = await current
          .locator('.leaf-steps__progress circle')
          .last()
          .getAttribute('stroke-dasharray');
        if (!dashArray) throw new Error('Missing current-step progress stroke');
        const [filled = 0, total = 0] = dashArray.trim().split(/[ ,]+/u).map(Number);
        expect(total).toBeGreaterThan(0);
        expect(filled / total).toBeCloseTo(0.65, 3);
      });

      test('Tabs switches, retains input, edits items and commits keyboard sorting', async ({
        page,
      }) => {
        await visit(page, 'tabs');

        const view = preview(page, '视图切换', 'View switching');
        const week = view.getByRole('tab', { name: english ? 'Week' : '本周', exact: true });
        const month = view.getByRole('tab', { name: english ? 'Month' : '本月', exact: true });
        const year = view.getByRole('tab', { name: english ? 'Year' : '全年', exact: true });
        await expect(year).toBeDisabled();
        await expect(year).toHaveAttribute('tabindex', '-1');
        await expect(week).toHaveAttribute('aria-selected', 'true');
        await expect(view.getByRole('tabpanel')).toHaveCount(0);
        await expect(week).not.toHaveAttribute('aria-controls');
        await week.focus();
        await week.press('ArrowRight');
        await expect(month).toBeFocused();
        await expect(month).toHaveAttribute('aria-selected', 'true');
        await expect(view.getByRole('status')).toHaveText(
          english ? 'Showing this month.' : '显示本月内容。',
        );
        await month.press('ArrowRight');
        await expect(week).toBeFocused();
        await expect(week).toHaveAttribute('aria-selected', 'true');
        await expect(view.getByRole('status')).toHaveText(
          english ? 'Showing this week.' : '显示本周内容。',
        );
        await week.press('End');
        await expect(month).toBeFocused();
        await expect(month).toHaveAttribute('aria-selected', 'true');
        await month.press('Home');
        await expect(week).toBeFocused();
        await expect(week).toHaveAttribute('aria-selected', 'true');
        await expect(year).toHaveAttribute('aria-selected', 'false');

        const preserved = preview(page, '保留输入状态', 'Preserved input state');
        const draft = preserved.getByRole('textbox', {
          name: english ? 'Draft content' : '草稿内容',
          exact: true,
        });
        await draft.fill('Keep this draft');
        await preserved
          .getByRole('tab', { name: english ? 'Other content' : '其他内容', exact: true })
          .click();
        await expect(preserved.getByRole('tabpanel')).toHaveText(
          english ? 'Return to Draft to check your input.' : '切回草稿查看输入内容。',
        );
        await expect(preserved.locator('input')).toHaveCount(1);
        await expect(preserved.locator('input')).toBeHidden();
        await expect(preserved.locator('input')).toHaveValue('Keep this draft');
        await preserved.getByRole('tab', { name: english ? 'Draft' : '草稿', exact: true }).click();
        await expect(draft).toHaveValue('Keep this draft');

        const editable = preview(page, '新增与关闭', 'Adding and closing tabs');
        await expect(editable.getByRole('tab')).toHaveCount(2);
        await editable
          .getByRole('button', { name: english ? 'Add tab' : '新增标签页', exact: true })
          .click();
        const added = editable.getByRole('tab', {
          name: english ? 'Tab 3' : '标签 3',
          exact: true,
        });
        await expect(editable.getByRole('tab')).toHaveCount(3);
        await added.click();
        await expect(editable.getByRole('tabpanel')).toHaveText(english ? 'Content 3' : '内容 3');
        await editable
          .getByRole('button', {
            name: english ? 'Close tab Tab 3' : '关闭标签页 标签 3',
            exact: true,
          })
          .click();
        await expect(added).toHaveCount(0);
        await expect(editable.getByRole('tab')).toHaveCount(2);
        const surviving = editable.getByRole('tab', {
          name: english ? 'Tab 2' : '标签 2',
          exact: true,
        });
        await expect(surviving).toHaveAttribute('aria-selected', 'true');
        await expect(surviving).toBeFocused();
        const clear = editable.getByRole('button', {
          name: english ? 'Clear tabs' : '清空标签',
          exact: true,
        });
        await clear.click();
        await expect(editable.getByRole('tablist')).toHaveCount(0);
        await expect(editable.getByRole('tab')).toHaveCount(0);
        await expect(
          editable.getByRole('button', { name: english ? 'Add tab' : '新增标签页', exact: true }),
        ).toHaveCount(0);
        await expect(editable.getByRole('status')).toHaveText(
          english ? 'No tabs. Restore them to add more.' : '暂无标签页，恢复后可继续添加。',
        );
        await expect(clear).toBeDisabled();
        await editable
          .getByRole('button', { name: english ? 'Restore tabs' : '恢复标签', exact: true })
          .click();
        await expect(editable.getByRole('tab')).toHaveText(
          english ? ['Tab 1', 'Tab 2'] : ['标签 1', '标签 2'],
        );
        await expect(clear).toBeEnabled();

        const sortable = preview(page, '标签排序', 'Sorting tabs');
        const original: [string, string, string] = english
          ? ['Tab one', 'Tab two', 'Tab three']
          : ['标签一', '标签二', '标签三'];
        const reordered = [original[1], original[0], original[2]];
        const orderFeedback = sortable
          .getByRole('status')
          .filter({ hasText: english ? /^Current order:/u : /^当前顺序：/u });
        const orderText = (items: readonly string[]) =>
          english ? `Current order: ${items.join(' / ')}` : `当前顺序：${items.join('、')}`;
        await expect(sortable.getByRole('tab')).toHaveText(original);
        await expect(orderFeedback).toHaveText(orderText(original));
        const handle = sortable.getByRole('button', {
          name: english ? 'Reorder tab Tab one' : '移动标签页 标签一',
          exact: true,
        });
        await handle.focus();
        await handle.press('Space');
        const dragging = sortable.locator('[data-dragging]');
        await expect(dragging).toHaveCount(1);
        await handle.press('ArrowRight');
        await expect(dragging).toHaveAttribute('style', /translate3d\((?!0px)/u);
        await handle.press('Space');
        await expect(dragging).toHaveCount(0);
        await expect(sortable.getByRole('tab')).toHaveText(reordered);
        await expect(orderFeedback).toHaveText(orderText(reordered));
        await sortable
          .getByRole('button', { name: english ? 'Restore order' : '恢复顺序', exact: true })
          .click();
        await expect(sortable.getByRole('tab')).toHaveText(original);
        await expect(orderFeedback).toHaveText(orderText(original));

        const bottom = preview(page, '底部标签', 'Bottom placement');
        const root = bottom.locator('.leaf-tabs');
        await expect(root).toHaveClass(/leaf-tabs--bottom/u);
        await expect(root.locator('.leaf-tabs__header')).toHaveCSS('order', '2');
        await settleAnimations(root);
        const headerBounds = await root.locator('.leaf-tabs__header').boundingBox();
        const panelBounds = await bottom.getByRole('tabpanel').boundingBox();
        if (!headerBounds || !panelBounds) throw new Error('Missing bottom-placement geometry');
        expect(headerBounds.y).toBeGreaterThanOrEqual(panelBounds.y + panelBounds.height - 1);
        await bottom.getByRole('tab', { name: english ? 'Settings' : '设置', exact: true }).click();
        await expect(bottom.getByRole('tabpanel')).toHaveText(
          english ? 'Settings content' : '设置内容',
        );
      });
    });
  }
}
