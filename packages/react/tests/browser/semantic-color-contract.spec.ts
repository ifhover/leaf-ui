import { readability, TinyColor } from '@ctrl/tinycolor';
import { expect as baseExpect, type Locator, test } from '@playwright/test';

// Windows WebKit may deliver a computed-color evaluation after a delayed frame.
const expect = baseExpect.configure({ timeout: 20_000 });
test.setTimeout(120_000);

const tones = ['primary', 'success', 'warning', 'danger', 'info'] as const;

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
    tones.flatMap((tone) => [
      `--leaf-color-${tone}`,
      `--leaf-color-${tone}-ink`,
      `--leaf-color-on-${tone}`,
      `--leaf-color-${tone}-surface-8`,
      '--leaf-color-surface',
      '--leaf-color-surface-muted',
    ]),
  );
}

for (const theme of ['light', 'dark'] as const) {
  test(`${theme} status inks and solid labels meet AA on their actual surfaces`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=semantic-color-contract&theme=${theme}`);
    for (const name of ['default', 'custom', 'expression']) {
      const section = page.getByRole('region', { name: `${name} semantic samples` });
      for (const tone of tones) {
        for (const variant of ['soft', 'solid'] as const) {
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
          tokens[`--leaf-color-${tone}-surface-8`],
        ].filter((value): value is string => Boolean(value)))
          expect(
            readability(tokens[`--leaf-color-${tone}-ink`] ?? '', background),
            `${theme} ${name} ${tone} ink`,
          ).toBeGreaterThanOrEqual(4.5);
        expect(
          readability(
            tokens[`--leaf-color-on-${tone}`] ?? '',
            tokens[`--leaf-color-${tone}`] ?? '',
          ),
          `${theme} ${name} on-${tone}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test(`${theme} solid buttons keep readable labels at rest and on press`, async ({ page }) => {
    await page.goto(`/?fixture=semantic-color-contract&theme=${theme}`);
    for (const scope of ['default', 'custom', 'expression']) {
      for (const tone of ['primary', 'danger'] as const) {
        const button = page.getByTestId(`${scope}-button-${tone}`);
        const read = async () => {
          const colors = await paint(button);
          return readability(colors.foreground, colors.background);
        };
        await expect.poll(read).toBeGreaterThanOrEqual(4.5);
        await button.scrollIntoViewIfNeeded();
        const box = await button.boundingBox();
        if (!box) throw new Error('Missing button box');
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await expect.poll(read).toBeGreaterThanOrEqual(4.5);
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
  await expect
    .poll(async () => {
      const colors = await paint(expression);
      return readability(colors.foreground, colors.background);
    })
    .toBeGreaterThanOrEqual(4.5);
  const color4 = page.getByTestId('expression-color4-soft');
  await expect
    .poll(async () => {
      const colors = await paint(color4);
      return readability(colors.foreground, colors.background);
    })
    .toBeGreaterThanOrEqual(4.5);
  const dynamicTag = page.getByTestId('expression-dynamic-solid');
  const dynamicBadge = page
    .getByTestId('expression-dynamic-badge')
    .locator('.leaf-badge__indicator');
  for (const color of ['#ffeb3b', '#111827']) {
    await dynamicTag.evaluate((node, value) => {
      node.parentElement?.style.setProperty('--custom-tag-color', value);
    }, color);
    for (const element of [dynamicTag, dynamicBadge]) {
      await expect(element).toHaveCSS('background-color', new TinyColor(color).toRgbString());
      await expect
        .poll(async () => {
          const colors = await paint(element);
          return readability(colors.foreground, colors.background);
        })
        .toBeGreaterThanOrEqual(4.5);
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
  await expect(page.getByTestId('default-soft-primary')).not.toHaveCSS(
    'background-color',
    'rgb(240, 240, 240)',
  );
});
