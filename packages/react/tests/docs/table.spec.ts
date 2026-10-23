import { expect, test } from '@playwright/test';
import {
  expectDataRowStripes,
  expectShortHeaderSeparators,
} from '../browser/helpers/table-appearance';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Layered DataTable example: ${language} ${width} ${appearance}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${language === 'en' ? '/en' : ''}/components/table.html`);
        const html = page.locator('html');
        if (
          Boolean((await html.getAttribute('class'))?.includes('dark')) !==
          (appearance === 'dark')
        ) {
          await page
            .getByRole('button', {
              name: language === 'en' ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
            })
            .first()
            .click();
        }
        const table = page.getByRole('table', {
          name: language === 'en' ? 'Pinned and resizable columns' : '固定列与列宽调整',
          exact: true,
        });
        const root = table.locator(
          'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " leaf-table ")][1]',
        );
        const viewport = root.locator('.leaf-table__viewport');
        await viewport.scrollIntoViewIfNeeded();
        const header = table.locator('thead');
        await expect(header).toHaveCSS('position', 'sticky');
        await expectShortHeaderSeparators(table);
        const backgrounds = await table
          .locator('tbody tr > td:first-child')
          .evaluateAll((cells) =>
            cells.slice(0, 3).map((cell) => getComputedStyle(cell).backgroundColor),
          );
        expect(backgrounds[0]).toBe(backgrounds[2]);
        expect(backgrounds[0]).not.toBe(backgrounds[1]);
        if (appearance === 'light') expect(backgrounds[0]).toBe('rgb(255, 255, 255)');
        await root.screenshot({ path: test.info().outputPath('table-layered-start.png') });
        const panel = root.locator('.leaf-table__panel');
        const before = { header: await header.boundingBox(), panel: await panel.boundingBox() };
        await viewport.evaluate((node) => {
          node.scrollTop = 100;
        });
        await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
        expect(await header.boundingBox()).toEqual(before.header);
        expect(await panel.boundingBox()).toEqual(before.panel);
        expect(
          await root.evaluate((node) => node.scrollWidth - node.clientWidth),
        ).toBeLessThanOrEqual(1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await root.screenshot({ path: test.info().outputPath('table-layered.png') });

        const directory = page.getByRole('table', {
          name: language === 'en' ? 'Team directory' : '团队成员列表',
          exact: true,
        });
        await directory.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        await expectDataRowStripes(directory);
        const trigger = directory.getByRole('button', {
          name: `${language === 'en' ? 'Expand row' : '展开行'}: Alex Morgan (member-1)`,
          exact: true,
        });
        await expect(trigger).toHaveClass(/\bleaf-button--text\b/);
        await trigger.focus();
        await page.keyboard.press('Enter');
        await expect(directory.locator('[data-detail-row="member-1"]')).toBeVisible();
        await expectDataRowStripes(directory);
        const directoryRoot = directory.locator(
          'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " leaf-data-table ")][1]',
        );
        await directoryRoot.screenshot({
          path: test.info().outputPath('table-expand-stripes.png'),
        });
        await page.keyboard.press('Space');
        await expect(directory.locator('[data-detail-row="member-1"]')).toBeHidden();
        await expectDataRowStripes(directory);
        await directoryRoot
          .getByRole('button', { name: language === 'en' ? 'Next page' : '下一页', exact: true })
          .click();
        await page.mouse.move(0, 0);
        await expectDataRowStripes(directory);
      });
    }
  }
}
