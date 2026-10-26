import { expect, type Locator, test } from '@playwright/test';
import { expectAccessible } from './helpers/accessibility';

const resolveStyle = (locator: Locator, property: string, value: string) =>
  locator.evaluate(
    (node, { property, value }) => {
      const probe = document.createElement('span');
      probe.style.setProperty(property, value);
      node.append(probe);
      const resolved = getComputedStyle(probe).getPropertyValue(property);
      probe.remove();
      return resolved;
    },
    { property, value },
  );

// WebKit may serialize a finished color transition in oklab rather than rgb.
const expectColor = (locator: Locator, value: string) =>
  expect
    .poll(
      () =>
        locator.evaluate((node, expected) => {
          const context = document.createElement('canvas').getContext('2d');
          if (!context) throw new Error('Canvas context unavailable');
          const channels = (color: string) => {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            return [...context.getImageData(0, 0, 1, 1).data];
          };
          const actual = channels(getComputedStyle(node).color);
          const target = channels(expected);
          return actual.every((channel, index) => Math.abs(channel - (target[index] ?? 0)) <= 1);
        }, value),
      { timeout: 20_000 },
    )
    .toBe(true);

const expectFeedback = (locator: Locator, color: string) =>
  expect
    .poll(
      () =>
        locator.evaluate((node) =>
          getComputedStyle(node, '::before').getPropertyValue('background-color'),
        ),
      // WebKit on Windows can finish a 200ms transition several seconds late.
      { timeout: 20_000 },
    )
    .toBe(color);

const expectMotionEnd = (locator: Locator, property: 'opacity' | 'inset', value: string) =>
  expect
    .poll(
      () =>
        locator.evaluate(
          (node, property) => getComputedStyle(node, '::before').getPropertyValue(property),
          property,
        ),
      { timeout: 20_000 },
    )
    .toBe(value);

for (const theme of ['light', 'dark']) {
  test(`built-in raised appearance reaches collapsed popups ${theme}`, async ({ page }) => {
    await page.goto(`/?fixture=menu&popup=1&builtin=1&collapsed=1&theme=${theme}`);
    await expect(page.getByRole('navigation')).toHaveClass(/leaf-menu--raised/);
    await page.getByRole('menuitem', { name: 'Resources', exact: true }).click();
    const popup = page.locator('.leaf-menu__popup--raised');
    await expect(popup).toBeVisible();
    const selected = popup.getByRole('menuitem', { name: 'Components', exact: true });
    await expect(selected).toHaveAttribute('aria-current', 'page');
    await expect
      .poll(() => selected.evaluate((node) => getComputedStyle(node, '::before').borderTopWidth))
      .toBe('1px');
    await expect
      .poll(() => selected.evaluate((node) => getComputedStyle(node, '::before').boxShadow))
      .not.toBe('none');
    await page.screenshot({ path: test.info().outputPath(`menu-default-${theme}.png`) });
  });
}

