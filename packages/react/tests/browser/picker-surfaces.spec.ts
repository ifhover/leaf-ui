import { expect, test } from '@playwright/test';
import { settleAnimations } from './helpers/motion';
import { colorChannels as backgroundColor, colorChannels as tokenColor } from './helpers/paint';

test('card dialog uses a muted canvas, an inset content surface and aligned sections', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 700, height: 500 });
  await page.goto('/?fixture=picker-surfaces');
  await page.getByRole('button', { name: 'Open card dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Card dialog', exact: true });
  await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  await expect(dialog).toHaveClass(/leaf-modal--card/);

  expect(await backgroundColor(dialog)).toEqual(
    await tokenColor(dialog, '--leaf-color-surface-muted'),
  );
  const body = dialog.locator('.leaf-modal__body');
  expect(await backgroundColor(body)).toEqual(await tokenColor(body, '--leaf-color-surface'));

  const metrics = await dialog.evaluate((node) => {
    const box = (selector: string) =>
      node.querySelector<HTMLElement>(selector)?.getBoundingClientRect().toJSON();
    const allBoxes = (selector: string) =>
      [...node.querySelectorAll<HTMLElement>(selector)].map((element) =>
        element.getBoundingClientRect().toJSON(),
      );
    const footer = node.querySelector<HTMLElement>('.leaf-modal__footer');
    const body = node.querySelector<HTMLElement>('.leaf-modal__body');
    const content = node.querySelector<HTMLElement>('.leaf-modal__content');
    const bodyStyle = body ? getComputedStyle(body) : undefined;
    const contentStyle = content ? getComputedStyle(content) : undefined;
    const header = node.querySelector<HTMLElement>('.leaf-modal__header');
    const headerStyle = header ? getComputedStyle(header) : undefined;
    const title = node.querySelector<HTMLElement>('.leaf-modal__heading h2');
    const titleStyle = title ? getComputedStyle(title) : undefined;
    const close = node.querySelector<HTMLElement>('.leaf-modal__close');
    const closeStyle = close ? getComputedStyle(close) : undefined;
    return {
      body: box('.leaf-modal__body'),
      bodyBorderWidth: Number.parseFloat(bodyStyle?.borderInlineStartWidth ?? '0'),
      borderWidth: Number.parseFloat(getComputedStyle(node).borderInlineStartWidth),
      close: box('.leaf-modal__close'),
      closeColor: closeStyle?.color,
      closeIcon: box('.leaf-modal__close > svg'),
      confirm: allBoxes('.leaf-modal__footer .leaf-button').at(-1),
      actions: allBoxes('.leaf-modal__footer .leaf-button'),
      content: content?.getBoundingClientRect().toJSON(),
      contentPaddingLeft: Number.parseFloat(contentStyle?.paddingInlineStart ?? '0'),
      contentPaddingRight: Number.parseFloat(contentStyle?.paddingInlineEnd ?? '0'),
      dialog: node.getBoundingClientRect().toJSON(),
      footer: footer?.getBoundingClientRect().toJSON(),
      footerBackground: footer ? getComputedStyle(footer).backgroundColor : '',
      footerPaddingInlineStart: Number.parseFloat(
        footer ? getComputedStyle(footer).paddingInlineStart : '0',
      ),
      footerPaddingInlineEnd: Number.parseFloat(
        footer ? getComputedStyle(footer).paddingInlineEnd : '0',
      ),
      footerPaddingBlockStart: Number.parseFloat(
        footer ? getComputedStyle(footer).paddingBlockStart : '0',
      ),
      footerPaddingBlockEnd: Number.parseFloat(
        footer ? getComputedStyle(footer).paddingBlockEnd : '0',
      ),
      header: box('.leaf-modal__header'),
      headerPaddingInlineStart: Number.parseFloat(headerStyle?.paddingInlineStart ?? '0'),
      headerPaddingInlineEnd: Number.parseFloat(headerStyle?.paddingInlineEnd ?? '0'),
      headerPaddingBlockStart: Number.parseFloat(headerStyle?.paddingBlockStart ?? '0'),
      title: box('.leaf-modal__heading'),
      titleText: box('.leaf-modal__heading h2'),
      titleFontSize: titleStyle?.fontSize,
      titleFontWeight: titleStyle?.fontWeight,
      titleLineHeight: titleStyle?.lineHeight,
      textColor: getComputedStyle(node).color,
    };
  });
  const contentLeft = (metrics.dialog?.x ?? 0) + metrics.borderWidth;
  const contentRight =
    (metrics.dialog?.x ?? 0) + (metrics.dialog?.width ?? 0) - metrics.borderWidth;
  const contentTextLeft = (metrics.content?.x ?? 0) + metrics.contentPaddingLeft;
  const cardOuterRight = (metrics.body?.x ?? 0) + (metrics.body?.width ?? 0);
  expect(metrics.headerPaddingInlineStart).toBeCloseTo(22, 0);
  expect(metrics.headerPaddingInlineEnd).toBeCloseTo(14, 0);
  expect(metrics.footerPaddingInlineStart).toBeCloseTo(6, 0);
  expect(metrics.footerPaddingInlineEnd).toBeCloseTo(6, 0);
  expect(metrics.footerPaddingBlockStart).toBe(0);
  expect(metrics.footerPaddingBlockEnd).toBeCloseTo(10, 0);
  expect(metrics.title?.x).toBeCloseTo(contentTextLeft, 0);
  expect(metrics.titleText?.y).toBeCloseTo((metrics.title?.y ?? 0) + 2, 0);
  expect((metrics.close?.x ?? 0) + (metrics.close?.width ?? 0)).toBeCloseTo(
    contentRight - metrics.headerPaddingInlineEnd,
    0,
  );
  expect(metrics.titleFontSize).toBe('14px');
  expect(metrics.titleFontWeight).toBe('700');
  expect(metrics.titleLineHeight).toBe('22px');
  expect(metrics.closeIcon?.width).toBeCloseTo(16, 0);
  expect(metrics.closeIcon?.height).toBeCloseTo(16, 0);
  expect(metrics.closeColor).toBe(metrics.textColor);
  expect((metrics.confirm?.x ?? 0) + (metrics.confirm?.width ?? 0)).toBeCloseTo(cardOuterRight, 0);
  expect(metrics.body?.x).toBeCloseTo(contentLeft + 6, 0);
  expect((metrics.body?.x ?? 0) + (metrics.body?.width ?? 0)).toBeCloseTo(contentRight - 6, 0);
  expect(metrics.bodyBorderWidth).toBe(0);
  expect(contentTextLeft).toBeCloseTo(contentLeft + 22, 0);
  expect(metrics.headerPaddingBlockStart).toBeCloseTo(12, 0);
  expect(metrics.header?.height).toBeCloseTo(
    Math.max(metrics.title?.height ?? 0, metrics.close?.height ?? 0) + 12,
    0,
  );
  const closeButton = dialog.locator('.leaf-modal__close');
  await expect(closeButton).toHaveCSS('border-radius', '4px');
  const restingBackground = await backgroundColor(closeButton);
  expect(restingBackground).toEqual([0, 0, 0, 0]);
  const hoverBackground = await closeButton.evaluate((node) => {
    const probe = document.createElement('span');
    probe.style.backgroundColor = 'var(--leaf-color-option-hover)';
    node.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });
  await closeButton.hover();
  await expect
    .poll(() => closeButton.evaluate((node) => getComputedStyle(node).backgroundColor))
    .toBe(hoverBackground);
  await page.mouse.move(0, 0);
  await expect.poll(async () => (await backgroundColor(closeButton))[3]).toBe(0);
  expect(metrics.close?.width).toBeCloseTo(24, 0);
  expect(metrics.close?.height).toBeCloseTo(24, 0);
  expect(metrics.body?.y).toBeCloseTo(
    (metrics.header?.y ?? 0) + (metrics.header?.height ?? 0) + 12,
    0,
  );
  expect(metrics.footer?.y).toBeCloseTo(
    (metrics.body?.y ?? 0) + (metrics.body?.height ?? 0) + 10,
    0,
  );
  expect(metrics.actions).toHaveLength(2);
  for (const action of metrics.actions) {
    expect(action.y - ((metrics.body?.y ?? 0) + (metrics.body?.height ?? 0))).toBeCloseTo(10, 0);
    const dialogInnerBottom =
      (metrics.dialog?.y ?? 0) + (metrics.dialog?.height ?? 0) - metrics.borderWidth;
    expect(dialogInnerBottom - (action.y + action.height)).toBeCloseTo(10, 0);
  }
  expect(metrics.footerBackground).toBe('rgba(0, 0, 0, 0)');

  const viewport = body.getByRole('region', { name: 'Card dialog', exact: true });
  await expect(body.getByRole('scrollbar', { name: 'Vertical scrollbar' })).toBeAttached();
  const bodyBox = await body.boundingBox();
  await viewport.hover();
  await page.mouse.wheel(0, 280);
  await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(80);
  expect(await body.boundingBox()).toEqual(bodyBox);
  expect(await backgroundColor(body)).toEqual(await tokenColor(body, '--leaf-color-surface'));
  await viewport.evaluate((node) => {
    node.scrollTop = 0;
  });
  await dialog.screenshot({
    path: test.info().outputPath(`picker-card-dialog-${testInfo.project.name}.png`),
  });
});

