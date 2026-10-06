import { expect, test } from '@playwright/test';

for (const rtl of [false, true]) {
  test(`marks stay clickable and thumbs accept pointer drags: ${rtl ? 'RTL' : 'LTR'}`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/?fixture=sliders${rtl ? '&rtl=1' : ''}`);
    const single = page.getByRole('region', { name: 'Single', exact: true });
    const input = single.getByRole('slider');
    await single.getByRole('button', { name: 'High', exact: true }).click();
    await expect(input).toHaveValue('100');
    await single.getByRole('button', { name: 'Low', exact: true }).click();
    await expect(input).toHaveValue('0');
    await single.getByRole('button', { name: 'Mid', exact: true }).click();
    await expect(input).toHaveValue('50');
    const bounds = await input.boundingBox();
    if (!bounds) throw new Error('Missing slider bounds');
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    expect(
      await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, { x, y }),
    ).toBe('INPUT');
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + (rtl ? -60 : 60), y, { steps: 6 });
    await page.mouse.up();
    expect(Number(await input.inputValue())).toBeGreaterThan(50);

    const range = page.getByRole('region', { name: 'Range', exact: true });
    const start = range.getByRole('slider', { name: 'Range value Start', exact: true });
    const end = range.getByRole('slider', { name: 'Range value End', exact: true });
    const rangeBounds = await start.boundingBox();
    if (!rangeBounds) throw new Error('Missing range bounds');
    const rangeX = rangeBounds.x + 8 + (rangeBounds.width - 16) * (rtl ? 0.8 : 0.2);
    const rangeY = rangeBounds.y + rangeBounds.height / 2;
    await page.mouse.move(rangeX, rangeY);
    await page.mouse.down();
    await page.mouse.move(rangeX + (rtl ? -50 : 50), rangeY, { steps: 6 });
    await page.mouse.up();
    expect(Number(await start.inputValue())).toBeGreaterThan(20);
    await expect(end).toHaveValue('80');
    await range.getByRole('button', { name: 'Low', exact: true }).click();
    await expect(start).toHaveValue('0');
    await range.getByRole('button', { name: 'High', exact: true }).click();
    await expect(end).toHaveValue('100');

    const vertical = page.getByRole('region', { name: 'Vertical', exact: true });
    const upright = vertical.getByRole('slider');
    await vertical.getByRole('button', { name: 'High', exact: true }).click();
    await expect(upright).toHaveValue('100');
    await vertical.getByRole('button', { name: 'Mid', exact: true }).click();
    await expect(upright).toHaveValue('50');
    const verticalBounds = await upright.boundingBox();
    if (!verticalBounds) throw new Error('Missing vertical slider bounds');
    const verticalX = verticalBounds.x + verticalBounds.width / 2;
    const verticalY = verticalBounds.y + verticalBounds.height / 2;
    await page.mouse.move(verticalX, verticalY);
    await page.mouse.down();
    await page.mouse.move(verticalX, verticalY - 40, { steps: 6 });
    await page.mouse.up();
    expect(Number(await upright.inputValue())).toBeGreaterThan(50);
    await upright.press('Home');
    await expect(upright).toHaveValue('0');
    await upright.press('ArrowUp');
    await expect(upright).toHaveValue('1');
    await testInfo.attach('marked-sliders', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
}
