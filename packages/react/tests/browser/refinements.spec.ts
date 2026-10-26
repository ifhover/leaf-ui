import { TinyColor } from '@ctrl/tinycolor';
import { expect, type Locator, test } from '@playwright/test';
import { settleAnimations } from './helpers/motion';

async function tokenColor(locator: Locator, token: string) {
  return new TinyColor(
    await locator.evaluate(
      (element, name) => getComputedStyle(element).getPropertyValue(name),
      token,
    ),
  ).toRgbString();
}

async function hoverLayer(locator: Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node, '::before');
    return {
      background: style.backgroundColor,
      borderStyle: style.borderTopStyle,
      borderWidth: style.borderTopWidth,
      bottom: style.bottom,
      boxShadow: style.boxShadow,
      opacity: Number(style.opacity),
      top: style.top,
      transition: style.transitionProperty,
    };
  });
}

test('Cascader expands without transient overflow and keeps equal inline insets', async ({
  page,
}, testInfo) => {
  await page.goto('/?fixture=refinements');
  await page.getByRole('combobox', { name: 'Animated cascader' }).click();
  const panel = page.locator('.leaf-cascader__panel');
  const sampling = page.evaluate(async () => {
    const frames: { horizontalOverflow: number; width: number; columns: number }[] = [];
    for (let i = 0; i < 48; i++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const node = document.querySelector<HTMLElement>('.leaf-cascader__panel');
      if (node)
        frames.push({
          horizontalOverflow: node.scrollWidth - node.clientWidth,
          width: node.clientWidth,
          columns: node.querySelectorAll('.leaf-cascader__column').length,
        });
    }
    return frames;
  });
  await panel.getByRole('option', { name: 'Design', exact: true }).click();
  const frames = await sampling;
  await testInfo.attach('cascader-expansion', {
    body: JSON.stringify(frames),
    contentType: 'application/json',
  });
  expect(frames.some((frame) => frame.columns === 2)).toBe(true);
  expect(Math.max(...frames.map((frame) => frame.horizontalOverflow))).toBeLessThanOrEqual(1);
  const columns = await panel.evaluate((node) => {
    const panel = node.getBoundingClientRect();
    // Trigger-width panels can be wider than their fixed-width columns. Insets
    // belong to each column's content box, including the separator between levels.
    return [...node.querySelectorAll('.leaf-cascader__column')].map((column) => {
      const bounds = column.getBoundingClientRect();
      const style = getComputedStyle(column);
      const option = column.querySelector('.leaf-floating__option')?.getBoundingClientRect();
      if (!option) throw new Error('Missing cascade options');
      return {
        left: option.left - bounds.left - Number.parseFloat(style.borderLeftWidth),
        right: bounds.right - option.right - Number.parseFloat(style.borderRightWidth),
        contained: bounds.left >= panel.left && bounds.right <= panel.right,
      };
    });
  });
  expect(columns).toHaveLength(2);
  for (const column of columns) {
    expect(column.left).toBeGreaterThan(0);
    expect(column.left).toBeCloseTo(column.right, 0);
    expect(column.contained).toBe(true);
  }
  await panel.getByRole('option', { name: 'UI', exact: true }).click();
  await expect(panel).toBeHidden();
});

