import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

const profiles = [
  { width: 1280, appearance: 'light' },
  { width: 375, appearance: 'dark' },
] as const;

async function openExamples(
  page: Page,
  component: 'scroll-area' | 'scrollbar' | 'virtual-list',
  english: boolean,
  { width, appearance }: (typeof profiles)[number],
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: appearance, reducedMotion: 'no-preference' });
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
  await expect(page.locator('.leaf-component-example__preview')).toHaveCount(
    component === 'scroll-area' ? 2 : component === 'scrollbar' ? 6 : 4,
  );
  return {
    errors,
    preview: (zh: string, en: string) =>
      page
        .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
        .locator('.leaf-component-example__preview'),
  };
}

async function expectLayout(page: Page) {
  const previews = await page
    .locator('.leaf-component-example__preview-content')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const preview = node.closest('.leaf-component-example__preview');
        if (!preview) throw new Error('Missing scroll example preview');
        const inner = node.getBoundingClientRect();
        const outer = preview.getBoundingClientRect();
        return {
          centered: Math.abs(inner.left + inner.width / 2 - (outer.left + outer.width / 2)) < 1,
          contained: inner.left >= outer.left - 1 && inner.right <= outer.right + 1,
          overflow: node.scrollWidth - node.clientWidth,
        };
      }),
    );
  for (const preview of previews) {
    expect(preview.centered).toBe(true);
    expect(preview.contained).toBe(true);
    expect(preview.overflow).toBeLessThanOrEqual(1);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}

function scrollbar(viewport: Locator, orientation: 'vertical' | 'horizontal') {
  return viewport.locator('..').locator(`[role="scrollbar"][aria-orientation="${orientation}"]`);
}

async function expectKeyboardScroll(viewport: Locator, orientation: 'vertical' | 'horizontal') {
  const control = scrollbar(viewport, orientation);
  await expect(control).toHaveAttribute('aria-controls', (await viewport.getAttribute('id')) ?? '');
  const position = () =>
    viewport.evaluate(
      (node, vertical) => (vertical ? node.scrollTop : node.scrollLeft),
      orientation === 'vertical',
    );
  await control.press('End');
  await expect.poll(position).toBeGreaterThan(0);
  await expect
    .poll(async () => Number(await control.getAttribute('aria-valuenow')))
    .toBeGreaterThan(0);
  await control.press('Home');
  await expect.poll(position).toBe(0);
  await control.press(orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight');
  await expect.poll(position).toBe(40);
  await control.press('PageDown');
  await expect.poll(position).toBeGreaterThan(40);
  await control.press('Home');
  await expect.poll(position).toBe(0);
}

async function wheel(page: Page, viewport: Locator, horizontal = false) {
  await viewport.scrollIntoViewIfNeeded();
  await viewport.hover();
  await page.mouse.wheel(horizontal ? 280 : 0, horizontal ? 0 : 180);
  await expect
    .poll(() => viewport.evaluate((node, x) => (x ? node.scrollLeft : node.scrollTop), horizontal))
    .toBeGreaterThan(0);
}

async function expectMeasuredRows(viewport: Locator) {
  const rows = await viewport.locator('.leaf-virtual-list__item').evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, height: box.height };
    }),
  );
  expect(rows.length).toBeGreaterThan(2);
  expect(rows.length).toBeLessThan(60);
  expect(new Set(rows.map((row) => Math.round(row.height))).size).toBeGreaterThan(1);
  for (let index = 1; index < rows.length; index += 1) {
    const current = rows[index];
    const previous = rows[index - 1];
    if (!current || !previous) throw new Error(`Missing measured virtual row pair ${index}`);
    expect(Math.abs(current.top - previous.bottom)).toBeLessThanOrEqual(1);
  }
}

