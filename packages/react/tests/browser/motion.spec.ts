import { expect, type Locator, test } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });

test('associated labels and quick reopening keep floating panels visible at their local origin', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  const field = page.getByRole('combobox', { name: 'Animated portal', exact: true });
  const label = page.getByText('Portal field label', { exact: true });
  for (let index = 0; index < 3; index++) {
    await label.click();
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    const panel = page.locator(`#${await field.getAttribute('aria-controls')}`);
    await expect(panel).toHaveAttribute('data-positioned', 'true');
    await expect
      .poll(() => panel.evaluate((element) => Number(getComputedStyle(element).opacity)), {
        timeout: 15_000,
      })
      .toBeGreaterThan(0.97);
    await expect(panel).toHaveCSS('transform', 'none');
    const origin = await panel.evaluate((element) =>
      getComputedStyle(element).transformOrigin.split(' ').map(Number.parseFloat),
    );
    const local = await panel.evaluate((element) => ({
      width: (element as HTMLElement).offsetWidth,
      height: (element as HTMLElement).offsetHeight,
      side: element.getAttribute('data-side'),
    }));
    expect(origin[0]).toBeCloseTo(local.width / 2, 0);
    expect(origin[1]).toBe(local.side === 'top' ? local.height : 0);
    await label.click();
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toHaveAttribute('data-positioned', 'true');
    await field.press('Escape');
    await expect(field).toHaveAttribute('aria-expanded', 'false');
  }
  const upward = page.getByRole('combobox', { name: 'Upward portal', exact: true });
  await upward.click();
  const panel = page.locator(`#${await upward.getAttribute('aria-controls')}`);
  await expect(panel).toHaveAttribute('data-positioned', 'true');
  await expect(panel).toHaveAttribute('data-side', 'top');
  await expect
    .poll(() => panel.evaluate((element) => Number(getComputedStyle(element).opacity)), {
      timeout: 15_000,
    })
    .toBeGreaterThan(0.97);
  const origin = await panel.evaluate((element) => ({
    origin: getComputedStyle(element).transformOrigin.split(' ').map(Number.parseFloat),
    width: element.clientWidth + 2,
    height: element.clientHeight + 2,
  }));
  expect(origin.origin[0]).toBeCloseTo(origin.width / 2, 0);
  expect(origin.origin[1]).toBeCloseTo(origin.height, 0);
});

test('time columns keep their selection visible without scrolling the surrounding range popup', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/?fixture=motion');
  const field = page.getByRole('combobox', { name: 'Local time range', exact: true });
  await field.click();
  const panel = page.getByRole('dialog', { name: 'Choose time range', exact: true });
  await expect(panel).toHaveAttribute('data-positioned', 'true');
  await expect
    .poll(() => panel.evaluate((element) => Number(getComputedStyle(element).opacity)), {
      timeout: 15_000,
    })
    .toBeGreaterThan(0.97);
  await expect(panel).toHaveJSProperty('scrollTop', 0);
  const hours = panel.getByRole('group', { name: 'Start', exact: true }).getByRole('listbox', {
    name: 'Hours',
    exact: true,
  });
  await expect
    .poll(() =>
      hours.evaluate((column) => {
        const selected = column.querySelector<HTMLElement>('[aria-selected="true"]');
        if (!selected) return false;
        return (
          selected.offsetTop >= column.scrollTop - 1 &&
          selected.offsetTop + selected.offsetHeight <= column.scrollTop + column.clientHeight + 1
        );
      }),
    )
    .toBe(true);
  await hours.getByRole('option', { name: '09', exact: true }).press('ArrowDown');
  await expect(hours.getByRole('option', { name: '10', exact: true })).toBeFocused();
  await expect(panel).toHaveJSProperty('scrollTop', 0);
  await panel.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(field).toHaveValue('10:00 ~ 18:00');
});

async function changeModalStep(dialog: Locator) {
  const next = dialog.getByRole('button', { name: 'Change modal step' });
  await next.evaluate((button) => {
    button.addEventListener(
      'click',
      () => {
        const surface = button.closest('[role="dialog"]');
        if (!surface) return;
        const before = Number.parseFloat(getComputedStyle(surface).height);
        const animate = surface.animate;
        // Capture creation rather than a later frame: a busy renderer may have
        // already finished the short animation when the next RAF is delivered.
        surface.animate = function (...args: Parameters<HTMLElement['animate']>) {
          const animation = animate.apply(this, args);
          const frames =
            animation.effect instanceof KeyframeEffect ? animation.effect.getKeyframes() : [];
          if (frames.some((frame) => frame.height)) {
            button.setAttribute(
              'data-height-motion',
              JSON.stringify({
                before,
                start: Number.parseFloat(String(frames[0]?.height ?? 0)),
                end: Number.parseFloat(String(frames.at(-1)?.height ?? 0)),
                duration: animation.effect?.getTiming().duration ?? 0,
              }),
            );
            surface.animate = animate;
          }
          return animation;
        };
      },
      { once: true },
    );
  });
  await next.click();
  await expect
    .poll(
      async () => JSON.parse((await next.getAttribute('data-height-motion')) ?? '{}').duration ?? 0,
    )
    .toBeGreaterThan(0);
  return JSON.parse((await next.getAttribute('data-height-motion')) ?? '{}') as {
    before: number;
    start: number;
    end: number;
  };
}

