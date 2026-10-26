import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

const profiles = [
  { width: 1280, appearance: 'light' },
  { width: 375, appearance: 'dark' },
] as const;

async function openExamples(
  page: Page,
  component: 'select' | 'mentions' | 'tree-select',
  english: boolean,
  { width, appearance }: (typeof profiles)[number],
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: appearance });
  await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
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
  return {
    errors,
    preview: (zh: string, en: string) =>
      page
        .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
        .locator('.leaf-component-example__preview'),
  };
}

async function linkedPopup(page: Page, input: Locator) {
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  const id = await input.getAttribute('aria-controls');
  if (!id) throw new Error('Open selection control is missing its popup relationship');
  const content = page.locator(`[id=${JSON.stringify(id)}]`);
  await expect(content).toBeVisible();
  const panel = page.locator('.leaf-floating[data-state="open"]').filter({ has: content });
  await expect(panel).toHaveCount(1);
  await expect(panel).toHaveAttribute('data-positioned', 'true');
  await settleAnimations(panel);
  return panel;
}

async function expectPopupFits(panel: Locator) {
  await settleAnimations(panel);
  await expect
    .poll(() =>
      panel.evaluate((node) => {
        const issues: string[] = [];
        const bounds = node.getBoundingClientRect();
        if (
          bounds.left < -1 ||
          bounds.right > innerWidth + 1 ||
          bounds.top < -1 ||
          bounds.bottom > innerHeight + 1
        ) {
          issues.push('popup exceeds viewport');
        }
        const visible = (element: Element) =>
          element.getClientRects().length > 0 &&
          !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
          getComputedStyle(element).visibility !== 'hidden';
        const contained = (inner: DOMRect, outer: DOMRect) =>
          inner.left >= outer.left - 1 &&
          inner.right <= outer.right + 1 &&
          inner.top >= outer.top - 1 &&
          inner.bottom <= outer.bottom + 1;
        const rows = [
          ...node.querySelectorAll<HTMLElement>('.leaf-floating__option, .leaf-tree__row'),
        ].filter(visible);
        if (!rows.length) issues.push('popup has no visible option rows');
        for (const row of rows) {
          const rowBounds = row.getBoundingClientRect();
          if (!contained(rowBounds, bounds)) issues.push(`clipped row: ${row.textContent}`);
          const text = document.createRange();
          text.selectNodeContents(row);
          for (const rect of text.getClientRects()) {
            if (rect.width > 0 && !contained(rect, rowBounds)) {
              issues.push(`clipped option content: ${row.textContent}`);
              break;
            }
          }
          for (const element of row.querySelectorAll<HTMLElement>(
            'button, input, svg, .leaf-floating__option-label, .leaf-tree__title',
          )) {
            if (!visible(element)) continue;
            if (!contained(element.getBoundingClientRect(), rowBounds)) {
              issues.push(`clipped option control: ${element.className}`);
            }
            if (element.scrollWidth > element.clientWidth + 1) {
              issues.push(`option control overflows: ${element.className}`);
            }
          }
        }
        for (const viewport of node.querySelectorAll<HTMLElement>(
          '.leaf-floating__viewport, .leaf-tree, .leaf-scrollbar__content',
        )) {
          if (visible(viewport) && viewport.scrollWidth > viewport.clientWidth + 1) {
            issues.push(`popup content overflows: ${viewport.className}`);
          }
        }
        return issues;
      }),
    )
    .toEqual([]);
}

async function expectFieldsFit(page: Page) {
  await expect
    .poll(() =>
      page.locator('.leaf-component-example__preview-content').evaluateAll((contents) => {
        const issues: string[] = [];
        for (const [index, content] of contents.entries()) {
          const preview = content.closest('.leaf-component-example__preview');
          if (!preview) throw new Error('Missing selection example preview');
          const outer = preview.getBoundingClientRect();
          const bounds = content.getBoundingClientRect();
          if (
            bounds.left < outer.left - 1 ||
            bounds.right > outer.right + 1 ||
            content.scrollWidth > content.clientWidth + 1
          ) {
            issues.push(`preview ${index} content overflows`);
          }
          for (const field of content.querySelectorAll<HTMLElement>(
            '.leaf-select, .leaf-tree-select, textarea.leaf-mentions',
          )) {
            const fieldBounds = field.getBoundingClientRect();
            if (fieldBounds.left < bounds.left - 1 || fieldBounds.right > bounds.right + 1) {
              issues.push(`preview ${index} field exceeds its container`);
            }
            for (const control of field.querySelectorAll<HTMLElement>(
              'input[role="combobox"], button',
            )) {
              if (
                !control.getClientRects().length ||
                control.closest('[hidden], [inert], [aria-hidden="true"]') ||
                getComputedStyle(control).visibility === 'hidden'
              ) {
                continue;
              }
              const controlBounds = control.getBoundingClientRect();
              if (
                controlBounds.left < fieldBounds.left - 1 ||
                controlBounds.right > fieldBounds.right + 1 ||
                controlBounds.top < fieldBounds.top - 1 ||
                controlBounds.bottom > fieldBounds.bottom + 1
              ) {
                issues.push(`preview ${index} clips ${control.className}`);
              }
            }
          }
        }
        return issues;
      }),
    )
    .toEqual([]);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}

