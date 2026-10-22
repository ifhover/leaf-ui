import { expect, test } from '@playwright/test';

for (const direction of ['ltr', 'rtl'] as const) {
  test(`attached badges stay anchored and grow outward in ${direction}`, async ({ page }) => {
    await page.goto(`/?fixture=badge&theme=light${direction === 'rtl' ? '&rtl=1' : ''}`);

    const badges = page.locator('.leaf-badge--attached');
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
