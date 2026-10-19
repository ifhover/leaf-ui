import { TinyColor } from '@ctrl/tinycolor';
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

async function tokenColor(locator: Locator, token: string) {
  return new TinyColor(
    await locator.evaluate(
      (element, name) => getComputedStyle(element).getPropertyValue(name),
      token,
    ),
  ).toRgbString();
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

    test('checked menu values stay primary while candidates share neutral hover and press', async ({
      page,
    }) => {
      await page.getByRole('button', { name: 'Checked menu' }).click();
      const panel = page.locator('.leaf-dropdown');
      const marker = panel.locator('.leaf-dropdown__highlight');
      const selected = panel.getByRole('menuitemcheckbox', { name: 'Saved filter' });
      const candidate = panel.getByRole('menuitemcheckbox', { name: 'Available filter' });
      const primary = await tokenColor(panel, '--leaf-color-primary-surface-9');
      const neutral = await tokenColor(panel, '--leaf-color-option-hover');
      await expect(selected).toBeFocused();
      await expect(selected).toHaveCSS('background-color', primary);
      await expect(marker).toHaveCSS('background-color', primary);
      await candidate.hover();
      await expect(marker).toHaveCSS('background-color', neutral);
      await expect(candidate).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(selected).toHaveCSS('background-color', primary);
      await panel.getByRole('menuitem', { name: 'Disabled filter' }).hover();
      await expect(marker).toHaveCSS('background-color', neutral);
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await expect(candidate).toBeFocused();
      await expect(marker).toHaveCSS('background-color', neutral);
      await candidate.hover();
      await page.mouse.down();
      try {
        await expect(candidate).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      } finally {
        await page.mouse.up();
      }
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Checked menu' }).click();
      await panel.getByRole('menuitem', { name: 'Delete filter' }).hover();
      await expect(marker).toHaveCSS(
        'background-color',
        await tokenColor(panel, '--leaf-color-danger-surface-8'),
      );
      await expect(selected).toHaveAttribute('aria-checked', 'true');
    });

    test('suggestions, cascader, tree, time and navigation share neutral candidates', async ({
      page,
    }) => {
      await page.goto(`/?fixture=radius&theme=${appearance}`);
      const select = page.getByRole('combobox', { name: 'Radius select', exact: true });
      await select.click();
      const selectPanel = page.locator('.leaf-select__panel');
      const neutral = await tokenColor(selectPanel, '--leaf-color-option-hover');
      const primary = await tokenColor(selectPanel, '--leaf-color-primary-surface-9');
      await selectPanel.getByRole('option', { name: 'Bob', exact: true }).hover();
      await expect(selectPanel.locator('.leaf-floating__highlight')).toHaveCSS(
        'background-color',
        neutral,
      );
      await select.press('Escape');

      const autocomplete = page.getByRole('combobox', { name: 'Radius autocomplete' });
      await autocomplete.fill('');
      await autocomplete.press('ArrowDown');
      const suggestions = page.locator('.leaf-autocomplete__panel');
      const suggestion = suggestions.getByRole('option', { name: 'Bob', exact: true });
      await suggestion.hover();
      await expect(suggestions.locator('.leaf-floating__highlight')).toHaveCSS(
        'background-color',
        neutral,
      );
      await expect(suggestion).toHaveCSS(
        'color',
        await tokenColor(suggestions, '--leaf-color-text'),
      );
      await autocomplete.press('ArrowUp');
      await expect(suggestions.locator('.leaf-floating__highlight')).toHaveCSS(
        'background-color',
        neutral,
      );
      await autocomplete.press('Escape');

      const mentions = page.getByRole('combobox', { name: 'Radius mentions' });
      await mentions.fill('@');
      const mentionsPanel = page.locator('.leaf-mentions__panel');
      const mention = mentionsPanel.getByRole('option', { name: 'Bob', exact: true });
      await mention.hover();
      await expect(mention).toHaveCSS('background-color', neutral);
      await mentions.press('ArrowUp');
      await expect(mentionsPanel.locator('[aria-selected="true"]')).toHaveCSS(
        'background-color',
        neutral,
      );
      await mentions.press('Escape');

      await page.getByRole('combobox', { name: 'Radius cascader' }).click();
      const cascader = page.locator('.leaf-cascader__panel');
      const engineering = cascader.getByRole('option', { name: 'Engineering', exact: true });
      await engineering.hover();
      await expect(engineering).toHaveCSS('background-color', neutral);
      await expect(cascader.getByRole('option', { name: 'Design', exact: true })).toHaveCSS(
        'background-color',
        primary,
      );
      await engineering.press('Home');
      await page.keyboard.press('ArrowDown');
      await expect(engineering).toBeFocused();
      await expect(engineering).toHaveCSS('background-color', neutral);
      await page.keyboard.press('Escape');

      await page.getByRole('combobox', { name: 'Radius tree', exact: true }).click();
      const tree = page.locator('.leaf-tree-select__panel');
      const bob = tree.getByRole('treeitem', { name: 'Bob', exact: true });
      await bob.locator('.leaf-tree__title').hover();
      await expect(bob.locator('.leaf-tree__row')).toHaveCSS('background-color', neutral);
      await expect(
        tree.getByRole('treeitem', { name: 'Alice', exact: true }).locator('.leaf-tree__row'),
      ).toHaveCSS('background-color', primary);
      await page.keyboard.press('Escape');

      await page.getByRole('combobox', { name: 'Radius time', exact: true }).click();
      const hours = page.locator('.leaf-time-picker__column').first();
      const nextHour = hours.getByRole('option', { name: '10', exact: true });
      await nextHour.hover();
      await expect(nextHour).toHaveCSS('background-color', neutral);
      await expect(hours.locator('.leaf-time-picker__selection')).toHaveCSS(
        'background-color',
        primary,
      );
      await page.keyboard.press('Escape');

      const menu = page.getByRole('navigation', { name: 'Radius menu', exact: true });
      const team = menu.getByRole('menuitem', { name: 'Team', exact: true });
      const menuInk = await menu.evaluate((element) => {
        const probe = document.createElement('span');
        probe.style.color = 'var(--leaf-color-primary-ink-active)';
        element.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      });
      await team.hover();
      await expect(team).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(team).toHaveCSS('color', menuInk);
      await team.focus();
      await expect(team).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(team).toHaveCSS('color', menuInk);
      await expect(menu.locator('.leaf-menu__indicator')).toHaveCSS('background-color', primary);
    });
  });
}
