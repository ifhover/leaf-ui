import { readability, TinyColor } from '@ctrl/tinycolor';
import { expect as baseExpect, type Locator, test } from '@playwright/test';

// Windows WebKit may deliver a computed-color evaluation after a delayed frame.
const expect = baseExpect.configure({ timeout: 20_000 });
test.setTimeout(120_000);

const tones = ['primary', 'success', 'warning', 'danger', 'info'] as const;
const semanticShadeSteps = [
  'light-3',
  'light-7',
  'light-9',
  'dark-1',
  'dark-3',
  'dark-7',
  'dark-9',
] as const;
const neutralScaleSteps = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const semanticShadeKeys = tones.flatMap((family) =>
  semanticShadeSteps.map((step) => `--leaf-color-${family}-${step}`),
);
const neutralScaleKeys = neutralScaleSteps.map((step) => `--leaf-color-neutral-${step}`);
const removedSemanticScaleKeys = tones.flatMap((family) =>
  neutralScaleSteps.map((step) => `--leaf-color-${family}-${step}`),
);
const neutralRoles = [
  'text',
  'text-muted',
  'surface',
  'surface-muted',
  'surface-raised',
  'border',
  'border-hover',
  'divider',
  'option-hover',
] as const;

test('JS configuration updates bases and all explicit foregrounds; black outline press stays visible', async ({
  page,
}) => {
  await page.goto('/?fixture=semantic-color-contract');
  const scope = page.getByTestId('js-color-config');
  const outline = page.getByTestId('black-outline');
  await outline.hover();
  const hoverBorder = new TinyColor(
    await outline.evaluate((node) =>
      getComputedStyle(node).getPropertyValue('--leaf-color-border-hover'),
    ),
  ).toRgbString();
  await expect(outline).toHaveCSS('border-top-color', hoverBorder);
  await page.mouse.down();
  const border = await outline.evaluate((node) => {
    const style = getComputedStyle(node);
    return { border: style.borderTopColor, surface: style.backgroundColor };
  });
  expect(border.border).toBe(hoverBorder);
  const text = await outline.evaluate((node) => getComputedStyle(node).color);
  expect(readability(text, border.surface)).toBeGreaterThanOrEqual(4.5);
  await page.mouse.up();
  await page.getByTestId('change-js-colors').click();
  await expect(page.getByTestId('js-solid-button')).toHaveCSS(
    'background-color',
    'rgb(255, 105, 0)',
  );
  expect(await scope.evaluate((node) => node.style.getPropertyValue('--leaf-color-neutral'))).toBe(
    '#64748b',
  );
  const samples = ['js-solid-button'];
  for (const id of [...tones.map((tone) => `js-solid-${tone}`), 'js-custom-tag'])
    await expectOutline(page.getByTestId(id));
  for (const id of samples)
    await expect(page.getByTestId(id)).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page.getByTestId('change-js-foreground').click();
  for (const id of samples) await expect(page.getByTestId(id)).toHaveCSS('color', 'rgb(0, 0, 0)');
  await expect(page.getByTestId('js-custom-badge').locator('.leaf-badge__indicator')).toHaveCSS(
    'color',
    'rgb(0, 0, 0)',
  );
});

