import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`standalone badges use small corners without changing attached pills or dots in ${theme}`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=badge&theme=${theme}`);
    const standalone = page.locator('.leaf-badge--standalone .leaf-badge__indicator');
    await expect(standalone).toHaveCount(3);
    for (const indicator of await standalone.all()) {
      const geometry = await indicator.evaluate((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        const probe = document.createElement('span');
        probe.style.borderRadius = 'var(--leaf-radius-sm)';
        node.append(probe);
        const smallRadius = getComputedStyle(probe).borderTopLeftRadius;
        probe.remove();
        return {
          radius: style.borderTopLeftRadius,
          smallRadius,
          position: style.position,
          width: rect.width,
          height: rect.height,
          dot: node.classList.contains('leaf-badge__indicator--dot'),
        };
      });
      expect(geometry.position).toBe('static');
      if (geometry.dot) {
        expect(geometry.width).toBe(8);
        expect(geometry.height).toBe(8);
        expect(Number.parseFloat(geometry.radius)).toBeGreaterThanOrEqual(4);
      } else {
        expect(geometry.height).toBe(20);
        expect(geometry.radius).toBe(geometry.smallRadius);
      }
    }
    await expect(page.locator('.leaf-badge--attached .leaf-badge__indicator').first()).toHaveCSS(
      'border-radius',
      '100px',
    );
    await page.screenshot({ path: test.info().outputPath(`badge-${theme}.png`) });
  });
}

for (const direction of ['ltr', 'rtl'] as const) {
  test(`attached badges stay anchored and grow outward in ${direction}`, async ({ page }) => {
    await page.goto(`/?fixture=badge&theme=light${direction === 'rtl' ? '&rtl=1' : ''}`);

    const badges = page.locator('.leaf-badge--attached[data-placement="outside"]');
    await expect(badges).toHaveCount(3);

    const geometry = await badges.evaluateAll(
      (nodes, textDirection) =>
        nodes.map((node) => {
          const target = node.querySelector('button');
          const indicator = node.querySelector('.leaf-badge__indicator');
          if (!target || !indicator) throw new Error('Missing badge geometry');
          const targetRect = target.getBoundingClientRect();
          const indicatorRect = indicator.getBoundingClientRect();
          return {
            anchor: textDirection === 'rtl' ? indicatorRect.right : indicatorRect.left,
            boundary: textDirection === 'rtl' ? targetRect.left : targetRect.right,
            width: indicatorRect.width,
            isDot: indicator.classList.contains('leaf-badge__indicator--dot'),
          };
        }),
      direction,
    );

    const [shortCount, longCount, dot] = geometry;
    if (!shortCount || !longCount || !dot) throw new Error('Missing badge fixtures');
    expect(shortCount.isDot).toBe(false);
    expect(shortCount.anchor).toBeCloseTo(shortCount.boundary - 14, 0);
    expect(longCount.isDot).toBe(false);
    expect(longCount.anchor).toBeCloseTo(longCount.boundary - 14, 0);
    expect(longCount.width).toBeGreaterThan(shortCount.width);
    expect(dot.isDot).toBe(true);
    expect(dot.anchor).toBeCloseTo(dot.boundary - 8, 0);
  });
}

for (const direction of ['ltr', 'rtl']) {
  for (const theme of ['light', 'dark']) {
    test(`inside badge has an inset white ring: ${direction} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 900 });
      await page.goto(`/?fixture=badge&theme=${theme}${direction === 'rtl' ? '&rtl=1' : ''}`);
      const badges = page.getByTestId('inside-badges').locator('.leaf-badge');
      await expect(badges).toHaveCount(4);
      for (const badge of await badges.all()) {
        const indicator = badge.locator('.leaf-badge__indicator');
        await expect(indicator).toHaveCSS('box-shadow', 'rgb(255, 255, 255) 0px 0px 0px 2px');
        await expect(indicator).toHaveCSS('pointer-events', 'none');
        const geometry = await badge.evaluate((node) => {
          const target = node.querySelector('button')?.getBoundingClientRect();
          const dot = node.querySelector('.leaf-badge__indicator')?.getBoundingClientRect();
          if (!target || !dot) throw new Error('Missing inside badge');
          return {
            top: dot.top - target.top,
            end:
              getComputedStyle(node).direction === 'rtl'
                ? dot.left - target.left
                : target.right - dot.right,
            width: dot.width,
            height: dot.height,
            targetWidth: node.getBoundingClientRect().width - target.width,
          };
        });
        expect(geometry.top).toBeCloseTo(6, 1);
        expect(geometry.end).toBeCloseTo(6, 1);
        expect(geometry.width).toBe(8);
        expect(geometry.height).toBe(8);
        expect(geometry.targetWidth).toBeCloseTo(0, 1);
      }
      await page.screenshot({ path: test.info().outputPath('inside-white-ring.png') });
    });
  }
}
