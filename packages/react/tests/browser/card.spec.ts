import { TinyColor } from '@ctrl/tinycolor';
import { expect, type Locator, test } from '@playwright/test';
import { expectAccessible } from './helpers/accessibility';
import { colorChannels as backgroundColor, colorChannels as tokenColor } from './helpers/paint';

async function geometry(card: Locator) {
  return card.evaluate((node) => {
    const heading = node.querySelector<HTMLElement>('.leaf-card__header');
    const bar = node.querySelector<HTMLElement>('.leaf-tabs__header');
    const tab = node.querySelector<HTMLElement>('[role="tab"]');
    const panel = node.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])');
    if (!bar || !tab || !panel) throw new Error('Missing card navigation');
    const style = getComputedStyle(panel);
    return {
      headingBottom: heading?.getBoundingClientRect().bottom,
      barTop: bar.getBoundingClientRect().top,
      barBottom: bar.getBoundingClientRect().bottom,
      tabTop: tab.getBoundingClientRect().top,
      tabBottom: tab.getBoundingClientRect().bottom,
      barWidth: bar.offsetWidth,
      width: node.clientWidth,
      tabLeft:
        tab.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(tab).paddingLeft),
      bodyLeft: panel.getBoundingClientRect().left + Number.parseFloat(style.paddingLeft),
      bodyPadding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
      headingBorder: heading ? getComputedStyle(heading).borderBottomWidth : '0px',
      barBorder: getComputedStyle(bar).borderBottomWidth,
      overflow: node.scrollWidth - node.clientWidth,
    };
  });
}

async function expectTabsFillHeading(card: Locator) {
  const shape = await geometry(card);
  expect(shape.tabTop).toBeCloseTo(shape.barTop, 1);
  expect(shape.tabBottom).toBeCloseTo(shape.barBottom - 1, 1);
  await expect(card.locator('.leaf-tabs__header')).toHaveCSS('padding-top', '0px');
  await expect(card.locator('.leaf-tabs__header')).toHaveCSS('padding-bottom', '0px');
  await expect(card.getByRole('tab').first()).toHaveCSS('align-items', 'center');
  const offset = await card.locator('.leaf-tabs__extra').evaluate((extra) => {
    const bar = extra.parentElement?.getBoundingClientRect();
    const bounds = extra.getBoundingClientRect();
    if (!bar) throw new Error('Missing tab header');
    return (bounds.top + bounds.bottom) / 2 - (bar.top + bar.bottom - 1) / 2;
  });
  expect(Math.abs(offset)).toBeLessThan(1);
}

for (const [size, query, inline, bottom] of [
  ['sm', '&small', '16px', '16px'],
  ['md', '', '20px', '20px'],
  ['lg', '&large', '24px', '24px'],
  ['custom', '&overrides', '24px', '12px'],
] as const) {
  test(`card outer insets are equal or respect explicit padding for ${size}`, async ({ page }) => {
    await page.goto(`/?fixture=card${query}`);
    const footer = page.getByTestId('titled-card').locator('.leaf-card__footer');
    await expect(footer).toHaveCSS('padding-top', '0px');
    await expect(footer).toHaveCSS('padding-bottom', bottom);
    if (size !== 'custom') {
      await expect(page.getByTestId('titled-card').locator('.leaf-card__header')).toHaveCSS(
        'padding-top',
        bottom,
      );
    }
    await expect(footer).toHaveCSS('padding-inline-start', inline);
    await expect(footer).toHaveCSS('padding-inline-end', inline);
    const layeredFooter = page.getByTestId('layered-card').locator('.leaf-card__footer');
    await expect(layeredFooter).toHaveCSS('padding-bottom', '4px');
    await expect(layeredFooter).toHaveCSS('padding-inline-start', '4px');
    await page.getByTestId('titled-card').screenshot({
      path: test.info().outputPath(`card-footer-${size}.png`),
    });
  });
}

