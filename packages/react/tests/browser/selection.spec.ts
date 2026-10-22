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

async function menuFeedback(locator: Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node, '::before');
    return {
      background: style.backgroundColor,
      opacity: Number(style.opacity),
    };
  });
}

async function neutralFieldBorder(locator: Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node);
    const probe = document.createElement('span');
    probe.style.color = `color-mix(in srgb, ${style.getPropertyValue('--leaf-color-text')} 45%, ${style.getPropertyValue('--leaf-color-border')})`;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
}

for (const appearance of ['light', 'dark']) {
  test.describe(appearance, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/?fixture=selection&theme=${appearance}`);
    });

    test('focused inputs and open selects use the theme border without a halo', async ({
      page,
    }) => {
      for (const [name, selector] of [
        ['Focused input', '.leaf-input'],
        ['Focused textarea', '.leaf-textarea'],
        ['Focused number', '.leaf-input-number'],
      ] as const) {
        const field = page.getByLabel(name, { exact: true });
        await page.mouse.move(0, 0);
        const restingBorder = await page
          .locator(selector)
          .evaluate((node) => getComputedStyle(node).borderTopColor);
        await field.focus();
        const surface = page.locator(selector);
        const expectedBorder =
          name === 'Focused input'
            ? await tokenColor(surface, '--leaf-color-primary')
            : await neutralFieldBorder(surface);
        await expect(surface).toHaveCSS('border-color', expectedBorder);
        await expect(surface).toHaveCSS('transition-property', /border-color/);
        await expect
          .poll(() => surface.evaluate((node) => getComputedStyle(node).borderTopColor))
          .not.toBe(restingBorder);
        await field.blur();
        await field.hover();
        await expect(surface).toHaveCSS('border-color', restingBorder);
        await expect(field).not.toBeFocused();
        await field.focus();
        await expect(surface).toHaveCSS('border-color', expectedBorder);
        await expect(surface).toHaveCSS('outline-style', 'none');
        await expect(field).toBeFocused();
      }
      const trigger = page.getByRole('button', { name: 'Accent', exact: true });
      await trigger.click();
      const picker = page.locator('.leaf-color-picker').filter({ has: trigger });
      await expect(picker).toHaveCSS('border-color', await neutralFieldBorder(picker));
      await page.getByRole('textbox', { name: 'Color value', exact: true }).focus();
      await trigger.hover();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(picker).toHaveCSS('border-color', await neutralFieldBorder(picker));
      const selected = page.getByRole('button', { name: '#1265f5', exact: true });
      await page.mouse.move(0, 0);
      const before = await paint(selected);
      await selected.hover();
      expect(await paint(selected)).toEqual(before);
      await expect(selected).toHaveAttribute('aria-pressed', 'true');
    });

    test('selected popup options keep one moving highlight and a persistent check', async ({
      page,
    }) => {
      const select = page.getByRole('combobox', { name: 'Selected person' });
      await select.click();
      const trigger = page.locator('.leaf-select').filter({ has: select });
      await expect(trigger).toHaveCSS(
        'border-color',
        await tokenColor(trigger, '--leaf-color-primary'),
      );
      await expect(trigger).toHaveCSS('outline-style', 'none');
      const panel = page.locator('.leaf-select__panel');
      const marker = panel.locator('.leaf-floating__highlight');
      const selected = page.getByRole('option', { name: 'Alice', exact: true });
      const next = page.getByRole('option', { name: 'Bob', exact: true });
      const neutral = await tokenColor(panel, '--leaf-color-option-hover');
      await expect(selected).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(selected).toHaveCSS('color', await tokenColor(selected, '--leaf-color-text'));
      await expect(selected.locator('.leaf-select__check')).toHaveCSS('opacity', '1');
      await expect(marker).toHaveCSS('background-color', neutral);
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
      await next.hover();
      await expect(marker).toHaveCSS('background-color', neutral);
      await expect(next).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(selected.locator('.leaf-select__check')).toHaveCSS('opacity', '1');
      await page.mouse.move(0, 0);
      await expect
        .poll(async () => {
          const mark = await marker.boundingBox();
          const row = await selected.boundingBox();
          return mark && row ? Math.abs(mark.y - row.y) : Infinity;
        })
        .toBeLessThan(1);
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

    test('checked menu values stay neutral while candidates share hover and press', async ({
      page,
    }) => {
      await page.getByRole('button', { name: 'Checked menu' }).click();
      const panel = page.locator('.leaf-dropdown');
      const selected = panel.getByRole('menuitemcheckbox', { name: 'Saved filter' });
      const candidate = panel.getByRole('menuitemcheckbox', { name: 'Available filter' });
      const neutral = await tokenColor(panel, '--leaf-color-option-hover');
      await expect(selected).toBeFocused();
      await expect.poll(async () => (await menuFeedback(selected)).background).toBe(neutral);
      await expect(selected).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await candidate.hover();
      await expect.poll(async () => (await menuFeedback(candidate)).background).toBe(neutral);
      await expect.poll(async () => (await menuFeedback(candidate)).opacity).toBe(1);
      await expect(candidate).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect.poll(async () => (await menuFeedback(selected)).background).toBe(neutral);
      await panel.getByRole('menuitem', { name: 'Disabled filter' }).hover();
      await expect
        .poll(
          async () =>
            (await menuFeedback(panel.getByRole('menuitem', { name: 'Disabled filter' }))).opacity,
        )
        .toBe(0);
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await expect(candidate).toBeFocused();
      await expect.poll(async () => (await menuFeedback(candidate)).background).toBe(neutral);
      await candidate.hover();
      await page.mouse.down();
      try {
        await expect(candidate).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        await expect.poll(async () => (await menuFeedback(candidate)).opacity).toBe(1);
      } finally {
        await page.mouse.up();
      }
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Checked menu' }).click();
      const danger = panel.getByRole('menuitem', { name: 'Delete filter' });
      await danger.hover();
      await expect
        .poll(async () => (await menuFeedback(danger)).background)
        .toBe(await tokenColor(panel, '--leaf-color-danger-surface-6'));
      await page.mouse.down();
      try {
        await expect
          .poll(async () => (await menuFeedback(danger)).background)
          .toBe(await tokenColor(panel, '--leaf-color-danger-surface-8'));
      } finally {
        await page.mouse.move(0, 0);
        await page.mouse.up();
      }
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
        neutral,
      );
      await engineering.press('Home');
      await page.keyboard.press('ArrowDown');
      await expect(engineering).toBeFocused();
      await expect(engineering).toHaveCSS('background-color', neutral);
      await page.keyboard.press('Escape');

      await page.getByRole('combobox', { name: 'Radius tree', exact: true }).click();
      const tree = page.locator('.leaf-tree-select__panel');
      const bob = tree.getByRole('treeitem', { name: 'Bob', exact: true });
      const treeMarker = tree.locator('.leaf-tree__highlight');
      const alice = tree.getByRole('treeitem', { name: 'Alice', exact: true });
      await bob.locator('.leaf-tree__title').hover();
      await expect(treeMarker).toHaveCSS('background-color', neutral);
      await expect(bob.locator('.leaf-tree__row')).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)',
      );
      await expect(alice.locator('.leaf-tree__row')).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)',
      );
      await expect(alice.locator('.leaf-tree__selection-mark')).toHaveCSS('opacity', '1');
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
      const menuText = await team.evaluate((node) => getComputedStyle(node).color);
      // Menu deliberately uses its own translucent feedback over the navigation canvas.
      const menuNeutral = await tokenColor(menu, '--leaf-menu-hover-background');
      const menuFeedback = () =>
        team.evaluate((node) => getComputedStyle(node, '::before').backgroundColor);
      await team.hover();
      await expect.poll(menuFeedback).toBe(menuNeutral);
      await expect(team).toHaveCSS('color', menuText);
      await team.focus();
      await expect.poll(menuFeedback).toBe(menuNeutral);
      await expect(team).toHaveCSS('color', menuText);
    });
  });
}
