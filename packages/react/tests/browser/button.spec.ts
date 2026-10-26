import { readability, TinyColor } from '@ctrl/tinycolor';
import { expect as baseExpect, type Locator, type Page, test } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });
test.setTimeout(120_000);
const expect = baseExpect.configure({ timeout: 15_000 });

test('all appearances and danger actions share reversible paint transitions', async ({ page }) => {
  await page.goto('/?fixture=motion');
  const motion = (button: Locator) =>
    button.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        properties: style.transitionProperty,
        duration: style.transitionDuration,
        easing: style.transitionTimingFunction,
        padding: style.padding,
        height: style.minHeight,
        radius: style.borderRadius,
      };
    });
  const baseline = await motion(page.getByTestId('press-solid'));
  for (const variant of ['solid', 'outline', 'text', 'link']) {
    const normal = page.getByTestId(`press-${variant}`);
    const danger = page.getByTestId(
      variant === 'solid' ? 'press-danger' : `press-danger-${variant}`,
    );
    const normalMotion = await motion(normal);
    expect(await motion(danger)).toEqual(normalMotion);
    expect(normalMotion.properties).toBe(baseline.properties);
    expect(normalMotion.duration).toBe(baseline.duration);
    expect(normalMotion.easing).toBe(baseline.easing);
    for (const button of [normal, danger]) {
      await button.hover();
      await button.evaluate(async (node) => {
        await Promise.all(node.getAnimations().map((animation) => animation.finished));
      });
      await button.evaluate((node) => {
        void getComputedStyle(node).backgroundColor;
      });
      await page.mouse.down();
      await expect(button).toHaveCSS(
        'text-decoration-line',
        variant === 'link' && button === danger ? 'underline' : 'none',
      );
      if (variant !== 'link') {
        const transition = await button.evaluate(async (node) => {
          const animation = node
            .getAnimations()
            .find(
              (item) =>
                item instanceof CSSTransition && item.transitionProperty === 'background-color',
            );
          if (!animation?.effect) return null;
          animation.pause();
          const duration = Number(animation.effect.getTiming().duration);
          animation.currentTime = 0;
          await new Promise(requestAnimationFrame);
          const start = getComputedStyle(node).backgroundColor;
          animation.currentTime = duration / 4;
          await new Promise(requestAnimationFrame);
          const middle = getComputedStyle(node).backgroundColor;
          animation.finish();
          return { duration, start, middle, end: getComputedStyle(node).backgroundColor };
        });
        expect(transition).not.toBeNull();
        expect(transition?.duration).toBeGreaterThan(0);
        expect(transition?.middle).not.toBe(transition?.start);
        expect(transition?.middle).not.toBe(transition?.end);
      }
      await page.mouse.up();
      expect(await motion(button)).toEqual(normalMotion);
    }
  }
});

for (const mode of ['light', 'dark']) {
  test(`text actions share neutral feedback and links use theme color (${mode})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=motion&theme=${mode}`);
    const button = page.getByTestId('press-text');
    const outline = page.getByTestId('press-outline');
    const geometry = (target: Locator) =>
      target.evaluate((node) => {
        const style = getComputedStyle(node);
        return { height: node.getBoundingClientRect().height, padding: style.padding };
      });
    expect(await geometry(button)).toEqual(await geometry(outline));
    await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    const feedback = await button.evaluate((node) => {
      const probe = document.createElement('span');
      node.append(probe);
      const resolve = (color: string) => {
        probe.style.color = color;
        return getComputedStyle(probe).color;
      };
      const hover = resolve('color-mix(in srgb, var(--leaf-color-option-hover) 50%, transparent)');
      const active = resolve('var(--leaf-color-option-hover)');
      probe.remove();
      return { hover, active };
    });
    expect(feedback.hover).not.toBe(feedback.active);
    await button.hover();
    await expect(button).toHaveCSS('background-color', feedback.hover);
    await page.mouse.down();
    await expect(button).toHaveCSS('background-color', feedback.active);
    await page.mouse.up();
    await expect(button).toHaveCSS('background-color', feedback.hover);
    for (const selector of ['.leaf-input__clear', '.leaf-picker-clear']) {
      const clear = page.getByTestId('text-actions').locator(selector);
      await clear.hover();
      await expect(clear).toHaveCSS('background-color', feedback.hover);
      await expect(clear).toHaveCSS('scale', 'none');
      const before = await clear.boundingBox();
      await page.mouse.down();
      await expect(clear).toHaveCSS('background-color', feedback.active);
      expect(await clear.boundingBox()).toEqual(before);
      await page.mouse.up();
    }
    const link = page.getByTestId('press-link');
    const primary = await link.evaluate((node) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--leaf-color-primary-ink)';
      node.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await expect(link).toHaveCSS('color', primary);
    await page.screenshot({ path: test.info().outputPath(`text-actions-${mode}.png`) });
  });
}

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
                  !(animation instanceof CSSTransition) &&
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
    const resolveRgb = (value: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
      return { r, g, b };
    };
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
      hoverBorder: resolveColor('var(--leaf-button-hover-border)'),
      activeBorder: resolveColor('var(--leaf-button-active-border)'),
      onColor: resolveColor('var(--leaf-button-on-color)'),
      activeColor: resolveColor('var(--leaf-button-active-color)'),
      activeBackground: resolveColor('var(--leaf-button-active-background)'),
      text: resolveColor('var(--leaf-color-text)'),
      color: style.color,
      colorRgb: resolveRgb(style.color),
      borderRgb: resolveRgb(style.borderTopColor),
      background: style.backgroundColor,
      backgroundRgb: { r, g, b },
      border: style.borderTopColor,
      shadow: style.boxShadow,
      hover: resolveColor(style.getPropertyValue(`--leaf-color-${semantic}-hover`).trim()),
      active: resolveColor(style.getPropertyValue(`--leaf-color-${semantic}-active`).trim()),
    };
  });

