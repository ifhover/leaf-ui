import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

async function visitPage(
  page: Page,
  component: 'dropdown' | 'tooltip' | 'popover' | 'popconfirm',
  english: boolean,
  appearance: 'light' | 'dark',
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${english ? '/en' : ''}/components/${component}.html`);
  await expect(page.locator('h1')).toBeVisible();
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
  return errors;
}

function preview(page: Page, english: boolean, zh: string, en: string) {
  return page
    .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
    .locator('.leaf-component-example__preview');
}

async function linkedPopup(page: Page, trigger: Locator, role: 'menu' | 'dialog') {
  const id = await trigger.getAttribute('aria-controls');
  if (!id) throw new Error('Open trigger is missing its popup relationship');
  return page.getByRole(role).and(page.locator(`[id="${id}"]`));
}

async function expectDescriptionLink(trigger: Locator, popup: Locator) {
  const id = await popup.getAttribute('id');
  if (!id) throw new Error('Description popup is missing its id');
  await expect(trigger).toHaveAttribute('aria-describedby', id);
}

async function pauseClock(page: Page) {
  await page.clock.install({ time: new Date('2026-10-26T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
}

async function clickDisabledButton(page: Page, button: Locator) {
  await expect(button).toBeDisabled();
  await button.scrollIntoViewIfNeeded();
  const bounds = await button.boundingBox();
  if (!bounds) throw new Error('Disabled button has no pointer target');
  // Native pointer input must not reach the pending action or cancellation handler.
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
}

async function expectNoPageOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
  ).toBeLessThanOrEqual(1);
}

async function captureOpenPopup(page: Page, popup: Locator, path: string) {
  await expect(popup).toBeVisible();
  await settleAnimations(page.locator('[data-leaf-popup][data-state="open"]'));
  await expectNoPageOverflow(page);
  await page.screenshot({ path });
}

async function expectCompleteEditor(editor: Locator) {
  await settleAnimations(editor.locator('xpath=ancestor-or-self::*[@data-leaf-popup][1]'));
  const geometry = await editor.evaluate((node) => {
    const surface = node.closest<HTMLElement>('[data-leaf-popup]');
    if (!surface) throw new Error('Editor is missing its floating surface');
    const viewport = node.getBoundingClientRect();
    const controls = [
      '.leaf-popover__title',
      '.leaf-form-field__label',
      '.leaf-input',
      'input',
      'button[type="submit"]',
    ].map((selector) => {
      const element = node.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Editor is missing ${selector}`);
      const bounds = element.getBoundingClientRect();
      const text = document.createRange();
      text.selectNodeContents(element);
      const textBounds = text.getBoundingClientRect();
      return {
        selector,
        width: bounds.width,
        height: bounds.height,
        insideViewport:
          bounds.left >= viewport.left - 1 &&
          bounds.right <= viewport.right + 1 &&
          bounds.top >= viewport.top - 1 &&
          bounds.bottom <= viewport.bottom + 1,
        textInside:
          !element.textContent?.trim() ||
          (textBounds.left >= bounds.left - 1 && textBounds.right <= bounds.right + 1),
        horizontalOverflow: element.scrollWidth - element.clientWidth,
      };
    });
    return {
      surfaceWidth: surface.getBoundingClientRect().width,
      viewportOverflow: node.scrollWidth - node.clientWidth,
      contentOverflow: Math.max(
        ...[node, ...node.querySelectorAll<HTMLElement>('.leaf-popover__content, .leaf-form')].map(
          (element) => element.scrollWidth - element.clientWidth,
        ),
      ),
      controls,
    };
  });
  expect(geometry.surfaceWidth).toBeCloseTo(280, 0);
  expect(geometry.viewportOverflow).toBeLessThanOrEqual(1);
  expect(geometry.contentOverflow).toBeLessThanOrEqual(1);
  for (const control of geometry.controls) {
    expect(control.width, `${control.selector} width`).toBeGreaterThan(0);
    expect(control.height, `${control.selector} height`).toBeGreaterThan(0);
    expect(control.insideViewport, `${control.selector} is fully inside the editor`).toBe(true);
    expect(control.textInside, `${control.selector} text is not clipped`).toBe(true);
    expect(
      control.horizontalOverflow,
      `${control.selector} horizontal overflow`,
    ).toBeLessThanOrEqual(1);
  }
}

