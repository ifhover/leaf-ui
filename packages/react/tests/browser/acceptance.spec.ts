import path from 'node:path';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('compound required fields, exact decimals, formatted date and native reset', async ({
  page,
}) => {
  await page.getByRole('checkbox', { name: 'People Alice', exact: true }).check();
  const date = page.getByRole('combobox', { name: 'Start date' });
  await date.fill('08/10/2026');
  await date.press('Enter');
  await expect(date).toHaveValue('08/10/2026');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByTestId('saved')).toContainText('9007199254740993.01');
  await expect(page.getByTestId('saved')).toContainText('2026-10-08');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(date).toHaveValue('05/10/2026');
  await expect(page.getByRole('checkbox', { name: 'People Alice', exact: true })).not.toBeChecked();
});

test('remote labels persist and clicking a select edge opens a correctly positioned popup', async ({
  page,
}) => {
  const input = page.getByRole('combobox', { name: 'Remote person' });
  await page.getByRole('button', { name: 'Replace options' }).click();
  await expect(input).toHaveValue('Alice');
  const control = input.locator('xpath=ancestor::div[contains(@class, "leaf-select ")][1]');
  await control.click({ position: { x: 2, y: 10 } });
  const popup = page
    .getByRole('listbox')
    .filter({ has: page.getByRole('option', { name: 'Charlie' }) });
  await expect(popup).toBeVisible();
  const triggerBox = await control.boundingBox(),
    panelBox = await popup.boundingBox();
  expect(triggerBox).toBeTruthy();
  expect(panelBox).toBeTruthy();
  expect(Math.abs((panelBox?.x ?? 0) - (triggerBox?.x ?? 0))).toBeLessThan(8);
  await page.getByRole('option', { name: 'Charlie' }).click();
  await expect(popup).toBeHidden();
  await expect(input).toHaveValue('Charlie');
});

