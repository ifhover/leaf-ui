import { TinyColor } from '@ctrl/tinycolor';
import { expect, test } from '@playwright/test';

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
  const insets = await panel.evaluate((node) => {
    const panel = node.getBoundingClientRect();
    const options = node.querySelectorAll('.leaf-cascader__column .leaf-floating__option');
    const first = options[0]?.getBoundingClientRect();
    const last = options[options.length - 1]?.getBoundingClientRect();
    if (!first || !last) throw new Error('Missing cascade options');
    return [first.left - panel.left, panel.right - last.right] as const;
  });
  expect(insets[0]).toBeCloseTo(insets[1], 0);
  await panel.getByRole('option', { name: 'UI', exact: true }).click();
  await expect(panel).toBeHidden();
});

for (const [suffix, height] of [
  ['', 32],
  ['&compact=1', 26],
  ['&tokens=1', 40],
] as const) {
  test(`popup rows follow the regional control height ${height}px`, async ({ page }, testInfo) => {
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
      `${height}px`,
    );
    await expect
      .poll(
        async () =>
          (await page.getByRole('option', { name: 'Bob', exact: true }).boundingBox())?.height,
      )
      .toBeCloseTo(height, 0);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Animated menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Edit', exact: true })).toHaveCSS(
      'min-height',
      `${height}px`,
    );
    await expect
      .poll(
        async () =>
          (await page.getByRole('menuitem', { name: 'Edit', exact: true }).boundingBox())?.height,
      )
      .toBeCloseTo(height, 0);
  });
}

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
  const highlight = page.locator('.leaf-dropdown__highlight');
  const neutral = await highlight.evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(neutral).not.toBe('rgb(246, 246, 247)');
  await page.getByRole('menuitem', { name: 'Delete', exact: true }).hover();
  await expect(highlight).toHaveAttribute('data-danger', 'true');
  await expect
    .poll(() => highlight.evaluate((node) => getComputedStyle(node).backgroundColor))
    .not.toBe(neutral);
});

for (const appearance of ['light', 'dark']) {
  test(`Dropdown uses one background for keyboard and pointer highlights in ${appearance}`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=refinements&theme=${appearance}`);
    await page.getByRole('button', { name: 'Animated menu' }).click();
    const marker = page.locator('.leaf-dropdown__highlight');
    const first = page.getByRole('menuitem', { name: 'Open', exact: true });
    const second = page.getByRole('menuitem', { name: 'Edit', exact: true });
    const danger = page.getByRole('menuitem', { name: 'Delete', exact: true });
    await expect(first).toBeFocused();
    const neutral = new TinyColor(
      await marker.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-color-option-hover').trim(),
      ),
    ).toRgbString();
    await expect(marker).toHaveCSS('background-color', neutral);
    await second.hover();
    await expect(second).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(marker).toHaveCSS('background-color', neutral);
    // Pointer movement keeps keyboard focus, but neither row paints another background.
    await expect(first).toBeFocused();
    await expect(first).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await danger.hover();
    await expect(danger).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await page.keyboard.press('End');
    await expect(danger).toBeFocused();
    await expect(danger).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
    await marker.evaluate((node) => {
      for (const animation of node.getAnimations()) animation.finish();
    });
    await expect(marker).toHaveCSS('background-color', neutral);
    // Holding the pointer button must not add the shared option's pressed fill either.
    const target = await second.boundingBox();
    if (!target) throw new Error('Missing menu option');
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2);
    await page.mouse.down();
    try {
      await expect(second).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    } finally {
      await page.mouse.up();
    }
  });
}

for (const appearance of ['light', 'dark']) {
  test(`Select uses neutral candidates without changing selected rows in ${appearance}`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=refinements&theme=${appearance}`);
    const input = page.getByRole('combobox', { name: 'Animated select' });
    await input.click();
    const marker = page.locator('.leaf-select__panel .leaf-floating__highlight');
    const selected = page.getByRole('option', { name: 'Alice', exact: true });
    const next = page.getByRole('option', { name: 'Bob', exact: true });
    const background = new TinyColor(
      await marker.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-color-primary-surface-9').trim(),
      ),
    ).toRgbString();
    const neutral = new TinyColor(
      await marker.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-color-option-hover').trim(),
      ),
    ).toRgbString();
    expect(neutral).not.toBe(background);
    await expect(selected).toHaveCSS('background-color', background);
    await expect(marker).toBeVisible();
    await expect(marker).toHaveCSS('background-color', background);
    await next.hover();
    await expect(marker).toBeVisible();
    await expect(marker).toHaveCSS('background-color', neutral);
    await expect(selected).toHaveCSS('background-color', background);
    await expect(next).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await page.getByRole('option', { name: 'Unavailable', exact: true }).hover();
    await expect(marker).toHaveCSS('background-color', neutral);
    await expect(page.getByRole('option', { name: 'Unavailable', exact: true })).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    await selected.hover();
    await expect(marker).toBeVisible();
    await expect(marker).toHaveCSS('background-color', background);
    await input.press('ArrowDown');
    await expect(marker).toBeVisible();
    await expect(marker).toHaveCSS('background-color', neutral);
    await input.press('ArrowUp');
    await expect(marker).toBeVisible();
    await expect(marker).toHaveCSS('background-color', background);
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