for (const { english, suffix } of [
  { english: false, suffix: '' },
  { english: true, suffix: '&theme=dark&compact=1&rtl=1' },
]) {
  test(`compact submenu rows and trailing elements ${english ? 'en' : 'zh'} ${suffix || 'default'}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: english ? 375 : 1100, height: 800 });
    await page.goto(`/?fixture=menu&basic=1${english ? '&english=1' : ''}${suffix}`);
    const menu = page.getByRole('navigation').first();
    const parent = menu.getByRole('menuitem', {
      name: english ? 'Projects' : '项目管理',
      exact: true,
    });
    const selected = menu.getByRole('menuitem', {
      name: english ? 'Design resources' : '设计资源',
      exact: true,
    });
    const release = menu.getByRole('menuitem', {
      name: english ? 'Releases New' : '发布管理 新',
      exact: true,
    });
    const home = menu.getByRole('menuitem', {
      name: english ? 'Overview' : '工作台',
      exact: true,
    });
    const team = menu.getByRole('menuitem', {
      name: english ? 'Team members 12' : '团队成员 12',
      exact: true,
    });
    await expect(home).toHaveCSS('height', suffix.includes('compact') ? '32px' : '36px');
    await expect(home.locator('.leaf-menu__icon svg')).toHaveCSS('width', '16px');
    await expect(home).toHaveCSS('gap', '12px');
    await expect(parent).not.toHaveAttribute('data-selected');
    await expect(parent).not.toHaveAttribute('data-active-parent');
    await expect(parent).not.toHaveAttribute('aria-current');
    await expect(selected).toHaveAttribute('aria-current', 'page');
    const submenu = menu.locator('.leaf-menu__submenu').first();
    const parentIcon = parent.locator('.leaf-menu__icon');
    await expect(submenu).toHaveAttribute('data-open', 'true');
    const iconBox = await parentIcon.boundingBox();
    const submenuBox = await submenu.boundingBox();
    const lineAlignment = await submenu.evaluate((node) => {
      const line = getComputedStyle(node, '::before');
      return {
        lineOffset: Number.parseFloat(line.left),
        width: line.width,
        color: line.backgroundColor,
      };
    });
    if (!iconBox || !submenuBox) throw new Error('Menu geometry is unavailable');
    expect(lineAlignment.width).toBe('1px');
    expect(lineAlignment.color).not.toBe('rgba(0, 0, 0, 0)');
    expect(
      Math.abs(submenuBox.x + lineAlignment.lineOffset - (iconBox.x + iconBox.width / 2)),
    ).toBeLessThanOrEqual(1);
    await expect(release).toHaveCSS('height', suffix.includes('compact') ? '26px' : '30px');
    await expect(menu.getByText('Beta', { exact: true })).toHaveCount(0);
    for (const item of [selected, release]) {
      const rowBox = await item.boundingBox();
      if (!rowBox) throw new Error('Submenu row geometry is unavailable');
      const lineX = submenuBox.x + lineAlignment.lineOffset;
      expect(
        suffix.includes('rtl') ? lineX - (rowBox.x + rowBox.width) : rowBox.x - lineX - 1,
      ).toBeGreaterThanOrEqual(8);
      await expect(item.locator('.leaf-menu__icon')).toHaveCount(0);
      await expect
        .poll(async () => {
          const parentLabel = await parent.locator('.leaf-menu__label').boundingBox();
          const childLabel = await item.locator('.leaf-menu__label').boundingBox();
          if (!parentLabel || !childLabel) return Number.POSITIVE_INFINITY;
          return suffix.includes('rtl')
            ? Math.abs(parentLabel.x + parentLabel.width - childLabel.x - childLabel.width)
            : Math.abs(parentLabel.x - childLabel.x);
        })
        .toBeLessThan(1);
    }
    const text = await menu.evaluate((node) =>
      getComputedStyle(node).getPropertyValue('--leaf-color-text').trim(),
    );
    const textColor = await resolveStyle(menu, 'color', text);
    const unselectedColor = await resolveStyle(
      menu,
      'color',
      'color-mix(in srgb, currentColor 80%, var(--leaf-color-surface))',
    );
    const hoverColor = await resolveStyle(
      menu,
      'background-color',
      await menu.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-menu-hover-background').trim(),
      ),
    );
    const selectedBackground = hoverColor;
    expect(hoverColor).toBe('rgba(0, 0, 0, 0.08)');
    await expectColor(release, unselectedColor);
    await expectColor(parent, unselectedColor);
    await parent.click();
    await expect(parent).toHaveAttribute('aria-expanded', 'false');
    await expectColor(parent, unselectedColor);
    await parent.click();
    await expect(parent).toHaveAttribute('aria-expanded', 'true');
    await expectColor(parent, unselectedColor);
    await expectColor(home.locator('.leaf-menu__icon svg'), unselectedColor);
    await expectColor(selected, textColor);
    for (const item of [home, release, selected]) {
      const wasSelected = (await item.getAttribute('aria-current')) === 'page';
      const before = await item.evaluate((node) => node.getBoundingClientRect().toJSON());
      await item.hover();
      await expectColor(
        item,
        (await item.getAttribute('aria-current')) === 'page' ? textColor : unselectedColor,
      );
      await expectFeedback(item, wasSelected ? selectedBackground : hoverColor);
      await page.mouse.down();
      await expectFeedback(item, wasSelected ? selectedBackground : hoverColor);
      expect(await item.evaluate((node) => node.getBoundingClientRect().toJSON())).toEqual(before);
      await page.mouse.up();
      await expect(item).toHaveAttribute('aria-current', 'page');
      await expectColor(item, textColor);
    }
    await expect(team.locator('.leaf-menu__extra')).toHaveText('12');
    await expect(parent).not.toHaveAttribute('data-selected');
    await expectFeedback(selected, selectedBackground);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test('group titles, collapsed navigation and custom controls', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/?fixture=menu');
  const menu = page.getByRole('navigation', { name: 'Grouped navigation' });
  const home = menu.getByRole('menuitem', { name: 'Home' });
  const settings = menu.getByRole('menuitem', { name: 'Settings' });
  await expect(menu.getByRole('group', { name: 'Workspace' })).toBeVisible();
  await home.focus();
  await page.keyboard.press('ArrowDown');
  await expect(settings).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(settings).toHaveAttribute('aria-current', 'page');
  const custom = page.getByRole('group', { name: 'Quick create' });
  const title = custom.locator('.leaf-menu__group-label');
  await expect(title).toBeVisible();
  expect(await title.evaluate((node) => getComputedStyle(node).fontSize)).toBe(
    await menu
      .locator('.leaf-menu__group-label')
      .first()
      .evaluate((node) => getComputedStyle(node).fontSize),
  );
  const input = custom.getByRole('textbox');
  expect((await title.boundingBox())?.x).toBe(
    (await custom.locator('.leaf-input').boundingBox())?.x,
  );
  await input.fill('New project');
  await input.press('Home');
  await expect(input).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(custom.getByRole('status')).toHaveText('Project created');
  await page.getByRole('button', { name: 'Toggle collapsed' }).click();
  await expect(menu.locator('.leaf-menu__group-label').first()).toBeHidden();
  await expect(title).toBeVisible();
  await expect(home).toBeVisible();
  await expect(settings).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Toggle collapsed' }).click();
  await expect(menu.locator('.leaf-menu__group-label').first()).toBeVisible();
  await expect(input).toHaveValue('New project');
  // WebKit on Windows can stall long enough to sample only partway through the
  // 200ms reveal. Keep the exact final value while allowing the slow frame.
  await expect(settings.locator('.leaf-menu__label')).toHaveCSS('opacity', '1', {
    timeout: 20_000,
  });
  await expect(menu).toHaveCSS('width', '240px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const suffix of ['', '&theme=dark&compact=1&rtl=1']) {
  test(`collapsed navigation popup ${suffix || 'default'}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(`/?fixture=menu&popup=1&collapsed=1${suffix}`);
    const root = page.getByRole('navigation', { name: 'Popup navigation' });
    const trigger = root.getByRole('menuitem', { name: 'Resources' });
    await trigger.click();
    const popup = page.locator('.leaf-menu__popup').first();
    const selected = popup.getByRole('menuitem', { name: 'Components' });
    const textColor = await popup.evaluate((node) => getComputedStyle(node).color);
    const unselectedColor = await resolveStyle(
      popup,
      'color',
      'color-mix(in srgb, currentColor 80%, var(--leaf-color-surface))',
    );
    await expectColor(selected, textColor);
    await expectColor(selected.locator('.leaf-menu__popup-icon svg'), textColor);
    const hoverColor = await resolveStyle(
      popup,
      'background-color',
      await popup.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--leaf-menu-hover-background').trim(),
      ),
    );
    await expect(selected).toHaveAttribute('aria-current', 'page');
    expect(hoverColor).toBe('rgba(0, 0, 0, 0.08)');
    await expect(selected).toHaveCSS('text-decoration-line', 'none');
    await expect(trigger).not.toHaveAttribute('data-selected');
    await expect(trigger).not.toHaveAttribute('data-active-parent');
    await expect(popup).toHaveAttribute('data-positioned', 'true');
    await expect(popup).toHaveCSS('border-top-width', '1px');
    await expect(popup).toHaveCSS('border-top-left-radius', '8px');
    const side = await popup.getAttribute('data-side');
    expect(side).toBe(suffix.includes('rtl') ? 'left' : 'right');
    await expect(popup.locator('.leaf-menu__popup-title')).toHaveText('Resources');
    await expect(popup.locator('.leaf-menu__popup-icon svg').first()).toHaveCSS('width', '16px');
    await selected.hover();
    await expectFeedback(selected, hoverColor);
    await page.keyboard.press('ArrowDown');
    await selected.focus();
    await expectFeedback(selected, hoverColor);
    await expect.poll(async () => Math.round((await popup.boundingBox())?.width ?? 0)).toBe(208);
    const box = await popup.boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= 375).toBe(true);
    await page.keyboard.press('ArrowDown');
    const themes = popup.getByRole('menuitem', { name: 'Themes' });
    await expect(themes).toBeFocused();
    await expectColor(themes, unselectedColor);
    await expectColor(themes.locator('.leaf-menu__popup-icon svg'), unselectedColor);
    await expectFeedback(themes, hoverColor);
    await expect(selected).toHaveAttribute('aria-current', 'page');
    await expectFeedback(selected, hoverColor);
    await expect(popup).toHaveCSS('opacity', '1');

    await page.keyboard.press('ArrowDown');
    await expect(popup.getByRole('menuitem', { name: 'More' })).toBeFocused();
    await page.keyboard.press(suffix.includes('rtl') ? 'ArrowLeft' : 'ArrowRight');
    const examples = page.getByRole('menuitem', { name: 'Examples' });
    await expect(examples).toBeFocused();
    await expect(page.locator('.leaf-menu__popup')).toHaveCount(2);
    await page.keyboard.press('Enter');
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
}

