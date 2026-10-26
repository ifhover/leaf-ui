import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

const profiles = [
  { english: false, width: 1280, appearance: 'light' },
  { english: true, width: 375, appearance: 'dark' },
  { english: false, width: 375, appearance: 'light' },
  { english: true, width: 1280, appearance: 'dark' },
] as const;

async function openPage(page: Page, slug: string, profile: (typeof profiles)[number]) {
  const { english, width, appearance } = profile;
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: appearance });
  await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
  await page.goto(`${english ? '/en' : ''}/components/${slug}.html`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  if (
    Boolean((await page.locator('html').getAttribute('class'))?.includes('dark')) !==
    (appearance === 'dark')
  ) {
    await page
      .getByRole('button', {
        name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
      })
      .first()
      .click();
  }
  return {
    errors,
    preview: (zh: string, en: string) =>
      page
        .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
        .locator('.leaf-component-example__preview'),
  };
}

async function popupFits(popup: Locator) {
  await expect(popup).toBeVisible();
  await settleAnimations(popup);
  expect(
    await popup.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      const problems: string[] = [];
      if (bounds.left < -1 || bounds.right > innerWidth + 1) problems.push('outside viewport');
      for (const child of node.querySelectorAll<HTMLElement>('button, input, [role="option"]')) {
        if (!child.getClientRects().length || child.closest('[hidden], [aria-hidden="true"]'))
          continue;
        const rect = child.getBoundingClientRect();
        if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1)
          problems.push(child.textContent ?? child.tagName);
        if (child.scrollWidth > child.clientWidth + 1) problems.push('clipped control');
      }
      return problems;
    }),
  ).toEqual([]);
}

async function overviewTitlesFit(cards: Locator, arrowsVisible: boolean) {
  expect(
    await cards.evaluateAll((nodes, visible) => {
      const problems: string[] = [];
      for (const card of nodes) {
        const heading = card.querySelector('h3');
        const arrow = heading?.querySelector('svg');
        if (!heading || !arrow) {
          problems.push('Missing card title or arrow');
          continue;
        }
        const name = heading.textContent?.trim() ?? '';
        const bounds = heading.getBoundingClientRect();
        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
        const textBounds: DOMRect[] = [];
        while (walker.nextNode()) {
          if (!walker.currentNode.textContent?.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(walker.currentNode);
          textBounds.push(...range.getClientRects());
        }
        const firstLine = textBounds[0];
        if (!firstLine) problems.push(`${name}: missing rendered title text`);
        if (textBounds.some((rect) => rect.left < bounds.left - 1 || rect.right > bounds.right + 1))
          problems.push(`${name}: title text exceeds its heading`);
        const arrowVisible = arrow.getClientRects().length > 0;
        if (arrowVisible !== visible) problems.push(`${name}: unexpected arrow visibility`);
        if (!arrowVisible || !firstLine) continue;
        const icon = arrow.getBoundingClientRect();
        const lineHeight = Number.parseFloat(getComputedStyle(heading).lineHeight);
        if (
          icon.top < bounds.top - 1 ||
          icon.bottom > bounds.top + lineHeight + 1 ||
          Math.abs(icon.top + icon.height / 2 - firstLine.top - firstLine.height / 2) > 2
        )
          problems.push(`${name}: arrow is not aligned with the first title line`);
        if (icon.left < bounds.left - 1 || icon.right > bounds.right + 1)
          problems.push(`${name}: arrow exceeds its heading`);
        if (
          textBounds.some(
            (rect) =>
              rect.top < icon.bottom &&
              rect.bottom > icon.top &&
              rect.right > icon.left - 3 &&
              rect.left < icon.right,
          )
        )
          problems.push(`${name}: title text overlaps the arrow`);
      }
      return problems;
    }, arrowsVisible),
  ).toEqual([]);
}

async function tooltipThumbnailContrast(card: Locator) {
  const paint = await card.locator('.leaf-component-card__preview').evaluate((node) => {
    const label = [...node.querySelectorAll('text')].find(
      (text) => text.textContent === 'Save your changes',
    );
    if (!label) throw new Error('Tooltip thumbnail label is missing');
    const textBounds = label.getBoundingClientRect();
    const background = [...node.querySelectorAll('rect')]
      .filter((rect) => {
        const bounds = rect.getBoundingClientRect();
        return (
          rect.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING &&
          bounds.left <= textBounds.left &&
          bounds.right >= textBounds.right &&
          bounds.top <= textBounds.top &&
          bounds.bottom >= textBounds.bottom &&
          getComputedStyle(rect).fill !== 'none'
        );
      })
      .at(-1);
    if (!background) throw new Error('Tooltip thumbnail has no painted label background');
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas color resolution is unavailable');
    const color = (element: Element) => {
      const style = getComputedStyle(element);
      if (style.fill === 'none') throw new Error('Tooltip thumbnail paint is missing');
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = style.fill;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      if (r === undefined || g === undefined || b === undefined || a === undefined) {
        throw new Error('Tooltip thumbnail color must resolve to a complete RGBA pixel');
      }
      return {
        rgb: [r, g, b] as const,
        alpha: (a / 255) * Number.parseFloat(style.fillOpacity) * Number.parseFloat(style.opacity),
      };
    };
    const foreground = color(label);
    const surface = color(background);
    const linearChannel = (value: number) => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    };
    const luminance = ([red, green, blue]: readonly [number, number, number]) =>
      linearChannel(red) * 0.2126 + linearChannel(green) * 0.7152 + linearChannel(blue) * 0.0722;
    const light = luminance(foreground.rgb);
    const dark = luminance(surface.rgb);
    return {
      foreground,
      background: surface,
      contrast: (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05),
    };
  });
  expect(paint.foreground.alpha).toBe(1);
  expect(paint.background.alpha).toBe(1);
  expect(paint.contrast, JSON.stringify(paint)).toBeGreaterThanOrEqual(4.5);
}

