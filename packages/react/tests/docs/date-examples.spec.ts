import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

const profiles = [
  { width: 1280, appearance: 'light' },
  { width: 375, appearance: 'dark' },
] as const;

const pickerSections =
  '.leaf-calendar, .leaf-calendar__cells, .leaf-time-picker__column-wrap, ' +
  '.leaf-picker-footer, .leaf-range-panel__endpoints, ' +
  '.leaf-time-range-picker__panels > fieldset';

async function openExamples(
  page: Page,
  component: 'calendar' | 'date-picker' | 'date-range-picker',
  english: boolean,
  { width, appearance }: (typeof profiles)[number],
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.clock.setFixedTime(new Date(2026, 9, 25, 12));
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: appearance });
  await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
  await page.goto(`${english ? '/en' : ''}/components/${component}.html`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const root = page.locator('html');
  if (Boolean((await root.getAttribute('class'))?.includes('dark')) !== (appearance === 'dark')) {
    await page
      .getByRole('button', {
        name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
      })
      .first()
      .click();
  }
  await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return {
    errors,
    preview: (zh: string, en: string) =>
      page
        .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
        .locator('.leaf-component-example__preview'),
  };
}

async function linkedPicker(page: Page, input: Locator) {
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  const id = await input.getAttribute('aria-controls');
  if (!id) throw new Error('Open date control has no associated panel');
  const dialog = page.locator(`[id=${JSON.stringify(id)}]`);
  await expect(dialog).toHaveAttribute('role', 'dialog');
  await expect(dialog).toBeVisible();
  // aria-controls identifies the scroll viewport; positioning belongs to its outer surface.
  const panel = page.locator('.leaf-picker-panel[data-state="open"]').filter({ has: dialog });
  await expect(panel).toHaveCount(1);
  await expect(panel).toHaveAttribute('data-positioned', 'true');
  await settleAnimations(panel);
  return panel;
}

async function expectPickerFits(panel: Locator) {
  await settleAnimations(panel);
  const dialog = panel.getByRole('dialog');
  const originalScrollTop = await dialog.evaluate((node) => node.scrollTop);
  await expect
    .poll(() =>
      panel.evaluate((node, sectionSelector) => {
        const issues: string[] = [];
        const bounds = node.getBoundingClientRect();
        const contained = (
          inner: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
          outer: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
        ) =>
          inner.left >= outer.left - 1 &&
          inner.right <= outer.right + 1 &&
          inner.top >= outer.top - 1 &&
          inner.bottom <= outer.bottom + 1;
        if (
          bounds.left < -1 ||
          bounds.right > innerWidth + 1 ||
          bounds.top < -1 ||
          bounds.bottom > innerHeight + 1
        ) {
          issues.push('panel exceeds viewport');
        }
        const visible = (element: Element) =>
          element.getClientRects().length > 0 &&
          !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
          getComputedStyle(element).visibility !== 'hidden';
        const dialog = node.querySelector<HTMLElement>('[role="dialog"]');
        if (!dialog) throw new Error('Positioned date picker has no dialog viewport');
        if (!contained(dialog.getBoundingClientRect(), bounds)) {
          issues.push('dialog viewport exceeds panel');
        }
        if (dialog.scrollWidth > dialog.clientWidth + 1) {
          issues.push('dialog viewport overflows horizontally');
        }
        const viewport = dialog.getBoundingClientRect();
        const contentTop = viewport.top + dialog.clientTop - dialog.scrollTop;
        const scrollBounds = {
          left: viewport.left + dialog.clientLeft,
          right: viewport.left + dialog.clientLeft + dialog.clientWidth,
          top: contentTop,
          bottom: contentTop + dialog.scrollHeight,
        };
        const parts = node.querySelectorAll<HTMLElement>(sectionSelector);
        for (const part of parts) {
          if (!visible(part)) continue;
          if (!contained(part.getBoundingClientRect(), scrollBounds)) {
            issues.push(`panel section exceeds scrollable content: ${part.className}`);
          }
          if (part.scrollWidth > part.clientWidth + 1) {
            issues.push(`panel section overflows horizontally: ${part.className}`);
          }
        }
        for (const label of node.querySelectorAll<HTMLElement>(
          '.leaf-time-picker__column-label, .leaf-calendar__headings, ' +
            '.leaf-range-panel__endpoint-label, legend, .leaf-picker-footer button',
        )) {
          if (!visible(label)) continue;
          const text = document.createRange();
          text.selectNodeContents(label);
          for (const rect of text.getClientRects()) {
            if (rect.width > 0 && !contained(rect, label.getBoundingClientRect())) {
              issues.push(`clipped panel label: ${label.textContent}`);
              break;
            }
          }
        }
        // Time options intentionally scroll vertically; their labels must still fit the column.
        for (const list of node.querySelectorAll<HTMLElement>('[role="listbox"]')) {
          const column = list.getBoundingClientRect();
          if (!contained(column, scrollBounds)) issues.push('time column exceeds scrollable panel');
          if (list.scrollWidth > list.clientWidth + 1) issues.push('time column overflows');
          for (const option of list.querySelectorAll<HTMLElement>('[role="option"]')) {
            const row = option.getBoundingClientRect();
            if (row.bottom <= column.top || row.top >= column.bottom) continue;
            const label = option.querySelector('span');
            if (!label) continue;
            const text = document.createRange();
            text.selectNodeContents(label);
            for (const rect of text.getClientRects()) {
              if (rect.left < column.left - 1 || rect.right > column.right + 1) {
                issues.push(`clipped time option: ${label.textContent}`);
              }
            }
          }
        }
        return issues;
      }, pickerSections),
    )
    .toEqual([]);

  // Stacked narrow-screen panels may scroll; each section must still be fully reachable.
  for (const section of await panel.locator(pickerSections).all()) {
    await section.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        section.evaluate((node) => {
          const viewport = node.closest<HTMLElement>('[role="dialog"]');
          if (!viewport) throw new Error('Picker section has no scroll viewport');
          const inner = node.getBoundingClientRect();
          const outer = viewport.getBoundingClientRect();
          return (
            inner.left >= outer.left - 1 &&
            inner.right <= outer.right + 1 &&
            inner.top >= outer.top - 1 &&
            inner.bottom <= outer.bottom + 1
          );
        }),
      )
      .toBe(true);
  }
  await dialog.evaluate((node, top) => {
    node.scrollTop = top;
  }, originalScrollTop);
}

