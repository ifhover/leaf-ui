import { TinyColor } from '@ctrl/tinycolor';
import { expect, type Locator, test } from '@playwright/test';

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
  ['', 34, 30],
  ['&compact=1', 30, 26],
  ['&tokens=1', 44, 40],
] as const) {
  test(`Select rows fill the field while shared menu rows stay compact ${selectHeight}/${menuHeight}px`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/?fixture=refinements${suffix}`);
    await page.getByRole('combobox', { name: 'Animated select' }).click();
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

test('Select hover moves one highlight, settles after rapid changes and skips disabled rows', async ({
  page,
}) => {
  await page.goto('/?fixture=refinements');
  await page.getByRole('combobox', { name: 'Animated select' }).click();
  const marker = page.locator('.leaf-select__panel .leaf-floating__highlight');
  await expect(marker).toHaveAttribute('data-ready', 'true');
  await marker.evaluate((node) =>
    node.addEventListener('transitionrun', (event) => {
      if ((event as TransitionEvent).propertyName === 'translate')
        node.setAttribute('data-translated', 'true');
    }),
  );
  await page.getByRole('option', { name: 'Bob', exact: true }).hover();
  await expect(marker).toHaveAttribute('data-translated', 'true');
  const target = page.getByRole('option', { name: 'Charlie', exact: true });
  await target.hover();
  await expect
    .poll(async () => {
      const mark = await marker.boundingBox();
      const row = await target.boundingBox();
      return mark && row ? Math.abs(mark.y - row.y) : Infinity;
    })
    .toBeLessThan(1);
  const before = await marker.getAttribute('style');
  await page.getByRole('option', { name: 'Unavailable', exact: true }).hover();
  expect(await marker.getAttribute('style')).toBe(before);
  await target.click();
  await expect(page.getByRole('combobox', { name: 'Animated select' })).toHaveValue('Charlie');
});

test('Tree and TreeSelect reuse the Select moving highlight', async ({ page }) => {
  await page.goto('/?fixture=refinements');
  await page.getByRole('combobox', { name: 'Animated tree select' }).click();
  const panel = page.locator('.leaf-tree-select__panel');
  const marker = panel.locator('.leaf-tree__highlight');
  const selected = panel.getByRole('treeitem', { name: 'Alice', exact: true });
  const target = panel.getByRole('treeitem', { name: 'Bob', exact: true });
  const selectedRow = selected.locator('.leaf-tree__row');
  const targetRow = target.locator('.leaf-tree__row');
  await expect(marker).toHaveAttribute('data-ready', 'true');
  await expect(marker).toHaveCSS(
    'border-radius',
    await selectedRow.evaluate((node) => getComputedStyle(node).borderRadius),
  );
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
  await marker.evaluate((node) =>
    node.addEventListener('transitionrun', (event) => {
      if ((event as TransitionEvent).propertyName === 'translate')
        node.setAttribute('data-translated', 'true');
    }),
  );
  await target.hover();
  await expect(marker).toHaveAttribute('data-translated', 'true');
  await expect(selected.locator('.leaf-tree__selection-mark')).toHaveCSS('opacity', '1');
  await page.mouse.move(0, 0);
  await expect
    .poll(async () => {
      const highlight = await marker.boundingBox();
      const row = await selected.locator('.leaf-tree__row').boundingBox();
      return highlight && row ? Math.abs(highlight.y - row.y) : Infinity;
    })
    .toBeLessThan(1);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();

  await page.getByRole('combobox', { name: 'Empty tree select' }).click();
  const emptyPanel = page.locator('.leaf-tree-select__panel');
  const emptyMarker = emptyPanel.locator('.leaf-tree__highlight');
  const first = emptyPanel.getByRole('treeitem', { name: 'Alice', exact: true });
  await expect(emptyMarker).toHaveAttribute('data-ready', 'true');
  await expect
    .poll(async () => {
      const highlight = await emptyMarker.boundingBox();
      const row = await first.locator('.leaf-tree__row').boundingBox();
      return highlight && row ? Math.abs(highlight.y - row.y) : Infinity;
    })
    .toBeLessThan(1);
  await expect(first.locator('.leaf-tree__selection-mark')).toHaveCSS('opacity', '0');
  await page.keyboard.press('Escape');
  await expect(emptyPanel).toBeHidden();

  const tree = page.getByRole('tree', { name: 'Animated tree' });
  const treeMarker = tree.locator('.leaf-tree__highlight');
  const treeSelected = tree.getByRole('treeitem', { name: 'Alice', exact: true });
  const treeTarget = tree.getByRole('treeitem', { name: 'Bob', exact: true });
  const treeSelectedRow = treeSelected.locator('.leaf-tree__row');
  await expect(treeMarker).toHaveCSS(
    'border-radius',
    await treeSelectedRow.evaluate((node) => getComputedStyle(node).borderRadius),
  );
  await treeTarget.hover();
  await expect(treeMarker).toHaveCSS(
    'background-color',
    await tokenColor(tree, '--leaf-color-option-hover'),
  );
  await page.mouse.move(0, 0);
  await expect
    .poll(async () => {
      const highlight = await treeMarker.boundingBox();
      const row = await treeSelectedRow.boundingBox();
      return highlight && row ? Math.abs(highlight.y - row.y) : Infinity;
    })
    .toBeLessThan(1);
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
  const neutral = await tokenColor(edit, '--leaf-color-option-hover');
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
    .toBe(await tokenColor(edit, '--leaf-color-danger-surface-6'));
});

test('Dropdown uses a 220px default width and keeps trailing content at the row end', async ({
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

  await expect(panel).toHaveCSS('min-width', '220px');
  await panel.evaluate((node) => {
    for (const animation of node.getAnimations()) animation.finish();
  });
  expect((await panel.boundingBox())?.width).toBeCloseTo(220, 0);
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
    const neutral = await tokenColor(first, '--leaf-color-option-hover');
    await expect.poll(async () => (await hoverLayer(first)).background).toBe(neutral);
    await expect.poll(async () => (await hoverLayer(first)).opacity).toBe(1);
    await second.hover();
    await expect(first).toBeFocused();
    await expect.poll(async () => (await hoverLayer(second)).background).toBe(neutral);
    await expect.poll(async () => (await hoverLayer(second)).opacity).toBe(1);
    await expect(first).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(second).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await danger.hover();
    const dangerHover = await tokenColor(danger, '--leaf-color-danger-surface-6');
    await expect.poll(async () => (await hoverLayer(danger)).background).toBe(dangerHover);
    await page.keyboard.press('End');
    await expect(danger).toBeFocused();
    await expect.poll(async () => (await hoverLayer(danger)).background).toBe(dangerHover);
    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
    await expect.poll(async () => (await hoverLayer(first)).background).toBe(neutral);
  });
}

test('Dropdown hover expands and fades like Menu without a border', async ({ page }) => {
  await page.goto('/?fixture=refinements');
  await page.getByRole('button', { name: 'Animated menu' }).click();
  const item = page.getByRole('menuitem', { name: 'Edit', exact: true });
  await expect.poll(async () => (await hoverLayer(item)).opacity).toBe(0);
  await item.evaluate((node) => {
    const capture = (event: Event) => {
      if (!(event instanceof TransitionEvent) || event.propertyName !== 'top') return;
      for (const animation of node.getAnimations({ subtree: true })) {
        animation.pause();
        animation.currentTime = 0;
      }
      node.removeEventListener('transitionrun', capture);
    };
    node.addEventListener('transitionrun', capture);
  });
  await item.hover();
  const samples = await item.evaluate((node) => {
    const properties = new Set(['top', 'right', 'bottom', 'left', 'opacity']);
    const animations = node
      .getAnimations({ subtree: true })
      .filter(
        (animation): animation is CSSTransition =>
          animation instanceof CSSTransition && properties.has(animation.transitionProperty),
      );
    if (
      !['top', 'bottom', 'opacity'].every((property) =>
        animations.some((animation) => animation.transitionProperty === property),
      )
    )
      throw new Error('Dropdown hover transitions did not start');
    const read = () => {
      const style = getComputedStyle(node, '::before');
      const row = node.getBoundingClientRect();
      return {
        borderStyle: style.borderTopStyle,
        borderWidth: style.borderTopWidth,
        bottom: Number.parseFloat(style.top) + Number.parseFloat(style.height),
        boxShadow: style.boxShadow,
        opacity: Number(style.opacity),
        rowHeight: row.height,
        top: Number.parseFloat(style.top),
      };
    };
    const frames = [0, 0.25, 0.5, 0.75, 0.995].map((progress) => {
      for (const animation of animations) {
        const duration = Number(animation.effect?.getTiming().duration);
        animation.currentTime = duration * progress;
      }
      return read();
    });
    for (const animation of animations) animation.finish();
    return [...frames, read()];
  });
  const [initial, quarter, halfway] = samples;
  if (!initial || !quarter || !halfway) throw new Error('Dropdown hover samples are missing');
  let previous = initial;
  for (const sample of samples.slice(1)) {
    expect(sample.bottom).toBeGreaterThanOrEqual(previous.bottom - 0.01);
    expect(sample.top).toBeLessThanOrEqual(previous.top + 0.01);
    expect(sample.opacity).toBeGreaterThan(previous.opacity);
    expect(sample.rowHeight).toBe(initial.rowHeight);
    previous = sample;
  }
  expect(quarter.opacity).toBeCloseTo(0.25, 2);
  expect(halfway.opacity).toBeCloseTo(0.5, 2);
  expect(samples.at(-1)).toMatchObject({
    borderStyle: 'none',
    borderWidth: '0px',
    bottom: initial.rowHeight,
    boxShadow: 'none',
    opacity: 1,
    top: 0,
  });
  await page.mouse.move(0, 0);
  await expect.poll(async () => (await hoverLayer(item)).opacity).toBe(0);
});

for (const appearance of ['light', 'dark']) {
  test(`Select uses one neutral highlight that follows the pointer in ${appearance}`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=refinements&theme=${appearance}`);
    const input = page.getByRole('combobox', { name: 'Animated select' });
    await input.click();
    const marker = page.locator('.leaf-select__panel .leaf-floating__highlight');
    const selected = page.getByRole('option', { name: 'Alice', exact: true });
    const next = page.getByRole('option', { name: 'Bob', exact: true });
    const neutral = new TinyColor(
      await marker.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-color-option-hover').trim(),
      ),
    ).toRgbString();
    await expect(selected).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(selected.locator('.leaf-select__check')).toHaveCSS('opacity', '1');
    await expect(marker).toBeVisible();
    await expect(marker).toHaveCSS('background-color', neutral);
    await next.hover();
    await expect(marker).toBeVisible();
    await expect(marker).toHaveCSS('background-color', neutral);
    await expect(selected).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(selected.locator('.leaf-select__check')).toHaveCSS('opacity', '1');
    await expect(next).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await page.getByRole('option', { name: 'Unavailable', exact: true }).hover();
    await expect(marker).toHaveCSS('background-color', neutral);
    await expect(page.getByRole('option', { name: 'Unavailable', exact: true })).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    await selected.hover();
    await expect(marker).toBeVisible();
    await expect(marker).toHaveCSS('background-color', neutral);
    await page.mouse.move(0, 0);
    await expect
      .poll(async () => {
        const mark = await marker.boundingBox();
        const row = await selected.boundingBox();
        return mark && row ? Math.abs(mark.y - row.y) : Infinity;
      })
      .toBeLessThan(1);
    await input.press('ArrowDown');
    await expect(marker).toBeVisible();
    await expect(marker).toHaveCSS('background-color', neutral);
    await input.press('ArrowUp');
    await expect(marker).toBeVisible();
    await expect(marker).toHaveCSS('background-color', neutral);
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
    await expect(page.locator('.leaf-floating__highlight')).toHaveCSS(
      'transition-duration',
      /^0s(?:,\s*0s)*$/,
    );
  });
}