for (const [suffix, selectHeight, menuHeight] of [
  ['', 34, 34],
  ['&compact=1', 30, 30],
  ['&tokens=1', 44, 44],
] as const) {
  test(`Select and Dropdown rows follow control height ${selectHeight}/${menuHeight}px`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/?fixture=refinements${suffix}`);
    await page.getByRole('combobox', { name: 'Animated select' }).click();
    await expect(page.locator('.leaf-select__panel')).toHaveAttribute('data-positioned', 'true');
    await settleAnimations(page.locator('.leaf-select__panel'));
    await testInfo.attach('popup-sizing', {
      body: JSON.stringify(
        await page.evaluate(() =>
          [
            ...document.querySelectorAll('[data-leaf-scope], .leaf-select, .leaf-select__panel'),
          ].map((node) => ({
            className: node.className,
            inline: node.getAttribute('style'),
            height: getComputedStyle(node).getPropertyValue('--leaf-control-height'),
            option: getComputedStyle(node).getPropertyValue('--leaf-density-option-height'),
          })),
        ),
      ),
      contentType: 'application/json',
    });
    await expect(page.getByRole('option', { name: 'Bob', exact: true })).toHaveCSS(
      'min-height',
      `${selectHeight}px`,
    );
    await expect
      .poll(
        async () =>
          (await page.getByRole('option', { name: 'Bob', exact: true }).boundingBox())?.height,
      )
      .toBeCloseTo(selectHeight, 0);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Animated menu' }).click();
    await expect(page.locator('.leaf-dropdown')).toHaveAttribute('data-positioned', 'true');
    await settleAnimations(page.locator('.leaf-dropdown'));
    await expect(page.getByRole('menuitem', { name: 'Edit', exact: true })).toHaveCSS(
      'min-height',
      `${menuHeight}px`,
    );
    await expect
      .poll(
        async () =>
          (await page.getByRole('menuitem', { name: 'Edit', exact: true }).boundingBox())?.height,
      )
      .toBeCloseTo(menuHeight, 0);
  });
}

test('Select rows have no gaps, fill the field and wrap long labels without clipping', async ({
  page,
}) => {
  await page.goto('/?fixture=refinements');
  const select = page.getByRole('combobox', { name: 'Long option select' });
  await select.click();
  const panel = page.locator('.leaf-select__panel');
  const trigger = page.locator('.leaf-select').filter({ has: select });
  const first = panel.getByRole('option', { name: 'First compact option', exact: true });
  const second = panel.getByRole('option', { name: 'Second compact option', exact: true });
  const long = panel.getByRole('option', { name: /A deliberately long option label/ });
  const triggerBox = await trigger.boundingBox();
  const firstBox = await first.boundingBox();
  const secondBox = await second.boundingBox();
  if (!triggerBox || !firstBox || !secondBox) throw new Error('Missing Select geometry');
  await expect
    .poll(async () => Math.abs(((await first.boundingBox())?.height ?? 0) - triggerBox.height) < 1)
    .toBe(true);
  expect(
    await second.evaluate(
      (node) =>
        (node as HTMLElement).offsetTop - (node.previousElementSibling as HTMLElement).offsetTop,
    ),
  ).toBe(await first.evaluate((node) => (node as HTMLElement).offsetHeight));
  expect(await first.evaluate((node) => getComputedStyle(node).marginTop)).toBe('0px');
  expect(await second.evaluate((node) => getComputedStyle(node).marginTop)).toBe('0px');
  await expect
    .poll(async () => (await long.boundingBox())?.height ?? 0)
    .toBeGreaterThan(triggerBox.height);
  expect(
    await long.evaluate((node) => ({
      scroll: node.scrollHeight,
      client: node.clientHeight,
      overflow: getComputedStyle(node).overflow,
    })),
  ).toEqual({ scroll: expect.any(Number), client: expect.any(Number), overflow: 'visible' });
  expect(await long.evaluate((node) => node.scrollHeight <= node.clientHeight + 1)).toBe(true);
});

test('Select optionHeight still controls the visible row without stretching the field', async ({
  page,
}) => {
  await page.goto('/?fixture=refinements');
  const select = page.getByRole('combobox', { name: 'Custom option height select' });
  const trigger = page.locator('.leaf-select').filter({ has: select });
  await select.click();
  const option = page.getByRole('option', { name: 'Alice', exact: true });
  await expect(option).toBeVisible();
  await expect.poll(async () => (await option.boundingBox())?.height).toBeCloseTo(48, 0);
  await expect.poll(async () => (await trigger.boundingBox())?.height).toBeCloseTo(34, 0);
});

test('changing a Select value does not animate the control label and Cascader swaps columns immediately', async ({
  page,
}) => {
  await page.goto('/?fixture=refinements');
  const select = page.getByRole('combobox', { name: 'Animated select' });
  const trigger = page.locator('.leaf-select').filter({ has: select });
  const value = trigger.locator('.leaf-select__input-wrap');
  await select.click();
  await expect(value).not.toHaveAttribute('data-motion-key');
  const before = await value.evaluate((node) => ({
    animations: node.getAnimations({ subtree: true }).length,
    rect: node.getBoundingClientRect().toJSON(),
  }));
  await page.getByRole('option', { name: 'Bob', exact: true }).click();
  expect(await value.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await value.evaluate((node) => node.getBoundingClientRect().toJSON())).toEqual(
    before.rect,
  );

  await page.getByRole('combobox', { name: 'Animated cascader' }).click();
  const panel = page.locator('.leaf-cascader__panel');
  const firstColumn = panel.locator('.leaf-cascader__column').first();
  const firstIdentity = await firstColumn.evaluate((node) => {
    node.dataset.identity = 'stable';
    return node.dataset.identity;
  });
  await firstColumn.getByRole('option', { name: 'Design', exact: true }).click();
  const columns = panel.locator('.leaf-cascader__column');
  await expect(columns).toHaveCount(2);
  expect(
    await columns.first().evaluate((node) => ({
      identity: node.dataset.identity,
      animation: getComputedStyle(node).animationName,
    })),
  ).toEqual({ identity: firstIdentity, animation: 'none' });
  await expect(columns.nth(1)).toHaveCSS('animation-name', 'none');
  await expect(columns.nth(1).getByRole('option', { name: 'UI', exact: true })).toBeVisible();
});

test('Select fades rounded row backgrounds without moving geometry and skips disabled rows', async ({
  page,
}) => {
  await page.goto('/?fixture=refinements');
  await page.getByRole('combobox', { name: 'Animated select' }).click();
  const panel = page.locator('.leaf-select__panel');
  await expect(panel.locator('.leaf-floating__highlight')).toHaveCount(0);
  await expect(panel).toHaveAttribute('data-positioned', 'true');
  await settleAnimations(panel);
  const bob = panel.getByRole('option', { name: 'Bob', exact: true });
  const charlie = panel.getByRole('option', { name: 'Charlie', exact: true });
  const geometry = await bob.boundingBox();
  const style = await bob.evaluate((node) => {
    const row = getComputedStyle(node);
    const layer = getComputedStyle(node, '::before');
    node.addEventListener('transitionrun', (event) => {
      if ((event as TransitionEvent).propertyName === 'background-color')
        node.setAttribute('data-background-transition', 'true');
    });
    return {
      radius: row.borderRadius,
      layerRadius: layer.borderRadius,
      transition: layer.transitionProperty,
      duration: layer.transitionDuration,
      inset: [layer.top, layer.right, layer.bottom, layer.left],
    };
  });
  expect(style).toEqual({
    radius: '6px',
    layerRadius: '6px',
    transition: 'background-color',
    duration: '0.2s',
    inset: ['0px', '0px', '0px', '0px'],
  });
  await bob.hover();
  await expect(bob).toHaveAttribute('data-background-transition', 'true');
  await expect.poll(async () => (await hoverLayer(bob)).background).toBe('rgba(0, 0, 0, 0.04)');
  expect(await bob.boundingBox()).toEqual(geometry);
  await charlie.hover();
  await expect.poll(async () => (await hoverLayer(bob)).background).toBe('rgba(0, 0, 0, 0)');
  await expect.poll(async () => (await hoverLayer(charlie)).background).toBe('rgba(0, 0, 0, 0.04)');
  const disabled = panel.getByRole('option', { name: 'Unavailable', exact: true });
  await disabled.hover();
  expect((await hoverLayer(disabled)).background).toBe('rgba(0, 0, 0, 0)');
  await charlie.click();
  await expect(page.getByRole('combobox', { name: 'Animated select' })).toHaveValue('Charlie');
});

test('Tree and TreeSelect fade row-local feedback without moving selection checks', async ({
  page,
}) => {
  await page.goto('/?fixture=refinements');
  await page.getByRole('combobox', { name: 'Animated tree select' }).click();
  const panel = page.locator('.leaf-tree-select__panel');
  const selected = panel.getByRole('treeitem', { name: 'Alice', exact: true });
  const target = panel.getByRole('treeitem', { name: 'Bob', exact: true });
  const selectedRow = selected.locator('.leaf-tree__row');
  const targetRow = target.locator('.leaf-tree__row');
  await settleAnimations(panel);
  await expect(panel.locator('.leaf-tree__highlight')).toHaveCount(0);
  await expect(selectedRow).toHaveAttribute('data-highlighted', 'true');
  await expect(selectedRow).toHaveCSS('margin-top', '0px');
  await expect(targetRow).toHaveCSS('margin-top', '0px');
  const selectedMetrics = await selectedRow.evaluate((node) => ({
    top: (node as HTMLElement).offsetTop,
    height: (node as HTMLElement).offsetHeight,
  }));
  const targetMetrics = await targetRow.evaluate((node) => ({
    top: (node as HTMLElement).offsetTop,
    height: (node as HTMLElement).offsetHeight,
  }));
  expect(targetMetrics.top - selectedMetrics.top).toBe(selectedMetrics.height);
  expect(targetMetrics.height).toBe(selectedMetrics.height);
  await targetRow.evaluate((node) =>
    node.addEventListener('transitionrun', (event) => {
      if ((event as TransitionEvent).propertyName === 'background-color')
        node.setAttribute('data-background-transition', 'true');
    }),
  );
  const geometry = await targetRow.boundingBox();
  await target.hover();
  await expect(targetRow).toHaveAttribute('data-background-transition', 'true');
  await expect
    .poll(async () => (await hoverLayer(targetRow)).background)
    .toBe('rgba(0, 0, 0, 0.04)');
  await expect
    .poll(async () => (await hoverLayer(selectedRow)).background)
    .toBe('rgba(0, 0, 0, 0)');
  expect(await targetRow.boundingBox()).toEqual(geometry);
  await expect(targetRow).toHaveCSS('border-radius', '6px');
  expect((await hoverLayer(targetRow)).transition).not.toContain('translate');
  await expect(selected.locator('.leaf-tree__selection-mark')).toHaveCSS('opacity', '1');
  await page.mouse.move(0, 0);
  await expect(selectedRow).toHaveAttribute('data-highlighted', 'true');
  await expect
    .poll(async () => (await hoverLayer(selectedRow)).background)
    .toBe('rgba(0, 0, 0, 0.04)');
  const disabled = panel
    .getByRole('treeitem', { name: 'Unavailable', exact: true })
    .locator('.leaf-tree__row');
  await disabled.hover();
  await expect.poll(async () => (await hoverLayer(disabled)).background).toBe('rgba(0, 0, 0, 0)');
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();

  await page.getByRole('combobox', { name: 'Empty tree select' }).click();
  const emptyPanel = page.locator('.leaf-tree-select__panel');
  const first = emptyPanel.getByRole('treeitem', { name: 'Alice', exact: true });
  await expect(first.locator('.leaf-tree__row')).toHaveAttribute('data-highlighted', 'true');
  await expect
    .poll(async () => (await hoverLayer(first.locator('.leaf-tree__row'))).background)
    .toBe('rgba(0, 0, 0, 0.04)');
  await expect(first.locator('.leaf-tree__selection-mark')).toHaveCSS('opacity', '0');
  await page.keyboard.press('Escape');
  await expect(emptyPanel).toBeHidden();

  const tree = page.getByRole('tree', { name: 'Animated tree' });
  const treeSelected = tree.getByRole('treeitem', { name: 'Alice', exact: true });
  const treeTarget = tree.getByRole('treeitem', { name: 'Bob', exact: true });
  const treeSelectedRow = treeSelected.locator('.leaf-tree__row');
  await expect(tree.locator('.leaf-tree__highlight')).toHaveCount(0);
  await expect(treeSelectedRow).toHaveCSS('border-radius', '6px');
  await treeTarget.hover();
  await expect
    .poll(async () => (await hoverLayer(treeTarget.locator('.leaf-tree__row'))).background)
    .toBe('rgba(0, 0, 0, 0.04)');
  await page.mouse.move(0, 0);
  await expect
    .poll(async () => (await hoverLayer(treeSelectedRow)).background)
    .toBe('rgba(0, 0, 0, 0)');
  await expect(treeSelected.locator('.leaf-tree__selection-mark')).toHaveCSS('opacity', '1');
});

test('a disabled selected Tree row retains muted ink without hover feedback', async ({ page }) => {
  await page.goto('/?fixture=refinements&disabled-selection');
  const tree = page.getByRole('tree', { name: 'Animated tree', exact: true });
  const selected = tree.getByRole('treeitem', { name: 'Unavailable', exact: true });
  const row = selected.locator('.leaf-tree__row');
  await expect(selected).toHaveAttribute('aria-disabled', 'true');
  await expect(selected).toHaveAttribute('aria-selected', 'true');
  const muted = await tokenColor(row, '--leaf-color-text-muted');
  await expect(row).toHaveCSS('color', muted);
  await row.hover();
  await expect(row).toHaveCSS('color', muted);
  await expect.poll(async () => (await hoverLayer(row)).background).toBe('rgba(0, 0, 0, 0)');
  await expect(row.locator('.leaf-tree__selection-mark')).toHaveCSS('opacity', '1');
});

test('long Cascader columns scroll independently without consuming option width', async ({
  page,
}) => {
  await page.goto('/?fixture=refinements&rtl=1');
  await page.getByRole('combobox', { name: 'Animated cascader' }).click();
  const panel = page.locator('.leaf-cascader__panel');
  await panel.getByRole('option', { name: 'Engineering', exact: true }).click();
  const column = panel.locator('.leaf-cascader__column').last();
  await expect(column.getByRole('scrollbar', { name: 'Vertical scrollbar' })).toBeAttached();
  const viewport = column.locator('.leaf-scrollbar__viewport');
  await expect(viewport).toHaveCSS('scrollbar-width', 'none');
  const first = column.getByRole('option', { name: 'Team 1', exact: true });
  await first.press('End');
  const last = column.getByRole('option', { name: 'Team 18', exact: true });
  await expect(last).toBeFocused();
  await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  await last.press('Enter');
  await expect(panel).toBeHidden();
});

test('single-line Alert aligns its icon with the title and Dropdown colors danger hover', async ({
  page,
}) => {
  await page.goto('/?fixture=refinements');
  const notice = page.getByRole('status').filter({ hasText: 'One-line notice' });
  const icon = await notice.locator('.leaf-alert__icon').boundingBox();
  const title = await notice.locator('.leaf-alert__title').boundingBox();
  expect((icon?.y ?? 0) + (icon?.height ?? 0) / 2).toBeCloseTo(
    (title?.y ?? 0) + (title?.height ?? 0) / 2,
    0,
  );
  await page.getByRole('button', { name: 'Animated menu' }).click();
  const edit = page.getByRole('menuitem', { name: 'Edit', exact: true });
  const neutral = 'rgba(0, 0, 0, 0.04)';
  await edit.hover();
  await expect.poll(async () => (await hoverLayer(edit)).background).toBe(neutral);
  const layer = await hoverLayer(edit);
  expect(layer).toMatchObject({
    borderStyle: 'none',
    borderWidth: '0px',
    boxShadow: 'none',
  });
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).hover();
  await expect
    .poll(async () => (await hoverLayer(page.getByRole('menuitem', { name: 'Delete' }))).background)
    .toBe(await tokenColor(edit, '--leaf-color-danger-soft'));
});

test('Dropdown grows from a 160px minimum and keeps trailing content at the row end', async ({
  page,
}) => {
  await page.goto('/?fixture=refinements');
  await page.getByRole('button', { name: 'Trailing menu' }).click();
  const panel = page.locator('.leaf-dropdown');
  const open = panel.getByRole('menuitem', { name: /Open Ctrl O/ });
  const extra = open.locator('.leaf-dropdown__extra');
  const more = panel.getByRole('menuitem', { name: /More Ctrl M/ });
  const arrow = more.locator('.leaf-dropdown__arrow');
  const longExtra = panel
    .getByRole('menuitem', { name: /Status Awaiting a long-running export/ })
    .locator('.leaf-dropdown__extra');

  await expect(panel).toHaveCSS('min-width', '160px');
  await panel.evaluate((node) => {
    for (const animation of node.getAnimations()) animation.finish();
  });
  expect((await panel.boundingBox())?.width).toBeGreaterThan(220);
  const row = await open.boundingBox();
  const trailing = await extra.boundingBox();
  const inlineEnd = await open.evaluate((node) =>
    Number.parseFloat(getComputedStyle(node).paddingInlineEnd),
  );
  if (!row || !trailing) throw new Error('Missing Dropdown row geometry');
  expect(row.x + row.width - (trailing.x + trailing.width)).toBeCloseTo(inlineEnd, 0);
  expect(await arrow.evaluate((node) => node.previousElementSibling?.className)).toContain(
    'leaf-dropdown__extra',
  );
  expect(
    await longExtra.evaluate((node) => ({
      display: getComputedStyle(node).display,
      overflow: getComputedStyle(node).overflow,
      textAlign: getComputedStyle(node).textAlign,
      textOverflow: getComputedStyle(node).textOverflow,
      clipped: node.scrollWidth > node.clientWidth,
    })),
  ).toEqual({
    display: 'block',
    overflow: 'hidden',
    textAlign: 'end',
    textOverflow: 'ellipsis',
    clipped: true,
  });
});

test('Dropdown preserves an explicit popup width', async ({ page }) => {
  await page.goto('/?fixture=refinements');
  const trigger = page.getByRole('button', { name: 'Narrow menu' });
  await trigger.click();
  const popupId = await trigger.getAttribute('aria-controls');
  if (!popupId) throw new Error('Dropdown trigger has no aria-controls');
  const panel = page
    .locator(`[id="${popupId}"]`)
    .locator(
      'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " leaf-dropdown ")][1]',
    );
  await expect(panel).toBeVisible();
  await panel.evaluate((node) => {
    for (const animation of node.getAnimations()) animation.finish();
  });
  expect((await panel.boundingBox())?.width).toBeCloseTo(160, 0);
});

for (const appearance of ['light', 'dark']) {
  test(`Dropdown feedback follows keyboard and pointer targets in ${appearance}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?fixture=refinements&theme=${appearance}`);
    const trigger = page.getByRole('button', { name: 'Animated menu' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    const first = page.getByRole('menuitem', { name: 'Open', exact: true });
    const second = page.getByRole('menuitem', { name: 'Edit', exact: true });
    const danger = page.getByRole('menuitem', { name: 'Delete', exact: true });
    await expect(first).toBeFocused();
    const neutral = 'rgba(0, 0, 0, 0.04)';
    await expect.poll(async () => (await hoverLayer(first)).background).toBe(neutral);
    await expect.poll(async () => (await hoverLayer(first)).opacity).toBe(1);
    await second.hover();
    await expect(first).toBeFocused();
    await expect.poll(async () => (await hoverLayer(second)).background).toBe(neutral);
    await expect.poll(async () => (await hoverLayer(second)).opacity).toBe(1);
    await expect(first).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(second).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await danger.hover();
    const dangerHover = await tokenColor(danger, '--leaf-color-danger-soft');
    await expect.poll(async () => (await hoverLayer(danger)).background).toBe(dangerHover);
    await page.keyboard.press('End');
    await expect(danger).toBeFocused();
    await expect.poll(async () => (await hoverLayer(danger)).background).toBe(dangerHover);
    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
    await expect.poll(async () => (await hoverLayer(first)).background).toBe(neutral);
  });
}

test('Dropdown fades only background color and preserves row geometry', async ({ page }) => {
  await page.goto('/?fixture=refinements');
  await page.getByRole('button', { name: 'Animated menu' }).click();
  const item = page.getByRole('menuitem', { name: 'Edit', exact: true });
  await settleAnimations(page.locator('.leaf-dropdown'));
  await expect.poll(async () => (await hoverLayer(item)).background).toBe('rgba(0, 0, 0, 0)');
  const before = await item.boundingBox();
  await expect(item).toHaveCSS('min-height', '34px');
  await expect(item).toHaveCSS('gap', '12px');
  await item.evaluate((node) => {
    node.addEventListener('transitionrun', (event) => {
      if ((event as TransitionEvent).propertyName === 'background-color')
        node.setAttribute('data-background-transition', 'true');
    });
  });
  await item.hover();
  await expect(item).toHaveAttribute('data-background-transition', 'true');
  await expect.poll(async () => (await hoverLayer(item)).background).toBe('rgba(0, 0, 0, 0.04)');
  const layer = await hoverLayer(item);
  expect(layer).toMatchObject({
    borderStyle: 'none',
    borderWidth: '0px',
    top: '0px',
    bottom: '0px',
    boxShadow: 'none',
    opacity: 1,
    transition: 'background-color',
  });
  expect(await item.boundingBox()).toEqual(before);
  await page.mouse.move(0, 0);
  await expect.poll(async () => (await hoverLayer(item)).background).toBe('rgba(0, 0, 0, 0)');
});

for (const appearance of ['light', 'dark']) {
  test(`Select keeps pale rounded feedback and persistent checks in ${appearance}`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=refinements&theme=${appearance}`);
    const input = page.getByRole('combobox', { name: 'Animated select' });
    await input.click();
    const selected = page.getByRole('option', { name: 'Alice', exact: true });
    const next = page.getByRole('option', { name: 'Bob', exact: true });
    const neutral = 'rgba(0, 0, 0, 0.04)';
    await expect(selected.locator('.leaf-select__check')).toHaveCSS('opacity', '1');
    await expect.poll(async () => (await hoverLayer(selected)).background).toBe(neutral);
    await next.hover();
    await expect.poll(async () => (await hoverLayer(next)).background).toBe(neutral);
    await expect.poll(async () => (await hoverLayer(selected)).background).toBe('rgba(0, 0, 0, 0)');
    await expect(selected.locator('.leaf-select__check')).toHaveCSS('opacity', '1');
    const disabled = page.getByRole('option', { name: 'Unavailable', exact: true });
    await disabled.hover();
    expect((await hoverLayer(disabled)).background).toBe('rgba(0, 0, 0, 0)');
    await page.mouse.move(0, 0);
    await expect.poll(async () => (await hoverLayer(selected)).background).toBe(neutral);
    await input.press('ArrowDown');
    await expect.poll(async () => (await hoverLayer(next)).background).toBe(neutral);
    await input.press('ArrowUp');
    await expect.poll(async () => (await hoverLayer(selected)).background).toBe(neutral);
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    await expect(next).toHaveAttribute('aria-selected', 'false');
  });
}