for (const appearance of ['light', 'dark']) {
  test(`selected cards use the primary border without shadows or layout shift in ${appearance}`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=card&theme=${appearance}`);
    const card = page.getByTestId('titled-card');
    const before = await card.boundingBox();
    const normalBorder = await card.evaluate((node) => getComputedStyle(node).borderColor);
    await page.getByRole('button', { name: 'Toggle selected' }).click();
    const primary = await card.evaluate((node) =>
      getComputedStyle(node).getPropertyValue('--leaf-color-primary').trim(),
    );
    const border = new TinyColor(primary).toRgbString();
    for (const candidate of [
      card,
      page.getByTestId('layered-card'),
      page.getByTestId('unbordered-card'),
    ]) {
      await expect(candidate).toHaveCSS('border-color', border);
      await expect(candidate).toHaveCSS('box-shadow', 'none');
    }
    await expect
      .poll(() =>
        page
          .getByTestId('layered-card')
          .locator(':scope > .leaf-card__panel')
          .evaluate((node) => getComputedStyle(node, '::before').boxShadow),
      )
      .toBe('none');
    expect(await card.boundingBox()).toEqual(before);
    await card.screenshot({ path: test.info().outputPath(`selected-card-${appearance}.png`) });
    await page.getByRole('button', { name: 'Change primary' }).click();
    await expect(card).toHaveCSS('border-color', 'rgb(183, 73, 19)');
    await page.getByRole('button', { name: 'Toggle selected' }).click();
    await expect(card).toHaveCSS('border-color', normalBorder);
    await expect(card).not.toHaveCSS('box-shadow', 'none');
  });

  test(`selected cards preserve explicit border overrides in ${appearance}`, async ({ page }) => {
    await page.goto(`/?fixture=card&theme=${appearance}&selected&overrides`);
    await expect(page.getByTestId('titled-card')).toHaveCSS('border-color', 'rgb(136, 136, 153)');
    await expect(page.getByTestId('titled-card')).toHaveCSS('box-shadow', 'none');
  });

  test(`card headings and tabs form one surface with one divider in ${appearance}`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/?fixture=card&theme=${appearance}`);
    const titled = page.getByTestId('titled-card');
    const shape = await geometry(titled);
    expect(shape.headingBottom).toBeCloseTo(shape.barTop, 1);
    expect(shape.headingBorder).toBe('0px');
    expect(shape.barBorder).toBe('1px');
    expect(shape.barWidth).toBe(shape.width);
    expect(shape.tabLeft).toBeCloseTo(shape.bodyLeft, 1);
    expect(shape.bodyPadding).toEqual(['20px', '20px', '20px', '20px']);
    expect(shape.overflow).toBeLessThanOrEqual(1);
    await expect(titled.locator('.leaf-card__footer')).toHaveCSS('padding-top', '0px');
    await expect(titled.locator('.leaf-card__footer')).toHaveCSS('padding-bottom', '20px');
    await expect(titled.locator('.leaf-card__footer')).toHaveCSS('border-top-width', '0px');
    await expect(titled.locator('.leaf-card__footer')).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    const plain = page.getByTestId('untitled-card');
    await expect(plain.locator('.leaf-card__header')).toHaveCount(0);
    await expectTabsFillHeading(plain);
    await expect(
      plain.locator('.leaf-tabs__header').getByRole('button', { name: 'View project' }),
    ).toBeVisible();
    expect((await geometry(plain)).barBorder).toBe('1px');
    await expect(
      titled.locator('.leaf-card__header').getByRole('button', { name: 'Manage project' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Toggle heading' }).click();
    await expect(titled.locator('.leaf-card__header')).toHaveCount(0);
    await expectTabsFillHeading(titled);
    await expect(
      titled.locator('.leaf-tabs__header').getByRole('button', { name: 'Manage project' }),
    ).toBeVisible();
    expect((await geometry(titled)).barBorder).toBe('1px');
    await titled.screenshot({
      path: test.info().outputPath(`card-tabs-${appearance}-${testInfo.project.name}.png`),
    });
  });

  test(`card tabs preserve form state, loading selection and keyboard behavior in ${appearance}`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=card&theme=${appearance}`);
    const card = page.getByTestId('titled-card');
    const details = card.getByRole('tab', { name: 'Details' });
    const members = card.getByRole('tab', { name: 'Members' });
    await card.getByRole('textbox', { name: 'Card draft' }).fill('Unsent draft');
    await details.focus();
    await details.press('ArrowRight');
    await expect(members).toBeFocused();
    await expect(members).toHaveAttribute('aria-selected', 'true');
    await members.press('Home');
    await expect(card.getByRole('textbox', { name: 'Card draft' })).toHaveValue('Unsent draft');
    await page.getByRole('button', { name: 'Toggle loading' }).click();
    await expect(card).toHaveAttribute('aria-busy', 'true');
    await expect(card.getByRole('status')).toBeVisible();
    await members.click();
    await expect(members).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('button', { name: 'Toggle loading' }).click();
    await expect(card.getByRole('tabpanel', { name: 'Members' })).toHaveText('Project members');
    await expect(card.getByRole('status')).toHaveCount(0);
    await expect(card.getByRole('tab', { name: 'Billing' })).toBeDisabled();
  });
  test(`card tabs accessibility in ${appearance}`, { tag: '@a11y' }, async ({ page }) => {
    await page.goto(`/?fixture=card&theme=${appearance}`);
    const card = page.getByTestId('titled-card');
    await card.getByRole('tab', { name: 'Members' }).click();
    await expectAccessible(page, '[data-testid="titled-card"]');
  });
}

for (const [label, tabsQuery, cardQuery, expectedLine] of [
  ['small', '&size=sm', '&small', '2px'],
  ['medium', '', '', '3px'],
  ['large', '&size=lg', '&large', '4px'],
] as const) {
  test(`embedded ${label} line tabs match the standalone selected indicator thickness`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=tabs&line=1${tabsQuery}`);
    const standalone = page.getByTestId('motion-tabs');
    const standaloneLine = await standalone
      .locator('.leaf-tabs__indicator')
      .evaluate((indicator) => getComputedStyle(indicator, '::after').height);

    await page.goto(`/?fixture=card${cardQuery}`);
    const card = page.getByTestId('titled-card');
    await card.waitFor();
    await page.waitForTimeout(50);
    const cardLine = await card.locator('.leaf-tabs__indicator').evaluate((indicator) => {
      const style = getComputedStyle(indicator, '::after');
      const lineBottom = indicator.getBoundingClientRect().bottom - Number.parseFloat(style.bottom);
      const clipBottom = indicator.closest('.leaf-scrollbar')?.getBoundingClientRect().bottom;
      return { height: style.height, bottom: style.bottom, lineBottom, clipBottom };
    });

    expect(standaloneLine).toBe(expectedLine);
    expect(cardLine.height).toBe(standaloneLine);
    expect(cardLine.bottom).toBe('-1px');
    expect(cardLine.clipBottom).toBeCloseTo(cardLine.lineBottom, 1);
  });
}