test('selection moves continuously, settles under rapid changes and retains panel state', async ({
  page,
}) => {
  await page.goto('/?fixture=motion&rtl=1');
  await page.getByRole('textbox', { name: 'Retained name', exact: true }).fill('kept value');
  const indicator = page.locator('.leaf-tabs__indicator');
  const longer = page.getByRole('tab', { name: 'Longer content', exact: true });
  await longer.evaluate((button) => {
    const marker = button.closest('.leaf-tabs')?.querySelector('.leaf-tabs__indicator');
    if (!(marker instanceof HTMLElement)) return;
    const before = marker.style.getPropertyValue('--leaf-indicator-x');
    // A transition event survives a delayed renderer frame, unlike sampling
    // getAnimations() after the whole transition may already have completed.
    const record = (event: TransitionEvent) => {
      if (event.target !== marker || event.propertyName !== 'transform') return;
      const style = getComputedStyle(marker);
      const property = style.transitionProperty.split(',').map((value) => value.trim());
      const durations = style.transitionDuration.split(',').map(Number.parseFloat);
      button.setAttribute(
        'data-motion-selection',
        JSON.stringify({
          animated: marker.style.getPropertyValue('--leaf-indicator-x') !== before,
          duration: (durations[property.indexOf('transform') % durations.length] ?? 0) * 1000,
        }),
      );
      marker.removeEventListener('transitionrun', record);
    };
    marker.addEventListener('transitionrun', record);
  });
  await page.getByRole('tab', { name: 'Longer content', exact: true }).click();
  await expect
    .poll(
      async () => JSON.parse((await longer.getAttribute('data-motion-selection')) ?? '{}').animated,
    )
    .toBe(true);
  expect(
    JSON.parse((await longer.getAttribute('data-motion-selection')) ?? '{}').duration,
  ).toBeGreaterThan(0);
  await page.getByRole('tab', { name: 'Final', exact: true }).click();
  await expect
    .poll(
      () =>
        indicator.evaluate((marker) => {
          const selected = marker.closest('.leaf-tabs')?.querySelector('[aria-selected="true"]');
          return selected
            ? Math.abs(marker.getBoundingClientRect().x - selected.getBoundingClientRect().x)
            : Number.POSITIVE_INFINITY;
        }),
      { timeout: 15_000 },
    )
    .toBeLessThan(1);
  expect(await indicator.count()).toBe(1);
  await page.getByRole('tab', { name: 'Short', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Retained name', exact: true })).toHaveValue(
    'kept value',
  );
  await expect(page.getByRole('tab', { name: 'Short', exact: true })).toBeFocused();
});

test('a second row reorder starts from the running visual position and settles to natural layout', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  const row = page
    .getByRole('list', { name: 'Animated rows' })
    .locator('li')
    .filter({ hasText: 'Alpha' });
  await page.getByRole('button', { name: 'Reverse', exact: true }).evaluate((button) => {
    button.addEventListener(
      'click',
      () => {
        requestAnimationFrame(() => {
          const file = document.querySelector('[data-motion-key="file-Alpha"]');
          const motion = file
            ?.getAnimations()
            .find(
              (animation) =>
                animation.effect instanceof KeyframeEffect &&
                animation.effect.getKeyframes().some((frame) => frame.translate),
            );
          const frames =
            motion?.effect instanceof KeyframeEffect ? motion.effect.getKeyframes() : [];
          button.setAttribute('data-file-opacity', String(frames.at(-1)?.opacity));
        });
      },
      { once: true },
    );
  });
  await page.getByRole('button', { name: 'Reverse', exact: true }).click();
  await expect
    .poll(async () =>
      Number(
        await page
          .getByRole('button', { name: 'Reverse', exact: true })
          .getAttribute('data-file-opacity'),
      ),
    )
    .toBeCloseTo(0.65, 2);
  await page.getByRole('button', { name: 'Rotate', exact: true }).evaluate((button) => {
    button.addEventListener(
      'click',
      () => {
        const alpha = document.querySelector('[data-motion-key="Alpha"]');
        if (!alpha) return;
        const before = alpha.getBoundingClientRect().y;
        requestAnimationFrame(() => {
          const motion = alpha
            .getAnimations()
            .find(
              (animation) =>
                animation.effect instanceof KeyframeEffect &&
                animation.effect.getKeyframes().some((frame) => frame.translate),
            );
          const frames =
            motion?.effect instanceof KeyframeEffect ? motion.effect.getKeyframes() : [];
          const first = Number.parseFloat(
            String(frames[0]?.translate ?? '0 0').split(' ')[1] ?? '0',
          );
          const current = Number.parseFloat(getComputedStyle(alpha).translate.split(' ')[1] ?? '0');
          const start = alpha.getBoundingClientRect().y - current + first;
          button.setAttribute('data-motion-jump', String(Math.abs(start - before)));
        });
      },
      { once: true },
    );
  });
  await page.getByRole('button', { name: 'Rotate', exact: true }).click();
  await expect
    .poll(async () =>
      Number(
        await page
          .getByRole('button', { name: 'Rotate', exact: true })
          .getAttribute('data-motion-jump'),
      ),
    )
    .toBeLessThan(1);
  await expect(row).toHaveCSS('translate', 'none');
  await expect(page.getByRole('list', { name: 'Animated rows' }).locator('li')).toHaveText([
    'Beta',
    'Alpha',
    'Gamma',
  ]);
});