for (const theme of ['light', 'dark']) {
  test(`outline buttons deepen the hover border and only tint the background slightly gray on press (${theme})`, async ({
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

      const transitions = await button.evaluate((node) => {
        const style = getComputedStyle(node);
        return { properties: style.transitionProperty, durations: style.transitionDuration };
      });
      expect(transitions.properties).toContain('border-color');
      expect(transitions.properties).toContain('box-shadow');
      expect(transitions.properties.split(',').map((value) => value.trim())).toContain('color');
      expect(transitions.durations.split(',').every((value) => Number.parseFloat(value) > 0)).toBe(
        true,
      );
      await button.hover();
      await expect.poll(async () => (await appearance(button)).border).toBe(initial.hoverBorder);
      const hovered = await appearance(button);
      expect(hovered.border).not.toBe(initial.border);
      expect(hovered.color).toBe(initial.color);
      expect(hovered.background).toBe(initial.background);
      expect(hovered.shadow).toBe(initial.shadow);
      expect(await measure(button)).toEqual(before);

      await page.mouse.down();
      await expect(button).toHaveCSS('background-color', initial.activeBackground);
      const pressed = await appearance(button);
      expect(pressed.color).toBe(initial.color);
      expect(pressed.border).toBe(hovered.border);
      expect(pressed.shadow).toBe(initial.shadow);
      expect(pressed.background).not.toBe(initial.background);
      const gray = new TinyColor(pressed.backgroundRgb).toRgb();
      expect(gray.r).toBe(gray.g);
      expect(gray.g).toBe(gray.b);
      const restingGray = new TinyColor(initial.backgroundRgb).toRgb();
      expect(Math.abs(gray.r - restingGray.r)).toBeLessThanOrEqual(20);
      expect(await measure(button)).toEqual(before);

      await page.mouse.up();
      await expect(button).toHaveCSS('background-color', initial.background);
      expect((await appearance(button)).border).toBe(hovered.border);
      await page.mouse.move(0, 0);
      await expect.poll(async () => (await appearance(button)).border).toBe(initial.border);
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
      expect(new TinyColor(pressed.backgroundRgb).getLuminance()).toBeLessThan(
        new TinyColor(original.backgroundRgb).getLuminance(),
      );
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
  await expect(button).toHaveCSS('background-color', original.activeBackground);
  await expect(button).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.2) 0px 2px 4px 0px');
  await page.mouse.up();
  await expect(button).toHaveCSS('box-shadow', original.shadow);
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
    await button.evaluate((node) =>
      Promise.all(node.getAnimations().map((animation) => animation.finished)),
    );
    const focusColor = await button.evaluate((node) => getComputedStyle(node).outlineColor);
    const original = await appearance(button);
    expect(focusColor).not.toBe(original.active);
    await page.keyboard.down('Space');
    await expect.poll(async () => (await appearance(button)).border).toBe(original.activeBorder);
    const pressed = await appearance(button);
    await expect(button).toHaveCSS('color', original.activeColor);
    await expect(button).toHaveCSS('background-color', original.activeBackground);
    expect(pressed.shadow).toBe(original.shadow);
    await page.keyboard.up('Space');
    await expect(button).toHaveCSS('background-color', original.background);
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
  await expect(page.getByTestId('press-off')).toHaveCSS('transition-duration', /^0s(?:, 0s)*$/);
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
  const outline = page.getByTestId('press-outline');
  await expect(outline).toHaveCSS('transition-duration', '0s');
  await outline.hover();
  const hovered = await appearance(outline);
  await page.mouse.down();
  await expect(outline).toHaveCSS('background-color', hovered.activeBackground);
  await expect(outline).toHaveCSS('box-shadow', hovered.shadow);
  await page.mouse.up();
  await expect(outline).toHaveCSS('background-color', hovered.background);
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
