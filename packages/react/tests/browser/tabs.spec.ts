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

for (const query of ['', '&line=1', '&vertical=1', '&rtl=1&theme=dark', '&compact=1']) {
  test(`switching and closing fitting tabs never creates scroll overflow (${query || 'default'})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=tabs${query}`);
    const root = page.getByTestId('motion-tabs');
    await page
      .getByRole('textbox', { name: 'Retained draft', exact: true })
      .fill('keep this draft');
    await sampleOverflow(root);
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
    await expect(page.getByRole('button', { name: 'More tabs', exact: true })).toHaveCount(0);
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

test('true horizontal overflow remains usable and the menu disappears when tabs fit', async ({
  page,
}) => {
  await page.goto('/?fixture=tabs&narrow=1');
  const root = page.getByTestId('motion-tabs');
  const list = root.locator('.leaf-tabs__list');
  await expect
    .poll(() => list.evaluate((node) => node.scrollWidth - node.clientWidth))
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'More tabs', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Third', exact: true }).click();
  await expect(root.getByRole('tab', { name: 'Third', exact: true })).toBeFocused();
  await root.getByRole('button', { name: 'Close tab A longer second tab', exact: true }).click();
  await root.getByRole('button', { name: 'Close tab Third', exact: true }).click();
  await expect(page.getByRole('button', { name: 'More tabs', exact: true })).toHaveCount(0);
  await expect
    .poll(() => list.evaluate((node) => node.scrollWidth - node.clientWidth))
    .toBeLessThanOrEqual(1);
});

for (const size of ['sm', 'md', 'lg']) {
  test(`card ${size} header fits its labels and uses the full control height`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`/?fixture=tabs&wide=1&size=${size}`);
    const root = page.getByTestId('motion-tabs');
    const list = root.locator('.leaf-tabs__list');
    const height = size === 'sm' ? 30 : size === 'lg' ? 42 : 36;
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
    expect(metrics.tabHeight).toBeLessThan(height);
    expect(metrics.listWidth).toBeLessThan(metrics.rootWidth - height - 24);
    expect(Math.abs(metrics.listWidth - metrics.trackWidth - 2)).toBeLessThan(1);
    await root.getByRole('tab', { name: 'A longer second tab', exact: true }).click();
    await expect
      .poll(() => list.evaluate((node) => node.getBoundingClientRect().width), {
        timeout: 20_000,
      })
      .toBe(metrics.listWidth);
    await expect(root.getByRole('button', { name: 'More tabs', exact: true })).toHaveCount(0);
    await root.evaluate((node) => {
      node.style.width = '230px';
    });
    await expect(root.getByRole('button', { name: 'More tabs', exact: true })).toBeVisible({
      timeout: 20_000,
    });
    await expect
      .poll(() => list.evaluate((node) => node.scrollWidth - node.clientWidth), {
        timeout: 20_000,
      })
      .toBeGreaterThan(0);
    await root.evaluate((node) => {
      node.style.width = '640px';
    });
    await expect(root.getByRole('button', { name: 'More tabs', exact: true })).toHaveCount(0, {
      timeout: 20_000,
    });
    await expect
      .poll(() => list.evaluate((node) => node.scrollWidth - node.clientWidth), {
        timeout: 20_000,
      })
      .toBeLessThanOrEqual(1);
  });

  for (const vertical of [false, true]) {
    test(`card ${size} selection has shadow room inside the clipped track (${vertical ? 'vertical' : 'horizontal'})`, async ({
      page,
    }) => {
      await page.goto(`/?fixture=tabs&size=${size}${vertical ? '&vertical=1' : ''}`);
      const root = page.getByTestId('motion-tabs');
      for (const name of ['First', 'Third', 'A longer second tab']) {
        await root.getByRole('tab', { name, exact: true }).click();
        await expect
          .poll(
            () =>
              root.evaluate((node) => {
                const list = node.querySelector('.leaf-tabs__list');
                const track = node.querySelector('.leaf-tabs__track');
                const marker = node.querySelector('.leaf-tabs__indicator');
                const active = node.querySelector('[data-active="true"]');
                if (!list || !track || !marker || !active) throw new Error('Missing tab header');
                const clip = track.getBoundingClientRect();
                const selection = marker.getBoundingClientRect();
                const item = active.getBoundingClientRect();
                const style = getComputedStyle(list);
                const insets = [
                  selection.top - clip.top,
                  clip.right - selection.right,
                  clip.bottom - selection.bottom,
                  selection.left - clip.left,
                ];
                const padding = [
                  style.paddingTop,
                  style.paddingRight,
                  style.paddingBottom,
                  style.paddingLeft,
                ];
                return {
                  shadowRoom: insets.every(
                    (inset, index) => inset >= Number.parseFloat(padding[index] ?? '0') - 0.5,
                  ),
                  aligned:
                    Math.abs(selection.x - item.x) < 0.5 && Math.abs(selection.y - item.y) < 0.5,
                  shadow: getComputedStyle(marker).boxShadow !== 'none',
                  overflow:
                    list.scrollWidth > list.clientWidth + 1 ||
                    list.scrollHeight > list.clientHeight + 1,
                };
              }),
            { timeout: 10_000 },
          )
          .toEqual({ shadowRoom: true, aligned: true, shadow: true, overflow: false });
      }
    });
  }

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
    expect(metrics.list).toBe(size === 'sm' ? 30 : size === 'lg' ? 42 : 36);
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