for (const english of [false, true]) {
  for (const { width, appearance } of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Overlay examples: ${english ? 'en' : 'zh'} ${width} ${appearance}`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme: appearance });

      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      });

      test('Dropdown selections, nested menus and alternate triggers are live', async ({
        page,
      }, testInfo) => {
        const errors = await visitPage(page, 'dropdown', english, appearance);
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const basicTrigger = basic.getByRole('button', {
          name: english ? 'More actions' : '更多操作',
          exact: true,
        });
        await basicTrigger.focus();
        await basicTrigger.press('ArrowDown');
        const basicMenu = await linkedPopup(page, basicTrigger, 'menu');
        const edit = basicMenu.getByRole('menuitem', {
          name: english ? 'Edit' : '编辑',
          exact: true,
        });
        const copy = basicMenu.getByRole('menuitem', {
          name: english ? 'Copy' : '复制',
          exact: true,
        });
        await expect(edit).toBeFocused();
        await captureOpenPopup(page, basicMenu, testInfo.outputPath('dropdown-open.png'));
        await edit.press('ArrowDown');
        await expect(copy).toBeFocused();
        await copy.press('Enter');
        await expect(basic.getByRole('status')).toHaveText(
          english ? 'Selected: copy' : '已选择: copy',
        );
        await expect(basicMenu).toBeHidden();
        await expect(basicTrigger).toBeFocused();
        await basicTrigger.press('ArrowUp');
        const archive = basicMenu.getByRole('menuitem', {
          name: english ? 'Archive' : '归档',
          exact: true,
        });
        await expect(archive).toBeFocused();
        await archive.press('Escape');
        await expect(basicMenu).toBeHidden();
        await expect(basicTrigger).toBeFocused();

        const extra = preview(page, english, '右侧内容', 'Trailing content');
        const extraTrigger = extra.getByRole('button', {
          name: english ? 'More actions' : '更多操作',
          exact: true,
        });
        await extraTrigger.click();
        const extraMenu = await linkedPopup(page, extraTrigger, 'menu');
        await expect(extraMenu.getByText('Ctrl E', { exact: true })).toBeVisible();
        await expect(extraMenu.getByText(english ? 'New' : '新', { exact: true })).toBeVisible();
        await expect(extraMenu.getByText('CSV', { exact: true })).toBeVisible();
        await extraMenu
          .getByRole('menuitem', { name: english ? /^Copy link/ : /^复制链接/ })
          .click();
        await expect(extra.getByRole('status')).toHaveText(
          english ? 'Selected: copy' : '已选择: copy',
        );
        await expect(extraMenu).toBeHidden();

        const hierarchy = preview(page, english, '子菜单与分组', 'Submenus and groups');
        const hierarchyTrigger = hierarchy.getByRole('button', {
          name: english ? 'Project actions' : '项目操作',
          exact: true,
        });
        await hierarchyTrigger.click();
        const hierarchyMenu = await linkedPopup(page, hierarchyTrigger, 'menu');
        await expect(
          hierarchyMenu.getByText(english ? 'Project' : '项目', { exact: true }),
        ).toBeVisible();
        await expect(
          hierarchyMenu.getByRole('menuitem', {
            name: english ? 'Archive' : '归档',
            exact: true,
          }),
        ).toBeDisabled();
        const open = hierarchyMenu.getByRole('menuitem', {
          name: english ? 'Open' : '打开',
          exact: true,
        });
        const exportItem = hierarchyMenu.getByRole('menuitem', {
          name: english ? 'Export' : '导出',
          exact: true,
        });
        await expect(open).toBeFocused();
        await open.press('ArrowDown');
        await expect(exportItem).toBeFocused();
        await exportItem.press('ArrowRight');
        const csv = page.getByRole('menuitem', { name: 'CSV', exact: true });
        await expect(csv).toBeFocused();
        await expect(page.getByRole('menu')).toHaveCount(2);
        await expect(hierarchy.getByRole('status')).toHaveCount(0);
        await csv.press('Escape');
        await expect(page.getByRole('menu')).toHaveCount(1);
        await expect(exportItem).toBeFocused();
        await exportItem.press('ArrowRight');
        await expect(csv).toBeFocused();
        await csv.press('Enter');
        await expect(hierarchy.getByRole('status')).toHaveText(
          english ? 'Selected: csv' : '已选择: csv',
        );
        await expect(page.getByRole('menu')).toHaveCount(0);
        await expect(hierarchyTrigger).toBeFocused();

        const radio = preview(page, english, '单选菜单', 'Radio menu');
        const radioTrigger = radio.getByRole('button', {
          name: english ? 'Change view' : '切换视图',
          exact: true,
        });
        await radioTrigger.click();
        const radioMenu = await linkedPopup(page, radioTrigger, 'menu');
        const list = radioMenu.getByRole('menuitemradio', {
          name: english ? 'List' : '列表',
          exact: true,
        });
        const grid = radioMenu.getByRole('menuitemradio', {
          name: english ? 'Grid' : '网格',
          exact: true,
        });
        await expect(list).toHaveAttribute('aria-checked', 'true');
        await expect(grid).toHaveAttribute('aria-checked', 'false');
        await grid.click();
        await expect(radioMenu).toBeVisible();
        await expect(list).toHaveAttribute('aria-checked', 'false');
        await expect(grid).toHaveAttribute('aria-checked', 'true');
        await expect(radio.getByRole('status')).toHaveText(
          english ? 'Current view: Grid' : '当前视图: 网格',
        );
        await grid.press('Escape');
        await expect(radioTrigger).toBeFocused();
        await radioTrigger.click();
        await expect(grid).toHaveAttribute('aria-checked', 'true');
        await list.press('Enter');
        await expect(radioMenu).toBeVisible();
        await expect(list).toHaveAttribute('aria-checked', 'true');
        await expect(grid).toHaveAttribute('aria-checked', 'false');
        await expect(radio.getByRole('status')).toHaveText(
          english ? 'Current view: List' : '当前视图: 列表',
        );
        await list.press('Escape');

        const checkbox = preview(page, english, '复选菜单', 'Checkbox menu');
        const checkboxTrigger = checkbox.getByRole('button', {
          name: english ? 'Display options' : '显示选项',
          exact: true,
        });
        await checkboxTrigger.click();
        const checkboxMenu = await linkedPopup(page, checkboxTrigger, 'menu');
        const details = checkboxMenu.getByRole('menuitemcheckbox', {
          name: english ? 'Show details' : '显示详情',
          exact: true,
        });
        await expect(details).toHaveAttribute('aria-checked', 'true');
        await details.click();
        await expect(details).toHaveAttribute('aria-checked', 'false');
        await expect(checkboxMenu).toBeVisible();
        await expect(checkbox.getByRole('status')).toHaveText(
          english ? 'Details are hidden' : '详情已隐藏',
        );
        await details.press('Escape');
        await expect(checkboxTrigger).toBeFocused();
        await checkboxTrigger.click();
        await expect(details).toHaveAttribute('aria-checked', 'false');
        await details.press('Enter');
        await expect(details).toHaveAttribute('aria-checked', 'true');
        await expect(checkboxMenu).toBeVisible();
        await expect(checkbox.getByRole('status')).toHaveText(
          english ? 'Details are visible' : '详情已显示',
        );
        await details.press('Escape');
        await expect(page.locator('[data-leaf-popup]')).toHaveCount(0);

        await pauseClock(page);
        const hover = preview(page, english, '悬停触发', 'Hover trigger');
        const hoverTrigger = hover.getByRole('button', {
          name: english ? 'Hover to open' : '悬停展开',
          exact: true,
        });
        await hoverTrigger.hover();
        await page.clock.runFor(100);
        const hoverMenu = await linkedPopup(page, hoverTrigger, 'menu');
        await expect(hoverMenu).toBeVisible();
        await hoverMenu
          .getByRole('menuitem', { name: english ? 'Edit' : '编辑', exact: true })
          .click();
        await expect(hover.getByRole('status')).toHaveText(
          english ? 'Selected: edit' : '已选择: edit',
        );
        await expect(hoverMenu).toBeHidden();
        await page.mouse.move(0, 0);
        // Drain the documented pointer-leave delay before exercising keyboard opening.
        await page.clock.runFor(200);
        await hoverTrigger.focus();
        await hoverTrigger.press('ArrowDown');
        const hoverEdit = hoverMenu.getByRole('menuitem', {
          name: english ? 'Edit' : '编辑',
          exact: true,
        });
        await expect(hoverEdit).toBeFocused();
        await hoverEdit.press('Escape');
        await expect(hoverMenu).toBeHidden();
        await expect(hoverTrigger).toBeFocused();

        const context = preview(page, english, '右键菜单', 'Context menu');
        const contextTrigger = context.getByRole('button', {
          name: english ? 'Right-click here' : '在此右键点击',
          exact: true,
        });
        await contextTrigger.click({ button: 'right' });
        const contextMenu = await linkedPopup(page, contextTrigger, 'menu');
        await expect(contextMenu).toBeVisible();
        await contextMenu
          .getByRole('menuitem', { name: english ? 'Copy' : '复制', exact: true })
          .click();
        await expect(context.getByRole('status')).toHaveText(
          english ? 'Selected: copy' : '已选择: copy',
        );
        await expect(contextMenu).toBeHidden();
        await expect(contextTrigger).toBeFocused();
        await contextTrigger.press('ArrowUp');
        const contextCopy = contextMenu.getByRole('menuitem', {
          name: english ? 'Copy' : '复制',
          exact: true,
        });
        await expect(contextCopy).toBeFocused();
        await contextCopy.press('Escape');
        await expect(contextMenu).toBeHidden();
        await expect(contextTrigger).toBeFocused();
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });

      test('Tooltip descriptions, dismissal, disabled state and controls are live', async ({
        page,
      }, testInfo) => {
        const errors = await visitPage(page, 'tooltip', english, appearance);
        const content = english ? 'Save changes to the current project' : '保存当前项目的修改';
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const trigger = basic.getByRole('button', {
          name: english ? 'Save' : '保存',
          exact: true,
        });
        await trigger.focus();
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText(content);
        await expect(trigger).toHaveAccessibleDescription(content);
        await expectDescriptionLink(trigger, tooltip);
        await captureOpenPopup(page, tooltip, testInfo.outputPath('tooltip-open.png'));
        await trigger.press('Escape');
        await expect(tooltip).toBeHidden();
        await expect(trigger).toBeFocused();
        await expect(trigger).not.toHaveAttribute('aria-describedby');

        const placements = preview(page, english, '提示位置', 'Placement');
        for (const name of english
          ? ['Top', 'Bottom', 'Left', 'Right']
          : ['上方', '下方', '左侧', '右侧']) {
          const placementTrigger = placements
            .getByRole('group', { name, exact: true })
            .getByRole('button', { name: english ? 'Save' : '保存', exact: true });
          await placementTrigger.focus();
          await expect(tooltip).toHaveText(content);
          await expect(placementTrigger).toHaveAccessibleDescription(content);
          await placementTrigger.press('Escape');
          await expect(tooltip).toBeHidden();
          await expect(placementTrigger).toBeFocused();
        }

        const disabled = preview(page, english, '禁用提示', 'Disabled tooltip');
        const defaultTrigger = disabled
          .getByRole('group', { name: english ? 'Default' : '默认', exact: true })
          .getByRole('button', { name: english ? 'Save' : '保存', exact: true });
        const disabledTrigger = disabled
          .getByRole('group', { name: english ? 'Disabled tooltip' : '禁用提示', exact: true })
          .getByRole('button', { name: english ? 'Save' : '保存', exact: true });
        const naturalWidth = await trigger.evaluate((node) => node.getBoundingClientRect().width);
        for (const button of [defaultTrigger, disabledTrigger]) {
          const buttonWidth = await button.evaluate((node) => node.getBoundingClientRect().width);
          expect(buttonWidth).toBeCloseTo(naturalWidth, 1);
        }
        await expect(defaultTrigger).toBeEnabled();
        await defaultTrigger.focus();
        await expect(tooltip).toHaveText(content);
        await defaultTrigger.press('Escape');
        await expect(tooltip).toBeHidden();
        await expect(disabledTrigger).toBeEnabled();
        await disabledTrigger.focus();
        await expect(disabledTrigger).toBeFocused();
        await expect(tooltip).toBeHidden();
        await expect(disabledTrigger).not.toHaveAttribute('aria-describedby');
        await expect(page.locator('[data-leaf-popup]')).toHaveCount(0);
        await pauseClock(page);
        await disabledTrigger.hover();
        await page.clock.runFor(150);
        await expect(tooltip).toBeHidden();
        await page.mouse.move(0, 0);

        const controlled = preview(page, english, '受控展开', 'Controlled visibility');
        const controlledTrigger = controlled.getByRole('button', {
          name: english ? 'View help' : '查看说明',
          exact: true,
        });
        const controlledContent = english
          ? 'This setting applies to the current project'
          : '该设置应用于当前项目';
        const show = controlled.getByRole('button', {
          name: english ? 'Show tooltip' : '展开提示',
          exact: true,
        });
        const hide = controlled.getByRole('button', {
          name: english ? 'Hide tooltip' : '收起提示',
          exact: true,
        });
        await show.click();
        await expect(show).toBeFocused();
        await expect(tooltip).toHaveText(controlledContent);
        await expect(controlledTrigger).toHaveAccessibleDescription(controlledContent);
        await hide.click();
        await expect(tooltip).toBeHidden();
        await expect(controlledTrigger).not.toHaveAttribute('aria-describedby');
        await show.focus();
        await show.press('Enter');
        await expect(tooltip).toHaveText(controlledContent);
        await page.keyboard.press('Escape');
        await expect(tooltip).toBeHidden();
        await expect(controlledTrigger).toBeFocused();
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });

      test('Popover roles, focus, saved edits and reopening are live', async ({
        page,
      }, testInfo) => {
        const errors = await visitPage(page, 'popover', english, appearance);
        const title = english ? 'Project details' : '项目信息';
        const content = english
          ? 'See project details and recent updates here.'
          : '在此查看项目概览和最近更新。';
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const basicTrigger = basic.getByRole('button', {
          name: english ? 'View details' : '点击查看',
          exact: true,
        });
        await basicTrigger.click();
        const basicDialog = await linkedPopup(page, basicTrigger, 'dialog');
        await expect(basicTrigger).toHaveAttribute('aria-haspopup', 'dialog');
        await expect(basicTrigger).toHaveAttribute('aria-expanded', 'true');
        await expect(basicDialog).toHaveAccessibleName(title);
        await expect(basicDialog).toContainText(content);
        await expect(basicDialog).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(basicDialog).toBeHidden();
        await expect(basicTrigger).toHaveAttribute('aria-expanded', 'false');
        await expect(basicTrigger).toBeFocused();

        const hover = preview(page, english, '悬停提示', 'Hover details');
        const hoverTrigger = hover.getByRole('button', {
          name: english ? 'Hover for details' : '悬停查看',
          exact: true,
        });
        await hoverTrigger.hover();
        const hoverPanel = page.getByRole('tooltip', { name: title, exact: true });
        await expect(hoverPanel).toContainText(content);
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await hoverTrigger.focus();
        await expect(hoverTrigger).toBeFocused();
        await expectDescriptionLink(hoverTrigger, hoverPanel);
        await page.keyboard.press('Escape');
        await expect(hoverPanel).toBeHidden();
        await expect(hoverTrigger).toBeFocused();
        await page.mouse.move(0, 0);

        const controlled = preview(page, english, '受控编辑', 'Controlled editing');
        const editTrigger = controlled.getByRole('button', {
          name: english ? 'Edit project' : '编辑项目',
          exact: true,
        });
        await editTrigger.click();
        const editor = await linkedPopup(page, editTrigger, 'dialog');
        await expect(editor).toHaveAccessibleName(english ? 'Edit project' : '编辑项目');
        const projectName = editor.getByRole('textbox', {
          name: english ? 'Project name' : '项目名称',
          exact: true,
        });
        await expect(editor.locator('.leaf-popover__title')).toHaveText(
          english ? 'Edit project' : '编辑项目',
        );
        await expect(editor.locator('.leaf-form-field__label')).toHaveText(
          english ? 'Project name' : '项目名称',
        );
        const saveProject = editor.getByRole('button', {
          name: english ? 'Save and close' : '保存并关闭',
          exact: true,
        });
        await expect(saveProject).toBeVisible();
        await expectCompleteEditor(editor);
        await expect(projectName).toBeFocused();
        await expect(projectName).toHaveValue('Leaf Garden');
        await projectName.fill('  Leaf QA  ');
        await editor
          .getByRole('button', { name: english ? 'Save and close' : '保存并关闭', exact: true })
          .click();
        await expect(editor).toBeHidden();
        await expect(controlled.getByRole('status')).toHaveText(
          english ? 'Project name: Leaf QA' : '项目名称: Leaf QA',
        );
        await expect(editTrigger).toBeFocused();
        await editTrigger.click();
        await expect(projectName).toHaveValue('Leaf QA');
        await projectName.fill('Unsaved draft');
        await projectName.press('Escape');
        await expect(editor).toBeHidden();
        await expect(editTrigger).toBeFocused();
        await expect(controlled.getByRole('status')).toHaveText(
          english ? 'Project name: Leaf QA' : '项目名称: Leaf QA',
        );
        await editTrigger.click();
        await expect(projectName).toHaveValue('Leaf QA');
        await expect(projectName).toBeFocused();
        await expectCompleteEditor(editor);
        await captureOpenPopup(page, editor, testInfo.outputPath('popover-open.png'));
        await projectName.press('Escape');
        await expect(editor).toBeHidden();

        const placements = preview(page, english, '浮层位置', 'Panel placement');
        for (const name of english
          ? ['Top', 'Bottom', 'Left', 'Right']
          : ['上方', '下方', '左侧', '右侧']) {
          const placementTrigger = placements
            .getByRole('group', { name, exact: true })
            .getByRole('button', { name: english ? 'View details' : '查看详情', exact: true });
          await placementTrigger.click();
          const panel = await linkedPopup(page, placementTrigger, 'dialog');
          await expect(panel).toHaveAccessibleName(title);
          await expect(panel).toBeFocused();
          await page.keyboard.press('Escape');
          await expect(panel).toBeHidden();
          await expect(placementTrigger).toBeFocused();
        }
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });

      test('Popconfirm pending protection, success and rejected retries are live', async ({
        page,
      }, testInfo) => {
        const errors = await visitPage(page, 'popconfirm', english, appearance);
        const confirmName = english ? 'OK' : '确定';
        const cancelName = english ? 'Cancel' : '取消';
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const basicTrigger = basic.getByRole('button', {
          name: english ? 'Remove project' : '移除项目',
          exact: true,
        });
        await basicTrigger.click();
        const basicDialog = await linkedPopup(page, basicTrigger, 'dialog');
        await expect(basicDialog).toHaveAccessibleName(
          english ? 'Remove this project?' : '移除此项目？',
        );
        const basicCancel = basicDialog.getByRole('button', { name: cancelName, exact: true });
        await expect(basicCancel).toBeFocused();
        await basicCancel.click();
        await expect(basicDialog).toBeHidden();
        await expect(basicTrigger).toBeFocused();
        await expect(basic.getByRole('status')).toHaveCount(0);
        await basicTrigger.press('Enter');
        await basicDialog.getByRole('button', { name: confirmName, exact: true }).click();
        await expect(basicDialog).toBeHidden();
        await expect(basicTrigger).toBeDisabled();
        await expect(basic.getByRole('status')).toHaveText(
          english ? 'Project removed.' : '项目已移除。',
        );
        await expect(page.locator('[data-leaf-popup]')).toHaveCount(0);

        await pauseClock(page);
        const asynchronous = preview(page, english, '异步确认', 'Asynchronous confirmation');
        const submit = asynchronous.getByRole('button', {
          name: english ? 'Submit for review' : '提交审核',
          exact: true,
        });
        await submit.click();
        const asyncDialog = await linkedPopup(page, submit, 'dialog');
        const confirm = asyncDialog.getByRole('button', { name: confirmName, exact: true });
        const cancel = asyncDialog.getByRole('button', { name: cancelName, exact: true });
        await confirm.click();
        await expect(confirm).toHaveAttribute('aria-busy', 'true');
        await clickDisabledButton(page, confirm);
        await clickDisabledButton(page, confirm);
        await clickDisabledButton(page, cancel);
        await expect(asynchronous.getByRole('status')).toHaveCount(0);
        await page.keyboard.press('Escape');
        await expect(asyncDialog).toBeVisible();
        await page.getByRole('heading', { level: 1 }).click();
        await expect(asyncDialog).toBeVisible();
        await submit.click();
        await expect(asyncDialog).toBeVisible();
        await page.clock.runFor(899);
        await expect(confirm).toHaveAttribute('aria-busy', 'true');
        await expect(cancel).toBeDisabled();
        await expect(asynchronous.getByRole('status')).toHaveCount(0);
        await page.clock.runFor(1);
        await expect(asyncDialog).toBeHidden();
        await expect(submit).toBeDisabled();
        await expect(asynchronous.getByRole('status')).toHaveText(
          english ? 'Submitted for review.' : '已提交审核。',
        );

        const retry = preview(page, english, '失败与重试', 'Failure and retry');
        const retryTrigger = retry.getByRole('button', {
          name: english ? 'Submit with retry' : '提交并重试',
          exact: true,
        });
        await retryTrigger.click();
        const retryDialog = await linkedPopup(page, retryTrigger, 'dialog');
        const retryConfirm = retryDialog.getByRole('button', { name: confirmName, exact: true });
        const retryCancel = retryDialog.getByRole('button', { name: cancelName, exact: true });
        await retryConfirm.click();
        await expect(retryConfirm).toHaveAttribute('aria-busy', 'true');
        await expect(retryCancel).toBeDisabled();
        await page.clock.runFor(900);
        await expect(retryDialog).toBeVisible();
        await expect(retryDialog.getByRole('alert')).toHaveText(
          english ? 'Action failed. Please retry.' : '操作失败，请重试',
        );
        await expect(retry.getByRole('status')).toHaveText(
          english ? 'The network is temporarily unavailable.' : '网络暂时不可用。',
        );
        await expect(retryConfirm).toBeEnabled();
        await expect(retryCancel).toBeEnabled();
        await expect(retryTrigger).toBeEnabled();
        await captureOpenPopup(page, retryDialog, testInfo.outputPath('popconfirm-error.png'));
        await retryConfirm.click();
        await expect(retryDialog.getByRole('alert')).toHaveCount(0);
        await expect(retry.getByRole('status')).toHaveText('');
        await expect(retryConfirm).toHaveAttribute('aria-busy', 'true');
        await page.clock.runFor(899);
        await expect(retryDialog).toBeVisible();
        await expect(retryCancel).toBeDisabled();
        await expect(retry.getByRole('status')).toHaveText('');
        await page.clock.runFor(1);
        await expect(retryDialog).toBeHidden();
        await expect(retryTrigger).toBeDisabled();
        await expect(retry.getByRole('status')).toHaveText(
          english ? 'Submitted for review.' : '已提交审核。',
        );
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });
    });
  }
}
