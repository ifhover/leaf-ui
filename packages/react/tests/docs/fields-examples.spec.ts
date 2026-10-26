import { expect, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

for (const english of [false, true]) {
  for (const profile of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Field documentation interactions: ${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: profile.width, height: 900 });
        await page.emulateMedia({ colorScheme: profile.appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      });

      const example = (page: Page, chineseTitle: string, englishTitle: string) =>
        page.getByRole('region', {
          name: english ? `${englishTitle} example` : `${chineseTitle}示例`,
          exact: true,
        });

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

      test('Input clears, submits, searches and labels grouped controls', async ({ page }) => {
        await visit(page, 'input');

        const clear = example(page, '清除内容', 'Clear input');
        const clearInput = clear.getByRole('textbox', {
          name: english ? 'Project name' : '项目名称',
          exact: true,
        });
        await expect(clearInput).toHaveValue('Leaf Garden');
        const clearButton = clear.getByRole('button', {
          name: english ? 'Clear input' : '清除输入',
          exact: true,
        });
        await clearInput.hover();
        await expect(clearButton).toHaveCSS('opacity', '1');
        await expect(clearButton).toHaveCSS('pointer-events', 'auto');
        await clearButton.click();
        await expect(clearInput).toHaveValue('');
        await expect(clearInput).toBeFocused();
        await expect(clearButton).toHaveCount(0);
        await expect(clear.getByRole('status')).toHaveText(
          english ? 'Current text: Empty' : '当前内容：未填写',
        );
        await clearInput.fill('Leaf');
        await expect(clear.getByRole('status')).toHaveText(
          english ? 'Current text: Leaf' : '当前内容：Leaf',
        );

        const controlled = example(page, '受控输入与回车', 'Controlled input and Enter');
        const controlledInput = controlled.getByRole('textbox', {
          name: english ? 'Enter and submit' : '输入并回车',
          exact: true,
        });
        await controlledInput.fill('Leaf docs');
        await expect(controlled.getByRole('status')).toHaveText(
          english ? 'Submitted: Waiting for input' : '已提交：等待输入',
        );
        await controlledInput.press('Enter');
        await expect(controlled.getByRole('status')).toHaveText(
          english ? 'Submitted: Leaf docs' : '已提交：Leaf docs',
        );

        const search = example(page, '搜索输入', 'Search input');
        const searchInput = search.getByRole('textbox', {
          name: english ? 'Search projects' : '搜索项目',
          exact: true,
        });
        await searchInput.fill('garden');
        await search
          .getByRole('button', { name: english ? 'Search' : '搜索', exact: true })
          .click();
        await expect(search.getByRole('status')).toHaveText(
          english ? 'Search: garden' : '搜索内容：garden',
        );
        await searchInput.fill('leaf');
        await searchInput.press('Enter');
        await expect(search.getByRole('status')).toHaveText(
          english ? 'Search: leaf' : '搜索内容：leaf',
        );

        const grouped = example(page, '输入组合', 'Input groups');
        await expect(
          grouped.getByRole('group', { name: english ? 'URL' : '网址', exact: true }),
        ).toBeVisible();
        const protocol = grouped.getByRole('combobox', {
          name: english ? 'Protocol' : '协议',
          exact: true,
        });
        const domain = grouped.getByRole('textbox', {
          name: english ? 'Domain' : '域名',
          exact: true,
        });
        const protocolId = await protocol.getAttribute('id');
        const domainId = await domain.getAttribute('id');
        expect(protocolId).toBeTruthy();
        expect(domainId).toBeTruthy();
        expect(protocolId).not.toBe(domainId);
        const idCounts = await page
          .locator('[id]')
          .evaluateAll(
            (nodes, ids) => ids.map((id) => nodes.filter((node) => node.id === id).length),
            [protocolId, domainId],
          );
        expect(idCounts).toEqual([1, 1]);
        await expect(grouped.locator('label')).toHaveAttribute('for', domainId as string);
        await grouped.locator('label').click();
        await expect(domain).toBeFocused();
        await domain.fill('example.org');
        await protocol.click();
        await page.getByRole('option', { name: 'http://', exact: true }).click();
        await expect(protocol).toHaveValue('http://');
        await expect(domain).toHaveValue('example.org');
        await expect(controlled.getByRole('status')).toContainText('Leaf docs');
      });

      test('Textarea grows, caps its height and shrinks with its content', async ({ page }) => {
        await visit(page, 'textarea');

        const autoHeight = example(page, '自动高度', 'Automatic height');
        const textarea = autoHeight.getByRole('textbox', {
          name: english ? 'Project description' : '项目简介',
          exact: true,
        });
        await expect.poll(() => textarea.evaluate((node) => node.style.height)).not.toBe('');
        await settleAnimations(textarea);
        const height = () => textarea.evaluate((node) => node.getBoundingClientRect().height);
        const initialHeight = await height();
        const lines = (count: number) =>
          Array.from({ length: count }, (_, index) => `Line ${index + 1}`).join('\n');

        await textarea.fill(lines(4));
        await expect.poll(height).toBeGreaterThan(initialHeight);
        await textarea.fill(lines(12));
        await expect(textarea).toHaveCSS('overflow-y', 'auto');
        await settleAnimations(textarea);
        const cappedHeight = await height();
        expect(cappedHeight).toBeGreaterThan(initialHeight);
        expect(
          await textarea.evaluate((node) => node.scrollHeight - node.clientHeight),
        ).toBeGreaterThan(0);

        await textarea.fill(lines(20));
        await settleAnimations(textarea);
        await expect.poll(height).toBeCloseTo(cappedHeight, 0);
        await textarea.fill('');
        await expect(textarea).toHaveCSS('overflow-y', 'hidden');
        await settleAnimations(textarea);
        await expect.poll(height).toBeCloseTo(initialHeight, 0);
      });

      test('InputNumber preserves exact decimals and parses formatted input', async ({ page }) => {
        await visit(page, 'input-number');

        const basic = example(page, '基础用法', 'Basic usage');
        const quantity = basic.getByRole('spinbutton', {
          name: english ? 'Quantity' : '数量',
          exact: true,
        });
        await expect(quantity).toHaveValue('3');
        await quantity.fill('');
        await expect(basic.getByRole('status')).toHaveText(
          english ? 'Quantity: Empty' : '当前数量：未填写',
        );

        const exact = example(page, '高精度数值', 'Exact decimal values');
        const amount = exact.getByRole('spinbutton', {
          name: english ? 'Exact amount' : '高精度金额',
          exact: true,
        });
        await expect(amount).toHaveValue('9007199254740993.01');
        await expect(exact.getByRole('status')).toHaveText(
          english ? 'Current value: 9007199254740993.01' : '当前值：9007199254740993.01',
        );
        await exact
          .getByRole('button', {
            name: english ? 'Increase value' : '增加数值',
            exact: true,
          })
          .click();
        await expect(amount).toHaveValue('9007199254740993.02');
        await expect(exact.getByRole('status')).toHaveText(
          english ? 'Current value: 9007199254740993.02' : '当前值：9007199254740993.02',
        );
        expect(
          await amount.evaluate((node) => {
            const form = (node as HTMLInputElement).form;
            if (!form) throw new Error('Missing exact-number form');
            return new FormData(form).get('amount');
          }),
        ).toBe('9007199254740993.02');

        const formatting = example(page, '格式化显示', 'Display formatting');
        const grouping = formatting.getByRole('spinbutton', {
          name: english ? 'Digit grouping' : '千分位分组',
          exact: true,
        });
        await expect(grouping).toHaveValue('12,345.67');
        await grouping.fill('9,876.5');
        await grouping.press('Tab');
        await expect(grouping).toHaveValue('9,876.50');
        await expect(grouping).toHaveAttribute('aria-valuenow', '9876.5');

        const percentage = formatting.getByRole('spinbutton', {
          name: english ? 'Custom percentage' : '自定义百分比',
          exact: true,
        });
        await expect(percentage).toHaveValue('15%');
        await percentage.fill('42%');
        await expect(percentage).toHaveAttribute('aria-valuenow', '42');
        await percentage.press('ArrowUp');
        await expect(percentage).toHaveValue('43%');
        await expect(percentage).toHaveAttribute('aria-valuenow', '43');
        await percentage.press('Tab');
        await expect(percentage).toHaveValue('43%');
      });
    });
  }
}