test('dark solid selections pair the original fill with its own foreground', async ({ page }) => {
  await page.goto('/?fixture=semantic-color-contract');
  const scope = page.getByTestId('solid-selection-theme');
  const indicator = new TinyColor(
    await scope.evaluate((node) =>
      getComputedStyle(node).getPropertyValue('--leaf-color-primary-indicator').trim(),
    ),
  ).toRgbString();
  const radio = scope.locator('.leaf-radio__input');
  await expect(radio).toHaveCSS('background-color', 'rgb(24, 24, 27)');
  await expect(radio).toHaveCSS('border-top-color', indicator);
  await expect(scope.locator('.leaf-radio__mark')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  const thumb = scope.locator('.leaf-switch__thumb');
  await expect(thumb).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(thumb).toHaveCSS('color', 'rgb(24, 24, 27)');
  await expect(scope.locator('.leaf-switch__spinner')).toBeVisible();
  const finishedStep = scope.locator('[data-status="finish"] .leaf-steps__icon');
  const calendarDay = scope.locator(
    '.leaf-calendar-view__cell[aria-selected="true"] .leaf-calendar-view__number',
  );
  for (const label of [finishedStep, calendarDay]) {
    await expect(label).toHaveCSS('background-color', 'rgb(24, 24, 27)');
    await expect(label).toHaveCSS('color', 'rgb(255, 255, 255)');
    const colors = await paint(label);
    expect(readability(colors.foreground, colors.background)).toBeGreaterThanOrEqual(4.5);
  }
  await expect(finishedStep).toHaveCSS('border-top-color', indicator);
  await expect(calendarDay).not.toHaveCSS('box-shadow', 'none');
  const tag = page.getByTestId('dark-custom-solid-tag');
  await tag.locator('.leaf-tag__close').hover();
  const closeBackground = await tag.locator('.leaf-tag__close').evaluate((node) => {
    const canvas = document.createElement('canvas').getContext('2d');
    if (!canvas) throw new Error('Missing canvas');
    canvas.fillStyle = getComputedStyle(node.parentElement as HTMLElement).backgroundColor;
    canvas.fillRect(0, 0, 1, 1);
    canvas.fillStyle = getComputedStyle(node).backgroundColor;
    canvas.fillRect(0, 0, 1, 1);
    return `rgb(${[...canvas.getImageData(0, 0, 1, 1).data].slice(0, 3).join(',')})`;
  });
  expect(readability((await paint(tag)).foreground, closeBackground)).toBeGreaterThanOrEqual(4.5);
  await scope.getByRole('combobox', { name: 'Dark solid date picker' }).click();
  const selectedDate = page.locator('.leaf-date-picker__panel .leaf-date-picker__day--selected');
  await expect(selectedDate).toHaveCSS('background-color', 'rgb(24, 24, 27)');
  await expect(selectedDate).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(selectedDate).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await expect(selectedDate).toHaveCSS('box-shadow', /inset/);
});

test('solid buttons do not add contrast borders for white bases in either appearance', async ({
  page,
}) => {
  await page.goto('/?fixture=semantic-color-contract');
  for (const appearance of ['light', 'dark']) {
    for (const kind of ['button', 'danger', 'disabled', 'loading']) {
      const button = page.getByTestId(`white-${appearance}-${kind}`);
      await expect(button).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
      if (kind === 'disabled' || kind === 'loading') continue;
      await expect(button).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
      await button.hover();
      await expect(button).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
      await page.mouse.down();
      await expect(button).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
      await page.mouse.up();
    }
  }
  await expect(page.getByTestId('js-solid-button')).toHaveCSS(
    'border-top-color',
    'rgba(0, 0, 0, 0)',
  );
});

async function paint(locator: Locator) {
  return locator.evaluate((node) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Missing canvas context');
    const normalize = (value: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const [r = 0, g = 0, b = 0, a = 255] = context.getImageData(0, 0, 1, 1).data;
      return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    };
    const style = getComputedStyle(node);
    return {
      foreground: normalize(style.color),
      background: normalize(style.backgroundColor),
    };
  });
}

async function semanticTokens(scope: Locator) {
  return scope.evaluate(
    (node, names) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Missing canvas context');
      const normalize = (value: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        const [r = 0, g = 0, b = 0, a = 255] = context.getImageData(0, 0, 1, 1).data;
        return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      };
      const probe = document.createElement('span');
      probe.hidden = true;
      node.append(probe);
      const result: Record<string, string> = {};
      for (const name of names) {
        probe.style.color = `var(${name})`;
        result[name] = normalize(getComputedStyle(probe).color);
      }
      probe.remove();
      return result;
    },
    [
      ...tones.flatMap((tone) => [
        `--leaf-color-${tone}`,
        `--leaf-color-${tone}-ink`,
        `--leaf-color-${tone}-soft`,
        `--leaf-color-${tone}-border`,
        `--leaf-color-on-${tone}`,
        `--leaf-color-${tone}-indicator`,
      ]),
      ...semanticShadeKeys,
      ...neutralScaleKeys,
      ...neutralRoles.map((role) => `--leaf-color-${role}`),
    ],
  );
}