test('centered collapsed navigation falls back below when neither side fits', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/?fixture=menu&popup=1&collapsed=1&center=1');
  await page.getByRole('menuitem', { name: 'Resources' }).click();
  const popup = page.locator('.leaf-menu__popup');
  await expect(popup).toHaveAttribute('data-side', 'bottom');
  await expect
    .poll(async () => {
      const box = await popup.boundingBox();
      return Boolean(box && box.x >= 0 && box.x + box.width <= 375);
    })
    .toBe(true);
});

for (const popup of [false, true]) {
  test(`menu feedback expands and fades without retracting ${popup ? 'popup' : 'inline submenu'}`, async ({
    page,
  }) => {
    await page.goto(popup ? '/?fixture=menu&popup=1&collapsed=1' : '/?fixture=menu&basic=1');
    if (popup) await page.getByRole('menuitem', { name: 'Resources' }).click();
    const item = page
      .getByRole('menuitem', {
        name: popup ? 'Themes' : '发布管理 新',
        exact: true,
      })
      .first();
    await expectMotionEnd(item, 'opacity', '0');
    await item.evaluate((node) => {
      const capture = (event: Event) => {
        if (!(event instanceof TransitionEvent) || event.propertyName !== 'top') return;
        for (const animation of node.getAnimations({ subtree: true })) {
          animation.pause();
          animation.currentTime = 0;
        }
        node.removeEventListener('transitionrun', capture);
      };
      node.addEventListener('transitionrun', capture);
    });
    await item.hover();
    const samples = await item.evaluate((node) => {
      const animations = node.getAnimations({ subtree: true });
      if (
        !animations.some(
          (animation) =>
            animation instanceof CSSTransition && animation.transitionProperty === 'top',
        )
      )
        throw new Error('Menu background expansion did not start');
      const first = animations[0];
      if (!first) throw new Error('Menu background transitions are missing');
      const duration = Number(first.effect?.getTiming().duration);
      const read = () => {
        const style = getComputedStyle(node, '::before');
        const row = node.getBoundingClientRect();
        return {
          top: Number.parseFloat(style.top),
          bottom: Number.parseFloat(style.top) + Number.parseFloat(style.height),
          opacity: Number(style.opacity),
          rowHeight: row.height,
        };
      };
      const frames = [0, 0.25, 0.5, 0.75, 0.995].map((progress) => {
        for (const animation of animations) animation.currentTime = duration * progress;
        return read();
      });
      for (const animation of animations) animation.finish();
      return [...frames, read()];
    });
    const [initial, quarter, halfway] = samples;
    if (!initial || !quarter || !halfway) throw new Error('Menu background samples are missing');
    let previous = initial;
    for (const sample of samples.slice(1)) {
      expect(sample.bottom).toBeGreaterThanOrEqual(previous.bottom);
      expect(sample.top).toBeLessThanOrEqual(previous.top);
      expect(sample.opacity).toBeGreaterThan(previous.opacity);
      expect(sample.rowHeight).toBe(initial.rowHeight);
      expect(sample.bottom).toBeLessThanOrEqual(sample.rowHeight);
      previous = sample;
    }
    expect(quarter.opacity).toBeCloseTo(0.25, 2);
    expect(halfway.opacity).toBeCloseTo(0.5, 2);
    expect(samples.at(-1)).toMatchObject({ top: 0, bottom: 30, opacity: 1, rowHeight: 30 });
    await page.mouse.move(1_000, 20);
    await expectMotionEnd(item, 'opacity', '0');
    await item.hover();
    await expectMotionEnd(item, 'opacity', '1');
    if (!popup) {
      await item.click();
      await expect(item).toHaveAttribute('aria-current', 'page');
      await page.mouse.move(1_000, 20);
      await expectMotionEnd(item, 'opacity', '1');
    }
  });
}

