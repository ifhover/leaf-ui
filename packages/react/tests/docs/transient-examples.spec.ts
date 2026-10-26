import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

async function openPage(
  page: Page,
  component: 'message' | 'notification' | 'tour',
  english: boolean,
  appearance: 'light' | 'dark',
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${english ? '/en' : ''}/components/${component}.html`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const root = page.locator('html');
  if (Boolean((await root.getAttribute('class'))?.includes('dark')) !== (appearance === 'dark')) {
    await page
      .getByRole('button', {
        name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
      })
      .first()
      .click();
  }
  await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return errors;
}

function preview(page: Page, english: boolean, zh: string, en: string) {
  return page
    .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
    .locator('.leaf-component-example__preview');
}

function messages(page: Page) {
  return page.locator('.leaf-message-slot[data-state="open"] .leaf-message');
}

function notifications(page: Page) {
  return page.locator('.leaf-notification-slot[data-state="open"] .leaf-notification');
}

function containingText(page: Page, items: Locator, text: string) {
  return items.filter({ has: page.getByText(text, { exact: true }) });
}

async function expectNoPageOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
  ).toBeLessThanOrEqual(1);
}

async function expectCompleteOverlay(page: Page, overlay: Locator) {
  await expect(overlay).toBeVisible();
  await overlay.evaluate(async (node) => {
    const animations = new Set(node.getAnimations({ subtree: true }));
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      for (const animation of parent.getAnimations()) animations.add(animation);
    }
    await Promise.all(
      [...animations]
        .filter(
          (animation) =>
            animation.playState === 'running' &&
            animation.effect?.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => undefined)),
    );
  });
  const geometry = await overlay.evaluate((panel) => {
    const bounds = panel.getBoundingClientRect();
    const nodes = panel.querySelectorAll<HTMLElement>(
      'h3, button, .leaf-button__label, .leaf-message > span:not([aria-hidden]), ' +
        '.leaf-notification__title, .leaf-notification__description, ' +
        '.leaf-tour__description, .leaf-tour__footer > span',
    );
    return {
      x: bounds.x,
      y: bounds.y,
      right: bounds.right,
      bottom: bounds.bottom,
      overflow: panel.scrollWidth - panel.clientWidth,
      controls: [...nodes].map((node) => {
        const box = node.getBoundingClientRect();
        let left = Math.max(0, bounds.left);
        let right = Math.min(window.innerWidth, bounds.right);
        let top = Math.max(0, bounds.top);
        let bottom = Math.min(window.innerHeight, bounds.bottom);
        for (let parent: HTMLElement | null = node; parent; parent = parent.parentElement) {
          const style = getComputedStyle(parent);
          const clip = parent.getBoundingClientRect();
          if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
            left = Math.max(left, clip.left + parent.clientLeft);
            right = Math.min(right, clip.left + parent.clientLeft + parent.clientWidth);
          }
          if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
            top = Math.max(top, clip.top + parent.clientTop);
            bottom = Math.min(bottom, clip.top + parent.clientTop + parent.clientHeight);
          }
        }
        const range = document.createRange();
        range.selectNodeContents(node);
        const textFits =
          !node.textContent?.trim() ||
          [...range.getClientRects()].every(
            (rect) =>
              rect.left >= left - 1 &&
              rect.right <= right + 1 &&
              rect.top >= top - 1 &&
              rect.bottom <= bottom + 1,
          );
        return {
          name: node.textContent?.trim() || node.getAttribute('aria-label') || node.tagName,
          width: box.width,
          height: box.height,
          inside:
            box.left >= left - 1 &&
            box.right <= right + 1 &&
            box.top >= top - 1 &&
            box.bottom <= bottom + 1,
          textFits,
        };
      }),
    };
  });
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Missing viewport');
  expect(geometry.x).toBeGreaterThanOrEqual(-1);
  expect(geometry.y).toBeGreaterThanOrEqual(-1);
  expect(geometry.right).toBeLessThanOrEqual(viewport.width + 1);
  expect(geometry.bottom).toBeLessThanOrEqual(viewport.height + 1);
  expect(geometry.overflow, 'Overlay has no horizontal overflow').toBeLessThanOrEqual(1);
  expect(geometry.controls.length).toBeGreaterThan(0);
  for (const control of geometry.controls) {
    expect(control.width, `${control.name}: width`).toBeGreaterThan(0);
    expect(control.height, `${control.name}: height`).toBeGreaterThan(0);
    expect(control.inside, `${control.name}: fully visible inside the overlay`).toBe(true);
    expect(control.textFits, `${control.name}: complete text inside clipping ancestors`).toBe(true);
  }
  await expectNoPageOverflow(page);
}

async function installPausedClock(page: Page) {
  await page.clock.install({ time: new Date('2026-10-26T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
}

async function clickDisabledButton(page: Page, button: Locator) {
  await expect(button).toBeDisabled();
  const bounds = await button.boundingBox();
  if (!bounds) throw new Error('Missing disabled button bounds');
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
}

async function expectSameNode(
  current: Locator,
  previous: Awaited<ReturnType<Locator['elementHandle']>>,
) {
  if (!previous) throw new Error('Missing original overlay node');
  expect(await current.evaluate((node, original) => node === original, previous)).toBe(true);
}

for (const english of [false, true]) {
  for (const { width, appearance } of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Transient examples: ${english ? 'en' : 'zh'} ${width} ${appearance}`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme: appearance });
      test.setTimeout(90_000);

      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      });

      test('Message timers, manual dismissal, async replacement and cross-component keys are live', async ({
        page,
      }, testInfo) => {
        const errors = await openPage(page, 'message', english, appearance);
        await installPausedClock(page);
        const live = messages(page);
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const saved = english ? 'Changes saved' : '更改已保存';
        const basicTrigger = basic.getByRole('button', {
          name: english ? 'Show message' : '显示消息',
          exact: true,
        });
        await basicTrigger.click();
        const basicMessage = containingText(page, live, saved);
        await expect(basicMessage).toHaveAttribute('role', 'status');
        await expect(basicMessage).toHaveClass(/leaf-message--info/);
        await expect(basicMessage.getByRole('button')).toHaveCount(0);
        await expectCompleteOverlay(page, basicMessage);
        await page.screenshot({ path: testInfo.outputPath('message-basic.png') });
        await page.clock.runFor(1000);
        await basicMessage.hover();
        await page.clock.runFor(5000);
        await expect(basicMessage).toBeVisible();
        await page.mouse.move(width - 1, 899);
        await page.clock.runFor(1999);
        await expect(live).toHaveCount(1);
        await page.clock.runFor(1);
        await expect(live).toHaveCount(0);
        await expect(page.locator('.leaf-message-slot')).toHaveCount(0);

        const states = preview(page, english, '状态提示', 'Semantic states');
        const semanticMessages: Locator[] = [];
        for (const [type, trigger, content] of [
          [
            'info',
            english ? 'Info' : '信息',
            english ? 'You have a new comment' : '有一条新的评论',
          ],
          ['success', english ? 'Success' : '成功', saved],
          [
            'warning',
            english ? 'Warning' : '警告',
            english ? 'You have unsaved changes' : '还有未保存的更改',
          ],
          [
            'danger',
            english ? 'Error' : '失败',
            english ? 'Unable to save. Please try again.' : '保存失败，请重试',
          ],
        ] as const) {
          // Separate deadlines so each lifetime is checked without same-tick timer ordering.
          if (semanticMessages.length) await page.clock.runFor(100);
          await states.getByRole('button', { name: trigger, exact: true }).click();
          const item = containingText(page, live, content);
          semanticMessages.push(item);
          await expect(item).toHaveClass(new RegExp(`leaf-message--${type}`));
          await expect(item).toHaveAttribute(
            'role',
            type === 'warning' || type === 'danger' ? 'alert' : 'status',
          );
          await expectCompleteOverlay(page, item);
        }
        await expect(live).toHaveCount(4);
        await page.screenshot({ path: testInfo.outputPath('message-states.png') });
        await page.clock.runFor(2699);
        for (const [index, item] of semanticMessages.entries()) {
          if (index) await page.clock.runFor(99);
          await expect(live).toHaveCount(4 - index);
          await expect(item).toBeVisible();
          await page.clock.runFor(1);
          await expect(item).toHaveCount(0);
          await expect(live).toHaveCount(3 - index);
        }
        await expect(page.locator('.leaf-message-slot')).toHaveCount(0);

        const manual = preview(page, english, '手动关闭', 'Manual dismissal');
        await manual
          .getByRole('button', {
            name: english ? 'Show persistent message' : '显示持续消息',
            exact: true,
          })
          .click();
        const persistent = containingText(
          page,
          live,
          english ? 'This message stays until you close it' : '此消息会保留到手动关闭',
        );
        await expectCompleteOverlay(page, persistent);
        await page.clock.runFor(10_000);
        await expect(persistent).toBeVisible();
        const manualClose = persistent.getByRole('button', {
          name: english ? 'Close' : '关闭',
          exact: true,
        });
        await manualClose.focus();
        await expect(manualClose).toBeFocused();
        await page.screenshot({ path: testInfo.outputPath('message-manual.png') });
        await manualClose.click();
        await expect(live).toHaveCount(0);
        await expect(page.locator('.leaf-message-slot')).toHaveCount(0);

        const asynchronous = preview(page, english, '异步更新', 'Async updates');
        const saveTrigger = asynchronous.getByRole('button', {
          name: english ? 'Save asynchronously' : '异步保存',
          exact: true,
        });
        await saveTrigger.click();
        const loading = containingText(page, live, english ? 'Saving' : '正在保存');
        const loadingNode = await loading.elementHandle();
        await expect(loading).toHaveClass(/leaf-message--loading/);
        await expect(saveTrigger).toHaveAttribute('aria-busy', 'true');
        await clickDisabledButton(page, saveTrigger);
        await expect(live).toHaveCount(1);
        await expectCompleteOverlay(page, loading);
        await page.screenshot({ path: testInfo.outputPath('message-async-pending.png') });
        await page.clock.runFor(1199);
        await expect(loading).toBeVisible();
        await expect(saveTrigger).toBeDisabled();
        await page.clock.runFor(1);
        const result = containingText(page, live, english ? 'Changes saved' : '保存成功');
        await expect(result).toHaveClass(/leaf-message--success/);
        await expectSameNode(result, loadingNode);
        await expect(live).toHaveCount(1);
        await expect(saveTrigger).toBeEnabled();
        await expect(result.getByRole('button')).toHaveCount(0);
        await expectCompleteOverlay(page, result);
        await page.screenshot({ path: testInfo.outputPath('message-async-result.png') });
        await page.clock.runFor(2999);
        await expect(live).toHaveCount(1);
        await page.clock.runFor(1);
        await expect(live).toHaveCount(0);
        await expect(page.locator('.leaf-message-slot')).toHaveCount(0);

        const shared = preview(page, english, '跨组件共享', 'Share between components');
        await shared
          .getByRole('button', { name: english ? 'Start processing' : '开始处理', exact: true })
          .click();
        const sharedLoading = containingText(page, live, english ? 'Processing' : '正在处理');
        const sharedNode = await sharedLoading.elementHandle();
        await page.clock.runFor(10_000);
        await expect(sharedLoading).toBeVisible();
        const update = shared.getByRole('button', {
          name: english ? 'Update result' : '更新结果',
          exact: true,
        });
        await update.click();
        const sharedResult = containingText(
          page,
          live,
          english ? 'Processing complete' : '处理完成',
        );
        await expect(sharedResult).toHaveClass(/leaf-message--success/);
        await expectSameNode(sharedResult, sharedNode);
        await expect(live).toHaveCount(1);
        await page.clock.runFor(1000);
        await update.click();
        await expectSameNode(sharedResult, sharedNode);
        await page.clock.runFor(2999);
        await expect(live).toHaveCount(1);
        await expectCompleteOverlay(page, sharedResult);
        await page.screenshot({ path: testInfo.outputPath('message-shared-update.png') });
        await page.clock.runFor(1);
        await expect(live).toHaveCount(0);
        await page.clock.resume();
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });

      test('Notification timers, placements, own-key actions and async replacement are live', async ({
        page,
      }, testInfo) => {
        const errors = await openPage(page, 'notification', english, appearance);
        await installPausedClock(page);
        const live = notifications(page);
        const closeName = english ? 'Close' : '关闭';
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const basicTrigger = basic.getByRole('button', {
          name: english ? 'Show notification' : '显示通知',
          exact: true,
        });
        const reportTitle = english ? 'Report ready' : '报告已生成';
        await basicTrigger.click();
        const basicNotice = containingText(page, live, reportTitle);
        await expect(basicNotice).toHaveAttribute('role', 'status');
        await expect(basicNotice).toHaveClass(/leaf-notification--info/);
        await expect(basicNotice.locator('.leaf-notification__description')).toHaveText(
          english
            ? 'Your monthly report is available in the report list.'
            : '月度报告已准备好，可以前往报告列表查看。',
        );
        await expectCompleteOverlay(page, basicNotice);
        await page.clock.runFor(1000);
        await basicNotice.hover();
        const basicClose = basicNotice.getByRole('button', { name: closeName, exact: true });
        await basicClose.focus();
        await page.mouse.move(width - 1, 899);
        await page.clock.runFor(5000);
        await expect(basicClose).toBeFocused();
        await expect(basicNotice).toBeVisible();
        await page.screenshot({
          path: testInfo.outputPath('notification-pointer-focus-pause.png'),
        });
        await basicTrigger.focus();
        await page.clock.runFor(3499);
        await expect(live).toHaveCount(1);
        await page.clock.runFor(1);
        await expect(live).toHaveCount(0);
        await expect(page.locator('.leaf-notification-slot')).toHaveCount(0);

        const states = preview(page, english, '状态提示', 'Semantic states');
        const semanticNotifications: Locator[] = [];
        for (const [type, trigger, title] of [
          [
            'info',
            english ? 'Info' : '信息',
            english ? 'You have a new comment' : '有一条新的评论',
          ],
          ['success', english ? 'Success' : '成功', english ? 'Changes saved' : '更改已保存'],
          [
            'warning',
            english ? 'Warning' : '警告',
            english ? 'You have unsaved changes' : '还有未保存的更改',
          ],
          [
            'danger',
            english ? 'Error' : '失败',
            english ? 'Unable to save. Please try again.' : '保存失败，请重试',
          ],
        ] as const) {
          // Separate deadlines so each lifetime is checked without same-tick timer ordering.
          if (semanticNotifications.length) await page.clock.runFor(100);
          await states.getByRole('button', { name: trigger, exact: true }).click();
          const item = containingText(page, live, title);
          semanticNotifications.push(item);
          await expect(item).toHaveClass(new RegExp(`leaf-notification--${type}`));
          await expect(item).toHaveAttribute(
            'role',
            type === 'warning' || type === 'danger' ? 'alert' : 'status',
          );
          await expectCompleteOverlay(page, item);
        }
        await expect(live).toHaveCount(4);
        await page.screenshot({ path: testInfo.outputPath('notification-states.png') });
        await page.clock.runFor(4199);
        for (const [index, item] of semanticNotifications.entries()) {
          if (index) await page.clock.runFor(99);
          await expect(live).toHaveCount(4 - index);
          await expect(item).toBeVisible();
          await page.clock.runFor(1);
          await expect(item).toHaveCount(0);
          await expect(live).toHaveCount(3 - index);
        }
        await expect(page.locator('.leaf-notification-slot')).toHaveCount(0);

        const placements = preview(page, english, '显示位置', 'Placement');
        for (const [placement, label] of [
          ['top-left', english ? 'Top left' : '左上'],
          ['top-right', english ? 'Top right' : '右上'],
          ['bottom-left', english ? 'Bottom left' : '左下'],
          ['bottom-right', english ? 'Bottom right' : '右下'],
        ] as const) {
          await placements.getByRole('button', { name: label, exact: true }).click();
          const item = containingText(
            page,
            live,
            english ? 'You have a new notification' : '有一条新的通知',
          );
          const region = page.locator(`.leaf-notification-region--${placement}`);
          await expect(region.locator('.leaf-notification-slot[data-state="open"]')).toHaveCount(1);
          await expectCompleteOverlay(page, item);
          const bounds = await item.boundingBox();
          if (!bounds) throw new Error('Missing notification placement bounds');
          if (placement.startsWith('top')) expect(bounds.y).toBeLessThan(100);
          else expect(bounds.y + bounds.height).toBeGreaterThan(800);
          if (placement.endsWith('left')) expect(bounds.x).toBeCloseTo(24, 0);
          else expect(bounds.x + bounds.width).toBeCloseTo(width - 24, 0);
          await page.screenshot({ path: testInfo.outputPath(`notification-${placement}.png`) });
          await item.getByRole('button', { name: closeName, exact: true }).click();
          await expect(live).toHaveCount(0);
          await expect(page.locator('.leaf-notification-slot')).toHaveCount(0);
        }

        const actions = preview(page, english, '后续操作', 'Follow-up actions');
        const actionTrigger = actions.getByRole('button', {
          name: english ? 'Show notification with action' : '显示带操作的通知',
          exact: true,
        });
        await actionTrigger.click();
        const actionable = containingText(
          page,
          live,
          english ? 'New document comment' : '文档有新评论',
        );
        const actionNode = await actionable.elementHandle();
        await page.clock.runFor(10_000);
        await expect(actionable).toBeVisible();
        await actionTrigger.click();
        await expectSameNode(actionable, actionNode);
        await expect(live).toHaveCount(1);
        await basicTrigger.click();
        const otherNotice = containingText(page, live, reportTitle);
        await expect(live).toHaveCount(2);
        await expectCompleteOverlay(page, actionable);
        await expectCompleteOverlay(page, otherNotice);
        await page.screenshot({ path: testInfo.outputPath('notification-own-key-before.png') });
        await actionable
          .getByRole('button', { name: english ? 'Mark as read' : '标记已读', exact: true })
          .click();
        await expect(actions.getByRole('status')).toHaveText(
          english ? 'Marked as read' : '已标记为已读',
        );
        await expect(actionable).toHaveCount(0);
        await expect(live).toHaveCount(1);
        await expect(otherNotice).toBeVisible();
        await settleAnimations(page.locator('.leaf-notification-region--top-right'));
        await page.screenshot({ path: testInfo.outputPath('notification-own-key-after.png') });
        await otherNotice.getByRole('button', { name: closeName, exact: true }).click();
        await expect(live).toHaveCount(0);
        await expect(page.locator('.leaf-notification-slot')).toHaveCount(0);

        const asynchronous = preview(page, english, '异步更新', 'Async updates');
        const syncTrigger = asynchronous.getByRole('button', {
          name: english ? 'Sync and update notification' : '同步并更新通知',
          exact: true,
        });
        await syncTrigger.click();
        const loading = containingText(page, live, english ? 'Syncing' : '正在同步');
        const loadingNode = await loading.elementHandle();
        await expect(syncTrigger).toHaveAttribute('aria-busy', 'true');
        await clickDisabledButton(page, syncTrigger);
        await expect(live).toHaveCount(1);
        await expectCompleteOverlay(page, loading);
        await page.screenshot({ path: testInfo.outputPath('notification-async-pending.png') });
        await page.clock.runFor(1199);
        await expect(loading).toBeVisible();
        await expect(syncTrigger).toBeDisabled();
        await page.clock.runFor(1);
        const result = containingText(page, live, english ? 'Sync complete' : '同步完成');
        await expect(result).toHaveClass(/leaf-notification--success/);
        await expect(result.locator('.leaf-notification__description')).toHaveText(
          english ? 'All changes have been synced.' : '所有更改已同步。',
        );
        await expectSameNode(result, loadingNode);
        await expect(syncTrigger).toBeEnabled();
        await expect(live).toHaveCount(1);
        await expectCompleteOverlay(page, result);
        await page.screenshot({ path: testInfo.outputPath('notification-async-result.png') });
        await page.clock.runFor(4499);
        await expect(live).toHaveCount(1);
        await page.clock.runFor(1);
        await expect(live).toHaveCount(0);
        await page.clock.resume();
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });

      test('Tour targets, step control, missing policies, focus and background editing are live', async ({
        page,
      }, testInfo) => {
        const errors = await openPage(page, 'tour', english, appearance);
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const trigger = basic.getByRole('button', {
          name: english ? 'Start tour' : '开始引导',
          exact: true,
        });
        const dialog = page.getByRole('dialog');
        const closeName = english ? 'Close' : '关闭';
        const nextName = english ? 'Next' : '下一步';
        const previousName = english ? 'Previous' : '上一步';
        const finishName = english ? 'Finish' : '完成';
        const firstTitle = english ? 'Document title' : '文档标题';
        const secondTitle = english ? 'Visibility' : '可见范围';
        await trigger.click();
        await expect(dialog).toHaveAccessibleName(firstTitle);
        await expect(dialog).toHaveAttribute('aria-modal', 'true');
        await expect(dialog.locator('.leaf-tour__footer > span')).toHaveText('1 / 2');
        await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
        await expect(page.locator('.leaf-tour__mask > div')).toHaveCount(4);
        await expectCompleteOverlay(page, dialog);
        const firstTarget = basic.getByText(
          english ? 'Document: Getting started' : '文档：快速开始',
          { exact: true },
        );
        expect(
          await firstTarget.evaluate((node) => {
            const rect = node.getBoundingClientRect();
            const hit = document.elementFromPoint(
              rect.x + rect.width / 2,
              rect.y + rect.height / 2,
            );
            return (
              rect.left >= 0 &&
              rect.top >= 0 &&
              rect.right <= window.innerWidth &&
              rect.bottom <= window.innerHeight &&
              hit !== null &&
              (node.contains(hit) || hit.contains(node))
            );
          }),
        ).toBe(true);
        const close = dialog.getByRole('button', { name: closeName, exact: true });
        const next = dialog.getByRole('button', { name: nextName, exact: true });
        await expect
          .poll(() => dialog.evaluate((node) => node.contains(document.activeElement)))
          .toBe(true);
        await next.focus();
        await next.press('Tab');
        await expect(close).toBeFocused();
        await close.press('Shift+Tab');
        await expect(next).toBeFocused();
        await page.mouse.click(5, 200);
        await expect(dialog).toHaveAccessibleName(firstTitle);
        await page.screenshot({ path: testInfo.outputPath('tour-first-target.png') });
        await next.click();
        await expect(dialog).toHaveAccessibleName(secondTitle);
        await expect(dialog.locator('.leaf-tour__footer > span')).toHaveText('2 / 2');
        await expectCompleteOverlay(page, dialog);
        await page.screenshot({ path: testInfo.outputPath('tour-second-target.png') });
        await dialog.getByRole('button', { name: previousName, exact: true }).click();
        await expect(dialog).toHaveAccessibleName(firstTitle);
        await next.click();
        await dialog.getByRole('button', { name: finishName, exact: true }).click();
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
        await trigger.click();
        await expect(dialog).toHaveAccessibleName(firstTitle);
        await expect(dialog.locator('.leaf-tour__footer > span')).toHaveText('1 / 2');
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();

        const centered = preview(page, english, '居中说明', 'Centered step');
        const welcome = centered.getByRole('button', {
          name: english ? 'Show welcome' : '查看欢迎说明',
          exact: true,
        });
        await welcome.click();
        await expect(dialog).toHaveAccessibleName(english ? 'Welcome' : '欢迎使用');
        await expect(dialog).toHaveClass(/leaf-tour--center/);
        await expect(page.locator('.leaf-tour__mask > div')).toHaveCount(1);
        await expectCompleteOverlay(page, dialog);
        const centerBounds = await dialog.boundingBox();
        if (!centerBounds) throw new Error('Missing centered tour bounds');
        expect(centerBounds.x + centerBounds.width / 2).toBeCloseTo(width / 2, 0);
        expect(centerBounds.y + centerBounds.height / 2).toBeCloseTo(450, 0);
        await page.screenshot({ path: testInfo.outputPath('tour-centered.png') });
        await dialog.getByRole('button', { name: finishName, exact: true }).click();
        await expect(dialog).toBeHidden();
        await expect(welcome).toBeFocused();

        const missing = preview(page, english, '目标缺失', 'Missing targets');
        const testMissing = missing.getByRole('button', {
          name: english ? 'Test missing target' : '测试缺失目标',
          exact: true,
        });
        await missing
          .getByRole('radio', { name: english ? 'Center' : '居中', exact: true })
          .check();
        await testMissing.click();
        await expect(dialog).toHaveAccessibleName(
          english ? 'The first target is missing' : '第一步目标不存在',
        );
        await expect(dialog).toHaveClass(/leaf-tour--center/);
        await expect(dialog.locator('.leaf-tour__footer > span')).toHaveText('1 / 2');
        await expectCompleteOverlay(page, dialog);
        await page.screenshot({ path: testInfo.outputPath('tour-missing-center.png') });
        await dialog.getByRole('button', { name: nextName, exact: true }).click();
        await expect(dialog).toHaveAccessibleName(english ? 'Document list' : '文档列表');
        await expect(dialog).not.toHaveClass(/leaf-tour--center/);
        await expectCompleteOverlay(page, dialog);
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await expect(testMissing).toBeFocused();
        await missing.getByRole('radio', { name: english ? 'Skip' : '跳过', exact: true }).check();
        await testMissing.click();
        await expect(dialog).toHaveAccessibleName(english ? 'Document list' : '文档列表');
        await expect(dialog.locator('.leaf-tour__footer > span')).toHaveText('2 / 2');
        await expectCompleteOverlay(page, dialog);
        await page.screenshot({ path: testInfo.outputPath('tour-missing-skip.png') });
        await dialog.getByRole('button', { name: finishName, exact: true }).click();
        await expect(dialog).toBeHidden();
        await expect(testMissing).toBeFocused();
        await missing.getByRole('radio', { name: english ? 'Close' : '关闭', exact: true }).check();
        await testMissing.click();
        await expect(dialog).toHaveCount(0);
        await expect(testMissing).toBeFocused();
        await page.screenshot({ path: testInfo.outputPath('tour-missing-close.png') });

        const maskless = preview(page, english, '与背景交互', 'Background interaction');
        const masklessTrigger = maskless.getByRole('button', {
          name: english ? 'Start maskless tour' : '开始无蒙层引导',
          exact: true,
        });
        const input = maskless.getByRole('textbox', { name: firstTitle, exact: true });
        await expect(input).toHaveValue(english ? 'Getting started' : '快速开始');
        const bodyOverflow = await page.locator('body').evaluate((node) => node.style.overflow);
        await masklessTrigger.click();
        await expect(dialog).toHaveAccessibleName(english ? 'Edit the title' : '修改标题');
        await expect(dialog).not.toHaveAttribute('aria-modal', 'true');
        await expect(page.locator('.leaf-tour__mask')).toHaveCount(0);
        expect(await page.locator('body').evaluate((node) => node.style.overflow)).toBe(
          bodyOverflow,
        );
        await expectCompleteOverlay(page, dialog);
        await input.click();
        await input.fill(english ? 'Edited during the tour' : '引导期间修改的标题');
        await expect(input).toBeFocused();
        await expect(dialog).toBeVisible();
        expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(false);
        await page.screenshot({ path: testInfo.outputPath('tour-maskless-edit.png') });
        await input.press('Escape');
        await expect(dialog).toBeHidden();
        await expect(masklessTrigger).toBeFocused();
        await expect(input).toHaveValue(english ? 'Edited during the tour' : '引导期间修改的标题');
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });
    });
  }
}
