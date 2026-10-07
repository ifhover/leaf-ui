import { expect as baseExpect, type Locator, type Page, test } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });
test.setTimeout(120_000);
const expect = baseExpect.configure({ timeout: 15_000 });

const measure = (button: Locator) =>
  button.evaluate(async (node) => {
    // Read animation and geometry in the same rendered frame on every engine.
    await new Promise(requestAnimationFrame);
    const box = node.getBoundingClientRect();
    const element = node as HTMLElement;
    const style = getComputedStyle(node);
    return {
      centerX: box.x + box.width / 2,
      centerY: box.y + box.height / 2,
      width: box.width,
      height: box.height,
      layoutWidth: element.offsetWidth,
      layoutHeight: element.offsetHeight,
      scale: style.scale === 'none' ? 1 : Number.parseFloat(style.scale),
      translate: style.translate,
      transform: style.transform,
    };
  });

async function hold(page: Page, button: Locator) {
  await button.scrollIntoViewIfNeeded();
  const before = await measure(button);
  await page.mouse.move(before.centerX, before.centerY);
  await page.mouse.down();
  return before;
}

for (const theme of ['light', 'dark']) {
  test(`buttons shrink around their center and stay in place after release and leave (${theme})`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=motion&theme=${theme}`);
    const buttons = [
      ...['solid', 'soft', 'outline', 'ghost', 'group-first', 'group-last'].map((variant) =>
        page.getByTestId(`press-${variant}`),
      ),
      page.getByRole('button', { name: 'Create', exact: true }),
      page.getByRole('button', { name: 'Menu', exact: true }),
    ];
    for (const button of buttons) {
      await button.evaluate((node) => {
        node.addEventListener('transitionend', (event) => {
          if (!(event instanceof TransitionEvent) || event.propertyName !== 'scale') return;
          node.setAttribute('data-press-duration', String(event.elapsedTime * 1000));
        });
      });
      const before = await hold(page, button);
      await expect.poll(async () => (await measure(button)).scale).toBeCloseTo(0.97, 3);
      await expect
        .poll(async () => Number(await button.getAttribute('data-press-duration')))
        .toBeGreaterThan(0);
      const pressed = await measure(button);
      expect(pressed.centerX).toBeCloseTo(before.centerX, 1);
      expect(pressed.centerY).toBeCloseTo(before.centerY, 1);
      expect(pressed.width).toBeCloseTo(before.width * 0.97, 1);
      expect(pressed.height).toBeCloseTo(before.height * 0.97, 1);
      expect(pressed.layoutWidth).toBe(before.layoutWidth);
      expect(pressed.layoutHeight).toBe(before.layoutHeight);
      expect(pressed.translate).toBe('none');
      expect(pressed.transform).toBe('none');
      await page.mouse.up();
      await expect.poll(async () => (await measure(button)).scale).toBe(1);
      const released = await measure(button);
      await page.mouse.move(0, 0);
      // Hover exit must not initiate a second geometry transition.
      const frames = await button.evaluate(async (node) => {
        const samples = [];
        for (let frame = 0; frame < 12; frame++) {
          await new Promise(requestAnimationFrame);
          const box = node.getBoundingClientRect();
          samples.push({ x: box.x, y: box.y, width: box.width, height: box.height });
        }
        return samples;
      });
      for (const frame of frames) {
        expect(frame.x + frame.width / 2).toBeCloseTo(released.centerX, 1);
        expect(frame.y + frame.height / 2).toBeCloseTo(released.centerY, 1);
        expect(frame.width).toBeCloseTo(before.width, 1);
        expect(frame.height).toBeCloseTo(before.height, 1);
      }
      // Also release outside before the return transition has settled.
      await hold(page, button);
      await expect.poll(async () => (await measure(button)).scale).toBeCloseTo(0.97, 3);
      await page.mouse.move(0, 0);
      await page.mouse.up();
      await expect.poll(async () => (await measure(button)).scale).toBe(1);
      const outside = await measure(button);
      expect(outside.centerX).toBeCloseTo(before.centerX, 1);
      expect(outside.centerY).toBeCloseTo(before.centerY, 1);
    }
  });
}

test('releasing and immediately leaving a toolbar button returns smoothly without a position jump', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  const button = page.getByRole('button', { name: 'Create', exact: true });
  const before = await hold(page, button);
  await expect.poll(async () => (await measure(button)).scale).toBeCloseTo(0.97, 3);
  await page.mouse.up();
  await page.mouse.move(0, 0);
  const frames = await button.evaluate(async (node) => {
    const samples = [];
    for (let frame = 0; frame < 24; frame++) {
      await new Promise(requestAnimationFrame);
      const box = node.getBoundingClientRect();
      samples.push({
        centerX: box.x + box.width / 2,
        centerY: box.y + box.height / 2,
        width: box.width,
      });
    }
    return samples;
  });
  let lastWidth = before.width * 0.97;
  for (const frame of frames) {
    expect(frame.centerX).toBeCloseTo(before.centerX, 1);
    expect(frame.centerY).toBeCloseTo(before.centerY, 1);
    expect(frame.width).toBeGreaterThanOrEqual(lastWidth - 0.1);
    expect(frame.width).toBeLessThanOrEqual(before.width + 0.1);
    lastWidth = frame.width;
  }
  await expect.poll(async () => (await measure(button)).scale).toBe(1);
});

test('keyboard press animates while disabled and loading buttons retain their size', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  const button = page.getByTestId('press-solid');
  await button.focus();
  await page.keyboard.down('Space');
  await expect.poll(async () => (await measure(button)).scale).toBeCloseTo(0.97, 3);
  await page.keyboard.up('Space');
  await expect.poll(async () => (await measure(button)).scale).toBe(1);
  await expect(button).toBeFocused();
  for (const id of ['press-disabled', 'press-loading']) {
    const disabled = page.getByTestId(id);
    await expect(disabled).toBeDisabled();
    const before = await hold(page, disabled);
    expect((await measure(disabled)).width).toBe(before.width);
    expect((await measure(disabled)).scale).toBe(1);
    await page.mouse.up();
  }
});

test('scoped and system motion settings apply to nested and portalled buttons', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  const off = page.getByTestId('press-off');
  await hold(page, off);
  expect((await measure(off)).scale).toBe(1);
  await page.mouse.up();
  const resumed = page.getByTestId('press-resumed');
  await hold(page, resumed);
  await expect.poll(async () => (await measure(resumed)).scale).toBeCloseTo(0.97, 3);
  await page.mouse.up();
  await page.getByRole('button', { name: 'Toggle motion', exact: true }).click();
  await page.getByRole('button', { name: 'Open morphing modal', exact: true }).click();
  const portal = page.getByTestId('press-portal');
  await hold(page, portal);
  expect((await measure(portal)).scale).toBe(1);
  await page.mouse.up();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Toggle motion', exact: true }).click();
  await page.getByRole('button', { name: 'Open morphing modal', exact: true }).click();
  await hold(page, portal);
  await expect.poll(async () => (await measure(portal)).scale).toBeCloseTo(0.97, 3);
  await page.mouse.up();
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const button of [page.getByTestId('press-solid'), resumed]) {
    await hold(page, button);
    expect((await measure(button)).scale).toBe(1);
    expect(await button.evaluate((node) => node.getAnimations().length)).toBe(0);
    await page.mouse.up();
  }
});
