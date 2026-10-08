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
    await expectInset(panel, option);
    await expect(option).toHaveCSS('border-radius', '9px');
    await select.press('ArrowDown');
    await expectInset(panel, panel.getByRole('option').nth(1));
    await option.hover();
    await expectInset(panel, option);
    await select.press('Escape');

    await page.getByRole('combobox', { name: 'Radius autocomplete' }).click();
    const autocomplete = page.locator('.leaf-autocomplete__panel');
    await expectInset(autocomplete, autocomplete.getByRole('option').first());
    await page.keyboard.press('Escape');

    await page.getByRole('combobox', { name: 'Radius mentions' }).fill('@');
    const mentions = page.locator('.leaf-mentions__panel');
    await expectInset(mentions, mentions.getByRole('option').first());
    await page.keyboard.press('Escape');
    await page.getByRole('combobox', { name: 'Radius mentions' }).fill('');
    await expect(mentions).toHaveCount(0);

    await page.getByRole('combobox', { name: 'Radius cascader' }).click();
    const cascader = page.locator('.leaf-cascader__panel');
    await expectInset(cascader, cascader.locator('.leaf-floating__option').first(), 4);
    await page.keyboard.press('Escape');

    await page.getByRole('combobox', { name: 'Radius tree', exact: true }).click();
    const tree = page.locator('.leaf-tree-select__panel');
    await expectInset(tree, tree.locator('.leaf-tree__row').first(), 0, 3);
    await page.keyboard.press('Escape');

    await page.getByRole('combobox', { name: 'Radius time', exact: true }).click();
    const time = page.locator('.leaf-time-picker__panel');
    const timeOption = time.locator('.leaf-floating__option').first();
    await expectInset(time, timeOption, 11, 8);
    await expectMatching(timeOption, time.locator('.leaf-time-picker__selection').first());
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Radius dropdown', exact: true }).click();
    const dropdown = page.locator('.leaf-dropdown');
    await expectInset(dropdown, dropdown.getByRole('menuitem').first());
    await expectMatching(
      dropdown.getByRole('menuitem').first(),
      dropdown.locator('.leaf-dropdown__highlight'),
    );
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Radius color', exact: true }).click();
    const formats = page.locator('.leaf-color-picker__formats');
    await expectInset(formats, formats.getByRole('button').first());
    await page.keyboard.press('Escape');

    const segmented = page.getByRole('radiogroup', { name: 'Radius segmented' });
    await expectInset(segmented, segmented.getByRole('radio').first());
    await expectMatching(
      segmented.getByRole('radio').first(),
      segmented.locator('.leaf-segmented__indicator'),
    );
    const tabs = page.locator('.leaf-tabs__list');
    await expectInset(tabs, tabs.getByRole('tab').first());
    await expectMatching(tabs.getByRole('tab').first(), tabs.locator('.leaf-tabs__indicator'));
    for (const name of ['Radius menu', 'Horizontal radius menu']) {
      const menu = page.getByRole('navigation', { name, exact: true });
      await expectInset(menu, menu.getByRole('menuitem').first());
      await expectMatching(
        menu.getByRole('menuitem').first(),
        menu.locator('.leaf-menu__indicator'),
      );
    }
    await expect(
      page.getByRole('tree', { name: 'Independent tree' }).locator('.leaf-tree__row'),
    ).toHaveCSS('border-radius', '6px');
  });
}

for (const radius of [0, 3]) {
  test(`small radius ${radius} clamps nested surfaces to square corners`, async ({ page }) => {
    await page.goto(`/?fixture=radius&radius=${radius}`);
    await page.getByRole('combobox', { name: 'Radius select', exact: true }).click();
    const panel = page.locator('.leaf-select__panel');
    await expectInset(panel, panel.getByRole('option').first());
    await expect(panel.getByRole('option').first()).toHaveCSS('border-radius', '0px');
    await page.keyboard.press('Escape');
    const segmented = page.getByRole('radiogroup', { name: 'Radius segmented' });
    await expectInset(segmented, segmented.getByRole('radio').first());
    await expect(segmented.getByRole('radio').first()).toHaveCSS('border-radius', '0px');
  });
}

test('component padding shorthand keeps highlight geometry aligned in an RTL portal', async ({
  page,
}) => {
  await page.goto('/?fixture=radius&overrides&rtl');
  await page.getByRole('button', { name: 'Radius dropdown', exact: true }).click();
  const dropdown = page.locator('.leaf-dropdown');
  const row = dropdown.getByRole('menuitem').first();
  const highlight = dropdown.locator('.leaf-dropdown__highlight');
  await expectInset(dropdown, row);
  await expectMatching(row, highlight);
  const bounds = await row.boundingBox();
  await expect
    .poll(async () => {
      const box = await highlight.boundingBox();
      return { x: box?.x, width: box?.width };
    })
    .toEqual({ x: bounds?.x, width: bounds?.width });
  await page.keyboard.press('ArrowDown');
  await expectMatching(dropdown.getByRole('menuitem').nth(1), highlight);
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Radius select', exact: true }).click();
  const panel = page.locator('.leaf-select__panel');
  await expect(panel).toHaveCSS('border-radius', '24px');
  await expectInset(panel, panel.getByRole('option').first());
  await page.keyboard.press('Escape');
  for (const [surface, child] of [
    [page.locator('.leaf-segmented'), page.locator('.leaf-segmented').getByRole('radio').first()],
    [page.locator('.leaf-tabs__list'), page.getByRole('tab').first()],
    [
      page.getByRole('navigation', { name: 'Radius menu', exact: true }),
      page
        .getByRole('navigation', { name: 'Radius menu', exact: true })
        .getByRole('menuitem')
        .first(),
    ],
  ] as const)
    await expectInset(surface, child);
});

test('open portals follow live theme changes and preserve nested overrides', async ({ page }) => {
  await page.goto('/?fixture=radius');
  await page.getByRole('combobox', { name: 'Radius select', exact: true }).click();
  const panel = page.locator('.leaf-select__panel');
  await expect(panel.getByRole('option').first()).toHaveCSS('border-radius', '9px');
  await page
    .getByRole('button', { name: 'Change radius', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(panel.getByRole('option').first()).toHaveCSS('border-radius', '25px');
  await expectInset(panel, panel.getByRole('option').first());
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Nested radius select' }).click();
  await expect(panel).toHaveCSS('border-radius', '12px');
  await expect(panel.getByRole('option').first()).toHaveCSS('border-radius', '9px');
  await page
    .getByRole('button', { name: 'Change outer theme' })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expectInset(panel, panel.getByRole('option').first());
  await expect(panel).toHaveCSS('border-radius', '12px');
});

test('time controls inside range and datetime views keep a local semantic curve', async ({
  page,
}) => {
  await page.goto('/?fixture=radius');
  await page.getByRole('combobox', { name: 'Radius time range' }).click();
  const range = page.locator('.leaf-time-range-picker__panel');
  const rangeOption = range.locator('.leaf-floating__option').first();
  await expect(rangeOption).toHaveCSS('border-radius', '6px');
  await expectMatching(rangeOption, range.locator('.leaf-time-picker__selection').first());
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Radius datetime' }).click();
  const datetime = page.locator('.leaf-datetime-panel');
  await datetime.locator('.leaf-picker-time-toggle').click();
  const datetimeOption = datetime.locator('.leaf-floating__option').first();
  await expect(datetimeOption).toHaveCSS('border-radius', '6px');
  await expectMatching(datetimeOption, datetime.locator('.leaf-time-picker__selection').first());
});
