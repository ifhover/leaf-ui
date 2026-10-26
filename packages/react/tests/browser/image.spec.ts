import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=image');
});

for (const width of [1280, 375]) {
  test(`boundary navigation retains keyboard focus and Escape at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const trigger = page.getByRole('button', { name: 'Preview image: Open gallery' });
    for (const boundary of [
      { start: 19, end: 20, action: 'Next image' },
      { start: 2, end: 1, action: 'Previous image' },
    ]) {
      await trigger.click();
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
      await page
        .getByRole('button', {
          name: `View image ${boundary.start}: Landscape ${boundary.start}`,
          exact: true,
        })
        .click();
      await expect(page.locator('.leaf-image-viewer__count')).toHaveText(`${boundary.start} / 20`);
      const navigation = page.getByRole('button', { name: boundary.action, exact: true });
      await navigation.click();
      await expect(navigation).toBeDisabled();
      await expect(page.locator('.leaf-image-viewer__count')).toHaveText(`${boundary.end} / 20`);
      await expect(page.locator('.yarl__container')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  });

  test(`responsive placeholders and pointer cursor at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const images = page.locator('.leaf-image');
    await expect(images.nth(0)).toHaveAttribute('data-state', 'empty');
    await expect(images.nth(0).locator('.leaf-image__fallback > span')).toBeVisible();
    await expect(images.nth(1).locator('.leaf-image__fallback > span')).toBeHidden();
    await expect(images.nth(2).locator('.leaf-image__fallback > span')).toBeHidden();
    await expect(images.nth(3)).toHaveAttribute('data-state', 'error');
    await expect(images.nth(3).locator('.leaf-image__fallback > span')).toBeVisible();
    await expect(images.nth(4).locator('.leaf-image__fallback > span')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Preview image: Open gallery' })).toHaveCSS(
      'cursor',
      'pointer',
    );
    await images.nth(0).evaluate((node: HTMLElement) => {
      node.style.width = '40px';
      node.style.height = '40px';
    });
    await expect(images.nth(0).locator('.leaf-image__fallback > span')).toBeHidden();
    await page.screenshot({ path: testInfo.outputPath('placeholders.png') });
  });

  test(`thumbnail arrows scroll the viewport and selection has no inset at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const trigger = page.getByRole('button', { name: 'Preview image: Open gallery' });
    await trigger.click();
    const strip = page.locator('.leaf-image-viewer__strip .leaf-scrollbar__viewport');
    // The lazy viewer module can take several seconds to initialize in Windows WebKit.
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
    await expect
      .poll(() => strip.evaluate((node) => node.scrollWidth - node.clientWidth))
      .toBeGreaterThan(200);
    await page.getByRole('button', { name: 'Scroll thumbnails forward' }).click();
    await expect.poll(() => strip.evaluate((node) => node.scrollLeft)).toBeGreaterThan(50);
    await page.getByRole('button', { name: 'Scroll thumbnails backward' }).click();
    await expect.poll(() => strip.evaluate((node) => node.scrollLeft)).toBeLessThan(1);
    const second = page.getByRole('button', { name: 'View image 2: Landscape 2', exact: true });
    await second.click();
    await expect(second).toHaveAttribute('aria-current', 'true');
    await expect(second).toHaveCSS('padding', '0px');
    await expect(second).toHaveCSS('border-color', 'rgb(255, 255, 255)');
    await page.screenshot({ path: testInfo.outputPath('gallery.png') });
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });
}

test('imperative preview rotates, pans and distinguishes fitted from original pixel size', async ({
  page,
}, testInfo) => {
  await page.getByRole('button', { name: 'Preview gallery', exact: true }).click();
  await expect(page.locator('.leaf-image-viewer__count')).toHaveText('2 / 20');
  const actual = page.getByRole('button', { name: 'Actual size (1:1)' });
  await actual.click();
  await expect(page.getByRole('button', { name: 'Fit to window' })).toHaveText('100%');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Fit to window' })).toHaveText('125%');
  const active = page.locator('.yarl__slide_current img');
  const wrapper = active.locator('..');
  await expect.poll(() => wrapper.evaluate((node) => node.getAnimations().length)).toBe(0);
  const transform = await wrapper.getAttribute('style');
  await page.mouse.move(640, 350);
  await page.mouse.down();
  await page.mouse.move(740, 390, { steps: 5 });
  await page.mouse.up();
  await expect(wrapper).not.toHaveAttribute('style', transform ?? '');
  await page.getByRole('button', { name: 'Rotate clockwise', exact: true }).click();
  await expect(active).toHaveCSS('rotate', '90deg');
  await page.getByRole('button', { name: 'Rotate counterclockwise', exact: true }).click();
  await expect(active).toHaveCSS('rotate', '0deg');
  await page.getByRole('button', { name: 'Fit to window' }).click();
  await page.getByRole('button', { name: 'Rotate clockwise', exact: true }).click();
  await expect(active).toHaveCSS('rotate', '90deg');
  const bounds = await active.boundingBox();
  expect(bounds?.height).toBeLessThan(700);
  await page.screenshot({ path: testInfo.outputPath('rotated.png') });
});

test('viewer keeps the header minimal and closes when the mock backdrop is clicked', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Preview gallery', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Landscape 2', { exact: true })).toHaveCount(0);
  const container = page.locator('.yarl__container');
  const bounds = await container.boundingBox();
  if (!bounds) throw new Error('Missing lightbox container');
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + 8);
  await expect(dialog).toBeHidden();
});

test('small originals zoom to 2000%, zoom out below fit, and reduced motion disables animations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Preview small image' }).click();
  // Native SVG decoding is noticeably slower in the Windows WebKit runner.
  await expect
    .poll(
      () =>
        page
          .locator('.yarl__slide_current img')
          .evaluate((node: HTMLImageElement) => node.naturalWidth),
      { timeout: 15000 },
    )
    .toBe(80);
  const level = page.getByRole('button', { name: 'Fit to window' });
  const zoomIn = page.getByRole('button', { name: 'Zoom in', exact: true });
  await expect(zoomIn).toBeEnabled();
  await expect(level).toHaveText('100%');
  for (let step = 0; step < 20 && (await zoomIn.isEnabled()); step++) await zoomIn.click();
  await expect(level).toHaveText('2000%');
  await expect(zoomIn).toBeDisabled();
  await level.click();
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await expect(level).toHaveText('80%');
  await page.getByRole('button', { name: 'Rotate clockwise', exact: true }).click();
  await expect(page.locator('.yarl__slide_current img')).toHaveCSS('transition-duration', '0s');
});

test('image placeholders and preview controls pass accessibility checks @a11y', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    await page.goto(`/?fixture=image&theme=${theme}`);
    await page.addScriptTag({ content: axe.source });
    expect(
      await page.evaluate(
        async () => (await (window as unknown as { axe: typeof axe }).axe.run('main')).violations,
      ),
    ).toEqual([]);
    await page.getByRole('button', { name: 'Preview gallery', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Actual size (1:1)' })).toBeEnabled();
    await expect(page.locator('.yarl__portal')).toHaveCSS('opacity', '1');
    expect(
      await page.evaluate(
        async () =>
          (await (window as unknown as { axe: typeof axe }).axe.run('.leaf-image-viewer__lightbox'))
            .violations,
      ),
    ).toEqual([]);
    await page.keyboard.press('Escape');
  }
});
