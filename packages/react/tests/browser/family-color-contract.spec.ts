import { readability } from '@ctrl/tinycolor';
import { expect, test } from '@playwright/test';
import { paintColor as paint } from './helpers/paint';

for (const theme of ['light', 'dark']) {
  for (const name of ['Default', 'Nested']) {
    test(`${theme} ${name} uses shared families across portals`, async ({ page }) => {
      await page.goto(`/?fixture=family-color-contract&theme=${theme}`);
      const section = page.getByRole('region', { name, exact: true });
      const tabTrack = section.locator('.leaf-tabs__list');
      const tabPill = section.locator('.leaf-tabs__indicator');
      const trackColor = await paint(tabTrack);
      const pillColor = await paint(tabPill);
      const handle = section.getByRole('separator', { name: 'Resize panel 1' });
      const restingHandle = await handle.evaluate((node) => getComputedStyle(node).backgroundColor);
      await handle.hover();
      await expect(handle).not.toHaveCSS('background-color', restingHandle);
      await handle.focus();
      await expect(handle).toHaveCSS('outline-style', 'solid');
      expect(
        readability(await paint(handle, 'outlineColor'), await paint(handle)),
      ).toBeGreaterThanOrEqual(3);
      const toggle = section.locator('.leaf-switch');
      const input = section.getByRole('switch', { name: `${name} switch`, exact: true });
      for (const checked of [false, true]) {
        await input.setChecked(checked);
        expect(
          readability(
            await paint(toggle.locator('.leaf-switch__thumb')),
            await paint(toggle.locator('.leaf-switch__track')),
          ),
        ).toBeGreaterThanOrEqual(3);
        const thumb = toggle.locator('.leaf-switch__thumb');
        expect(readability(await paint(thumb, 'color'), await paint(thumb))).toBeGreaterThanOrEqual(
          3,
        );
      }

      await section.getByRole('button', { name: `${name} color`, exact: true }).click();
      const formats = page.locator('.leaf-color-picker__formats');
      await expect(formats).toBeVisible();
      expect(await paint(formats.locator('.leaf-tabs__list'))).toBe(trackColor);
      expect(await paint(formats.locator('.leaf-tabs__indicator'))).toBe(pillColor);
      const value = page.locator('.leaf-color-picker__input');
      await value.focus();
      await expect(value).toHaveCSS('outline-style', 'none');
      const fieldBorder = await value.evaluate((node) => {
        const style = getComputedStyle(node);
        const probe = document.createElement('span');
        probe.style.color = 'var(--leaf-color-primary)';
        node.parentElement?.append(probe);
        const primary = getComputedStyle(probe).color;
        probe.remove();
        return { border: style.borderTopColor, primary };
      });
      expect(fieldBorder.border).toBe(fieldBorder.primary);
      await page.keyboard.press('Escape');

      await section.getByRole('button', { name: `${name} dialog`, exact: true }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      const canvas = await paint(dialog);
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await section.getByRole('combobox', { name: `${name} date`, exact: true }).click();
      const datePanel = page.locator('.leaf-date-picker__panel');
      await expect(datePanel).toBeVisible();
      expect(await paint(datePanel)).toBe(canvas);
      await page.keyboard.press('Escape');

      // Time columns mark the saved value with a check, like Select, not a brand-tinted block.
      await section.getByRole('combobox', { name: `${name} time`, exact: true }).click();
      const savedTime = page.locator('.leaf-time-picker__column [aria-selected="true"]').first();
      await expect(savedTime.locator('.leaf-time-picker__check')).toHaveCSS('opacity', '1');
      await expect(savedTime).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(page.locator('.leaf-time-picker__selection')).toHaveCount(0);
      await page.keyboard.press('Escape');

      const menuDanger = section.getByRole('menuitem', { name: 'Delete', exact: true });
      await menuDanger.hover();
      const dangerBackground = await paint(menuDanger, 'backgroundColor', '::before');
      expect(dangerBackground).not.toBe('rgba(0, 0, 0, 0)');
      await section.getByRole('button', { name: `${name} dropdown`, exact: true }).click();
      const dropdownDanger = page
        .locator('.leaf-dropdown')
        .getByRole('menuitem', { name: 'Delete' });
      await dropdownDanger.hover();
      expect(await paint(dropdownDanger, 'backgroundColor', '::before')).toBe(dangerBackground);
    });
  }

  test(`${theme} explicit component color remains local`, async ({ page }) => {
    await page.goto(`/?fixture=family-color-contract&theme=${theme}`);
    const original = page.getByRole('region', { name: 'Default', exact: true });
    const custom = page.getByRole('region', { name: 'Override', exact: true });
    expect(await paint(custom.locator('.leaf-tabs__list'))).toBe('#213141');
    expect(await paint(original.locator('.leaf-tabs__list'))).not.toBe('#213141');
    await custom.getByRole('button', { name: 'Override color', exact: true }).click();
    expect(await paint(page.locator('.leaf-color-picker__formats .leaf-tabs__list'))).toBe(
      await paint(custom.locator('.leaf-tabs__list')),
    );
  });
}
