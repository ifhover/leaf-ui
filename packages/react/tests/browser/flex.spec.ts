import { expect, test } from '@playwright/test';

for (const rtl of [false, true]) {
  test(`flex spacing, wrapping, alignment and native keyboard order (${rtl ? 'RTL' : 'LTR'})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=flex${rtl ? '&rtl=1' : ''}`);
    const spacing = page.getByLabel('Themed spacing');
    await expect(spacing).toHaveCSS('gap', '12px');
    const first = await spacing.getByRole('button', { name: 'First', exact: true }).boundingBox();
    const second = await spacing.getByRole('button', { name: 'Second', exact: true }).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    if (first && second)
      expect(
        rtl ? first.x - second.x - second.width : second.x - first.x - first.width,
      ).toBeCloseTo(12, 0);

    const wrapping = page.getByLabel('Wrapping');
    const wrappedFirst = await wrapping.getByRole('button', { name: 'Wrap first' }).boundingBox();
    const wrappedSecond = await wrapping.getByRole('button', { name: 'Wrap second' }).boundingBox();
    expect(wrappedFirst).not.toBeNull();
    expect(wrappedSecond).not.toBeNull();
    if (wrappedFirst && wrappedSecond)
      expect(wrappedSecond.y - wrappedFirst.y - wrappedFirst.height).toBeCloseTo(12, 0);

    const alignment = page.getByLabel('Alignment');
    const container = await alignment.boundingBox();
    const start = await alignment.getByRole('button', { name: 'Start', exact: true }).boundingBox();
    const end = await alignment.getByRole('button', { name: 'End', exact: true }).boundingBox();
    expect(container).not.toBeNull();
    if (container && start && end) {
      expect(rtl ? start.x + start.width : end.x + end.width).toBeCloseTo(
        container.x + container.width,
        0,
      );
      expect(rtl ? end.x : start.x).toBeCloseTo(container.x, 0);
    }
    await alignment.getByRole('button', { name: 'Start', exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(alignment.getByRole('button', { name: 'End', exact: true })).toBeFocused();
    await expect(page.getByLabel('Inline')).toHaveCSS('display', 'inline-flex');
    const reversed = page.getByLabel('Reversed start');
    const reversedBox = await reversed.boundingBox();
    const reversedFirst = reversed.getByRole('button', { name: 'Reversed first', exact: true });
    const reversedFirstBox = await reversedFirst.boundingBox();
    expect(reversedBox).not.toBeNull();
    expect(reversedFirstBox).not.toBeNull();
    if (reversedBox && reversedFirstBox) {
      expect(rtl ? reversedFirstBox.x : reversedFirstBox.x + reversedFirstBox.width).toBeCloseTo(
        rtl ? reversedBox.x : reversedBox.x + reversedBox.width,
        0,
      );
      expect(reversedFirstBox.y + reversedFirstBox.height).toBeCloseTo(
        reversedBox.y + reversedBox.height,
        0,
      );
    }
    await reversedFirst.focus();
    await page.keyboard.press('Tab');
    await expect(
      reversed.getByRole('button', { name: 'Reversed second', exact: true }),
    ).toBeFocused();
    await expect(page.locator('.leaf-float-group')).toHaveCSS('position', 'static');
    await page.getByRole('button', { name: 'Quick actions', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  });
}
