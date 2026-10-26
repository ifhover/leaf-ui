import { expect, test } from '@playwright/test';
import { leafDensityVariables } from '../../src/density';
import { leafThemeVariables } from '../../src/theme';

for (const english of [false, true]) {
  const prefix = english ? '/en' : '';
  const contentName = english ? 'Content section example' : '内容分区示例';
  const dataName = english ? 'Data region example' : '数据区域示例';

  for (const width of [1280, 390]) {
    for (const dark of [false, true]) {
      test(`Design guidance: ${english ? 'en' : 'zh'} ${width} ${dark ? 'dark' : 'light'}`, async ({
        page,
      }, testInfo) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: dark ? 'dark' : 'light' });
        await page.addInitScript(() => {
          localStorage.setItem('rspress-visited', '1');
          localStorage.setItem('leaf-ui-docs-primary-color', '#1659b7');
        });
        await page.goto(`${prefix}/guide/design-standards.html`);
        await expect(
          page.getByRole('heading', {
            level: 1,
            name: english ? 'Interface design and composition' : '界面设计与组合',
            exact: true,
          }),
        ).toBeVisible();
        if (
          (await page.locator('html').evaluate((node) => node.classList.contains('dark'))) !== dark
        )
          await page
            .getByRole('button', {
              name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
            })
            .first()
            .click();

        const content = page.getByRole('region', { name: contentName, exact: true });
        const data = page.getByRole('region', { name: dataName, exact: true });
        await content.getByRole('button', { name: english ? 'Save changes' : '保存更改' }).click();
        await expect(content.getByRole('status')).toHaveText(english ? 'Saved' : '已保存');
        await data.getByRole('textbox').fill('Alex');
        await expect(data.getByRole('row')).toHaveCount(2);
        await expect(data.getByRole('status')).toHaveText(english ? '1 member' : '1 位成员');
        await data.getByRole('textbox').fill('');
        await expect(data.getByRole('row')).toHaveCount(4);

        for (const region of [content, data]) {
          const preview = region.locator('.leaf-component-example__preview');
          const bounds = await preview.evaluate((node) => {
            const outer = node.getBoundingClientRect();
            const inner = node.querySelector('.leaf-typography')?.getBoundingClientRect();
            return {
              left: outer.left,
              right: outer.right,
              innerLeft: inner?.left,
              innerRight: inner?.right,
            };
          });
          expect(bounds.innerLeft).toBeGreaterThanOrEqual(bounds.left);
          expect(bounds.innerRight).toBeLessThanOrEqual(bounds.right);
          await preview.screenshot({
            path: testInfo.outputPath(`${region === content ? 'content' : 'data'}.png`),
          });
        }
        const expand = content.getByRole('button', { name: english ? 'Expand code' : '展开代码' });
        await expand.click();
        await expect(
          content.getByRole('button', { name: english ? 'Collapse code' : '收起代码' }),
        ).toHaveAttribute('aria-expanded', 'true');
        await content
          .getByRole('button', { name: english ? 'Copy code' : '复制代码', exact: true })
          .click();
        const displayed = await content
          .locator('.leaf-component-example__source code')
          .textContent();
        // The Windows clipboard converts LF to CRLF; code content must otherwise remain identical.
        await expect
          .poll(async () =>
            (await page.evaluate(() => navigator.clipboard.readText())).replaceAll('\r\n', '\n'),
          )
          .toBe(displayed?.replaceAll('\r\n', '\n'));
        const copied = await page.evaluate(() => navigator.clipboard.readText());
        expect(copied).toContain('variant="layered"');
        expect(copied).toContain('gap="lg"');
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        expect(
          await page
            .locator(`[id="${english ? 'visual-design-and-interaction' : '视觉与交互'}"]`)
            .count(),
        ).toBe(1);
        expect(errors).toEqual([]);
      });
    }
  }

  test(`Design guidance: ${english ? 'en' : 'zh'} compositions consume regional user tokens`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
    await page.goto(`${prefix}/guide/design-standards.html`);
    // Use the same JS variable output as ConfigProvider, testing consumers, not a second color engine.
    const variables = {
      ...leafDensityVariables('compact'),
      ...leafThemeVariables({
        primaryColor: '#f3c96b',
        fontSize: 16,
        spacing: 10,
        tokens: {
          surfaceColor: '#fff6e8',
          mutedSurfaceColor: '#e4dac8',
          onPrimaryColor: '#222222',
          surfaceShadow: 'none',
        },
      }),
    };
    const previews = page.locator('.leaf-component-example__preview .leaf-typography');
    await expect(previews).toHaveCount(2);
    await previews.evaluateAll((nodes, values) => {
      for (const node of nodes) {
        node.setAttribute('data-leaf-scope', '');
        for (const [key, value] of Object.entries(values))
          if (value !== undefined) (node as HTMLElement).style.setProperty(key, String(value));
      }
    }, variables);
    const content = page.getByRole('region', { name: contentName, exact: true });
    const data = page.getByRole('region', { name: dataName, exact: true });
    await expect(content.locator('.leaf-card--layered')).toHaveCSS(
      'background-color',
      'rgb(228, 218, 200)',
    );
    await expect(content.locator('.leaf-card__panel')).toHaveCSS(
      'background-color',
      'rgb(255, 246, 232)',
    );
    await expect(content.locator('.leaf-typography')).toHaveCSS('font-size', '16px');
    await expect(content.locator('.leaf-typography > .leaf-flex')).toHaveCSS('gap', '30px');
    await expect(content.locator('.leaf-button--solid')).toHaveCSS(
      'background-color',
      'rgb(243, 201, 107)',
    );
    await expect(content.locator('.leaf-button--solid')).toHaveCSS('color', 'rgb(34, 34, 34)');
    await expect(content.locator('.leaf-button--solid')).toHaveCSS('min-height', '30px');
    expect(
      await content
        .locator('.leaf-card__panel')
        .evaluate((node) => getComputedStyle(node, '::before').boxShadow),
    ).toBe('none');
    await expect(data.locator('.leaf-table')).toHaveCSS('background-color', 'rgb(228, 218, 200)');
    await expect(data.locator('tbody td').first()).toHaveCSS(
      'background-color',
      'rgb(255, 246, 232)',
    );
    await content
      .locator('.leaf-component-example__preview')
      .screenshot({ path: testInfo.outputPath('custom-tokens.png') });
  });
}
