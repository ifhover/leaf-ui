import { readability, TinyColor } from '@ctrl/tinycolor';
import { expect, type Page, test } from '@playwright/test';
import { paintColor as paint } from './helpers/paint';

function parts(page: Page, name: string) {
  const input = page.getByRole('switch', { name, exact: true });
  const label = page.locator('.leaf-switch').filter({ has: input });
  return {
    input,
    label,
    track: label.locator('.leaf-switch__track'),
    thumb: label.locator('.leaf-switch__thumb'),
    spinner: label.locator('.leaf-switch__spinner'),
  };
}

for (const theme of ['light', 'dark']) {
  test(`${theme} off switches keep a light thumb, a neutral track and neutral loading`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/?fixture=switch&theme=${theme}`);
    const track = theme === 'light' ? '#6f6f6f' : '#525252';
    const thumb = theme === 'light' ? '#ffffff' : '#f5f5f5';
    const ink = theme === 'light' ? '#6f6f6f' : '#1f1f1f';
    for (const size of ['sm', 'md', 'lg']) {
      const off = parts(page, `${size} off`);
      expect(await paint(off.track)).toBe(track);
      expect(await paint(off.track, 'borderTopColor')).toBe(track);
      expect(await paint(off.thumb)).toBe(thumb);
      expect(new TinyColor(thumb).getLuminance()).toBeGreaterThan(
        new TinyColor(track).getLuminance(),
      );
      expect(readability(thumb, track)).toBeGreaterThanOrEqual(3);
      await off.input.hover();
      await page.mouse.down();
      expect(await paint(off.track)).toBe(track);
      expect(await paint(off.thumb)).toBe(thumb);
      await page.mouse.move(0, 0);
      await page.mouse.up();
      await expect(off.input).not.toBeChecked();
      const on = parts(page, `${size} on`);
      expect(await paint(on.track)).toBe('#1e964f');
      expect(await paint(on.thumb)).toBe('#000000');
    }
    for (const name of ['Disabled off', 'Loading off']) {
      const off = parts(page, name);
      await expect(off.input).toBeDisabled();
      expect(await paint(off.track)).toBe(track);
      expect(await paint(off.thumb)).toBe(thumb);
    }
    const loading = parts(page, 'Loading off');
    expect(await paint(loading.spinner, 'color')).toBe(ink);
    expect(readability(ink, thumb)).toBeGreaterThanOrEqual(3);
    expect(await paint(parts(page, 'Loading on').spinner, 'color')).toBe('#1e964f');
    const off = parts(page, 'md off');
    await off.input.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(off.input).toBeFocused();
    await expect(off.track).toHaveCSS('outline-style', 'solid');
    await off.input.press('Space');
    await expect(off.input).toBeChecked();
    expect(await paint(off.track)).toBe('#1e964f');
    expect(await paint(off.thumb)).toBe('#000000');
    await off.input.press('Space');
    await expect(off.input).not.toBeChecked();
    expect(await paint(off.track)).toBe(track);
    await off.input.blur();
    await page.getByRole('region', { name: 'Default switch palette' }).screenshot({
      path: testInfo.outputPath(`switch-${theme}.png`),
    });
  });

  test(`${theme} switches retain nested colors and explicit paint overrides`, async ({ page }) => {
    await page.goto(`/?fixture=switch&theme=${theme}`);
    const nested = parts(page, 'Nested off');
    expect(await paint(nested.track)).toBe('#736354');
    expect(await paint(nested.thumb)).toBe('#f1e8de');
    expect(await paint(parts(page, 'Nested on').thumb)).toBe('#111111');
    const off = parts(page, 'Override off');
    expect(await paint(off.track)).toBe('#dce8f2');
    expect(await paint(off.track, 'borderTopColor')).toBe('#325878');
    await off.input.hover();
    expect(await paint(off.track)).toBe('#c3d8eb');
    expect(await paint(off.track, 'borderTopColor')).toBe('#224260');
    await page.mouse.down();
    expect(await paint(off.track)).toBe('#aec9e0');
    expect(await paint(off.track, 'borderTopColor')).toBe('#152d44');
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await off.input.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(off.input).toBeFocused();
    expect(await paint(off.track)).toBe('#e3eef7');
    expect(await paint(off.track, 'borderTopColor')).toBe('#385f82');
    await expect(off.track).toHaveCSS('outline-style', 'solid');
    const disabled = parts(page, 'Override disabled');
    expect(await paint(disabled.track)).toBe('#e8ecef');
    expect(await paint(disabled.track, 'borderTopColor')).toBe('#7f8d99');
    expect(await paint(parts(page, 'Global border').track, 'borderTopColor')).toBe('#986e55');
  });
}

test('switch system colors remain distinct in forced-colors mode', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'forced-colors emulation requires Chromium');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/?fixture=switch');
  const off = parts(page, 'md off');
  const on = parts(page, 'md on');
  for (const toggle of [off, on]) {
    expect(await paint(toggle.track)).not.toBe(await paint(toggle.thumb));
    await toggle.input.focus();
    await expect(toggle.track).toHaveCSS('outline-style', 'solid');
  }
  for (const name of ['Loading off', 'Loading on']) {
    const loading = parts(page, name);
    expect(
      readability(await paint(loading.spinner, 'color'), await paint(loading.thumb)),
    ).toBeGreaterThanOrEqual(3);
  }
});