for (const english of [false, true]) {
  for (const profile of profiles) {
    const suffix = `${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`;

    test(`ScrollArea vertical and horizontal examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'scroll-area', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const vertical = basic.getByRole('region', {
        name: english ? 'Project list' : '项目列表',
        exact: true,
      });
      await expect(vertical).toHaveCSS('height', '180px');
      await expect(vertical).toHaveCSS('overflow-x', 'hidden');
      await expect(vertical.locator('.leaf-text')).toHaveCount(20);
      await wheel(page, vertical);
      await expectKeyboardScroll(vertical, 'vertical');
      await vertical.focus();
      await settleAnimations(basic);
      await basic.screenshot({ path: testInfo.outputPath('scroll-area-vertical.png') });

      const horizontal = preview('横向滚动', 'Horizontal scrolling');
      const cards = horizontal.getByRole('region', {
        name: english ? 'Horizontal cards' : '横向卡片',
        exact: true,
      });
      await expect(cards).toHaveCSS('overflow-y', 'hidden');
      await expect(cards.locator('.leaf-card')).toHaveCount(5);
      await wheel(page, cards, true);
      await expectKeyboardScroll(cards, 'horizontal');
      await scrollbar(cards, 'horizontal').press('End');
      await settleAnimations(horizontal);
      await horizontal.screenshot({ path: testInfo.outputPath('scroll-area-horizontal-end.png') });
      await expectLayout(page);
      expect(errors).toEqual([]);
    });

    test(`Scrollbar visibility, reserved space, and dynamic examples: ${suffix}`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(60_000);
      const { preview, errors } = await openExamples(page, 'scrollbar', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const activity = basic.getByRole('region', {
        name: english ? 'Project activity' : '项目动态',
        exact: true,
      });
      await wheel(page, activity);
      await expectKeyboardScroll(activity, 'vertical');

      const horizontal = preview('横向滚动', 'Horizontal scrolling');
      const cards = horizontal.getByRole('region', {
        name: english ? 'Horizontal cards' : '横向卡片',
        exact: true,
      });
      await wheel(page, cards, true);
      await expectKeyboardScroll(cards, 'horizontal');

      const visibility = preview('显示方式', 'Scrollbar visibility');
      const auto = visibility.getByRole('region', {
        name: english ? 'Auto visibility list' : '自动显示列表',
        exact: true,
      });
      const always = visibility.getByRole('region', {
        name: english ? 'Always visible list' : '始终显示列表',
        exact: true,
      });
      const hidden = visibility.getByRole('region', {
        name: english ? 'Hidden scrollbar list' : '隐藏滚动条的列表',
        exact: true,
      });
      await always.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await expect(always.locator('..').locator('.leaf-scrollbar__bar')).toHaveCSS('opacity', '1');
      await expect(hidden.locator('..').getByRole('scrollbar')).toHaveCount(0);
      await wheel(page, hidden);
      await wheel(page, auto);
      await expect(auto.locator('..').locator('.leaf-scrollbar__bar')).toHaveCSS('opacity', '1');
      await page.mouse.move(0, 0);
      await expect(auto.locator('..').locator('.leaf-scrollbar__bar')).toHaveCSS('opacity', '0');
      await visibility.screenshot({ path: testInfo.outputPath('scrollbar-visibility.png') });

      const persistent = preview('覆盖与占位', 'Overlay and reserved space');
      const overlay = persistent.getByRole('region', {
        name: english ? 'Overlay track' : '覆盖滚动条',
        exact: true,
      });
      const reserved = persistent.getByRole('region', {
        name: english ? 'Reserved track' : '占位滚动条',
        exact: true,
      });
      await expect(overlay.locator('..')).not.toHaveAttribute('data-persistent');
      await expect(reserved.locator('..')).toHaveAttribute('data-persistent', '');
      const gutter = (viewport: Locator) =>
        viewport.evaluate((node) => {
          const outer = node.parentElement?.getBoundingClientRect();
          if (!outer) throw new Error('Missing scrollbar root');
          return outer.width - node.getBoundingClientRect().width;
        });
      expect(await gutter(overlay)).toBeLessThanOrEqual(1);
      expect(await gutter(reserved)).toBeGreaterThanOrEqual(15);
      await expectKeyboardScroll(reserved, 'vertical');
      await persistent.screenshot({ path: testInfo.outputPath('scrollbar-reserved-space.png') });

      const dynamic = preview('动态内容与滚动控制', 'Dynamic content and scroll control');
      const items = dynamic.getByRole('region', {
        name: english ? 'Dynamic list' : '动态列表',
        exact: true,
      });
      await expect(items.locator('.leaf-text')).toHaveCount(3);
      await expect(items.locator('..').getByRole('scrollbar')).toHaveCount(0);
      const initialHeight = await items.evaluate((node) => node.clientHeight);
      const add = dynamic.getByRole('button', {
        name: english ? 'Add items' : '增加内容',
        exact: true,
      });
      await add.click();
      await add.click();
      await expect(items.locator('.leaf-text')).toHaveCount(9);
      await expect
        .poll(() => items.evaluate((node) => node.clientHeight))
        .toBeGreaterThan(initialHeight);
      await expect.poll(() => items.evaluate((node) => node.clientHeight)).toBeLessThanOrEqual(200);
      await scrollbar(items, 'vertical').press('End');
      await expect.poll(() => items.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
      await dynamic.screenshot({ path: testInfo.outputPath('scrollbar-dynamic-end.png') });
      await dynamic
        .getByRole('button', { name: english ? 'Back to top' : '返回顶部', exact: true })
        .click();
      await expect.poll(() => items.evaluate((node) => node.scrollTop)).toBe(0);
      await expectLayout(page);
      expect(errors).toEqual([]);
    });

    test(`VirtualList ten-thousand, measured height, imperative, and empty examples: ${suffix}`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(60_000);
      const { preview, errors } = await openExamples(page, 'virtual-list', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const list = basic.getByRole('region', {
        name: english ? 'Project list' : '项目列表',
        exact: true,
      });
      await expect(list.locator('li').first()).toHaveAttribute('aria-posinset', '1');
      await expect(list.locator('li').first()).toHaveAttribute('aria-setsize', '10000');
      expect(await list.locator('li').count()).toBeLessThan(60);
      await wheel(page, list);
      await scrollbar(list, 'vertical').press('End');
      await expect(list.locator('li[aria-posinset="10000"]')).toContainText(
        english ? 'Item 10000' : '项目 10000',
      );
      expect(await list.locator('li').count()).toBeLessThan(60);
      await basic.screenshot({ path: testInfo.outputPath('virtual-list-ten-thousand-end.png') });

      const dynamic = preview('动态高度', 'Dynamic row heights');
      const measured = dynamic.getByRole('region', {
        name: english ? 'Variable-height list' : '动态高度列表',
        exact: true,
      });
      await measured.scrollIntoViewIfNeeded();
      await expect
        .poll(async () => {
          const heights = await measured
            .locator('li')
            .evaluateAll((nodes) =>
              nodes.map((node) => Math.round(node.getBoundingClientRect().height)),
            );
          return new Set(heights).size;
        })
        .toBeGreaterThan(1);
      await expectMeasuredRows(measured);
      await wheel(page, measured);
      await expectMeasuredRows(measured);
      await dynamic.screenshot({ path: testInfo.outputPath('virtual-list-variable-heights.png') });

      const control = preview('滚动控制', 'Scroll control');
      const navigable = control.getByRole('region', {
        name: english ? 'Navigable project list' : '可跳转的项目列表',
        exact: true,
      });
      await control
        .getByRole('button', { name: english ? 'Go to item 501' : '跳至第 501 项', exact: true })
        .click();
      await expect(navigable.locator('li[aria-posinset="501"]')).toBeVisible();
      await expect.poll(() => navigable.evaluate((node) => node.scrollTop)).toBe(500 * 44);
      await control.screenshot({ path: testInfo.outputPath('virtual-list-index-500.png') });
      await control
        .getByRole('button', { name: english ? 'Back to top' : '返回顶部', exact: true })
        .click();
      await expect.poll(() => navigable.evaluate((node) => node.scrollTop)).toBe(0);
      await expect(navigable.locator('li[aria-posinset="1"]')).toBeVisible();

      const empty = preview('空列表', 'Empty list');
      const emptyList = empty.getByRole('region', {
        name: english ? 'Empty project list' : '空项目列表',
        exact: true,
      });
      await expect(emptyList.locator('li')).toHaveCount(0);
      await expect(emptyList.locator('.leaf-result')).toBeVisible();
      await expect(emptyList).toHaveCSS('height', '240px');
      await empty.screenshot({ path: testInfo.outputPath('virtual-list-empty.png') });
      await expectLayout(page);
      expect(errors).toEqual([]);
    });
  }
}
