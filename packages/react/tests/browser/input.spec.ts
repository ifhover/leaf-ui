import { expect, test } from '@playwright/test';

test.use({ hasTouch: false });

for (const rtl of [false, true]) {
  test(`Input shows clear before count on hover in ${rtl ? 'RTL' : 'LTR'}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 600 });
    await page.goto(`/?fixture=input-count${rtl ? '&rtl=1' : ''}`);
    const input = page.getByRole('textbox', { name: 'Counted input' });
    const count = page.locator('.leaf-input__count');
    const clear = page.locator('.leaf-input__clear');
    await expect(count).toHaveText('4 / 10');
    const canHover = await page.evaluate(() => matchMedia('(hover: hover)').matches);
    await expect(clear).toHaveCSS('opacity', canHover ? '0' : '1');
    const countBox = await count.boundingBox();
    const clearBox = await clear.boundingBox();
    expect(countBox).not.toBeNull();
    expect(clearBox).not.toBeNull();
    if (!countBox || !clearBox) throw new Error('Missing input actions');
    if (rtl) expect(clearBox.x).toBeGreaterThanOrEqual(countBox.x + countBox.width);
    else expect(clearBox.x + clearBox.width).toBeLessThanOrEqual(countBox.x);
    await input.hover();
    await expect(clear).toHaveCSS('opacity', '1');
    expect(await count.boundingBox()).toEqual(countBox);
    await page.mouse.move(0, 0);
    await expect(clear).toHaveCSS('opacity', canHover ? '0' : '1');
    await input.focus();
    await page.keyboard.press('Tab');
    await expect(clear).toBeFocused();
    await expect(clear).toHaveCSS('opacity', '1');
    await clear.click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect(count).toHaveText('0 / 10');
    await expect(clear).toHaveCount(0);
  });
}