async function rawTokens(scope: Locator) {
  return scope.evaluate(
    (node, names) => {
      const style = getComputedStyle(node);
      return Object.fromEntries(
        names.map((name) => [name, style.getPropertyValue(name).trim()]),
      ) as Record<string, string>;
    },
    [
      ...tones.flatMap((tone) => [
        `--leaf-color-${tone}`,
        `--leaf-color-${tone}-soft`,
        `--leaf-color-${tone}-soft-hover`,
        `--leaf-color-${tone}-soft-active`,
        `--leaf-color-${tone}-border`,
        `--leaf-color-${tone}-ink`,
      ]),
      ...semanticShadeKeys,
      ...neutralScaleKeys,
      ...removedSemanticScaleKeys,
    ],
  );
}

function accessibleCandidate(
  tokens: Record<string, string>,
  original: string,
  preferredShades: readonly (typeof semanticShadeSteps)[number][],
  minimum: number,
  backgrounds: string[],
) {
  const candidates = [
    original,
    ...preferredShades.map((step) => tokens[`--leaf-color-primary-${step}`] ?? ''),
    'rgba(0, 0, 0, 1)',
    'rgba(255, 255, 255, 1)',
  ];
  return candidates.find((candidate) =>
    backgrounds.every((background) => readability(candidate, background) >= minimum),
  );
}

