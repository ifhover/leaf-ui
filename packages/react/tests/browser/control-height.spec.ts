import { expect, test } from '@playwright/test';

for (const [suffix, base] of [
  ['', 36],
  ['&compact=1', 30],
  ['&tokens=1', 44],
  ['&theme=dark', 36],
  ['&rtl=1', 36],
] as const) {
  test(`control and popup geometry follows the ${base}px region ${suffix || 'default'}`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/?fixture=control-height${suffix}`);
    await expect(page.getByRole('heading', { name: 'Shared control height' })).toBeVisible();
    const metrics = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-height-control]')].map((wrapper) => {
        const control = wrapper.querySelector<HTMLElement>(
          ':scope > :not(input[type="hidden"]):not(.leaf-form-value)',
        );
        if (!control) throw new Error(`Missing ${wrapper.dataset.heightControl}`);
        const measured =
          wrapper.dataset.heightControl === 'Tabs'
            ? (control.querySelector<HTMLElement>('.leaf-tabs__list') ?? control)
            : control;
        return {
          name: wrapper.dataset.heightControl,
          size: wrapper
            .closest('[data-testid]')
            ?.getAttribute('data-testid')
            ?.replace('controls-', ''),
          height: measured.getBoundingClientRect().height,
        };
      }),
    );
    await testInfo.attach('control-geometry', {
      body: JSON.stringify(metrics),
      contentType: 'application/json',
    });
    for (const metric of metrics) {
      const height = base + (metric.size === 'sm' ? -6 : metric.size === 'lg' ? 6 : 0);
      expect.soft(metric.height, `${metric.name} ${metric.size}`).toBeCloseTo(height, 0);
    }
    const rowHeight = base - 4;
    for (const name of [
      'Select md',
      'AutoComplete md',
      'Cascader md',
      'TreeSelect md',
      'Time md',
    ]) {
      await page.getByRole('combobox', { name, exact: true }).click();
      const panel = page.locator('.leaf-floating[data-state="open"]');
      await expect(panel).toBeVisible();
      const row = panel
        .locator(name.startsWith('TreeSelect') ? '.leaf-tree__row' : '.leaf-floating__option')
        .first();
      await expect.poll(async () => (await row.boundingBox())?.height).toBeCloseTo(rowHeight, 0);
      if (name === 'Select md' || name === 'AutoComplete md' || name === 'TreeSelect md') {
        const scroll = panel.getByRole(name.startsWith('TreeSelect') ? 'tree' : 'listbox');
        await scroll.evaluate((node) => {
          node.scrollTop = node.scrollHeight;
        });
        await expect(panel.getByText('Option 119', { exact: true })).toBeVisible();
      }
      await page.keyboard.press('Escape');
      await expect(panel).toBeHidden();
    }
  });
}
