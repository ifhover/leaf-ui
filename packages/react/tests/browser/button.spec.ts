import { readability, TinyColor } from '@ctrl/tinycolor';
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
  await expect.poll(() => button.evaluate((node) => getComputedStyle(node).color)).not.toBe(before);
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

// Capture geometry from the actual running wave. Test interpolation separately
// at fixed timeline positions: headless WebKit may skip an entire short phase.
async function watchWave(button: Locator) {
  await button.evaluate((node) => {
    const wave = node.querySelector<HTMLElement>('.leaf-button__wave');
    if (!wave) throw new Error('Missing button wave');
    if (wave.dataset.watched) return;
    wave.dataset.watched = 'true';
    const nativeAnimate = wave.animate.bind(wave);
    wave.animate = (frames, options) => {
      const animation = nativeAnimate(frames, options);
      node.removeAttribute('data-wave-finished');
      node.removeAttribute('data-wave-sample');
      const sequence = Number(node.getAttribute('data-wave-starts')) + 1;
      node.setAttribute('data-wave-starts', String(sequence));
      animation.finished.then(
        () => {
          if (Number(node.getAttribute('data-wave-starts')) === sequence)
            node.setAttribute('data-wave-finished', 'true');
        },
        () => node.setAttribute('data-wave-cancelled', 'true'),
      );
      const sample = () => {
        if (animation.playState !== 'running') return;
        const duration = Number(animation.effect?.getTiming().duration);
        const progress = Number(animation.currentTime) / duration;
        const style = getComputedStyle(wave);
        const shadow = style.boxShadow.replace(/^rgba?\([^)]+\)\s*/, '').split(/\s+/);
        const spread = Number.parseFloat(shadow[3] ?? '0');
        const opacity = Number(style.opacity);
        if (progress > 0 && progress < 0.7 && spread > 0) {
          const box = node.getBoundingClientRect();
          const ring = wave.getBoundingClientRect();
          node.setAttribute(
            'data-wave-sample',
            JSON.stringify({
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              spread,
              blur: Number.parseFloat(shadow[2] ?? '0'),
              ringWidth: ring.width,
              ringHeight: ring.height,
              opacity,
              radius: Number.parseFloat(style.borderTopLeftRadius),
              buttonRadius: Number.parseFloat(getComputedStyle(node).borderTopLeftRadius),
              color: style.color,
              pointerEvents: style.pointerEvents,
            }),
          );
        }
        requestAnimationFrame(sample);
      };
      // WebKit may defer the start until its next rendering update. Wait for
      // that start rather than dropping the sampler on an initial idle frame.
      animation.ready.then(sample, () => {});
      return animation;
    };
  });
}

async function waveSample(button: Locator) {
  await expect
    .poll(async () => {
      const sample = JSON.parse((await button.getAttribute('data-wave-sample')) ?? '{}');
      return sample.spread ?? 0;
    })
    .toBeGreaterThan(0);
  return JSON.parse((await button.getAttribute('data-wave-sample')) ?? '{}') as {
    x: number;
    y: number;
    width: number;
    height: number;
    spread: number;
    blur: number;
    ringWidth: number;
    ringHeight: number;
    opacity: number;
    radius: number;
    buttonRadius: number;
    color: string;
    pointerEvents: string;
  };
}

async function hold(page: Page, button: Locator) {
  await button.scrollIntoViewIfNeeded();
  const before = await measure(button);
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  return before;
}

async function wavePhases(button: Locator) {
  return button.evaluate(async (node) => {
    const wave = node.querySelector<HTMLElement>('.leaf-button__wave');
    const animation = wave?.getAnimations()[0];
    if (!wave || !animation) throw new Error('Expected a running wave');
    const duration = Number(animation.effect?.getTiming().duration);
    const time = animation.currentTime;
    animation.pause();
    await animation.ready;
    try {
      const sampleAt = (progress: number) => {
        animation.currentTime = duration * progress;
        const style = getComputedStyle(wave);
        const shadow = style.boxShadow.replace(/^rgba?\([^)]+\)\s*/, '').split(/\s+/);
        return { spread: Number.parseFloat(shadow[3] ?? '0'), opacity: Number(style.opacity) };
      };
      return [sampleAt(0.1), sampleAt(0.35), sampleAt(0.85)] as const;
    } finally {
      animation.currentTime = time;
      animation.play();
    }
  });
}

