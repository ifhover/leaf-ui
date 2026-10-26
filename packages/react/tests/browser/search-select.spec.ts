import { expect, test } from '@playwright/test';
import axe from 'axe-core';
import { settleAnimations } from './helpers/motion';

for (const appearance of ['light', 'dark']) {
  test.describe(appearance, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/?fixture=search-select&theme=${appearance}`);
    });

    test('reopening preserves the input, caret and text geometry at every size', async ({
      page,
    }) => {
      for (const size of ['sm', 'md', 'lg']) {
        const input = page.getByRole('combobox', { name: `Search ${size}`, exact: true });
        await input.click();
        await page.getByRole('option', { name: 'Bob Miller', exact: true }).click();
        await expect(input).toHaveValue('Bob Miller');
        await settleAnimations(input.locator('..'));
        const metrics = () =>
          input.evaluate((node) => {
            const style = getComputedStyle(node);
            const bounds = node.getBoundingClientRect();
            return {
              height: bounds.height,
              top: bounds.top,
              left: bounds.left,
              font: style.font,
              lineHeight: style.lineHeight,
            };
          });
        const before = await metrics();
        await input.click({ position: { x: 180, y: before.height / 2 } });
        await expect(input).toHaveValue('Bob Miller');
        expect(
          await input.evaluate((node: HTMLInputElement) => [
            node.selectionStart,
            node.selectionEnd,
          ]),
        ).toEqual([10, 10]);
        expect(await metrics()).toEqual(before);
        await expect(input.locator('..').locator('.leaf-select__value')).toHaveCount(0);
        await expect(page.getByRole('option')).toHaveCount(3);
        await page.keyboard.type('Alice');
        await expect(input).toHaveValue('Alice');
        await expect(page.getByRole('option')).toHaveCount(1);
        await input.press('Escape');
        await expect(input).toHaveValue('Bob Miller');
        await expect(input).toBeFocused();
        expect(
          await page
            .getByRole('form')
            .evaluate((node, name) => new FormData(node as HTMLFormElement).get(name), size),
        ).toBe('bob');
      }
    });

    test('suggestions share option height, insets, spacing and neutral feedback with Select', async ({
      page,
    }) => {
      const input = page.getByRole('combobox', { name: 'Search md', exact: true });
      const metrics = (selector: string) =>
        page
          .locator(selector)
          .getByRole('option')
          .nth(1)
          .evaluate((node) => {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            const previous = node
              .closest('.leaf-floating')
              ?.querySelector('[role="option"]')
              ?.getBoundingClientRect();
            return {
              height: rect.height,
              start: style.paddingInlineStart,
              end: style.paddingInlineEnd,
              gap: previous ? Math.round(rect.top - previous.bottom) : 0,
            };
          });
      await input.click();
      await expect(page.locator('.leaf-select__panel')).toHaveAttribute('data-positioned', 'true');
      await settleAnimations(page.locator('.leaf-select__panel'));
      const selected = await metrics('.leaf-select__panel');
      await input.press('Escape');
      const autocomplete = page.getByRole('combobox', { name: 'Matching suggestions' });
      await autocomplete.click();
      const panel = page.locator('.leaf-autocomplete__panel');
      await expect(panel).toHaveAttribute('data-positioned', 'true');
      await settleAnimations(panel);
      expect(await metrics('.leaf-autocomplete__panel')).toEqual(selected);
      const row = panel.getByRole('option', { name: 'Bob Miller', exact: true });
      await row.hover();
      await expect(row).toHaveAttribute('aria-selected', 'true');
      await expect(panel.locator('.leaf-floating__highlight')).toHaveCount(0);
      await expect
        .poll(() => row.evaluate((node) => getComputedStyle(node, '::before').backgroundColor))
        .toBe('rgba(0, 0, 0, 0.04)');
      await expect(row).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await row.click();
      await expect(autocomplete).toHaveValue('bob');
    });

    test('explicit suggestion row heights apply to ordinary and virtual options', async ({
      page,
    }) => {
      for (const name of ['Short suggestions', 'Virtual short suggestions']) {
        const input = page.getByRole('combobox', { name, exact: true });
        await input.click();
        const panel = page.locator('.leaf-autocomplete__panel[data-state="open"]');
        await expect(panel).toHaveAttribute('data-positioned', 'true');
        await settleAnimations(panel);
        const row = panel.getByRole('option').first();
        await expect(row).toHaveCSS('min-height', '28px');
        expect((await row.boundingBox())?.height).toBe(28);
        await input.press('Escape');
      }
    });

    test('empty and busy panels put a decorative icon above the message and honor reduced motion', async ({
      page,
    }, info) => {
      test.setTimeout(120_000);
      await page.addScriptTag({ content: axe.source });
      for (const name of [
        'Empty selection',
        'Loading selection',
        'Empty suggestions',
        'Loading suggestions',
      ]) {
        const input = page.getByRole('combobox', { name, exact: true });
        await input.click();
        const panel = page.locator('.leaf-floating[data-state="open"]');
        const feedback = panel.locator('.leaf-floating__empty');
        const icon = feedback.locator('svg');
        await expect(icon).toHaveAttribute('aria-hidden', 'true');
        await expect(feedback).toHaveCSS('flex-direction', 'column');
        await expect
          .poll(async () =>
            feedback.evaluate((node) => {
              const icon = node.querySelector('svg')?.getBoundingClientRect();
              const text = node.querySelector('div')?.getBoundingClientRect();
              return !!icon && !!text && icon.bottom <= text.top;
            }),
          )
          .toBe(true);
        if (name.startsWith('Loading')) {
          await expect(panel.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
          await expect(icon).toHaveCSS('animation-name', 'leaf-floating-spin');
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await expect(icon).toHaveCSS('animation-name', 'none');
          await page.emulateMedia({ reducedMotion: 'no-preference' });
        } else await expect(icon).toHaveCSS('animation-name', 'none');
        // Check settled colors rather than the translucent enter transition.
        await expect(panel).toHaveCSS('opacity', '1');
        const accessibility = await page.evaluate(async () => {
          const result = await (window as typeof window & { axe: { run: typeof axe.run } }).axe.run(
            { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } },
          );
          return result.violations.map((violation) => ({
            id: violation.id,
            nodes: violation.nodes.map((node) => node.html),
          }));
        });
        expect(accessibility).toEqual([]);
        await page.screenshot({ path: info.outputPath(`${name.replaceAll(' ', '-')}.png`) });
        await input.press('Escape');
        await expect(input).toHaveAttribute('aria-expanded', 'false');
      }
    });
  });
}
