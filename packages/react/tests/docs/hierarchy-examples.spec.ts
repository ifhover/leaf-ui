import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

async function openPage(
  page: Page,
  component: 'cascader' | 'transfer' | 'tree',
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

async function dialogFor(page: Page, trigger: Locator) {
  const id = await trigger.getAttribute('aria-controls');
  if (!id) throw new Error('Cascader trigger is missing aria-controls');
  const dialog = page.getByRole('dialog').and(page.locator(`[id="${id}"]`));
  await expect(dialog).toBeVisible();
  await settleAnimations(dialog.locator('xpath=ancestor-or-self::*[@data-leaf-popup][1]'));
  return dialog;
}

async function pauseClock(page: Page) {
  await page.clock.install({ time: new Date('2026-10-26T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
}

async function expectNoPageOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
  ).toBeLessThanOrEqual(1);
}

async function expectUnclipped(target: Locator, checkText = false) {
  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeVisible();
  const geometry = await target.evaluate((node, includeText) => {
    const bounds = node.getBoundingClientRect();
    let left = 0;
    let right = window.innerWidth;
    let top = 0;
    let bottom = window.innerHeight;
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      const box = parent.getBoundingClientRect();
      if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
        left = Math.max(left, box.left + parent.clientLeft);
        right = Math.min(right, box.left + parent.clientLeft + parent.clientWidth);
      }
      if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
        top = Math.max(top, box.top + parent.clientTop);
        bottom = Math.min(bottom, box.top + parent.clientTop + parent.clientHeight);
      }
    }
    const text =
      node.querySelector('.leaf-checkbox__label, .leaf-tree__title') ??
      node.querySelector(':scope > span') ??
      node;
    const range = document.createRange();
    range.selectNodeContents(text);
    const textBounds = range.getBoundingClientRect();
    return {
      width: bounds.width,
      height: bounds.height,
      insideClips:
        bounds.left >= left - 1 &&
        bounds.right <= right + 1 &&
        bounds.top >= top - 1 &&
        bounds.bottom <= bottom + 1,
      textFits:
        !includeText ||
        (textBounds.left >= bounds.left - 1 &&
          textBounds.right <= bounds.right + 1 &&
          textBounds.top >= bounds.top - 1 &&
          textBounds.bottom <= bounds.bottom + 1),
    };
  }, checkText);
  expect(geometry.width).toBeGreaterThan(0);
  expect(geometry.height).toBeGreaterThan(0);
  expect(
    geometry.insideClips,
    'The scrolled-to control is fully inside its clipping ancestors',
  ).toBe(true);
  expect(geometry.textFits, 'Visible option text fits inside its control').toBe(true);
}

function treeItem(tree: Locator, key: string) {
  return tree.locator(`[role="treeitem"][data-node-key="${key}"]`);
}

function treeTitle(tree: Locator, key: string) {
  return treeItem(tree, key).locator('.leaf-tree__title').first();
}