for (const theme of ['light', 'dark']) {
  test(`activation expands a fading outer wave while every button stays still (${theme})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=motion&theme=${theme}`);
    for (const id of [
      'solid',
      'outline',
      'group-first',
      'group-last',
      'danger',
      'icon',
      'custom',
    ]) {
      const button = page.getByTestId(`press-${id}`);
      await watchWave(button);
      const before = await hold(page, button);
      expect(await measure(button)).toEqual(before);
      expect(await button.getAttribute('data-wave-starts')).toBeNull();
      await page.mouse.up();
      const sample = await waveSample(button);
      expect(sample.x).toBeCloseTo(before.x, 1);
      expect(sample.y).toBeCloseTo(before.y, 1);
      expect(sample.width).toBeCloseTo(before.width, 1);
      expect(sample.height).toBeCloseTo(before.height, 1);
      expect(sample.spread).toBeGreaterThan(0);
      expect(sample.spread).toBeLessThanOrEqual(6);
      expect(sample.blur).toBe(0);
      expect(sample.ringWidth).toBeCloseTo(before.width, 1);
      expect(sample.ringHeight).toBeCloseTo(before.height, 1);
      expect(sample.radius).toBeCloseTo(sample.buttonRadius, 1);
      expect(sample.opacity).toBeGreaterThan(0);
      expect(sample.opacity).toBeLessThan(0.2);
      expect(sample.pointerEvents).toBe('none');
      if (id === 'danger') {
        expect(sample.color).toMatch(
          theme === 'dark' ? /rgba?\(239, 133, 133/ : /rgba?\(200, 60, 60/,
        );
      }
      if (id === 'custom') expect(sample.color).toMatch(/rgba?\(37, 99, 235/);
      if (id === 'solid') {
        const [expanding, expanded, fading] = await wavePhases(button);
        expect(expanding.spread).toBeGreaterThan(0);
        expect(expanding.spread).toBeLessThan(6);
        expect(expanded.spread).toBeCloseTo(6, 2);
        expect(fading.spread).toBeCloseTo(6, 2);
        expect(expanding.opacity).toBeGreaterThan(expanded.opacity);
        expect(expanded.opacity).toBeGreaterThan(fading.opacity);
        expect(fading.opacity).toBeGreaterThan(0);
      }
      await expect(button).toHaveAttribute('data-wave-finished', 'true');
      await page.mouse.move(0, 0);
      expect(await measure(button)).toEqual(before);
      const wave = button.locator('.leaf-button__wave');
      await expect(wave).toHaveCSS('opacity', '0');
      expect(await wave.evaluate((node) => node.getAnimations().length)).toBe(0);
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
    return {
      color: style.color,
      background: style.backgroundColor,
      backgroundRgb: { r, g, b },
      border: style.borderTopColor,
      hover: style.getPropertyValue(`--leaf-color-${semantic}-hover`).trim(),
      active: style.getPropertyValue(`--leaf-color-${semantic}-active`).trim(),
    };
  });

for (const theme of ['light', 'dark']) {
  test(`soft buttons keep a neutral gray surface, readable text and stable geometry (${theme})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=motion&theme=${theme}`);
    const button = page.getByTestId('press-soft');
    await button.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const initial = await appearance(button);
    const muted = await button.evaluate((node) =>
      getComputedStyle(node).getPropertyValue('--leaf-color-surface-muted').trim(),
    );
    expect(initial.background).toBe(new TinyColor(muted).toRgbString());
    expect(readability(initial.color, initial.background)).toBeGreaterThanOrEqual(4.5);
    const before = await measure(button);
    expect(before.height).toBe(36);
    await expect(button.locator('.leaf-button__wave')).toHaveCount(0);
    await button.hover();
    await expect
      .poll(async () => (await appearance(button)).background)
      .not.toBe(initial.background);
    const hovered = await appearance(button);
    expect(hovered.color).toBe(initial.color);
    expect(await measure(button)).toEqual(before);
    await page.mouse.down();
    await expect
      .poll(async () => (await appearance(button)).background)
      .not.toBe(hovered.background);
    const pressed = await appearance(button);
    expect(readability(pressed.color, pressed.backgroundRgb)).toBeGreaterThanOrEqual(4.5);
    expect(await measure(button)).toEqual(before);
    await page.mouse.up();
    await page.mouse.move(0, 0);
    await expect(button).toHaveCSS('background-color', initial.background);
  });

  test(`hover and press use distinct action colors, preserving outlined surfaces (${theme})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=motion&theme=${theme}`);
    for (const id of [
      'solid',
      'outline',
      'danger',
      'danger-outline',
      'custom',
      'override-solid',
      'override-outline',
      'override-danger',
    ]) {
      const button = page.getByTestId(`press-${id}`);
      await button.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      const original = await appearance(button);
      const outlined = id.includes('outline');
      const hover = new TinyColor(original.hover).toRgbString();
      const active = new TinyColor(original.active).toRgbString();
      expect(hover).not.toBe(active);
      await button.hover();
      if (outlined) {
        await expect(button).toHaveCSS('color', hover);
        await expect(button).toHaveCSS('border-top-color', hover);
        await expect(button).toHaveCSS('background-color', original.background);
      } else {
        await expect(button).toHaveCSS('background-color', hover);
        await expect(button).toHaveCSS('color', original.color);
      }
      await page.mouse.down();
      if (outlined) {
        await expect(button).toHaveCSS('color', active);
        await expect(button).toHaveCSS('border-top-color', active);
        await expect(button).toHaveCSS('background-color', original.background);
      } else {
        await expect(button).toHaveCSS('background-color', active);
      }
      if (!id.startsWith('override') && !outlined) {
        expect(readability(hover, original.color)).toBeGreaterThanOrEqual(4.5);
        expect(readability(active, original.color)).toBeGreaterThanOrEqual(4.5);
      }
      await page.mouse.up();
      await page.mouse.move(0, 0);
      await expect(button).toHaveCSS('background-color', original.background);
      await expect(button).toHaveCSS('color', original.color);
      await expect(button).toHaveCSS('border-top-color', original.border);
    }
    for (const id of ['soft', 'danger-soft']) {
      const button = page.getByTestId(`press-${id}`);
      const danger = id.startsWith('danger');
      await button.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      const original = await appearance(button);
      await button.hover();
      if (danger) {
        await expect(button).toHaveCSS('color', new TinyColor(original.hover).toRgbString());
      } else {
        await expect(button).toHaveCSS('color', original.color);
      }
      await expect
        .poll(async () => (await appearance(button)).background)
        .not.toBe(original.background);
      const hovered = await appearance(button);
      await page.mouse.down();
      if (danger) {
        await expect(button).toHaveCSS('color', new TinyColor(original.active).toRgbString());
      }
      await expect
        .poll(async () => (await appearance(button)).background)
        .not.toBe(hovered.background);
      await page.mouse.up();
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

test('rapid activation and leaving a toolbar action neither shifts content nor accumulates waves', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  const button = page.getByRole('button', { name: 'Create', exact: true });
  await button.scrollIntoViewIfNeeded();
  await watchWave(button);
  const before = await measure(button);
  await button.click({ clickCount: 4, delay: 35 });
  await page.mouse.move(0, 0);
  await expect(button).toHaveAttribute('data-wave-starts', '4');
  await expect(button).toHaveAttribute('data-wave-cancelled', 'true');
  expect(await button.locator('.leaf-button__wave').count()).toBe(1);
  expect(await measure(button)).toEqual(before);
  expect(
    await button.locator('.leaf-button__wave').evaluate((node) => node.getAnimations().length),
  ).toBeLessThanOrEqual(1);
  await expect(button).toHaveAttribute('data-wave-finished', 'true');
  expect(await measure(button)).toEqual(before);
  expect(
    await button.locator('.leaf-button__wave').evaluate((node) => node.getAnimations().length),
  ).toBe(0);
});

test('Space, Enter and touch retain native activation, focus and accessible names', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  const button = page.getByTestId('press-solid');
  await watchWave(button);
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
  await expect(button).toHaveAttribute('data-wave-starts', '1');
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('data-wave-starts', '2');
  await expect(button).toHaveAttribute('data-click-count', '2');
  await expect(button).toBeFocused();
  expect(await measure(button)).toEqual(before);
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) {
    await button.tap();
    await expect(button).toHaveAttribute('data-wave-starts', '3');
    await expect(button).toHaveAttribute('data-click-count', '3');
  }
  await expect(button).toHaveAccessibleName('solid');
  for (const id of ['press-soft', 'press-danger-soft']) {
    const softButton = page.getByTestId(id);
    await softButton.evaluate((node) => {
      node.addEventListener('click', () => {
        node.setAttribute(
          'data-click-count',
          String(Number(node.getAttribute('data-click-count')) + 1),
        );
      });
    });
    await softButton.click();
    await softButton.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('Enter');
    await expect(softButton).toBeFocused();
    await expect(softButton).toHaveAttribute('data-click-count', '3');
    expect(await softButton.locator('.leaf-button__wave').count()).toBe(0);
  }
  for (const id of ['press-disabled', 'press-loading']) {
    const disabled = page.getByTestId(id);
    await watchWave(disabled);
    await expect(disabled).toBeDisabled();
    const before = await hold(page, disabled);
    await page.mouse.up();
    expect(await measure(disabled)).toEqual(before);
    expect(await disabled.getAttribute('data-wave-starts')).toBeNull();
  }
});

