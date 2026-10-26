import { expect, test } from '@playwright/test';

for (const english of [false, true]) {
  for (const width of [1280, 390]) {
    for (const dark of [false, true]) {
      test(`Scrollbar sizes: ${english ? 'en' : 'zh'} ${width} ${dark ? 'dark' : 'light'}`, async ({
        page,
      }, testInfo) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: dark ? 'dark' : 'light' });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${english ? '/en' : ''}/components/scrollbar.html`);
        const root = page.locator('html');
        if (Boolean((await root.getAttribute('class'))?.includes('dark')) !== dark) {
          await page
            .getByRole('button', {
              name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
            })
            .first()
            .click();
        }
        await expect(root).toHaveClass(dark ? /dark/ : /^(?!.*\bdark\b)/);
        const example = page.getByRole('region', {
          name: english ? 'Track sizes example' : '滚动条尺寸示例',
          exact: true,
        });
        for (const size of ['md', 'sm']) {
          const viewport = example.getByRole('region', {
            name: english ? `Options, ${size}` : `选项，${size}`,
            exact: true,
          });
          const track = viewport.locator('..').locator('.leaf-scrollbar__bar--vertical');
          await expect(track).toHaveCSS('width', size === 'sm' ? '6px' : '8px');
          await expect(viewport).toHaveCSS('height', '160px');
          await track.getByRole('scrollbar').press('End');
          await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
        }
        await example.locator('.leaf-component-example__preview').screenshot({
          path: testInfo.outputPath('scrollbar-sizes.png'),
        });
        const expand = example.getByRole('button', {
          name: english ? 'Expand code' : '展开代码',
          exact: true,
        });
        await expand.click();
        await expect(example).toHaveAttribute('data-expanded', 'true');
        await example.getByRole('button', { name: english ? 'Copy code' : '复制代码' }).click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('size={size}');
        await example
          .getByRole('button', { name: english ? 'Collapse code' : '收起代码', exact: true })
          .click();
        await expect(example).toHaveAttribute('data-expanded', 'false');
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        expect(errors).toEqual([]);
      });
    }
  }
}
