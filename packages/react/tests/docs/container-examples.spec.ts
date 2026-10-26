import { expect, type Page, test } from '@playwright/test';

async function visitPage(
  page: Page,
  component: 'card' | 'descriptions' | 'divider',
  english: boolean,
  appearance: 'light' | 'dark',
) {
  await page.goto(`${english ? '/en' : ''}/components/${component}.html`);
  await expect(page.locator('h1')).toBeVisible();
  const root = page.locator('html');
  const dark = Boolean((await root.getAttribute('class'))?.includes('dark'));
  if (dark !== (appearance === 'dark')) {
    await page
      .getByRole('button', {
        name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
      })
      .first()
      .click();
  }
  await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
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

for (const english of [false, true]) {
  for (const { width, appearance } of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Container examples: ${english ? 'en' : 'zh'} ${width} ${appearance}`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme: appearance });

      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      });

      test('Card actions, tabs, retained input and loading are live', async ({ page }) => {
        await visitPage(page, 'card', english, appearance);
        const actions = preview(page, english, '标题与底部操作', 'Heading and footer actions');
        const save = actions
          .locator('.leaf-card__footer')
          .getByRole('button', { name: english ? 'Save' : '保存', exact: true });
        const reset = actions
          .locator('.leaf-card__header')
          .getByRole('button', { name: english ? 'Reset' : '重置', exact: true });
        const unsaved = english ? 'There are unsaved changes.' : '有尚未保存的修改。';
        await expect(actions.getByRole('status')).toHaveText(unsaved);
        await expect(save).toBeEnabled();
        await expect(reset).toBeDisabled();
        await save.focus();
        await save.press('Enter');
        await expect(actions.getByRole('status')).toHaveText(
          english ? 'Changes saved.' : '修改已保存。',
        );
        await expect(save).toBeDisabled();
        await expect(reset).toBeEnabled();
        await reset.click();
        await expect(actions.getByRole('status')).toHaveText(unsaved);
        await expect(save).toBeEnabled();
        await expect(reset).toBeDisabled();

        const tabs = preview(page, english, '标签页卡片', 'Tabbed card');
        await expect(
          tabs.getByRole('tablist', { name: english ? 'Project overview' : '项目概览' }),
        ).toBeVisible();
        const overview = tabs.getByRole('tab', {
          name: english ? 'Overview' : '概览',
          exact: true,
        });
        const activity = tabs.getByRole('tab', {
          name: english ? 'Activity' : '最近动态',
          exact: true,
        });
        await expect(overview).toHaveAttribute('aria-selected', 'true');
        await overview.focus();
        await overview.press('ArrowRight');
        await expect(activity).toBeFocused();
        await expect(activity).toHaveAttribute('aria-selected', 'true');
        await expect(tabs.getByRole('tabpanel')).toHaveText(
          english ? 'The component guidelines were updated today.' : '今天更新了组件规范。',
        );

        const settings = preview(page, english, '标题与标签页', 'Heading with tabs');
        await expect(
          settings.getByRole('tablist', { name: english ? 'Project settings' : '项目设置' }),
        ).toBeVisible();
        const details = settings.getByRole('tab', {
          name: english ? 'Details' : '基本信息',
          exact: true,
        });
        const notes = settings.getByRole('tab', { name: english ? 'Notes' : '说明', exact: true });
        const name = settings.getByLabel(english ? 'Project name' : '项目名称', { exact: true });
        const saveChanges = settings.getByRole('button', {
          name: english ? 'Save changes' : '保存修改',
          exact: true,
        });
        await expect(name).toHaveValue(english ? 'Leaf Design System' : 'Leaf 设计系统');
        await name.fill('Leaf QA');
        await details.focus();
        await details.press('ArrowRight');
        await expect(notes).toBeFocused();
        await expect(notes).toHaveAttribute('aria-selected', 'true');
        await expect(name).not.toBeVisible();
        await expect(saveChanges).toBeDisabled();
        await notes.press('ArrowLeft');
        await expect(details).toBeFocused();
        await expect(details).toHaveAttribute('aria-selected', 'true');
        await expect(name).toBeVisible();
        await expect(name).toHaveValue('Leaf QA');
        await expect(saveChanges).toBeEnabled();
        await saveChanges.click();
        await expect(settings.getByRole('status')).toHaveText(english ? 'Saved' : '已保存');
        await name.fill('Leaf QA updated');
        await expect(settings.getByRole('status')).toHaveText(english ? 'Not saved' : '尚未保存');

        const loading = preview(page, english, '加载状态', 'Loading state');
        const toggle = loading.getByRole('switch', { name: english ? 'Loading' : '加载中' });
        const card = loading.locator('.leaf-card');
        const heading = card.getByRole('heading', {
          name: english ? 'Project details' : '项目资料',
          exact: true,
        });
        const bodyText = english
          ? 'Keep project notes and related resources together.'
          : '在这里整理项目的说明与相关资料。';
        await expect(toggle).toBeChecked();
        await expect(card).toHaveAttribute('aria-busy', 'true');
        await expect(heading).toBeVisible();
        await expect(card.locator('.leaf-card__body .leaf-skeleton')).toHaveCount(1);
        await expect(card.locator('.leaf-card__body')).not.toContainText(bodyText);
        await toggle.click();
        await expect(toggle).not.toBeChecked();
        await expect(card).not.toHaveAttribute('aria-busy');
        await expect(heading).toBeVisible();
        await expect(card.locator('.leaf-skeleton')).toHaveCount(0);
        await expect(card.locator('.leaf-card__body')).toHaveText(bodyText);
        await toggle.click();
        await expect(card).toHaveAttribute('aria-busy', 'true');
        await expect(heading).toBeVisible();
        await expect(card.locator('.leaf-card__body .leaf-skeleton')).toHaveCount(1);
        await expectNoPageOverflow(page);
      });

      test('Descriptions keeps semantics, field layout and responsive spans', async ({ page }) => {
        await visitPage(page, 'descriptions', english, appearance);
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const vertical = preview(page, english, '纵向字段布局', 'Vertical field layout');
        const responsive = preview(
          page,
          english,
          '响应式列数与跨列',
          'Responsive columns and spans',
        );
        const bordered = preview(page, english, '边框', 'Bordered');
        const labels = english ? ['Project', 'Owner', 'Status'] : ['项目', '负责人', '状态'];
        const values = ['Leaf UI', 'Alex', english ? 'Active' : '进行中'];
        for (const example of [basic, vertical, bordered]) {
          await expect(example.locator('dl')).toHaveCount(1);
          await expect(example.locator('dt')).toHaveText(labels);
          await expect(example.locator('dd')).toHaveText(values);
          expect(
            await example
              .locator('dl')
              .evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length),
          ).toBe(width === 1280 ? 3 : 1);
        }
        const horizontalGeometry = await basic
          .locator('dl > div')
          .first()
          .evaluate((node) => {
            const label = node.querySelector('dt')?.getBoundingClientRect();
            const value = node.querySelector('dd')?.getBoundingClientRect();
            if (!label || !value) throw new Error('Missing description label or value');
            return {
              labelTop: label.top,
              labelRight: label.right,
              valueTop: value.top,
              valueLeft: value.left,
            };
          });
        expect(horizontalGeometry.valueTop).toBeCloseTo(horizontalGeometry.labelTop, 1);
        expect(horizontalGeometry.valueLeft).toBeGreaterThan(horizontalGeometry.labelRight);
        const verticalGeometry = await vertical
          .locator('dl > div')
          .first()
          .evaluate((node) => {
            const label = node.querySelector('dt')?.getBoundingClientRect();
            const value = node.querySelector('dd')?.getBoundingClientRect();
            if (!label || !value) throw new Error('Missing description label or value');
            return {
              labelLeft: label.left,
              labelBottom: label.bottom,
              valueLeft: value.left,
              valueTop: value.top,
            };
          });
        expect(verticalGeometry.valueLeft).toBeCloseTo(verticalGeometry.labelLeft, 1);
        expect(verticalGeometry.valueTop).toBeGreaterThan(verticalGeometry.labelBottom);

        await expect(responsive.locator('dl')).toHaveCount(1);
        await expect(responsive.locator('dt')).toHaveText(
          english ? ['Project', 'Owner', 'Notes'] : ['项目', '负责人', '说明'],
        );
        await expect(responsive.locator('dd')).toHaveText([
          'Leaf UI',
          'Alex',
          english ? 'A consistent interface for the team.' : '统一团队的产品界面。',
        ]);
        const spanGeometry = await responsive.locator('dl').evaluate((node) => {
          const list = node.getBoundingClientRect();
          const [first, second, note] = [...node.children].map((item) =>
            item.getBoundingClientRect(),
          );
          if (!first || !second || !note) throw new Error('Missing responsive description fields');
          return {
            columns: getComputedStyle(node).gridTemplateColumns.split(' ').length,
            listWidth: list.width,
            noteWidth: note.width,
            firstTop: first.top,
            firstBottom: first.bottom,
            firstWidth: first.width,
            secondTop: second.top,
            secondBottom: second.bottom,
            noteTop: note.top,
          };
        });
        expect(spanGeometry.columns).toBe(width === 1280 ? 2 : 1);
        expect(spanGeometry.noteWidth).toBeCloseTo(spanGeometry.listWidth, 1);
        expect(spanGeometry.noteTop).toBeGreaterThan(spanGeometry.secondBottom);
        if (width === 1280) {
          expect(spanGeometry.firstTop).toBeCloseTo(spanGeometry.secondTop, 1);
          expect(spanGeometry.firstWidth).toBeLessThan(spanGeometry.noteWidth);
        } else {
          expect(spanGeometry.secondTop).toBeGreaterThan(spanGeometry.firstBottom);
          expect(spanGeometry.firstWidth).toBeCloseTo(spanGeometry.noteWidth, 1);
        }
        await expect(bordered.locator('.leaf-descriptions')).toHaveCSS('border-top-style', 'solid');
        expect(
          await bordered
            .locator('.leaf-descriptions')
            .evaluate((node) => Number.parseFloat(getComputedStyle(node).borderTopWidth)),
        ).toBeGreaterThan(0);
        await expect(basic.locator('.leaf-descriptions')).toHaveCSS('border-top-width', '0px');
        await expectNoPageOverflow(page);
      });

      test('Divider labels, alignment, dashed lines and orientation stay distinct', async ({
        page,
      }) => {
        await visitPage(page, 'divider', english, appearance);
        const basic = preview(page, english, '基础用法', 'Basic usage');
        await expect(basic.getByRole('separator')).toHaveCount(1);
        await expect(basic.getByRole('separator')).toHaveAttribute(
          'aria-orientation',
          'horizontal',
        );
        await expect(basic.getByRole('separator')).toHaveText('');

        const alignment = preview(page, english, '文字位置', 'Text alignment');
        const labeled = alignment.getByRole('separator', {
          name: english ? 'Settings' : '设置',
          exact: true,
        });
        await expect(labeled).toHaveCount(3);
        for (const separator of await labeled.all()) {
          await expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
        }
        const positions = await labeled.evaluateAll((nodes) =>
          nodes.map((node) => {
            const box = node.getBoundingClientRect();
            const label = node.querySelector('.leaf-divider__text')?.getBoundingClientRect();
            if (!label) throw new Error('Missing divider label');
            return { before: label.left - box.left, after: box.right - label.right };
          }),
        );
        const [start, center, end] = positions;
        if (!start || !center || !end) throw new Error('Missing divider alignment examples');
        expect(start.before).toBeLessThan(start.after);
        expect(center.before).toBeCloseTo(center.after, 1);
        expect(end.before).toBeGreaterThan(end.after);

        const dashed = preview(page, english, '虚线', 'Dashed line').getByRole('separator');
        await expect(dashed).toHaveCount(2);
        expect(
          await dashed.nth(0).evaluate((node) => getComputedStyle(node, '::before').borderTopStyle),
        ).toBe('solid');
        expect(
          await dashed.nth(1).evaluate((node) => getComputedStyle(node, '::before').borderTopStyle),
        ).toBe('dashed');

        const vertical = preview(page, english, '垂直分割线', 'Vertical divider');
        const separators = vertical.getByRole('separator', { includeHidden: true });
        await expect(separators).toHaveCount(2);
        for (const separator of await separators.all()) {
          await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
          await expect(separator).toHaveText('');
          await expect(separator).toHaveCSS('border-left-style', 'solid');
          const shape = await separator.evaluate((node) => {
            const box = node.getBoundingClientRect();
            return { width: box.width, height: box.height };
          });
          expect(shape.height).toBeGreaterThan(shape.width);
          expect(shape.width).toBeGreaterThan(0);
        }
        for (const text of english
          ? ['Project', 'Team only', 'Updated today']
          : ['项目资料', '团队可见', '今日更新']) {
          await expect(vertical.getByText(text, { exact: true })).toBeVisible();
        }
        await expectNoPageOverflow(page);
      });
    });
  }
}
