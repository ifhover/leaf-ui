import { readability } from '@ctrl/tinycolor';
import { expect as baseExpect, type Locator, type Page, test } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });
test.setTimeout(120_000);
const expect = baseExpect.configure({ timeout: 15_000 });

test('link buttons use content geometry and color feedback without a wave', async ({ page }) => {
  await page.goto('/?fixture=motion');
  const button = page.getByTestId('press-link');
  const geometry = await button.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      height: node.getBoundingClientRect().height,
      padding: style.padding,
      border: style.borderWidth,
      background: style.backgroundColor,
    };
  });
  expect(geometry.height).toBeLessThan(34);
  expect(geometry.padding).toBe('0px');
  expect(geometry.border).toBe('0px');
  expect(geometry.background).toBe('rgba(0, 0, 0, 0)');
  await expect(button.locator('.leaf-button__wave')).toHaveCount(0);
  const before = await button.evaluate((node) => getComputedStyle(node).color);
  await button.hover();
  expect(await button.evaluate((node) => getComputedStyle(node).color)).toBe(before);
  await page.mouse.down();
  await expect.poll(() => button.evaluate((node) => getComputedStyle(node).color)).not.toBe(before);
  await page.mouse.up();
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toBeFocused();
  await expect(button.locator('.leaf-button__wave')).toHaveCount(0);
});

const measure = (button: Locator) =>
  button.evaluate((node) => {
    const box = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      scale: style.scale === 'none' ? 1 : Number.parseFloat(style.scale),
      translate: style.translate,
      transform: style.transform,
    };
  });

async function hold(page: Page, button: Locator) {
  await button.scrollIntoViewIfNeeded();
  const before = await measure(button);
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  return before;
}

for (const theme of ['light', 'dark']) {
  test(`activation keeps buttons and labels still without perimeter decoration (${theme})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=motion&theme=${theme}`);
    for (const id of [
      'solid',
      'outline',
      'link',
      'group-first',
      'group-last',
      'danger',
      'icon',
      'custom',
    ]) {
      const button = page.getByTestId(`press-${id}`);
      const before = await hold(page, button);
      const content = button.locator('.leaf-button__content');
      const contentBefore = await measure(content);
      expect(await measure(button)).toEqual(before);
      await page.mouse.up();
      await button.click({ clickCount: 3 });
      await page.mouse.move(0, 0);
      expect(await measure(button)).toEqual(before);
      expect(await measure(content)).toEqual(contentBefore);
      await expect(button.locator('.leaf-button__wave')).toHaveCount(0);
      await expect(button).toHaveCSS('outline-style', 'none');
      expect(
        await button.evaluate(
          (node) =>
            node
              .getAnimations({ subtree: true })
              .filter(
                (animation) =>
                  animation.effect instanceof KeyframeEffect &&
                  animation.effect.getKeyframes().some((frame) => 'boxShadow' in frame),
              ).length,
        ),
      ).toBe(0);
    }
  });
}

