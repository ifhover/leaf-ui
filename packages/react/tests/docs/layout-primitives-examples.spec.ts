import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

type Box = Pick<DOMRect, 'x' | 'y' | 'right' | 'bottom' | 'width' | 'height'>;

const boxes = async (locator: Locator): Promise<[Box, ...Box[]]> => {
  const measured = await locator.evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    }),
  );
  const [first, ...rest] = measured;
  if (!first) throw new Error(`No layout geometry found for ${locator}`);
  return [first, ...rest];
};

function itemAt<T>(items: readonly T[], index: number, description: string): T {
  const item = items[index];
  if (item === undefined) throw new Error(`${description}: missing item ${index}`);
  return item;
}

const near = (actual: number, expected: number, message: string) =>
  expect(Math.abs(actual - expected), message).toBeLessThan(1);

async function expectColumns(grid: Locator, count: number) {
  const cards = grid.locator(':scope > .leaf-card');
  await expect(cards).toHaveCount(3);
  await expect
    .poll(() =>
      grid.evaluate(
        (node) => getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).length,
      ),
    )
    .toBe(count);
  await settleAnimations(grid);
  const [outer] = await boxes(grid);
  const items = await boxes(cards);
  const width = (outer.width - (count - 1) * 16) / count;
  const height = items[0].height;
  for (const [index, item] of items.entries()) {
    near(item.width, width, `Column ${index}: equal width`);
    near(item.x, outer.x + (index % count) * (width + 16), `Column ${index}: horizontal position`);
    near(
      item.y,
      outer.y + Math.floor(index / count) * (height + 16),
      `Column ${index}: row position and gap`,
    );
    near(item.height, height, `Column ${index}: content height`);
  }
}

