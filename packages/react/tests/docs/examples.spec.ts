import { expect, test } from '@playwright/test';

for (const language of ['zh', 'en']) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark']) {
      test(`Badge preview stays intrinsic: ${language} ${width} ${appearance}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance as 'light' | 'dark' });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        await page.goto(`${language === 'en' ? '/en' : ''}/components/badge.html`);
        const root = page.locator('html');
        const dark = (await root.getAttribute('class'))?.includes('dark');
        if (Boolean(dark) !== (appearance === 'dark')) {
          const toggle = language === 'en' ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/;
          await page.getByRole('button', { name: toggle }).first().click();
        }
        await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
        const previews = page.locator('.leaf-component-example__preview');
        for (const index of [0, 2]) {
          const preview = previews.nth(index);
          const badge = preview.locator('.leaf-badge--attached');
          await expect(badge).toBeVisible();
          await expect
            .poll(async () =>
              badge.evaluate((node) => {
                const target = node.querySelector('button');
                if (!target) throw new Error('Missing badge target');
                return Math.abs(
                  node.getBoundingClientRect().width - target.getBoundingClientRect().width,
                );
              }),
            )
            .toBeLessThan(1);
          const geometry = await badge.evaluate((node) => {
            const target = node.querySelector('button')?.getBoundingClientRect();
            const indicator = node.querySelector('.leaf-badge__indicator')?.getBoundingClientRect();
            if (!target || !indicator) throw new Error('Missing attached badge');
            return {
              right: Math.abs(indicator.right - target.right),
              top: Math.abs(indicator.top - target.top),
            };
          });
          expect(geometry.right).toBeLessThan(24);
          expect(geometry.top).toBeLessThan(16);
          await preview.screenshot({ path: test.info().outputPath(`badge-${index}.png`) });
        }
        const insidePreview = previews.nth(3);
        const insideBadges = insidePreview.locator('.leaf-badge[data-placement="inside"]');
        await expect(insideBadges).toHaveCount(1);
        await expect(insideBadges.getByRole('button')).toHaveClass(/leaf-button--outline/);
        await expect(insideBadges.locator('.lucide-bell')).toHaveCount(1);
        for (const badge of await insideBadges.all()) {
          await expect(badge.locator('.leaf-badge__indicator')).toHaveCSS(
            'box-shadow',
            'rgb(255, 255, 255) 0px 0px 0px 2px',
          );
          const position = await badge.evaluate((node) => {
            const button = node.querySelector('button')?.getBoundingClientRect();
            const indicator = node.querySelector('.leaf-badge__indicator')?.getBoundingClientRect();
            if (!button || !indicator) throw new Error('Missing inside badge');
            return { top: indicator.top - button.top, end: button.right - indicator.right };
          });
          expect(position.top).toBeCloseTo(6, 1);
          expect(position.end).toBeCloseTo(6, 1);
        }
        await insidePreview.screenshot({ path: test.info().outputPath('badge-inside.png') });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        const example = page.locator('.leaf-component-example').nth(2);
        const copy = language === 'en' ? 'Copy code' : '复制代码';
        await example.getByRole('button', { name: copy, exact: true }).click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('<Badge dot');
        await page
          .locator('.leaf-component-example')
          .nth(3)
          .getByRole('button', { name: copy, exact: true })
          .click();
        await expect
          .poll(() => page.evaluate(() => navigator.clipboard.readText()))
          .toContain('placement="inside"');
      });
    }
  }
}

test('real documentation source expands, collapses and copies the displayed example', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
  await page.goto('/en/components/tabs.html');
  const example = page.locator('.leaf-component-example[data-collapsible="true"]').first();
  await example.getByRole('button', { name: 'Expand code', exact: true }).click();
  await expect(example).toHaveAttribute('data-expanded', 'true');
  await example.getByRole('button', { name: 'Copy code', exact: true }).click();
  const shown = await example.locator('.leaf-component-example__source code').textContent();
  // Windows clipboard uses CRLF; compare the same source with platform-neutral newlines.
  await expect
    .poll(async () =>
      (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n?/gu, '\n'),
    )
    .toBe(shown?.replace(/\r\n?/gu, '\n'));
  await example.getByRole('button', { name: 'Collapse code', exact: true }).click();
  await expect(example).toHaveAttribute('data-expanded', 'false');
});

for (const english of [false, true]) {
  test(`color documentation renders selectable shades and live configuration: ${english ? 'en' : 'zh'}`, async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
    await page.goto(`${english ? '/en' : ''}/guide/colors.html`);
    await expect(page.locator('.leaf-color-scale')).toHaveCount(6);
    await expect(page.locator('.leaf-color-scale__swatch')).toHaveCount(44);
    const primary = page.locator('.leaf-color-scale[data-family="primary"]');
    const swatch = primary.getByRole('button').nth(1);
    await swatch.focus();
    await swatch.press('Enter');
    await expect(swatch).toHaveAttribute('aria-pressed', 'true');
    await expect(primary.locator('.leaf-color-scale__selection')).toContainText(
      '--leaf-color-primary-light-7',
    );
    const preview = page.locator('.leaf-component-example__preview').first();
    for (const name of english
      ? ['Primary', 'Success', 'Danger', 'Warning', 'Info', 'Neutral', 'Muted surface']
      : ['主题色', '成功色', '危险色', '警告色', '信息色', '中性色', '共享底板']) {
      await expect(preview.getByRole('button', { name, exact: true })).toBeVisible();
    }
    await preview
      .getByRole('button', { name: english ? 'Primary' : '主题色', exact: true })
      .click();
    const input = page.locator('.leaf-color-picker__input:visible');
    await input.fill('#ffffff');
    await input.press('Enter');
    await input.press('Escape');
    const save = preview.getByRole('button', { name: english ? 'Save' : '保存', exact: true });
    await expect(save).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(save).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    const outlinedTags = preview.locator('.leaf-tag--outline');
    await expect(outlinedTags).toHaveCount(4);
    for (const label of [save]) {
      await expect(label).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
    await preview
      .getByRole('button', { name: english ? 'Use black text' : '改为黑字', exact: true })
      .click();
    for (const label of [save]) {
      await expect(label).toHaveCSS('color', 'rgb(0, 0, 0)');
    }
    await expect(preview.locator('.leaf-card--layered')).toHaveCSS(
      'background-color',
      'rgb(244, 243, 239)',
    );
    await expect(preview.locator('.leaf-tabs--segmented .leaf-tabs__list')).toHaveCSS(
      'background-color',
      'rgb(244, 243, 239)',
    );
  });
}