async function expectPreviewsFit(page: Page) {
  await expect
    .poll(() =>
      page.locator('.leaf-component-example__preview-content').evaluateAll((contents) => {
        const issues: string[] = [];
        for (const [index, content] of contents.entries()) {
          const preview = content.closest('.leaf-component-example__preview');
          if (!preview) throw new Error('Missing date example preview');
          const outer = preview.getBoundingClientRect();
          const bounds = content.getBoundingClientRect();
          if (
            bounds.left < outer.left - 1 ||
            bounds.right > outer.right + 1 ||
            content.scrollWidth > content.clientWidth + 1
          ) {
            issues.push(`preview ${index} content overflows`);
          }
          for (const control of content.querySelectorAll<HTMLElement>(
            '.leaf-date-picker, .leaf-calendar-view',
          )) {
            const rect = control.getBoundingClientRect();
            if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) {
              issues.push(`preview ${index} control exceeds its container`);
            }
          }
          for (const field of content.querySelectorAll('.leaf-form-field')) {
            const label = field.querySelector('.leaf-form-field__label')?.getBoundingClientRect();
            const control = field.querySelector('.leaf-date-picker')?.getBoundingClientRect();
            if (!label || !control) continue;
            if (Math.abs(label.left - control.left) > 1 || label.bottom > control.top) {
              issues.push(`preview ${index} field label is not stacked and left aligned`);
            }
          }
        }
        return issues;
      }),
    )
    .toEqual([]);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}

