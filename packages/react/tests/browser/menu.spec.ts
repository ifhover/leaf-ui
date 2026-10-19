import { expect, test } from '@playwright/test';
import axe from 'axe-core';

for (const suffix of ['', '&theme=dark', '&compact=1', '&rtl=1']) {
  test(`group titles, collapsed navigation and custom controls ${suffix || 'default'}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(`/?fixture=menu${suffix}`);
    const menu = page.getByRole('navigation', { name: 'Grouped navigation' });
    const home = menu.getByRole('menuitem', { name: 'Home' });
    const settings = menu.getByRole('menuitem', { name: 'Settings' });
    await expect(menu.getByRole('group', { name: 'Workspace' })).toBeVisible();
    await home.focus();
    await page.keyboard.press('ArrowDown');
    await expect(settings).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(settings).toHaveAttribute('aria-current', 'page');
    const custom = page.getByRole('group', { name: 'Quick create' });
    const title = custom.locator('.leaf-menu__group-label');
    await expect(title).toBeVisible();
    expect(await title.evaluate((node) => getComputedStyle(node).fontSize)).toBe(
      await menu
        .locator('.leaf-menu__group-label')
        .first()
        .evaluate((node) => getComputedStyle(node).fontSize),
    );
    const input = custom.getByRole('textbox');
    expect((await title.boundingBox())?.x).toBe(
      (await custom.locator('.leaf-input').boundingBox())?.x,
    );
    await input.fill('New project');
    await input.press('Home');
    await expect(input).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(custom.getByRole('status')).toHaveText('Project created');
    await page.getByRole('button', { name: 'Toggle collapsed' }).click();
    await expect(menu.locator('.leaf-menu__group-label').first()).toBeHidden();
    await expect(title).toBeVisible();
    await expect(home).toBeVisible();
    await expect(settings).toHaveAttribute('aria-current', 'page');
    await page.getByRole('button', { name: 'Toggle collapsed' }).click();
    await expect(menu.locator('.leaf-menu__group-label').first()).toBeVisible();
    await expect(input).toHaveValue('New project');
    await expect(settings.locator('.leaf-menu__label')).toHaveCSS('opacity', '1');
    await expect(menu).toHaveCSS('width', '240px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const result = await (window as unknown as { axe: typeof axe }).axe.run(
        document.querySelector('main') as HTMLElement,
      );
      return result.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => node.target),
      }));
    });
    expect(violations).toEqual([]);
  });
}

for (const collapsed of [false, true]) {
  for (const suffix of ['', '&theme=dark', '&compact=1', '&rtl=1']) {
    test(`navigation popup ${collapsed ? 'sidebar' : 'horizontal'} ${suffix || 'default'}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(`/?fixture=menu&popup=1${collapsed ? '&collapsed=1' : ''}${suffix}`);
      const root = page.getByRole('navigation', { name: 'Popup navigation' });
      const trigger = root.getByRole('menuitem', { name: 'Resources' });
      await trigger.click();
      const popup = page.locator('.leaf-menu__popup').first();
      const selected = popup.getByRole('menuitem', { name: 'Components' });
      await expect(selected).toHaveAttribute('aria-current', 'page');
      await expect(selected).toHaveCSS('text-decoration-line', 'none');
      await expect(trigger).toHaveAttribute('data-selected', 'true');
      await expect(popup).toHaveAttribute('data-positioned', 'true');
      await expect(popup).toHaveCSS('border-top-width', '1px');
      await expect(popup).toHaveCSS('border-top-left-radius', '16px');
      const side = await popup.getAttribute('data-side');
      expect(side).toBe(collapsed ? (suffix.includes('rtl') ? 'left' : 'right') : 'bottom');
      if (collapsed) await expect(popup.locator('.leaf-menu__popup-title')).toHaveText('Resources');
      await expect(popup.locator('.leaf-menu__popup-icon svg').first()).toHaveCSS('width', '18px');
      const expectSelectedBackground = () =>
        expect
          .poll(async () => {
            const background = await root
              .locator('.leaf-menu__indicator')
              .evaluate((node) => getComputedStyle(node).backgroundColor);
            return selected.evaluate(
              (node, background) => getComputedStyle(node).backgroundColor === background,
              background,
            );
          })
          .toBe(true);
      await selected.hover();
      await expectSelectedBackground();
      await selected.focus();
      await expectSelectedBackground();
      await expect.poll(async () => Math.round((await popup.boundingBox())?.width ?? 0)).toBe(208);
      const box = await popup.boundingBox();
      expect(box && box.x >= 0 && box.x + box.width <= 375).toBe(true);
      await page.keyboard.press('ArrowDown');
      await expect(popup.getByRole('menuitem', { name: 'Themes' })).toBeFocused();
      await expect(selected).toHaveAttribute('aria-current', 'page');
      await expect(selected).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(popup).toHaveCSS('opacity', '1');
      await page.addScriptTag({ content: axe.source });
      const violations = await popup.evaluate(async (node) =>
        (await (window as unknown as { axe: typeof axe }).axe.run(node)).violations.map(
          (violation) => violation.id,
        ),
      );
      expect(violations).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath('popup.png') });
      await page.keyboard.press('ArrowDown');
      await expect(popup.getByRole('menuitem', { name: 'More' })).toBeFocused();
      await page.keyboard.press(suffix.includes('rtl') ? 'ArrowLeft' : 'ArrowRight');
      const examples = page.getByRole('menuitem', { name: 'Examples' });
      await expect(examples).toBeFocused();
      await expect(page.locator('.leaf-menu__popup')).toHaveCount(2);
      await page.keyboard.press('Enter');
      await expect(trigger).toBeFocused();
      await trigger.click();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  }
}

test('centered collapsed navigation falls back below when neither side fits', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/?fixture=menu&popup=1&collapsed=1&center=1');
  await page.getByRole('menuitem', { name: 'Resources' }).click();
  const popup = page.locator('.leaf-menu__popup');
  await expect(popup).toHaveAttribute('data-side', 'bottom');
  await expect
    .poll(async () => {
      const box = await popup.boundingBox();
      return Boolean(box && box.x >= 0 && box.x + box.width <= 375);
    })
    .toBe(true);
});
