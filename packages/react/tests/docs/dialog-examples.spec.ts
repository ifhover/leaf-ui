import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

async function openPage(
  page: Page,
  component: 'modal' | 'drawer' | 'confirm',
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

async function expectNoPageOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
  ).toBeLessThanOrEqual(1);
}

async function expectCompleteDialog(page: Page, dialog: Locator, expectedWidth: number) {
  await expect(dialog).toBeVisible();
  await settleAnimations(dialog);
  const geometry = await dialog.evaluate((panel) => {
    const bounds = panel.getBoundingClientRect();
    const nodes = panel.querySelectorAll<HTMLElement>(
      'h2, .leaf-modal__description, .leaf-drawer__description, .leaf-form-field__label, ' +
        '.leaf-input, input, .leaf-button, .leaf-button__label, .leaf-modal__close, ' +
        '.leaf-paragraph, .leaf-confirm-description, .leaf-confirm-error, [role="status"]',
    );
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
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
        const checkText = node.matches(
          'h2, .leaf-modal__description, .leaf-drawer__description, .leaf-form-field__label, ' +
            '.leaf-button__label, .leaf-paragraph, .leaf-confirm-description, ' +
            '.leaf-confirm-error, [role="status"]',
        );
        const range = document.createRange();
        range.selectNodeContents(node);
        const textFits =
          !checkText ||
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
  expect(geometry.width, 'Public default or configured dialog width').toBeCloseTo(expectedWidth, 0);
  expect(geometry.x).toBeGreaterThanOrEqual(-1);
  expect(geometry.y).toBeGreaterThanOrEqual(-1);
  expect(geometry.right).toBeLessThanOrEqual(viewport.width + 1);
  expect(geometry.bottom).toBeLessThanOrEqual(viewport.height + 1);
  // Keep shell overflow a failure while collecting the remaining interaction evidence.
  expect.soft(geometry.overflow, 'Dialog shell has no horizontal overflow').toBeLessThanOrEqual(1);
  expect(geometry.controls.length).toBeGreaterThan(0);
  for (const control of geometry.controls) {
    expect(control.width, `${control.name}: width`).toBeGreaterThan(0);
    expect(control.height, `${control.name}: height`).toBeGreaterThan(0);
    expect(control.inside, `${control.name}: fully visible inside the dialog`).toBe(true);
    expect(control.textFits, `${control.name}: complete text inside clipping ancestors`).toBe(true);
  }
  await expectNoPageOverflow(page);
}

async function installPausedClock(page: Page) {
  await page.clock.install({ time: new Date('2026-10-26T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
}

async function pauseClockAgain(page: Page) {
  const current = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(current + 1000));
}

async function clickDisabledButton(page: Page, button: Locator) {
  await expect(button).toBeDisabled();
  const bounds = await button.boundingBox();
  if (!bounds) throw new Error('Missing disabled button bounds');
  // Exercise native disabled behavior without forcing or dispatching synthetic clicks.
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
}

for (const english of [false, true]) {
  for (const { width, appearance } of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Dialog examples: ${english ? 'en' : 'zh'} ${width} ${appearance}`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme: appearance });
      test.setTimeout(90_000);

      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      });

      test('Modal form validation, footer, lifetime, focus and async saving are live', async ({
        page,
      }, testInfo) => {
        const errors = await openPage(page, 'modal', english, appearance);
        const modalWidth = Math.min(480, width - 48);
        const title = english ? 'Edit title' : '编辑标题';
        const fieldName = english ? 'Title' : '标题';
        const cancelName = english ? 'Cancel' : '取消';
        const saveName = english ? 'Save' : '保存';
        const closeName = english ? 'Close' : '关闭';
        const requiredMessage = english ? 'Please fill out this field' : '请填写此项';

        const basic = preview(page, english, '基础用法', 'Basic usage');
        const basicTrigger = basic.getByRole('button', { name: title, exact: true });
        await basicTrigger.click();
        const basicDialog = page.getByRole('dialog', { name: title, exact: true });
        const basicInput = basicDialog.getByRole('textbox', { name: fieldName, exact: true });
        await expect(basicInput).toHaveValue('Leaf UI');
        await expect(basicInput).toHaveAttribute('required', '');
        const basicNode = await basicInput.elementHandle();
        if (!basicNode) throw new Error('Missing basic modal input');
        const basicSave = basicDialog.getByRole('button', { name: saveName, exact: true });
        await expect(basicSave).toHaveAttribute('type', 'submit');
        expect(await basicSave.getAttribute('form')).toBe(
          await basicDialog.locator('form').getAttribute('id'),
        );
        await basicInput.clear();
        await basicSave.click();
        await expect(basicDialog).toBeVisible();
        await expect(basicDialog.getByRole('alert')).toHaveText(requiredMessage);
        await expect(basicInput).toBeFocused();
        expect(
          await basicInput.evaluate((node: HTMLInputElement) => node.validity.valueMissing),
        ).toBe(true);
        await expectCompleteDialog(page, basicDialog, modalWidth);
        await page.screenshot({ path: testInfo.outputPath('modal-required.png') });
        await basicInput.fill('QA title');
        await expect(basicDialog.getByRole('alert')).toHaveCount(0);
        await basicSave.click();
        await expect(basicDialog).toBeHidden();
        await expect(basicTrigger).toBeFocused();
        expect(await basicNode.evaluate((node) => node.isConnected)).toBe(true);
        await basicTrigger.click();
        await expect(basicInput).toHaveValue('QA title');
        await basicInput.press('Escape');
        await expect(basicDialog).toBeHidden();

        const card = preview(page, english, '卡片外观', 'Card surface');
        await card
          .getByRole('button', { name: english ? 'Open card dialog' : '打开卡片弹窗', exact: true })
          .click();
        const cardDialog = page.getByRole('dialog', {
          name: english ? 'Instructions' : '使用说明',
          exact: true,
        });
        await expect(cardDialog).toHaveClass(/leaf-modal--card/);
        await expect(
          cardDialog.getByText(
            english
              ? 'Documents are saved as drafts and become visible to others after publishing.'
              : '文档会自动保存为草稿，发布后才会对其他人可见。',
            { exact: true },
          ),
        ).toBeVisible();
        await expectCompleteDialog(page, cardDialog, modalWidth);
        await page.screenshot({ path: testInfo.outputPath('modal-card.png') });
        await cardDialog.getByRole('button', { name: cancelName, exact: true }).click();
        await expect(cardDialog).toBeHidden();

        const description = preview(page, english, '图标与说明', 'Icon and description');
        const rename = english ? 'Rename file' : '重命名文件';
        await description.getByRole('button', { name: rename, exact: true }).click();
        const descriptionDialog = page.getByRole('dialog', { name: rename, exact: true });
        await expect(descriptionDialog).toHaveAccessibleDescription(
          english
            ? 'The new name will appear in the file list and downloads.'
            : '新名称会用于文件列表和下载。',
        );
        await expect(descriptionDialog.locator('.leaf-modal__icon')).toBeVisible();
        const filename = descriptionDialog.getByRole('textbox', {
          name: english ? 'File name' : '文件名',
          exact: true,
        });
        await expect(filename).toHaveValue(english ? 'Design notes.md' : '设计说明.md');
        await expectCompleteDialog(page, descriptionDialog, modalWidth);
        await page.screenshot({ path: testInfo.outputPath('modal-description.png') });
        await descriptionDialog.getByRole('button', { name: saveName, exact: true }).click();
        await expect(descriptionDialog).toBeHidden();

        const footer = preview(page, english, '自定义底部', 'Custom footer');
        const footerTrigger = footer.getByRole('button', {
          name: english ? 'Custom footer' : '自定义底部',
          exact: true,
        });
        await footerTrigger.click();
        const footerDialog = page.getByRole('dialog', {
          name: english ? 'About drafts' : '草稿说明',
          exact: true,
        });
        const detail = footerDialog.getByText(
          english
            ? 'Drafts are visible only to you until you publish them.'
            : '草稿只对你可见，发布后才会与其他人共享。',
          { exact: true },
        );
        await expect(detail).toHaveCount(0);
        await footerDialog
          .getByRole('button', { name: english ? 'View details' : '查看详情', exact: true })
          .click();
        await expect(detail).toBeVisible();
        await expectCompleteDialog(page, footerDialog, modalWidth);
        await page.screenshot({ path: testInfo.outputPath('modal-custom-footer.png') });
        await footerDialog
          .getByRole('button', { name: english ? 'Hide details' : '收起详情', exact: true })
          .click();
        await expect(detail).toHaveCount(0);
        await footerDialog
          .getByRole('button', { name: english ? 'OK' : '确定', exact: true })
          .click();
        await expect(footerDialog).toBeHidden();
        await expect(footerTrigger).toBeFocused();

        const destroy = preview(page, english, '关闭后销毁内容', 'Destroy content on close');
        const destroyTrigger = destroy.getByRole('button', {
          name: english ? 'Open temporary draft' : '打开临时草稿',
          exact: true,
        });
        await destroyTrigger.click();
        const destroyDialog = page.getByRole('dialog', {
          name: english ? 'Temporary draft' : '临时草稿',
          exact: true,
        });
        const draft = destroyDialog.getByRole('textbox', {
          name: english ? 'Draft title' : '草稿标题',
          exact: true,
        });
        await expect(draft).toHaveValue(english ? 'New draft' : '新的草稿');
        const draftNode = await draft.elementHandle();
        if (!draftNode) throw new Error('Missing disposable draft input');
        await draft.fill('Unsaved draft');
        await expectCompleteDialog(page, destroyDialog, modalWidth);
        await page.screenshot({ path: testInfo.outputPath('modal-disposable-draft.png') });
        await destroyDialog.getByRole('button', { name: closeName, exact: true }).click();
        await expect(destroyDialog).toBeHidden();
        await expect.poll(() => draftNode.evaluate((node) => node.isConnected)).toBe(false);
        await destroyTrigger.click();
        await expect(draft).toHaveValue(english ? 'New draft' : '新的草稿');
        expect(await draft.evaluate((node, previous) => node === previous, draftNode)).toBe(false);
        await draft.press('Escape');
        await expect(destroyDialog).toBeHidden();

        const focus = preview(page, english, '初始焦点', 'Initial focus');
        const focusTrigger = focus.getByRole('button', {
          name: english ? 'Focus the input' : '聚焦输入框',
          exact: true,
        });
        await focusTrigger.click();
        const focusDialog = page.getByRole('dialog', { name: title, exact: true });
        const focusedInput = focusDialog.getByRole('textbox', {
          name: fieldName,
          exact: true,
        });
        await expect(focusedInput).toBeFocused();
        await expectCompleteDialog(page, focusDialog, modalWidth);
        await page.screenshot({ path: testInfo.outputPath('modal-initial-focus.png') });
        await focusDialog
          .getByRole('button', { name: english ? 'OK' : '确定', exact: true })
          .focus();
        await page.keyboard.press('Tab');
        await expect(
          focusDialog.getByRole('button', { name: closeName, exact: true }),
        ).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(focusDialog).toBeHidden();
        await expect(focusTrigger).toBeFocused();

        const asynchronous = preview(page, english, '异步提交', 'Async submission');
        const asyncTrigger = asynchronous.getByRole('button', {
          name: english ? 'Save title asynchronously' : '异步保存标题',
          exact: true,
        });
        const saved = asynchronous.getByRole('status');
        const savedPrefix = english ? 'Saved: ' : '已保存：';
        await expect(saved).toHaveText(`${savedPrefix}Leaf UI`);
        await asyncTrigger.click();
        const asyncDialog = page.getByRole('dialog', { name: title, exact: true });
        const asyncInput = asyncDialog.getByRole('textbox', { name: fieldName, exact: true });
        await asyncInput.fill('Saved title');
        await expectCompleteDialog(page, asyncDialog, modalWidth);
        await installPausedClock(page);
        const confirm = asyncDialog.getByRole('button', { name: saveName, exact: true });
        const cancel = asyncDialog.getByRole('button', { name: cancelName, exact: true });
        await confirm.click();
        await expect(confirm).toHaveAttribute('aria-busy', 'true');
        await expect(asyncInput).toBeDisabled();
        await clickDisabledButton(page, confirm);
        await clickDisabledButton(page, confirm);
        await clickDisabledButton(page, cancel);
        await asyncDialog.getByRole('button', { name: closeName, exact: true }).click();
        await page.mouse.click(5, 5);
        await page.keyboard.press('Escape');
        await expect(asyncDialog).toBeVisible();
        await expect(saved).toHaveText(`${savedPrefix}Leaf UI`);
        await page.screenshot({ path: testInfo.outputPath('modal-async-pending.png') });
        await page.clock.runFor(899);
        await expect(confirm).toHaveAttribute('aria-busy', 'true');
        await expect(asyncDialog).toBeVisible();
        await expect(saved).toHaveText(`${savedPrefix}Leaf UI`);
        await page.clock.runFor(1);
        await expect(saved).toHaveText(`${savedPrefix}Saved title`);
        await expect(asyncDialog).toBeHidden();
        await expect(asyncTrigger).toBeFocused();
        await page.clock.resume();
        await asyncTrigger.click();
        await expect(asyncInput).toHaveValue('Saved title');
        await asyncInput.fill('Discarded title');
        await page.keyboard.press('Escape');
        await expect(asyncDialog).toBeHidden();
        await expect(saved).toHaveText(`${savedPrefix}Saved title`);
        await asyncTrigger.click();
        await expect(asyncInput).toHaveValue('Saved title');
        await page.keyboard.press('Escape');
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });

      test('Drawer placements, native submission, keyboard resizing and nested push are live', async ({
        page,
      }, testInfo) => {
        const errors = await openPage(page, 'drawer', english, appearance);
        const drawerWidth = Math.min(380, width);
        const detailsName = english ? 'Document details' : '文档详情';
        const closeName = english ? 'Close' : '关闭';
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const basicTrigger = basic.getByRole('button', {
          name: english ? 'View details' : '查看详情',
          exact: true,
        });
        await basicTrigger.click();
        const basicDialog = page.getByRole('dialog', { name: detailsName, exact: true });
        await expect(basicDialog).toHaveClass(/leaf-drawer--card/);
        await expectCompleteDialog(page, basicDialog, drawerWidth);
        await page.screenshot({ path: testInfo.outputPath('drawer-basic.png') });
        await page.keyboard.press('Escape');
        await expect(basicDialog).toBeHidden();
        await expect(basicTrigger).toBeFocused();

        const placement = preview(page, english, '展开方向', 'Placement');
        for (const [side, label] of [
          ['left', english ? 'Left' : '左侧'],
          ['right', english ? 'Right' : '右侧'],
          ['top', english ? 'Top' : '顶部'],
          ['bottom', english ? 'Bottom' : '底部'],
        ] as const) {
          const trigger = placement.getByRole('button', { name: label, exact: true });
          await trigger.click();
          const dialog = page.getByRole('dialog', { name: detailsName, exact: true });
          const horizontal = side === 'left' || side === 'right';
          await expectCompleteDialog(page, dialog, horizontal ? drawerWidth : width);
          const bounds = await dialog.boundingBox();
          if (!bounds) throw new Error('Missing placed drawer bounds');
          if (horizontal) {
            expect(bounds.height).toBeCloseTo(900, 0);
            expect(bounds.y).toBeCloseTo(0, 0);
            expect(bounds.x).toBeCloseTo(side === 'left' ? 0 : width - drawerWidth, 0);
          } else {
            expect(bounds.height).toBeCloseTo(300, 0);
            expect(bounds.x).toBeCloseTo(0, 0);
            expect(bounds.y).toBeCloseTo(side === 'top' ? 0 : 600, 0);
          }
          await page.screenshot({ path: testInfo.outputPath(`drawer-${side}.png`) });
          await dialog.getByRole('button', { name: closeName, exact: true }).click();
          await expect(dialog).toBeHidden();
          await expect(trigger).toBeFocused();
        }

        const footer = preview(page, english, '底部提交', 'Footer submission');
        const editName = english ? 'Edit name' : '编辑名称';
        await footer.getByRole('button', { name: editName, exact: true }).click();
        const footerDialog = page.getByRole('dialog', { name: editName, exact: true });
        const name = footerDialog.getByRole('textbox', {
          name: english ? 'Name' : '名称',
          exact: true,
        });
        const save = footerDialog.getByRole('button', {
          name: english ? 'Save' : '保存',
          exact: true,
        });
        await expect(save).toHaveAttribute('type', 'submit');
        expect(await save.getAttribute('form')).toBe(
          await footerDialog.locator('form').getAttribute('id'),
        );
        await name.clear();
        await save.click();
        await expect(footerDialog).toBeVisible();
        await expect(footerDialog.getByRole('alert')).toHaveText(
          english ? 'Please fill out this field' : '请填写此项',
        );
        await expect(name).toBeFocused();
        await expectCompleteDialog(page, footerDialog, drawerWidth);
        await page.screenshot({ path: testInfo.outputPath('drawer-footer-required.png') });
        await name.fill('QA document');
        await save.click();
        await expect(footerDialog).toBeHidden();
        await expect(footer.getByRole('button', { name: editName, exact: true })).toBeFocused();

        const resize = preview(page, english, '调整尺寸', 'Resizing');
        const resizeTrigger = resize.getByRole('button', {
          name: english ? 'Resize the drawer' : '调整抽屉宽度',
          exact: true,
        });
        await resizeTrigger.click();
        const resizeDialog = page.getByRole('dialog', {
          name: english ? 'Resize' : '调整宽度',
          exact: true,
        });
        await settleAnimations(resizeDialog);
        const separator = resizeDialog.getByRole('separator');
        await expect(separator).toHaveAttribute('aria-valuemin', '260');
        await expect(separator).toHaveAttribute('aria-valuemax', '640');
        await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
        await expect(resizeDialog.getByRole('status')).toHaveText(
          english ? 'Not resized yet' : '尚未调整尺寸',
        );
        await separator.focus();
        await separator.press('ArrowLeft');
        await expect(separator).toHaveAttribute('aria-valuenow', String(drawerWidth + 10));
        for (let step = 0; step < 20; step++) await separator.press('ArrowRight');
        await expect(separator).toHaveAttribute('aria-valuenow', '260');
        await separator.press('ArrowRight');
        await expect(separator).toHaveAttribute('aria-valuenow', '260');
        await separator.press('ArrowLeft');
        await expect(separator).toHaveAttribute('aria-valuenow', '270');
        await expect(resizeDialog.getByRole('status')).toHaveText(
          english ? 'Resized to: 270px' : '调整值：270px',
        );
        await expectCompleteDialog(page, resizeDialog, 270);
        await page.screenshot({ path: testInfo.outputPath('drawer-keyboard-resized.png') });
        await separator.press('Escape');
        await expect(resizeDialog).toBeHidden();
        await resizeTrigger.click();
        await expect(separator).toHaveAttribute('aria-valuenow', '270');
        await expectCompleteDialog(page, resizeDialog, 270);
        await page.keyboard.press('Escape');
        await expect(resizeDialog).toBeHidden();

        const nested = preview(page, english, '嵌套推移', 'Nested push');
        const parentTrigger = nested.getByRole('button', {
          name: english ? 'Open first drawer' : '打开第一层',
          exact: true,
        });
        const parent = page.getByRole('dialog', {
          name: english ? 'First drawer' : '第一层抽屉',
          exact: true,
        });
        const child = page.getByRole('dialog', {
          name: english ? 'Second drawer' : '第二层抽屉',
          exact: true,
        });
        await parentTrigger.click();
        await expectCompleteDialog(page, parent, drawerWidth);
        const childTrigger = parent.getByRole('button', {
          name: english ? 'Open second drawer' : '打开第二层',
          exact: true,
        });
        await childTrigger.click();
        await expect(page.getByRole('dialog')).toHaveCount(2);
        await expect(parent).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -40, 0)');
        await expectCompleteDialog(page, child, 300);
        await page.screenshot({ path: testInfo.outputPath('drawer-nested-push.png') });
        await page.keyboard.press('Escape');
        await expect(child).toBeHidden();
        await expect(parent).toBeVisible();
        await expect(childTrigger).toBeFocused();
        await expect(parent).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
        await parent.getByRole('button', { name: closeName, exact: true }).click();
        await expect(parent).toBeHidden();
        await expect(parentTrigger).toBeFocused();
        await parentTrigger.click();
        await expect(parent).toBeVisible();
        await expect(child).toBeHidden();
        await expect(page.getByRole('dialog')).toHaveCount(1);
        await page.keyboard.press('Escape');
        await expect(parent).toBeHidden();
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });

      test('Confirm cancellation, states, pending protection, rejection and retry are live', async ({
        page,
      }, testInfo) => {
        const errors = await openPage(page, 'confirm', english, appearance);
        const confirmWidth = Math.min(420, width - 48);
        const confirmName = english ? 'OK' : '确定';
        const cancelName = english ? 'Cancel' : '取消';
        const dialog = page.getByRole('alertdialog');
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const saveTrigger = basic.getByRole('button', {
          name: english ? 'Save changes' : '保存更改',
          exact: true,
        });
        await saveTrigger.click();
        await expect(dialog).toHaveAccessibleName(english ? 'Save changes?' : '保存更改？');
        await expect(dialog).toHaveAccessibleDescription(
          english ? 'The new settings will take effect immediately.' : '保存后，新设置会立即生效。',
        );
        await expect(dialog.locator('.leaf-confirm__icon')).toHaveCount(0);
        const keepEditing = dialog.getByRole('button', {
          name: english ? 'Keep editing' : '继续编辑',
          exact: true,
        });
        await expect
          .poll(() => dialog.evaluate((node) => node.contains(document.activeElement)))
          .toBe(true);
        await expectCompleteDialog(page, dialog, confirmWidth);
        await page.screenshot({ path: testInfo.outputPath('confirm-basic.png') });
        await keepEditing.click();
        await expect(basic.getByRole('status')).toHaveText(
          english ? 'Save cancelled' : '已取消保存',
        );
        await expect(dialog).toBeHidden();
        await expect(saveTrigger).toBeFocused();
        await expect(page.getByRole('alertdialog', { includeHidden: true })).toHaveCount(0);
        await saveTrigger.click();
        await dialog.getByRole('button', { name: english ? 'Save' : '保存', exact: true }).click();
        await expect(basic.getByRole('status')).toHaveText(
          english ? 'Changes saved' : '更改已保存',
        );
        await expect(dialog).toBeHidden();
        await expect(page.getByRole('alertdialog', { includeHidden: true })).toHaveCount(0);

        const states = preview(page, english, '状态提示', 'Semantic states');
        for (const [state, triggerName, title] of [
          [
            'info',
            english ? 'Information' : '信息提示',
            english ? 'Share this link?' : '分享链接？',
          ],
          [
            'success',
            english ? 'Success' : '成功提示',
            english ? 'Export ready' : '导出已准备就绪',
          ],
          [
            'warning',
            english ? 'Warning' : '警告确认',
            english ? 'Leave this page?' : '离开当前页面？',
          ],
        ] as const) {
          const trigger = states.getByRole('button', { name: triggerName, exact: true });
          await trigger.click();
          await expect(dialog).toHaveAccessibleName(title);
          await expect(dialog.locator('.leaf-confirm__icon')).toBeVisible();
          await expect(dialog).toHaveClass(new RegExp(`leaf-confirm--${state}`));
          await expect(dialog.getByRole('button', { name: cancelName, exact: true })).toHaveCount(
            state === 'success' ? 0 : 1,
          );
          await expectCompleteDialog(page, dialog, confirmWidth);
          await page.screenshot({ path: testInfo.outputPath(`confirm-${state}.png`) });
          await page.keyboard.press('Escape');
          await expect(dialog).toBeHidden();
          await expect(trigger).toBeFocused();
          await expect(page.getByRole('alertdialog', { includeHidden: true })).toHaveCount(0);
        }

        const asynchronous = preview(page, english, '异步确认', 'Async confirmation');
        const deleteTrigger = asynchronous.getByRole('button', {
          name: english ? 'Delete project' : '删除项目',
          exact: true,
        });
        await deleteTrigger.click();
        await expect(dialog).toHaveAccessibleName(english ? 'Delete project' : '删除项目');
        await expect(dialog).toHaveClass(/leaf-confirm--danger/);
        await expectCompleteDialog(page, dialog, confirmWidth);
        await installPausedClock(page);
        const confirm = dialog.getByRole('button', { name: confirmName, exact: true });
        const cancel = dialog.getByRole('button', { name: cancelName, exact: true });
        await confirm.click();
        await expect(confirm).toHaveAttribute('aria-busy', 'true');
        await clickDisabledButton(page, confirm);
        await clickDisabledButton(page, confirm);
        await clickDisabledButton(page, cancel);
        await page.mouse.click(5, 5);
        await page.keyboard.press('Escape');
        await expect(dialog).toBeVisible();
        await expect(asynchronous.getByRole('status')).toHaveCount(0);
        await page.screenshot({ path: testInfo.outputPath('confirm-async-pending.png') });
        await page.clock.runFor(899);
        await expect(dialog).toBeVisible();
        await expect(confirm).toHaveAttribute('aria-busy', 'true');
        await expect(cancel).toBeDisabled();
        await expect(asynchronous.getByRole('status')).toHaveCount(0);
        await page.clock.runFor(1);
        await expect(asynchronous.getByRole('status')).toHaveText(
          english ? 'Project deleted' : '项目已删除',
        );
        await expect(dialog).toBeHidden();
        await expect(deleteTrigger).toBeFocused();
        await page.clock.resume();
        await expect(page.getByRole('alertdialog', { includeHidden: true })).toHaveCount(0);

        const retry = preview(page, english, '失败与重试', 'Failure and retry');
        const retryTrigger = retry.getByRole('button', {
          name: english ? 'Submit with retry' : '提交与重试',
          exact: true,
        });
        const failure = english ? 'Unable to submit. Please try again.' : '暂时无法提交，请重试。';
        await retryTrigger.click();
        await expect(dialog).toHaveAccessibleName(english ? 'Submit changes?' : '提交更改？');
        await settleAnimations(dialog);
        await pauseClockAgain(page);
        await confirm.click();
        await expect(confirm).toHaveAttribute('aria-busy', 'true');
        await expect(cancel).toBeDisabled();
        await page.clock.runFor(599);
        await expect(dialog.getByRole('alert')).toHaveCount(0);
        await expect(confirm).toBeDisabled();
        await page.clock.runFor(1);
        await expect(dialog.getByRole('alert')).toHaveText(failure);
        await expect(confirm).toBeEnabled();
        await expect(cancel).toBeEnabled();
        await expect(retry.getByRole('status')).toHaveCount(0);
        await page.keyboard.press('Tab');
        await expect(dialog.getByRole('alert')).toHaveText(failure);
        await page.clock.resume();
        await expectCompleteDialog(page, dialog, confirmWidth);
        await page.screenshot({ path: testInfo.outputPath('confirm-retry-error.png') });
        await pauseClockAgain(page);
        await confirm.click();
        await expect(dialog.getByRole('alert')).toHaveCount(0);
        await expect(confirm).toHaveAttribute('aria-busy', 'true');
        await page.clock.runFor(599);
        await expect(dialog).toBeVisible();
        await expect(retry.getByRole('status')).toHaveCount(0);
        await page.clock.runFor(1);
        await expect(retry.getByRole('status')).toHaveText(
          english ? 'Changes submitted' : '更改已提交',
        );
        await expect(dialog).toBeHidden();
        await expect(retryTrigger).toBeFocused();
        await page.clock.resume();
        await expect(page.getByRole('alertdialog', { includeHidden: true })).toHaveCount(0);

        await retryTrigger.click();
        await expect(dialog.getByRole('alert')).toHaveCount(0);
        await settleAnimations(dialog);
        await pauseClockAgain(page);
        await confirm.click();
        await page.clock.runFor(600);
        await expect(dialog.getByRole('alert')).toHaveText(failure);
        await cancel.click();
        await expect(retry.getByRole('status')).toHaveText(
          english ? 'Submission cancelled' : '已取消提交',
        );
        await expect(dialog).toBeHidden();
        await page.clock.resume();
        await expect(page.getByRole('alertdialog', { includeHidden: true })).toHaveCount(0);
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });
    });
  }
}