test('loading preserves button width and accessible name', async ({ page }) => {
  await page.goto('/?fixture=motion');
  const button = page.getByTestId('busy-button');
  const before = (await button.boundingBox())?.width ?? 0;
  await page.getByRole('button', { name: 'Toggle loading', exact: true }).click();
  await expect(button).toHaveAccessibleName('Save changes');
  await expect(button).toHaveAttribute('aria-busy', 'true');
  expect((await button.boundingBox())?.width).toBeCloseTo(before, 1);
});

test('motion preferences stop nested and portalled animation while an explicit child can resume', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  await expect(page.getByTestId('off-spinner').locator('svg')).toHaveCSS('animation-name', 'none');
  await expect(page.getByTestId('resumed-spinner').locator('svg')).not.toHaveCSS(
    'animation-name',
    'none',
  );
  await page.getByRole('button', { name: 'Toggle motion', exact: true }).click();
  await expect(page.getByTestId('main-spinner').locator('svg')).toHaveCSS('animation-name', 'none');
  await page.getByRole('combobox', { name: 'Animated portal' }).click();
  await expect(page.getByRole('listbox')).toBeVisible();
  const panel = page.getByRole('listbox');
  expect(
    await panel.evaluate((node) =>
      getComputedStyle(node)
        .transitionDuration.split(',')
        .every((part) => Number.parseFloat(part) === 0),
    ),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('combobox', { name: 'Animated portal' })).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByTestId('resumed-spinner').locator('svg')).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(page.locator('.leaf-float-group__action').first()).toHaveCSS(
    'transition-delay',
    '0s',
  );
  await page.getByRole('tab', { name: 'Final', exact: true }).click();
  expect(
    await page.locator('.leaf-tabs__panels').evaluate((node) => node.getAnimations().length),
  ).toBe(0);
});

test('dialog content height changes continuously without losing input state or focus restoration', async ({
  page,
}) => {
  await page.goto('/?fixture=motion');
  const trigger = page.getByRole('button', { name: 'Open morphing modal', exact: true });
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Morphing modal' });
  const input = dialog.getByRole('textbox', { name: 'Retained modal name' });
  await expect(input).toBeFocused();
  await input.fill('still here');
  const heights = await changeModalStep(dialog);
  expect(heights.start).toBeCloseTo(heights.before, 0);
  expect(heights.end).toBeGreaterThan(heights.before + 100);
  await expect
    .poll(async () => (await dialog.boundingBox())?.height ?? 0)
    .toBeGreaterThan(heights.end - 1);
  await expect(input).toHaveValue('still here');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('a dialog uses its current constrained height after a viewport resize', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto('/?fixture=motion');
  await page.getByRole('button', { name: 'Open tall modal', exact: true }).press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Morphing modal' });
  await expect(dialog).toBeVisible();
  await page.setViewportSize({ width: 1100, height: 500 });
  await expect(dialog).toHaveCSS('height', '452px');
  expect(
    await dialog
      .locator('.leaf-modal__body')
      .evaluate((body) => body.scrollHeight > body.clientHeight),
  ).toBe(true);
  const heights = await changeModalStep(dialog);
  expect(heights.start).toBeCloseTo(heights.before, 0);
  expect(heights.start).toBeCloseTo(452, 0);
  expect(heights.end).toBeLessThan(heights.start - 40);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(dialog).toHaveCSS('height', `${heights.end}px`);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});
