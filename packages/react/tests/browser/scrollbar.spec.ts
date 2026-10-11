import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=scrollbar');
});

test('overlay tracks fade on hover, do not consume space and support dragging and track clicks', async ({
  page,
}) => {
  const viewport = page.getByRole('region', { name: 'Both axes', exact: true });
  const root = viewport.locator('..');
  const vertical = root.getByRole('scrollbar', { name: 'Vertical scrollbar' });
  const horizontal = root.getByRole('scrollbar', { name: 'Horizontal scrollbar' });
  await expect(vertical).toBeAttached();
  await page.mouse.move(0, 0);
  await expect(vertical.locator('..')).toHaveCSS('opacity', '0', { timeout: 15_000 });
  expect(
    await viewport.evaluate((node) => node.clientWidth === node.getBoundingClientRect().width),
  ).toBe(true);
  await viewport.hover();
  await expect(vertical.locator('..')).toHaveCSS('opacity', '1', { timeout: 15_000 });
  expect(
    await vertical.locator('..').evaluate((node) => getComputedStyle(node).transitionDuration),
  ).not.toBe('0s');
  const box = await vertical.boundingBox();
  if (!box) throw new Error('Missing vertical track');
  await page.mouse.move(box.x + box.width / 2, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 80);
  await page.mouse.up();
  await expect(vertical.locator('..')).toHaveCSS('outline-style', 'none');
  await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(200);
  const horizontalBox = await horizontal.boundingBox();
  if (!horizontalBox) throw new Error('Missing horizontal track');
  await page.mouse.click(horizontalBox.x + horizontalBox.width * 0.8, horizontalBox.y + 4);
  await expect.poll(() => viewport.evaluate((node) => node.scrollLeft)).toBeGreaterThan(100);
  await page.getByRole('button', { name: 'Resize container' }).focus();
  await page.mouse.move(0, 0);
  await expect(vertical.locator('..')).toHaveCSS('opacity', '0', { timeout: 15_000 });
});

test('keyboard scroll commands, resizing and dynamic content keep the thumb in sync', async ({
  page,
}) => {
  const viewport = page.getByRole('region', { name: 'Both axes', exact: true });
  const vertical = viewport.locator('..').getByRole('scrollbar', { name: 'Vertical scrollbar' });
  await vertical.focus();
  await page.keyboard.press('End');
  await expect(vertical.locator('..')).toHaveCSS('outline-style', 'solid');
  await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBe(1000);
  await page.keyboard.press('Home');
  await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBe(0);
  await page.keyboard.press('PageDown');
  await expect
    .poll(() => viewport.evaluate((node) => Math.abs(node.scrollTop - 200)))
    .toBeLessThan(1);
  const horizontalThumb = viewport
    .locator('..')
    .locator('.leaf-scrollbar__bar--horizontal .leaf-scrollbar__thumb');
  await expect(horizontalThumb).toHaveCSS('width', /338\./);
  await page.getByRole('button', { name: 'Resize container' }).click();
  await expect(viewport).toHaveCSS('width', '360px');
  await expect(horizontalThumb).toHaveCSS('width', /137\./, { timeout: 15_000 });
  const dynamic = page.getByRole('region', { name: 'Dynamic content' });
  const track = dynamic.locator('..').getByRole('scrollbar');
  await expect(track).toHaveCount(0);
  await page.getByRole('button', { name: 'Add content' }).click();
  await expect(track).toHaveCount(1);
  await expect(dynamic).toHaveCSS('height', '180px');
  await page.getByRole('button', { name: 'Reset content' }).click();
  await expect(track).toHaveCount(0);
  await expect(dynamic).toHaveCSS('height', '80px');
});

test('wheel scrolling chains to the page without overflow', async ({ page }) => {
  const fits = page.getByRole('region', { name: 'Fits content' });
  await fits.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await fits.hover();
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 260);
  await expect
    .poll(() => page.evaluate(() => window.scrollY), {
      message: `Wheel should scroll the page from ${before}`,
    })
    .toBeGreaterThan(before + 30);
});

test('wheel scrolling stays inside an overflowing viewport', async ({ page }) => {
  const viewport = page.getByRole('region', { name: 'Both axes', exact: true });
  await viewport.scrollIntoViewIfNeeded();
  await viewport.evaluate((node) => {
    node.scrollTop = 0;
  });
  await viewport.hover();
  const pageBefore = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(20);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageBefore);
});

test('wheel scrolling chains to the page at the scroll boundary', async ({ page }) => {
  const viewport = page.getByRole('region', { name: 'Both axes', exact: true });
  await viewport.scrollIntoViewIfNeeded();
  await viewport.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await viewport.hover();
  const pageBefore = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 260);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(pageBefore + 50);
});

test('percentage sizes resolve once without leaving empty space around the viewport', async ({
  page,
}) => {
  for (const name of ['Percentage height', 'Percentage maximum height']) {
    const viewport = page.getByRole('region', { name, exact: true });
    await expect(viewport.locator('..')).toHaveCSS('height', '150px');
    await expect(viewport).toHaveCSS('height', '150px');
    await expect(viewport.locator('..').getByRole('scrollbar')).toHaveCount(1);
  }
});

test('RTL, hidden tracks and ScrollArea refs work with BackTop and InfiniteScroll', async ({
  page,
}) => {
  const rtl = page.getByRole('region', { name: 'RTL horizontal' });
  const horizontal = rtl.locator('..').getByRole('scrollbar');
  await horizontal.focus();
  await page.keyboard.press('End');
  await expect.poll(() => rtl.evaluate((node) => node.scrollLeft)).toBeLessThan(-100);
  const hidden = page.getByRole('region', { name: 'Hidden tracks' });
  await expect(hidden.locator('..').getByRole('scrollbar')).toHaveCount(0);
  await hidden.evaluate((node) => {
    node.scrollTop = 80;
  });
  expect(await hidden.evaluate((node) => node.scrollTop)).toBe(80);
  const backTop = page.getByRole('region', { name: 'BackTop target' });
  await backTop.evaluate((node) => {
    node.scrollTop = 140;
  });
  await page.getByRole('button', { name: 'Back to top', exact: true }).click();
  await expect.poll(() => backTop.evaluate((node) => node.scrollTop)).toBe(0);
  const infinite = page.getByRole('region', { name: 'Infinite target' });
  await infinite.scrollIntoViewIfNeeded();
  await infinite.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await expect(infinite.getByText('Loaded 12', { exact: true })).toBeAttached({ timeout: 15_000 });
});

test('scroll regions and custom tracks pass axe in both themes and honor reduced motion', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    await page.goto(`/?fixture=scrollbar&theme=${theme}`);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addScriptTag({ content: axe.source });
    await expect(page.locator('.leaf-scrollbar__bar').first()).toHaveCSS(
      'transition-duration',
      '0s',
    );
    const violations = await page.evaluate(async () =>
      (
        await (window as unknown as { axe: typeof axe }).axe.run(
          document.querySelector('main') as HTMLElement,
          { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } },
        )
      ).violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })),
    );
    expect(violations).toEqual([]);
  }
});
