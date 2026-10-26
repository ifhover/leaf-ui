import { expect, test } from '@playwright/test';

for (const scenario of [
  { name: 'light', query: '', width: 1100 },
  { name: 'dark', query: '?theme=dark', width: 1100 },
  { name: 'narrow RTL', query: '?rtl=1', width: 375 },
]) {
  test(`carousel soft arrows stay centered on the viewport: ${scenario.name}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: scenario.width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${scenario.query}`);
    const carousel = page.getByRole('region', { name: 'Highlights' });
    await carousel.scrollIntoViewIfNeeded();
    const viewport = carousel.locator('.leaf-carousel__viewport');
    const arrows = carousel.locator('.leaf-carousel__arrow');
    const viewportBox = await viewport.boundingBox();
    if (!viewportBox) throw new Error('Carousel viewport must have a layout box');
    for (const arrow of await arrows.all()) {
      const box = await arrow.boundingBox();
      if (!box) throw new Error('Carousel arrow must have a layout box');
      expect(
        Math.abs(box.y + box.height / 2 - (viewportBox.y + viewportBox.height / 2)),
      ).toBeLessThan(1);
      await expect(arrow).toHaveCSS('border-top-width', '0px');
      await expect(arrow).toHaveCSS('box-shadow', 'none');
      const background = await arrow.evaluate((element) => {
        const probe = document.createElement('span');
        probe.style.backgroundColor = 'var(--leaf-color-surface-muted)';
        element.append(probe);
        const color = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return color;
      });
      await expect(arrow).toHaveCSS('background-color', background);
      await arrow.hover();
      expect(await arrow.boundingBox()).toEqual(box);
      await page.mouse.down();
      expect(await arrow.boundingBox()).toEqual(box);
      await page.mouse.up();
    }
    await carousel.locator('.leaf-carousel__arrow--next').click();
    await expect(carousel.getByRole('button', { name: 'Slide 2', exact: true })).toBeVisible();
    await carousel.locator('.leaf-carousel__arrow--previous').click();
    await expect(carousel.getByRole('button', { name: 'Slide 1', exact: true })).toBeVisible();
    await carousel.screenshot({ path: testInfo.outputPath('carousel.png') });
  });
}