test('regional, nested, portal and live system motion preferences govern waves', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  const off = page.getByTestId('press-off');
  const resumed = page.getByTestId('press-resumed');
  await watchWave(off);
  await watchWave(resumed);
  await off.click();
  expect(await off.getAttribute('data-wave-starts')).toBeNull();
  await resumed.click();
  await expect(resumed).toHaveAttribute('data-wave-starts', '1');
  await page.getByRole('button', { name: 'Toggle motion', exact: true }).click();
  await page.getByRole('button', { name: 'Open morphing modal', exact: true }).click();
  const portal = page.getByTestId('press-portal');
  await watchWave(portal);
  await portal.click();
  expect(await portal.getAttribute('data-wave-starts')).toBeNull();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Toggle motion', exact: true }).click();
  await page.getByRole('button', { name: 'Open morphing modal', exact: true }).click();
  await watchWave(portal);
  await portal.click();
  await expect(portal).toHaveAttribute('data-wave-starts', '1');
  await page.keyboard.press('Escape');
  const button = page.getByTestId('press-solid');
  await watchWave(button);
  await button.click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(button.locator('.leaf-button__wave')).toHaveCSS('display', 'none');
  await expect
    .poll(() =>
      button.locator('.leaf-button__wave').evaluate((node) => node.getAnimations().length),
    )
    .toBe(0);
  const count = await button.getAttribute('data-wave-starts');
  await button.click();
  expect(await button.getAttribute('data-wave-starts')).toBe(count);
  await resumed.click();
  expect(await resumed.getAttribute('data-wave-starts')).toBe('1');
});

