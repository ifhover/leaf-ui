import { expect, test } from '@playwright/test';
import axe from 'axe-core';

for (const english of [false, true]) {
  for (const suffix of ['', '&theme=dark', '&compact=1', '&theme=dark&compact=1', '&rtl=1']) {
    test(`compact submenu rows and trailing elements ${english ? 'en' : 'zh'} ${suffix || 'default'}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: english ? 375 : 1100, height: 800 });
      await page.goto(`/?fixture=menu&basic=1${english ? '&english=1' : ''}${suffix}`);
      const menu = page.getByRole('navigation');
      const parent = menu.getByRole('menuitem', {
        name: english ? 'Projects' : '项目管理',
        exact: true,
      });
      const selected = menu.getByRole('menuitem', {
        name: english ? 'Design resources' : '设计资源',
        exact: true,
      });
      const release = menu.getByRole('menuitem', {
        name: english ? 'Releases New' : '发布管理 新',
        exact: true,
      });
      const home = menu.getByRole('menuitem', {
        name: english ? 'Overview' : '工作台',
        exact: true,
      });
      const team = menu.getByRole('menuitem', {
        name: english ? 'Team members 12' : '团队成员 12',
        exact: true,
      });
      await expect(parent).not.toHaveAttribute('data-selected');
      await expect(parent).not.toHaveAttribute('data-active-parent');
      await expect(parent).not.toHaveAttribute('aria-current');
      await expect(selected).toHaveAttribute('aria-current', 'page');
      await expect(release).toHaveCSS('height', suffix.includes('compact') ? '26px' : '32px');
      await expect(menu.getByText('Beta', { exact: true })).toHaveCount(0);
      for (const item of [selected, release]) {
        await expect(item.locator('.leaf-menu__icon')).toHaveCount(0);
        await expect
          .poll(async () => {
            const parentLabel = await parent.locator('.leaf-menu__label').boundingBox();
            const childLabel = await item.locator('.leaf-menu__label').boundingBox();
            if (!parentLabel || !childLabel) return Number.POSITIVE_INFINITY;
            return suffix.includes('rtl')
              ? Math.abs(parentLabel.x + parentLabel.width - childLabel.x - childLabel.width)
              : Math.abs(parentLabel.x - childLabel.x);
          })
          .toBeLessThan(1);
      }
      const muted = await menu.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-color-text-muted').trim(),
      );
      const ink = await menu.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-color-primary-ink-active').trim(),
      );
      const resolveColor = (color: string) =>
        menu.evaluate((node, color) => {
          const probe = document.createElement('span');
          probe.style.color = color;
          node.append(probe);
          const result = getComputedStyle(probe).color;
          probe.remove();
          return result;
        }, color);
      await expect(release).toHaveCSS('color', await resolveColor(muted));
      for (const item of [home, release, selected]) {
        const before = await item.evaluate((node) => ({
          background: getComputedStyle(node).backgroundColor,
          rect: node.getBoundingClientRect().toJSON(),
        }));
        await item.hover();
        await expect(item).toHaveCSS('color', await resolveColor(ink));
        await expect(item).toHaveCSS('background-color', before.background);
        await page.mouse.down();
        await expect(item).toHaveCSS('background-color', before.background);
        expect(await item.evaluate((node) => node.getBoundingClientRect().toJSON())).toEqual(
          before.rect,
        );
        await page.mouse.up();
        await expect(item).toHaveAttribute('aria-current', 'page');
      }
      await expect(team.locator('.leaf-tag')).toHaveText('12');
      await expect(parent).not.toHaveAttribute('data-selected');
      await expect(menu.locator('.leaf-menu__indicator')).toHaveAttribute('data-visible', 'true');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.addScriptTag({ content: axe.source });
      expect(
        await menu.evaluate(async (node) =>
          (await (window as unknown as { axe: typeof axe }).axe.run(node)).violations.map(
            (item) => item.id,
          ),
        ),
      ).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath('basic.png') });
    });
  }
}

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
      await expect(trigger).not.toHaveAttribute('data-selected');
      await expect(trigger).not.toHaveAttribute('data-active-parent');
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
      const themes = popup.getByRole('menuitem', { name: 'Themes' });
      await expect(themes).toBeFocused();
      await expect(themes).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(popup.locator('.leaf-dropdown__highlight')).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)',
      );
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