test('plain dialog uses the content surface and equal outer insets', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 700, height: 500 });
  await page.goto('/?fixture=picker-surfaces');
  await page.getByRole('button', { name: 'Open plain dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Plain dialog', exact: true });
  await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  expect(await backgroundColor(dialog)).toEqual(await tokenColor(dialog, '--leaf-color-surface'));

  const metrics = await dialog.evaluate((node) => {
    const box = (selector: string) =>
      node.querySelector<HTMLElement>(selector)?.getBoundingClientRect().toJSON();
    const padding = (selector: string) => {
      const element = node.querySelector<HTMLElement>(selector);
      const style = element ? getComputedStyle(element) : undefined;
      return {
        blockStart: Number.parseFloat(style?.paddingBlockStart ?? '0'),
        blockEnd: Number.parseFloat(style?.paddingBlockEnd ?? '0'),
        inlineStart: Number.parseFloat(style?.paddingInlineStart ?? '0'),
        inlineEnd: Number.parseFloat(style?.paddingInlineEnd ?? '0'),
      };
    };
    return {
      borderWidth: Number.parseFloat(getComputedStyle(node).borderInlineStartWidth),
      close: box('.leaf-modal__close'),
      confirm: box('.leaf-modal__footer .leaf-button:last-child'),
      content: box('.leaf-modal__content'),
      contentPadding: padding('.leaf-modal__content'),
      dialog: node.getBoundingClientRect().toJSON(),
      footerPadding: padding('.leaf-modal__footer'),
      headerPadding: padding('.leaf-modal__header'),
      title: box('.leaf-modal__heading'),
    };
  });
  const contentLeft = (metrics.dialog?.x ?? 0) + metrics.borderWidth;
  const contentRight =
    (metrics.dialog?.x ?? 0) + (metrics.dialog?.width ?? 0) - metrics.borderWidth;
  expect(metrics.headerPadding.blockStart).toBeCloseTo(20, 0);
  expect(metrics.headerPadding.blockStart).toBe(metrics.headerPadding.inlineStart);
  expect(metrics.footerPadding.blockEnd).toBe(metrics.headerPadding.blockStart);
  expect(metrics.contentPadding.blockStart).toBe(metrics.contentPadding.inlineStart);
  expect(metrics.contentPadding.blockEnd).toBe(metrics.contentPadding.inlineStart);
  expect(metrics.headerPadding.inlineStart).toBeCloseTo(metrics.footerPadding.inlineStart, 0);
  expect(metrics.headerPadding.inlineEnd).toBeCloseTo(metrics.footerPadding.inlineEnd, 0);
  expect(metrics.title?.x).toBeCloseTo(contentLeft + metrics.headerPadding.inlineStart, 0);
  expect((metrics.close?.x ?? 0) + (metrics.close?.width ?? 0)).toBeCloseTo(
    contentRight - metrics.headerPadding.inlineEnd,
    0,
  );
  expect((metrics.confirm?.x ?? 0) + (metrics.confirm?.width ?? 0)).toBeCloseTo(
    contentRight - metrics.footerPadding.inlineEnd,
    0,
  );
  expect((metrics.content?.x ?? 0) + metrics.contentPadding.inlineStart).toBeCloseTo(
    contentLeft + metrics.footerPadding.inlineStart,
    0,
  );
  await dialog.screenshot({
    path: test.info().outputPath(`picker-plain-dialog-${testInfo.project.name}.png`),
  });
});

