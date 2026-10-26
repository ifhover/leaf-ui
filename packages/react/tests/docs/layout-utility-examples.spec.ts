import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

async function visit(
  page: Page,
  slug: 'layout' | 'back-top' | 'float-button',
  english: boolean,
  appearance: 'light' | 'dark',
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${english ? '/en' : ''}/components/${slug}.html`);
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

async function bounds(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error('Missing element bounds');
  return { ...rect, right: rect.x + rect.width, bottom: rect.y + rect.height };
}

async function expectNoOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
  ).toBeLessThanOrEqual(1);
}

async function expectInside(inner: Locator, outer: Locator) {
  const item = await bounds(inner);
  const container = await bounds(outer);
  expect(item.width).toBeGreaterThan(0);
  expect(item.height).toBeGreaterThan(0);
  expect(item.x).toBeGreaterThanOrEqual(container.x - 1);
  expect(item.y).toBeGreaterThanOrEqual(container.y - 1);
  expect(item.right).toBeLessThanOrEqual(container.right + 1);
  expect(item.bottom).toBeLessThanOrEqual(container.bottom + 1);
}

async function expectTooltip(page: Page, trigger: Locator, name: string) {
  await trigger.focus();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText(name);
  await settleAnimations(tooltip);
  const rect = await bounds(tooltip);
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Missing viewport');
  expect(rect.x).toBeGreaterThanOrEqual(-1);
  expect(rect.y).toBeGreaterThanOrEqual(-1);
  expect(rect.right).toBeLessThanOrEqual(viewport.width + 1);
  expect(rect.bottom).toBeLessThanOrEqual(viewport.height + 1);
  expect(
    await tooltip.evaluate((node) => {
      const panel = node.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(node);
      return (
        node.scrollWidth - node.clientWidth <= 1 &&
        [...range.getClientRects()].every(
          (text) =>
            text.left >= panel.left - 1 &&
            text.right <= panel.right + 1 &&
            text.top >= panel.top - 1 &&
            text.bottom <= panel.bottom + 1,
        )
      );
    }),
    'Tooltip text is complete inside its panel',
  ).toBe(true);
}

async function expectSidebar(sider: Locator, collapsed: boolean, toggle: boolean) {
  if (collapsed) await expect(sider).toHaveAttribute('data-collapsed', 'true');
  else await expect(sider).not.toHaveAttribute('data-collapsed', 'true');
  await expect(sider).toHaveCSS('width', collapsed ? '84px' : '180px');
  const menu = sider.locator('.leaf-menu');
  if (collapsed) await expect(menu).toHaveClass(/leaf-menu--collapsed/);
  else await expect(menu).not.toHaveClass(/leaf-menu--collapsed/);
  await expect(sider.locator(':scope > button')).toHaveCount(toggle ? 1 : 0);
  await settleAnimations(sider);
  await expectInside(menu, sider);
}

for (const english of [false, true]) {
  for (const { width, appearance } of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Layout utilities: ${english ? 'en' : 'zh'} ${width} ${appearance}`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme: appearance });
      test.setTimeout(90_000);

      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      });

      test('Layout structure, manual control and viewport responsive restoration are live', async ({
        page,
      }, testInfo) => {
        const errors = await visit(page, 'layout', english, appearance);
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const header = basic.locator('header');
        const footer = basic.locator('footer');
        const sidebar = basic.locator('aside');
        const content = basic.locator('main');
        await expect(header).toHaveText(english ? 'Header' : '页头');
        await expect(footer).toHaveText(english ? 'Footer' : '页脚');
        await expect(sidebar).toHaveText(english ? 'Sidebar' : '侧栏');
        await expect(content).toHaveText(english ? 'Content' : '正文内容');
        await basic.scrollIntoViewIfNeeded();
        const [head, side, main, foot] = await Promise.all([
          bounds(header),
          bounds(sidebar),
          bounds(content),
          bounds(footer),
        ]);
        expect(head.bottom).toBeLessThanOrEqual(side.y + 1);
        expect(Math.abs(side.y - main.y)).toBeLessThanOrEqual(1);
        expect(side.right).toBeLessThanOrEqual(main.x + 1);
        expect(Math.max(side.bottom, main.bottom)).toBeLessThanOrEqual(foot.y + 1);
        for (const section of [header, sidebar, content, footer]) {
          await expectInside(section, basic);
        }
        await page.screenshot({ path: testInfo.outputPath('layout-structure.png') });

        const home = english ? 'Home' : '首页';
        const documents = english ? 'Documents' : '文档';
        const collapseName = english ? 'Collapse sidebar' : '收起侧栏';
        const expandName = english ? 'Expand sidebar' : '展开侧栏';
        const manual = preview(page, english, '折叠侧栏', 'Collapsible sidebar');
        const manualSider = manual.locator('aside');
        await expectSidebar(manualSider, false, true);
        await expect(manual.getByRole('status')).toHaveText(home);
        await manual.getByRole('menuitem', { name: documents, exact: true }).click();
        await expect(manual.getByRole('status')).toHaveText(documents);
        await manual.getByRole('button', { name: collapseName, exact: true }).click();
        await expectSidebar(manualSider, true, true);
        await expect(manual.getByRole('button', { name: expandName })).toHaveAttribute(
          'aria-expanded',
          'false',
        );
        await manual.getByRole('menuitem', { name: home, exact: true }).click();
        await expect(manual.getByRole('status')).toHaveText(home);
        await page.screenshot({ path: testInfo.outputPath('layout-manual-collapsed.png') });
        await manual.getByRole('button', { name: expandName, exact: true }).click();
        await expectSidebar(manualSider, false, true);
        await expect(manual.getByRole('status')).toHaveText(home);

        const responsive = preview(page, english, '响应式侧栏', 'Responsive sidebar');
        const responsiveSider = responsive.locator('aside');
        await expectSidebar(responsiveSider, width <= 575, width > 575);
        await responsive.getByRole('menuitem', { name: documents, exact: true }).click();
        await expect(responsive.getByRole('status')).toHaveText(documents);
        await page.screenshot({ path: testInfo.outputPath('layout-responsive-profile.png') });

        // A narrow example does not collapse the sidebar until the viewport reaches 575px.
        await page.setViewportSize({ width: 600, height: 900 });
        await expectSidebar(responsiveSider, false, true);
        expect((await bounds(responsive.locator('.leaf-layout').first())).width).toBeLessThan(575);
        await responsive.getByRole('button', { name: collapseName, exact: true }).click();
        await expectSidebar(responsiveSider, true, true);
        await page.setViewportSize({ width: 575, height: 900 });
        await expectSidebar(responsiveSider, true, false);
        await page.setViewportSize({ width: 600, height: 900 });
        await expectSidebar(responsiveSider, true, true);
        await responsive.getByRole('button', { name: expandName, exact: true }).click();
        await expectSidebar(responsiveSider, false, true);
        await page.setViewportSize({ width: 575, height: 900 });
        await expectSidebar(responsiveSider, true, false);
        await expect(responsive.getByRole('status')).toHaveText(documents);
        await responsive.scrollIntoViewIfNeeded();
        await page.screenshot({ path: testInfo.outputPath('layout-responsive-575.png') });
        await page.setViewportSize({ width: 600, height: 900 });
        await expectSidebar(responsiveSider, false, true);
        await expect(responsive.getByRole('status')).toHaveText(documents);
        await page.setViewportSize({ width, height: 900 });
        await expectSidebar(responsiveSider, width <= 575, width > 575);
        await expectNoOverflow(page);
        expect(errors).toEqual([]);
      });

      test('BackTop uses real window and local viewport scrolling independently', async ({
        page,
      }, testInfo) => {
        const errors = await visit(page, 'back-top', english, appearance);
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const local = preview(page, english, '滚动容器', 'Scroll container');
        const windowButton = basic.locator('.leaf-back-top');
        const localButton = local.locator('.leaf-back-top');
        const scrollArea = local.locator('.leaf-scrollbar__viewport');
        const backName = english ? 'Back to top' : '回到顶部';
        await expect(windowButton).toHaveAttribute('aria-hidden', 'true');
        await expect(windowButton).toHaveAttribute('tabindex', '-1');
        await expect(localButton).toHaveAttribute('aria-hidden', 'true');
        await basic
          .getByRole('button', {
            name: english ? 'Scroll down the page' : '向下滚动页面',
            exact: true,
          })
          .click();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(400);
        await expect(windowButton).toHaveAttribute('aria-hidden', 'false');
        await expect(windowButton).toHaveAccessibleName(backName);
        await expect(localButton).toHaveAttribute('aria-hidden', 'true');
        await settleAnimations(windowButton);
        const windowBounds = await bounds(windowButton);
        expect(windowBounds.right).toBeCloseTo(width - 24, 0);
        expect(windowBounds.bottom).toBeCloseTo(900 - 24, 0);
        await page.screenshot({ path: testInfo.outputPath('backtop-window-visible.png') });
        await windowButton.click();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
        await expect(windowButton).toHaveAttribute('aria-hidden', 'true');

        await page.evaluate(() => window.scrollTo({ top: 399, behavior: 'instant' }));
        await expect(windowButton).toHaveAttribute('aria-hidden', 'true');
        await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
        await expect(windowButton).toHaveAttribute('data-visible', 'true');

        await local.scrollIntoViewIfNeeded();
        await expect(scrollArea).toHaveAccessibleName(
          english ? 'Demo scroll area' : '演示滚动区域',
        );
        await expect(scrollArea.locator('.leaf-paragraph')).toHaveCount(12);
        await scrollArea.hover();
        await page.mouse.wheel(0, 150);
        await expect.poll(() => scrollArea.evaluate((node) => node.scrollTop)).toBeGreaterThan(100);
        await expect(localButton).toHaveAttribute('data-visible', 'true');
        await scrollArea.evaluate((node) => node.scrollTo({ top: 99, behavior: 'instant' }));
        await expect(localButton).toHaveAttribute('aria-hidden', 'true');
        await scrollArea.evaluate((node) => node.scrollTo({ top: 100, behavior: 'instant' }));
        await expect(localButton).toHaveAttribute('data-visible', 'true');
        await settleAnimations(localButton);
        await expectInside(localButton, local.locator('div[style]').first());
        await expect(windowButton).toHaveAttribute('data-visible', 'true');
        const [localBounds, globalBounds] = await Promise.all([
          bounds(localButton),
          bounds(windowButton),
        ]);
        expect(
          localBounds.right <= globalBounds.x ||
            globalBounds.right <= localBounds.x ||
            localBounds.bottom <= globalBounds.y ||
            globalBounds.bottom <= localBounds.y,
          'Local and window return buttons do not overlap when both are visible',
        ).toBe(true);
        const windowPosition = await page.evaluate(() => window.scrollY);
        await page.screenshot({ path: testInfo.outputPath('backtop-local-visible.png') });
        await localButton.click();
        await expect.poll(() => scrollArea.evaluate((node) => node.scrollTop)).toBe(0);
        expect(await page.evaluate(() => window.scrollY)).toBe(windowPosition);
        await expect(localButton).toHaveAttribute('aria-hidden', 'true');

        await page.emulateMedia({ reducedMotion: 'reduce' });
        await scrollArea.evaluate((node) => node.scrollTo({ top: 150, behavior: 'instant' }));
        await expect(localButton).toHaveAttribute('data-visible', 'true');
        await localButton.click();
        await expect.poll(() => scrollArea.evaluate((node) => node.scrollTop)).toBe(0);
        expect(await page.evaluate(() => window.scrollY)).toBe(windowPosition);
        await windowButton.click();
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
        await expect(windowButton).toHaveAttribute('aria-hidden', 'true');
        await expect(localButton).toHaveAttribute('aria-hidden', 'true');
        await page.screenshot({ path: testInfo.outputPath('backtop-restored.png') });
        await expectNoOverflow(page);
        expect(errors).toEqual([]);
      });

      test('FloatButton tooltips, action dismissal and controlled expansion are live', async ({
        page,
      }, testInfo) => {
        const errors = await visit(page, 'float-button', english, appearance);
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const createName = english ? 'Create' : '新建';
        const create = basic.getByRole('button', { name: createName, exact: true });
        await expect(basic.getByRole('status')).toHaveText(english ? 'Created: 0' : '已创建：0');
        await create.click();
        await create.press('Enter');
        await expect(basic.getByRole('status')).toHaveText(english ? 'Created: 2' : '已创建：2');
        const containingBlock = basic.locator('div[style*="translateZ"]');
        await expect(create).toHaveCSS('position', 'fixed');
        await expectInside(create, containingBlock);
        const [buttonBounds, blockBounds, feedbackBounds] = await Promise.all([
          bounds(create),
          bounds(containingBlock),
          bounds(basic.getByRole('status')),
        ]);
        expect(buttonBounds.right).toBeCloseTo(blockBounds.right - 24, 0);
        expect(buttonBounds.bottom).toBeCloseTo(blockBounds.bottom - 24, 0);
        expect(feedbackBounds.y).toBeGreaterThanOrEqual(blockBounds.bottom);
        await expectTooltip(page, create, createName);
        await page.screenshot({ path: testInfo.outputPath('floatbutton-basic-tooltip.png') });

        const quickName = english ? 'Quick actions' : '快捷操作';
        const actions = preview(page, english, '快捷操作组', 'Action group');
        const group = actions.getByRole('group', { name: quickName, exact: true });
        const trigger = group.getByRole('button', { name: quickName, exact: true });
        const shareName = english ? 'Share' : '分享';
        const commentName = english ? 'Comment' : '评论';
        await expect(group).toHaveCSS('position', 'static');
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(group.getByRole('button')).toHaveCount(1);
        await trigger.click();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(group.getByRole('button')).toHaveCount(3);
        await settleAnimations(group);
        const share = group.getByRole('button', { name: shareName, exact: true });
        await expectInside(share, actions);
        await expectTooltip(page, share, shareName);
        await page.screenshot({ path: testInfo.outputPath('floatbutton-actions-expanded.png') });
        await share.click();
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(actions.getByRole('status')).toHaveText(
          english ? 'Selected: Share' : '已选择：分享',
        );
        await expect(group.getByRole('button')).toHaveCount(1);
        await trigger.click();
        const comment = group.getByRole('button', { name: commentName, exact: true });
        await expectTooltip(page, comment, commentName);
        // Escape dismisses the focused action's tooltip before its containing group.
        await comment.press('Escape');
        await expect(page.getByRole('tooltip')).toHaveCount(0);
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(comment).toBeFocused();
        await comment.press('Escape');
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(trigger).toBeFocused();
        await trigger.click();
        await page.getByRole('heading', { level: 1 }).click();
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await trigger.click();
        await comment.click();
        await expect(actions.getByRole('status')).toHaveText(
          english ? 'Selected: Comment' : '已选择：评论',
        );
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');

        const controlled = preview(page, english, '受控展开', 'Controlled expansion');
        const openButton = controlled.getByRole('button', {
          name: english ? 'Expand' : '展开',
          exact: true,
        });
        const closeButton = controlled.getByRole('button', {
          name: english ? 'Collapse' : '收起',
          exact: true,
        });
        const controlledGroup = controlled.getByRole('group', { name: quickName, exact: true });
        const controlledTrigger = controlledGroup.getByRole('button', {
          name: quickName,
          exact: true,
        });
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'false');
        await openButton.click();
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'true');
        await closeButton.click();
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'false');
        await closeButton.click();
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'false');
        await openButton.click();
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'true');
        await openButton.click();
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'true');
        await settleAnimations(controlledGroup);
        const editName = english ? 'Edit' : '编辑';
        const edit = controlledGroup.getByRole('button', { name: editName, exact: true });
        await expectInside(edit, controlled);
        await expectTooltip(page, edit, editName);
        const [tooltipBounds, controlsBounds] = await Promise.all([
          bounds(page.getByRole('tooltip')),
          bounds(controlled.locator('.leaf-flex')),
        ]);
        expect(
          tooltipBounds.right <= controlsBounds.x ||
            controlsBounds.right <= tooltipBounds.x ||
            tooltipBounds.bottom <= controlsBounds.y ||
            controlsBounds.bottom <= tooltipBounds.y,
          'The action tooltip does not overlap the external controls',
        ).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('floatbutton-controlled-expanded.png') });
        await edit.click();
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'false');
        await expect(controlled.getByRole('status')).toHaveText(
          english ? 'Selected: Edit' : '已选择：编辑',
        );
        await controlledTrigger.click();
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'true');
        const favorite = controlledGroup.getByRole('button', {
          name: english ? 'Favorite' : '收藏',
          exact: true,
        });
        await favorite.click();
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'false');
        await expect(controlled.getByRole('status')).toHaveText(
          english ? 'Selected: Favorite' : '已选择：收藏',
        );
        await controlledTrigger.click();
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'true');
        await controlledTrigger.press('Escape');
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'false');
        await expect(controlledTrigger).toBeFocused();
        await controlledTrigger.click();
        await controlled.getByRole('status').click();
        await expect(controlledTrigger).toHaveAttribute('aria-expanded', 'false');
        await settleAnimations(controlledGroup);
        await expect(page.getByRole('tooltip', { includeHidden: true })).toHaveCount(0);
        await page.screenshot({ path: testInfo.outputPath('floatbutton-controlled-result.png') });
        await expectNoOverflow(page);
        expect(errors).toEqual([]);
      });
    });
  }
}
