import { expect, test } from '@playwright/test';
import axe from 'axe-core';

for (const flags of ['', '&seconds', '&12h', '&seconds&12h']) {
  for (const variant of ['', '&plain']) {
    test(`datetime calendars match date-only geometry with compact time columns ${flags || 'minutes'} ${variant || 'card'}`, async ({
      page,
    }, testInfo) => {
      await page.goto(`/?fixture=picker-surfaces${flags}${variant}`);
      const date = page.getByRole('combobox', { name: 'Card date', exact: true });
      await date.click();
      const datePanel = page.locator('.leaf-picker-panel[data-state="open"]');
      await expect(datePanel).toHaveAttribute('data-positioned', 'true');
      await expect(datePanel).toHaveCSS('scale', '1');
      const calendar = await page
        .getByRole('dialog')
        .locator('.leaf-calendar__cells')
        .boundingBox();
      await date.press('Escape');
      for (const label of ['Card date time', 'Card date time range']) {
        const input = page.getByRole('combobox', { name: label, exact: true });
        await input.click();
        const panel = page.locator('.leaf-picker-panel[data-state="open"]');
        await expect(panel).toHaveAttribute('data-positioned', 'true');
        await expect(panel).toHaveCSS('scale', '1');
        if (!variant) await expect(panel).toHaveClass(/leaf-picker-panel--card/);
        else await expect(panel).not.toHaveClass(/leaf-picker-panel--card/);
        const grid = await panel.locator('.leaf-calendar__cells').boundingBox();
        expect(grid?.width).toBeCloseTo(calendar?.width ?? 0, 0);
        expect(grid?.height).toBeCloseTo(calendar?.height ?? 0, 0);
        for (const column of await panel.locator('.leaf-time-picker__column-wrap').all()) {
          const period = (await column.getAttribute('data-time-unit')) === 'period';
          expect((await column.boundingBox())?.width).toBeCloseTo(period ? 96 : 84, 0);
        }
        await panel.screenshot({
          path: testInfo.outputPath(`${label.replaceAll(' ', '-')}-compact.png`),
        });
        await input.press('Escape');
      }
    });
  }
}

test('native digit insertion respects segment widths and preserves the next selection', async ({
  page,
}) => {
  await page.goto('/?fixture=picker-surfaces');
  const input = page.getByRole('combobox', { name: 'Card date', exact: true });
  await input.click();
  await input.press('ControlOrMeta+A');
  await page.keyboard.insertText('20000');
  await expect(input).toHaveValue('2000-00-DD');
  expect(
    await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]),
  ).toEqual([5, 7]);
  await page.keyboard.insertText('2');
  expect(
    await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]),
  ).toEqual([8, 10]);
  await page.keyboard.insertText('29');
  await expect(input).toHaveValue('2000-02-29');
  await expect(input).toBeFocused();
  await input.press('Enter');
  await expect(input).toHaveValue('2000-02-29');
});

test('composition digits are applied once and IME Enter does not submit the previous value', async ({
  page,
}) => {
  await page.goto('/?fixture=picker-surfaces');
  const input = page.getByRole('combobox', { name: 'Card date', exact: true });
  await input.click();
  await input.press('ControlOrMeta+A');
  await input.evaluate((node: HTMLInputElement) => {
    node.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (!setter) throw new Error('Missing native input value setter');
    setter.call(node, '２００００');
    node.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        data: '２００００',
        inputType: 'insertCompositionText',
        isComposing: true,
      }),
    );
  });
  await input.press('Enter');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await input.evaluate((node: HTMLInputElement) => {
    node.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true, data: '２００００' }),
    );
  });
  await input.evaluate((node: HTMLInputElement) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (!setter) throw new Error('Missing native input value setter');
    setter.call(node, '２００００');
    node.dispatchEvent(
      new InputEvent('input', { bubbles: true, data: '２００００', inputType: 'insertText' }),
    );
  });
  await expect(input).toHaveValue('2000-00-DD');
  expect(
    await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]),
  ).toEqual([5, 7]);
  await input.press('Escape');
  await expect(input).toHaveValue('2026-10-15');
});