const pickers = [
  {
    name: 'Card date',
    panel: '.leaf-date-picker__panel',
    surface: '.leaf-calendar',
    footer: true,
  },
  {
    name: 'Card date time',
    panel: '.leaf-datetime-panel',
    surface: '.leaf-picker-view',
    footer: true,
  },
  {
    name: 'Card date range',
    panel: '.leaf-range-panel',
    surface: '.leaf-range-panel__calendars',
    footer: false,
  },
  {
    name: 'Card date time range',
    panel: '.leaf-range-panel--datetime',
    surface: '.leaf-range-panel__calendars',
    footer: true,
  },
  {
    name: 'Card time',
    panel: '.leaf-time-picker__panel',
    surface: '.leaf-time-picker__columns',
    footer: true,
  },
  {
    name: 'Card time range',
    panel: '.leaf-time-range-picker__panel',
    surface: '.leaf-time-range-picker__panels',
    footer: true,
  },
] as const;

test('all date and time pickers share the card panel preset and footer alignment', async ({
  page,
}, testInfo) => {
  await page.goto('/?fixture=picker-surfaces');
  for (const item of pickers) {
    const slug = item.name.toLowerCase().replaceAll(' ', '-');
    await page.getByRole('combobox', { name: item.name, exact: true }).click();
    const panel = page.locator(item.panel).last();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveClass(/leaf-picker-panel--card/);
    expect(await backgroundColor(panel)).toEqual(
      await tokenColor(panel, '--leaf-color-surface-muted'),
    );

    const surface = panel.locator(item.surface);
    expect(await backgroundColor(surface)).toEqual(
      await tokenColor(surface, '--leaf-color-surface'),
    );
    const geometry = await panel.evaluate((node, surfaceSelector) => {
      const panelBox = node.getBoundingClientRect();
      const surfaceBox = node.querySelector<HTMLElement>(surfaceSelector)?.getBoundingClientRect();
      const footer = node.querySelector<HTMLElement>('.leaf-picker-footer');
      const footerBox = footer?.getBoundingClientRect();
      return {
        footerBackground: footer ? getComputedStyle(footer).backgroundColor : '',
        footerLeft: footerBox?.left,
        footerRight: footerBox?.right,
        insetLeft: (surfaceBox?.left ?? 0) - panelBox.left,
        insetRight: panelBox.right - (surfaceBox?.right ?? 0),
        surfaceLeft: surfaceBox?.left,
        surfaceRight: surfaceBox?.right,
      };
    }, item.surface);
    expect(geometry.insetLeft).toBeCloseTo(7, 0);
    expect(geometry.insetRight).toBeCloseTo(7, 0);
    if (item.footer) {
      expect(geometry.footerBackground).toBe('rgba(0, 0, 0, 0)');
      expect(geometry.footerLeft).toBeCloseTo(geometry.surfaceLeft ?? 0, 0);
      expect(geometry.footerRight).toBeCloseTo(geometry.surfaceRight ?? 0, 0);
      const shortcuts = panel.locator('.leaf-picker-footer .leaf-button:not(.leaf-button--solid)');
      for (const shortcut of await shortcuts.all()) {
        await expect(shortcut).toHaveClass(/leaf-button--outline/);
        await expect(shortcut).toHaveCSS('border-top-style', 'solid');
        await expect(shortcut).toHaveCSS('border-top-width', '1px');
        await expect(shortcut).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
      }
    }
    await panel.screenshot({
      path: test.info().outputPath(`picker-${slug}-${testInfo.project.name}.png`),
    });
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  }
});