function treeItem(panel: Locator, name: string) {
  return panel.getByRole('treeitem', { name, exact: true });
}

function treeRow(panel: Locator, name: string) {
  return treeItem(panel, name).locator('.leaf-tree__row').first();
}

for (const english of [false, true]) {
  for (const profile of profiles) {
    const suffix = `${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`;
    const clearName = english ? 'Clear selection' : '清除选择';

    test(`Select examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'select', english, profile);
      const design = english ? 'Design studio' : '设计工作室';
      const product = english ? 'Product team' : '产品团队';

      const search = preview('搜索', 'Search');
      const single = search.getByRole('combobox');
      await single.fill(english ? 'Product' : '产品');
      let panel = await linkedPopup(page, single);
      await expect(panel.getByRole('option')).toHaveCount(1);
      await panel.getByRole('option', { name: product, exact: true }).click();
      await expect(single).toHaveValue(product);
      await expect(single).toHaveAttribute('aria-expanded', 'false');
      await search.getByRole('button', { name: clearName, exact: true }).click();
      await expect(single).toHaveValue('');
      await expect(single).toBeFocused();
      await expect(search.getByRole('button', { name: clearName, exact: true })).toHaveCount(0);

      const multiple = preview('多选', 'Multiple selection');
      const multiInput = multiple.getByRole('combobox');
      const values = multiple.getByRole('status');
      await expect(values).toHaveText(english ? 'Current values: design' : '当前值：design');
      await multiInput.click();
      panel = await linkedPopup(page, multiInput);
      await panel.getByRole('option', { name: product, exact: true }).click();
      await expect(values).toHaveText(
        english ? 'Current values: design, product' : '当前值：design, product',
      );
      await expect(panel.getByRole('option', { name: product, exact: true })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expectPopupFits(panel);
      await page.screenshot({ path: testInfo.outputPath('select-multiple-open.png') });
      await multiInput.press('Backspace');
      await expect(values).toHaveText(english ? 'Current values: design' : '当前值：design');
      await multiple.getByRole('button', { name: clearName, exact: true }).click();
      await expect(values).toHaveText(english ? 'Current values: None' : '当前值：未选择');
      await expect(multiple.locator('[data-selection-item]')).toHaveCount(0);

      const creation = preview('创建选项', 'Creating options');
      const createInput = creation.getByRole('combobox');
      const newTag = 'release-review';
      await createInput.fill(newTag);
      panel = await linkedPopup(page, createInput);
      await expect(panel.getByRole('option')).toHaveCount(1);
      const candidate = panel.getByRole('option', {
        name: english ? `Create “${newTag}”` : `创建 “${newTag}”`,
        exact: true,
      });
      await expect(candidate).toBeVisible();
      await createInput.press('Enter');
      await expect(creation.locator('[data-selection-item]')).toHaveText([
        english ? 'Design' : '设计',
        newTag,
      ]);
      await expect(panel.getByRole('option', { name: newTag, exact: true })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await createInput.press('Escape');
      await createInput.click();
      panel = await linkedPopup(page, createInput);
      await expect(panel.getByRole('option', { name: newTag, exact: true })).toHaveCount(1);
      await createInput.press('Escape');

      const customTags = preview('自定义标签', 'Custom tags');
      const firstTag = customTags.locator('.leaf-tag').filter({ hasText: design });
      await firstTag
        .getByRole('button', { name: english ? 'Remove' : '移除', exact: true })
        .click();
      await expect(customTags.locator('[data-selection-item]')).toHaveText([product]);
      const customInput = customTags.getByRole('combobox');
      await customInput.click();
      panel = await linkedPopup(page, customInput);
      await expect(panel.getByRole('option', { name: design, exact: true })).toHaveAttribute(
        'aria-selected',
        'false',
      );
      await customInput.press('Escape');

      const rich = preview('自定义选项内容', 'Custom option content');
      const richInput = rich.getByRole('combobox');
      await richInput.click();
      panel = await linkedPopup(page, richInput);
      await expect(panel.getByRole('option')).toHaveCount(3);
      await expectPopupFits(panel);
      await page.screenshot({ path: testInfo.outputPath('select-rich-options-open.png') });
      await richInput.press('Escape');

      const controlled = preview('控制浮层与附加操作', 'Controlled popup and extra actions');
      const controlledInput = controlled.getByRole('combobox');
      await controlled
        .getByRole('button', { name: english ? 'Open options' : '打开选项', exact: true })
        .click();
      panel = await linkedPopup(page, controlledInput);
      await panel.getByRole('option', { name: product, exact: true }).click();
      await expect(controlled.locator('[data-selection-item]')).toHaveText([design, product]);
      const done = panel.getByRole('button', { name: english ? 'Done' : '完成', exact: true });
      await expect(done).toBeVisible();
      await expectPopupFits(panel);
      const doneBounds = await done.boundingBox();
      const panelBounds = await panel.boundingBox();
      if (!doneBounds || !panelBounds) throw new Error('Missing popup action geometry');
      expect(doneBounds.x).toBeGreaterThanOrEqual(panelBounds.x - 1);
      expect(doneBounds.x + doneBounds.width).toBeLessThanOrEqual(
        panelBounds.x + panelBounds.width + 1,
      );
      expect(doneBounds.y + doneBounds.height).toBeLessThanOrEqual(
        panelBounds.y + panelBounds.height + 1,
      );
      await page.screenshot({ path: testInfo.outputPath('select-popup-action-open.png') });
      await done.click();
      await expect(controlledInput).toHaveAttribute('aria-expanded', 'false');
      await expect(panel).toHaveCount(0);
      await controlled
        .getByRole('button', { name: english ? 'Open options' : '打开选项', exact: true })
        .click();
      panel = await linkedPopup(page, controlledInput);
      await expect(panel.getByRole('option', { name: product, exact: true })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await page.keyboard.press('Escape');
      await expectFieldsFit(page);
      expect(errors).toEqual([]);
    });

    test(`Mentions examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'mentions', english, profile);
      const basic = preview('基础用法', 'Basic usage').getByRole('combobox');
      await basic.fill('email@ada');
      await expect(basic).toHaveAttribute('aria-expanded', 'false');
      await basic.fill('');
      await basic.pressSequentially('Hello @');
      let panel = await linkedPopup(page, basic);
      await expect(panel.getByRole('option')).toHaveCount(3);
      await expect(panel.getByRole('option', { name: 'Morgan', exact: true })).toBeDisabled();
      await basic.press('ArrowDown');
      await expect(panel.getByRole('option', { name: 'Lin', exact: true })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await basic.press('ArrowDown');
      await expect(panel.getByRole('option', { name: 'Ada', exact: true })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await basic.press('Enter');
      await expect(basic).toHaveValue('Hello @ada ');
      await expect(basic).toHaveAttribute('aria-expanded', 'false');

      const controlled = preview('受控文本与插入结果', 'Controlled text and insertion');
      const input = controlled.getByRole('combobox');
      await input.fill('Note  after');
      await input.press('Home');
      for (let index = 0; index < 'Note '.length; index++) await input.press('ArrowRight');
      await input.pressSequentially('@a');
      panel = await linkedPopup(page, input);
      await expect(panel.getByRole('option')).toHaveCount(1);
      await expect(panel.getByRole('option', { name: 'Ada Lovelace', exact: true })).toBeVisible();
      await expectPopupFits(panel);
      await page.screenshot({ path: testInfo.outputPath('mentions-caret-suggestions-open.png') });
      await input.press('Enter');
      await expect(input).toHaveValue('Note @ada  after');
      await expect(controlled.getByRole('status')).toHaveText(
        english ? 'Last inserted: @ada' : '最近插入：@ada',
      );
      await input.fill('Follow @l');
      panel = await linkedPopup(page, input);
      await panel.getByRole('option', { name: 'Lin Chen', exact: true }).click();
      await expect(input).toHaveValue('Follow @lin ');
      await expect(controlled.getByRole('status')).toHaveText(
        english ? 'Last inserted: @lin' : '最近插入：@lin',
      );

      const prefixes = preview('不同前缀', 'Different prefixes').getByRole('combobox');
      await prefixes.fill('#');
      panel = await linkedPopup(page, prefixes);
      await expect(panel.getByRole('option')).toHaveCount(2);
      const topic = panel.getByRole('option', { name: english ? 'Design' : '设计', exact: true });
      await expect(topic).toBeVisible();
      await expectPopupFits(panel);
      await page.screenshot({ path: testInfo.outputPath('mentions-topic-prefix-open.png') });
      await topic.click();
      await expect(prefixes).toHaveValue('#design ');
      await prefixes.fill('');
      await prefixes.pressSequentially('@');
      panel = await linkedPopup(page, prefixes);
      await expect(panel.getByRole('option', { name: 'Ada', exact: true })).toBeVisible();
      await expect(
        panel.getByRole('option', { name: english ? 'Design' : '设计', exact: true }),
      ).toHaveCount(0);
      await prefixes.press('ArrowDown');
      await prefixes.press('Enter');
      await expect(prefixes).toHaveValue('@lin ');
      await expect(prefixes).toHaveAttribute('aria-expanded', 'false');
      await expectFieldsFit(page);
      expect(errors).toEqual([]);
    });

    test(`TreeSelect examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'tree-select', english, profile);
      const visual = english ? 'Visual design' : '视觉设计';
      const product = english ? 'Product design' : '产品设计';
      const web = english ? 'Frontend development' : '前端开发';
      const design = english ? 'Design team' : '设计团队';
      const team = english ? 'Team' : '团队';

      const controlled = preview('受控值与重置', 'Controlled value and reset');
      const single = controlled.getByRole('combobox');
      await expect(single).toHaveValue(visual);
      await single.click();
      let panel = await linkedPopup(page, single);
      await treeRow(panel, web).click();
      await expect(single).toHaveValue(web);
      await expect(controlled.getByRole('status')).toHaveText(
        english ? 'Current value: web' : '当前值：web',
      );
      await controlled.getByRole('button', { name: clearName, exact: true }).click();
      await expect(single).toHaveValue('');
      await expect(controlled.getByRole('status')).toHaveText(
        english ? 'Current value: None' : '当前值：未选择',
      );
      await controlled
        .getByRole('button', { name: english ? 'Reset' : '重置', exact: true })
        .click();
      await expect(single).toHaveValue(visual);
      await expect(controlled.getByRole('status')).toHaveText(
        english ? 'Current value: visual' : '当前值：visual',
      );

      const multiple = preview('多选', 'Multiple selection');
      const multiInput = multiple.getByRole('combobox');
      await multiInput.click();
      panel = await linkedPopup(page, multiInput);
      await treeRow(panel, web).click();
      await expect(multiple.locator('[data-selection-item]')).toHaveText([visual, web]);
      await expect(treeItem(panel, web)).toHaveAttribute('aria-selected', 'true');
      await multiple.getByRole('button', { name: clearName, exact: true }).click();
      await expect(multiple.locator('[data-selection-item]')).toHaveCount(0);
      await expect(treeItem(panel, visual)).toHaveAttribute('aria-selected', 'false');
      await expect(treeItem(panel, web)).toHaveAttribute('aria-selected', 'false');
      await page.keyboard.press('Escape');

      const checks = preview('勾选联动与输出值', 'Linked checks and output values');
      const childInput = checks.getByRole('combobox', {
        name: english ? 'Output child values' : '输出子节点',
        exact: true,
      });
      const parentInput = checks.getByRole('combobox', {
        name: english ? 'Consolidate parent values' : '合并为父节点',
        exact: true,
      });
      await childInput.click();
      panel = await linkedPopup(page, childInput);
      await treeRow(panel, design).click();
      await expect(checks.getByRole('status').nth(0)).toHaveText(
        english ? 'Callback values: None' : '回调值：未选择',
      );
      await treeRow(panel, design).click();
      await expect(checks.getByRole('status').nth(0)).toHaveText(
        english ? 'Callback values: visual, product' : '回调值：visual, product',
      );
      await expect(
        checks.locator('.leaf-tree-select').nth(0).locator('[data-selection-item]'),
      ).toHaveText([visual, product]);
      await page.keyboard.press('Escape');
      await parentInput.click();
      panel = await linkedPopup(page, parentInput);
      await treeRow(panel, design).click();
      await expect(checks.getByRole('status').nth(1)).toHaveText(
        english ? 'Callback values: None' : '回调值：未选择',
      );
      await treeRow(panel, design).click();
      await expect(checks.getByRole('status').nth(1)).toHaveText(
        english ? 'Callback values: design' : '回调值：design',
      );
      await expect(
        checks.locator('.leaf-tree-select').nth(1).locator('[data-selection-item]'),
      ).toHaveText([design]);
      await expect(treeItem(panel, visual)).toHaveAttribute('aria-checked', 'true');
      await expectPopupFits(panel);
      await page.screenshot({ path: testInfo.outputPath('tree-select-parent-strategy-open.png') });
      await page.keyboard.press('Escape');

      const limited = preview('限制选择数量', 'Selection limit');
      const limitedInput = limited.getByRole('combobox');
      await limitedInput.click();
      panel = await linkedPopup(page, limitedInput);
      await expect(treeItem(panel, team)).toHaveAttribute('aria-checked', 'mixed');
      await treeRow(panel, team).click();
      await expect(limited.getByRole('status')).toHaveText(
        english ? 'Selected: 1 / 2' : '已选择：1 / 2',
      );
      await expect(treeItem(panel, 'Alice')).toHaveAttribute('aria-checked', 'true');
      await expect(treeItem(panel, 'Bob')).toHaveAttribute('aria-checked', 'false');
      await expect(treeItem(panel, 'Carol')).toHaveAttribute('aria-checked', 'false');
      await treeRow(panel, 'Bob').click();
      await expect(limited.getByRole('status')).toHaveText(
        english ? 'Selected: 2 / 2' : '已选择：2 / 2',
      );
      await treeRow(panel, 'Carol').click();
      await expect(limited.getByRole('status')).toHaveText(
        english ? 'Selected: 2 / 2' : '已选择：2 / 2',
      );
      await expect(treeItem(panel, 'Carol')).toHaveAttribute('aria-checked', 'false');
      await expect(limited.locator('[data-selection-item]')).toHaveText(['Alice', 'Bob']);
      await page.keyboard.press('Escape');

      const expansion = preview('受控展开', 'Controlled expansion');
      const expandedInput = expansion.getByRole('combobox');
      await expandedInput.click();
      panel = await linkedPopup(page, expandedInput);
      await treeItem(panel, team)
        .getByRole('button', { name: english ? 'Collapse Team' : '收起 团队', exact: true })
        .click();
      await expect(expansion.getByRole('status')).toHaveText(
        english ? 'Expanded nodes: None' : '展开节点：无',
      );
      await expect(treeItem(panel, team)).toHaveAttribute('aria-expanded', 'false');
      await expect(treeItem(panel, 'Alice')).toBeHidden();
      await page.keyboard.press('Escape');
      await expandedInput.click();
      panel = await linkedPopup(page, expandedInput);
      await expect(treeItem(panel, team)).toHaveAttribute('aria-expanded', 'false');
      await treeItem(panel, team)
        .getByRole('button', { name: english ? 'Expand Team' : '展开 团队', exact: true })
        .click();
      await expect(expansion.getByRole('status')).toHaveText(
        english ? 'Expanded nodes: team' : '展开节点：team',
      );
      await expect(treeItem(panel, 'Alice')).toBeVisible();
      await page.keyboard.press('Escape');

      const lazy = preview('异步加载分支', 'Loading branches asynchronously');
      const lazyInput = lazy.getByRole('combobox');
      await lazyInput.click();
      panel = await linkedPopup(page, lazyInput);
      await treeItem(panel, team)
        .getByRole('button', { name: english ? 'Expand Team' : '展开 团队', exact: true })
        .click();
      const loadedDesign = english ? 'Design group' : '设计组';
      await expect(treeItem(panel, loadedDesign)).toBeVisible();
      await expect(treeItem(panel, english ? 'Development group' : '开发组')).toBeVisible();
      await treeRow(panel, loadedDesign).click();
      await expect(lazyInput).toHaveValue(loadedDesign);
      await expect(lazyInput).toHaveAttribute('aria-expanded', 'false');
      await lazyInput.click();
      panel = await linkedPopup(page, lazyInput);
      await expect(treeItem(panel, loadedDesign)).toBeVisible();
      await expect(panel.locator('.leaf-tree__spinner')).toHaveCount(0);
      await expectPopupFits(panel);
      await page.screenshot({ path: testInfo.outputPath('tree-select-loaded-branch-open.png') });
      await page.keyboard.press('Escape');
      await expectFieldsFit(page);
      expect(errors).toEqual([]);
    });
  }
}
