import path from 'node:path';
import { TinyColor } from '@ctrl/tinycolor';
import { expect, type Locator, test } from '@playwright/test';

test.setTimeout(120_000);

async function tokenColor(locator: Locator, token: string) {
  return new TinyColor(
    await locator.evaluate(
      (element, name) => getComputedStyle(element).getPropertyValue(name),
      token,
    ),
  ).toRgbString();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=accessibility');
  await page.getByTestId('acceptance-workbench').waitFor({ state: 'visible', timeout: 30_000 });
});

test('keyboard dialog stack traps focus and restores the opener', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const opener = page.getByRole('button', { name: 'Open dialog', exact: true });
  await opener.focus();
  await opener.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Edit details' });
  await expect(dialog.getByRole('textbox', { name: 'Dialog name' })).toBeFocused();
  const owner = dialog.getByRole('combobox', { name: 'Dialog owner' });
  await owner.focus();
  await owner.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Done' }).focus();
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('density, theme and blur propagate to popup content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('switch', { name: 'Compact', exact: true }).check();
  await page.getByRole('switch', { name: 'Dark', exact: true }).check();
  await page.getByRole('switch', { name: 'Mask blur', exact: true }).uncheck();
  const scope = page.getByTestId('acceptance-workbench');
  await expect(scope).toHaveAttribute('data-leaf-density', 'compact');
  await expect(scope.locator('.leaf-input').first()).toHaveCSS('height', '30px');
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit details' });
  await expect(dialog.locator('.leaf-input')).toHaveCSS('height', '30px');
  await expect(dialog).toHaveCSS('color', await tokenColor(dialog, '--leaf-color-text'));
  await expect(dialog.locator('..')).toHaveAttribute('data-blur', 'off');
  await dialog.getByRole('combobox', { name: 'Dialog owner' }).click();
  await expect(page.getByRole('option', { name: 'Alex', exact: true })).toHaveCSS(
    'min-height',
    '30px',
  );
});

test('themes produce concrete colors in both appearances', async ({ page }) => {
  const scope = page.getByTestId('acceptance-workbench');
  const expectedAlpha = async () =>
    new TinyColor(
      await scope.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-color-primary').trim(),
      ),
    )
      .setAlpha(0.12)
      .toRgbString();
  const result = await page.evaluate(() => {
    const node = document.querySelector<HTMLElement>('[data-testid="acceptance-workbench"]');
    if (!node) throw new Error('Missing scope');
    return getComputedStyle(node).getPropertyValue('--leaf-color-primary-alpha-12').trim();
  });
  expect(result).toBe(await expectedAlpha());
  await page.getByRole('switch', { name: 'Dark', exact: true }).check();
  await expect
    .poll(async () => {
      const actual = await scope.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-color-primary-alpha-12').trim(),
      );
      return actual === (await expectedAlpha());
    })
    .toBe(true);
});

test('CSS expressions stay browser-native without a DOM color resolution pass', async ({
  page,
}) => {
  await page.goto('/?fixture=colors');
  const scope = page.getByTestId('variable-theme');
  const palette = (key: string) =>
    scope.evaluate((node, token) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = `var(${token})`;
      node.append(probe);
      const value = getComputedStyle(probe).backgroundColor;
      const canvas = document.createElement('canvas').getContext('2d');
      if (!canvas) throw new Error('Canvas is required for color normalization');
      canvas.fillStyle = value;
      canvas.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data;
      probe.remove();
      return `rgba(${r}, ${g}, ${b}, ${((a ?? 0) / 255).toFixed(2)})`;
    }, key);
  const tagMatchesSoft = () =>
    page.getByTestId('variable-tag').evaluate((tag) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = 'var(--leaf-color-primary-soft)';
      tag.append(probe);
      const canvas = document.createElement('canvas').getContext('2d');
      if (!canvas) throw new Error('Canvas is required for color normalization');
      const normalize = (node: Element) => {
        canvas.clearRect(0, 0, 1, 1);
        canvas.fillStyle = getComputedStyle(node).backgroundColor;
        canvas.fillRect(0, 0, 1, 1);
        return [...canvas.getImageData(0, 0, 1, 1).data].join(',');
      };
      const matches = normalize(tag) === normalize(probe);
      probe.remove();
      return matches;
    });
  await expect
    .poll(() => palette('--leaf-color-primary-alpha-12'), { timeout: 20_000 })
    .toBe('rgba(255, 0, 0, 0.12)');
  const initialSoft = await palette('--leaf-color-primary-soft');
  await expect.poll(tagMatchesSoft).toBe(true);
  await page.getByRole('button', { name: 'Change custom palette' }).click();
  await expect
    .poll(() => palette('--leaf-color-primary-alpha-12'), { timeout: 20_000 })
    .toBe('rgba(0, 0, 255, 0.12)');
  const changedSoft = await palette('--leaf-color-primary-soft');
  expect(changedSoft).not.toBe(initialSoft);
  await expect
    .poll(() => palette('--leaf-color-surface'), { timeout: 20_000 })
    .toBe('rgba(0, 0, 0, 1.00)');
  await expect.poll(tagMatchesSoft).toBe(true);
});

test('reflow at 320 CSS px keeps actions and overlays reachable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit details' });
  const rect = await dialog.boundingBox();
  expect(rect?.width).toBeLessThanOrEqual(320);
  await expect(dialog.getByRole('button', { name: 'Done' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open drawer', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Inspect drawer' })).toBeVisible();
});

test('CSS magnification and touch preserve usable controls', async ({ page }) => {
  test.skip(!test.info().project.use.hasTouch, 'Project has no touch emulation');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 640, height: 1000 });
  await page
    .getByTestId('acceptance-workbench')
    .evaluate((node) => ((node as HTMLElement).style.zoom = '2'));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Open drawer', exact: true }).tap();
  const drawer = page.getByRole('dialog', { name: 'Inspect drawer' });
  await expect(drawer).toBeVisible();
  await drawer.getByRole('button', { name: 'Done' }).tap();
  await expect(drawer).toBeHidden();
});

test('axe passes in both appearances and a keyboard-operated dialog', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addScriptTag({ path: path.resolve('node_modules/axe-core/axe.min.js') });
  const violations = () =>
    page.evaluate(async () => {
      const axe = (
        window as unknown as {
          axe: {
            run: (
              context: string,
            ) => Promise<{ violations: { id: string; impact: string; nodes: unknown[] }[] }>;
          };
        }
      ).axe;
      return (await axe.run('body')).violations;
    });
  expect(await violations()).toEqual([]);
  await page.getByRole('switch', { name: 'Dark', exact: true }).check();
  expect(await violations()).toEqual([]);
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  expect(await violations()).toEqual([]);
});

test('forced colors keep keyboard focus visible', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const button = page.getByRole('button', { name: 'Save', exact: true });
  await button.focus();
  await expect(button).toBeFocused();
  expect(await button.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
});