for (const dark of [false, true]) {
  for (const collapsed of [false, true]) {
    test(`raised selection keeps its surface and geometry ${dark ? 'dark RTL compact' : 'light'} ${collapsed ? 'nested popup' : 'inline'}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: dark ? 375 : 1100, height: 800 });
      await page.goto(
        `/?fixture=menu&popup=1&raised=1${collapsed ? '&collapsed=1&nested=1' : ''}${dark ? '&theme=dark&rtl=1&compact=1' : ''}`,
      );
      await page.getByRole('menuitem', { name: 'Resources', exact: true }).click();
      if (collapsed) await page.getByRole('menuitem', { name: 'More', exact: true }).hover();
      const item = page.getByRole('menuitem', {
        name: collapsed ? 'Examples' : 'Components',
        exact: true,
      });
      await expect(item).toHaveAttribute('aria-current', 'page');
      if (collapsed) await expect(page.locator('.leaf-menu__popup--raised')).toHaveCount(2);
      const surface = await resolveStyle(item, 'background-color', 'var(--leaf-color-surface)');
      const border = await resolveStyle(item, 'border-color', 'var(--leaf-color-border)');
      await expectFeedback(item, surface);
      await item.hover();
      const before = await item.boundingBox();
      const checkPaint = async () => {
        await expectFeedback(item, surface);
        const paint = await item.evaluate((node) => {
          const style = getComputedStyle(node, '::before');
          return {
            border: style.borderTopWidth,
            color: style.borderTopColor,
            shadow: style.boxShadow,
          };
        });
        expect(paint.border).toBe('1px');
        expect(paint.color).toBe(border);
        expect(paint.shadow).not.toBe('none');
        expect(await item.boundingBox()).toEqual(before);
      };
      await item.hover();
      await checkPaint();
      await page.mouse.down();
      await checkPaint();
      await page.mouse.up();
      if (!collapsed) await expect(item).toHaveAttribute('aria-current', 'page');
      const parent = page
        .getByRole('navigation')
        .getByRole('menuitem', { name: 'Resources', exact: true });
      await expect(parent).not.toHaveAttribute('data-selected');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    });
  }
}

for (const english of [false, true]) {
  test(`raised documentation example ${english ? 'English dark mobile' : 'Chinese desktop'}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: english ? 375 : 1100, height: 800 });
    await page.goto(`/?fixture=menu&raisedExample=1${english ? '&english=1&theme=dark' : ''}`);
    const selected = page.getByRole('menuitem', {
      name: english ? 'Design resources' : '设计资源',
      exact: true,
    });
    await expect(selected).toHaveAttribute('aria-current', 'page');
    await expectFeedback(
      selected,
      await resolveStyle(selected, 'background-color', 'var(--leaf-color-surface)'),
    );
    await page
      .getByRole('switch', { name: english ? 'Collapse menu' : '折叠菜单', exact: true })
      .click();
    const parent = page.getByRole('menuitem', {
      name: english ? 'Projects' : '项目管理',
      exact: true,
    });
    if ((await parent.getAttribute('aria-expanded')) !== 'true') await parent.click();
    await expect(page.locator('.leaf-menu__popup--raised')).toBeVisible();
    await expect(selected).toHaveAttribute('aria-current', 'page');
  });
}