test('invalid native drafts cancel on blur for all six picker modes', async ({ page }) => {
  await page.goto('/?fixture=picker-surfaces');
  for (const label of [
    'Card date',
    'Card date time',
    'Card date range',
    'Card date time range',
    'Card time',
    'Card time range',
  ]) {
    const input = page.getByRole('combobox', { name: label, exact: true });
    const original = await input.inputValue();
    await input.click();
    await input.press('Home');
    await page.keyboard.insertText(
      label === 'Card time' || label === 'Card time range' ? '2400' : '20260230',
    );
    await input.press('Enter');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await page.getByRole('button', { name: 'Open card dialog', exact: true }).focus();
    await expect(input).toHaveValue(original);
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    await input.click();
    await expect(input).toHaveValue(original);
    await input.press('Escape');
  }
});

test('@a11y unified picker panels retain names, roles and contrast in both themes', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    await page.goto(`/?fixture=picker-surfaces&plain&theme=${theme}`);
    await page.evaluate(axe.source);
    for (const label of [
      'Card date',
      'Card date time',
      'Card date range',
      'Card date time range',
      'Card time',
      'Card time range',
    ]) {
      await page.getByRole('combobox', { name: label, exact: true }).click();
      const surface = page.locator('.leaf-picker-panel[data-state="open"]');
      await expect(surface).toHaveAttribute('data-positioned', 'true');
      await expect(surface).toHaveCSS('opacity', '1');
      const result = await page.evaluate(async () =>
        (window as unknown as { axe: typeof axe }).axe.run(document),
      );
      expect
        .soft(
          result.violations.map(({ id, nodes }) => ({
            id,
            targets: nodes.map((node) => node.target),
          })),
          `${theme}: ${label}`,
        )
        .toEqual([]);
      await page.keyboard.press('Escape');
    }
  }
});

test('segmented time editing advances automatically, Tabs between segments and then leaves', async ({
  page,
}) => {
  await page.goto('/?fixture=picker-surfaces');
  const input = page.getByRole('combobox', { name: 'Card time', exact: true });
  await input.click();
  await input.press('ControlOrMeta+A');
  await input.pressSequentially('09');
  expect(
    await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]),
  ).toEqual([3, 5]);
  await input.press('Shift+Tab');
  expect(
    await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]),
  ).toEqual([0, 2]);
  await input.press('Tab');
  await expect(input).toBeFocused();
  await input.pressSequentially('30');
  await expect(input).toHaveValue('09:30');
  await input.press('Enter');
  await input.press('Home');
  await input.press('ArrowUp');
  await input.press('Space');
  await input.press('ArrowDown');
  await input.press('Tab');
  await expect(input).not.toBeFocused();
  await expect(input).toHaveValue('10:29');
  await expect(page.getByRole('combobox', { name: 'Card time range', exact: true })).toBeFocused();
});

test('Tab traverses both datetime endpoints without wrapping or committing', async ({ page }) => {
  await page.goto('/?fixture=picker-surfaces');
  const input = page.getByRole('combobox', { name: 'Card date time range', exact: true });
  await input.click();
  await input.press('Home');
  await input.pressSequentially('2027');
  expect(
    await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]),
  ).toEqual([5, 7]);
  for (let index = 0; index < 4; index++) await input.press('Tab');
  await expect(input).toBeFocused();
  expect(
    await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]),
  ).toEqual([19, 23]);
  await expect(page.getByRole('button', { name: 'End', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await input.press('Space');
  expect(
    await input.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]),
  ).toEqual([24, 26]);
  await input.press('End');
  await input.press('Tab');
  await expect(page.getByRole('combobox', { name: 'Card time', exact: true })).toBeFocused();
  await expect(input).toHaveValue('2026-10-15 10:30 ~ 2026-10-20 18:30');
});