test('disabled time options are skipped with keyboard and invalid typing does not commit', async ({
  page,
}) => {
  const input = page.getByRole('combobox', { name: 'Time', exact: true });
  await input.click();
  const hours = page.getByRole('listbox', { name: 'Hours', exact: true });
  await expect(hours.getByRole('option', { name: '10', exact: true })).toBeDisabled();
  await hours.getByRole('option', { name: '09', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(hours.getByRole('option', { name: '11', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(input).toHaveValue('11:30');
  await input.fill('10:30');
  await input.press('Enter');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
});

test('nested popup respects modal focus ownership and Escape restores the trigger', async ({
  page,
}) => {
  const opener = page.getByRole('button', { name: 'Open modal' });
  await opener.focus();
  await opener.press('Enter');
  const modal = page.getByRole('dialog', { name: 'Edit person' });
  await expect(modal.getByRole('textbox', { name: 'Modal name' })).toBeFocused();
  const select = modal.getByRole('combobox', { name: 'Modal person' });
  await select.click();
  await select.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(modal).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('drawer and splitter resize with pointers, and splitter remains keyboard accessible', async ({
  page,
}) => {
  // Pointer geometry is tested independently of the drawer's entrance transition.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Open drawer' }).click();
  const drawer = page.getByRole('dialog', { name: 'Workspace' });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const before = await drawer.boundingBox();
  const handle = drawer.getByRole('separator');
  const box = await handle.boundingBox();
  if (!box || !before) throw new Error('Missing drawer geometry');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x - 70, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  expect((await drawer.boundingBox())?.width).toBeGreaterThan(before.width + 50);
  await page.keyboard.press('Escape');
  const splitter = page.getByRole('separator', { name: 'Resize panel 1' });
  await splitter.focus();
  await splitter.press('ArrowRight');
  expect(Number(await splitter.getAttribute('aria-valuenow'))).toBeGreaterThan(50);
  const start = await splitter.boundingBox();
  if (!start) throw new Error('Missing splitter geometry');
  await page.mouse.move(start.x + start.width / 2, start.y + 40);
  await page.mouse.down();
  await page.mouse.move(start.x - 100, start.y + 40, { steps: 8 });
  await page.mouse.up();
  expect(Number(await splitter.getAttribute('aria-valuenow'))).toBeLessThan(50);
});

test('carousel touch and keyboard navigation leave inactive slides inert', async ({ page }) => {
  const carousel = page.getByRole('region', { name: 'Highlights' });
  await carousel.focus();
  await carousel.press('ArrowRight');
  await expect(carousel.getByRole('button', { name: 'Slide 2', exact: true })).toBeVisible();
  await expect(carousel.locator('[aria-hidden="true"][inert]')).toHaveCount(2);
  await carousel.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 250, clientY: 100 });
  await carousel.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 100, clientY: 100 });
  await expect(carousel.getByRole('button', { name: 'Slide 3', exact: true })).toBeVisible();
});

test('IME suggestions do not commit composition text and mentions insert at the caret', async ({
  page,
}) => {
  const input = page.getByRole('combobox', { name: 'Suggestion' });
  await input.click();
  await input.dispatchEvent('compositionstart');
  await input.fill('Al');
  await input.press('Enter');
  await expect(input).toHaveValue('Al');
  await input.dispatchEvent('compositionend', { data: 'Al' });
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(input).toHaveValue('Alice');
  const notes = page.getByRole('combobox', { name: 'Notes' });
  await notes.fill('Hello @al later');
  await notes.evaluate((node: HTMLTextAreaElement) => {
    node.setSelectionRange(9, 9);
    node.dispatchEvent(new Event('select', { bubbles: true }));
  });
  await notes.press('ArrowLeft');
  await notes.press('ArrowRight');
  await expect(page.getByRole('option', { name: 'Alice', exact: true })).toBeVisible();
  await notes.press('Enter');
  await expect(notes).toHaveValue('Hello @alice  later');
});

test('hover menus and context menus work at pointer coordinates', async ({ page }) => {
  await page.getByRole('button', { name: 'Hover actions' }).hover();
  await expect(page.getByRole('menuitem', { name: 'Edit', exact: true })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Edit', exact: true }).click();
  const trigger = page.getByRole('button', { name: 'Context actions' });
  await trigger.click({ button: 'right', position: { x: 25, y: 12 } });
  const menu = page
    .getByRole('menu')
    .filter({ has: page.getByRole('menuitem', { name: 'Copy', exact: true }) });
  await expect(menu).toBeVisible();
  const triggerBox = await trigger.boundingBox(),
    menuBox = await menu.boundingBox();
  expect(Math.abs((menuBox?.x ?? 0) - ((triggerBox?.x ?? 0) + 25))).toBeLessThan(8);
});

test('custom ShadowRoot portals preserve theme, direction and dismissal', async ({ page }) => {
  await page.goto('/?fixture=shadow');
  await page.getByRole('combobox', { name: 'Shadow person' }).click();
  await page.getByRole('option', { name: 'Bob', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Shadow person' })).toHaveValue('Bob');
  await page.getByRole('combobox', { name: 'Shadow person' }).click();
  const popup = page.getByRole('listbox');
  expect(await popup.evaluate((node) => node.getRootNode() instanceof ShadowRoot)).toBe(true);
  expect(await popup.evaluate((node) => getComputedStyle(node).direction)).toBe('rtl');
  await page.getByRole('combobox', { name: 'Shadow person' }).press('Escape');
  await expect(popup).toBeHidden();
});

test('real-browser accessibility has no serious or critical violations', async ({ page }) => {
  await page.addScriptTag({ path: path.resolve('node_modules/axe-core/axe.min.js') });
  const violations = await page.evaluate(async () => {
    const axe = (
      window as unknown as {
        axe: {
          run: (context: string) => Promise<{
            violations: Array<{
              id: string;
              impact: string;
              nodes: Array<{ target: string[]; failureSummary: string }>;
            }>;
          }>;
        };
      }
    ).axe;
    return (await axe.run('main')).violations.filter((item) =>
      ['serious', 'critical'].includes(item.impact),
    );
  });
  expect(violations).toEqual([]);
});
