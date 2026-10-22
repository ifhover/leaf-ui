import { expect, test } from '@playwright/test';

test('tag typography, radius and variant ink', async ({ page }) => {
  await page.goto('/?fixture=tags&theme=light');
  const fixture = page.getByTestId('tag-fixture');
  const tags = fixture.locator('.leaf-tag');
  await expect(tags).toHaveCount(11);

  const values = await tags.evaluateAll((nodes) =>
    nodes.map((node) => {
      const style = getComputedStyle(node);
      const solid = node.classList.contains('leaf-tag--solid');
      const warning = node.getAttribute('data-color') === 'warning';
      const probe = document.createElement('span');
      probe.style.color = warning
        ? style
            .getPropertyValue(solid ? '--leaf-color-on-warning' : '--leaf-color-warning-text-80')
            .trim()
        : solid
          ? '#fff'
          : style.getPropertyValue('--leaf-tag-color').trim();
      node.append(probe);
      const expectedColor = getComputedStyle(probe).color;
      probe.remove();
      return {
        boldClass: node.classList.contains('leaf-tag--bold'),
        color: style.color,
        expectedColor,
        radius: style.borderTopLeftRadius,
        weight: style.fontWeight,
      };
    }),
  );
  for (const value of values) {
    expect(value.boldClass).toBe(false);
    expect(value.radius).toBe('6px');
    expect(value.color).toBe(value.expectedColor);
    expect(value.weight).toBe('500');
  }

  const defaultTag = page.getByTestId('tag-default');
  await expect(defaultTag).toHaveAttribute('data-color', 'primary');
  await expect(page.getByTestId('tag-alias')).toHaveAttribute('data-color', 'primary');
  await expect(defaultTag).toHaveCSS('color', 'rgb(30, 150, 79)');
  await expect(page.getByTestId('tag-custom')).toHaveCSS('color', 'rgb(118, 84, 198)');
  await expect(page.getByTestId('tag-danger-soft')).toHaveCSS('color', 'rgb(221, 63, 46)');
  const backgrounds = await defaultTag.evaluate((node) => {
    const style = getComputedStyle(node);
    const probe = document.createElement('span');
    probe.style.backgroundColor = style.getPropertyValue('--leaf-color-primary-surface-8').trim();
    node.append(probe);
    const expected = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return {
      actual: style.backgroundColor,
      expected,
    };
  });
  expect(backgrounds.actual).toBe(backgrounds.expected);

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
  await expect(page.getByTestId('tag-danger')).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.getByTestId('tag-danger-soft')).toHaveCSS('color', 'rgb(239, 133, 133)');
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
  await expect(checkable).toHaveCSS('color', 'rgb(30, 150, 79)');
  await checkable.click();
  await expect(checkable).toHaveClass(/leaf-tag--solid/);
  await expect(checkable).toHaveAttribute('aria-pressed', 'true');
  await expect(checkable).toHaveCSS('color', 'rgb(255, 255, 255)');

  const group = page.getByTestId('tag-group');
  await expect(group.getByRole('button', { name: 'Active' })).toHaveClass(/leaf-tag--solid/);
  await expect(group.getByRole('button', { name: 'Active' })).toHaveCSS(
    'color',
    'rgb(255, 255, 255)',
  );
  await expect(group.getByRole('button', { name: 'Paused' })).toHaveClass(/leaf-tag--soft/);
  await expect(group.getByRole('button', { name: 'Paused' })).toHaveCSS(
    'color',
    'rgb(30, 150, 79)',
  );
});