test('card picker panels stay contained in dark RTL layouts', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/?fixture=picker-surfaces&theme=dark&rtl=1');
  for (const item of pickers) {
    const slug = item.name.toLowerCase().replaceAll(' ', '-');
    await page.getByRole('combobox', { name: item.name, exact: true }).click();
    const panel = page.locator(item.panel).last();
    await expect(panel).toBeVisible();
    await settleAnimations(panel);
    const bounds = await panel.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect(bounds?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(375);
    expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(812);
    const surface = panel.locator(item.surface);
    const surfaceColor = await tokenColor(surface, '--leaf-color-surface');
    expect(await backgroundColor(surface)).toEqual(surfaceColor);
    expect(await backgroundColor(panel)).not.toEqual(surfaceColor);
    await panel.screenshot({
      path: test.info().outputPath(`picker-${slug}-dark-rtl-${testInfo.project.name}.png`),
    });
    const viewport = panel.locator('.leaf-floating__viewport');
    const scrollMetrics = await viewport.evaluate((node) => ({
      clientWidth: node.clientWidth,
      scrollWidth: node.scrollWidth,
    }));
    expect(scrollMetrics.scrollWidth).toBeLessThanOrEqual(scrollMetrics.clientWidth + 1);
    const footer = panel.locator('.leaf-picker-footer');
    if (await footer.count()) {
      await footer.scrollIntoViewIfNeeded();
      for (const shortcut of await footer.locator('.leaf-button:not(.leaf-button--solid)').all()) {
        await expect(shortcut).toHaveClass(/leaf-button--outline/);
        await expect(shortcut).toHaveCSS('border-top-style', 'solid');
        await expect(shortcut).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
      }
      // Scrolling can reposition the panel; compare geometry from the same layout frame.
      const { panelBounds, footerBounds } = await panel.evaluate((node) => {
        const footer = node.querySelector<HTMLElement>('.leaf-picker-footer');
        if (!footer) throw new Error('Missing picker footer geometry');
        return {
          panelBounds: node.getBoundingClientRect().toJSON(),
          footerBounds: footer.getBoundingClientRect().toJSON(),
        };
      });
      expect(footerBounds.top).toBeGreaterThanOrEqual(panelBounds.top);
      expect(footerBounds.bottom).toBeLessThanOrEqual(panelBounds.bottom + 1);
    }
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  }
});

