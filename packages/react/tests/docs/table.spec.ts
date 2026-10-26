import { expect, test } from '@playwright/test';
import {
  expectDataRowStripes,
  expectShortHeaderSeparators,
  expectSimpleTableSurface,
} from '../browser/helpers/table-appearance';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`Simple DataTable example: ${language} ${width} ${appearance}`, async ({ page }) => {
        const english = language === 'en';
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${english ? '/en' : ''}/components/table.html`);
        if (
          Boolean((await page.locator('html').getAttribute('class'))?.includes('dark')) !==
          (appearance === 'dark')
        ) {
          await page
            .getByRole('button', {
              name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
            })
            .first()
            .click();
        }
        const table = page.getByRole('table', {
          name: english ? 'Simple table' : '简洁表格',
          exact: true,
        });
        await table.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        await expectSimpleTableSurface(table);
        const example = page.locator('.leaf-component-example').filter({ has: table });
        expect(
          await example.locator('.leaf-component-example__source code').textContent(),
        ).toContain('variant="simple"');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await example.screenshot({ path: test.info().outputPath('simple-docs.png') });
      });

      test(`DataTable sorting opt-in and manual ownership: ${language} ${width} ${appearance}`, async ({
        page,
      }) => {
        const english = language === 'en';
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${english ? '/en' : ''}/components/table.html`);
        if (
          Boolean((await page.locator('html').getAttribute('class'))?.includes('dark')) !==
          (appearance === 'dark')
        ) {
          await page
            .getByRole('button', {
              name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
            })
            .first()
            .click();
        }

        const basic = page.getByRole('table', {
          name: english ? 'Team members' : '团队成员',
          exact: true,
        });
        await expect(basic.locator('thead button')).toHaveCount(0);
        const local = page.getByRole('table', {
          name: english ? 'Sortable members' : '可排序成员',
          exact: true,
        });
        const ids = (table: typeof local) =>
          table
            .locator('tbody tr[data-row-id]')
            .evaluateAll((rows) => rows.map((row) => row.getAttribute('data-row-id')));
        await expect(local.locator('thead button')).toHaveCount(2);
        const projects = local.getByRole('columnheader', {
          name: english ? /Projects/ : /项目数/,
        });
        await projects.getByRole('button').focus();
        await page.keyboard.press('Enter');
        await expect(projects).toHaveAttribute('aria-sort', 'descending');
        await expect.poll(() => ids(local)).toEqual(['riley', 'alex', 'sam']);
        await page.keyboard.press('Space');
        await expect.poll(() => ids(local)).toEqual(['sam', 'alex', 'riley']);
        await page.keyboard.press('Enter');
        await expect.poll(() => ids(local)).toEqual(['alex', 'sam', 'riley']);
        await local.screenshot({ path: test.info().outputPath('sorting-opt-in.png') });

        const remote = page.getByRole('table', {
          name: english ? 'Remote members' : '远程成员',
          exact: true,
        });
        const example = page.locator('.leaf-component-example').filter({ has: remote });
        const next = example.getByRole('button', {
          name: english ? 'Next page' : '下一页',
          exact: true,
        });
        await expect(next).toBeEnabled();
        await next.click();
        await expect.poll(() => ids(remote)).toEqual(['6', '7', '8', '9', '10']);
        const remoteProjects = remote.getByRole('columnheader', {
          name: english ? /Projects/ : /项目数/,
        });
        await expect(remoteProjects.getByRole('button')).toBeEnabled();
        await remoteProjects.getByRole('button').click();
        await expect.poll(() => ids(remote)).toEqual(['26', '25', '24', '23', '22']);
        await expect(remoteProjects).toHaveAttribute('aria-sort', 'descending');
        await expect(remoteProjects.getByRole('button')).toBeEnabled();
        await next.click();
        await expect.poll(() => ids(remote)).toEqual(['21', '20', '19', '18', '17']);
        const clear = example.getByRole('button', {
          name: english ? 'Clear sorting' : '清除排序',
          exact: true,
        });
        await expect(clear).toBeEnabled();
        await clear.click();
        await expect.poll(() => ids(remote)).toEqual(['1', '2', '3', '4', '5']);
        await expect(remote.locator('th[aria-sort]')).toHaveCount(0);
        const source = await example.locator('.leaf-component-example__source code').textContent();
        for (const contract of [
          'enableSorting: true',
          'manualSorting: true',
          'state: { pagination, sorting }',
          'setSorting(updater)',
          'pageIndex: 0',
        ])
          expect(source).toContain(contract);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await remote.screenshot({ path: test.info().outputPath('sorting-owned.png') });
      });

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