for (const theme of ['light', 'dark'] as const) {
  test(`${theme} HWB inputs remain expressions with fixed white solid labels`, async ({ page }) => {
    await page.goto(`/?fixture=semantic-color-contract&theme=${theme}`);
    const scope = page.getByTestId('hwb-theme');
    await expect
      .poll(() =>
        scope.evaluate((node) =>
          getComputedStyle(node).getPropertyValue('--leaf-color-primary-light-3').trim(),
        ),
      )
      .toMatch(/^color-mix\(in srgb, hwb\(146 12% 21%\) 70%, #ffffff\)$/i);
    const tokens = await semanticTokens(scope);
    await expect
      .poll(() => paint(page.getByTestId('hwb-themed-tag')))
      .toEqual({
        background: tokens['--leaf-color-primary-soft'],
        foreground: tokens['--leaf-color-primary-ink'],
      });
    await expectOutline(page.getByTestId('hwb-custom-tag'));
    for (const label of [page.getByTestId('hwb-custom-badge').locator('.leaf-badge__indicator')]) {
      await expect
        .poll(() => paint(label))
        .toEqual({
          background: tokens['--leaf-color-primary'],
          foreground: tokens['--leaf-color-on-primary'],
        });
      await expect(label).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
  });
  test(`${theme} concrete soft status inks meet AA while solid labels stay white`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=semantic-color-contract&theme=${theme}`);
    for (const name of ['default', 'custom'] as const) {
      const section = page.getByRole('region', { name: `${name} semantic samples` });
      for (const tone of tones) {
        for (const variant of ['soft'] as const) {
          const tag = page.getByTestId(`${name}-${variant}-${tone}`);
          await expect
            .poll(async () => {
              const colors = await paint(tag);
              return readability(colors.foreground, colors.background);
            })
            .toBeGreaterThanOrEqual(4.5);
        }
      }
      const tokens = await semanticTokens(section);
      for (const tone of tones) {
        for (const background of [
          tokens['--leaf-color-surface'],
          tokens['--leaf-color-surface-muted'],
          tokens[`--leaf-color-${tone}-soft`],
        ].filter((value): value is string => Boolean(value)))
          expect(
            readability(tokens[`--leaf-color-${tone}-ink`] ?? '', background),
            `${theme} ${name} ${tone} ink`,
          ).toBeGreaterThanOrEqual(4.5);
        expect(tokens[`--leaf-color-on-${tone}`]).toBe('rgba(255, 255, 255, 1)');
      }
    }
  });

  test(`${theme} appearance switches keep seeds, semantic shades and neutral scale while roles adapt`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=semantic-color-contract&theme=${theme}`);
    const scope = page.getByTestId('mode-switch-scope');
    const lightRaw = await rawTokens(scope);
    const light = await semanticTokens(scope);
    expect(semanticShadeKeys).toHaveLength(35);
    expect(neutralScaleKeys).toHaveLength(9);
    for (const key of [...semanticShadeKeys, ...neutralScaleKeys])
      expect(lightRaw[key], key).toBeTruthy();
    for (const key of removedSemanticScaleKeys) expect(lightRaw[key], key).toBe('');
    for (const tone of tones) {
      expect(lightRaw[`--leaf-color-${tone}-soft`], `${tone} light soft`).toBe(
        lightRaw[`--leaf-color-${tone}-light-9`],
      );
      expect(lightRaw[`--leaf-color-${tone}-soft-hover`], `${tone} light hover`).toBe(
        lightRaw[`--leaf-color-${tone}-light-7`],
      );
      expect(lightRaw[`--leaf-color-${tone}-soft-active`], `${tone} light active`).toBe(
        lightRaw[`--leaf-color-${tone}-light-7`],
      );
      expect(lightRaw[`--leaf-color-${tone}-border`], `${tone} light border`).toBe(
        lightRaw[`--leaf-color-${tone}-light-7`],
      );
    }

    await page.getByTestId('toggle-semantic-appearance').click();
    await expect(scope).toHaveAttribute('data-appearance', 'dark');
    const darkRaw = await rawTokens(scope);
    for (const key of [...semanticShadeKeys, ...neutralScaleKeys])
      expect(darkRaw[key], key).toBe(lightRaw[key]);
    for (const family of tones)
      expect(darkRaw[`--leaf-color-${family}`], family).toBe(lightRaw[`--leaf-color-${family}`]);
    for (const tone of tones) {
      expect(darkRaw[`--leaf-color-${tone}-soft`], `${tone} dark soft`).toBe(
        darkRaw[`--leaf-color-${tone}-dark-9`],
      );
      expect(darkRaw[`--leaf-color-${tone}-soft-hover`], `${tone} dark hover`).toBe(
        darkRaw[`--leaf-color-${tone}-dark-7`],
      );
      expect(darkRaw[`--leaf-color-${tone}-soft-active`], `${tone} dark active`).toBe(
        darkRaw[`--leaf-color-${tone}-dark-7`],
      );
      expect(darkRaw[`--leaf-color-${tone}-border`], `${tone} dark border`).toBe(
        darkRaw[`--leaf-color-${tone}-dark-7`],
      );
    }
    const dark = await semanticTokens(scope);
    for (const role of neutralRoles)
      expect(dark[`--leaf-color-${role}`], role).not.toBe(light[`--leaf-color-${role}`]);

    const primary = dark['--leaf-color-primary'];
    const foreground = dark['--leaf-color-on-primary'];
    await expectOutline(page.getByTestId('mode-switch-tag'));
    for (const testId of ['mode-switch-button'])
      await expect
        .poll(() => paint(page.getByTestId(testId)))
        .toEqual({
          foreground,
          background: primary,
        });
    await expect
      .poll(() => paint(page.getByTestId('mode-switch-badge').locator('.leaf-badge__indicator')))
      .toEqual({ foreground, background: primary });
    const switchControl = scope.locator('.leaf-switch');
    await expect
      .poll(() => paint(switchControl.locator('.leaf-switch__track')))
      .toEqual(expect.objectContaining({ background: primary }));
    await expect
      .poll(async () => (await paint(switchControl.locator('.leaf-switch__thumb'))).background)
      .toBe(foreground);
  });

  test(`${theme} concrete dark primary ink chooses the first accessible shade without a fixed step`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=semantic-color-contract&theme=${theme}`);
    const scope = page.getByTestId('concrete-primary');
    const tokens = await semanticTokens(scope);
    const expectedInk = accessibleCandidate(
      tokens,
      tokens['--leaf-color-primary'] ?? '',
      semanticShadeSteps,
      4.5,
      [
        tokens['--leaf-color-surface'] ?? '',
        tokens['--leaf-color-surface-muted'] ?? '',
        tokens['--leaf-color-primary-soft'] ?? '',
      ],
    );
    await expect
      .poll(async () => (await semanticTokens(scope))['--leaf-color-primary-ink'])
      .toBe(expectedInk);
    expect(tokens['--leaf-color-primary-ink']).not.toBe(tokens['--leaf-color-primary']);
    expect(new TinyColor(tokens['--leaf-color-primary-ink']).getLuminance()).toBeGreaterThan(
      new TinyColor(tokens['--leaf-color-primary']).getLuminance(),
    );
    for (const background of [
      tokens['--leaf-color-surface'],
      tokens['--leaf-color-surface-muted'],
      tokens['--leaf-color-primary-soft'],
    ].filter((value): value is string => Boolean(value)))
      expect(
        readability(tokens['--leaf-color-primary-ink'] ?? '', background),
        background,
      ).toBeGreaterThanOrEqual(4.5);
    await expectOutline(page.getByTestId('concrete-primary-tag'));
    for (const testId of ['concrete-primary-button'])
      await expect
        .poll(() => paint(page.getByTestId(testId)))
        .toEqual({
          foreground: tokens['--leaf-color-on-primary'],
          background: tokens['--leaf-color-primary'],
        });
    await expect
      .poll(() =>
        paint(page.getByTestId('concrete-primary-badge').locator('.leaf-badge__indicator')),
      )
      .toEqual({
        foreground: tokens['--leaf-color-on-primary'],
        background: tokens['--leaf-color-primary'],
      });
  });

  test(`${theme} CSS expressions remain browser-native for ink and soft surfaces`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=semantic-color-contract&theme=${theme}`);
    const scope = page.getByTestId('expression-primary');
    const inline = await scope.evaluate((node) => ({
      primary: node.style.getPropertyValue('--leaf-color-primary').trim(),
      ink: node.style.getPropertyValue('--leaf-color-primary-ink').trim(),
      soft: node.style.getPropertyValue('--leaf-color-primary-soft').trim(),
    }));
    expect(inline.primary).toBe('var(--contract-expression-primary)');
    expect(inline.ink).toBe('var(--contract-expression-primary)');
    expect(inline.soft).toContain('var(--contract-expression-primary)');

    const tokens = await semanticTokens(scope);
    expect(tokens['--leaf-color-primary']).toBe('rgba(24, 24, 27, 1)');
    expect(tokens['--leaf-color-primary-ink']).toBe(tokens['--leaf-color-primary']);
    await expectOutline(page.getByTestId('expression-primary-tag'));
    for (const testId of ['expression-primary-button'])
      await expect
        .poll(() => paint(page.getByTestId(testId)))
        .toEqual({
          foreground: tokens['--leaf-color-on-primary'],
          background: tokens['--leaf-color-primary'],
        });
    await expect
      .poll(() =>
        paint(page.getByTestId('expression-primary-badge').locator('.leaf-badge__indicator')),
      )
      .toEqual({
        foreground: tokens['--leaf-color-on-primary'],
        background: tokens['--leaf-color-primary'],
      });
  });

  test(`${theme} real solid controls consume their semantic foreground tokens`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=semantic-color-contract&theme=${theme}`);
    for (const name of ['default', 'custom', 'expression']) {
      const section = page.getByRole('region', { name: `${name} semantic samples` });
      const tokens = await semanticTokens(section);

      for (const tone of tones) {
        const tag = page.getByTestId(`${name}-solid-${tone}`);
        await expect
          .poll(() => paint(tag))
          .toEqual({
            foreground: tokens['--leaf-color-text'],
            background: tokens['--leaf-color-surface'],
          });
        await expect(tag.locator('.leaf-tag__dot')).toHaveCSS(
          'background-color',
          new TinyColor(tokens[`--leaf-color-${tone}`]).toRgbString(),
        );
      }
      for (const tone of ['primary', 'danger'] as const) {
        const button = page.getByTestId(`${name}-button-${tone}`);
        await expect
          .poll(() => paint(button))
          .toEqual({
            foreground: tokens[`--leaf-color-on-${tone}`],
            background: tokens[`--leaf-color-${tone}`],
          });
      }
      for (const tone of ['success', 'warning', 'danger', 'info'] as const) {
        const badge = page.getByTestId(`${name}-badge-${tone}`).locator('.leaf-badge__indicator');
        await expect
          .poll(() => paint(badge))
          .toEqual({
            foreground: tokens[`--leaf-color-on-${tone}`],
            background: tokens[`--leaf-color-${tone}`],
          });
      }
      const switchThumb = page.getByTestId(`${name}-switch-primary`).locator('.leaf-switch__thumb');
      await expect
        .poll(async () => (await paint(switchThumb)).background)
        .toBe(tokens['--leaf-color-on-primary']);
    }
  });

  test(`${theme} solid buttons retain white labels at rest and on press`, async ({ page }) => {
    await page.goto(`/?fixture=semantic-color-contract&theme=${theme}`);
    for (const scope of ['default', 'custom', 'expression']) {
      for (const tone of ['primary', 'danger'] as const) {
        const button = page.getByTestId(`${scope}-button-${tone}`);
        await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
        await button.scrollIntoViewIfNeeded();
        await button.hover();
        await page.mouse.down();
        await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
        await page.mouse.up();
      }
    }
  });

  test(`${theme} danger text actions keep readable ink and visible press feedback`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=semantic-color-contract&theme=${theme}`);
    const link = page.getByTestId('default-link-danger');
    const ink = await link.evaluate((node) => getComputedStyle(node).color);
    await link.hover();
    await expect(link).toHaveCSS('text-decoration-line', 'none');
    await page.mouse.down();
    await expect(link).toHaveCSS('color', ink);
    await expect(link).toHaveCSS('text-decoration-line', 'underline');
    await page.mouse.up();
    await expect(link).toHaveCSS('text-decoration-line', 'none');
  });
}