const appearance = (button: Locator) =>
  button.evaluate((node) => {
    const style = getComputedStyle(node);
    const danger = node.classList.contains('leaf-button--danger');
    const semantic = danger ? 'danger' : 'primary';
    // Canvas resolves CSS Color 4 values, including color-mix(), to sRGB for contrast checks.
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Missing canvas color conversion');
    context.fillStyle = style.backgroundColor;
    context.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
    const probe = document.createElement('span');
    const resolveColor = (value: string) => {
      probe.style.color = value;
      node.append(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return resolved;
    };
    return {
      accent: resolveColor('var(--leaf-button-color)'),
      dangerText: resolveColor('var(--leaf-color-danger-ink)'),
      text: resolveColor('var(--leaf-color-text)'),
      color: style.color,
      background: style.backgroundColor,
      backgroundRgb: { r, g, b },
      border: style.borderTopColor,
      shadow: style.boxShadow,
      hover: resolveColor(style.getPropertyValue(`--leaf-color-${semantic}-hover`).trim()),
      active: resolveColor(style.getPropertyValue(`--leaf-color-${semantic}-active`).trim()),
    };
  });

for (const theme of ['light', 'dark']) {
  test(`outline buttons keep their resting paint on hover and deepen only the border on press (${theme})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=motion&theme=${theme}`);
    for (const id of ['outline', 'danger-outline']) {
      const button = page.getByTestId(`press-${id}`);
      await button.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      const danger = id.startsWith('danger');
      if (!danger) await expect(button).toHaveCSS('height', '34px');
      const initial = await appearance(button);
      const before = await measure(button);
      expect(before.height).toBeGreaterThanOrEqual(34);
      if (!danger) expect(before.height).toBe(34);
      expect(initial.shadow).not.toBe('none');
      expect(readability(initial.color, initial.backgroundRgb)).toBeGreaterThanOrEqual(4.5);
      if (danger) {
        expect(initial.color).toBe(initial.dangerText);
        expect(initial.border).toBe(initial.accent);
      } else {
        expect(initial.color).toBe(initial.text);
        expect(initial.border).not.toBe(initial.accent);
      }
      expect(initial.hover).not.toBe(initial.active);

      await button.hover();
      expect(await appearance(button)).toEqual(initial);
      expect(await measure(button)).toEqual(before);

      await page.mouse.down();
      await expect.poll(async () => (await appearance(button)).border).toBe(initial.active);
      const pressed = await appearance(button);
      expect(pressed.color).toBe(initial.color);
      expect(pressed.background).toBe(initial.background);
      expect(pressed.shadow).toBe(initial.shadow);
      expect(pressed.border).toBe(initial.active);
      expect(await measure(button)).toEqual(before);

      await page.mouse.up();
      await expect.poll(async () => (await appearance(button)).border).toBe(initial.border);
      await page.mouse.move(0, 0);
      expect(await appearance(button)).toEqual(initial);
      await expect(button.locator('.leaf-button__wave')).toHaveCount(0);
    }
    for (const id of ['disabled-outline', 'loading-outline']) {
      const button = page.getByTestId(`press-${id}`);
      await button.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      const initial = await appearance(button);
      expect(initial.shadow).not.toBe('none');
      await hold(page, button);
      expect(await appearance(button)).toEqual(initial);
      await page.mouse.up();
    }
  });

  test(`solid buttons keep their resting paint on hover and deepen on press (${theme})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=motion&theme=${theme}`);
    for (const id of ['solid', 'danger', 'custom']) {
      const button = page.getByTestId(`press-${id}`);
      await button.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      const original = await appearance(button);
      expect(readability(original.color, original.backgroundRgb)).toBeGreaterThanOrEqual(4.5);
      expect(original.hover).not.toBe(original.active);
      await button.hover();
      expect(await appearance(button)).toEqual(original);
      const before = await measure(button);
      await page.mouse.down();
      await expect.poll(async () => (await appearance(button)).background).toBe(original.active);
      const pressed = await appearance(button);
      expect(pressed.color).toBe(original.color);
      expect(pressed.shadow).toBe(original.shadow);
      expect(readability(pressed.color, pressed.backgroundRgb)).toBeGreaterThanOrEqual(4.5);
      expect(await measure(button)).toEqual(before);
      await page.mouse.up();
      await page.mouse.move(0, 0);
      await expect
        .poll(async () => (await appearance(button)).background)
        .toBe(original.background);
      expect(await appearance(button)).toEqual(original);
    }
    for (const id of ['disabled', 'loading']) {
      const button = page.getByTestId(`press-${id}`);
      await button.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      const original = await appearance(button);
      await hold(page, button);
      expect(await appearance(button)).toEqual(original);
      await page.mouse.up();
    }
  });
}

test('explicit component outline states override the default paint', async ({ page }) => {
  await page.goto('/?fixture=motion');
  const button = page.getByTestId('press-component-outline');
  const original = await appearance(button);
  await button.hover();
  await expect(button).toHaveCSS('border-top-color', 'rgb(163, 16, 16)');
  await expect(button).toHaveCSS('color', original.color);
  await page.mouse.down();
  await expect(button).toHaveCSS('border-top-color', 'rgb(118, 84, 198)');
  await expect(button).toHaveCSS('color', 'rgb(18, 105, 95)');
  await expect(button).toHaveCSS('background-color', original.background);
  await expect(button).toHaveCSS('box-shadow', original.shadow);
  await page.mouse.up();
});

