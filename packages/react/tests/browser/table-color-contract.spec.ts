import { expect, type Locator, type Page, test } from '@playwright/test';

type Rgba = [number, number, number, number];

function parseColor(value: string): Rgba {
  const color = value.trim();
  const hex = color.match(/^#([\da-f]{6})$/i);
  const digits = hex?.[1];
  if (digits) {
    const channel = Number.parseInt(digits, 16);
    return [(channel >> 16) & 255, (channel >> 8) & 255, channel & 255, 1];
  }
  const srgb = color.match(
    /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/i,
  );
  if (srgb) {
    return [
      Number(srgb[1]) * 255,
      Number(srgb[2]) * 255,
      Number(srgb[3]) * 255,
      srgb[4] === undefined ? 1 : Number(srgb[4]),
    ];
  }
  const rgb = color.match(
    /^rgba?\(\s*([\d.]+)(?:,\s*|\s+)([\d.]+)(?:,\s*|\s+)([\d.]+)(?:\s*(?:,|\/)\s*([\d.]+))?\s*\)$/i,
  );
  if (rgb) {
    return [
      Number(rgb[1]),
      Number(rgb[2]),
      Number(rgb[3]),
      rgb[4] === undefined ? 1 : Number(rgb[4]),
    ];
  }
  throw new Error(`Unsupported color: ${value}`);
}

function mix(foreground: Rgba, background: Rgba, weight: number): Rgba {
  const alpha = foreground[3] * weight + background[3] * (1 - weight);
  if (alpha === 0) return [0, 0, 0, 0];
  return [
    (foreground[0] * foreground[3] * weight + background[0] * background[3] * (1 - weight)) / alpha,
    (foreground[1] * foreground[3] * weight + background[1] * background[3] * (1 - weight)) / alpha,
    (foreground[2] * foreground[3] * weight + background[2] * background[3] * (1 - weight)) / alpha,
    alpha,
  ];
}

function withAlpha(color: Rgba, alpha: number): Rgba {
  return [color[0], color[1], color[2], alpha];
}

function colorDistance(left: Rgba, right: Rgba) {
  return Math.max(
    Math.abs(left[0] - right[0]),
    Math.abs(left[1] - right[1]),
    Math.abs(left[2] - right[2]),
    Math.abs(left[3] - right[3]) * 255,
  );
}

async function cssValue(locator: Locator, property: string) {
  return locator.evaluate((node, name) => getComputedStyle(node).getPropertyValue(name), property);
}

async function resolveColor(locator: Locator, expression: string) {
  return locator.evaluate((node, value) => {
    const probe = document.createElement('span');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.color = value;
    node.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, expression);
}

async function expectColor(
  locator: Locator,
  expected: Rgba,
  property: 'background-color' | 'color' = 'background-color',
) {
  await expect
    .poll(async () => colorDistance(parseColor(await cssValue(locator, property)), expected))
    .toBeLessThanOrEqual(1.5);
}

function table(page: Page, name: string) {
  return page.getByRole('table', { name, exact: true, includeHidden: true });
}

function tableRoot(tableLocator: Locator) {
  return tableLocator.locator(
    'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " leaf-table ")][1]',
  );
}

async function expectLayeredHeader(tableLocator: Locator) {
  const root = tableRoot(tableLocator);
  const header = tableLocator.locator('thead th').last();
  const canvas = parseColor(
    await resolveColor(
      root,
      'var(--leaf-component-table-background, var(--leaf-color-surface-muted))',
    ),
  );
  await expectColor(root, canvas);
  await expectColor(header, canvas);
  await expectColor(
    header,
    parseColor(
      await resolveColor(root, 'var(--leaf-component-table-color, var(--leaf-color-text-muted))'),
    ),
    'color',
  );
}

function bodyRow(tableLocator: Locator, rowId: string) {
  return tableLocator.locator(`tbody tr[data-row-id="${rowId}"]`);
}

function rowCell(tableLocator: Locator, rowId: string) {
  return bodyRow(tableLocator, rowId).locator('td').last();
}

function pinShadowColor(image: string) {
  const match = image.match(/(?:rgba?|color)\([^)]*\)/);
  if (!match) throw new Error(`Missing pin shadow color: ${image}`);
  return parseColor(match[0]);
}

async function load(page: Page, appearance: 'light' | 'dark') {
  await page.goto(`/?fixture=table-color-contract&theme=${appearance}`);
  await expect(page.getByRole('heading', { name: 'Table color contract' })).toBeVisible();
}

for (const appearance of ['light', 'dark'] as const) {
  test.describe(appearance, () => {
    test.beforeEach(async ({ page }) => {
      await load(page, appearance);
    });

    test('default recipe keeps surface, text, hover, selected, loading and pin colors', async ({
      page,
    }) => {
      const defaultTable = table(page, 'Default table color contract');
      const defaultRoot = tableRoot(defaultTable);
      const primary = parseColor(await resolveColor(defaultRoot, 'var(--leaf-color-primary)'));
      const primarySoft = parseColor(
        await resolveColor(defaultRoot, 'var(--leaf-color-primary-soft)'),
      );
      const surface = parseColor(await resolveColor(defaultRoot, 'var(--leaf-table-surface)'));
      const text = parseColor(await cssValue(defaultRoot, 'color'));
      await expectLayeredHeader(defaultTable);
      await expectColor(rowCell(defaultTable, 'alpha'), surface);
      await expectColor(rowCell(defaultTable, 'bravo'), mix(text, surface, 0.02));

      await defaultTable.getByRole('checkbox', { name: /Select row: alpha/i }).check();
      const selected = defaultTable.locator('tbody tr[data-selected]');
      await expect(selected).toHaveCount(1);
      const selectedCell = selected.locator('td').last();
      await expectColor(selectedCell, primarySoft);
      await selectedCell.hover();
      await expectColor(selectedCell, primarySoft);

      await rowCell(defaultTable, 'charlie').hover();
      await expectColor(rowCell(defaultTable, 'charlie'), mix(primary, surface, 0.03));

      const loadingTable = table(page, 'Default loading table color contract');
      const loadingRoot = tableRoot(loadingTable);
      const loadingSurface = parseColor(
        await resolveColor(loadingRoot, 'var(--leaf-table-surface)'),
      );
      await expectColor(
        loadingRoot.locator('.leaf-table__overlay'),
        withAlpha(loadingSurface, 0.8),
      );

      const compatibilityTable = table(page, 'Compatibility loading table color contract');
      const compatibilityRoot = tableRoot(compatibilityTable);
      await expectColor(
        compatibilityRoot.locator('.leaf-table__overlay'),
        parseColor('rgb(12 34 56 / 0.4)'),
      );

      const pinnedTable = table(page, 'Pinned table color contract');
      const pinnedViewport = pinnedTable.locator(
        'xpath=ancestor::*[contains(@class, "leaf-table__viewport")][1]',
      );
      await pinnedTable.scrollIntoViewIfNeeded();
      await pinnedViewport.evaluate((node) => {
        node.scrollLeft = (node.scrollWidth - node.clientWidth) / 2;
      });
      await expect
        .poll(async () => {
          const image = await pinnedTable
            .locator('tbody td[data-pinned="start"][data-pin-edge]')
            .first()
            .evaluate((node) => getComputedStyle(node, '::after').backgroundImage);
          // Wait for the scroll-edge observer before parsing the painted gradient.
          return image === 'none'
            ? Number.POSITIVE_INFINITY
            : colorDistance(pinShadowColor(image), [0, 0, 0, 0.045]);
        })
        .toBeLessThanOrEqual(1.5);

      const actionTable = table(page, 'Default action table color contract');
      const actionRoot = tableRoot(actionTable);
      const optionHover = parseColor(
        await resolveColor(actionRoot, 'var(--leaf-color-option-hover)'),
      );
      const dragHandle = actionTable.getByRole('button', {
        name: 'Reorder row: Alpha',
        exact: true,
      });
      await dragHandle.hover();
      await expectColor(dragHandle, optionHover);
      const expand = actionTable.getByRole('button', { name: 'Expand row: Alpha', exact: true });
      await expand.hover();
      await expectColor(expand, withAlpha(optionHover, 0.5));
      await expand.click();
      await expect(actionTable.locator('[data-detail-row="alpha"]')).toBeVisible();
    });

    test('primarySoftColor overrides selection while small actions remain neutral and isolated', async ({
      page,
    }) => {
      const explicitTable = table(page, 'Explicit primarySoft table color contract');
      const explicitRoot = tableRoot(explicitTable);
      const primarySoft = parseColor('#ff2d95');
      const explicitOptionHover = parseColor(
        await resolveColor(explicitRoot, 'var(--leaf-color-option-hover)'),
      );
      await explicitTable.getByRole('checkbox', { name: /Select row: alpha/i }).check();
      await expectColor(explicitTable.locator('tbody tr[data-selected] td').last(), primarySoft);
      expect(colorDistance(explicitOptionHover, primarySoft)).toBeGreaterThan(20);

      const dragHandle = explicitTable.getByRole('button', {
        name: 'Reorder row: Alpha',
        exact: true,
      });
      await dragHandle.hover();
      await expectColor(dragHandle, explicitOptionHover);
      const expand = explicitTable.getByRole('button', { name: 'Expand row: Alpha', exact: true });
      await expand.hover();
      await expectColor(expand, withAlpha(explicitOptionHover, 0.5));

      const defaultAction = table(page, 'Default action table color contract');
      const defaultRoot = tableRoot(defaultAction);
      const defaultOptionHover = parseColor(
        await resolveColor(defaultRoot, 'var(--leaf-color-option-hover)'),
      );
      expect(colorDistance(defaultOptionHover, explicitOptionHover)).toBeLessThanOrEqual(1.5);
      const defaultDrag = defaultAction.getByRole('button', {
        name: 'Reorder row: Alpha',
        exact: true,
      });
      await defaultDrag.hover();
      await expectColor(defaultDrag, defaultOptionHover);
    });

    test('local theme and custom table surface stay isolated from outer tables', async ({
      page,
    }) => {
      const before = table(page, 'Outer table before local theme');
      const beforeRoot = tableRoot(before);
      const rootPrimary = parseColor(await resolveColor(beforeRoot, 'var(--leaf-color-primary)'));

      const local = table(page, 'Local theme table color contract');
      const localRoot = tableRoot(local);
      const localPrimary = parseColor(await resolveColor(localRoot, 'var(--leaf-color-primary)'));
      const localSurface = parseColor(await resolveColor(localRoot, 'var(--leaf-table-surface)'));
      const localText = parseColor(await cssValue(localRoot, 'color'));
      expect(colorDistance(localPrimary, rootPrimary)).toBeGreaterThan(20);

      for (const current of [before, table(page, 'Outer table after local theme')]) {
        const root = tableRoot(current);
        const primary = parseColor(await resolveColor(root, 'var(--leaf-color-primary)'));
        const surface = parseColor(await resolveColor(root, 'var(--leaf-table-surface)'));
        const text = parseColor(await cssValue(root, 'color'));
        await expectLayeredHeader(current);
        await expectColor(rowCell(current, 'alpha'), surface);
        await expectColor(rowCell(current, 'bravo'), mix(text, surface, 0.02));
        await rowCell(current, 'charlie').hover();
        await expectColor(rowCell(current, 'charlie'), mix(primary, surface, 0.03));
      }

      await expectLayeredHeader(local);
      await expectColor(rowCell(local, 'alpha'), localSurface);
      await expectColor(rowCell(local, 'bravo'), mix(localText, localSurface, 0.02));
      await local.getByRole('checkbox', { name: /Select row: alpha/i }).check();
      await expectColor(
        local.locator('tbody tr[data-selected] td').last(),
        parseColor(await resolveColor(localRoot, 'var(--leaf-color-primary-soft)')),
      );
      await rowCell(local, 'charlie').hover();
      await expectColor(rowCell(local, 'charlie'), mix(localPrimary, localSurface, 0.03));

      const custom = table(page, 'Custom surface table color contract');
      const customRoot = tableRoot(custom);
      const customSurface = parseColor(await resolveColor(customRoot, 'var(--leaf-table-surface)'));
      const customText = parseColor(await cssValue(customRoot, 'color'));
      expect(colorDistance(customSurface, parseColor('#fafafa'))).toBeLessThanOrEqual(1);
      expect(colorDistance(customText, parseColor('#333333'))).toBeLessThanOrEqual(1);
      await expectLayeredHeader(custom);
      await expectColor(rowCell(custom, 'alpha'), customSurface);
      await expectColor(rowCell(custom, 'bravo'), mix(customText, customSurface, 0.02));
      await rowCell(custom, 'charlie').hover();
      await expectColor(rowCell(custom, 'charlie'), mix(localPrimary, customSurface, 0.03));
    });
  });
}
