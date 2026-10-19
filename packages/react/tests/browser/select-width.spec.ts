import { expect as baseExpect, type Page, test } from '@playwright/test';

const expect = baseExpect.configure({ timeout: 20_000 });
const panel = (page: Page) => page.locator('.leaf-select__panel[data-state="open"]');
async function open(page: Page, name: string) {
  await page.getByRole('combobox', { name, exact: true }).click();
  await expect(panel(page)).toHaveAttribute('data-positioned', 'true');
}
async function expectWidth(page: Page, width: number) {
  // Layout width is independent of the popup's enter/exit scale animation.
  await expect
    .poll(() => panel(page).evaluate((node: HTMLElement) => node.offsetWidth), { timeout: 20_000 })
    .toBe(width);
}

for (const appearance of ['light', 'dark']) {
  test.describe(appearance, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/?fixture=select-width&theme=${appearance}`);
    });

    test('defaults match the full trigger width beyond 420px and track resizing', async ({
      page,
    }) => {
      for (const name of ['Default short', 'Default long']) {
        await open(page, name);
        await expectWidth(page, 560);
        await page.getByRole('combobox', { name, exact: true }).evaluate((input) => {
          const trigger = input.closest<HTMLElement>('.leaf-select');
          if (trigger) trigger.style.width = '640px';
        });
        await expectWidth(page, 640);
        await page.keyboard.press('Escape');
      }
    });

    test('content width can be narrower or wider than the trigger without a 420px cap', async ({
      page,
    }) => {
      await open(page, 'Content short');
      await expect
        .poll(() => panel(page).evaluate((node: HTMLElement) => node.offsetWidth))
        .toBeLessThan(180);
      await page.keyboard.press('Escape');
      await open(page, 'Content long');
      await expect
        .poll(() => panel(page).evaluate((node: HTMLElement) => node.offsetWidth))
        .toBeGreaterThan(420);
      await page.keyboard.press('Escape');
      await open(page, 'Fixed width');
      await expectWidth(page, 560);
      await page.keyboard.press('Escape');
      await open(page, 'CSS width');
      await expectWidth(page, 512);
    });

    test('explicit maxima constrain every width mode and popupStyle remains supported', async ({
      page,
    }) => {
      for (const mode of ['trigger', 'auto', '560']) {
        await open(page, `Limited ${mode}`);
        await expectWidth(page, 240);
        await page.keyboard.press('Escape');
      }
      await open(page, 'Style maximum');
      await expectWidth(page, 260);
    });

    test('changing modes and regional defaults resolve without retaining earlier widths', async ({
      page,
    }) => {
      await open(page, 'Changing width');
      await expect
        .poll(() => panel(page).evaluate((node: HTMLElement) => node.offsetWidth))
        .toBeLessThan(180);
      for (const [button, width] of [
        ['Match trigger', 560],
        ['Use fixed width', 300],
      ] as const) {
        await page.getByRole('button', { name: button, exact: true }).click();
        await open(page, 'Changing width');
        await expectWidth(page, width);
      }
      await page.getByRole('button', { name: 'Fit content', exact: true }).click();
      await open(page, 'Changing width');
      await expect
        .poll(() => panel(page).evaluate((node: HTMLElement) => node.offsetWidth))
        .toBeLessThan(180);
      await page.keyboard.press('Escape');
      await open(page, 'Regional width');
      await expectWidth(page, 480);
      await page.keyboard.press('Escape');
      await open(page, 'Instance width');
      await expectWidth(page, 180);
    });

    test('all width modes fit narrow viewports and retain keyboard selection', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      for (const name of ['Default long', 'Content long', 'Fixed width']) {
        await open(page, name);
        const bounds = await panel(page).boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds?.x).toBeGreaterThanOrEqual(11);
        expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(364);
        await page.keyboard.press('Enter');
        await expect(page.getByRole('combobox', { name, exact: true })).toHaveValue(
          name === 'Fixed width'
            ? 'Leaf'
            : 'A long provider name with enough detail to exceed the previous 420 pixel popup width limit',
        );
        await expect(panel(page)).toHaveCount(0);
      }
    });
  });
}
