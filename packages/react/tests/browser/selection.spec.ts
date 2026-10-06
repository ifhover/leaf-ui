import { expect, type Locator, test } from '@playwright/test';

async function paint(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      color: style.color,
      border: style.borderColor,
      shadow: style.boxShadow,
      outline: style.outline,
    };
  });
}

for (const appearance of ['light', 'dark']) {
  test.describe(appearance, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/?fixture=selection&theme=${appearance}`);
    });

    test('focused fields and open color pickers retain emphasis under the pointer', async ({
      page,
    }) => {
      for (const [name, selector] of [
        ['Focused input', '.leaf-input'],
        ['Focused textarea', '.leaf-textarea'],
        ['Focused number', '.leaf-input-number'],
      ] as const) {
        const field = page.getByLabel(name, { exact: true });
        await field.focus();
        await field.hover();
        const surface = page.locator(selector);
        await expect(surface).toHaveCSS('border-color', 'rgb(18, 101, 245)');
        await expect(field).toBeFocused();
      }
      const trigger = page.getByRole('button', { name: 'Accent', exact: true });
      await trigger.click();
      const picker = page.locator('.leaf-color-picker').filter({ has: trigger });
      await expect(picker).toHaveCSS('border-color', 'rgb(18, 101, 245)');
      await page.getByRole('textbox', { name: 'Color value', exact: true }).focus();
      await trigger.hover();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(picker).toHaveCSS('border-color', 'rgb(18, 101, 245)');
      const selected = page.getByRole('button', { name: '#1265f5', exact: true });
      await page.mouse.move(0, 0);
      const before = await paint(selected);
      await selected.hover();
      expect(await paint(selected)).toEqual(before);
      await expect(selected).toHaveAttribute('aria-pressed', 'true');
    });

    test('selected popup options preserve selection while hovering and pressing', async ({
      page,
    }) => {
      const select = page.getByRole('combobox', { name: 'Selected person' });
      await select.click();
      await expect(page.locator('.leaf-select').filter({ has: select })).toHaveCSS(
        'border-color',
        'rgb(18, 101, 245)',
      );
      const selected = page.getByRole('option', { name: 'Alice', exact: true });
      await page.mouse.move(0, 0);
      const before = await paint(selected);
      await selected.hover();
      expect(await paint(selected)).toEqual(before);
      await page.mouse.down();
      expect(await paint(selected)).toEqual(before);
      await page.mouse.up();
      await expect(select).toHaveValue('Alice');
      await expect(select).toHaveAttribute('aria-expanded', 'false');
      await select.click();
      await select.press('ArrowDown');
      await select.press('Enter');
      await expect(select).toHaveValue('Bob');
      await page.getByRole('combobox', { name: 'Selected time' }).click();
      const hour = page
        .locator('.leaf-time-picker__column')
        .first()
        .locator('[aria-selected="true"]');
      await page.mouse.move(0, 0);
      const hourBefore = await paint(hour);
      await hour.hover();
      expect(await paint(hour)).toEqual(hourBefore);
      await expect(hour).toHaveAttribute('aria-selected', 'true');
    });

    test('navigation, tags and transfer rows retain their selected appearance', async ({
      page,
    }) => {
      const targets = [
        page.getByRole('button', { name: 'Page 2', exact: true }),
        page.getByRole('link', { name: 'Current page', exact: true }),
        page.getByRole('button', { name: 'Design', exact: true }),
        page.getByRole('navigation', { name: 'Sections' }).getByRole('button', { name: 'Home' }),
        page.locator('.leaf-transfer__item[data-selected]'),
      ];
      for (const target of targets) {
        await page.mouse.move(0, 0);
        const before = await paint(target);
        await target.hover();
        expect(await paint(target)).toEqual(before);
      }
      await expect(page.getByRole('button', { name: 'Page 2', exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      );
      await expect(page.getByRole('button', { name: 'Design', exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(page.locator('.leaf-switch__thumb')).toHaveCSS(
        'background-color',
        'rgb(255, 255, 255)',
      );
    });
  });
}