test('disabling an active region cancels transient decorations', async ({ page }) => {
  await page.goto('/?fixture=motion');
  const scope = page.getByTestId('motion-scope');
  // Use a long regional token so cancellation has no brief-animation timing race.
  await scope.evaluate((node) =>
    (node as HTMLElement).style.setProperty('--leaf-motion-duration', '2s'),
  );
  const button = page.getByTestId('press-solid');
  await watchWave(button);
  await button.click();
  await page.getByRole('button', { name: 'Toggle motion', exact: true }).click();
  await expect(button).toHaveAttribute('data-wave-cancelled', 'true');
  expect(
    await button.locator('.leaf-button__wave').evaluate((node) => node.getAnimations().length),
  ).toBe(0);
});

test('forced colors retains clear keyboard focus without decorative waves', async ({
  page,
  browserName,
}) => {
  test.skip(browserName === 'webkit', 'WebKit does not emulate forced-colors');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/?fixture=motion');
  const button = page.getByTestId('press-solid');
  await watchWave(button);
  await button.focus();
  await page.keyboard.press('Space');
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-style', 'solid');
  expect(await button.getAttribute('data-wave-starts')).toBeNull();
  await expect(button.locator('.leaf-button__wave')).toHaveCSS('display', 'none');
});

test('floating and back-to-top actions use the same wave without pressing or hover movement', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  for (const id of ['press-float', 'press-backtop']) {
    const button = page.getByTestId(id);
    await watchWave(button);
    const before = await hold(page, button);
    expect(await measure(button)).toEqual(before);
    await page.mouse.up();
    await expect(button).toHaveAttribute('data-wave-starts', '1');
    expect(await measure(button)).toEqual(before);
    const radius = await button.evaluate((node) => getComputedStyle(node).borderTopLeftRadius);
    await expect(button.locator('.leaf-button__wave')).toHaveCSS('border-top-left-radius', radius);
    await expect(button).toHaveAttribute('data-wave-finished', 'true');
    await page.mouse.move(0, 0);
    expect(await measure(button)).toEqual(before);
  }
});

test('a full-width wave does not create scrollbars or shift a surrounding scroll container', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  const button = page.getByTestId('press-scroll');
  await button.evaluate((node) => {
    const frame = node.parentElement;
    if (!frame) throw new Error('Missing scroll frame');
    const baseline = { width: frame.scrollWidth, height: frame.scrollHeight };
    node.addEventListener('click', () => {
      const sample = () => {
        if (frame.scrollWidth !== baseline.width || frame.scrollHeight !== baseline.height) {
          frame.setAttribute('data-overflow-changed', 'true');
        }
        if (node.querySelector('.leaf-button__wave')?.getAnimations().length)
          requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
  });
  await watchWave(button);
  const frame = page.getByTestId('wave-scroll-frame');
  await button.click();
  await waveSample(button);
  await expect(button).toHaveAttribute('data-wave-finished', 'true');
  expect(await frame.getAttribute('data-overflow-changed')).toBeNull();
  expect(
    await frame.evaluate((node) => ({ width: node.scrollWidth, client: node.clientWidth })),
  ).toEqual({ width: 240, client: 240 });
});
