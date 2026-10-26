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

    for (const custom of [false, true]) {
      test(`Select and trees share row-local feedback${custom ? ' with nested overrides' : ''}`, async ({
        page,
      }, testInfo) => {
        if (custom) await page.setViewportSize({ width: 390, height: 900 });
        await page.goto(`/?fixture=selection&theme=${appearance}${custom ? '&custom' : ''}`);
        const menu = page.getByRole('navigation', { name: 'Palette reference' });
        const menuSelected = menu.getByRole('menuitem', { name: 'Menu Alice' });
        const menuCandidate = menu.getByRole('menuitem', { name: 'Menu Bob' });
        expect((await menuFeedback(menuSelected)).background).toBe('rgba(0, 0, 0, 0.08)');
        await page.getByRole('combobox', { name: 'Selected person', exact: true }).click();
        const reference = page.locator('.leaf-select__panel');
        const fullInk = (await paint(reference.getByRole('option', { name: 'Alice', exact: true })))
          .color;
        const ordinaryInk = (
          await paint(reference.getByRole('option', { name: 'Bob', exact: true }))
        ).color;
        expect(ordinaryInk).toBe(fullInk);
        expect(ordinaryInk).not.toBe((await paint(menuCandidate)).color);
        await page.keyboard.press('Escape');
        const tree = page.getByRole('tree', { name: 'Selected tree', exact: true });
        const treeSelected = tree.locator('.leaf-tree__row[data-selected]');
        const treeCandidate = tree.locator('.leaf-tree__row').last();
        await expect(treeSelected).toHaveCSS('color', fullInk);
        await expect(treeCandidate).toHaveCSS('color', ordinaryInk);
        await expect(tree.locator('.leaf-tree__highlight')).toHaveCount(0);
        await treeCandidate.hover();
        await expect(treeCandidate).toHaveCSS('color', fullInk);
        await expect
          .poll(() => menuFeedback(treeCandidate))
          .toEqual({ background: 'rgba(0, 0, 0, 0.04)', opacity: 1 });
        await expect
          .poll(() => menuFeedback(treeSelected))
          .toEqual({ background: 'rgba(0, 0, 0, 0)', opacity: 1 });
        await expect(treeSelected.locator('.leaf-tree__selection-mark')).toHaveCSS('opacity', '1');
        for (const [label, panelSelector, selectedSelector, candidateSelector] of [
          [
            'Selected person',
            '.leaf-select__panel',
            '[role="option"][aria-selected="true"]',
            '[role="option"][aria-posinset="2"]',
          ],
          [
            'Selected tree person',
            '.leaf-tree-select__panel',
            '.leaf-tree__row[data-selected]',
            '.leaf-tree__row:not([data-selected])',
          ],
        ] as const) {
          const input = page.getByRole('combobox', { name: label, exact: true });
          await input.click();
          const panel = page.locator(panelSelector);
          const selected = panel.locator(selectedSelector);
          const candidate = panel.locator(candidateSelector);
          await expect(selected).toHaveCSS('color', fullInk);
          await expect(candidate).toHaveCSS('color', ordinaryInk);
          await expect(
            panel.locator('.leaf-floating__highlight, .leaf-tree__highlight'),
          ).toHaveCount(0);
          await candidate.hover();
          await expect(candidate).toHaveCSS('color', fullInk);
          await expect
            .poll(() => menuFeedback(candidate))
            .toEqual({ background: 'rgba(0, 0, 0, 0.04)', opacity: 1 });
          await expect
            .poll(() => menuFeedback(selected))
            .toEqual({ background: 'rgba(0, 0, 0, 0)', opacity: 1 });
          await page.mouse.down();
          await expect(candidate).toHaveCSS('color', fullInk);
          await page.mouse.move(0, 0);
          await page.mouse.up();
          await selected.hover();
          await expect(selected).toHaveCSS('color', fullInk);
          if (panelSelector === '.leaf-select__panel') {
            const disabled = panel.getByRole('option', { name: 'Disabled', exact: true });
            await expect(disabled).toHaveCSS(
              'color',
              await tokenColor(panel, '--leaf-color-text-muted'),
            );
          }
          await page.screenshot({ path: testInfo.outputPath(`${label.replaceAll(' ', '-')}.png`) });
          await input.press('Escape');
        }
      });
    }

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

    test('selected popup options keep soft row-local feedback and a persistent check', async ({
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
      await expect(panel.locator('.leaf-floating__highlight')).toHaveCount(0);
      await expect(panel).toHaveCSS(
        'border-radius',
        await trigger.evaluate((node) => getComputedStyle(node).borderRadius),
      );
      const selected = page.getByRole('option', { name: 'Alice', exact: true });
      const next = page.getByRole('option', { name: 'Bob', exact: true });
      await expect(next).toHaveCSS('transition-duration', '0s');
      const neutral = 'rgba(0, 0, 0, 0.04)';
      await expect(selected).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(selected).toHaveCSS('color', await tokenColor(selected, '--leaf-color-text'));
      await expect(selected.locator('.leaf-select__check')).toHaveCSS('opacity', '1');
      await expect.poll(() => menuFeedback(selected)).toEqual({ background: neutral, opacity: 1 });
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
      await expect.poll(() => menuFeedback(next)).toEqual({ background: neutral, opacity: 1 });
      await expect
        .poll(async () => (await menuFeedback(selected)).background)
        .toBe('rgba(0, 0, 0, 0)');
      await expect(next).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(selected.locator('.leaf-select__check')).toHaveCSS('opacity', '1');
      await page.mouse.move(0, 0);
      await expect.poll(async () => (await menuFeedback(selected)).background).toBe(neutral);
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
        await tokenColor(page.locator('.leaf-switch'), '--leaf-color-on-primary'),
      );
    });

    test('checked menu values stay neutral while candidates share hover and press', async ({
      page,
    }) => {
      await page.getByRole('button', { name: 'Checked menu' }).click();
      const panel = page.locator('.leaf-dropdown');
      const selected = panel.getByRole('menuitemcheckbox', { name: 'Saved filter' });
      const candidate = panel.getByRole('menuitemcheckbox', { name: 'Available filter' });
      const neutral = 'rgba(0, 0, 0, 0.04)';
      await expect(selected).toBeFocused();
      await expect
        .poll(async () => (await menuFeedback(selected)).background)
        .toBe('rgba(0, 0, 0, 0)');
      await expect(selected.locator('.leaf-dropdown__check')).toHaveCount(1);
      await expect(selected).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      const fullInk = (await paint(selected)).color;
      await expect(candidate).toHaveCSS('color', fullInk);
      await candidate.hover();
      await expect(candidate).toHaveCSS('color', fullInk);
      await expect.poll(async () => (await menuFeedback(candidate)).background).toBe(neutral);
      await expect.poll(async () => (await menuFeedback(candidate)).opacity).toBe(1);
      await expect(candidate).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect
        .poll(async () => (await menuFeedback(selected)).background)
        .toBe('rgba(0, 0, 0, 0)');
      const disabled = panel.getByRole('menuitem', { name: 'Disabled filter' });
      await disabled.hover();
      await expect(disabled).toHaveCSS('color', await tokenColor(panel, '--leaf-color-text-muted'));
      await expect
        .poll(
          async () =>
            (await menuFeedback(panel.getByRole('menuitem', { name: 'Disabled filter' })))
              .background,
        )
        .toBe('rgba(0, 0, 0, 0)');
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await expect(candidate).toBeFocused();
      await expect.poll(async () => (await menuFeedback(candidate)).background).toBe(neutral);
      await expect
        .poll(async () => (await menuFeedback(selected)).background)
        .toBe('rgba(0, 0, 0, 0)');
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
        .toBe(await tokenColor(panel, '--leaf-color-danger-soft'));
      await page.mouse.down();
      try {
        await expect
          .poll(async () => (await menuFeedback(danger)).background)
          .toBe(await tokenColor(panel, '--leaf-color-danger-soft-active'));
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
      await selectPanel.getByRole('option', { name: 'Bob', exact: true }).hover();
      await expect
        .poll(() => menuFeedback(selectPanel.getByRole('option', { name: 'Bob', exact: true })))
        .toEqual({ background: 'rgba(0, 0, 0, 0.04)', opacity: 1 });
      await select.press('Escape');

      const autocomplete = page.getByRole('combobox', { name: 'Radius autocomplete' });
      await autocomplete.fill('');
      await autocomplete.press('ArrowDown');
      const suggestions = page.locator('.leaf-autocomplete__panel');
      const suggestion = suggestions.getByRole('option', { name: 'Bob', exact: true });
      const suggestionInk = await tokenColor(suggestions, '--leaf-color-text');
      await expect(suggestion).toHaveCSS('color', suggestionInk);
      await expect(suggestions.locator('[aria-selected="true"]')).toHaveCSS('color', suggestionInk);
      await suggestion.hover();
      await expect(suggestions.locator('.leaf-floating__highlight')).toHaveCount(0);
      await expect
        .poll(() => menuFeedback(suggestion))
        .toEqual({ background: 'rgba(0, 0, 0, 0.04)', opacity: 1 });
      await expect(suggestion).toHaveCSS(
        'color',
        await tokenColor(suggestions, '--leaf-color-text'),
      );
      await autocomplete.press('ArrowUp');
      await expect
        .poll(() => menuFeedback(suggestions.getByRole('option').first()))
        .toEqual({ background: 'rgba(0, 0, 0, 0.04)', opacity: 1 });
      await autocomplete.press('Escape');

      const mentions = page.getByRole('combobox', { name: 'Radius mentions' });
      await mentions.fill('@');
      const mentionsPanel = page.locator('.leaf-mentions__panel');
      const mention = mentionsPanel.getByRole('option', { name: 'Bob', exact: true });
      const mentionInk = await tokenColor(mentionsPanel, '--leaf-color-text');
      await expect(mention).toHaveCSS('color', mentionInk);
      await expect(mentionsPanel.locator('[aria-selected="true"]')).toHaveCSS('color', mentionInk);
      await mention.hover();
      await expect
        .poll(() => menuFeedback(mention))
        .toEqual({ background: 'rgba(0, 0, 0, 0.04)', opacity: 1 });
      await mentions.press('ArrowUp');
      await expect
        .poll(() => menuFeedback(mentionsPanel.locator('[aria-selected="true"]')))
        .toEqual({ background: 'rgba(0, 0, 0, 0.04)', opacity: 1 });
      await mentions.press('Escape');

      await page.getByRole('combobox', { name: 'Radius cascader' }).click();
      const cascader = page.locator('.leaf-cascader__panel');
      const engineering = cascader.getByRole('option', { name: 'Engineering', exact: true });
      const cascaderInk = await tokenColor(cascader, '--leaf-color-text');
      await expect(engineering).toHaveCSS('color', cascaderInk);
      await expect(cascader.getByRole('option', { name: 'Design', exact: true })).toHaveCSS(
        'color',
        cascaderInk,
      );
      await engineering.hover();
      await expect
        .poll(() => menuFeedback(engineering))
        .toEqual({ background: 'rgba(0, 0, 0, 0.04)', opacity: 1 });
      await expect(cascader.getByRole('option', { name: 'Design', exact: true })).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)',
      );
      await engineering.press('Home');
      await page.keyboard.press('ArrowDown');
      await expect(engineering).toBeFocused();
      await expect
        .poll(() => menuFeedback(engineering))
        .toEqual({ background: 'rgba(0, 0, 0, 0.04)', opacity: 1 });
      await page.keyboard.press('Escape');

      await page.getByRole('combobox', { name: 'Radius tree', exact: true }).click();
      const tree = page.locator('.leaf-tree-select__panel');
      const bob = tree.getByRole('treeitem', { name: 'Bob', exact: true });
      await expect(tree.locator('.leaf-tree__highlight')).toHaveCount(0);
      const alice = tree.getByRole('treeitem', { name: 'Alice', exact: true });
      await bob.locator('.leaf-tree__title').hover();
      await expect
        .poll(() => menuFeedback(bob.locator('.leaf-tree__row')))
        .toEqual({ background: 'rgba(0, 0, 0, 0.04)', opacity: 1 });
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
      await expect
        .poll(() => menuFeedback(nextHour))
        .toEqual({ background: 'rgba(0, 0, 0, 0.04)', opacity: 1 });
      const savedHour = hours.locator('[aria-selected="true"]');
      await expect(savedHour).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(savedHour.locator('.leaf-time-picker__check')).toHaveCSS('opacity', '1');
      await expect(hours.locator('.leaf-time-picker__selection')).toHaveCount(0);
      await page.keyboard.press('Escape');

      const menu = page.getByRole('navigation', { name: 'Radius menu', exact: true });
      const team = menu.getByRole('menuitem', { name: 'Team', exact: true });
      const menuText = await team.evaluate((node) => getComputedStyle(node).color);
      // Menu deliberately uses its own translucent feedback over the navigation canvas.
      const menuNeutral = await tokenColor(menu, '--leaf-menu-hover-background');
      const menuBackground = () =>
        team.evaluate((node) => getComputedStyle(node, '::before').backgroundColor);
      await team.hover();
      await expect.poll(menuBackground).toBe(menuNeutral);
      await expect(team).toHaveCSS('color', menuText);
      await team.focus();
      await expect.poll(menuBackground).toBe(menuNeutral);
      await expect(team).toHaveCSS('color', menuText);
    });
  });
}
