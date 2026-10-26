import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

const profiles = [
  { width: 1280, appearance: 'light' },
  { width: 375, appearance: 'dark' },
] as const;

async function expectPreviewBounds(page: Page) {
  await expect
    .poll(
      () =>
        page.locator('.leaf-component-example__preview-content').evaluateAll((nodes) =>
          nodes.every((node) => {
            const preview = node.closest('.leaf-component-example__preview');
            if (!preview) throw new Error('Missing navigation example preview');
            const bounds = node.getBoundingClientRect();
            const outer = preview.getBoundingClientRect();
            return (
              bounds.left >= outer.left - 1 &&
              bounds.right <= outer.right + 1 &&
              node.scrollWidth <= node.clientWidth + 1
            );
          }),
        ),
      { timeout: 5000 },
    )
    .toBe(true);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth), {
      timeout: 5000,
    })
    .toBeLessThanOrEqual(1);
}

async function openNavigationPage(
  page: Page,
  component: 'anchor' | 'breadcrumb' | 'pagination',
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
  const dark = (await root.getAttribute('class'))?.includes('dark');
  if (Boolean(dark) !== (appearance === 'dark')) {
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
  await expect(page.locator('.leaf-component-example__preview')).toHaveCount(
    { anchor: 2, breadcrumb: 3, pagination: 6 }[component],
  );
  await expectPreviewBounds(page);
  return {
    errors,
    preview: (zh: string, en: string) =>
      page
        .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
        .locator('.leaf-component-example__preview'),
  };
}

async function expectComparisonLabels(preview: Locator, labels: string[]) {
  const rows = preview.locator('.leaf-grid > .leaf-flex');
  await expect(rows).toHaveCount(labels.length);
  await expect(rows.locator(':scope > .leaf-text')).toHaveText(labels);
  await expect
    .poll(
      () =>
        rows.evaluateAll((nodes) => {
          const geometry = nodes.map((node) => {
            const label = node.querySelector(':scope > .leaf-text');
            const navigation = node.querySelector(':scope > nav');
            if (!label || !navigation) throw new Error('Missing pagination comparison row');
            return {
              label: label.getBoundingClientRect(),
              navigation: navigation.getBoundingClientRect(),
              overflow: node.scrollWidth - node.clientWidth,
            };
          });
          const [first] = geometry;
          if (!first) throw new Error('Missing pagination comparison geometry');
          return geometry.every(
            ({ label, navigation, overflow }) =>
              label.bottom <= navigation.top + 1 &&
              Math.abs(label.left - navigation.left) < 1 &&
              Math.abs(label.left - first.label.left) < 1 &&
              overflow <= 1,
          );
        }),
      { timeout: 5000 },
    )
    .toBe(true);
}

for (const english of [false, true]) {
  for (const profile of profiles) {
    const suffix = `${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`;

    test(`Anchor examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openNavigationPage(page, 'anchor', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const navigation = basic.getByRole('navigation', {
        name: english ? 'Section contents' : '章节目录',
        exact: true,
      });
      const content = basic.getByRole('region', {
        name: english ? 'Section content' : '章节内容',
        exact: true,
      });
      await expect(navigation.getByRole('link')).toHaveCount(3);
      await expect(content).toHaveAttribute('tabindex', '0');
      await content.scrollIntoViewIfNeeded();
      const memberLink = navigation.getByRole('link', {
        name: english ? 'Members' : '成员',
        exact: true,
      });
      const href = await memberLink.getAttribute('href');
      if (!href?.startsWith('#')) throw new Error('Missing Anchor destination');
      const destination = content.locator(
        `section[id=${JSON.stringify(decodeURIComponent(href.slice(1)))}]`,
      );
      await expect(destination).toHaveCount(1);
      await memberLink.click();
      await expect.poll(() => new URL(page.url()).hash, { timeout: 5000 }).toBe(href);
      await expect(destination).toBeFocused();
      await expect(memberLink).toHaveAttribute('aria-current', 'location');
      await expect
        .poll(
          () =>
            destination.evaluate((node) => {
              const scroller = node.parentElement;
              if (!scroller) throw new Error('Missing Anchor scroll region');
              return Math.abs(
                node.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12,
              );
            }),
          { timeout: 5000 },
        )
        .toBeLessThan(1.5);
      await content.evaluate((node) =>
        node.scrollTo({ top: node.scrollHeight, behavior: 'instant' }),
      );
      await expect(
        navigation.getByRole('link', { name: english ? 'Settings' : '设置', exact: true }),
      ).toHaveAttribute('aria-current', 'location');
      await expect(navigation.locator('[aria-current="location"]')).toHaveCount(1);
      expect(new URL(page.url()).hash).toBe(href);
      await content.evaluate((node) => node.scrollTo({ top: 0, behavior: 'instant' }));
      await expect(
        navigation.getByRole('link', { name: english ? 'Overview' : '概况', exact: true }),
      ).toHaveAttribute('aria-current', 'location');
      expect(new URL(page.url()).hash).toBe(href);

      const fixed = preview('固定操作', 'Fixed action');
      const scroller = fixed.getByRole('region', {
        name: english ? 'Scrollable content' : '可滚动的内容',
        exact: true,
      });
      const action = fixed.locator('.leaf-affix > div');
      const save = fixed.getByRole('button', {
        name: english ? 'Save changes' : '保存修改',
        exact: true,
      });
      const feedback = fixed.getByRole('status');
      await expect(feedback).toHaveText(english ? 'Not saved yet' : '尚未保存');
      await fixed.scrollIntoViewIfNeeded();
      await expect(action).not.toHaveCSS('position', 'fixed');
      const originalTop = await action.evaluate((node) => {
        const area = node.closest('section[aria-label]');
        if (!area) throw new Error('Missing Affix scroll region');
        return node.getBoundingClientRect().top - area.getBoundingClientRect().top;
      });
      expect(originalTop).toBeGreaterThan(8);
      await scroller.evaluate((node) => node.scrollTo({ top: 150, behavior: 'instant' }));
      await expect(action).toHaveCSS('position', 'fixed');
      await expect
        .poll(
          () =>
            action.evaluate((node) => {
              const area = node.closest('section[aria-label]');
              if (!area) throw new Error('Missing Affix scroll region');
              return Math.abs(
                node.getBoundingClientRect().top - area.getBoundingClientRect().top - 8,
              );
            }),
          { timeout: 5000 },
        )
        .toBeLessThan(1.5);
      await save.click();
      await expect(feedback).toHaveText(english ? 'Changes saved' : '修改已保存');
      await fixed.screenshot({ path: testInfo.outputPath('anchor-affixed-save.png') });
      await scroller.evaluate((node) => node.scrollTo({ top: 0, behavior: 'instant' }));
      await expect(action).not.toHaveCSS('position', 'fixed');
      await expect
        .poll(
          () =>
            action.evaluate((node, initial) => {
              const area = node.closest('section[aria-label]');
              if (!area) throw new Error('Missing Affix scroll region');
              return Math.abs(
                node.getBoundingClientRect().top - area.getBoundingClientRect().top - initial,
              );
            }, originalTop),
          { timeout: 5000 },
        )
        .toBeLessThan(1.5);
      await expect(feedback).toHaveText(english ? 'Changes saved' : '修改已保存');
      await expectPreviewBounds(page);
      expect(errors).toEqual([]);
    });

    test(`Breadcrumb examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openNavigationPage(page, 'breadcrumb', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const navigation = basic.getByRole('navigation', {
        name: english ? 'Breadcrumb' : '面包屑',
        exact: true,
      });
      await expect(navigation.getByRole('list')).toHaveCount(1);
      await expect(navigation.getByRole('listitem')).toHaveCount(3);
      await expect(navigation.getByRole('link')).toHaveCount(2);
      const current = navigation.locator('[aria-current="page"]');
      await expect(current).toHaveText('Breadcrumb');
      await expect(current).toHaveJSProperty('tagName', 'SPAN');
      await expect(current).not.toHaveAttribute('href');
      const separator = preview('分隔符', 'Separator');
      await expect(separator.locator('.leaf-breadcrumb__separator')).toHaveText(['/', '/']);
      for (const item of await separator.locator('.leaf-breadcrumb__separator').all()) {
        await expect(item).toHaveAttribute('aria-hidden', 'true');
      }

      const collapsed = preview('折叠长路径', 'Collapse long paths');
      const path = collapsed.getByRole('navigation', {
        name: english ? 'Collapsed documentation path' : '折叠后的文档路径',
        exact: true,
      });
      await expect(path.getByRole('listitem')).toHaveCount(3);
      await expect(path.locator('[aria-current="page"]')).toHaveText('API');
      const expand = path.getByRole('button', { name: english ? 'Expand' : '展开', exact: true });
      const originalURL = page.url();
      await expand.press('ArrowDown');
      await expect(expand).toHaveAttribute('aria-expanded', 'true');
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();
      await settleAnimations(menu);
      await expect(menu.getByRole('menuitem')).toHaveCount(2);
      const components = menu.getByRole('menuitem', {
        name: english ? 'Components' : '组件',
        exact: true,
      });
      const breadcrumb = menu.getByRole('menuitem', { name: 'Breadcrumb', exact: true });
      await expect(components).toBeFocused();
      await expect(components).toHaveJSProperty('tagName', 'A');
      await expect(components).toHaveAttribute(
        'href',
        `https://ifhover.github.io/leaf-ui/${english ? 'en/' : ''}components/index.html`,
      );
      await expect(breadcrumb).toHaveJSProperty('tagName', 'A');
      await expect(breadcrumb).toHaveAttribute('href', english ? '#basic-usage' : '#基础用法');
      await expect(page.locator(english ? '#basic-usage' : '#基础用法')).toHaveCount(1);
      await components.press('ArrowDown');
      await expect(breadcrumb).toBeFocused();
      await expect
        .poll(
          () =>
            menu.evaluate((node) => {
              const bounds = node.getBoundingClientRect();
              return (
                bounds.left >= -1 &&
                bounds.right <= innerWidth + 1 &&
                node.scrollWidth <= node.clientWidth + 1
              );
            }),
          { timeout: 5000 },
        )
        .toBe(true);
      await page.screenshot({ path: testInfo.outputPath('breadcrumb-expanded-path.png') });
      await breadcrumb.press('Escape');
      await expect(menu).toBeHidden();
      await expect(expand).toHaveAttribute('aria-expanded', 'false');
      await expect(expand).toBeFocused();
      expect(page.url()).toBe(originalURL);
      await expectPreviewBounds(page);
      expect(errors).toEqual([]);
    });

    test(`Pagination examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openNavigationPage(page, 'pagination', english, profile);
      const pageName = (number: number) => `${english ? 'Page' : '页'} ${number}`;
      const nextName = english ? 'Next page' : '下一页';
      const previousName = english ? 'Previous page' : '上一页';
      const basic = preview('基础用法', 'Basic usage').getByRole('navigation');
      await expect(basic.locator('[aria-current="page"]')).toHaveText('1');
      await expect(basic.getByRole('button', { name: previousName, exact: true })).toBeDisabled();
      await basic.getByRole('button', { name: nextName, exact: true }).click();
      await expect(basic.getByRole('button', { name: pageName(2), exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      );

      const variants = preview('按钮样式', 'Button appearance');
      await expectComparisonLabels(
        variants,
        english ? ['Outline (default)', 'Ghost'] : ['描边（默认）', '无边框'],
      );
      await expect(
        variants.getByRole('navigation', {
          name: english ? 'Outline pagination' : '描边分页',
          exact: true,
        }),
      ).toHaveClass(/leaf-pagination--outline/);
      await expect(
        variants.getByRole('navigation', {
          name: english ? 'Ghost pagination' : '无边框分页',
          exact: true,
        }),
      ).toHaveClass(/leaf-pagination--ghost/);
      const sizes = preview('不同尺寸', 'Sizes');
      await expectComparisonLabels(
        sizes,
        english ? ['Small', 'Medium (default)', 'Large'] : ['小', '中（默认）', '大'],
      );
      await expect(sizes.getByRole('navigation')).toHaveCount(3);

      const controlled = preview('数据控制', 'Controlled pagination');
      const navigation = controlled.getByRole('navigation');
      const feedback = controlled.getByRole('status');
      const range = controlled.locator('.leaf-pagination__total');
      const state = (current: number, size: number) =>
        english ? `Page ${current}, ${size} items per page` : `第 ${current} 页，每页 ${size} 条`;
      const visibleRange = (start: number, end: number) =>
        english ? `${start}-${end} of 240 items` : `${start}-${end} / 240 条`;
      await expect(feedback).toHaveText(state(1, 10));
      await expect(range).toHaveText(visibleRange(1, 10));
      await navigation.getByRole('button', { name: pageName(3), exact: true }).click();
      await expect(feedback).toHaveText(state(3, 10));
      await expect(range).toHaveText(visibleRange(21, 30));
      const pageSize = navigation.getByRole('combobox', {
        name: english ? 'Page size' : '每页条数',
        exact: true,
      });
      await pageSize.click();
      await page
        .getByRole('option', { name: english ? '20 / page' : '20 条/页', exact: true })
        .click();
      await expect(feedback).toHaveText(state(2, 20));
      await expect(range).toHaveText(visibleRange(21, 40));
      await expect(
        navigation.getByRole('button', { name: pageName(2), exact: true }),
      ).toHaveAttribute('aria-current', 'page');
      const jump = navigation.getByRole('spinbutton', {
        name: english ? 'Go to' : '跳至',
        exact: true,
      });
      await jump.fill('8');
      await expect(feedback).toHaveText(state(2, 20));
      await jump.press('Enter');
      await expect(feedback).toHaveText(state(8, 20));
      await expect(range).toHaveText(visibleRange(141, 160));
      await expect(jump).toHaveValue('8');
      await expect(
        navigation.getByRole('button', { name: pageName(8), exact: true }),
      ).toHaveAttribute('aria-current', 'page');
      await settleAnimations(controlled);
      await controlled.screenshot({ path: testInfo.outputPath('pagination-controlled-range.png') });

      const simple = preview('简洁模式', 'Simple mode').getByRole('navigation');
      await expect(simple.getByRole('button')).toHaveCount(2);
      await expect(simple.locator('.leaf-pagination__simple')).toHaveText('3 / 24');
      await simple.getByRole('button', { name: previousName, exact: true }).click();
      await expect(simple.locator('.leaf-pagination__simple')).toHaveText('2 / 24');
      await simple.getByRole('button', { name: nextName, exact: true }).click();
      await expect(simple.locator('.leaf-pagination__simple')).toHaveText('3 / 24');

      const disabled = preview('禁用状态', 'Disabled').getByRole('navigation');
      await expect(disabled.locator('[aria-current="page"]')).toHaveText('2');
      await expect(disabled.getByRole('button')).toHaveCount(7);
      for (const button of await disabled.getByRole('button').all()) {
        await expect(button).toBeDisabled();
      }
      const thirdPage = disabled.getByRole('button', { name: pageName(3), exact: true });
      await thirdPage.scrollIntoViewIfNeeded();
      const target = await thirdPage.boundingBox();
      if (!target) throw new Error('Disabled pagination has no pointer target');
      await page.mouse.click(target.x + target.width / 2, target.y + target.height / 2);
      await expect(disabled.locator('[aria-current="page"]')).toHaveText('2');
      await expectPreviewBounds(page);
      expect(errors).toEqual([]);
    });
  }
}
