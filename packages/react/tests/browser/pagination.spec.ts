import { readability, TinyColor } from '@ctrl/tinycolor';
import { expect, type Locator, test } from '@playwright/test';
import axe from 'axe-core';

async function color(element: Locator, token: string) {
  return new TinyColor(
    await element.evaluate((node, name) => getComputedStyle(node).getPropertyValue(name), token),
  ).toRgbString();
}

for (const appearance of ['light', 'dark']) {
  test(`outline and ghost paints, stable press and moving selection in ${appearance}`, async ({
    page,
  }, info) => {
    await page.goto(`/?fixture=pagination&theme=${appearance}`);
    const outline = page.getByRole('navigation', { name: 'Outline pages' });
    const ghost = page.getByRole('navigation', { name: 'Ghost pages' });
    const candidate = outline.getByRole('button', { name: 'Page 3', exact: true });
    await expect(candidate).toHaveCSS('border-color', await color(outline, '--leaf-color-border'));
    expect(
      await candidate.evaluate((node) => getComputedStyle(node, '::before').backgroundColor),
    ).toBe(await color(outline, '--leaf-color-surface'));
    await expect(ghost.getByRole('button', { name: 'Page 3', exact: true })).toHaveCSS(
      'border-color',
      'rgba(0, 0, 0, 0)',
    );
    const marker = outline.locator('.leaf-pagination__indicator');
    await expect(marker).toHaveCSS(
      'border-color',
      await color(outline, '--leaf-color-primary-indicator'),
    );
    await expect(marker).toHaveCSS(
      'background-color',
      await color(outline, '--leaf-color-primary-soft'),
    );
    const current = outline.getByRole('button', { name: 'Page 2', exact: true });
    const currentColor = await current.evaluate((node) => getComputedStyle(node).color);
    await current.hover();
    await expect(current).toHaveCSS('color', currentColor);
    await candidate.hover();
    await expect(candidate).toHaveCSS(
      'border-color',
      await color(outline, '--leaf-color-primary-ink-hover'),
    );
    const candidateColor = await candidate.evaluate((node) => getComputedStyle(node).color);
    const before = await candidate.boundingBox();
    await page.mouse.down();
    try {
      await expect(candidate).toHaveCSS('transform', 'none');
      await expect(candidate).toHaveCSS('color', candidateColor);
      expect(await candidate.boundingBox()).toEqual(before);
      await expect(candidate).toHaveCSS(
        'border-color',
        await color(outline, '--leaf-color-primary-ink-active'),
      );
    } finally {
      await page.mouse.up();
    }
    await expect(candidate).toHaveAttribute('aria-current', 'page');
    await expect
      .poll(
        async () => {
          const [button, indicator] = await Promise.all([
            candidate.boundingBox(),
            marker.boundingBox(),
          ]);
          return (
            Math.abs((button?.x ?? 0) - (indicator?.x ?? 0)) +
            Math.abs((button?.y ?? 0) - (indicator?.y ?? 0))
          );
        },
        { timeout: 20_000 },
      )
      .toBeLessThan(1);
    await ghost.getByRole('button', { name: 'Page 3', exact: true }).hover();
    await expect(ghost.getByRole('button', { name: 'Page 3', exact: true })).toHaveCSS(
      'background-color',
      await color(ghost, '--leaf-color-surface-muted'),
    );
    await page.screenshot({
      path: test.info().outputPath(`pagination-${appearance}-${info.project.name}.png`),
      fullPage: true,
    });
  });

  test(`sizes, region overrides and disabled controls in ${appearance}`, async ({ page }) => {
    await page.goto(`/?fixture=pagination&theme=${appearance}`);
    for (const [size, height] of [
      ['sm', 28],
      ['md', 34],
      ['lg', 40],
    ] as const) {
      const pagination = page.getByRole('navigation', { name: `Size ${size}` });
      await expect(pagination.getByRole('button', { name: 'Page 1', exact: true })).toHaveCSS(
        'height',
        `${height}px`,
      );
      await expect(pagination.locator('.leaf-select')).toHaveCSS('height', `${height}px`);
      await expect(pagination.locator('.leaf-input-number')).toHaveCSS('height', `${height}px`);
    }
    const custom = page.getByRole('navigation', { name: 'Custom pages' });
    await expect(custom.getByRole('button', { name: 'Page 2', exact: true })).toHaveCSS(
      'height',
      '44px',
    );
    await expect(custom.getByRole('button', { name: 'Page 2', exact: true })).toHaveCSS(
      'border-radius',
      '4px',
    );
    await expect(custom.locator('.leaf-pagination__indicator')).toHaveCSS(
      'border-color',
      await color(custom, '--leaf-color-primary-indicator'),
    );
    expect(await color(custom, '--leaf-color-primary')).toBe('rgb(118, 84, 198)');
    if (appearance === 'dark')
      expect(
        readability(
          await color(custom, '--leaf-color-primary-indicator'),
          await color(custom, '--leaf-color-surface-muted'),
        ),
      ).toBeGreaterThanOrEqual(3);
    await expect(custom.getByRole('button', { name: 'Next page' }).locator('svg')).toHaveCSS(
      'transform',
      'matrix(-1, 0, 0, -1, 0, 0)',
    );
    await custom.getByRole('button', { name: 'Page 3', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(custom.getByRole('button', { name: 'Page 3', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(custom.locator('.leaf-pagination__indicator')).toHaveCSS(
      'transition-duration',
      /^0s(?:,\s*0s)*$/,
    );
    const disabled = page.getByRole('navigation', { name: 'Disabled pages' });
    for (const button of await disabled.getByRole('button').all())
      await expect(button).toBeDisabled();
    await expect(disabled.getByRole('combobox')).toBeDisabled();
    await expect(disabled.getByRole('spinbutton')).toBeDisabled();
    await expect(page.getByRole('navigation', { name: 'Hidden pages' })).toHaveCount(0);
  });
}

test('controlled page, size and quick jumps use one change per action', async ({ page }) => {
  await page.goto('/?fixture=pagination');
  const pagination = page.getByRole('navigation', { name: 'Controlled pages' });
  const state = page.getByLabel('Pagination state');
  const jump = pagination.getByRole('spinbutton', { name: 'Go to' });
  await jump.fill('4');
  await expect(state).toHaveText('2/10 (0)');
  await jump.press('Enter');
  await page.getByRole('button', { name: 'Outside' }).click();
  await expect(state).toHaveText('4/10 (1)');
  await jump.fill('5');
  await pagination.getByRole('button', { name: 'Page 3', exact: true }).click();
  await expect(state).toHaveText('3/10 (2)');
  await pagination.getByRole('combobox', { name: 'Page size' }).click();
  await page.getByRole('option', { name: '20 / page', exact: true }).click();
  await expect(state).toHaveText('2/20 (3)');
  await jump.fill('999');
  await page.getByRole('button', { name: 'Outside' }).click();
  await expect(state).toHaveText('6/20 (4)');
  await expect(jump).toHaveValue('6');
  await expect(pagination.getByRole('button', { name: 'Next page' })).toBeDisabled();
});

test('narrow compact pagination wraps, remains accessible and honors reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?fixture=pagination&compact=1');
  const pagination = page.getByRole('navigation', { name: 'Controlled pages' });
  await expect(pagination.getByRole('button', { name: 'Page 2', exact: true })).toHaveCSS(
    'height',
    '30px',
  );
  await pagination.getByRole('button', { name: 'Page 3', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(pagination.getByRole('button', { name: 'Page 3', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(pagination.locator('.leaf-pagination__indicator')).toHaveCSS(
    'transition-duration',
    '0s',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(
    async () =>
      (await (window as unknown as { axe: typeof axe }).axe.run(document.body)).violations,
  );
  expect(violations).toEqual([]);
});