for (const english of [false, true]) {
  for (const profile of profiles) {
    const suffix = `${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`;
    const ok = english ? 'OK' : '确定';
    const reset = english ? 'Reset' : '重置';
    const submit = english ? 'Submit' : '提交';
    const clearDate = english ? 'Clear date' : '清除日期';
    const clearRange = english ? 'Clear range' : '清除区间';
    const hours = english ? 'Hours' : '小时';

    test(`Calendar examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'calendar', english, profile);
      const controlled = preview('受控日期与展示月份', 'Controlled selection and displayed month');
      const calendar = controlled.locator('.leaf-calendar-view');
      const selected = controlled.getByRole('status');
      await expect(selected).toHaveText(
        english ? 'Selected date: 2026-10-15' : '已选日期：2026-10-15',
      );
      await expect(
        calendar.locator('button[data-date="2026-10-15"]').locator('..'),
      ).toHaveAttribute('aria-selected', 'true');
      await calendar
        .getByRole('button', { name: english ? 'Next month' : '下个月', exact: true })
        .click();
      await expect(calendar.locator('button[data-date="2026-11-15"]')).toBeVisible();
      await expect(calendar.getByRole('gridcell', { selected: true })).toHaveCount(0);
      await expect(selected).toContainText('2026-10-15');
      await controlled
        .getByRole('button', {
          name: english ? 'View selected month' : '查看所选月份',
          exact: true,
        })
        .click();
      await expect(
        calendar.locator('button[data-date="2026-10-15"]').locator('..'),
      ).toHaveAttribute('aria-selected', 'true');
      await calendar.locator('button[data-date="2026-10-20"]').click();
      await expect(selected).toContainText('2026-10-20');
      await calendar.getByRole('button', { name: english ? 'Today' : '今天', exact: true }).click();
      await expect(selected).toContainText('2026-10-20');
      await expect(calendar.locator('button[data-date="2026-10-25"]')).toHaveAttribute(
        'aria-current',
        'date',
      );
      await settleAnimations(calendar);
      await controlled.screenshot({
        path: testInfo.outputPath('calendar-controlled-selection.png'),
      });

      const compact = preview('紧凑日历', 'Compact calendar');
      await expect(compact.locator('button[data-date="2026-10-10"]')).toBeDisabled();
      await expect(compact.locator('button[data-date="2026-10-11"]')).toBeDisabled();
      const weekday = compact.locator('button[data-date="2026-10-09"]');
      await expect(weekday).toBeEnabled();
      await weekday.click();
      await expect(weekday.locator('..')).toHaveAttribute('aria-selected', 'true');
      await compact.screenshot({
        path: testInfo.outputPath('calendar-compact-disabled-weekends.png'),
      });

      const months = preview('选择月份', 'Choose a month');
      await months.locator('button[data-date="2026-11"]').click();
      await expect(months.locator('button[data-date="2026-11"]')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(months.locator('button[data-date="2026-10"]')).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      await months.screenshot({ path: testInfo.outputPath('calendar-month-selection.png') });
      const schedule = preview('日程内容', 'Schedule content');
      await expect(
        schedule.getByText(english ? 'Release' : '版本发布', { exact: true }),
      ).toBeVisible();
      await expectPreviewsFit(page);
      expect(errors).toEqual([]);
    });

    test(`DatePicker examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'date-picker', english, profile);
      const controlled = preview('受控值与清除', 'Controlled value and clearing');
      const value = controlled.getByRole('combobox');
      await expect(value).toHaveValue('2026-10-15');
      await controlled.getByRole('button', { name: clearDate, exact: true }).click();
      await expect(value).toHaveValue('');
      await expect(controlled.getByRole('status')).toHaveText(
        english ? 'Callback text: Empty string' : '回调文本：空字符串',
      );
      await controlled.getByRole('button', { name: reset, exact: true }).click();
      await expect(value).toHaveValue('2026-10-15');
      await expect(controlled.getByRole('status')).toContainText('2026-10-15');

      const limited = preview('限制可选日期', 'Restrict selectable dates').getByRole('combobox');
      await limited.click();
      let panel = await linkedPicker(page, limited);
      await expect(panel.getByRole('button', { name: '2026-10-17', exact: true })).toBeDisabled();
      await expect(panel.getByRole('button', { name: '2026-10-19', exact: true })).toBeEnabled();
      await limited.press('Escape');

      const datetime = preview('日期与时间', 'Date and time').getByRole('combobox');
      await expect(datetime).toHaveValue('2026-10-03 14:30');
      await datetime.click();
      panel = await linkedPicker(page, datetime);
      await expect(panel.locator('.leaf-calendar')).toHaveCount(1);
      await expect(panel.getByRole('listbox')).toHaveCount(2);
      await panel.getByRole('button', { name: '2026-10-16', exact: true }).click();
      await expect(datetime).toHaveValue('2026-10-16 14:30');
      await expect(datetime).toHaveAttribute('aria-expanded', 'true');
      await datetime.press('Escape');
      await expect(datetime).toHaveValue('2026-10-03 14:30');
      await datetime.click();
      panel = await linkedPicker(page, datetime);
      await panel.getByRole('button', { name: '2026-10-16', exact: true }).click();
      await panel
        .getByRole('listbox', { name: hours, exact: true })
        .getByRole('option', { name: '09', exact: true })
        .click();
      await expect(datetime).toHaveValue('2026-10-16 09:30');
      await expectPickerFits(panel);
      await panel.screenshot({ path: testInfo.outputPath('datepicker-confirm-draft.png') });
      await panel.getByRole('button', { name: ok, exact: true }).click();
      await expect(datetime).toHaveAttribute('aria-expanded', 'false');
      await expect(datetime).toHaveValue('2026-10-16 09:30');
      await datetime.click();
      panel = await linkedPicker(page, datetime);
      await expect(
        panel
          .getByRole('listbox', { name: hours, exact: true })
          .getByRole('option', { selected: true }),
      ).toHaveText('09');
      await datetime.press('Escape');

      const time = preview('仅选择时间', 'Time only').getByRole('combobox');
      await time.click();
      panel = await linkedPicker(page, time);
      await expect(panel.locator('.leaf-calendar')).toHaveCount(0);
      await expect(panel.getByRole('listbox')).toHaveCount(2);
      await panel
        .getByRole('listbox', { name: hours, exact: true })
        .getByRole('option', { name: '10', exact: true })
        .click();
      await expectPickerFits(panel);
      await panel.screenshot({ path: testInfo.outputPath('datepicker-time-only.png') });
      await panel.getByRole('button', { name: ok, exact: true }).click();
      await expect(time).toHaveValue('10:30');

      const formatting = preview('显示格式与表单提交', 'Display format and form submission');
      const formatted = formatting.getByRole('combobox');
      await expect(formatted).toHaveValue('15/10/2026');
      await formatted.click();
      panel = await linkedPicker(page, formatted);
      await expect(panel.locator('.leaf-calendar')).toHaveCount(1);
      await expect(panel.getByRole('listbox')).toHaveCount(0);
      await panel.getByRole('button', { name: '2026-10-19', exact: true }).click();
      await expect(formatted).toHaveValue('19/10/2026');
      await formatting.getByRole('button', { name: submit, exact: true }).click();
      await expect(formatting.getByRole('status')).toContainText('"2026-10-19"');
      await formatting.getByRole('button', { name: clearDate, exact: true }).click();
      await formatting.getByRole('button', { name: submit, exact: true }).click();
      await expect(formatting.getByRole('status')).toHaveText(
        english ? 'FormData: ""' : 'FormData：""',
      );
      await formatting.getByRole('button', { name: reset, exact: true }).click();
      await expect(formatted).toHaveValue('15/10/2026');
      await expect(formatting.getByRole('status')).toHaveText(
        english ? 'FormData: Not submitted' : 'FormData：尚未提交',
      );
      await formatting.screenshot({
        path: testInfo.outputPath('datepicker-native-form-reset.png'),
      });
      await expectPreviewsFit(page);
      expect(errors).toEqual([]);
    });

    test(`DateRangePicker examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'date-range-picker', english, profile);
      const controlled = preview('受控值与选择过程', 'Controlled value and selection progress');
      const input = controlled.getByRole('combobox');
      const committed = controlled.getByRole('status').nth(0);
      const draft = controlled.getByRole('status').nth(1);
      await expect(input).toHaveValue('2026-10-05 ~ 2026-10-09');
      await input.click();
      let panel = await linkedPicker(page, input);
      await panel.getByRole('button', { name: '2026-10-12', exact: true }).click();
      await expect(draft).toContainText('start: 2026-10-12 ~ -');
      await expect(committed).toContainText('2026-10-05 ~ 2026-10-09');
      await expect(input).toHaveAttribute('aria-expanded', 'true');
      await expectPickerFits(panel);
      await panel.screenshot({ path: testInfo.outputPath('daterange-uncommitted-start.png') });
      await panel.getByRole('button', { name: '2026-10-16', exact: true }).click();
      await expect(input).toHaveAttribute('aria-expanded', 'false');
      await expect(input).toHaveValue('2026-10-12 ~ 2026-10-16');
      await expect(committed).toContainText('2026-10-12 ~ 2026-10-16');
      await expect(draft).toContainText('end: 2026-10-12 ~ 2026-10-16');
      await controlled.getByRole('button', { name: clearRange, exact: true }).click();
      await expect(input).toHaveValue('');
      await expect(committed).toHaveText(english ? 'Committed: Empty' : '已提交：空值');
      await controlled.getByRole('button', { name: reset, exact: true }).click();
      await expect(input).toHaveValue('2026-10-05 ~ 2026-10-09');
      await expect(draft).toHaveText(
        english ? 'Latest panel edit: Not adjusted' : '最近面板操作：尚未调整',
      );

      const openEnd = preview('开放端点', 'Open endpoints');
      const openInput = openEnd.getByRole('combobox');
      await expect(openEnd.getByRole('status')).toHaveText(
        english ? 'Start: 2026-10-05; end: Empty' : '起点：2026-10-05；终点：空',
      );
      await openInput.click();
      panel = await linkedPicker(page, openInput);
      await expect(
        panel.getByRole('button', { name: english ? 'End' : '结束', exact: true }),
      ).toHaveAttribute('aria-pressed', 'true');
      await panel.getByRole('button', { name: '2026-10-19', exact: true }).click();
      await expect(openInput).toHaveValue('2026-10-05 ~ 2026-10-19');
      await openInput.click();
      panel = await linkedPicker(page, openInput);
      const clearEnd = panel.getByRole('button', {
        name: english ? 'Clear selection End' : '清除选择 结束',
        exact: true,
      });
      await expect(clearEnd).toBeEnabled();
      await expectPickerFits(panel);
      await panel.screenshot({ path: testInfo.outputPath('daterange-open-end-action.png') });
      await clearEnd.click();
      await expect(openInput).toHaveAttribute('aria-expanded', 'false');
      await expect(openEnd.getByRole('status')).toHaveText(
        english ? 'Start: 2026-10-05; end: Empty' : '起点：2026-10-05；终点：空',
      );

      const overnight = preview('跨越午夜', 'Across midnight').getByRole('combobox');
      await expect(overnight).toHaveValue('22:00 ~ 06:00');
      await overnight.click();
      panel = await linkedPicker(page, overnight);
      const end = panel.getByRole('group', { name: english ? 'End' : '结束', exact: true });
      await end
        .getByRole('listbox', { name: hours, exact: true })
        .getByRole('option', { name: '05', exact: true })
        .click();
      await expect(panel.getByRole('button', { name: ok, exact: true })).toBeEnabled();
      await expectPickerFits(panel);
      await panel.screenshot({ path: testInfo.outputPath('daterange-overnight-time.png') });
      await panel.getByRole('button', { name: ok, exact: true }).click();
      await expect(overnight).toHaveValue('22:00 ~ 05:00');

      const formatting = preview('显示格式与表单提交', 'Display format and form submission');
      const formatted = formatting.getByRole('combobox');
      await expect(formatted).toHaveValue('05/10/2026 ~ 09/10/2026');
      await formatting.getByRole('button', { name: submit, exact: true }).click();
      await expect(formatting.getByRole('status')).toContainText('"2026-10-05/2026-10-09"');
      await formatted.click();
      panel = await linkedPicker(page, formatted);
      await panel.getByRole('button', { name: '2026-10-12', exact: true }).click();
      await panel.getByRole('button', { name: '2026-10-16', exact: true }).click();
      await expect(formatted).toHaveValue('12/10/2026 ~ 16/10/2026');
      await formatting.getByRole('button', { name: submit, exact: true }).click();
      await expect(formatting.getByRole('status')).toContainText('"2026-10-12/2026-10-16"');
      await formatting.getByRole('button', { name: clearRange, exact: true }).click();
      await formatting.getByRole('button', { name: submit, exact: true }).click();
      await expect(formatting.getByRole('status')).toHaveText(
        english ? 'FormData: ""' : 'FormData：""',
      );
      await formatting.getByRole('button', { name: reset, exact: true }).click();
      await expect(formatted).toHaveValue('05/10/2026 ~ 09/10/2026');
      await expect(formatting.getByRole('status')).toHaveText(
        english ? 'FormData: Not submitted' : 'FormData：尚未提交',
      );
      await formatting.screenshot({ path: testInfo.outputPath('daterange-native-form-reset.png') });
      await expectPreviewsFit(page);
      expect(errors).toEqual([]);
    });
  }
}
