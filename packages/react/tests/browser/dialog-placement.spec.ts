import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1100, height: 900 },
  { width: 375, height: 640 },
]) {
  for (const theme of ['light', 'dark']) {
    test(`dialogs are optically raised with stronger shadows: ${viewport.width} ${theme}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      for (const kind of ['modal', 'confirm']) {
        await page.goto(`/?fixture=${kind === 'modal' ? 'feedback' : 'surfaces'}&theme=${theme}`);
        await page
          .getByRole('button', {
            name: kind === 'modal' ? '编辑项目' : 'Simple confirmation',
            exact: true,
          })
          .click();
        const dialog = page.getByRole(kind === 'modal' ? 'dialog' : 'alertdialog');
        await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', {
          timeout: 20_000,
        });
        const box = await dialog.boundingBox();
        expect(box).not.toBeNull();
        if (!box) throw new Error('Missing dialog bounds');
        const bottomInset = Math.min(160, Math.max(24, viewport.height * 0.16));
        expect(box.x + box.width / 2).toBeCloseTo(viewport.width / 2, 0);
        expect(box.y + box.height / 2).toBeCloseTo((viewport.height + 24 - bottomInset) / 2, 0);
        expect(box.y).toBeGreaterThanOrEqual(23);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - bottomInset + 1);
        const shadow = await dialog.evaluate((node) => getComputedStyle(node).boxShadow);
        expect(shadow.match(/rgba?\(/g)).toHaveLength(6);
        expect(shadow).toContain('6px 20px');
        await dialog.screenshot({ path: testInfo.outputPath(`${kind}.png`) });
        // Explicit surface and component overrides must replace, not compound, the default.
        await dialog.evaluate((node) => {
          (node as HTMLElement).style.setProperty('--leaf-surface-shadow', 'none');
        });
        await expect(dialog).toHaveCSS('box-shadow', 'none');
        await dialog.evaluate((node, component) => {
          (node as HTMLElement).style.setProperty(
            `--leaf-component-${component}-shadow`,
            '0px 1px 2px rgb(0 0 0 / 0.3)',
          );
        }, kind);
        await expect(dialog).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.3) 0px 1px 2px 0px');
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
      }
    });
  }
}