for (const [size, query, fontSize] of [
  ['small', 'small', '12px'],
  ['medium', '', '12px'],
  ['large', 'large', '13px'],
] as const) {
  test(`layered ${size} cards retain their hierarchy in compact RTL with custom radii`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(`/?fixture=card&theme=dark&compact=1&rtl=1&overrides&${query}`);
    const card = page.getByTestId('layered-card');
    await expect(card).toHaveCSS('direction', 'rtl');
    await expect(card.getByRole('heading')).toHaveCSS('font-size', fontSize);
    await expect(card.getByRole('heading')).toHaveCSS('font-weight', '500');
    const headingInset = size === 'small' ? '1.5px' : size === 'large' ? '4.5px' : '3px';
    await expect(card.locator(':scope > .leaf-card__header')).toHaveCSS(
      'padding-block-start',
      size === 'small' ? '4.5px' : size === 'large' ? '7.5px' : '6px',
    );
    await expect(card.locator(':scope > .leaf-card__header')).toHaveCSS(
      'padding-block-end',
      headingInset,
    );
    await expect(card.locator(':scope > .leaf-card__header')).toHaveCSS(
      'padding-inline-start',
      '24px',
    );
    await expect(card.locator('.leaf-card__heading')).toHaveCSS('margin-inline-start', '0px');
    await expect(card).toHaveCSS('box-shadow', 'none');
    await expect(card.locator(':scope > .leaf-card__panel')).toHaveCSS('border-radius', '4.5px');
    await expect(card).toHaveCSS('border-radius', '7.5px');
    await expect(card.locator(':scope > .leaf-card__footer')).toHaveCount(1);
    const layout = await card.evaluate((node) => {
      const panel = node.querySelector('.leaf-card__panel')?.getBoundingClientRect();
      const footer = node.querySelector('.leaf-card__footer')?.getBoundingClientRect();
      const extra = node.querySelector('.leaf-card__extra')?.getBoundingClientRect();
      return {
        overflow: node.scrollWidth - node.clientWidth,
        panelLeft: panel?.left,
        footerLeft: footer?.left,
        panelBottom: panel?.bottom,
        footerTop: footer?.top,
        extraLeft: extra?.left,
      };
    });
    expect(layout.footerTop).toBeGreaterThan(layout.panelBottom ?? 0);
    expect(layout.extraLeft).toBeCloseTo(layout.panelLeft ?? 0, 1);
    expect(layout.overflow).toBeLessThanOrEqual(1);
    const tabs = page.getByTestId('layered-tabbed-card');
    const taggedHeader = await card.locator(':scope > .leaf-card__header').boundingBox();
    const plainHeader = await tabs.locator(':scope > .leaf-card__header').boundingBox();
    expect(taggedHeader?.height).toBe(plainHeader?.height);
    await tabs.getByRole('tab', { name: 'History' }).click();
    await expect(tabs.getByRole('tabpanel')).toHaveText('Previous visits');
  });
}