test('Progress shimmer moves right inside the fill and stops for static, completed and failed states', async ({
  page,
}) => {
  await page.goto('/?fixture=refinements');
  const progress = page.getByRole('progressbar', { name: 'In progress', exact: true });
  const fill = progress.locator('.leaf-progress__fill');
  await expect(fill).toHaveCSS('overflow', 'hidden');
  const motion = await fill.evaluate(async (node) => {
    // Pseudo-element animations belong to the element's animation subtree.
    getComputedStyle(node, '::after').animationName;
    const animation = node
      .getAnimations({ subtree: true })
      .find((motion) => (motion as CSSAnimation).animationName === 'leaf-progress-shimmer');
    if (!animation) throw new Error('Missing progress shimmer');
    const duration = Number(animation.effect?.getComputedTiming().duration);
    animation.pause();
    animation.currentTime = 0;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const start = new DOMMatrixReadOnly(getComputedStyle(node, '::after').transform).m41;
    animation.currentTime = duration / 2;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const middle = new DOMMatrixReadOnly(getComputedStyle(node, '::after').transform).m41;
    const parent = node.parentElement;
    return {
      start,
      middle,
      width: node.getBoundingClientRect().width,
      track: parent?.getBoundingClientRect().width ?? 0,
    };
  });
  expect(motion.start).toBeLessThan(0);
  expect(motion.middle).toBeGreaterThan(0);
  expect(motion.width / motion.track).toBeCloseTo(0.48, 2);
  for (const name of ['Static progress', 'Completed', 'Failed']) {
    const bar = page.getByRole('progressbar', { name, exact: true });
    await expect(bar).not.toHaveAttribute('data-active');
    expect(
      await bar
        .locator('.leaf-progress__fill')
        .evaluate((node) => getComputedStyle(node, '::after').animationName),
    ).toBe('none');
  }
});

for (const preference of ['reduce', 'scope'] as const) {
  test(`popup hover and progress honor ${preference} motion preferences`, async ({ page }) => {
    if (preference === 'reduce') await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?fixture=refinements${preference === 'scope' ? '&no-motion' : ''}`);
    const fill = page
      .getByRole('progressbar', { name: 'In progress', exact: true })
      .locator('.leaf-progress__fill');
    expect(await fill.evaluate((node) => getComputedStyle(node, '::after').animationName)).toBe(
      'none',
    );
    await page.getByRole('combobox', { name: 'Animated select' }).click();
    await page.getByRole('option', { name: 'Bob', exact: true }).hover();
    const option = page.getByRole('option', { name: 'Bob', exact: true });
    expect(
      await option.evaluate((node) => getComputedStyle(node, '::before').transitionDuration),
    ).toMatch(/^0s(?:,\s*0s)*$/);
  });
}
