import { expect, type Locator, test } from '@playwright/test';
import { settleAnimations } from './helpers/motion';

async function bounds(locator: Locator) {
  return locator.evaluate((node) => {
    const { x, y, width, height } = node.getBoundingClientRect();
    return { x, y, width, height };
  });
}

for (const theme of ['light', 'dark']) {
  for (const direction of ['ltr', 'rtl']) {
    test(`${theme} ${direction} aligns wide triggers and contains gradient controls and outlines`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: 375, height: 820 });
      await page.goto(
        `/?fixture=color-picker&theme=${theme}${direction === 'rtl' ? '&rtl=1' : ''}`,
      );
      for (const name of ['wide solid color', 'wide gradient color']) {
        const trigger = page.getByRole('button', { name, exact: true });
        const button = await bounds(trigger);
        const swatch = await bounds(trigger.locator('.leaf-color-picker__swatch'));
        const inset =
          direction === 'rtl'
            ? button.x + button.width - swatch.x - swatch.width
            : swatch.x - button.x;
        expect(inset).toBeCloseTo(5, 0);
      }
      for (const name of ['gradient color', 'narrow gradient color']) {
        await page.getByRole('button', { name, exact: true }).click();
        const panel = page.locator('.leaf-color-picker__gradient[data-state="open"]');
        await expect(panel).toHaveAttribute('data-positioned', 'true');
        await settleAnimations(panel);
        const viewport = panel.locator(':scope > .leaf-floating__viewport');
        const view = await bounds(viewport);
        const angle = panel.getByRole('spinbutton', { name: 'Gradient angle', exact: true });
        await angle.fill('270');
        await angle.press('Enter');
        await expect(angle).toHaveValue('270');
        const input = await bounds(panel.locator('.leaf-input-number'));
        expect(input.x).toBeGreaterThanOrEqual(view.x);
        expect(input.x + input.width).toBeLessThanOrEqual(view.x + view.width);
        const stop = panel.locator('.leaf-color-picker__stops > button').first();
        await stop.focus();
        const outline = await stop.evaluate((node) => {
          const style = getComputedStyle(node);
          return Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);
        });
        const selected = await bounds(stop);
        expect(selected.x - outline).toBeGreaterThanOrEqual(view.x);
        expect(selected.x + selected.width + outline).toBeLessThanOrEqual(view.x + view.width);
        await expect
          .poll(() => viewport.evaluate((node) => node.scrollWidth - node.clientWidth))
          .toBe(0);
        await expect
          .poll(() => viewport.evaluate((node) => node.scrollHeight - node.clientHeight))
          .toBe(0);
        await panel.screenshot({ path: testInfo.outputPath(`${name.replaceAll(' ', '-')}.png`) });
        await page.keyboard.press('Escape');
      }
    });

    test(`${theme} ${direction} keeps color handles and preset outlines inside the viewport`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: 375, height: 820 });
      await page.goto(
        `/?fixture=color-picker&theme=${theme}${direction === 'rtl' ? '&rtl=1' : ''}`,
      );
      await page.getByRole('button', { name: 'hex color', exact: true }).click();
      const panel = page.locator('.leaf-color-picker__panel[data-state="open"]');
      await expect(panel).toHaveAttribute('data-positioned', 'true');
      await settleAnimations(panel);
      await expect(panel).toHaveCSS('scale', '1');
      await expect(panel).toHaveCSS('translate', '0px');
      const area = panel.getByRole('slider', { name: 'Saturation / Brightness' });
      await area.focus();
      await area.press('End');
      await area.press('ArrowDown');
      const viewport = panel.locator(':scope > .leaf-floating__viewport');
      await expect
        .poll(() => viewport.evaluate((node) => node.scrollWidth - node.clientWidth))
        .toBe(0);
      const handle = await bounds(panel.locator('.leaf-color-picker__handle'));
      const view = await bounds(viewport);
      expect(handle.x + handle.width).toBeLessThanOrEqual(view.x + view.width);
      const preset = panel.locator('.leaf-color-picker__preset').last();
      await preset.click();
      const outline = await preset.evaluate((node) => {
        const style = getComputedStyle(node);
        return Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);
      });
      const swatch = await bounds(preset);
      const visible = await bounds(viewport);
      expect(swatch.y + swatch.height + outline).toBeLessThanOrEqual(visible.y + visible.height);
      await expect(panel.locator('.leaf-scrollbar__bar--horizontal').first()).toHaveCount(0);
      await panel.screenshot({ path: testInfo.outputPath('color-picker.png') });
    });
  }

  test(`${theme} stabilizes format widths and popup position while opacity precision changes`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=color-picker&theme=${theme}`);
    for (const [format, width] of [
      ['hex', 144],
      ['rgb', 272],
      ['hsl', 296],
    ] as const) {
      const trigger = page.getByRole('button', { name: `${format} color`, exact: true });
      const shell = page.locator('.leaf-color-picker').filter({ has: trigger });
      await expect(shell).toHaveCSS('width', `${width}px`);
      await trigger.click();
      const panel = page.locator('.leaf-color-picker__panel[data-state="open"]');
      await expect(panel).toHaveAttribute('data-positioned', 'true');
      await settleAnimations(panel);
      await expect(panel).toHaveCSS('scale', '1');
      await expect(panel).toHaveCSS('translate', '0px');
      const before = await bounds(shell);
      const popupBefore = await bounds(panel);
      const alpha = panel.getByRole('slider', { name: 'Opacity', exact: true });
      await alpha.focus();
      for (const key of ['Home', 'ArrowRight', 'End', 'ArrowLeft']) {
        await alpha.press(key);
        expect(await bounds(shell)).toEqual(before);
        expect(await bounds(panel)).toEqual(popupBefore);
      }
      const text = shell.locator('.leaf-color-picker__text');
      expect(await text.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
      await page.keyboard.press('Escape');
    }
    for (const [label, width] of [
      ['swatch color', 28],
      ['gradient color', 160],
      ['custom width color', 200],
      ['constrained color', 180],
    ] as const) {
      await expect(
        page.locator('.leaf-color-picker').filter({
          has: page.getByRole('button', { name: label, exact: true }),
        }),
      ).toHaveCSS('width', `${width}px`);
    }
  });
}

test('format tabs switch with keyboard navigation without remounting the color input', async ({
  page,
}) => {
  await page.goto('/?fixture=color-picker');
  await page.getByRole('button', { name: 'hex color', exact: true }).click();
  const panel = page.locator('.leaf-color-picker__panel[data-state="open"]');
  const input = panel.getByRole('textbox', { name: 'Color value' });
  const original = await input.elementHandle();
  await panel.getByRole('tab', { name: 'HEX', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(panel.getByRole('tab', { name: 'RGB', exact: true })).toBeFocused();
  await expect(input).toHaveValue(/^rgba\(/);
  await expect(
    page.locator('.leaf-color-picker').filter({
      has: page.getByRole('button', { name: 'hex color', exact: true }),
    }),
  ).toHaveCSS('width', '272px');
  await page.keyboard.press('End');
  await expect(panel.getByRole('tab', { name: 'HSL', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(input).toHaveValue(/^hsla\(/);
  expect(await input.evaluate((node, previous) => node === previous, original)).toBe(true);
});