test('cards keep a subtle resting shadow without a hover lift', async ({ page }) => {
  await page.goto('/?fixture=card');
  const card = page.getByTestId('titled-card');
  const restingShadow = await card.evaluate((node) => getComputedStyle(node).boxShadow);
  expect(restingShadow).not.toBe('none');
  expect(restingShadow.split(', rgba').length).toBe(1);
  expect(restingShadow).toContain('0px 1px 2px');
  await card.hover();
  expect(await card.evaluate((node) => getComputedStyle(node).boxShadow)).toBe(restingShadow);
});

for (const appearance of ['light', 'dark']) {
  test(`layered cards place aligned content on a nested surface in ${appearance}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(`/?fixture=card&theme=${appearance}`);
    const card = page.getByTestId('layered-card');
    const panel = card.locator(':scope > .leaf-card__panel');

    expect(await backgroundColor(panel)).toEqual(await tokenColor(panel, '--leaf-card-surface'));
    expect(await backgroundColor(card)).not.toEqual(await backgroundColor(panel));

    const metrics = await card.evaluate((node) => {
      const panel = node.querySelector<HTMLElement>(':scope > .leaf-card__panel');
      const header = node.querySelector<HTMLElement>(':scope > .leaf-card__header');
      const heading = header?.querySelector<HTMLElement>('.leaf-card__heading');
      const body = panel?.querySelector<HTMLElement>(':scope > .leaf-card__body');
      const footer = node.querySelector<HTMLElement>(':scope > .leaf-card__footer');
      const bodyStyle = body ? getComputedStyle(body) : undefined;
      const panelStyle = panel ? getComputedStyle(panel) : undefined;
      const cardBox = node.getBoundingClientRect();
      const panelBox = panel?.getBoundingClientRect();
      const headerBox = header?.getBoundingClientRect();
      const headingBox = heading?.getBoundingClientRect();
      const extraBox = header?.querySelector('.leaf-card__extra')?.getBoundingClientRect();
      const bodyBox = body?.getBoundingClientRect();
      const footerBox = footer?.getBoundingClientRect();
      return {
        bodyContentLeft:
          (bodyBox?.left ?? 0) + Number.parseFloat(bodyStyle?.paddingInlineStart ?? '0'),
        bodyPaddingTop: bodyStyle?.paddingBlockStart,
        borderWidth: Number.parseFloat(getComputedStyle(node).borderInlineStartWidth),
        cardBox: cardBox.toJSON(),
        cardRadius: Number.parseFloat(getComputedStyle(node).borderStartStartRadius),
        cardShadow: getComputedStyle(node).boxShadow,
        footerBottom: footerBox?.bottom,
        footerTop: footerBox?.top,
        headerBottom: headerBox?.bottom,
        headingLeft: headingBox?.left,
        extraRight: extraBox?.right,
        panelBorderWidth: Number.parseFloat(panelStyle?.borderInlineStartWidth ?? '0'),
        panelBottom: panelBox?.bottom,
        panelBox: panelBox?.toJSON(),
        panelLeft: panelBox?.left,
        panelRadius: panelStyle?.borderStartStartRadius,
        panelRight: panelBox?.right,
        panelShadow: panel ? getComputedStyle(panel, '::before').boxShadow : undefined,
        shadowClip: panel ? getComputedStyle(panel, '::before').clipPath : undefined,
        panelTop: panelBox?.top,
        scrollOverflow: node.scrollWidth - node.clientWidth,
      };
    });
    const inset = 4 + metrics.borderWidth;
    expect(metrics.panelLeft).toBeCloseTo((metrics.cardBox?.x ?? 0) + inset, 1);
    expect(metrics.panelRight).toBeCloseTo(
      (metrics.cardBox?.x ?? 0) + (metrics.cardBox?.width ?? 0) - inset,
      1,
    );
    expect(metrics.panelTop).toBeCloseTo(metrics.headerBottom ?? 0, 1);
    expect(metrics.panelRadius).toBe('9px');
    expect(Number.parseFloat(metrics.panelRadius ?? '0')).toBeLessThan(metrics.cardRadius);
    expect(metrics.panelBorderWidth).toBe(1);
    expect(metrics.cardShadow).toBe('none');
    expect(metrics.panelShadow).toContain('0px 1px 2px');
    expect(metrics.panelShadow).toContain('0px 2px 6px');
    expect(metrics.shadowClip).toBe('inset(0px -6px -6px)');
    expect(metrics.bodyPaddingTop).toBe('15px');
    expect(metrics.headingLeft).toBeCloseTo(metrics.bodyContentLeft - 5, 1);
    expect(metrics.extraRight).toBeCloseTo(metrics.panelRight ?? 0, 1);
    expect(metrics.footerTop).toBeGreaterThan(metrics.panelBottom ?? 0);
    expect(metrics.footerBottom).toBeLessThan(metrics.cardBox.y + metrics.cardBox.height);
    expect(metrics.scrollOverflow).toBeLessThanOrEqual(1);
    await expect(card.getByRole('heading')).toHaveCSS('font-size', '12px');
    await expect(card.getByRole('heading')).toHaveCSS('font-weight', '500');
    const muted = await tokenColor(card, '--leaf-color-text-muted');
    expect(
      new TinyColor(
        await card.getByRole('heading').evaluate((node) => getComputedStyle(node).color),
      ).toRgb(),
    ).toMatchObject({ r: muted[0], g: muted[1], b: muted[2] });
    await expect(card.locator('.leaf-card__description')).toHaveCount(0);
    await expect(panel.locator('.leaf-card__footer')).toHaveCount(0);
    await expect(card.locator(':scope > .leaf-card__header')).toHaveCSS('padding-top', '8px');
    await expect(card.locator(':scope > .leaf-card__header')).toHaveCSS('padding-bottom', '4px');
    await expect(card.locator(':scope > .leaf-card__footer')).toHaveCSS('padding-top', '0px');
    await expect(card.locator(':scope > .leaf-card__footer')).toHaveCSS('padding-bottom', '4px');

    const tabbed = page.getByTestId('layered-tabbed-card');
    const taggedHeader = await card.locator(':scope > .leaf-card__header').boundingBox();
    const plainHeader = await tabbed.locator(':scope > .leaf-card__header').boundingBox();
    const tag = await card.locator('.leaf-tag').boundingBox();
    expect(taggedHeader?.height).toBe(plainHeader?.height);
    expect(taggedHeader?.height).toBe((tag?.height ?? 0) + 8 + 4);
    await expect(tabbed.locator(':scope > .leaf-card__panel > .leaf-card__tabs')).toHaveCount(1);
    await expect(tabbed.getByRole('tabpanel')).toHaveText('Latest visit summary');
    await expect(tabbed.getByRole('tabpanel')).toHaveCSS('padding-left', '15px');

    await card.screenshot({
      path: test.info().outputPath(`card-layered-${appearance}-${testInfo.project.name}.png`),
    });
  });
}

for (const appearance of ['light', 'dark']) {
  test(`card frames use a softer neutral than dividers in ${appearance}`, async ({ page }) => {
    await page.goto(`/?fixture=card&theme=${appearance}`);
    const colors = await page.getByTestId('titled-card').evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        border: style.borderTopColor,
        divider: style.getPropertyValue('--leaf-color-divider').trim(),
        surface: style.backgroundColor,
      };
    });
    const channels = (color: string) => {
      const srgb = color.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)\)$/);
      if (srgb) return srgb.slice(1).map((value) => Number(value) * 255);
      const parsed = new TinyColor(color);
      if (!parsed.isValid) throw new Error(`Unsupported color: ${color}`);
      const { r, g, b } = parsed.toRgb();
      return [r, g, b];
    };
    const distance = (left: string, right: string) => {
      const a = channels(left);
      const b = channels(right);
      return Math.hypot(
        (a[0] ?? 0) - (b[0] ?? 0),
        (a[1] ?? 0) - (b[1] ?? 0),
        (a[2] ?? 0) - (b[2] ?? 0),
      );
    };
    const frameDistance = distance(colors.border, colors.surface);
    expect(frameDistance).toBeGreaterThan(0);
    expect(frameDistance).toBeLessThan(distance(colors.divider, colors.surface));
  });
}

test('embedded tabs handle real overflow, closing all pages and restoring a normal card', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/?fixture=card');
  const card = page.getByTestId('overflow-card');
  const list = card.locator('.leaf-tabs__list');
  const end = card.locator('.leaf-tabs__scroll-action--end');
  await expect(end).toHaveCount(1);
  await expect(end).toBeHidden();
  await card.locator('.leaf-tabs__header').hover();
  await expect(end).toBeVisible();
  const before = await list.evaluate((node) => Math.abs(node.scrollLeft));
  await end.click();
  await expect
    .poll(() => list.evaluate((node) => Math.abs(node.scrollLeft)), { timeout: 15_000 })
    .toBeGreaterThan(before);
  await card.getByRole('tab', { name: 'Draft 9', exact: true }).click();
  await expect(card.getByRole('tab', { name: 'Draft 9', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(card.getByRole('tabpanel')).toHaveText('Draft 9 content');
  const sampled = page.evaluate(async () => {
    const card = document.querySelector<HTMLElement>('[data-testid="overflow-card"]');
    if (!card) throw new Error('Missing card');
    const frames: number[] = [];
    const started = performance.now();
    while (performance.now() - started < 900) {
      frames.push(card.scrollWidth - card.clientWidth);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    return frames;
  });
  for (let i = 0; i < 9; i++) {
    await card
      .getByRole('button', { name: /^Close tab/ })
      .last()
      .click();
  }
  expect(Math.max(...(await sampled))).toBeLessThanOrEqual(1);
  await expect(card.getByRole('tablist')).toHaveCount(0);
  await expect(card.getByRole('heading', { name: 'Drafts' })).toBeVisible();
  await expect(card.getByText('Shared note')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.goto('/?fixture=card');
  await page.getByRole('button', { name: 'Toggle heading' }).click();
  await expect(card.locator('.leaf-card__header')).toHaveCount(0);
  await expect(end).toHaveCount(1);
  await card.locator('.leaf-tabs__header').hover();
  await expect(end).toBeVisible();
  await card.getByRole('tab', { name: 'Draft 9', exact: true }).click();
  await expect(card.getByRole('tabpanel')).toHaveText('Draft 9 content');
  const untitled = await geometry(card);
  expect(untitled.tabTop).toBeCloseTo(untitled.barTop, 1);
  expect(untitled.tabBottom).toBeCloseTo(untitled.barBottom - 1, 1);
  expect(untitled.overflow).toBeLessThanOrEqual(1);
});

for (const [label, size] of [
  ['small', 'sm'],
  ['large', 'lg'],
] as const) {
  test(`${label} cards, RTL and custom surfaces retain integrated insets and theme values`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=card&theme=dark&${label}&compact&rtl&overrides`);
    const card = page.getByTestId('titled-card');
    await expect(card.locator('.leaf-tabs')).toHaveClass(new RegExp(`leaf-tabs--${size}`));
    await expect(card.locator('.leaf-card__title')).toHaveCSS(
      'font-size',
      size === 'sm' ? '14px' : '18px',
    );
    await expect(card.locator('.leaf-tabs__header')).toHaveCSS(
      'background-color',
      'rgb(41, 41, 53)',
    );
    await expect(card.locator('.leaf-tabs__header')).toHaveCSS(
      'border-bottom-color',
      'rgb(136, 136, 153)',
    );
    await expect(card.locator('.leaf-card__header')).toHaveCSS('border-bottom-width', '0px');
    const primary = await card.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        brand: style.getPropertyValue('--leaf-color-primary').trim(),
        ink: style.getPropertyValue('--leaf-color-primary-ink').trim(),
      };
    });
    expect(new TinyColor(primary.brand).toRgbString()).toBe('rgb(124, 58, 237)');
    const text = await card.evaluate((node) => getComputedStyle(node).color);
    await expect(card.getByRole('tab', { name: 'Details' })).toHaveCSS('color', text);
    expect((await geometry(card)).bodyPadding).toEqual(['12px', '24px', '12px', '24px']);
    const customized = await geometry(card);
    expect(customized.tabLeft).toBeCloseTo(customized.bodyLeft, 1);
    await expectTabsFillHeading(page.getByTestId('untitled-card'));
    await card.getByRole('tab', { name: 'Details' }).press('ArrowLeft');
    await expect(card.getByRole('tab', { name: 'Members' })).toBeFocused();
  });
}

