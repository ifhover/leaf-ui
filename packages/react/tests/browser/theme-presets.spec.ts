import { TinyColor } from '@ctrl/tinycolor';
import { expect, test } from '@playwright/test';

test('steps stay transparent, avatars have one surface edge, and hovered rows remain distinct from headers', async ({
  page,
}) => {
  await page.goto('/?fixture=theme-presets&global');
  for (const dark of [false, true]) {
    if (dark) await page.getByRole('button', { name: 'Toggle mode', exact: true }).click();
    for (const width of [1100, 375]) {
      await page.setViewportSize({ width, height: 900 });
      const steps = page.getByRole('list', { name: 'Theme steps', exact: true });
      for (const title of await steps.locator('.leaf-steps__title').all()) {
        await expect(title).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      }
      const horizontal = await steps
        .locator('.leaf-steps__item')
        .first()
        .evaluate((node) => {
          const line = getComputedStyle(node, '::before');
          const icon = node.querySelector<HTMLElement>('.leaf-steps__icon');
          const title = node.querySelector<HTMLElement>('.leaf-steps__title');
          if (!icon || !title) throw new Error('Missing step geometry');
          return {
            height: line.height,
            column: line.gridColumnStart,
            iconWidth: icon.getBoundingClientRect().width,
            iconHeight: icon.getBoundingClientRect().height,
            titleLineHeight: Number.parseFloat(getComputedStyle(title).lineHeight),
            titlePadding: Number.parseFloat(getComputedStyle(title).paddingBlockStart),
          };
        });
      expect(horizontal.height).toBe('1px');
      expect(horizontal.column).toBe('2');
      expect(horizontal.iconWidth).toBe(24);
      expect(horizontal.iconHeight).toBe(24);
      expect(horizontal.titleLineHeight).toBe(20);
      expect(horizontal.titlePadding).toBe(2);
      const vertical = page.getByRole('list', { name: 'Vertical theme steps' });
      const verticalLine = await vertical
        .locator('.leaf-steps__item')
        .first()
        .evaluate((node) => {
          const style = getComputedStyle(node, '::before');
          return {
            position: style.position,
            width: style.width,
            height: Number.parseFloat(style.height),
          };
        });
      expect(verticalLine.position).toBe('absolute');
      expect(verticalLine.width).toBe('1px');
      expect(verticalLine.height).toBeGreaterThan(10);
      const largeIcon = page
        .getByRole('list', { name: 'Large theme steps', exact: true })
        .locator('.leaf-steps__icon')
        .first();
      expect((await largeIcon.boundingBox())?.width).toBe(28);
      expect((await largeIcon.boundingBox())?.height).toBe(28);
      for (const avatar of await page.locator('.leaf-avatar-group > .leaf-avatar').all()) {
        const surface = await avatar.evaluate((node) => {
          const probe = document.createElement('span');
          probe.style.color = 'var(--leaf-color-surface)';
          node.append(probe);
          const color = getComputedStyle(probe).color;
          probe.remove();
          return color;
        });
        await expect(avatar).toHaveCSS('border-top-color', surface);
        await expect(avatar).toHaveCSS('border-top-width', '2px');
        await expect(avatar).toHaveCSS('box-shadow', 'none');
      }
      const table = page.getByRole('table', { name: 'Global theme table' });
      const header = table.getByRole('columnheader');
      const cell = table.getByRole('cell');
      await cell.hover();
      await expect(header).toHaveCSS('border-bottom-width', '0px');
      await expect
        .poll(async () => {
          const head = await header.evaluate((node) => getComputedStyle(node).backgroundColor);
          const body = await cell.evaluate((node) => getComputedStyle(node).backgroundColor);
          return head !== body;
        })
        .toBe(true);
    }
  }
});