test('date-time keeps one calendar beside two shared time columns and follows typed dates', async ({
  page,
}, testInfo) => {
  await page.goto('/?fixture=picker-surfaces');
  const input = page.getByRole('combobox', { name: 'Card date time', exact: true });
  await input.click();
  await expect(page.getByRole('listbox')).toHaveCount(2);
  await expect(page.locator('.leaf-calendar')).toHaveCount(1);
  await page.getByRole('button', { name: '2026-10-16', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await input.click();
  await input.press('Home');
  await input.pressSequentially('202703151445');
  await expect(page.getByRole('button', { name: '2027-03-15', exact: true })).toHaveClass(
    /--selected/,
  );
  await expect(
    page
      .getByRole('listbox', { name: 'Hours', exact: true })
      .getByRole('option', { name: '14', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(input).toBeFocused();
  const colors = await input.evaluate((node) => {
    const shell = node.parentElement;
    if (!shell) throw new Error('Missing picker field shell');
    const resolve = (token: string) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${token})`;
      shell.append(probe);
      const result = getComputedStyle(probe).color;
      probe.remove();
      return result;
    };
    return {
      border: getComputedStyle(shell).borderTopColor,
      primary: resolve('--leaf-color-primary'),
      selection: getComputedStyle(node, '::selection').backgroundColor,
      info: resolve('--leaf-color-info'),
    };
  });
  await expect
    .poll(() => input.locator('..').evaluate((node) => getComputedStyle(node).borderTopColor))
    .toBe(colors.primary);
  expect(colors.selection).toBe(colors.info);
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(input).toHaveValue('2027-03-15 14:45');
  await input.press('ControlOrMeta+A');
  await input.press('Backspace');
  await expect(input).toHaveValue('');
  await input.press('Escape');
  await expect(input).toHaveValue('');
  const time = page.getByRole('combobox', { name: 'Card time', exact: true });
  await time.click();
  const hours = page.getByRole('listbox', { name: 'Hours', exact: true });
  const selected = hours.getByRole('option', { name: '10', exact: true });
  await expect(selected).toBeInViewport();
  const boxes = await selected.evaluate((row) => {
    const list = row.closest('[role="listbox"]');
    if (!list) throw new Error('Missing time column');
    const viewport = list.getBoundingClientRect();
    const rect = row.getBoundingClientRect();
    return { center: rect.y + rect.height / 2, viewportCenter: viewport.y + viewport.height / 2 };
  });
  expect(Math.abs(boxes.center - boxes.viewportCenter)).toBeLessThan(40);
  await hours.getByRole('option', { name: '11', exact: true }).click();
  await page
    .getByRole('listbox', { name: 'Minutes', exact: true })
    .getByRole('option', { name: '15', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page
    .getByRole('dialog')
    .screenshot({ path: testInfo.outputPath('shared-time-columns.png') });
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(time).toHaveValue('11:15');
});

test('datetime range confirms the start before the end, with no duplicated values or Now action', async ({
  page,
}, testInfo) => {
  await page.goto('/?fixture=picker-surfaces&plain');
  const input = page.getByRole('combobox', { name: 'Card date time range', exact: true });
  await input.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.leaf-calendar')).toHaveCount(1);
  await expect(dialog.getByRole('listbox')).toHaveCount(2);
  await expect(dialog.getByRole('button', { name: 'Now', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '2026-10-16', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Start', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await dialog.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'End', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(dialog.getByRole('button', { name: '2026-10-15', exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: '2026-10-21', exact: true }).click();
  await dialog.screenshot({ path: testInfo.outputPath('sequential-datetime-range.png') });
  await dialog.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(input).toHaveValue('2026-10-16 10:30 ~ 2026-10-21 18:30');
  await expect(dialog).toHaveCount(0);
});

for (const flags of ['', '&seconds', '&seconds&12h']) {
  test(`plain time range footer is flush and columns reserve scrollbars ${flags || 'minutes'}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(`/?fixture=picker-surfaces&plain${flags}`);
    await page.getByRole('combobox', { name: 'Card time range', exact: true }).click();
    const panel = page.locator('.leaf-time-range-picker__panel');
    await expect(panel.getByRole('listbox')).toHaveCount(
      flags.includes('12h') ? 8 : flags.includes('seconds') ? 6 : 4,
    );
    await panel.locator('.leaf-picker-footer').scrollIntoViewIfNeeded();
    const geometry = await panel.evaluate((node) => {
      const p = node.getBoundingClientRect();
      const footer = node.querySelector('.leaf-picker-footer');
      if (!footer) throw new Error('Missing picker footer');
      const f = footer.getBoundingClientRect();
      return { gap: p.bottom - f.bottom, overflow: node.scrollWidth - node.clientWidth };
    });
    expect(geometry.gap).toBeGreaterThanOrEqual(0);
    expect(geometry.gap).toBeLessThanOrEqual(1);
    expect(geometry.overflow).toBeLessThanOrEqual(1);
    await expect(panel.locator('.leaf-time-range-picker__panels > fieldset').last()).toHaveCSS(
      flags ? 'border-block-start-width' : 'border-inline-start-width',
      '1px',
    );
    for (const column of await panel.getByRole('listbox').all()) {
      const gutter = await column.evaluate(
        (node) => (node.parentElement?.clientWidth ?? 0) - node.clientWidth,
      );
      expect(gutter).toBe(10);
    }
    await panel.screenshot({
      path: testInfo.outputPath(`plain-time-range-${flags.replaceAll('&', '-') || 'minutes'}.png`),
    });
  });
}

for (const width of [1100, 375]) {
  test(`expanded time columns remain readable with seconds and a period at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?fixture=picker-surfaces&seconds&12h');
    for (const label of [
      'Card date time',
      'Card date time range',
      'Card time',
      'Card time range',
    ]) {
      const input = page.getByRole('combobox', { name: label, exact: true });
      await input.click();
      const panel = page.locator('.leaf-picker-panel[data-state="open"]');
      await expect(panel).toHaveAttribute('data-positioned', 'true');
      await expect(panel).toHaveCSS('opacity', '1');
      const geometry = await panel.evaluate((node) => ({
        width: node.getBoundingClientRect().width,
        overflow: node.scrollWidth - node.clientWidth,
      }));
      expect(geometry.width).toBeLessThanOrEqual(width - 24);
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      for (const column of await panel.getByRole('listbox').all()) {
        const compact = label === 'Card date time' || label === 'Card date time range';
        expect((await column.boundingBox())?.width).toBeGreaterThanOrEqual(
          width > 620 ? (compact ? 65 : 77) : 50,
        );
        for (const row of await column.getByRole('option').all()) {
          expect(
            await row.evaluate((node) => node.scrollWidth - node.clientWidth),
          ).toBeLessThanOrEqual(1);
        }
      }
      await panel.screenshot({
        path: testInfo.outputPath(`${label.replaceAll(' ', '-')}-${width}.png`),
      });
      await input.press('Escape');
    }
  });
}

for (const profile of [
  { name: 'desktop', width: 1100, theme: 'light', rtl: false },
  { name: 'dark-rtl', width: 1100, theme: 'dark', rtl: true },
  { name: 'mobile', width: 375, theme: 'light', rtl: false },
]) {
  test(`picker layout and input selection in ${profile.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: profile.width, height: 900 });
    await page.goto(
      `/?fixture=picker-surfaces&theme=${profile.theme}${profile.rtl ? '&rtl=1' : ''}`,
    );
    for (const label of [
      'Card date',
      'Card date time',
      'Card date range',
      'Card date time range',
      'Card time',
      'Card time range',
    ]) {
      const input = page.getByRole('combobox', { name: label, exact: true });
      await input.click();
      await expect(input).toHaveCSS('direction', 'ltr');
      if (profile.rtl) {
        await expect(input).toHaveCSS('text-align', 'right');
        await expect(input).toHaveCSS('padding-left', '56px');
      }
      const panel = page.getByRole('dialog');
      await expect(panel).toBeVisible();
      const box = await panel.boundingBox();
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(profile.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        profile.width,
      );
      await input.press('Home');
      expect(await input.evaluate((node: HTMLInputElement) => node.selectionStart)).toBe(0);
      await page.screenshot({
        path: testInfo.outputPath(`${label.replaceAll(' ', '-')}-${profile.name}.png`),
        fullPage: true,
      });
      await input.press('Escape');
    }
  });
}
