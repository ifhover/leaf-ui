import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`${theme}: collapse clips hover feedback to its rounded frame`, async ({ page }, info) => {
    await page.goto(`/?fixture=workbench-review&lang=en&theme=${theme}`);
    for (const size of ['sm', 'md', 'lg']) {
      const collapse = page.getByTestId(`collapse-${size}`);
      const trigger = collapse.locator('.leaf-collapse__trigger');
      await expect(collapse).toHaveCSS('overflow-x', 'clip');
      await expect(collapse).toHaveCSS('overflow-y', 'clip');
      await expect(collapse).not.toHaveCSS('border-top-left-radius', '0px');
      await trigger.hover();
      await expect(trigger).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(collapse.getByText('Expanded content')).toBeVisible();
      await trigger.focus();
      await trigger.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    }
    await page.screenshot({ path: info.outputPath(`collapse-hover-${theme}.png`), fullPage: true });
  });
}