test('large cards derive their heading height and keep tab and child sizes independent', async ({
  page,
}) => {
  await page.goto('/?fixture=card&large');
  const card = page.getByTestId('titled-card');
  await expect(card.locator('.leaf-tabs')).toHaveClass(/leaf-tabs--lg/);
  await expect(card.getByRole('tab', { name: 'Details' })).toHaveCSS('min-height', '44px');
  expect((await geometry(card)).bodyPadding).toEqual(['24px', '24px', '24px', '24px']);
  await expect(card.locator('.leaf-card__header')).toHaveCSS('padding-top', '24px');
  await expect(card.locator('.leaf-card__title')).toHaveCSS('font-size', '18px');
  await expect(card.locator('.leaf-input')).toHaveCSS('height', '34px');
  await expect(card.getByRole('button', { name: 'Save settings' })).toHaveCSS('height', '34px');
  await expectTabsFillHeading(page.getByTestId('untitled-card'));
  await expect(page.getByTestId('untitled-card').getByRole('tab').first()).toHaveCSS(
    'min-height',
    '72px',
  );

  await page.goto('/?fixture=card&large&tabs-small');
  await expect(card.locator('.leaf-tabs')).toHaveClass(/leaf-tabs--sm/);
  expect((await geometry(card)).bodyPadding).toEqual(['24px', '24px', '24px', '24px']);
  await expect(card.getByRole('tab', { name: 'Details' })).toHaveCSS('min-height', '32px');
});

