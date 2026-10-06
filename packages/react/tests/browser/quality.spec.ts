import path from 'node:path';
import { expect, test } from '@playwright/test';

test.setTimeout(120_000);
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
  await expect(scope.locator('.leaf-input').first()).toHaveCSS('height', '28px');
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit details' });
  await expect(dialog.locator('.leaf-input')).toHaveCSS('height', '28px');
  await expect(dialog).toHaveCSS('color', 'rgb(237, 237, 240)');
  await expect(dialog.locator('..')).toHaveAttribute('data-blur', 'off');
  await dialog.getByRole('combobox', { name: 'Dialog owner' }).click();
  await expect(page.getByRole('option', { name: 'Alex', exact: true })).toHaveCSS(
    'min-height',
    '28px',
  );
});

test('themes produce concrete colors in both appearances', async ({ page }) => {
  const result = await page.evaluate(() => {
    const scope = document.querySelector<HTMLElement>('[data-testid="acceptance-workbench"]');
    if (!scope) throw new Error('Missing scope');
    return getComputedStyle(scope).getPropertyValue('--leaf-color-primary-alpha-12');
  });
  expect(result.trim()).toBe('rgba(32, 131, 74, 0.12)');
  await page.getByRole('switch', { name: 'Dark', exact: true }).check();
  await expect
    .poll(() =>
      page
        .getByTestId('acceptance-workbench')
        .evaluate((node) =>
          getComputedStyle(node).getPropertyValue('--leaf-color-primary-alpha-12').trim(),
        ),
    )
    .toBe('rgba(131, 207, 158, 0.12)');
});

test('CSS variable palette and custom Tag update when ancestor colors change', async ({ page }) => {
  await page.goto('/?fixture=colors');
  const scope = page.getByTestId('variable-theme');
  const palette = (key: string) =>
    scope.evaluate((node, token) => getComputedStyle(node).getPropertyValue(token).trim(), key);
  await expect.poll(() => palette('--leaf-color-primary-alpha-12')).toBe('rgba(255, 0, 0, 0.12)');
  await expect(page.getByTestId('variable-tag')).toHaveCSS(
    'background-color',
    'rgb(255, 235, 235)',
  );
  await page.getByRole('button', { name: 'Change custom palette' }).click();
  await expect.poll(() => palette('--leaf-color-primary-alpha-12')).toBe('rgba(0, 0, 255, 0.12)');
  await expect.poll(() => palette('--leaf-color-surface-raised')).toBe('rgba(1, 1, 1, 1)');
  await expect(page.getByTestId('variable-tag')).toHaveCSS('background-color', 'rgb(0, 0, 20)');
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
