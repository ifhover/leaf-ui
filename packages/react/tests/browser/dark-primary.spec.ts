import { readability, TinyColor } from '@ctrl/tinycolor';
import { expect, test } from '@playwright/test';

test('dark primary expressions adapt through nested scopes and recover their original color', async ({
  page,
}) => {
  await page.goto('/?fixture=colors');
  const theme = page.getByTestId('dark-primary-theme');
  const inherited = page.getByTestId('inherited-primary-theme');
  const read = () =>
    theme.evaluate((node) => {
      const style = getComputedStyle(node);
      return Object.fromEntries(
        [
          'primary',
          'primary-ink',
          'primary-indicator',
          'primary-focus',
          'on-primary',
          'primary-hover',
          'surface',
          'surface-muted',
        ].map((name) => [name, style.getPropertyValue(`--leaf-color-${name}`).trim()]),
      );
    });
  await expect
    .poll(
      async () => {
        const colors = await read();
        return Math.min(
          readability(colors['primary-ink'] ?? '', colors.surface ?? ''),
          readability(colors['primary-ink'] ?? '', colors['surface-muted'] ?? ''),
        );
      },
      { timeout: 20_000 },
    )
    .toBeGreaterThanOrEqual(4.5);
  const dark = await read();
  expect(dark.primary).toBe('rgb(24, 24, 27)');
  expect(
    readability(dark['primary-indicator'] ?? '', dark['surface-muted'] ?? ''),
  ).toBeGreaterThanOrEqual(3);
  const button = theme.getByRole('button', { name: 'Adaptive primary', exact: true });
  await expect(button).toHaveCSS('background-color', 'rgb(24, 24, 27)');
  await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(button).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await button.focus();
  await expect(button).toHaveCSS('outline-style', 'solid');
  await expect
    .poll(() =>
      button.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          outline: style.outlineColor,
          focus: style.getPropertyValue('--leaf-color-primary-focus').trim(),
        };
      }),
    )
    .toEqual({
      outline: new TinyColor(dark['primary-focus']).toRgbString(),
      focus: dark['primary-focus'],
    });
  await expect(theme.getByRole('button', { name: 'Adaptive link', exact: true })).toHaveCSS(
    'color',
    new TinyColor(dark['primary-ink']).toRgbString(),
  );
  const slider = theme.locator('.leaf-slider__fill');
  await expect(slider).toHaveCSS(
    'background-color',
    new TinyColor(dark['primary-indicator']).toRgbString(),
  );
  const track = theme.locator('.leaf-switch__track');
  await expect(track).toHaveCSS(
    'background-color',
    new TinyColor(dark['primary-indicator']).toRgbString(),
  );
  await theme.getByRole('combobox', { name: 'Adaptive select' }).click();
  const option = page.getByRole('option', { name: 'One', exact: true });
  await expect(option).toBeVisible();
  await expect
    .poll(() =>
      option.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-color-primary-ink').trim(),
      ),
    )
    .toBe(dark['primary-ink']);
  await page.keyboard.press('Escape');
  await expect
    .poll(() =>
      inherited.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-color-primary-ink').trim(),
      ),
    )
    .toBe(dark['primary-ink']);
  await expect(page.getByTestId('light-primary-theme').getByRole('button')).toHaveCSS(
    'background-color',
    'rgb(24, 24, 27)',
  );
  await expect(page.getByTestId('explicit-primary-theme').getByRole('button')).toHaveCSS(
    'color',
    'rgb(18, 52, 86)',
  );
  await page.getByTestId('explicit-primary-theme').getByRole('button').hover();
  await expect(page.getByTestId('explicit-primary-theme').getByRole('button')).toHaveCSS(
    'background-color',
    'rgb(171, 205, 239)',
  );
  await page.getByRole('button', { name: 'Toggle accent color', exact: true }).click();
  await expect.poll(async () => (await read()).primary).toBe('rgb(29, 155, 240)');
  await page.getByRole('button', { name: 'Toggle accent color', exact: true }).click();
  await expect.poll(async () => (await read()).primary).toBe(dark.primary);
  await page.getByRole('button', { name: 'Toggle accent appearance', exact: true }).click();
  await expect(theme.getByRole('button', { name: 'Adaptive primary', exact: true })).toHaveCSS(
    'background-color',
    'rgb(24, 24, 27)',
  );
  await page.getByRole('button', { name: 'Toggle accent appearance', exact: true }).click();
  await expect.poll(async () => (await read()).primary).toBe(dark.primary);
});
