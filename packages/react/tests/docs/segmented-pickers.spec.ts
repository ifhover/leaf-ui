import { expect, test } from '@playwright/test';

for (const profile of [
  { english: false, width: 1280, dark: false },
  { english: true, width: 1280, dark: false },
  { english: false, width: 390, dark: true },
  { english: true, width: 390, dark: true },
]) {
  test(`unified picker docs: ${profile.english ? 'en' : 'zh'} ${profile.width}`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.clock.setFixedTime(new Date(2026, 9, 25, 12));
    await page.setViewportSize({ width: profile.width, height: 900 });
    await page.emulateMedia({ colorScheme: profile.dark ? 'dark' : 'light' });
    await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
    const prefix = profile.english ? '/en' : '';
    const ok = profile.english ? 'OK' : '确定';
    const hour = profile.english ? 'Hours' : '小时';
    const minute = profile.english ? 'Minutes' : '分钟';
    await page.goto(`${prefix}/components/date-picker.html`);
    const root = page.locator('html');
    if (Boolean((await root.getAttribute('class'))?.includes('dark')) !== profile.dark) {
      await page
        .getByRole('button', {
          name: profile.english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
        })
        .first()
        .click();
    }
    for (const label of profile.english
      ? ['Year', 'Quarter', 'Month', 'Week']
      : ['年份', '季度', '月份', '周']) {
      const input = page.getByRole('combobox', { name: label, exact: true });
      const metrics = await input.evaluate((node) => {
        const field = node.closest('.leaf-form-field');
        const label = field?.querySelector('.leaf-form-field__label')?.getBoundingClientRect();
        const control = node.closest('.leaf-date-picker')?.getBoundingClientRect();
        const content = node
          .closest('.leaf-component-example__preview-content')
          ?.getBoundingClientRect();
        if (!label || !control || !content) throw new Error('Missing stacked field');
        return {
          gap: control.top - label.bottom,
          offset: control.left - label.left,
          width: control.width,
          availableWidth: content.width,
        };
      });
      expect(metrics.gap).toBeGreaterThanOrEqual(5);
      expect(metrics.offset).toBeCloseTo(0, 0);
      expect(metrics.width).toBeCloseTo(metrics.availableWidth, 0);
      expect(metrics.width).toBeLessThanOrEqual(480);
    }
    await page
      .getByRole('combobox', { name: profile.english ? 'Year' : '年份', exact: true })
      .locator('xpath=ancestor::form')
      .screenshot({ path: testInfo.outputPath('stacked-picker-labels.png') });
    const date = page.getByRole('combobox', {
      name: profile.english ? 'Default date' : '默认日期',
      exact: true,
    });
    await date.click();
    const datePanel = page.locator('.leaf-picker-panel[data-state="open"]');
    await expect(datePanel).toHaveClass(/leaf-picker-panel--card/);
    await expect(datePanel).toHaveAttribute('data-positioned', 'true');
    await expect(datePanel).toHaveCSS('scale', '1');
    const calendarBox = await page
      .getByRole('dialog')
      .locator('.leaf-calendar__cells')
      .boundingBox();
    await date.press('Escape');
    const input = page.getByRole('combobox', {
      name: profile.english ? 'Appointment' : '预约时间',
      exact: true,
    });
    const inputWidth = (await input.locator('..').boundingBox())?.width;
    await input.click();
    let dialog = page.getByRole('dialog');
    const datetimePanel = page.locator('.leaf-picker-panel[data-state="open"]');
    await expect(datetimePanel).toHaveAttribute('data-positioned', 'true');
    await expect(datetimePanel).toHaveCSS('scale', '1');
    await expect(dialog.getByRole('listbox')).toHaveCount(2);
    await expect(dialog.locator('.leaf-calendar')).toHaveCount(1);
    const datetimeCalendarBox = await dialog.locator('.leaf-calendar__cells').boundingBox();
    expect(datetimeCalendarBox?.width).toBeCloseTo(calendarBox?.width ?? 0, 0);
    expect(datetimeCalendarBox?.height).toBeCloseTo(calendarBox?.height ?? 0, 0);
    for (const column of await dialog.getByRole('listbox').all()) {
      expect((await column.boundingBox())?.width).toBeGreaterThanOrEqual(
        profile.width > 620 ? 65 : 115,
      );
    }
    await expect(
      dialog.getByRole('button', { name: profile.english ? 'Now' : '当前时间', exact: true }),
    ).toHaveCount(0);
    await dialog.getByRole('button', { name: '2026-10-16', exact: true }).click();
    await dialog
      .getByRole('listbox', { name: hour, exact: true })
      .getByRole('option', { name: '09', exact: true })
      .click();
    await dialog
      .getByRole('listbox', { name: minute, exact: true })
      .getByRole('option', { name: '30', exact: true })
      .click();
    await dialog.screenshot({ path: testInfo.outputPath('date-time-columns.png') });
    await dialog.getByRole('button', { name: ok, exact: true }).click();
    await expect(input).toHaveValue('2026-10-16 09:30');
    expect((await input.locator('..').boundingBox())?.width).toBe(inputWidth);
    await input.click();
    await input.press('ControlOrMeta+A');
    await page.keyboard.insertText('20000');
    await expect(input).toHaveValue('2000-00-DD HH:mm');
    expect(
      await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]),
    ).toEqual([5, 7]);
    await page.keyboard.insertText('2291230');
    await expect(input).toHaveValue('2000-02-29 12:30');
    await expect(input).toBeFocused();
    await input.press('Escape');
    await expect(input).toHaveValue('2026-10-16 09:30');
    await input.click();
    await input.press('Home');
    await page.keyboard.insertText('20260230');
    await input.press('Enter');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await input.press('End');
    await input.press('Tab');
    await expect(input).toHaveValue('2026-10-16 09:30');
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    await input.focus();
    await input.press('ControlOrMeta+A');
    await input.press('Delete');
    await expect(input).toHaveValue('');
    await input.press('Escape');
    await expect(input).toHaveValue('');
    const time = page.getByRole('combobox', {
      name: profile.english ? 'Default time' : '默认时间',
      exact: true,
    });
    await time.click();
    dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('listbox')).toHaveCount(2);
    await dialog
      .getByRole('listbox', { name: hour, exact: true })
      .getByRole('option', { name: '10', exact: true })
      .click();
    await dialog
      .getByRole('listbox', { name: minute, exact: true })
      .getByRole('option', { name: '15', exact: true })
      .click();
    await dialog.getByRole('button', { name: ok, exact: true }).click();
    await expect(time).toHaveValue('10:15');
    const twelveHours = page.getByRole('combobox', {
      name: profile.english ? 'Include seconds' : '精确到秒',
      exact: true,
    });
    await twelveHours.click();
    dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('listbox')).toHaveCount(4);
    const period = dialog.getByRole('listbox', {
      name: profile.english ? 'Period' : '时段',
      exact: true,
    });
    for (const option of await period.getByRole('option').all()) {
      const label = option.locator('span');
      await expect(label).toHaveCSS('white-space', 'nowrap');
      expect(
        await label.evaluate((node) => {
          const range = document.createRange();
          range.selectNodeContents(node);
          return range.getClientRects().length;
        }),
      ).toBe(1);
      expect(
        await option.evaluate((node) => node.scrollWidth - node.clientWidth),
      ).toBeLessThanOrEqual(1);
    }
    await dialog.screenshot({ path: testInfo.outputPath('twelve-hour-seconds.png') });
    await twelveHours.press('Escape');
    await page.goto(`${prefix}/components/date-range-picker.html`);
    const range = page.getByRole('combobox', {
      name: profile.english ? 'Booking window' : '预约时段',
      exact: true,
    });
    const rangeWidth = (await range.locator('..').boundingBox())?.width;
    await range.click();
    dialog = page.getByRole('dialog');
    await expect(dialog.locator('.leaf-calendar')).toHaveCount(1);
    await expect(dialog.getByRole('listbox')).toHaveCount(2);
    await dialog.getByRole('button', { name: '2026-10-26', exact: true }).click();
    await dialog
      .getByRole('button', { name: profile.english ? 'Next' : '下一步', exact: true })
      .click();
    await expect(
      dialog.getByRole('button', { name: profile.english ? 'End' : '结束', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await dialog.getByRole('button', { name: '2026-10-31', exact: true }).click();
    await dialog
      .getByRole('listbox', { name: minute, exact: true })
      .getByRole('option', { name: '30', exact: true })
      .click();
    await dialog.screenshot({ path: testInfo.outputPath('datetime-range-end.png') });
    await dialog.getByRole('button', { name: ok, exact: true }).click();
    await expect(range).toHaveValue('2026-10-26 09:00 ~ 2026-10-31 18:30');
    expect((await range.locator('..').boundingBox())?.width).toBe(rangeWidth);
    await range.click();
    await range.press('Home');
    await page.keyboard.insertText('20260230');
    await range.press('Enter');
    await expect(range).toHaveAttribute('aria-invalid', 'true');
    await range.press('End');
    await range.press('Tab');
    await expect(range).toHaveValue('2026-10-26 09:00 ~ 2026-10-31 18:30');
    await expect(range).not.toHaveAttribute('aria-invalid', 'true');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}
