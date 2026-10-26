import { expect, type Locator, test } from '@playwright/test';

async function corners(locator: Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node);
    return [
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomRightRadius,
      style.borderBottomLeftRadius,
    ].map((value) => {
      const parts = value.split(' ').map(Number.parseFloat);
      return [parts[0], parts[1] ?? parts[0]];
    });
  });
}

async function pseudoCorners(locator: Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node, '::before');
    return [
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomRightRadius,
      style.borderBottomLeftRadius,
    ].map((value) => {
      const parts = value.split(' ').map(Number.parseFloat);
      return [parts[0], parts[1] ?? parts[0]];
    });
  });
}

async function expectInset(surface: Locator, child: Locator, extraX = 0, extraY = 0) {
  const expected = await surface.evaluate(
    (node, extra) => {
      const style = getComputedStyle(node);
      const radius = Number.parseFloat(style.borderTopLeftRadius);
      const inset = (padding: string, border: string, additional: number) =>
        Math.max(0, radius - Number.parseFloat(padding) - Number.parseFloat(border) - additional);
      const left = inset(style.paddingLeft, style.borderLeftWidth, extra.x);
      const right = inset(style.paddingRight, style.borderRightWidth, extra.x);
      const top = inset(style.paddingTop, style.borderTopWidth, extra.y);
      const bottom = inset(style.paddingBottom, style.borderBottomWidth, extra.y);
      return [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom],
      ];
    },
    { x: extraX, y: extraY },
  );
  await expect.poll(() => corners(child)).toEqual(expected);
}

async function expectMatching(first: Locator, second: Locator) {
  const expected = await corners(first);
  await expect.poll(() => corners(second)).toEqual(expected);
}

async function expectChoiceCorners(panel: Locator, row: Locator) {
  const radius = await panel.evaluate((node) =>
    Math.max(0, Number.parseFloat(getComputedStyle(node).borderTopLeftRadius) - 2),
  );
  await expect(row).toHaveCSS('border-radius', `${radius}px`);
  await expect.poll(() => pseudoCorners(row)).toEqual(await corners(row));
}

for (const appearance of ['light', 'dark']) {
  test(`popup options and indicator layers follow nested geometry in ${appearance}`, async ({
    page,
  }) => {
    await page.goto(
      `/?fixture=radius&theme=${appearance}${appearance === 'dark' ? '&compact&rtl' : ''}`,
    );
    const select = page.getByRole('combobox', { name: 'Radius select', exact: true });
    await select.click();
    const panel = page.locator('.leaf-select__panel');
    const option = panel.getByRole('option').first();
    await expectMatching(
      option,
      page
        .getByRole('navigation', { name: 'Radius menu', exact: true })
        .getByRole('menuitem')
        .first(),
    );
    await expect(panel).toHaveCSS('border-radius', '10px');
    await expect(option).toHaveCSS('border-radius', '8px');
    await select.press('ArrowDown');
    await expectMatching(option, panel.getByRole('option').nth(1));
    await option.hover();
    await expect(option).toHaveCSS('border-radius', '8px');
    await select.press('Escape');

    await page.getByRole('combobox', { name: 'Radius autocomplete' }).click();
    const autocomplete = page.locator('.leaf-autocomplete__panel');
    await expectChoiceCorners(autocomplete, autocomplete.getByRole('option').first());
    await page.keyboard.press('Escape');

    await page.getByRole('combobox', { name: 'Radius mentions' }).fill('@');
    const mentions = page.locator('.leaf-mentions__panel');
    await expectChoiceCorners(mentions, mentions.getByRole('option').first());
    await page.keyboard.press('Escape');
    await page.getByRole('combobox', { name: 'Radius mentions' }).fill('');
    await expect(mentions).toHaveCount(0);

    await page.getByRole('combobox', { name: 'Radius cascader' }).click();
    const cascader = page.locator('.leaf-cascader__panel');
    await expectChoiceCorners(cascader, cascader.locator('.leaf-floating__option').first());
    await page.keyboard.press('Escape');

    await page.getByRole('combobox', { name: 'Radius tree', exact: true }).click();
    const tree = page.locator('.leaf-tree-select__panel');
    const treeRow = tree.locator('.leaf-tree__row').first();
    await expectChoiceCorners(tree, treeRow);
    await expect(tree.locator('.leaf-tree__highlight')).toHaveCount(0);
    await page.keyboard.press('Escape');

    await page.getByRole('combobox', { name: 'Radius time', exact: true }).click();
    const time = page.locator('.leaf-time-picker__panel');
    const timeOption = time.locator('.leaf-floating__option').first();
    await expectChoiceCorners(time, timeOption);
    await expect(time.locator('.leaf-time-picker__selection')).toHaveCount(0);
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Radius dropdown', exact: true }).click();
    const dropdown = page.locator('.leaf-dropdown');
    const first = dropdown.getByRole('menuitem').first();
    await expectChoiceCorners(dropdown, first);
    const expectedCorners = await corners(first);
    await expect.poll(() => pseudoCorners(first)).toEqual(expectedCorners);
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Radius color', exact: true }).click();
    const formats = page.locator('.leaf-color-picker__formats .leaf-tabs__list');
    await expectInset(formats, formats.getByRole('tab').first());
    await page.keyboard.press('Escape');

    const tabs = page.locator('.leaf-tabs__list');
    const firstTab = tabs.getByRole('tab').first();
    await expect(firstTab).toHaveCSS('border-radius', '10px');
    await expectMatching(firstTab, tabs.locator('.leaf-tabs__indicator'));
    const menu = page.getByRole('navigation', { name: 'Radius menu', exact: true });
    await expect(menu.getByRole('menuitem').first()).toHaveCSS('border-radius', '8px');
    await expect(
      page.getByRole('tree', { name: 'Independent tree' }).locator('.leaf-tree__row'),
    ).toHaveCSS('border-radius', '8px');
  });
}