for (const theme of ['light', 'dark']) {
  test(`Tab focus stays visible and neutral while pointer activation omits the ring (${theme})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=motion&theme=${theme}`);
    const button = page.getByTestId('press-outline');
    await button.click();
    await expect(button).toHaveCSS('outline-style', 'none');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS('outline-style', 'solid');
    const focusColor = await button.evaluate((node) => getComputedStyle(node).outlineColor);
    const original = await appearance(button);
    expect(focusColor).not.toBe(original.active);
    await page.keyboard.down('Space');
    await expect.poll(async () => (await appearance(button)).border).toBe(original.active);
    const pressed = await appearance(button);
    expect(pressed.color).toBe(original.color);
    expect(pressed.background).toBe(original.background);
    expect(pressed.shadow).toBe(original.shadow);
    await page.keyboard.up('Space');
    await expect.poll(async () => (await appearance(button)).border).toBe(original.border);
    await page.keyboard.press('Enter');
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS('outline-style', 'solid');
    await expect(button.locator('.leaf-button__wave')).toHaveCount(0);
  });
}

test('Space, Enter and touch retain native activation, focus and accessible names', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  const button = page.getByTestId('press-solid');
  await button.evaluate((node) => {
    node.addEventListener('click', () => {
      node.setAttribute(
        'data-click-count',
        String(Number(node.getAttribute('data-click-count')) + 1),
      );
    });
  });
  await button.focus();
  const before = await measure(button);
  await page.keyboard.down('Space');
  expect(await measure(button)).toEqual(before);
  await page.keyboard.up('Space');
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('data-click-count', '2');
  await expect(button).toBeFocused();
  expect(await measure(button)).toEqual(before);
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) {
    await button.tap();
    await expect(button).toHaveAttribute('data-click-count', '3');
  }
  await expect(button).toHaveAccessibleName('solid');
  for (const id of ['press-disabled', 'press-loading']) {
    const disabled = page.getByTestId(id);
    await expect(disabled).toBeDisabled();
    const before = await hold(page, disabled);
    await page.mouse.up();
    expect(await measure(disabled)).toEqual(before);
    await expect(disabled.locator('.leaf-button__wave')).toHaveCount(0);
  }
});

test('motion preferences and portal inheritance retain undecorated native actions', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  for (const id of ['press-off', 'press-resumed']) {
    const button = page.getByTestId(id);
    await button.click();
    await expect(button.locator('.leaf-button__wave')).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Toggle motion', exact: true }).click();
  await page.getByRole('button', { name: 'Open morphing modal', exact: true }).click();
  const portal = page.getByTestId('press-portal');
  await portal.click();
  await expect(portal.locator('.leaf-button__wave')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const button = page.getByTestId('press-solid');
  await button.click();
  await expect(button).toHaveCSS('transition-duration', '0s');
  await expect(button.locator('.leaf-button__wave')).toHaveCount(0);
});

test('forced colors retains clear keyboard focus', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit does not emulate forced-colors');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/?fixture=motion');
  const button = page.getByTestId('press-solid');
  await button.focus();
  await page.keyboard.press('Space');
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-style', 'solid');
  await expect(button.locator('.leaf-button__wave')).toHaveCount(0);
});

test('floating, back-to-top and full-width actions retain geometry and scroll bounds', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  for (const id of ['press-float', 'press-backtop', 'press-scroll']) {
    const button = page.getByTestId(id);
    const before = await hold(page, button);
    expect(await measure(button)).toEqual(before);
    await page.mouse.up();
    await expect(button.locator('.leaf-button__wave')).toHaveCount(0);
    await page.mouse.move(0, 0);
    expect(await measure(button)).toEqual(before);
  }
  const frame = page.getByTestId('wave-scroll-frame');
  expect(
    await frame.evaluate((node) => ({ width: node.scrollWidth, client: node.clientWidth })),
  ).toEqual({ width: 240, client: 240 });
});