test('raised selection retains a system marker in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/?fixture=menu&popup=1&raised=1');
  await page.getByRole('menuitem', { name: 'Resources', exact: true }).click();
  const selected = page.getByRole('menuitem', { name: 'Components', exact: true });
  await expectFeedback(selected, await resolveStyle(selected, 'background-color', 'Highlight'));
  await page.keyboard.press('ArrowDown');
  await selected.focus();
  await expect(selected).toHaveCSS('outline-style', 'solid');
});

for (const dark of [false, true]) {
  for (const collapsed of [false, true]) {
    test(`raised hover deepens text without a background ${dark ? 'dark RTL compact' : 'light'} ${collapsed ? 'popup' : 'inline'}`, async ({
      page,
    }) => {
      await page.goto(
        `/?fixture=menu&popup=1&raised=1${collapsed ? '&collapsed=1' : ''}${dark ? '&theme=dark&rtl=1&compact=1' : ''}`,
      );
      const parent = page.getByRole('menuitem', { name: 'Resources', exact: true });
      await parent.click();
      const selected = page.getByRole('menuitem', { name: 'Components', exact: true });
      const item = page.getByRole('menuitem', { name: 'Themes', exact: true });
      const color = await resolveStyle(selected, 'color', 'var(--leaf-color-text)');
      await expect(selected).toHaveCSS('color', color, { timeout: 20_000 });
      await expect(item).not.toHaveCSS('color', color, { timeout: 20_000 });
      await item.hover();
      await expect(item).toHaveCSS('color', color, { timeout: 20_000 });
      await expect(item).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expectMotionEnd(item, 'opacity', '0');
      await selected.hover();
      await expect(selected).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      if (collapsed) {
        const nested = page.getByRole('menuitem', { name: 'More', exact: true });
        await nested.hover();
        await expect(nested.locator('.leaf-dropdown__arrow')).toHaveCSS('color', color);
        await expect(nested).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      }
      await expectFeedback(
        selected,
        await resolveStyle(selected, 'background-color', 'var(--leaf-color-surface)'),
      );
      if (!collapsed) {
        await parent.hover();
        await expect(parent).toHaveCSS('color', color, { timeout: 20_000 });
        await expectMotionEnd(parent, 'opacity', '0');
      }
    });
  }
}