test('one global frame color and CSS palette style controls, surfaces and portals in both appearances', async ({
  page,
}) => {
  await page.goto('/?fixture=theme-presets&global');
  const readFrames = () =>
    page.evaluate(() => {
      const selectors = [
        '.leaf-card',
        '.leaf-button--solid',
        '.leaf-input:not(:has([aria-label="Explicit frame override"]))',
        '.leaf-switch__track',
        '.leaf-checkbox__input',
        '.leaf-table__panel',
        '.leaf-collapse',
        '.leaf-alert',
        '.leaf-pagination > button',
      ];
      const canvas = document.createElement('canvas').getContext('2d');
      if (!canvas) throw new Error('Canvas is required for color normalization');
      const rgba = (value: string) => {
        canvas.clearRect(0, 0, 1, 1);
        canvas.fillStyle = value;
        canvas.fillRect(0, 0, 1, 1);
        return [...canvas.getImageData(0, 0, 1, 1).data];
      };
      return selectors.map((selector) => {
        const node = document.querySelector(selector);
        if (!node) throw new Error(`Missing ${selector}`);
        const style = getComputedStyle(node);
        return { selector, color: rgba(style.borderTopColor), width: style.borderTopWidth };
      });
    });
  for (const dark of [false, true]) {
    if (dark) await page.getByRole('button', { name: 'Toggle mode', exact: true }).click();
    for (const color of ['orange', 'blue']) {
      if (color === 'blue')
        await page.getByRole('button', { name: 'Toggle palette', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Solid action', exact: true })).toHaveCSS(
        'color',
        'rgb(255, 255, 255)',
      );
      await expect
        .poll(async () => (await readFrames()).every((frame) => frame.width === '2px'))
        .toBe(true);
      const frames = await readFrames();
      const expected = await page.evaluate(() => {
        const scope = document.querySelector<HTMLElement>('.theme-presets-fixture');
        if (!scope) throw new Error('Missing themed scope');
        const canvas = document.createElement('canvas').getContext('2d');
        if (!canvas) throw new Error('Canvas unavailable');
        const channels = (value: string) => {
          canvas.clearRect(0, 0, 1, 1);
          canvas.fillStyle = value;
          canvas.fillRect(0, 0, 1, 1);
          return [...canvas.getImageData(0, 0, 1, 1).data].slice(0, 3);
        };
        const style = getComputedStyle(scope);
        const primary = channels(style.getPropertyValue('--leaf-color-primary'));
        const text = channels(style.getPropertyValue('--leaf-color-text'));
        return primary.map((channel, index) =>
          Math.round(channel * 0.12 + (text[index] ?? 0) * 0.88),
        );
      });
      for (const frame of frames) {
        expect(frame.color.slice(0, 3), frame.selector).toEqual(expected);
      }
      const surfaces = await page.evaluate(() => {
        const canvas = document.createElement('canvas').getContext('2d');
        if (!canvas) throw new Error('Canvas unavailable');
        return ['.leaf-tabs__indicator', '.leaf-tag'].map((selector) => {
          const node = document.querySelector(selector);
          if (!node) throw new Error(`Missing ${selector}`);
          canvas.clearRect(0, 0, 1, 1);
          canvas.fillStyle = getComputedStyle(node).backgroundColor;
          canvas.fillRect(0, 0, 1, 1);
          return [...canvas.getImageData(0, 0, 1, 1).data].slice(0, 3);
        });
      });
      for (const surface of surfaces)
        expect(surface.every((channel) => (dark ? channel < 120 : channel > 200))).toBe(true);
      const field = page
        .locator('.leaf-input')
        .filter({ has: page.getByLabel('Explicit frame override') });
      await expect(field).toHaveCSS('border-top-color', 'rgb(118, 84, 198)');
      await page.getByRole('combobox', { name: 'Theme category' }).click();
      const panel = page.locator('.leaf-select__panel');
      await expect(panel).toHaveCSS('border-top-width', '2px');
      await expect(panel).toHaveCSS(
        'border-top-color',
        await page.locator('.leaf-card').evaluate((node) => getComputedStyle(node).borderTopColor),
      );
      await expect(panel).not.toHaveCSS('box-shadow', 'none');
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Open themed modal', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Themed dialog' });
      await expect(dialog).toHaveCSS(
        'border-top-color',
        await page.locator('.leaf-card').evaluate((node) => getComputedStyle(node).borderTopColor),
      );
      await page.keyboard.press('Escape');
      const error = page
        .locator('.leaf-input')
        .filter({ has: page.getByLabel('Invalid theme name', { exact: true }) });
      await expect(error).toHaveCSS(
        'border-top-color',
        new TinyColor(
          await error.evaluate((node) =>
            getComputedStyle(node).getPropertyValue('--leaf-color-danger').trim(),
          ),
        ).toRgbString(),
      );
    }
    await page.getByRole('button', { name: 'Toggle palette', exact: true }).click();
  }
});

