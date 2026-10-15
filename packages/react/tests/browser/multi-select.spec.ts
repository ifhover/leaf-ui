import { expect, type Locator, test } from '@playwright/test';
import axe from 'axe-core';

function controlRoot(control: Locator) {
  return control.locator(
    'xpath=ancestor::*[contains(@class, "leaf-select--") or contains(@class, "leaf-tree-select--") or contains(@class, "leaf-cascader--")][1]',
  );
}

async function assertSingleLine(control: Locator, height: number) {
  const root = controlRoot(control);
  await expect(root).toHaveCSS('height', `${height}px`);
  const geometry = await root.evaluate((element) => {
    const content = element.querySelector<HTMLElement>('.leaf-selection');
    const visible = [
      ...element.querySelectorAll<HTMLElement>(
        '.leaf-selection > .leaf-selection__tag:not([hidden])',
      ),
    ];
    const bounds = content?.getBoundingClientRect();
    return {
      width: element.clientWidth,
      scrollWidth: element.scrollWidth,
      tags: visible.map((tag) => {
        const rect = tag.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
      }),
      bounds: bounds && { left: bounds.left, right: bounds.right },
    };
  });
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width);
  for (const tag of geometry.tags) {
    expect(tag.left).toBeGreaterThanOrEqual((geometry.bounds?.left ?? 0) - 1);
    expect(tag.right).toBeLessThanOrEqual((geometry.bounds?.right ?? 0) + 1);
    expect(tag.top).toBe(geometry.tags[0]?.top);
    expect(tag.bottom - tag.top).toBe(height - 8);
  }
}

for (const appearance of ['light', 'dark']) {
  test.describe(appearance, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/?fixture=multi-select&theme=${appearance}`);
      await page.evaluate(() => document.fonts.ready);
    });

    test('single-line values fit all sizes, resize, density and RTL without losing form values', async ({
      page,
    }) => {
      for (const [size, height] of [
        ['sm', 30],
        ['md', 36],
        ['lg', 42],
      ] as const) {
        for (const kind of ['Select', 'Tree', 'Cascader'])
          await assertSingleLine(
            page.getByRole('combobox', { name: `${kind} ${size}`, exact: true }),
            height,
          );
      }
      const formValue = () =>
        page.getByRole('form').evaluate((form) => [...new FormData(form as HTMLFormElement)]);
      const before = await formValue();
      await page.getByRole('button', { name: 'Resize selections' }).click();
      await page.getByRole('button', { name: 'Toggle direction' }).click();
      for (const kind of ['Select', 'Tree', 'Cascader']) {
        const input = page.getByRole('combobox', { name: `${kind} md`, exact: true });
        await assertSingleLine(input, 36);
        await expect(
          controlRoot(input)
            .locator('.leaf-selection__tag[title]')
            .filter({ hasText: '+4' })
            .first(),
        ).toBeVisible();
      }
      await page.getByRole('button', { name: 'Toggle density' }).click();
      await assertSingleLine(page.getByRole('combobox', { name: 'Select md', exact: true }), 30);
      expect(await formValue()).toEqual(before);
      await page.getByRole('button', { name: 'Resize selections' }).click();
      await assertSingleLine(page.getByRole('combobox', { name: 'Tree md', exact: true }), 30);
    });

    test('long first labels, search, removal and custom tags stay usable', async ({ page }) => {
      const input = page.getByRole('combobox', { name: 'Select md', exact: true });
      const root = controlRoot(input);
      const first = root.locator('[data-selection-item]:not([hidden])').first();
      await expect(first).toBeVisible();
      expect(
        await first
          .locator('span')
          .first()
          .evaluate((label) => label.scrollWidth > label.clientWidth),
      ).toBe(true);
      await input.fill('Engineering');
      await assertSingleLine(input, 36);
      expect(await input.boundingBox()).toMatchObject({ height: 28 });
      await expect(page.getByRole('option', { name: 'Engineering', exact: true })).toBeVisible();
      await input.press('Escape');
      await root.getByRole('button', { name: /^Remove A very long/ }).click();
      await expect(input).toBeFocused();
      await expect(input).toHaveAttribute('aria-expanded', 'false');
      await input.press('Backspace');
      // Disabled Locked cannot be removed; Backspace removes the last enabled value.
      await expect(root.locator('[data-selection-item][title="Engineering"]')).toHaveCount(0);
      await expect(root.locator('[data-selection-item][title="Locked"]')).toHaveCount(1);
      await page.getByRole('button', { name: 'Reset selections' }).click();
      await assertSingleLine(input, 36);
      await assertSingleLine(page.getByRole('combobox', { name: 'One long value' }), 36);
      await assertSingleLine(page.getByRole('combobox', { name: 'Custom tags' }), 36);
      await assertSingleLine(page.getByRole('combobox', { name: 'Count only' }), 36);
      await expect(
        controlRoot(page.getByRole('combobox', { name: 'Count only' })).locator(
          '[data-selection-overflow]',
        ),
      ).toContainText('+4');
      await expect(
        controlRoot(page.getByRole('combobox', { name: 'Read only selections' })).getByRole(
          'button',
          { name: /^Remove/ },
        ),
      ).toHaveCount(0);
    });

    test('tree expansion, whole-row checks, trigger edges and cascader search spacing', async ({
      page,
    }) => {
      const input = page.getByRole('combobox', { name: 'Single tree' });
      await controlRoot(input).click({ position: { x: 3, y: 18 } });
      await page.getByText('Team', { exact: true }).last().click();
      await expect(page.getByRole('treeitem', { name: 'Team', exact: true })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      await page.getByText('Design', { exact: true }).last().click();
      await expect(input).toHaveValue('Design');
      await input.click();
      await expect(input).toHaveValue('Design');
      await expect(page.getByRole('treeitem', { name: 'Team', exact: true })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      await input.press('Escape');
      const checked = page.getByRole('combobox', { name: 'Checked tree' });
      await checked.click();
      await page.getByRole('button', { name: 'Expand Team', exact: true }).click();
      const row = page.getByRole('treeitem', { name: 'Design', exact: true });
      await row.locator('.leaf-tree__row').click({ position: { x: 200, y: 16 } });
      await expect(row).toHaveAttribute('aria-checked', 'true');
      await row.press('Enter');
      await expect(row).toHaveAttribute('aria-checked', 'false');
      await page.keyboard.press('Escape');
      await page.getByRole('combobox', { name: 'Cascader md', exact: true }).click();
      await expect(page.locator('.leaf-cascader__panel')).toHaveAttribute(
        'data-positioned',
        'true',
      );
      await page.waitForTimeout(350);
      const gap = await page.locator('.leaf-cascader__panel').evaluate((panel) => {
        const search = panel.querySelector('.leaf-cascader__search')?.getBoundingClientRect();
        const column = panel.querySelector('.leaf-cascader__columns')?.getBoundingClientRect();
        return (column?.top ?? 0) - (search?.bottom ?? 0);
      });
      expect(gap).toBeGreaterThanOrEqual(8);
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(
        async () =>
          (
            await (window as unknown as { axe: typeof axe }).axe.run(document, {
              runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
              rules: { 'color-contrast': { enabled: false } },
            })
          ).violations,
      );
      expect(violations).toEqual([]);
    });
  });
}
