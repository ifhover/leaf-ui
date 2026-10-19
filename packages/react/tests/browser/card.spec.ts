import { TinyColor } from '@ctrl/tinycolor';
import { expect, type Locator, test } from '@playwright/test';
import axe from 'axe-core';

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

for (const appearance of ['light', 'dark']) {
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
    await expect(titled.locator('.leaf-card__footer')).toHaveCSS('padding-top', '12px');
    await expect(titled.locator('.leaf-card__footer')).toHaveCSS('padding-bottom', '12px');
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
      path: `.quality/card-tabs-${appearance}-${testInfo.project.name}.png`,
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
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(
      async () =>
        (await (window as unknown as { axe: typeof axe }).axe.run('[data-testid="titled-card"]'))
          .violations,
    );
    expect(violations).toEqual([]);
  });
}

test('embedded tabs handle real overflow, closing all pages and restoring a normal card', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/?fixture=card');
  const card = page.getByTestId('overflow-card');
  await expect(card.getByRole('button', { name: 'More tabs', exact: true })).toBeVisible();
  await card.getByRole('button', { name: 'More tabs', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Draft 9', exact: true }).click();
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
  await expect(card.getByRole('button', { name: 'More tabs', exact: true })).toBeVisible();
  await card.getByRole('button', { name: 'More tabs', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Draft 9', exact: true }).click();
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
      size === 'sm' ? '14px' : '16px',
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
    await expect(card.getByRole('tab', { name: 'Details' })).toHaveCSS(
      'color',
      new TinyColor(primary.ink).toRgbString(),
    );
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
  await expect(card.getByRole('tab', { name: 'Details' })).toHaveCSS('min-height', '42px');
  expect((await geometry(card)).bodyPadding).toEqual(['24px', '24px', '24px', '24px']);
  await expect(card.locator('.leaf-card__header')).toHaveCSS('padding-top', '20px');
  await expect(card.locator('.leaf-card__title')).toHaveCSS('font-size', '16px');
  await expect(card.locator('.leaf-input')).toHaveCSS('height', '36px');
  await expect(card.getByRole('button', { name: 'Save settings' })).toHaveCSS('height', '36px');
  await expectTabsFillHeading(page.getByTestId('untitled-card'));
  await expect(page.getByTestId('untitled-card').getByRole('tab').first()).toHaveCSS(
    'min-height',
    '64px',
  );

  await page.goto('/?fixture=card&large&tabs-small');
  await expect(card.locator('.leaf-tabs')).toHaveClass(/leaf-tabs--sm/);
  expect((await geometry(card)).bodyPadding).toEqual(['24px', '24px', '24px', '24px']);
  await expect(card.getByRole('tab', { name: 'Details' })).toHaveCSS('min-height', '30px');
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
  await handle.press('Space');
  await expect(card.getByRole('tab')).toHaveText(['Second', 'First']);
  await page.getByRole('button', { name: 'Toggle loading' }).click();
  await expect(card.getByRole('tabpanel')).toHaveText('Original first content');
  await card.getByRole('tab', { name: 'Second' }).click();
  await expect(card.getByRole('tabpanel')).toHaveText('Original second content');
  await expect(card.getByRole('status', { name: 'Loading' })).toHaveCount(0);
});
