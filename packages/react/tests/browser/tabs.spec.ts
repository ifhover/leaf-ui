import { expect, type Locator, test } from '@playwright/test';

async function sampleOverflow(root: Locator) {
  await root.evaluate((node) => {
    node.dataset.overflowFrames = '[]';
    node.dataset.sampling = 'true';
    const start = performance.now();
    const frames: {
      time: number;
      part: string;
      width: number;
      scroll: number;
      height: number;
      scrollHeight: number;
    }[] = [];
    const sample = () => {
      for (const [part, element] of [
        ['tabs', node],
        ['list', node.querySelector('.leaf-tabs__list')],
      ] as const) {
        if (!element) continue;
        if (
          element.scrollWidth > element.clientWidth + 1 ||
          element.scrollHeight > element.clientHeight + 1
        ) {
          frames.push({
            time: performance.now() - start,
            part,
            width: element.clientWidth,
            scroll: element.scrollWidth,
            height: element.clientHeight,
            scrollHeight: element.scrollHeight,
          });
        }
      }
      node.dataset.overflowFrames = JSON.stringify(frames);
      if (node.isConnected && node.dataset.sampling === 'true') requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

for (const query of ['', '&line=1', '&segmented=1', '&rtl=1&theme=dark', '&compact=1']) {
  test(`switching and closing fitting tabs never creates scroll overflow (${query || 'default'})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=tabs${query}`);
    const root = page.getByTestId('motion-tabs');
    await page
      .getByRole('textbox', { name: 'Retained draft', exact: true })
      .fill('keep this draft');
    await sampleOverflow(root);
    // Sample intermediate frames as well as the settled layout; these delays are
    // part of the motion regression, not waits for an element to become ready.
    for (const name of ['A longer second tab', 'Third', 'First', 'Third', 'A longer second tab']) {
      await root.getByRole('tab', { name, exact: true }).click();
      await page.waitForTimeout(60);
    }
    await root.getByRole('button', { name: 'Close tab A longer second tab', exact: true }).click();
    await page.waitForTimeout(400);
    await root.getByRole('tab', { name: 'First', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Retained draft', exact: true })).toHaveValue(
      'keep this draft',
    );
    await page.waitForTimeout(400);
    const frames = await root.evaluate((node) => {
      node.dataset.sampling = 'false';
      return JSON.parse(node.dataset.overflowFrames ?? '[]');
    });
    expect(frames).toEqual([]);
    await expect(page.getByRole('button', { name: /^Scroll tabs (left|right)$/ })).toHaveCount(0);
    await root.getByRole('button', { name: 'Close tab Third', exact: true }).click();
    await root.getByRole('button', { name: 'Close tab First', exact: true }).click();
    await expect(root).toHaveCount(0);
    await expect(page.getByRole('tablist')).toHaveCount(0);
    await page.getByRole('button', { name: 'Restore tabs', exact: true }).click();
    await expect(root.getByRole('tab')).toHaveCount(3);
    await root.getByRole('tab', { name: 'A longer second tab', exact: true }).click();
    await expect
      .poll(() =>
        root.locator('.leaf-tabs__indicator').evaluate((marker) => {
          const active = marker.closest('.leaf-tabs')?.querySelector('[data-active="true"]');
          return active
            ? Math.abs(marker.getBoundingClientRect().x - active.getBoundingClientRect().x)
            : Infinity;
        }),
      )
      .toBeLessThan(1);
  });
}

for (const appearance of ['light', 'dark']) {
  test(`line tabs use the primary indicator color in ${appearance} appearance`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=tabs&view=1&line=1&theme=${appearance}`);
    const root = page.getByTestId('view-tabs');
    await expect(root.getByRole('tab', { name: 'Week', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const colors = await root.evaluate((node) => {
      const indicator = node.querySelector('.leaf-tabs__indicator');
      if (!indicator) throw new Error('Missing line indicator');
      const probe = document.createElement('span');
      probe.style.backgroundColor =
        'var(--leaf-color-primary-indicator, var(--leaf-color-primary))';
      node.append(probe);
      const expected = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return {
        indicator: getComputedStyle(indicator, '::after').backgroundColor,
        expected,
        text: getComputedStyle(node).color,
      };
    });
    expect(colors.indicator).toBe(colors.expected);
    expect(colors.indicator).not.toBe(colors.text);
  });
}

for (const rtl of [false, true]) {
  test(`true horizontal overflow uses directional buttons and disappears when tabs fit (${rtl ? 'rtl' : 'ltr'})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=tabs&narrow=1${rtl ? '&rtl=1' : ''}`);
    const root = page.getByTestId('motion-tabs');
    const list = root.locator('.leaf-tabs__list');
    const header = root.locator('.leaf-tabs__header');
    const start = root.locator('.leaf-tabs__scroll-action--start');
    const end = root.locator('.leaf-tabs__scroll-action--end');
    await expect
      .poll(() => list.evaluate((node) => node.scrollWidth - node.clientWidth))
      .toBeGreaterThan(0);
    await expect(end).toHaveCount(1);
    await expect(end).toBeHidden();
    await header.hover();
    await expect(end).toBeVisible();
    const before = await list.evaluate((node) => Math.abs(node.scrollLeft));
    await end.click();
    await expect
      .poll(() => list.evaluate((node) => Math.abs(node.scrollLeft)))
      .toBeGreaterThan(before);
    await expect(start).toBeVisible();
    await root.getByRole('tab', { name: 'Third', exact: true }).click();
    await expect(root.getByRole('tab', { name: 'Third', exact: true })).toBeFocused();
    await root.getByRole('button', { name: 'Close tab A longer second tab', exact: true }).click();
    await root.getByRole('button', { name: 'Close tab Third', exact: true }).click();
    await expect(page.getByRole('button', { name: /^Scroll tabs (left|right)$/ })).toHaveCount(0);
    await expect
      .poll(() => list.evaluate((node) => node.scrollWidth - node.clientWidth))
      .toBeLessThanOrEqual(1);
  });
}

for (const size of ['sm', 'md', 'lg']) {
  test(`card ${size} view switcher keeps compact geometry and never scales on press`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=tabs&view=1&size=${size}`);
    const root = page.getByTestId('view-tabs');
    const list = root.getByRole('tablist');
    const week = root.getByRole('tab', { name: 'Week', exact: true });
    const month = root.getByRole('tab', { name: 'Month', exact: true });
    const metrics = await root.evaluate((node) => {
      const list = node.querySelector('.leaf-tabs__list');
      const track = node.querySelector('.leaf-tabs__track');
      const tabs = [...node.querySelectorAll('.leaf-tabs__tab')];
      if (!list || !track || !tabs[0]) throw new Error('Missing view tabs');
      return {
        height: list.getBoundingClientRect().height,
        rootHeight: node.getBoundingClientRect().height,
        gap: getComputedStyle(track).gap,
        widths: tabs.map((tab) => tab.getBoundingClientRect().width),
        color: getComputedStyle(tabs[0]).color,
        expectedColor: getComputedStyle(node).color,
      };
    });
    const height = size === 'sm' ? 28 : size === 'lg' ? 40 : 34;
    expect(metrics.height).toBe(height);
    expect(metrics.rootHeight).toBe(height);
    expect(metrics.gap).toBe('4px');
    expect(Math.max(...metrics.widths) - Math.min(...metrics.widths)).toBeLessThan(1);
    expect(metrics.color).toBe(metrics.expectedColor);
    await expect(root.getByRole('tabpanel')).toHaveCount(0);
    await month.hover();
    const before = await month.boundingBox();
    await page.mouse.down();
    await expect(month).toHaveCSS('transform', 'none');
    expect(await month.boundingBox()).toEqual(before);
    await page.mouse.up();
    await expect(month).toHaveAttribute('aria-selected', 'true');
    await expect(month).toHaveCSS('color', metrics.expectedColor);
    await expect(list).toHaveCSS('height', `${height}px`);
    await week.focus();
    await page.keyboard.press('End');
    await expect(month).toBeFocused();
  });

  test(`card ${size} header fits its labels and uses the full control height`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`/?fixture=tabs&wide=1&size=${size}`);
    const root = page.getByTestId('motion-tabs');
    const list = root.locator('.leaf-tabs__list');
    const height = size === 'sm' ? 28 : size === 'lg' ? 40 : 34;
    const metrics = await root.evaluate((node) => {
      const list = node.querySelector('.leaf-tabs__list');
      const track = node.querySelector('.leaf-tabs__track');
      const tab = node.querySelector('.leaf-tabs__tab');
      if (!list || !track || !tab) throw new Error('Missing tab header');
      return {
        rootWidth: node.getBoundingClientRect().width,
        listWidth: list.getBoundingClientRect().width,
        listHeight: list.getBoundingClientRect().height,
        tabHeight: tab.getBoundingClientRect().height,
        trackWidth: track.getBoundingClientRect().width,
      };
    });
    expect(metrics.listHeight).toBe(height);
    expect(metrics.tabHeight).toBe(height);
    expect(metrics.listWidth).toBeLessThan(metrics.rootWidth - height - 24);
    expect(Math.abs(metrics.listWidth - metrics.trackWidth)).toBeLessThan(1);
    await root.getByRole('tab', { name: 'A longer second tab', exact: true }).click();
    await expect
      .poll(() => list.evaluate((node) => node.getBoundingClientRect().width), {
        timeout: 20_000,
      })
      .toBe(metrics.listWidth);
    await expect(root.getByRole('button', { name: /^Scroll tabs (left|right)$/ })).toHaveCount(0);
    await root.evaluate((node) => {
      node.style.width = '230px';
    });
    const end = root.locator('.leaf-tabs__scroll-action--end');
    await expect(end).toHaveCount(1, { timeout: 20_000 });
    await root.locator('.leaf-tabs__header').hover();
    await expect(end).toBeVisible({ timeout: 20_000 });
    await expect
      .poll(() => list.evaluate((node) => node.scrollWidth - node.clientWidth), {
        timeout: 20_000,
      })
      .toBeGreaterThan(0);
    await root.evaluate((node) => {
      node.style.width = '640px';
    });
    await expect(root.getByRole('button', { name: /^Scroll tabs (left|right)$/ })).toHaveCount(0, {
      timeout: 20_000,
    });
    await expect
      .poll(() => list.evaluate((node) => node.scrollWidth - node.clientWidth), {
        timeout: 20_000,
      })
      .toBeLessThanOrEqual(1);
  });

  test(`card add action matches the ${size} header without moving the close button`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=tabs&size=${size}`);
    const root = page.getByTestId('motion-tabs');
    const metrics = await root.evaluate((node) => {
      const list = node.querySelector('.leaf-tabs__list');
      const button = node.querySelector('.leaf-tabs__action');
      if (!list || !button) throw new Error('Missing tab header');
      return {
        list: list.getBoundingClientRect().height,
        action: button.getBoundingClientRect().height,
      };
    });
    expect(Math.abs(metrics.list - metrics.action)).toBeLessThan(1);
    expect(metrics.list).toBe(size === 'sm' ? 28 : size === 'lg' ? 40 : 34);
    const close = root.getByRole('button', { name: 'Close tab First', exact: true });
    await close.hover();
    const before = await close.boundingBox();
    await page.mouse.down();
    await page.waitForTimeout(160);
    expect(await close.boundingBox()).toEqual(before);
    await expect(close).toHaveCSS('transform', 'none');
    await page.mouse.move(0, 0);
    await page.mouse.up();
  });
}

for (const size of ['sm', 'md', 'lg']) {
  test(`segmented ${size} tabs use a nested white selection surface`, async ({ page }) => {
    await page.goto(`/?fixture=tabs&view=1&segmented=1&size=${size}`);
    const root = page.getByTestId('view-tabs');
    const list = root.getByRole('tablist');
    const week = root.getByRole('tab', { name: 'Week', exact: true });
    const month = root.getByRole('tab', { name: 'Month', exact: true });
    const height = size === 'sm' ? 28 : size === 'lg' ? 40 : 34;
    const metrics = await root.evaluate((node) => {
      const list = node.querySelector('.leaf-tabs__list');
      const track = node.querySelector('.leaf-tabs__track');
      const indicator = node.querySelector('.leaf-tabs__indicator');
      const tabs = [...node.querySelectorAll('.leaf-tabs__tab')];
      if (!list || !track || !indicator || !tabs[0]) throw new Error('Missing segmented tabs');
      const listStyle = getComputedStyle(list);
      const tabStyle = getComputedStyle(tabs[0]);
      const indicatorStyle = getComputedStyle(indicator);
      const listBox = list.getBoundingClientRect();
      const indicatorBox = indicator.getBoundingClientRect();
      return {
        height: listBox.height,
        rootHeight: node.getBoundingClientRect().height,
        tabHeight: tabs[0].getBoundingClientRect().height,
        indicatorHeight: indicatorBox.height,
        indicatorInset: indicatorBox.left - listBox.left,
        widths: tabs.map((tab) => tab.getBoundingClientRect().width),
        gap: getComputedStyle(track).gap,
        padding: listStyle.paddingLeft,
        border: listStyle.borderLeftWidth,
        radius: Number.parseFloat(listStyle.borderTopLeftRadius),
        tabRadius: Number.parseFloat(tabStyle.borderTopLeftRadius),
        listBackground: listStyle.backgroundColor,
        indicatorBackground: indicatorStyle.backgroundColor,
        indicatorShadow: indicatorStyle.boxShadow,
        selectedColor: tabStyle.color,
        expectedColor: getComputedStyle(node).color,
      };
    });
    expect(metrics.height).toBe(height);
    expect(metrics.rootHeight).toBe(height);
    expect(metrics.tabHeight).toBe(height - 8);
    expect(metrics.indicatorHeight).toBe(metrics.tabHeight);
    expect(metrics.indicatorInset).toBeCloseTo(4, 0);
    expect(Math.max(...metrics.widths) - Math.min(...metrics.widths)).toBeLessThan(1);
    expect(metrics.gap).toBe('3px');
    expect(metrics.padding).toBe('3px');
    expect(metrics.border).toBe('1px');
    expect(metrics.tabRadius).toBe(Math.max(0, metrics.radius - 4));
    expect(metrics.listBackground).not.toBe('rgba(0, 0, 0, 0)');
    expect(metrics.indicatorBackground).not.toBe(metrics.listBackground);
    expect(metrics.indicatorShadow).not.toBe('none');
    expect(metrics.selectedColor).toBe(metrics.expectedColor);
    await month.hover();
    const before = await month.boundingBox();
    await page.mouse.down();
    await expect(month).toHaveCSS('transform', 'none');
    expect(await month.boundingBox()).toEqual(before);
    await page.mouse.up();
    await expect(month).toHaveAttribute('aria-selected', 'true');
    const motion = await root.evaluate((node) => {
      const indicator = node.querySelector('.leaf-tabs__indicator');
      if (!indicator) throw new Error('Missing segmented indicator');
      const style = getComputedStyle(node);
      const points = (value: string) =>
        [...value.matchAll(/-?\d*\.?\d+/g)].map(([number]) => Number(number));
      const timing = getComputedStyle(indicator).transitionTimingFunction;
      return {
        timing: [...timing.matchAll(/cubic-bezier\(([^)]+)\)/g)].map(([, value]) =>
          points(value ?? ''),
        ),
        easing: points(style.getPropertyValue('--leaf-motion-easing')),
        spring: points(style.getPropertyValue('--leaf-motion-spring')),
      };
    });
    expect(motion.timing).toHaveLength(3);
    for (const timing of motion.timing) {
      expect(timing).toEqual(motion.easing);
      expect(timing).not.toEqual(motion.spring);
    }
    await expect(list).toHaveCSS('height', `${height}px`);
    await week.focus();
    await page.keyboard.press('End');
    await expect(month).toBeFocused();
  });
}

test('segmented tabs keep the raised selection visible in dark appearance', async ({ page }) => {
  await page.goto('/?fixture=tabs&view=1&segmented=1&theme=dark');
  const root = page.getByTestId('view-tabs');
  const colors = await root.evaluate((node) => {
    const list = node.querySelector('.leaf-tabs__list');
    const indicator = node.querySelector('.leaf-tabs__indicator');
    const selected = node.querySelector('.leaf-tabs__tab[aria-selected="true"]');
    if (!list || !indicator || !selected) throw new Error('Missing segmented tabs');
    return {
      track: getComputedStyle(list).backgroundColor,
      indicator: getComputedStyle(indicator).backgroundColor,
      selected: getComputedStyle(selected).color,
      expected: getComputedStyle(node).color,
    };
  });
  expect(colors.track).not.toBe('rgba(0, 0, 0, 0)');
  expect(colors.indicator).not.toBe(colors.track);
  expect(colors.selected).toBe(colors.expected);
});