for (const profile of profiles) {
  const { english, width, appearance } = profile;
  test.describe(`Configuration examples: ${english ? 'en' : 'zh'} ${width} ${appearance}`, () => {
    test('Locale resources, scoped defaults, density, height and modal behavior are live', async ({
      page,
    }, testInfo) => {
      const { errors, preview } = await openPage(page, 'config-provider', profile);
      const locale = preview('切换语言', 'Switch languages');
      const language = locale.getByRole('combobox').first();
      await language.click();
      await page.getByRole('option', { name: '日本語', exact: true }).click();
      const empty = locale.getByRole('combobox').last();
      await empty.click();
      await expect(page.getByText('選択肢がありません', { exact: true })).toBeVisible();
      await popupFits(page.locator('.leaf-select__panel[data-state="open"]'));
      await page.screenshot({ path: testInfo.outputPath('locale-japanese.png') });
      await empty.press('Escape');

      const translations = preview('补充自己的语言', 'Add your own language');
      await expect(translations.getByRole('combobox').last()).toHaveAttribute(
        'placeholder',
        'Choisir une option',
      );
      await translations.getByRole('combobox').last().click();
      await expect(page.getByText('Aucun résultat', { exact: true })).toBeVisible();
      await popupFits(page.locator('.leaf-select__panel[data-state="open"]'));
      await page.screenshot({ path: testInfo.outputPath('translations-french.png') });
      await translations.getByRole('combobox').last().press('Escape');

      const defaults = preview('统一输入参数', 'Shared input defaults');
      const inputs = defaults.getByRole('textbox');
      await expect(inputs.nth(0)).toHaveAttribute(
        'placeholder',
        english ? 'Enter a name' : '请输入名称',
      );
      await expect(inputs.nth(1)).toHaveAttribute(
        'placeholder',
        english ? 'Enter a team name' : '请输入团队名称',
      );
      await inputs.nth(0).fill('Leaf');
      await defaults
        .getByRole('button', { name: english ? 'Clear input' : '清除输入', exact: true })
        .click();
      await expect(inputs.nth(0)).toHaveValue('');

      const reset = preview('清除继承', 'Clear inherited defaults');
      await expect(reset.getByRole('textbox').first()).toHaveAttribute('readonly', '');
      await expect(reset.getByRole('textbox').last()).not.toHaveAttribute('readonly');
      await reset.getByRole('textbox').last().fill('Updated');
      await expect(reset.getByRole('textbox').last()).toHaveValue('Updated');

      const inheritance = preview('继承与覆盖', 'Inheritance and overrides');
      expect(
        await inheritance.locator('.leaf-grid').evaluateAll((grids) =>
          grids.map((grid) => {
            const gap = getComputedStyle(grid).rowGap;
            return Number.parseFloat(gap) >= 16;
          }),
        ),
      ).toEqual([true, true, true, true, true]);
      const heights = await inheritance
        .getByRole('button')
        .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
      expect(heights[0]).toBeLessThan(heights[2] ?? 0);
      expect(heights[2]).toBeLessThan(heights[1] ?? 0);

      const density = preview('区域密度', 'Regional density');
      const densityHeights = await density
        .getByRole('textbox')
        .evaluateAll((fields) => fields.map((field) => field.getBoundingClientRect().height));
      expect(densityHeights[1]).toBeLessThan(densityHeights[0] ?? 0);

      const sizes = preview('基础高度', 'Base height');
      const slider = sizes.getByRole('slider');
      const before = await sizes
        .getByRole('button')
        .nth(1)
        .evaluate((node) => node.clientHeight);
      await slider.press('ArrowRight');
      await expect(slider).toHaveValue('35');
      await expect
        .poll(() =>
          sizes
            .getByRole('button')
            .nth(1)
            .evaluate((node) => node.clientHeight),
        )
        .toBeGreaterThan(before);

      const modal = preview('弹窗关闭方式', 'Modal closing behavior');
      await modal.getByRole('button').click();
      const dialog = page.getByRole('dialog');
      await popupFits(dialog);
      await page.screenshot({ path: testInfo.outputPath('modal-defaults-open.png') });
      await page
        .locator('.leaf-modal-mask')
        .last()
        .click({ position: { x: 2, y: 2 } });
      await expect(dialog).toBeVisible();
      await dialog.press('Escape');
      await expect(dialog).not.toBeVisible();
      expect(errors).toEqual([]);
    });

    test('Icon buttons and fields retain accessible names and editable values', async ({
      page,
    }) => {
      const { errors, preview } = await openPage(page, 'icons', profile);
      const buttons = preview('按钮图标', 'Button icons');
      await expect(buttons.getByRole('button')).toHaveCount(3);
      for (const button of await buttons.getByRole('button').all()) {
        await expect(button).toHaveAccessibleName(/.+/);
        await button.focus();
        await expect(button).toBeFocused();
        await expect(button.locator('svg').first()).toBeVisible();
      }
      const fields = preview('输入框图标', 'Input icons');
      const search = fields.getByRole('textbox', {
        name: english ? 'Search' : '搜索',
        exact: true,
      });
      const email = fields.getByRole('textbox', { name: english ? 'Email' : '邮箱', exact: true });
      await search.fill('Leaf');
      await email.fill('leaf@example.com');
      await expect(search).toHaveValue('Leaf');
      await expect(email).toHaveValue('leaf@example.com');
      expect(errors).toEqual([]);
    });

    test('Overview filters, empty feedback, reset and component navigation work', async ({
      page,
    }, testInfo) => {
      const { errors } = await openPage(page, 'index', profile);
      const overview = page.locator('.leaf-component-overview');
      const cards = overview.locator('.leaf-component-card');
      const count = await cards.count();
      expect(count).toBeGreaterThan(70);
      const filter = overview.getByRole('searchbox');
      await filter.fill('ColorPicker');
      await expect(cards).toHaveCount(1);
      await expect(cards.first()).toContainText('ColorPicker');
      await filter.fill('no-component-with-this-name');
      await expect(cards).toHaveCount(0);
      await expect(overview.getByRole('status')).toBeVisible();
      await filter.fill('');
      await expect(cards).toHaveCount(count);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(1);
      await overviewTitlesFit(cards, width > 480);
      await tooltipThumbnailContrast(
        cards.filter({ has: page.getByRole('heading', { name: /^Tooltip\b/ }) }),
      );
      await overview.screenshot({ path: testInfo.outputPath('overview.png') });
      await filter.fill('Menu');
      await cards.filter({ has: page.getByRole('heading', { name: /^Menu\b/ }) }).click();
      await expect(page).toHaveURL(/\/components\/menu\.html$/);
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Menu');
      expect(errors).toEqual([]);
    });
  });
}
