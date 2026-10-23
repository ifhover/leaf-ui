import { readability } from '@ctrl/tinycolor';
import { expect, type Locator, test } from '@playwright/test';

async function tagContrast(tag: Locator) {
  return tag.evaluate((node: HTMLElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Missing canvas context');
    const normalize = (value: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const [r = 0, g = 0, b = 0, a = 255] = context.getImageData(0, 0, 1, 1).data;
      return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    };
    const style = getComputedStyle(node);
    return {
      foreground: normalize(style.color),
      background: normalize(style.backgroundColor),
    };
  });
}

test('tag typography, radius and variant ink', async ({ page }) => {
  await page.goto('/?fixture=tags&theme=light');
  const fixture = page.getByTestId('tag-fixture');
  const tags = fixture.locator('.leaf-tag');
  await expect(tags).toHaveCount(11);

  const values = await tags.evaluateAll((nodes) =>
    nodes.map((node) => {
      const style = getComputedStyle(node);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Missing canvas context');
      const normalize = (value: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        const [r = 0, g = 0, b = 0, a = 255] = context.getImageData(0, 0, 1, 1).data;
        return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      };
      return {
        boldClass: node.classList.contains('leaf-tag--bold'),
        outline: node.classList.contains('leaf-tag--outline'),
        foreground: normalize(style.color),
        background: normalize(style.backgroundColor),
        radius: style.borderTopLeftRadius,
        weight: style.fontWeight,
      };
    }),
  );
  for (const value of values) {
    expect(value.boldClass).toBe(false);
    expect(value.radius).toBe(value.outline ? '999px' : '4px');
    expect(value.weight).toBe('500');
    expect(readability(value.foreground, value.background)).toBeGreaterThanOrEqual(4.5);
  }

  const defaultTag = page.getByTestId('tag-default');
  await expect(defaultTag).toHaveAttribute('data-color', 'primary');
  await expect(page.getByTestId('tag-alias')).toHaveAttribute('data-color', 'primary');
  for (const testId of ['tag-default', 'tag-custom', 'tag-danger-soft'])
    await expect
      .poll(async () => {
        const colors = await tagContrast(page.getByTestId(testId));
        return readability(colors.foreground, colors.background);
      })
      .toBeGreaterThanOrEqual(4.5);

  await expect(page.getByTestId('tag-danger')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  expect(
    await fixture.evaluate((node) =>
      getComputedStyle(node).getPropertyValue('--leaf-color-danger').trim(),
    ),
  ).toBe('#dd3f2e');
});

test('dark danger keeps the shared semantic base color', async ({ page }) => {
  await page.goto('/?fixture=tags&theme=dark');
  await expect(page.getByTestId('tag-danger').locator('.leaf-tag__dot')).toHaveCSS(
    'background-color',
    'rgb(221, 63, 46)',
  );
  for (const testId of ['tag-danger-soft'])
    await expect
      .poll(async () => {
        const colors = await tagContrast(page.getByTestId(testId));
        return readability(colors.foreground, colors.background);
      })
      .toBeGreaterThanOrEqual(4.5);
  expect(
    await page
      .getByTestId('tag-fixture')
      .evaluate((node) => getComputedStyle(node).getPropertyValue('--leaf-color-danger').trim()),
  ).toBe('#dd3f2e');
});

test('checkable tags use outlined and tinted theme states', async ({ page }) => {
  await page.goto('/?fixture=tags&theme=light');
  const checkable = page.getByTestId('tag-checkable');
  await expect(checkable).toHaveClass(/leaf-tag--outline/);
  await expect(checkable).toHaveAttribute('data-color', 'primary');
  await expect
    .poll(async () => {
      const colors = await tagContrast(checkable);
      return readability(colors.foreground, colors.background);
    })
    .toBeGreaterThanOrEqual(4.5);
  await checkable.click();
  await expect(checkable).toHaveClass(/leaf-tag--soft/);
  await expect(checkable).toHaveAttribute('aria-pressed', 'true');

  const group = page.getByTestId('tag-group');
  const active = group.getByRole('button', { name: 'Active' });
  const paused = group.getByRole('button', { name: 'Paused' });
  await expect(active).toHaveClass(/leaf-tag--soft/);
  await expect(paused).toHaveClass(/leaf-tag--outline/);
  for (const tag of [paused])
    await expect
      .poll(async () => {
        const colors = await tagContrast(tag);
        return readability(colors.foreground, colors.background);
      })
      .toBeGreaterThanOrEqual(4.5);
});

for (const theme of ['light', 'dark']) {
  test(`outlined tags keep neutral paint and small semantic dots in ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto(`/?fixture=tags&theme=${theme}&dir=rtl`);
    const tag = page.getByTestId('tag-danger');
    const dot = tag.locator('.leaf-tag__dot');
    await expect(dot).toHaveCSS('width', '6px');
    await expect(dot).toHaveCSS('height', '6px');
    await expect(dot).toHaveCSS('background-color', 'rgb(221, 63, 46)');
    await expect(tag).toHaveCSS('border-top-width', '1px');
    const paint = await tag.evaluate((node) => {
      const style = getComputedStyle(node);
      const probe = document.createElement('span');
      node.appendChild(probe);
      probe.style.color = 'var(--leaf-color-text)';
      probe.style.backgroundColor = 'var(--leaf-color-surface)';
      probe.style.border = '1px solid var(--leaf-color-border)';
      const expected = getComputedStyle(probe);
      const result = {
        foreground: style.color === expected.color,
        background: style.backgroundColor === expected.backgroundColor,
        border: style.borderTopColor === expected.borderTopColor,
      };
      probe.remove();
      return result;
    });
    expect(paint).toEqual({ foreground: true, background: true, border: true });
    await page.screenshot({ path: testInfo.outputPath(`tags-${theme}.png`) });
  });
}
