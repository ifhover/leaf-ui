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
        foreground: normalize(style.color),
        background: normalize(style.backgroundColor),
        radius: style.borderTopLeftRadius,
        weight: style.fontWeight,
      };
    }),
  );
  for (const value of values) {
    expect(value.boldClass).toBe(false);
    expect(value.radius).toBe('6px');
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

  await expect(page.getByTestId('tag-danger')).toHaveCSS('background-color', 'rgb(221, 63, 46)');
  expect(
    await fixture.evaluate((node) =>
      getComputedStyle(node).getPropertyValue('--leaf-color-danger').trim(),
    ),
  ).toBe('#dd3f2e');
});

test('dark danger keeps the dark-mode semantic token', async ({ page }) => {
  await page.goto('/?fixture=tags&theme=dark');
  await expect(page.getByTestId('tag-danger')).toHaveCSS('background-color', 'rgb(239, 133, 133)');
  for (const testId of ['tag-danger', 'tag-danger-soft'])
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
  ).toBe('#ef8585');
});

test('checkable tags use tinted and solid theme states', async ({ page }) => {
  await page.goto('/?fixture=tags&theme=light');
  const checkable = page.getByTestId('tag-checkable');
  await expect(checkable).toHaveClass(/leaf-tag--soft/);
  await expect(checkable).toHaveAttribute('data-color', 'primary');
  await expect
    .poll(async () => {
      const colors = await tagContrast(checkable);
      return readability(colors.foreground, colors.background);
    })
    .toBeGreaterThanOrEqual(4.5);
  await checkable.click();
  await expect(checkable).toHaveClass(/leaf-tag--solid/);
  await expect(checkable).toHaveAttribute('aria-pressed', 'true');
  await expect
    .poll(async () => {
      const colors = await tagContrast(checkable);
      return readability(colors.foreground, colors.background);
    })
    .toBeGreaterThanOrEqual(4.5);

  const group = page.getByTestId('tag-group');
  const active = group.getByRole('button', { name: 'Active' });
  const paused = group.getByRole('button', { name: 'Paused' });
  await expect(active).toHaveClass(/leaf-tag--solid/);
  await expect(paused).toHaveClass(/leaf-tag--soft/);
  for (const tag of [active, paused])
    await expect
      .poll(async () => {
        const colors = await tagContrast(tag);
        return readability(colors.foreground, colors.background);
      })
      .toBeGreaterThanOrEqual(4.5);
});