for (const collapsed of [false, true]) {
  test(`raised selection clears immediately with a lighter press and bottom-only shadow ${collapsed ? 'popup' : 'inline'}`, async ({
    page,
  }) => {
    await page.goto(`/?fixture=menu&popup=1&raised=1${collapsed ? '&collapsed=1' : ''}`);
    await page.getByRole('menuitem', { name: 'Resources', exact: true }).click();
    const selected = page.getByRole('menuitem', { name: 'Components', exact: true });
    const next = page.getByRole('menuitem', { name: 'Themes', exact: true });
    await expectFeedback(
      selected,
      await resolveStyle(selected, 'background-color', 'var(--leaf-color-surface)'),
    );
    const paint = await selected.evaluate((node) => {
      const style = getComputedStyle(node, '::before');
      return { shadow: style.boxShadow, clip: style.clipPath };
    });
    expect(paint.shadow).toBe('rgba(0, 0, 0, 0.08) 0px 2px 3px -1px');
    expect(paint.clip).toBe('inset(0px 0px -4px)');
    await next.hover();
    await page.mouse.down();
    const entry = await next.evaluate((node) => {
      const animations = node.getAnimations({ subtree: true });
      const fade = animations.find(
        (animation) => (animation as CSSTransition).transitionProperty === 'opacity',
      );
      if (!fade) throw new Error('Raised press must fade in');
      fade.pause();
      fade.currentTime = 120;
      return {
        duration: fade.effect?.getTiming().duration,
        opacity: Number(getComputedStyle(node, '::before').opacity),
      };
    });
    expect(entry.duration).toBe(240);
    expect(entry.opacity).toBeCloseTo(0.5, 1);
    await next.evaluate((node) => {
      for (const animation of node.getAnimations({ subtree: true })) animation.finish();
    });
    await expectFeedback(next, 'rgba(0, 0, 0, 0.04)');
    await page.mouse.up();
    if (collapsed) {
      await page.getByRole('menuitem', { name: 'Resources', exact: true }).click();
    }
    await expect(next).toHaveAttribute('aria-current', 'page');
    const retired = await selected.evaluate((node) => {
      const style = getComputedStyle(node, '::before');
      return { opacity: style.opacity, duration: style.transitionDuration };
    });
    expect(retired.opacity).toBe('0');
    expect(retired.duration.split(',').every((value) => value.trim() === '0s')).toBe(true);
    await expect(selected).not.toHaveAttribute('aria-current');
  });
}