for (const radius of [0, 3]) {
  test(`small radius ${radius} keeps nested menu surfaces on the shared curve`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=radius&radius=${radius}`);
    await page.getByRole('combobox', { name: 'Radius select', exact: true }).click();
    const panel = page.locator('.leaf-select__panel');
    await expect(panel.getByRole('option').first()).toHaveCSS(
      'border-radius',
      `${Math.max(0, radius - 2)}px`,
    );
    await page.keyboard.press('Escape');
    const menu = page.getByRole('navigation', { name: 'Radius menu', exact: true });
    await expect(menu.getByRole('menuitem').first()).toHaveCSS(
      'border-radius',
      `${Math.max(0, radius - 2)}px`,
    );
    const tabs = page.getByRole('tablist', { name: 'Radius tabs' });
    const firstTab = tabs.getByRole('tab').first();
    await expect(firstTab).toHaveCSS('border-radius', `${radius}px`);
    await expectMatching(firstTab, tabs.locator('.leaf-tabs__indicator'));
  });
}

for (const variant of ['plain', 'card']) {
  for (const theme of ['light', 'dark']) {
    test(`all form popups match their fields inside Card: ${variant} ${theme}`, async ({
      page,
    }) => {
      await page.goto(
        `/?fixture=radius&overrides&rtl&theme=${theme}${variant === 'card' ? '&card' : ''}`,
      );
      for (const [name, root, popup, radius] of [
        ['Radius select', '.leaf-select', '.leaf-select__panel', 14],
        ['Radius autocomplete', '.leaf-autocomplete', '.leaf-autocomplete__panel', 12],
        ['Radius tree', '.leaf-tree-select', '.leaf-tree-select__panel', 13],
        ['Radius cascader', '.leaf-cascader', '.leaf-cascader__panel', 15],
        ['Radius date', '.leaf-date-picker', '.leaf-date-picker__panel', 11],
        ['Radius date range', '.leaf-date-picker', '.leaf-range-panel', 11],
        ['Radius datetime', '.leaf-date-picker', '.leaf-datetime-panel', 11],
        ['Radius time', '.leaf-date-picker', '.leaf-time-picker__panel', 11],
        ['Radius time range', '.leaf-date-picker', '.leaf-time-range-picker__panel', 11],
      ] as const) {
        const input = page.getByRole('combobox', { name, exact: true });
        await input.click();
        const panel = page.locator(`${popup}[data-state="open"]`);
        await expect(panel).toHaveCSS('border-radius', `${radius}px`);
        await expectMatching(
          input.locator(
            `xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' ${root.slice(1)} ')][1]`,
          ),
          panel,
        );
        await expect(panel).toHaveAttribute('dir', 'rtl');
        if (name === 'Radius date' || name === 'Radius time')
          await panel.screenshot({
            path: test.info().outputPath(`${name.replaceAll(' ', '-')}.png`),
          });
        await page.keyboard.press('Escape');
        await expect(panel).toHaveCount(0);
      }
      const mentions = page.getByRole('combobox', { name: 'Radius mentions' });
      await mentions.fill('@');
      const mentionsPanel = page.locator('.leaf-mentions__panel');
      await expectMatching(mentions, mentionsPanel);
      await expect(mentionsPanel).toHaveCSS('border-radius', '16px');
      await expectChoiceCorners(mentionsPanel, mentionsPanel.getByRole('option').first());
      await mentions.press('Escape');
      await mentions.fill('');
      for (const [name, popup] of [
        ['Radius color', '.leaf-color-picker__panel'],
        ['Radius gradient', '.leaf-color-picker__gradient'],
      ] as const) {
        const button = page.getByRole('button', { name, exact: true });
        await button.click();
        const panel = page.locator(popup);
        await expectMatching(button, panel);
        await expect(panel).toHaveCSS('border-radius', '17px');
        if (name === 'Radius gradient')
          await panel.screenshot({ path: test.info().outputPath('gradient.png') });
        await page.keyboard.press('Escape');
      }
    });
  }
}

test('component padding shorthand keeps highlight geometry aligned in an RTL portal', async ({
  page,
}) => {
  await page.goto('/?fixture=radius&overrides&rtl');
  await page.getByRole('button', { name: 'Radius dropdown', exact: true }).click();
  const dropdown = page.locator('.leaf-dropdown');
  const row = dropdown.getByRole('menuitem').first();
  await expectChoiceCorners(dropdown, row);
  const expectedCorners = await corners(row);
  await row.hover();
  await expect
    .poll(async () => {
      const style = await row.evaluate((node) => {
        const pseudo = getComputedStyle(node, '::before');
        return [pseudo.top, pseudo.right, pseudo.bottom, pseudo.left];
      });
      return { corners: await pseudoCorners(row), inset: style };
    })
    .toEqual({ corners: expectedCorners, inset: ['0px', '0px', '0px', '0px'] });
  await page.keyboard.press('ArrowDown');
  const next = dropdown.getByRole('menuitem').nth(1);
  await expect(next).toBeFocused();
  const nextCorners = await corners(next);
  await expect
    .poll(async () => {
      const inset = await next.evaluate((node) => {
        const style = getComputedStyle(node, '::before');
        return [style.top, style.right, style.bottom, style.left];
      });
      return { corners: await pseudoCorners(next), inset };
    })
    .toEqual({ corners: nextCorners, inset: ['0px', '0px', '0px', '0px'] });
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Radius select', exact: true }).click();
  const panel = page.locator('.leaf-select__panel');
  await expect(panel).toHaveCSS('border-radius', '14px');
  await expect(panel.getByRole('option').first()).toHaveCSS('border-radius', '12px');
  await page.keyboard.press('Escape');
  const tabs = page.getByRole('tablist', { name: 'Radius tabs' });
  const firstTab = tabs.getByRole('tab').first();
  await expect(firstTab).toHaveCSS('border-radius', '14px');
  await expectMatching(firstTab, tabs.locator('.leaf-tabs__indicator'));
  const menu = page.getByRole('navigation', { name: 'Radius menu', exact: true });
  await expect(menu).toHaveCSS('border-radius', '18px');
  await expectMatching(menu, menu.getByRole('menuitem').first());
});

test('open portals follow live theme changes and preserve nested overrides', async ({ page }) => {
  await page.goto('/?fixture=radius');
  await page.getByRole('combobox', { name: 'Radius select', exact: true }).click();
  const panel = page.locator('.leaf-select__panel');
  await expect(panel.getByRole('option').first()).toHaveCSS('border-radius', '8px');
  await page
    .getByRole('button', { name: 'Change radius', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(panel).toHaveCSS('border-radius', '20px');
  await expect(panel.getByRole('option').first()).toHaveCSS('border-radius', '18px');
  const menu = page.getByRole('navigation', { name: 'Radius menu', exact: true });
  await expect(menu.getByRole('menuitem').first()).toHaveCSS('border-radius', '18px');
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Nested radius select' }).click();
  await expect(panel).toHaveCSS('border-radius', '4px');
  await expect(panel.getByRole('option').first()).toHaveCSS('border-radius', '2px');
  await page
    .getByRole('button', { name: 'Change outer theme' })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(panel.getByRole('option').first()).toHaveCSS('border-radius', '2px');
  await expect(panel).toHaveCSS('border-radius', '4px');
});

test('time rows and date cells share option curves while endpoint tabs keep flush dividers', async ({
  page,
}) => {
  await page.goto('/?fixture=radius');
  await page.getByRole('combobox', { name: 'Radius time range' }).click();
  const range = page.locator('.leaf-time-range-picker__panel');
  await expectChoiceCorners(range, range.locator('.leaf-floating__option').first());
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Radius datetime' }).click();
  const datetime = page.locator('.leaf-datetime-panel');
  await expectChoiceCorners(datetime, datetime.locator('.leaf-floating__option').first());
  await expect(datetime.locator('.leaf-date-picker__day').first()).toHaveCSS(
    'border-radius',
    '8px',
  );
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Radius date range' }).click();
  const endpoints = page.locator('.leaf-range-panel__endpoints');
  await expect(endpoints).toHaveCSS('border-radius', '0px');
  await expect(endpoints.getByRole('button').first()).toHaveCSS('border-radius', '0px');
  await expect(endpoints.getByRole('button').last()).toHaveCSS('border-inline-start-width', '1px');
});