test('CSS variable primary colors retain white labels and browser-native derived colors', async ({
  page,
}) => {
  await page.goto('/?fixture=theme-presets&global&css-primary');
  const solid = page.getByRole('button', { name: 'Solid action', exact: true });
  await expect(solid).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(solid).toHaveCSS('background-color', 'rgb(255, 105, 0)');
  await page.getByRole('button', { name: 'Toggle palette', exact: true }).click();
  await expect(solid).toHaveCSS('background-color', 'rgb(29, 155, 240)');
  await expect(solid).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('presets theme controls and portals and retain values when switched', async ({ page }) => {
  await page.goto('/?fixture=theme-presets');
  const name = page.getByRole('textbox', { name: 'Theme name', exact: true });
  const field = page.locator('.leaf-input').filter({ has: name });
  const solid = page.getByRole('button', { name: 'Solid action', exact: true });
  await name.fill('Keep this idea');
  const original = await name.elementHandle();
  await expect(field).toHaveCSS('border-top-width', '2px');
  await expect(solid).toHaveCSS('border-top-width', '2px');
  await expect(solid).not.toHaveCSS('box-shadow', 'none');
  await expect(page.locator('.leaf-card')).not.toHaveCSS('box-shadow', 'none');
  await expect(
    page.locator('.leaf-input').filter({ has: page.getByLabel('Nested default input') }),
  ).toHaveCSS('border-top-width', '1px');

  await page.getByRole('combobox', { name: 'Theme category' }).click();
  const panel = page.locator('.leaf-select__panel');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveCSS('border-top-width', '2px');
  await expect(panel).not.toHaveCSS('box-shadow', 'none');
  await page.getByRole('option', { name: 'Code', exact: true }).click();
  await page.getByRole('button', { name: 'Next preset', exact: true }).click();
  await expect(name).toHaveValue('Keep this idea');
  expect(await original?.evaluate((element) => element.isConnected)).toBe(true);
  await expect(page.getByRole('combobox', { name: 'Theme category' })).toHaveValue('Code');
  await page.getByRole('button', { name: 'Use default', exact: true }).click();
  await expect(field).toHaveCSS('border-top-width', '1px');
  await expect(solid).toHaveCSS('box-shadow', 'none');
});

test('dialog and API feedback follow the regional preset and live changes', async ({ page }) => {
  await page.goto('/?fixture=theme-presets');
  await page.getByRole('button', { name: 'Open themed modal' }).click();
  const dialog = page.getByRole('dialog', { name: 'Themed dialog' });
  await expect(dialog).toHaveCSS('border-top-width', '2px');
  const before = await dialog.evaluate((node) => getComputedStyle(node).backgroundColor);
  await page.getByRole('button', { name: 'Change dialog preset' }).click();
  await expect(dialog).not.toHaveCSS('background-color', before);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: 'Show message' }).click();
  await expect(page.getByText('Preset saved', { exact: true })).toBeVisible();
  await expect(page.locator('.leaf-message').first()).toHaveCSS('border-top-width', '2px');
});