for (const dark of [false, true]) {
  for (const collapsed of [false, true]) {
    test(`primary appearance has independent color states ${dark ? 'dark RTL compact' : 'light'} ${collapsed ? 'nested popup' : 'inline'}`, async ({
      page,
    }) => {
      await page.goto(
        `/?fixture=menu&popup=1&primary=1${collapsed ? '&collapsed=1&nested=1' : ''}${dark ? '&theme=dark&compact=1&rtl=1' : ''}`,
      );
      await page.getByRole('menuitem', { name: 'Resources', exact: true }).click();
      if (collapsed) await page.getByRole('menuitem', { name: 'More', exact: true }).hover();
      const selected = page.getByRole('menuitem', {
        name: collapsed ? 'Examples' : 'Components',
        exact: true,
      });
      const color = await resolveStyle(selected, 'color', 'var(--leaf-color-primary-ink)');
      const fill = await resolveStyle(
        selected,
        'background-color',
        'var(--leaf-color-primary-alpha-10)',
      );
      await expect(selected).toHaveCSS('color', color, { timeout: 20_000 });
      await expectFeedback(selected, fill);
      const paint = await selected.evaluate((node) => {
        const style = getComputedStyle(node, '::before');
        return { shadow: style.boxShadow, border: style.borderTopWidth, clip: style.clipPath };
      });
      expect(paint).toEqual({ shadow: 'none', border: '0px', clip: 'none' });
      if (collapsed) {
        await expect(page.locator('.leaf-menu__popup--primary')).toHaveCount(2);
      } else {
        const next = page.getByRole('menuitem', { name: 'Themes', exact: true });
        await next.hover();
        await expect(next).toHaveCSS('color', color, { timeout: 20_000 });
        await expectMotionEnd(next, 'opacity', '0');
        await page.mouse.down();
        await expectFeedback(
          next,
          await resolveStyle(next, 'background-color', 'var(--leaf-color-primary-alpha-4)'),
        );
        await page.mouse.up();
        await expect(next).toHaveAttribute('aria-current', 'page');
        await expectMotionEnd(selected, 'opacity', '0');
      }
    });
  }
}

