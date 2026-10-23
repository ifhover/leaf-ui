import { readability, TinyColor } from '@ctrl/tinycolor';
import { expect, test } from '@playwright/test';

test('dark primary JS configuration adapts through nested scopes and recover their original color', async ({
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
  expect(dark.primary).toBe('#18181b');
  expect(
    readability(dark['primary-indicator'] ?? '', dark['surface-muted'] ?? ''),
  ).toBeGreaterThanOrEqual(3);
  const button = theme.getByRole('button', { name: 'Adaptive primary', exact: true });
  await expect(button).toHaveCSS('background-color', 'rgb(24, 24, 27)');
  await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  // Solid actions keep transparent borders; the choice controls below retain
  // their separate visible-indicator boundary contract.
  await expect(button).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await button.focus();
  await expect(button).toHaveCSS('outline-style', 'solid');
  const focusColor = await button.evaluate((node) =>
    getComputedStyle(node).getPropertyValue('--leaf-color-text-muted').trim(),
  );
  await expect(button).toHaveCSS('outline-color', new TinyColor(focusColor).toRgbString());
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
  await expect(track).toHaveCSS('background-color', new TinyColor(dark.primary).toRgbString());
  await expect(track).toHaveCSS(
    'border-top-color',
    new TinyColor(dark['primary-indicator']).toRgbString(),
  );
  const switchThumb = track.locator('.leaf-switch__thumb');
  await expect(switchThumb).toHaveCSS(
    'background-color',
    new TinyColor(dark['on-primary']).toRgbString(),
  );
  const checkbox = theme.locator('.leaf-checkbox__input');
  await expect(checkbox).toHaveCSS('background-color', new TinyColor(dark.primary).toRgbString());
  await expect(checkbox).toHaveCSS(
    'border-top-color',
    new TinyColor(dark['primary-indicator']).toRgbString(),
  );
  await expect(theme.locator('.leaf-checkbox__mark--check')).toHaveCSS(
    'color',
    new TinyColor(dark['on-primary']).toRgbString(),
  );
  await theme.getByRole('combobox', { name: 'Adaptive select' }).click();
  const option = page.getByRole('option', { name: 'One', exact: true });
  await expect(option).toBeVisible();
  await expect(option).toHaveCSS('--leaf-color-primary-ink', dark['primary-ink'] ?? '');
  await page.keyboard.press('Escape');
  await expect(inherited).toHaveCSS('--leaf-color-primary-ink', dark['primary-ink'] ?? '');
  await expect(page.getByTestId('light-primary-theme').getByRole('button')).toHaveCSS(
    'background-color',
    'rgb(24, 24, 27)',
  );
  await expect(page.getByTestId('explicit-primary-theme').getByRole('button')).toHaveCSS(
    'color',
    'rgb(18, 52, 86)',
  );
  const explicitButton = page.getByTestId('explicit-primary-theme').getByRole('button');
  const explicitBackground = await explicitButton.evaluate(
    (node) => getComputedStyle(node).backgroundColor,
  );
  await explicitButton.hover();
  await expect(explicitButton).toHaveCSS('background-color', explicitBackground);
  await page.getByRole('button', { name: 'Toggle accent color', exact: true }).click();
  await expect(theme).toHaveCSS('--leaf-color-primary', '#1d9bf0');
  await page.getByRole('button', { name: 'Toggle accent color', exact: true }).click();
  await expect(theme).toHaveCSS('--leaf-color-primary', dark.primary ?? '');
  await page.getByRole('button', { name: 'Toggle accent appearance', exact: true }).click();
  await expect(theme.getByRole('button', { name: 'Adaptive primary', exact: true })).toHaveCSS(
    'background-color',
    'rgb(24, 24, 27)',
  );
  await page.getByRole('button', { name: 'Toggle accent appearance', exact: true }).click();
  await expect(theme).toHaveCSS('--leaf-color-primary', dark.primary ?? '');
});