for (const english of [false, true]) {
  for (const profile of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Layout primitive documentation: ${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: profile.width, height: 900 });
        await page.emulateMedia({ colorScheme: profile.appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      });

      const preview = (page: Page, chineseTitle: string, englishTitle: string) =>
        page
          .getByRole('region', {
            name: english ? `${englishTitle} example` : `${chineseTitle}示例`,
            exact: true,
          })
          .locator('.leaf-component-example__preview');

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

      test('Flex demonstrates direction, both alignment axes and wrapped gaps', async ({
        page,
      }) => {
        await visit(page, 'flex');

        const basic = preview(page, '基础用法', 'Basic usage').locator('.leaf-flex');
        await expect(basic).toHaveCSS('flex-direction', 'row');
        await expect(basic.getByRole('button')).toHaveCount(3);
        await settleAnimations(basic);
        const horizontal = await boxes(basic.getByRole('button'));
        for (const [index, item] of horizontal.entries()) {
          near(item.y, horizontal[0].y, 'Basic actions stay in one row');
          if (index > 0) {
            const previous = itemAt(horizontal, index - 1, 'Basic horizontal actions');
            near(item.x - previous.right, 8, 'Basic action gap');
          }
        }

        const vertical = preview(page, '纵向排列', 'Vertical layout').locator('.leaf-flex');
        await expect(vertical).toHaveCSS('flex-direction', 'column');
        await expect(vertical).toHaveCSS('align-items', 'flex-start');
        await expect(vertical.getByRole('button')).toHaveCount(3);
        await settleAnimations(vertical);
        const stacked = await boxes(vertical.getByRole('button'));
        for (const [index, item] of stacked.entries()) {
          near(item.x, stacked[0].x, 'Vertical actions share their start edge');
          const original = itemAt(horizontal, index, 'Original horizontal actions');
          near(item.width, original.width, 'Vertical actions retain natural widths');
          if (index > 0) {
            const previous = itemAt(stacked, index - 1, 'Vertical actions');
            near(item.y - previous.bottom, 8, 'Vertical action gap');
          }
        }

        const main = preview(page, '主轴对齐', 'Main-axis alignment');
        await settleAnimations(main);
        for (const justify of ['start', 'center', 'end', 'space-between']) {
          const label = main.locator('.leaf-text').filter({ hasText: new RegExp(`^${justify}$`) });
          const row = label.locator('..').locator(':scope > .leaf-flex');
          await expect(row).toHaveCount(1);
          await expect(row.getByRole('button')).toHaveCount(2);
          const [outer] = await boxes(row);
          const [first, second] = await boxes(row.getByRole('button'));
          if (!second) throw new Error(`Missing second action for ${justify} alignment`);
          const [name] = await boxes(label);
          expect(name.bottom).toBeLessThanOrEqual(outer.y);
          near(first.y, second.y, `${justify}: actions share one row`);
          if (justify === 'start' || justify === 'space-between') {
            near(first.x, outer.x, `${justify}: first action begins at start`);
          }
          if (justify === 'end' || justify === 'space-between') {
            near(second.right, outer.right, `${justify}: last action ends at end`);
          }
          if (justify === 'center') {
            near(
              (first.x + second.right) / 2,
              outer.x + outer.width / 2,
              'Centered actions share the main-axis center',
            );
          }
          if (justify === 'space-between') {
            expect(second.x - first.right).toBeGreaterThan(8);
          } else {
            near(second.x - first.right, 8, `${justify}: action gap`);
          }
        }

        const cross = preview(page, '交叉轴对齐', 'Cross-axis alignment');
        await settleAnimations(cross);
        for (const align of ['start', 'center', 'end']) {
          const row = cross
            .locator('.leaf-text')
            .filter({ hasText: new RegExp(`^${align}$`) })
            .locator('..')
            .locator('.leaf-card .leaf-flex');
          await expect(row).toHaveCount(1);
          await expect(row.getByRole('button')).toHaveCount(2);
          const [outer] = await boxes(row);
          const items = await boxes(row.getByRole('button'));
          const second = itemAt(items, 1, `${align} cross-axis actions`);
          near(outer.height, 80, `${align}: comparison area height`);
          expect(second.height).toBeGreaterThan(items[0].height);
          for (const item of items) {
            if (align === 'start') near(item.y, outer.y, 'Start aligns the top edges');
            if (align === 'center') {
              near(
                item.y + item.height / 2,
                outer.y + outer.height / 2,
                'Center aligns the vertical centers',
              );
            }
            if (align === 'end') near(item.bottom, outer.bottom, 'End aligns the bottom edges');
          }
          near(second.x - items[0].right, 8, `${align}: horizontal action gap`);
        }

        const wrap = preview(page, '自动换行', 'Wrapping').locator('.leaf-flex');
        await expect(wrap).toHaveCSS('flex-wrap', 'wrap');
        await expect(wrap.locator('.leaf-tag')).toHaveCount(8);
        await settleAnimations(wrap);
        const [outer] = await boxes(wrap);
        const items = await boxes(wrap.locator('.leaf-tag'));
        const rows: (typeof items)[] = [];
        for (const item of items) {
          const current = rows.at(-1);
          if (!current || Math.abs(current[0].y - item.y) >= 1) rows.push([item]);
          else current.push(item);
          expect(item.x).toBeGreaterThanOrEqual(outer.x - 1);
          expect(item.right).toBeLessThanOrEqual(outer.right + 1);
        }
        if (profile.width === 375) expect(rows.length).toBeGreaterThan(1);
        for (const [index, row] of rows.entries()) {
          near(row[0].x, outer.x, 'Each wrapped row starts at the content edge');
          for (let item = 1; item < row.length; item += 1) {
            const current = itemAt(row, item, 'Wrapped row actions');
            const previous = itemAt(row, item - 1, 'Wrapped row actions');
            near(current.x - previous.right, 16, 'Wrapped horizontal gap');
          }
          if (index > 0) {
            const previous = itemAt(rows, index - 1, 'Wrapped rows');
            const previousBottom = Math.max(...previous.map((item) => item.bottom));
            near(row[0].y - previousBottom, 12, 'Wrapped vertical gap');
          }
        }
      });

      test('Space keeps natural widths, responsive labels, preset gaps and decorative separators', async ({
        page,
      }) => {
        await visit(page, 'space');

        const basic = preview(page, '基础用法', 'Basic usage').locator('.leaf-space');
        await expect(basic.getByRole('button')).toHaveCount(3);
        await settleAnimations(basic);
        const horizontal = await boxes(basic.getByRole('button'));
        for (const [index, item] of horizontal.entries()) {
          near(item.y, horizontal[0].y, 'Basic actions share one row');
          if (index > 0) {
            const previous = itemAt(horizontal, index - 1, 'Default horizontal actions');
            near(item.x - previous.right, 16, 'Default action gap');
          }
        }

        const vertical = preview(page, '纵向排列', 'Vertical layout').locator('.leaf-space');
        await expect(vertical).toHaveCSS('flex-direction', 'column');
        await expect(vertical).toHaveCSS('align-items', 'start');
        await expect(vertical.getByRole('button')).toHaveCount(3);
        await settleAnimations(vertical);
        const stacked = await boxes(vertical.getByRole('button'));
        for (const [index, item] of stacked.entries()) {
          near(item.x, stacked[0].x, 'Vertical actions share their start edge');
          const original = itemAt(horizontal, index, 'Original horizontal actions');
          near(item.width, original.width, 'Vertical actions retain natural widths');
          if (index > 0) {
            const previous = itemAt(stacked, index - 1, 'Vertical actions');
            near(item.y - previous.bottom, 16, 'Vertical action gap');
          }
        }

        const sizes = preview(page, '间距大小', 'Spacing sizes');
        await settleAnimations(sizes);
        for (const { chinese, name, gap } of [
          { chinese: '小', name: 'Small', gap: 8 },
          { chinese: '中', name: 'Medium', gap: 16 },
          { chinese: '大', name: 'Large', gap: 24 },
        ]) {
          const geometry = await sizes
            .locator('.leaf-text')
            .filter({ hasText: new RegExp(`^${english ? name : chinese}$`) })
            .evaluate((label) => {
              const group = label.nextElementSibling;
              if (!group?.matches('.leaf-space')) throw new Error('Missing labelled spacing group');
              const rect = (node: Element) => {
                const box = node.getBoundingClientRect();
                return {
                  x: box.x,
                  y: box.y,
                  right: box.right,
                  bottom: box.bottom,
                  height: box.height,
                };
              };
              return {
                label: rect(label),
                group: rect(group),
                buttons: [...group.querySelectorAll('button')].map(rect),
              };
            });
          expect(geometry.buttons).toHaveLength(3);
          const firstButton = itemAt(geometry.buttons, 0, `${name} spacing actions`);
          for (const [index, item] of geometry.buttons.entries()) {
            near(item.y, firstButton.y, `${name}: actions share one row`);
            if (index > 0) {
              const previous = itemAt(geometry.buttons, index - 1, `${name} spacing actions`);
              near(item.x - previous.right, gap, `${name}: preset gap`);
            }
          }
          if (profile.width === 375) {
            near(geometry.label.x, geometry.group.x, `${name}: narrow label shares the start edge`);
            near(geometry.group.y - geometry.label.bottom, 16, `${name}: narrow label sits above`);
          } else {
            expect(geometry.label.right).toBeLessThan(geometry.group.x);
            near(
              geometry.label.y + geometry.label.height / 2,
              geometry.group.y + geometry.group.height / 2,
              `${name}: desktop label sits beside the actions`,
            );
          }
        }

        const split = preview(page, '分隔符', 'Separators').locator('.leaf-space');
        const separators = split.locator('.leaf-space__split');
        await expect(separators).toHaveCount(2);
        for (const separator of await separators.all()) {
          await expect(separator).toHaveAttribute('aria-hidden', 'true');
          await expect(separator).toHaveText('/');
          await expect(separator.locator('button, a, [tabindex]')).toHaveCount(0);
        }
        await expect(split.locator(':scope > *')).toHaveCount(5);
        await settleAnimations(split);
        const separated = await boxes(split.locator(':scope > *'));
        for (let index = 1; index < separated.length; index += 1) {
          const current = itemAt(separated, index, 'Separated actions');
          const previous = itemAt(separated, index - 1, 'Separated actions');
          near(current.x - previous.right, 8, 'Gap around each decorative split');
        }
      });

      test('Grid preserves equal columns, 24-column spans, offsets and responsive visibility', async ({
        page,
      }) => {
        await visit(page, 'grid');

        const basic = preview(page, '基础用法', 'Basic usage').locator('.leaf-grid');
        await expectColumns(basic, 3);
        const responsive = preview(page, '响应式列数', 'Responsive column counts').locator(
          '.leaf-grid',
        );
        await expectColumns(responsive, profile.width === 375 ? 1 : 3);

        const spans = preview(page, '栅格跨度', 'Column spans').locator('.leaf-row');
        await expect(spans.locator(':scope > .leaf-col')).toHaveCount(2);
        await settleAnimations(spans);
        const [row] = await boxes(spans);
        const [small, large] = await boxes(spans.locator(':scope > .leaf-col'));
        if (!large) throw new Error('Missing sixteen-unit grid column');
        near(small.width, row.width / 3, 'Eight-unit column occupies one third');
        near(large.width, (row.width * 2) / 3, 'Sixteen-unit column occupies two thirds');
        near(small.x, row.x, 'First span starts at the row edge');
        near(large.x, small.right, 'Spans occupy adjacent slots');
        near(small.y, large.y, 'Spans remain in the same row');
        const spanCards = await boxes(spans.locator('.leaf-card'));
        expect(spanCards).toHaveLength(2);
        const secondSpanCard = itemAt(spanCards, 1, 'Grid span cards');
        near(secondSpanCard.x - spanCards[0].right, 12, 'Row gutter between span cards');

        const offset = preview(page, '列偏移', 'Column offsets').locator('.leaf-row');
        await expect(offset.locator(':scope > .leaf-col')).toHaveCount(3);
        await expect(offset.locator('.leaf-col--offset')).toHaveAttribute('aria-hidden', 'true');
        await settleAnimations(offset);
        const [offsetRow] = await boxes(offset);
        const slots = await boxes(offset.locator(':scope > .leaf-col'));
        for (const [index, slot] of slots.entries()) {
          near(slot.width, offsetRow.width / 3, `Offset slot ${index}: eight-unit width`);
          near(
            slot.x,
            offsetRow.x + (offsetRow.width * index) / 3,
            `Offset slot ${index}: position`,
          );
          near(slot.y, offsetRow.y, `Offset slot ${index}: same row`);
        }
        const offsetCards = await boxes(offset.locator('.leaf-card'));
        expect(offsetCards).toHaveLength(2);
        const secondOffsetCard = itemAt(offsetCards, 1, 'Grid offset cards');
        near(
          secondOffsetCard.x - offsetCards[0].right,
          offsetRow.width / 3 + 12,
          'Offset leaves eight empty units plus the gutter between cards',
        );

        const visibility = preview(
          page,
          '响应式跨度与隐藏',
          'Responsive spans and visibility',
        ).locator('.leaf-row');
        const main = visibility.locator(':scope > .leaf-col').filter({
          hasText: english ? 'Main content' : '主要内容',
        });
        const supplementary = visibility.locator(':scope > .leaf-col').filter({
          hasText: english ? 'Supplement' : '补充内容',
        });
        await expect(main).toHaveCount(1);
        await expect(supplementary).toHaveCount(1);
        const expectVisibility = async (visible: boolean) => {
          await expect(main).toBeVisible();
          if (visible) await expect(supplementary).toBeVisible();
          else await expect(supplementary).toBeHidden();
          await settleAnimations(visibility);
          const [outer] = await boxes(visibility);
          const [content] = await boxes(main);
          near(content.width, outer.width / (visible ? 2 : 1), 'Responsive main-column width');
          near(content.x, outer.x, 'Responsive main column begins at the row edge');
          if (visible) {
            const [extra] = await boxes(supplementary);
            near(extra.width, outer.width / 2, 'Supplementary content takes half the row');
            near(extra.x, content.right, 'Responsive columns occupy adjacent slots');
            near(extra.y, content.y, 'Responsive content shares one row');
          } else {
            await expect(supplementary).toHaveCSS('display', 'none');
          }
        };
        await expectVisibility(profile.width === 1280);

        if (profile.width === 1280) {
          // These three breakpoints cover distinct column-count and visibility transitions.
          for (const point of [
            { width: 576, columns: 2, visible: false },
            { width: 768, columns: 2, visible: true },
            { width: 992, columns: 3, visible: true },
          ]) {
            await page.setViewportSize({ width: point.width, height: 900 });
            await expectColumns(responsive, point.columns);
            await expectVisibility(point.visible);
          }
          await page.setViewportSize({ width: profile.width, height: 900 });
        }
      });
    });
  }
}
