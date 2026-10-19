import { expect as baseExpect, test } from '@playwright/test';

const expect = baseExpect.configure({ timeout: 20_000 });
for (const theme of ['light', 'dark']) {
  for (const kind of ['autocomplete', 'tree', 'mentions', 'cascader']) {
    test(`${theme} ${kind} shares trigger, content, fixed and maximum widths`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.goto(`/?fixture=input-popup-width&theme=${theme}&component=${kind}`);
      const input = page.getByRole('combobox', { name: 'Width field', exact: true });
      const panel = page.locator('.leaf-floating[data-state="open"]');
      const open = async () => {
        if (kind === 'mentions') {
          await input.fill('');
          await input.pressSequentially('@');
        } else await input.click();
        await expect(panel).toHaveAttribute('data-positioned', 'true');
      };
      const width = () => panel.evaluate((node: HTMLElement) => node.offsetWidth);
      await open();
      await expect.poll(width).toBe(560);
      await input.press('Escape');
      await page.getByRole('button', { name: 'Fit content', exact: true }).click();
      await open();
      await expect.poll(width).toBeLessThan(180);
      await input.press('Escape');
      await page.getByRole('button', { name: 'Use long label', exact: true }).click();
      await open();
      if (kind !== 'cascader') await expect.poll(width).toBeGreaterThan(420);
      // Cascader columns keep their readable column width while the panel uses the same sizing API.
      await input.press('Escape');
      await page.getByRole('button', { name: 'Fix width', exact: true }).click();
      await open();
      await expect.poll(width).toBe(500);
      await input.press('Escape');
      await page.getByRole('button', { name: 'Limit width', exact: true }).click();
      await open();
      await expect.poll(width).toBe(240);
      await input.press('Escape');
      await page.getByRole('button', { name: 'Restore default', exact: true }).click();
      await open();
      await expect.poll(width).toBe(560);
      await page.setViewportSize({ width: 375, height: 812 });
      await expect.poll(width).toBeLessThanOrEqual(351);
    });
  }
}