test('custom colors, explicit style and component overrides remain scoped and authoritative', async ({
  page,
}) => {
  await page.goto('/?fixture=semantic-color-contract&theme=light');
  const expression = page.getByTestId('custom-expression-tag');
  const expressionTokens = await expression.evaluate((node) => ({
    color: node.style.getPropertyValue('--leaf-tag-color').trim(),
    ink: node.style.getPropertyValue('--leaf-tag-ink').trim(),
  }));
  expect(expressionTokens).toEqual({
    color: 'var(--custom-tag-color)',
    ink: 'var(--custom-tag-color)',
  });
  const color4 = page.getByTestId('expression-color4-soft');
  await expect
    .poll(() =>
      color4.evaluate((node) => ({
        color: node.style.getPropertyValue('--leaf-tag-color').trim(),
        ink: node.style.getPropertyValue('--leaf-tag-ink').trim(),
      })),
    )
    .toEqual({
      color: 'oklch(90% 0.15 100)',
      ink: 'oklch(90% 0.15 100)',
    });
  const dynamicTag = page.getByTestId('expression-dynamic-solid');
  const dynamicBadge = page
    .getByTestId('expression-dynamic-badge')
    .locator('.leaf-badge__indicator');
  for (const color of ['#ffeb3b', '#111827']) {
    await dynamicTag.evaluate((node, value) => {
      node.parentElement?.style.setProperty('--custom-tag-color', value);
    }, color);
    await expectOutline(dynamicTag);
    await expect(dynamicTag.locator('.leaf-tag__dot')).toHaveCSS(
      'background-color',
      new TinyColor(color).toRgbString(),
    );
    for (const element of [dynamicBadge]) {
      await expect(element).toHaveCSS('background-color', new TinyColor(color).toRgbString());
      await expect(element).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
  }
  await expect(page.getByTestId('custom-explicit-tag')).toHaveCSS('color', 'rgb(1, 2, 3)');
  await expect(page.getByTestId('explicit-on-primary')).toHaveCSS('color', 'rgb(18, 52, 86)');

  for (const id of ['component-override-tag-soft', 'component-override-tag-solid']) {
    const tag = page.getByTestId(id);
    await expect(tag).toHaveCSS('color', 'rgb(18, 52, 86)');
    await expect(tag).toHaveCSS('background-color', 'rgb(240, 240, 240)');
  }
  const button = page.getByTestId('component-override-button');
  await expect(button).toHaveCSS('color', 'rgb(18, 52, 86)');
  await expect(button).toHaveCSS('background-color', 'rgb(240, 240, 240)');
  await expect(button).toHaveCSS('border-top-color', 'rgb(35, 69, 103)');
  await button.hover();
  await page.mouse.down();
  await expect(button).toHaveCSS('border-top-color', 'rgb(52, 86, 120)');
  await page.mouse.up();
  await expect(page.getByTestId('default-soft-primary')).not.toHaveCSS(
    'background-color',
    'rgb(240, 240, 240)',
  );
});

async function expectOutline(tag: Locator) {
  const paint = await tag.evaluate((node) => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--leaf-color-text)';
    probe.style.backgroundColor = 'var(--leaf-color-surface)';
    node.appendChild(probe);
    const actual = getComputedStyle(node);
    const expected = getComputedStyle(probe);
    const result = {
      color: actual.color === expected.color,
      background: actual.backgroundColor === expected.backgroundColor,
    };
    probe.remove();
    return result;
  });
  expect(paint).toEqual({ color: true, background: true });
}
