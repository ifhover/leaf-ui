import { expect, test } from '@playwright/test';
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

test('plain dialog shares the canvas and aligns header and footer insets', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 700, height: 500 });
  await page.goto('/?fixture=picker-surfaces');
  await page.getByRole('button', { name: 'Open plain dialog', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Plain dialog', exact: true });
  await expect(dialog).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)', { timeout: 20_000 });
  expect(await backgroundColor(dialog)).toEqual(
    await tokenColor(dialog, '--leaf-color-surface-muted'),
  );

  const metrics = await dialog.evaluate((node) => {
    const box = (selector: string) =>
      node.querySelector<HTMLElement>(selector)?.getBoundingClientRect().toJSON();
    const padding = (selector: string) => {
      const element = node.querySelector<HTMLElement>(selector);
      const style = element ? getComputedStyle(element) : undefined;
      return {
        blockStart: Number.parseFloat(style?.paddingBlockStart ?? '0'),
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
  expect(metrics.headerPadding.blockStart).toBeCloseTo(16, 0);
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
      await tokenColor(surface, '--leaf-picker-card-surface'),
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
    expect(geometry.insetLeft).toBeCloseTo(9, 0);
    expect(geometry.insetRight).toBeCloseTo(9, 0);
    if (item.footer) {
      expect(geometry.footerBackground).toBe('rgba(0, 0, 0, 0)');
      expect(geometry.footerLeft).toBeCloseTo(geometry.surfaceLeft ?? 0, 0);
      expect(geometry.footerRight).toBeCloseTo(geometry.surfaceRight ?? 0, 0);
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
    const bounds = await panel.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect(bounds?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(375);
    expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(812);
    const surface = panel.locator(item.surface);
    const surfaceColor = await tokenColor(surface, '--leaf-picker-card-surface');
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
      const footerBounds = await footer.boundingBox();
      expect(footerBounds?.y ?? -1).toBeGreaterThanOrEqual(bounds?.y ?? 0);
      expect((footerBounds?.y ?? 0) + (footerBounds?.height ?? 0)).toBeLessThanOrEqual(
        (bounds?.y ?? 0) + (bounds?.height ?? 0) + 1,
      );
    }
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  }
});