test('reordering loaded pages keeps original content when loading ends', async ({ page }) => {
  await page.goto('/?fixture=card');
  const card = page.getByTestId('sortable-card');
  await page.getByRole('button', { name: 'Toggle loading' }).click();
  await expect(card.getByRole('status', { name: 'Loading' })).toBeVisible();
  const handle = card.getByRole('button', { name: 'Reorder tab First' });
  await handle.focus();
  await handle.press('Space');
  await expect(card.locator('[data-dragging]')).toHaveCount(1);
  // The keyboard sensor registers its document listener after activation.
  await page.waitForTimeout(150);
  await handle.press('ArrowRight');
  await expect(card.locator('[data-dragging]')).toHaveAttribute('style', /translate3d\((?!0px)/);
  await expect(page.locator('[role="status"]').filter({ hasText: 'Move to Second' })).toBeVisible();
  await handle.press('Space');
  await expect(card.getByRole('tab')).toHaveText(['Second', 'First']);
  await page.getByRole('button', { name: 'Toggle loading' }).click();
  await expect(card.getByRole('tabpanel')).toHaveText('Original first content');
  await card.getByRole('tab', { name: 'Second' }).click();
  await expect(card.getByRole('tabpanel')).toHaveText('Original second content');
  await expect(card.getByRole('status', { name: 'Loading' })).toHaveCount(0);
});

for (const appearance of ['light', 'dark']) {
  for (const density of ['comfortable', 'compact']) {
    test(`standalone card titles match card typography in ${appearance} ${density}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 900 });
      await page.goto(
        `/?fixture=card&titles&theme=${appearance}${density === 'compact' ? '&compact=1' : ''}`,
      );
      const fixture = page.getByTestId('card-titles');
      await expect(fixture).toBeVisible();
      const typography = await fixture.evaluate((node) => {
        const properties = (heading: Element) => {
          const style = getComputedStyle(heading);
          return {
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            fontFamily: style.fontFamily,
            lineHeight: style.lineHeight,
            color: style.color,
            margin: style.margin,
            overflowWrap: style.overflowWrap,
          };
        };
        return ['sm', 'md', 'lg'].map((size) => {
          const pair = node.querySelector(`[data-testid="title-pair-${size}"]`);
          const standalone = pair?.querySelector('[data-testid="standalone-title"]');
          const embedded = pair?.querySelector('.leaf-card__title');
          if (!standalone || !embedded) throw new Error(`Missing ${size} title pair`);
          return {
            standalone: properties(standalone),
            embedded: properties(embedded),
            standaloneTag: standalone.tagName,
            embeddedTag: embedded.tagName,
            outsideCard: standalone.closest('.leaf-card') === null,
          };
        });
      });
      const sizes = [
        { fontSize: '14px', lineHeight: '20px' },
        { fontSize: '16px', lineHeight: '22px' },
        { fontSize: '18px', lineHeight: '24px' },
      ];
      for (const [index, pair] of typography.entries()) {
        expect(pair.standalone).toEqual(pair.embedded);
        expect(pair.standalone.fontSize).toBe(sizes[index]?.fontSize);
        expect(pair.standalone.lineHeight).toBe(sizes[index]?.lineHeight);
        expect(pair.standalone.fontWeight).toBe(index === 2 ? '700' : '500');
        expect(pair.standalone.margin).toBe('0px');
        expect(pair.standalone.overflowWrap).toBe('anywhere');
        expect(pair.standaloneTag).toBe('H3');
        expect(pair.embeddedTag).toBe('H3');
        expect(pair.outsideCard).toBe(true);
      }
      const semantic = fixture.getByRole('heading', { level: 2, name: 'Small section heading' });
      await expect(semantic).toHaveCSS('font-size', '14px');
      await expect(semantic).toHaveAttribute('title', 'Native heading hint');
      const richTitle = fixture.getByTestId('rich-title');
      await expect(richTitle).toHaveJSProperty('tagName', 'H3');
      const mutedText = await fixture.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-color-text-muted').trim(),
      );
      await expect(fixture.getByText('Supporting details stay beneath the heading.')).toHaveCSS(
        'color',
        new TinyColor(mutedText).toRgbString(),
      );
      const titleGroup = richTitle.locator('..').locator('..');
      await expect(titleGroup).toHaveClass(/leaf-card-title-group/);
      await expect(titleGroup.locator('.leaf-card-title-group__extra')).toContainText('Manage');
      await expect(fixture.getByTestId('regional-title')).toHaveJSProperty('tagName', 'H4');
      await expect(fixture.getByTestId('regional-title')).toHaveCSS('font-size', '18px');
      const isolated = fixture.getByTestId('regional-card').getByRole('heading');
      await expect(isolated).toHaveJSProperty('tagName', 'H3');
      await expect(isolated).toHaveCSS('font-size', '14px');

      for (const [standaloneId, cardId, weight] of [
        ['custom-title', 'custom-card', '700'],
        ['local-title', 'local-card', '400'],
      ] as const) {
        const standalone = fixture.getByTestId(standaloneId);
        const embedded = fixture.getByTestId(cardId).getByRole('heading');
        for (const heading of [standalone, embedded]) {
          await expect(heading).toHaveCSS('font-size', '22px');
          await expect(heading).toHaveCSS('font-family', 'monospace');
          await expect(heading).toHaveCSS('font-weight', weight);
          await expect(heading).toHaveCSS(
            'color',
            appearance === 'dark' ? 'rgb(215, 231, 255)' : 'rgb(18, 52, 86)',
          );
        }
      }
      const longTitles = await fixture.getByTestId('long-title-container').evaluate((node) =>
        Array.from(node.querySelectorAll<HTMLElement>('.leaf-card-title')).map((title) => ({
          overflow: title.scrollWidth - title.clientWidth,
          lines: title.clientHeight / Number.parseFloat(getComputedStyle(title).lineHeight),
        })),
      );
      expect(longTitles).toHaveLength(2);
      for (const title of longTitles) {
        expect(title.overflow).toBeLessThanOrEqual(1);
        expect(title.lines).toBeGreaterThan(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
}