test('component state overrides preserve geometry, keyboard focus and disabled behavior', async ({
  page,
}) => {
  await page.goto('/?fixture=theme-presets&states');
  const solid = page.getByRole('button', { name: 'Solid action', exact: true });
  await expect(solid).toHaveCSS('border-top-width', '3px');
  const before = await solid.boundingBox();
  await solid.hover();
  await expect(solid).toHaveCSS('background-color', 'rgb(255, 229, 153)');
  await expect(solid).toHaveCSS('box-shadow', 'rgb(37, 37, 37) 5px 5px 0px 0px');
  await page.mouse.down();
  await expect(solid).toHaveCSS('background-color', 'rgb(244, 177, 131)');
  expect(await solid.boundingBox()).toEqual(before);
  await page.mouse.up();
  const input = page.getByRole('textbox', { name: 'Theme name', exact: true });
  await input.focus();
  await expect(page.locator('.leaf-input').filter({ has: input })).toHaveCSS(
    'border-top-color',
    'rgb(118, 84, 198)',
  );
  const suggestion = page.getByRole('combobox', { name: 'Theme suggestion' });
  await suggestion.focus();
  const autocomplete = page.locator('.leaf-autocomplete').filter({ has: suggestion });
  await expect(autocomplete).toHaveCSS('border-top-width', '3px');
  await expect(autocomplete).toHaveCSS('border-top-color', 'rgb(118, 84, 198)');
  const disabled = page.getByRole('button', { name: 'Disabled action' });
  await disabled.hover();
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveCSS('background-color', 'rgb(221, 221, 221)');
  await expect(disabled).toHaveCSS('box-shadow', 'none');
});

test('thicker borders retain nested popup corner geometry and compact control heights', async ({
  page,
}) => {
  await page.goto('/?fixture=theme-presets&compact=1');
  await expect(page.getByRole('button', { name: 'Solid action', exact: true })).toHaveCSS(
    'min-height',
    '30px',
  );
  await page.getByRole('combobox', { name: 'Theme category' }).click();
  const panel = page.locator('.leaf-select__panel');
  const expected = await panel.evaluate((node) => {
    const style = getComputedStyle(node);
    return Math.max(0, Number.parseFloat(style.borderTopLeftRadius) - 2);
  });
  await expect(panel.getByRole('option').first()).toHaveCSS(
    'border-top-left-radius',
    `${expected}px`,
  );
});

for (const variant of ['card', 'line']) {
  test(`${variant} tabs and choice focus consume state colors over their semantic defaults`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=theme-presets&states${variant === 'line' ? '&line=1' : ''}`);
    const second = page.getByRole('tab', { name: 'Second', exact: true });
    await second.hover();
    await expect(second).toHaveCSS('color', 'rgb(163, 16, 16)');
    await page.mouse.down();
    await expect(second).toHaveCSS('color', 'rgb(18, 105, 95)');
    await page.mouse.up();
    await second.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(second).toHaveCSS('color', 'rgb(118, 84, 198)');
    const choice = page.getByRole('checkbox', { name: 'Theme choice', exact: true });
    await choice.hover();
    await choice.focus();
    await expect(choice).toHaveCSS('border-top-color', 'rgb(118, 84, 198)');
  });
}

test('nested default resets remain isolated when portals target the themed ancestor', async ({
  page,
}) => {
  await page.goto('/?fixture=theme-presets');
  const outer = page.locator('#portal-reset-host');
  const outerShadow = await outer.evaluate((node) =>
    getComputedStyle(node).getPropertyValue('--leaf-surface-shadow'),
  );
  await page.getByRole('combobox', { name: 'Nested reset select' }).click();
  const panel = outer.locator('.leaf-select__panel');
  await expect(panel).toBeVisible();
  const reset = await panel.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      shadow: style.boxShadow,
      reset: style.getPropertyValue('--leaf-surface-shadow'),
      focus: style.getPropertyValue('--leaf-color-focus'),
    };
  });
  expect(reset.reset.trim()).toBe('');
  expect(reset.focus.trim()).toBe('');
  expect(reset.shadow).not.toBe(outerShadow.trim());
  expect(reset.shadow).toContain('24px');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open reset modal' }).click();
  const dialog = outer.getByRole('dialog', { name: 'Reset dialog' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS('border-top-width', '1px');
  expect(await dialog.evaluate((node) => getComputedStyle(node).boxShadow)).toContain('24px');
  await page.keyboard.press('Escape');
  const invalid = page.getByRole('textbox', { name: 'Nested invalid input' });
  await invalid.focus();
  const field = page.locator('.leaf-input').filter({ has: invalid });
  const colors = await field.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      actual: style.borderTopColor,
      expected: style.getPropertyValue('--leaf-color-danger').trim(),
    };
  });
  expect(colors.actual).toBe(new TinyColor(colors.expected).toRgbString());
  await expect(field).toHaveCSS('outline-style', 'none');
});