test.describe('picker option feedback', () => {
  test.use({ hasTouch: false });

  for (const rtl of [false, true]) {
    test(`time checks stay clear of small scrollbars in ${rtl ? 'dark compact RTL' : 'light LTR'}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: rtl ? 375 : 1100, height: 900 });
      await page.goto(`/?fixture=picker-surfaces${rtl ? '&theme=dark&rtl=1&compact=1' : ''}`);
      for (const item of pickers.filter((picker) => picker.name.includes('time'))) {
        await page.getByRole('combobox', { name: item.name, exact: true }).click();
        const panel = page.locator(`${item.panel}[data-state="open"]`);
        const columns = panel.locator('.leaf-time-picker__column');
        for (const column of await columns.all()) {
          const selected = column.locator('[aria-selected="true"]');
          const check = selected.locator('.leaf-time-picker__check');
          const track = column.locator('..').locator('.leaf-scrollbar__bar--vertical');
          await expect(check).toHaveCSS('opacity', '1');
          await selected.hover();
          await expect(track).toHaveCSS('width', '6px');
          await expect(track).toHaveCSS('opacity', '1');
          await expect
            .poll(() =>
              selected.evaluate((node) => getComputedStyle(node, '::before').backgroundColor),
            )
            .toBe('rgba(0, 0, 0, 0.04)');
          const mark = await check.boundingBox();
          const bar = await track.boundingBox();
          if (!mark || !bar) throw new Error('Missing time check or scrollbar geometry');
          const gap = rtl ? mark.x - bar.x - bar.width : bar.x - mark.x - mark.width;
          expect(gap).toBeGreaterThanOrEqual(2);
          // The same check-only feedback remains after keyboard selection and scrolling.
          await selected.press('ArrowDown');
          await expect(column.locator('[aria-selected="true"]')).toBeFocused();
        }
        await expect(panel.locator('.leaf-time-picker__selection')).toHaveCount(0);
        await panel.screenshot({
          path: testInfo.outputPath(`${item.name.replaceAll(' ', '-')}-${rtl ? 'rtl' : 'ltr'}.png`),
        });
        await page.keyboard.press('Escape');
        await expect(panel).toHaveCount(0);
      }
    });
  }

  test('time checks share Select motion and dates never shrink on press', async ({ page }) => {
    await page.goto('/?fixture=selection');
    const motion = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((node) => {
          const css = getComputedStyle(node);
          return [css.transitionProperty, css.transitionDuration, css.transitionTimingFunction];
        });
    await page.getByRole('combobox', { name: 'Selected person' }).click();
    const selectMotion = await motion('.leaf-select__check');
    await page.keyboard.press('Escape');
    await page.getByRole('combobox', { name: 'Selected time' }).click();
    expect(await motion('.leaf-time-picker__check')).toEqual(selectMotion);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.leaf-time-picker__check').first()).toHaveCSS(
      'transition-duration',
      '0s',
    );
    await page.keyboard.press('Escape');
    await page.goto('/?fixture=picker-surfaces');
    await page.getByRole('combobox', { name: 'Card date', exact: true }).click();
    const date = page.locator('.leaf-date-picker__day[data-day="2026-10-16"]');
    await expect(date).toHaveCSS('border-radius', '6px');
    await date.hover();
    await expect(date).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.04)');
    await page.mouse.down();
    await expect(date).toHaveCSS('scale', 'none');
    await expect(date).toHaveCSS('transform', 'none');
    await page.mouse.up();
  });
});