for (const english of [false, true]) {
  for (const { width, appearance } of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Hierarchy examples: ${english ? 'en' : 'zh'} ${width} ${appearance}`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme: appearance });
      test.setTimeout(90_000);

      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      });

      test('Cascader drafts, values, lazy children and cache versions are live', async ({
        page,
      }, testInfo) => {
        const errors = await openPage(page, 'cascader', english, appearance);
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const basicTrigger = basic.getByRole('combobox');
        await basicTrigger.click();
        const basicDialog = await dialogFor(page, basicTrigger);
        await basicDialog
          .getByRole('option', { name: english ? 'Design' : '设计', exact: true })
          .click();
        await expect(basicTrigger).toHaveText(english ? 'Choose a category' : '选择项目分类');
        await expect(basicTrigger).toHaveAttribute('aria-expanded', 'true');
        const interfaceOption = basicDialog.getByRole('option', {
          name: english ? 'Interface design' : '界面设计',
          exact: true,
        });
        // Only the active option must fit: other columns may legitimately scroll horizontally.
        await expectUnclipped(interfaceOption, true);
        await interfaceOption.click();
        await expect(basicTrigger).toContainText(english ? 'Interface design' : '界面设计');
        await expect(basicDialog).toBeHidden();
        await expect(basicTrigger).toBeFocused();

        const controlled = preview(page, english, '受控路径', 'Controlled path');
        const controlledTrigger = controlled.getByRole('combobox');
        await controlledTrigger.click();
        const controlledDialog = await dialogFor(page, controlledTrigger);
        const yuhang = controlledDialog.getByRole('option', {
          name: english ? 'Yuhang' : '余杭区',
          exact: true,
        });
        await expectUnclipped(yuhang, true);
        await expectNoPageOverflow(page);
        await page.screenshot({ path: testInfo.outputPath('cascader-path-open.png') });
        await yuhang.click();
        await expect(controlled.getByRole('status')).toContainText(
          '["zhejiang","hangzhou","yuhang"]',
        );
        await controlled
          .getByRole('button', {
            name: english ? 'Clear selection' : '清除级联选择',
            exact: true,
          })
          .click();
        await expect(controlled.getByRole('status')).toHaveText(
          english ? 'Selected path: []' : '选中路径：[]',
        );

        const search = preview(page, english, '搜索', 'Search');
        const searchTrigger = search.getByRole('combobox');
        await searchTrigger.click();
        const searchDialog = await dialogFor(page, searchTrigger);
        await searchDialog.getByRole('textbox').fill(english ? 'Ningbo' : '宁波');
        await expect(searchDialog.getByRole('option')).toHaveCount(1);
        await searchDialog.getByRole('option').click();
        await expect(searchTrigger).toContainText(english ? 'Zhejiang / Ningbo' : '浙江 / 宁波');
        await expect(searchDialog).toBeHidden();

        const multiple = preview(page, english, '多选', 'Multiple selection');
        const multipleTrigger = multiple.getByRole('combobox');
        await multipleTrigger.click();
        const multipleDialog = await dialogFor(page, multipleTrigger);
        await multipleDialog
          .getByRole('option', { name: english ? 'Zhejiang' : '浙江', exact: true })
          .click();
        const hangzhou = multipleDialog.getByRole('option', {
          name: english ? 'Hangzhou' : '杭州',
          exact: true,
        });
        await hangzhou.click();
        await expect(multiple.getByRole('status')).toHaveText(
          english ? 'Selected paths: 1' : '选中路径数：1',
        );
        await expect(multipleDialog).toBeVisible();
        await hangzhou.click();
        await expect(multiple.getByRole('status')).toHaveText(
          english ? 'Selected paths: 2' : '选中路径数：2',
        );
        await expect(multipleTrigger).toHaveAttribute('aria-expanded', 'true');
        await page.keyboard.press('Escape');

        const singleLine = preview(page, english, '单行多选', 'Single-line selections');
        await expect(singleLine.locator('.leaf-cascader__value')).toHaveAttribute(
          'data-single-line',
        );
        await expectUnclipped(singleLine.getByRole('combobox'));

        const states = preview(page, english, '禁用与只读', 'Disabled and read-only');
        await expect(
          states.getByRole('combobox', { name: english ? 'Disabled' : '禁用', exact: true }),
        ).toBeDisabled();
        const readOnly = states.getByRole('combobox', {
          name: english ? 'Read-only' : '只读',
          exact: true,
        });
        const initialReadOnly = await readOnly.textContent();
        await readOnly.focus();
        await expect(readOnly).toBeFocused();
        await readOnly.press('Enter');
        await readOnly.press('ArrowDown');
        await expect(readOnly).toHaveAttribute('aria-expanded', 'false');
        await expect(readOnly).toHaveText(initialReadOnly ?? '');
        await expect(
          states.getByRole('button', {
            name: english ? 'Clear selection' : '清除级联选择',
            exact: true,
          }),
        ).toHaveCount(0);

        const intermediate = preview(page, english, '选择中间层', 'Intermediate levels');
        const intermediateTrigger = intermediate.getByRole('combobox');
        await intermediateTrigger.click();
        const intermediateDialog = await dialogFor(page, intermediateTrigger);
        await intermediateDialog
          .getByRole('option', { name: english ? 'Zhejiang' : '浙江', exact: true })
          .click();
        await expect(intermediate.getByRole('status')).toContainText('["zhejiang"]');
        await expect(intermediateDialog).toBeVisible();
        await page.keyboard.press('Escape');

        const popup = preview(page, english, '浮层宽度', 'Popup width');
        const popupTrigger = popup.getByRole('combobox');
        await popupTrigger.click();
        const popupDialog = await dialogFor(page, popupTrigger);
        const popupWidth = await popupDialog.evaluate((node) => node.getBoundingClientRect().width);
        expect(popupWidth).toBeLessThanOrEqual(321);
        await expectUnclipped(
          popupDialog.getByRole('option', { name: english ? 'Jiangsu' : '江苏', exact: true }),
          true,
        );
        await page.keyboard.press('Escape');

        await pauseClock(page);
        const lazy = preview(page, english, '异步加载', 'Lazy loading');
        const lazyTrigger = lazy.getByRole('combobox');
        await lazyTrigger.click();
        const lazyDialog = await dialogFor(page, lazyTrigger);
        await lazyDialog
          .getByRole('option', { name: english ? 'Remote categories' : '远程分类', exact: true })
          .click();
        await expect(lazyDialog.locator('.leaf-select__spinner')).toBeVisible();
        await page.clock.runFor(399);
        await expect(
          lazyDialog.getByRole('option', {
            name: english ? 'Loaded item' : '已加载项',
            exact: true,
          }),
        ).toHaveCount(0);
        await page.keyboard.press('Escape');
        await page.clock.runFor(1);
        await lazyTrigger.click();
        // Reopening resets the uncommitted draft, not its already loaded children.
        await lazyDialog
          .getByRole('option', { name: english ? 'Remote categories' : '远程分类', exact: true })
          .click();
        await expect(
          lazyDialog.getByRole('option', {
            name: english ? 'Loaded item' : '已加载项',
            exact: true,
          }),
        ).toBeVisible();
        await expect(lazyDialog.locator('.leaf-select__spinner')).toHaveCount(0);
        await page.keyboard.press('Escape');

        const cache = preview(page, english, '刷新缓存', 'Refreshing cached data');
        const cacheTrigger = cache.getByRole('combobox');
        const refresh = cache.getByRole('button', {
          name: english ? 'Refresh data' : '刷新数据',
          exact: true,
        });
        await cacheTrigger.click();
        const cacheDialog = await dialogFor(page, cacheTrigger);
        const remote = cacheDialog.getByRole('option', {
          name: english ? 'Remote categories' : '远程分类',
          exact: true,
        });
        await remote.click();
        await page.clock.runFor(400);
        await expect(
          cacheDialog.getByRole('option', {
            name: english ? 'Loaded item v1' : '已加载项 v1',
            exact: true,
          }),
        ).toBeVisible();
        await expect(cache.getByRole('status')).toContainText(
          english ? 'Loaded version: v1' : '加载版本：v1',
        );
        await refresh.click();
        await cacheTrigger.click();
        await remote.click();
        await expect(cacheDialog.locator('.leaf-select__spinner')).toBeVisible();
        await page.clock.runFor(399);
        await expect(cacheDialog.getByRole('option', { name: /v2$/, exact: false })).toHaveCount(0);
        await page.clock.runFor(1);
        const refreshed = cacheDialog.getByRole('option', {
          name: english ? 'Loaded item v2' : '已加载项 v2',
          exact: true,
        });
        await expectUnclipped(refreshed, true);
        await expect(cache.getByRole('status')).toContainText(
          english ? 'Loaded version: v2' : '加载版本：v2',
        );
        await settleAnimations(
          cacheDialog.locator('xpath=ancestor-or-self::*[@data-leaf-popup][1]'),
        );
        await page.screenshot({ path: testInfo.outputPath('cascader-cache-refreshed.png') });
        await refreshed.click();
        await expect(cacheDialog).toBeHidden();
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });

      test('Transfer selection, filtering, movement and one-way membership are live', async ({
        page,
      }, testInfo) => {
        const errors = await openPage(page, 'transfer', english, appearance);
        const itemName = (key: string) => `${english ? 'Resource' : '资源'} ${key}`;
        const moveRightName = english ? 'Move to selected' : '移至已选';
        const moveLeftName = english ? 'Move to available' : '移回可选';
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const basicPanels = basic.locator('.leaf-transfer__panel');
        await expect(
          basicPanels.nth(1).getByRole('checkbox', { name: itemName('2'), exact: true }),
        ).toBeVisible();
        await expect(
          basicPanels.nth(0).getByRole('checkbox', { name: itemName('5'), exact: true }),
        ).toBeDisabled();
        await basicPanels
          .nth(0)
          .getByRole('checkbox', { name: itemName('6'), exact: true })
          .check();
        await basic.getByRole('button', { name: moveRightName, exact: true }).click();
        await expect(
          basicPanels.nth(1).getByRole('checkbox', { name: itemName('6'), exact: true }),
        ).not.toBeChecked();

        const controlled = preview(page, english, '受控值与勾选', 'Controlled value and selection');
        const panels = controlled.locator('.leaf-transfer__panel');
        const left = panels.nth(0);
        const right = panels.nth(1);
        const statuses = controlled.getByRole('status');
        const rightStatus = english ? 'Right-side keys: ' : '右侧项目：';
        const checkedStatus = english ? 'Checked keys: ' : '待移动项目：';
        await left.getByRole('checkbox', { name: itemName('1'), exact: true }).check();
        await expect(statuses.nth(0)).toHaveText(`${rightStatus}2, 4`);
        await expect(statuses.nth(1)).toHaveText(`${checkedStatus}1`);
        await expect(right.getByRole('checkbox', { name: itemName('1'), exact: true })).toHaveCount(
          0,
        );
        await left.getByRole('textbox').fill('3');
        await left
          .getByRole('checkbox', {
            name: english ? 'Select all visible items' : '选择本页全部',
            exact: true,
          })
          .check();
        await expect(statuses.nth(1)).toHaveText(`${checkedStatus}1, 3`);
        await expect(left.getByRole('checkbox', { name: itemName('6'), exact: true })).toHaveCount(
          0,
        );
        await controlled.getByRole('button', { name: moveRightName, exact: true }).click();
        await expect(statuses.nth(0)).toHaveText(`${rightStatus}2, 4, 1, 3`);
        await expect(statuses.nth(1)).toHaveText(`${checkedStatus}${english ? 'None' : '暂无'}`);
        for (const key of ['1', '3']) {
          await expect(
            right.getByRole('checkbox', { name: itemName(key), exact: true }),
          ).not.toBeChecked();
        }
        await left.getByRole('textbox').clear();
        await expect(
          left.getByRole('checkbox', { name: itemName('6'), exact: true }),
        ).not.toBeChecked();
        await expectUnclipped(
          right
            .getByRole('checkbox', { name: itemName('3'), exact: true })
            .locator('xpath=ancestor::label[1]'),
          true,
        );
        await controlled.scrollIntoViewIfNeeded();
        await settleAnimations(controlled);
        await expectNoPageOverflow(page);
        await page.screenshot({ path: testInfo.outputPath('transfer-controlled-moved.png') });
        await right.getByRole('checkbox', { name: itemName('1'), exact: true }).check();
        await controlled.getByRole('button', { name: moveLeftName, exact: true }).click();
        await expect(statuses.nth(0)).toHaveText(`${rightStatus}2, 4, 3`);
        await expect(statuses.nth(1)).toHaveText(`${checkedStatus}${english ? 'None' : '暂无'}`);
        await expect(
          left.getByRole('checkbox', { name: itemName('1'), exact: true }),
        ).toBeVisible();

        const oneWay = preview(page, english, '单向移入', 'One-way transfer');
        const oneWayPanels = oneWay.locator('.leaf-transfer__panel');
        await expect(oneWay.getByRole('button', { name: moveLeftName, exact: true })).toHaveCount(
          0,
        );
        await oneWayPanels
          .nth(0)
          .getByRole('checkbox', { name: itemName('1'), exact: true })
          .check();
        await oneWay.getByRole('button', { name: moveRightName, exact: true }).click();
        await oneWayPanels
          .nth(1)
          .getByRole('checkbox', { name: itemName('1'), exact: true })
          .check();
        await expect(
          oneWay.getByRole('button', { name: moveRightName, exact: true }),
        ).toBeDisabled();
        await expect(oneWay.getByRole('button', { name: moveLeftName, exact: true })).toHaveCount(
          0,
        );

        const virtual = preview(page, english, '虚拟列表', 'Virtual list');
        const virtualPanels = virtual.locator('.leaf-transfer__panel');
        await virtualPanels.nth(0).getByRole('textbox').fill('2000');
        const lastMember = `${english ? 'Member' : '成员'} 2000 Designer`;
        await virtualPanels.nth(0).getByRole('checkbox', { name: lastMember, exact: true }).check();
        await virtual.getByRole('button', { name: moveRightName, exact: true }).click();
        await expect(
          virtualPanels.nth(1).getByRole('checkbox', { name: lastMember, exact: true }),
        ).toBeVisible();
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });

      test('Tree selection, checks, drag, retry and virtual terminal nodes are live', async ({
        page,
      }, testInfo) => {
        const errors = await openPage(page, 'tree', english, appearance);
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const basicTree = basic.getByRole('tree');
        await treeTitle(basicTree, 'components').click();
        await expect(treeItem(basicTree, 'components')).toHaveAttribute('aria-selected', 'true');
        await expect(basic.getByRole('status')).toHaveText(
          english ? 'Selected keys: components' : '已选节点：components',
        );
        await treeTitle(basicTree, 'components').click();
        await expect(basic.getByRole('status')).toHaveText(
          english ? 'Selected keys: None' : '已选节点：暂无',
        );

        const multiple = preview(page, english, '多选', 'Multiple selection');
        const multipleTree = multiple.getByRole('tree');
        await treeTitle(multipleTree, 'components').click();
        await treeTitle(multipleTree, 'web').click({ modifiers: ['Shift'] });
        await expect(multiple.getByRole('status')).toHaveText(
          `${english ? 'Selected keys: ' : '已选节点：'}components, colors, engineering, web`,
        );
        await expect(treeItem(multipleTree, 'archive')).toHaveAttribute('aria-selected', 'false');
        await treeTitle(multipleTree, 'components').click();
        await expect(multiple.getByRole('status')).toHaveText(
          `${english ? 'Selected keys: ' : '已选节点：'}colors, engineering, web`,
        );

        const linked = preview(page, english, '父子勾选联动', 'Linked checks');
        const linkedTree = linked.getByRole('tree');
        await expect(treeItem(linkedTree, 'design')).toHaveAttribute('aria-checked', 'mixed');
        await expect(treeItem(linkedTree, 'components')).toHaveAttribute('aria-checked', 'true');
        await linked.scrollIntoViewIfNeeded();
        await settleAnimations(linked);
        await page.screenshot({ path: testInfo.outputPath('tree-linked-mixed.png') });
        await linkedTree
          .getByRole('checkbox', { name: english ? 'Brand colors' : '品牌颜色', exact: true })
          .check();
        await expect(treeItem(linkedTree, 'design')).toHaveAttribute('aria-checked', 'true');
        await expect(linked.getByRole('status').nth(0)).toHaveText(
          `${english ? 'Checked keys: ' : '勾选节点：'}design, components, colors`,
        );
        await expect(linked.getByRole('status').nth(1)).toHaveText(
          english ? 'Mixed keys: None' : '半选节点：暂无',
        );
        await expect(treeItem(linkedTree, 'archive')).toHaveAttribute('aria-checked', 'false');
        await expect(treeItem(linkedTree, 'archive').getByRole('checkbox')).toBeDisabled();

        const strict = preview(page, english, '独立勾选', 'Independent checks');
        const strictTree = strict.getByRole('tree');
        await expect(treeItem(strictTree, 'design')).toHaveAttribute('aria-checked', 'false');
        await strictTree
          .getByRole('checkbox', { name: english ? 'Design resources' : '设计资源', exact: true })
          .check();
        await expect(treeItem(strictTree, 'design')).toHaveAttribute('aria-checked', 'true');
        await expect(treeItem(strictTree, 'colors')).toHaveAttribute('aria-checked', 'false');
        await expect(strict.getByRole('status')).toHaveText(
          `${english ? 'Checked keys: ' : '勾选节点：'}components, design`,
        );

        const search = preview(page, english, '搜索节点', 'Search nodes');
        const searchTree = search.getByRole('tree');
        await expect(treeItem(searchTree, 'design')).toHaveAttribute('aria-expanded', 'true');
        await expect(treeItem(searchTree, 'engineering')).toHaveAttribute('aria-expanded', 'false');
        await search.getByRole('textbox').fill(english ? 'Website' : '网站');
        await expect(treeItem(searchTree, 'engineering')).toHaveAttribute('aria-expanded', 'true');
        await expect(treeItem(searchTree, 'web')).toBeVisible();
        await expect(treeItem(searchTree, 'design')).toHaveCount(0);
        await search.getByRole('textbox').clear();
        await expect(treeItem(searchTree, 'design')).toHaveAttribute('aria-expanded', 'true');
        await expect(treeItem(searchTree, 'engineering')).toHaveAttribute('aria-expanded', 'false');

        const drag = preview(page, english, '拖动节点', 'Drag nodes');
        const dragTree = drag.getByRole('tree');
        const draftHandle = dragTree.getByRole('button', {
          name: english ? 'Move node Draft' : '移动节点 草稿',
          exact: true,
        });
        await draftHandle.focus();
        await draftHandle.press('Space');
        await expect(page.locator('.leaf-tree__drag-preview')).toBeVisible();
        for (const key of ['archive', 'development', 'design', 'projects']) {
          await page.keyboard.press('ArrowUp');
          await expect(
            treeItem(dragTree, key).locator('.leaf-tree__drag-row').first(),
          ).toHaveAttribute('data-drop', 'inside');
        }
        await page.keyboard.press('ArrowLeft');
        await expect(
          treeItem(dragTree, 'projects').locator('.leaf-tree__drag-row').first(),
        ).toHaveAttribute('data-drop', 'before');
        await page.keyboard.press('Space');
        await expect(page.locator('.leaf-tree__drag-preview')).toHaveCount(0);
        await expect(treeItem(dragTree, 'draft')).toHaveAttribute('aria-level', '1');
        await expect(drag.locator('.leaf-text[role="status"]')).toHaveText(
          `${english ? 'Top-level keys after drop: ' : '调整后的顶层节点：'}draft, projects, archive`,
        );

        await pauseClock(page);
        const lazy = preview(page, english, '异步加载', 'Lazy loading');
        const lazyTree = lazy.getByRole('tree');
        const lazyRoot = treeItem(lazyTree, 'root');
        await lazyRoot.locator('.leaf-tree__toggle').first().click();
        await expect(lazy.getByRole('status')).toHaveText(english ? 'Loading' : '正在加载');
        await page.clock.runFor(399);
        await expect(lazy.getByRole('status')).toHaveText(english ? 'Loading' : '正在加载');
        await page.clock.runFor(1);
        await expect(lazy.getByRole('status')).toHaveText(
          english
            ? 'The first request failed. Collapse and expand again to retry.'
            : '首次加载失败，请收起后重新展开重试。',
        );
        await lazy.scrollIntoViewIfNeeded();
        await page.screenshot({ path: testInfo.outputPath('tree-lazy-first-failure.png') });
        await lazyRoot.locator('.leaf-tree__toggle').first().click();
        await expect(lazyRoot).toHaveAttribute('aria-expanded', 'false');
        await lazyRoot.locator('.leaf-tree__toggle').first().click();
        await page.clock.runFor(399);
        await expect(treeItem(lazyTree, 'root-design')).toHaveCount(0);
        await page.clock.runFor(1);
        await expect(lazy.getByRole('status')).toHaveText(
          english ? 'Loaded successfully' : '加载成功',
        );
        await expect(treeItem(lazyTree, 'root-design')).toBeVisible();

        const cache = preview(page, english, '刷新缓存', 'Refreshing cached data');
        const cacheTree = cache.getByRole('tree');
        await expect(treeItem(cacheTree, 'root-child')).toHaveAccessibleName(
          english ? 'Loaded item v1' : '已加载项 v1',
        );
        await cache
          .getByRole('button', { name: english ? 'Refresh data' : '刷新数据', exact: true })
          .click();
        await expect(cache.locator('.leaf-tree__spinner')).toBeVisible();
        await expect(treeItem(cacheTree, 'root-child')).toHaveCount(0);
        await page.clock.runFor(399);
        await expect(treeItem(cacheTree, 'root-child')).toHaveCount(0);
        await page.clock.runFor(1);
        await expect(treeItem(cacheTree, 'root-child')).toHaveAccessibleName(
          english ? 'Loaded item v2' : '已加载项 v2',
        );
        await expect(cache.getByRole('status')).toContainText(
          english ? 'Loaded version: v2' : '加载版本：v2',
        );

        const virtual = preview(page, english, '虚拟列表', 'Virtual list');
        const virtualTree = virtual.getByRole('tree');
        await virtualTree.getByRole('treeitem').first().focus();
        await page.keyboard.press('End');
        await page.clock.runFor(32);
        const last = treeItem(virtualTree, '9999');
        await expect(last).toBeFocused();
        await expect(last).toHaveAccessibleName(english ? 'Node 10000' : '节点 10000');
        await last.press('Enter');
        await expect(last).toHaveAttribute('aria-selected', 'true');
        expect(await virtualTree.getByRole('treeitem').count()).toBeLessThan(60);
        await expectUnclipped(last.locator('.leaf-tree__row'), true);
        await page.screenshot({ path: testInfo.outputPath('tree-virtual-last-selected.png') });
        await expectNoPageOverflow(page);
        expect(errors).toEqual([]);
      });
    });
  }
}