for (const english of [false, true]) {
  test(`one menu shares state across appearance tabs ${english ? 'English dark mobile' : 'Chinese desktop'}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: english ? 375 : 1100, height: 900 });
    await page.goto(`/?fixture=menu&basic=1${english ? '&english=1&theme=dark' : ''}`);
    const menu = page.getByRole('navigation');
    await expect(menu).toHaveCount(1);
    const toggle = page.getByRole('switch');
    const controls = toggle.locator('..').locator('..').locator('..');
    const tabs = page.getByRole('tablist');
    await expect(controls).toHaveCSS('align-items', 'flex-start');
    const controlBox = await controls.boundingBox();
    const menuBox = await menu.boundingBox();
    if (!controlBox || !menuBox) throw new Error('Example geometry is unavailable');
    expect(
      Math.abs(controlBox.x + controlBox.width / 2 - menuBox.x - menuBox.width / 2),
    ).toBeLessThan(1);
    const release = menu.getByRole('menuitem', {
      name: english ? 'Releases New' : '发布管理 新',
      exact: true,
    });
    await release.click();
    for (const [variant, label] of [
      ['raised', english ? 'Raised' : '浮起'],
      ['primary', english ? 'Primary' : '主题色'],
      ['default', english ? 'Default' : '默认'],
    ]) {
      await tabs.getByRole('tab', { name: label, exact: true }).click();
      await expect(menu).toHaveClass(new RegExp(`leaf-menu--${variant}`));
      await expect(release).toHaveAttribute('aria-current', 'page');
    }
    await toggle.check();
    await expect(menu).toHaveClass(/leaf-menu--collapsed/);
    await expect(menu.locator('.leaf-menu__extra')).toHaveCount(0);
    await menu
      .getByRole('menuitem', { name: english ? 'Projects' : '项目管理', exact: true })
      .click();
    const popup = page.locator('.leaf-menu__popup');
    await expect(
      popup.getByRole('menuitem', { name: english ? 'Releases New' : '发布管理 新', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await popup
      .getByRole('menuitem', { name: english ? 'Design resources' : '设计资源', exact: true })
      .click();
    await toggle.uncheck();
    await expect(
      menu.getByRole('menuitem', { name: english ? 'Design resources' : '设计资源', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test('appearance palette resets completely between primary, raised and default', async ({
  page,
}) => {
  await page.goto('/?fixture=menu&popup=1&primary=1');
  const menu = page.getByRole('navigation');
  await menu.getByRole('menuitem', { name: 'Resources', exact: true }).click();
  const selected = menu.getByRole('menuitem', { name: 'Components', exact: true });
  for (const variant of ['raised', 'primary', 'default', 'primary', 'raised', 'default']) {
    await menu.evaluate((node, variant) => {
      node.setAttribute('class', `leaf-menu leaf-menu--${variant}`);
    }, variant);
    await selected.hover();
    const paint = await selected.evaluate((node) => {
      const style = getComputedStyle(node, '::before');
      return { border: style.borderTopWidth, shadow: style.boxShadow };
    });
    expect(paint.border).toBe(variant === 'raised' ? '1px' : '0px');
    expect(paint.shadow === 'none').toBe(variant !== 'raised');
    await expectFeedback(
      selected,
      await resolveStyle(
        selected,
        'background-color',
        variant === 'raised'
          ? 'var(--leaf-color-surface)'
          : variant === 'primary'
            ? 'var(--leaf-color-primary-alpha-10)'
            : 'rgba(0, 0, 0, 0.08)',
      ),
    );
  }
});

for (const english of [false, true]) {
  test(`basic menu accessibility ${english ? 'en' : 'zh'}`, { tag: '@a11y' }, async ({ page }) => {
    await page.setViewportSize({ width: english ? 375 : 1100, height: 800 });
    await page.goto(
      `/?fixture=menu&basic=1${english ? '&english=1&theme=dark&compact=1&rtl=1' : ''}`,
    );
    const menu = page.getByRole('navigation').first();
    await menu
      .getByRole('menuitem', { name: english ? 'Design resources' : '设计资源', exact: true })
      .click();
    await expectAccessible(page, 'nav');
  });
}

test('grouped menu accessibility', { tag: '@a11y' }, async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/?fixture=menu');
  const menu = page.getByRole('navigation', { name: 'Grouped navigation' });
  await menu.getByRole('menuitem', { name: 'Settings' }).click();
  const custom = page.getByRole('group', { name: 'Quick create' });
  await custom.getByRole('textbox').fill('New project');
  await custom.getByRole('button').click();
  await expectAccessible(page, 'main');
});

for (const suffix of ['', '&theme=dark&compact=1&rtl=1']) {
  test(`collapsed popup accessibility ${suffix || 'default'}`, { tag: '@a11y' }, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(`/?fixture=menu&popup=1&collapsed=1${suffix}`);
    await page
      .getByRole('navigation', { name: 'Popup navigation' })
      .getByRole('menuitem', { name: 'Resources' })
      .click();
    await expect(page.locator('.leaf-menu__popup').first()).toHaveAttribute(
      'data-positioned',
      'true',
    );
    await expectAccessible(page, '.leaf-menu__popup');
  });
}
