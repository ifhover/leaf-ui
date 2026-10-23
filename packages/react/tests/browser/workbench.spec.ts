import { expect, test } from '@playwright/test';

for (const appearance of ['light', 'dark']) {
  for (const width of [1280, 375]) {
    test(`workbench hierarchy and actions in ${appearance} at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/?fixture=workbench&theme=${appearance}`);
      await expect(page.getByTestId('workbench-body')).toHaveCSS('font-weight', '400');
      await expect(page.getByTestId('workbench-strong')).toHaveCSS('font-weight', '700');
      await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toHaveCSS(
        'font-weight',
        '700',
      );
      const action = page.getByTestId('workbench-outline');
      await expect(action).toHaveCSS('font-weight', '500');
      await expect(action).toHaveCSS('border-radius', '8px');
      await expect(page.getByRole('heading', { name: 'Your projects' })).toHaveCSS(
        'font-weight',
        '500',
      );
      const card = page.locator('.leaf-card').first();
      await expect(card).toHaveCSS('border-radius', '12px');
      await expect(card.locator('.leaf-card__panel')).toHaveCSS('border-radius', '9px');
      await expect(card).toHaveCSS('box-shadow', 'none');
      await expect(page.locator('.leaf-tag').first()).toHaveCSS('border-radius', '4px');
      const tokenColor = async (name: string) =>
        action.evaluate((node, variable) => {
          const probe = document.createElement('span');
          probe.style.color = `var(${variable})`;
          node.append(probe);
          const value = getComputedStyle(probe).color;
          probe.remove();
          return value;
        }, name);
      await expect(page.getByRole('button', { name: 'New project', exact: true })).toHaveCSS(
        'background-color',
        await tokenColor('--leaf-color-primary'),
      );
      await expect(page.getByTestId('brand-action')).toHaveCSS(
        'background-color',
        await tokenColor('--leaf-color-primary'),
      );
      await expect(page.getByTestId('workbench-danger')).toHaveCSS(
        'color',
        await tokenColor('--leaf-color-danger-ink'),
      );
      await expect(page.getByTestId('workbench-override')).toHaveCSS('color', 'rgb(132, 61, 0)');
      await expect(page.getByTestId('workbench-override')).toHaveCSS(
        'background-color',
        'rgb(255, 240, 219)',
      );
      const rest = await action.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          color: style.color,
          background: style.backgroundColor,
          border: style.borderColor,
          shadow: style.boxShadow,
        };
      });
      await action.hover();
      await expect(action).toHaveCSS('border-color', rest.border);
      await page.mouse.down();
      await expect(action).not.toHaveCSS('border-color', rest.border);
      await expect(action).toHaveCSS('color', rest.color);
      await expect(action).toHaveCSS('background-color', rest.background);
      await expect(action).toHaveCSS('box-shadow', rest.shadow);
      await page.mouse.up();
      await page.mouse.move(0, 0);
      await expect(action).toHaveCSS('border-color', rest.border);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: testInfo.outputPath(`workbench-${appearance}-${width}.png`),
        fullPage: true,
      });
      const tabs = page.getByRole('tab', { name: 'All projects', exact: true });
      await tabs.focus();
      await tabs.press('ArrowRight');
      await expect(page.getByRole('tab', { name: 'In progress', exact: true })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(
        page.getByRole('button', { name: 'Prepare the next release', exact: true }),
      ).toHaveCount(0);
      await page.getByRole('button', { name: 'Reset filters' }).click();
      await page.getByRole('textbox', { name: 'Search projects' }).fill('release');
      await expect(
        page.getByRole('button', { name: 'Prepare the next release', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
      await expect(page.getByRole('status')).toHaveText('Changes saved');
    });
  }
}
