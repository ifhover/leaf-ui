import { type CDPSession, expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

const profiles = [
  { english: false, width: 1280, appearance: 'light' },
  { english: true, width: 375, appearance: 'dark' },
  { english: false, width: 375, appearance: 'light' },
  { english: true, width: 1280, appearance: 'dark' },
] as const;

async function openExamples(
  page: Page,
  component: 'infinite-scroll' | 'masonry' | 'splitter',
  { english, width, appearance }: (typeof profiles)[number],
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: appearance });
  await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
  await page.goto(`${english ? '/en' : ''}/components/${component}.html`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const root = page.locator('html');
  if (Boolean((await root.getAttribute('class'))?.includes('dark')) !== (appearance === 'dark')) {
    await page
      .getByRole('button', {
        name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
      })
      .first()
      .click();
  }
  await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return {
    errors,
    preview: (zh: string, en: string) =>
      page
        .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
        .locator('.leaf-component-example__preview'),
  };
}

async function expectPreviewsFit(page: Page) {
  await expect
    .poll(() =>
      page.locator('.leaf-component-example__preview-content').evaluateAll((contents) => {
        const issues: string[] = [];
        const visible = (element: Element) =>
          element.getClientRects().length > 0 &&
          !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
          getComputedStyle(element).visibility !== 'hidden';
        for (const [index, content] of contents.entries()) {
          const preview = content.closest('.leaf-component-example__preview');
          if (!preview) throw new Error('Missing scroll/layout example preview');
          const outer = preview.getBoundingClientRect();
          const bounds = content.getBoundingClientRect();
          if (
            bounds.left < outer.left - 1 ||
            bounds.right > outer.right + 1 ||
            content.scrollWidth > content.clientWidth + 1
          ) {
            issues.push(`preview ${index} content overflows`);
          }
          for (const control of content.querySelectorAll<HTMLElement>(
            '.leaf-scroll-area, .leaf-masonry, .leaf-splitter, .leaf-card, .leaf-image, button',
          )) {
            if (!visible(control)) continue;
            const inner = control.getBoundingClientRect();
            if (inner.left < bounds.left - 1 || inner.right > bounds.right + 1) {
              issues.push(`preview ${index} control exceeds content: ${control.className}`);
            }
            if (control.scrollWidth > control.clientWidth + 1) {
              issues.push(`preview ${index} control overflows: ${control.className}`);
            }
          }
          for (const label of content.querySelectorAll<HTMLElement>('.leaf-text, button')) {
            if (!visible(label)) continue;
            const own = label.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(label);
            for (const rect of range.getClientRects()) {
              if (
                rect.width > 0 &&
                (rect.left < own.left - 1 ||
                  rect.right > own.right + 1 ||
                  rect.top < own.top - 1 ||
                  rect.bottom > own.bottom + 1)
              ) {
                issues.push(`preview ${index} text is clipped: ${label.textContent}`);
                break;
              }
            }
          }
        }
        return issues;
      }),
    )
    .toEqual([]);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}

async function wheelListToEnd(page: Page, viewport: Locator) {
  await viewport.scrollIntoViewIfNeeded();
  await viewport.hover();
  const distance = await viewport.evaluate((node) => node.scrollHeight);
  await page.mouse.wheel(0, distance);
}

async function scrollListToEnd(page: Page, viewport: Locator) {
  await wheelListToEnd(page, viewport);
  // Only terminal/error lists have a stable end; a live load grows its footer and data.
  await expect
    .poll(() => viewport.evaluate((node) => node.scrollHeight - node.clientHeight - node.scrollTop))
    .toBeLessThanOrEqual(1);
}

interface AbortState {
  aborted: boolean;
  aborts: number;
}

async function observeNewAbortController(page: Page) {
  const session: CDPSession = await page.context().newCDPSession(page);
  const objectGroup = 'leaf-docs-infinite-cancellation';
  let observed: string | undefined;
  const dispose = async () => {
    try {
      if (observed) {
        await session
          .send('Runtime.callFunctionOn', {
            objectId: observed,
            functionDeclaration: `function() {
              for (const record of this) record.signal.removeEventListener('abort', record.listener);
            }`,
          })
          .catch(() => undefined);
      }
    } finally {
      await session.send('Runtime.releaseObjectGroup', { objectGroup }).catch(() => undefined);
      await session.detach();
    }
  };

  try {
    // Inspect real native instances; do not replace constructors, requests, or timers.
    const prototype = await session.send('Runtime.evaluate', {
      expression: 'AbortController.prototype',
      objectGroup,
    });
    const prototypeObjectId = prototype.result.objectId;
    if (!prototypeObjectId) throw new Error('Native AbortController prototype is unavailable');
    const baselineObjects = await session.send('Runtime.queryObjects', {
      prototypeObjectId,
      objectGroup,
    });
    const baseline = await session.send('Runtime.callFunctionOn', {
      objectId: baselineObjects.objects.objectId,
      functionDeclaration: 'function() { return new Set(this); }',
      objectGroup,
    });
    const baselineId = baseline.result.objectId;
    if (!baselineId) throw new Error('Could not retain the native controller baseline');

    return {
      observe: async () => {
        const current = await session.send('Runtime.queryObjects', {
          prototypeObjectId,
          objectGroup,
        });
        const records = await session.send('Runtime.callFunctionOn', {
          objectId: current.objects.objectId,
          arguments: [{ objectId: baselineId }],
          functionDeclaration: `function(baseline) {
            return this.filter(controller => !baseline.has(controller)).map(controller => {
              const record = { signal: controller.signal, aborts: 0, listener: undefined };
              record.listener = () => record.aborts++;
              record.signal.addEventListener('abort', record.listener, { once: true });
              return record;
            });
          }`,
          objectGroup,
        });
        observed = records.result.objectId;
        if (!observed) throw new Error('Could not observe newly created native controllers');
      },
      read: async (): Promise<AbortState[]> => {
        if (!observed) throw new Error('No native request controller has been observed');
        const result = await session.send('Runtime.callFunctionOn', {
          objectId: observed,
          functionDeclaration: `function() {
            return this.map(record => ({ aborted: record.signal.aborted, aborts: record.aborts }));
          }`,
          returnByValue: true,
        });
        if (result.exceptionDetails || !Array.isArray(result.result.value)) {
          throw new Error('Native signal observation was lost before cancellation was verified');
        }
        return result.result.value as AbortState[];
      },
      dispose,
    };
  } catch (error) {
    await dispose();
    throw error;
  }
}

async function expectMasonryColumns(masonry: Locator, columns: number, itemCount: number) {
  await expect(masonry.locator(':scope > .leaf-masonry__item')).toHaveCount(itemCount);
  await expect(masonry).toHaveCSS('column-count', String(columns));
  await settleAnimations(masonry);
  const geometry = await masonry.evaluate((node) => {
    const outer = node.getBoundingClientRect();
    const gap = Number.parseFloat(getComputedStyle(node).columnGap);
    const items = [...node.querySelectorAll(':scope > .leaf-masonry__item')].map((item) => {
      const rect = item.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
      };
    });
    return { left: outer.left, right: outer.right, width: outer.width, gap, items };
  });
  const expectedWidth = (geometry.width - (columns - 1) * geometry.gap) / columns;
  const starts: number[] = [];
  for (const item of geometry.items) {
    expect(Math.abs(item.width - expectedWidth), 'Masonry item width').toBeLessThanOrEqual(1);
    expect(item.left).toBeGreaterThanOrEqual(geometry.left - 1);
    expect(item.right).toBeLessThanOrEqual(geometry.right + 1);
    if (!starts.some((start) => Math.abs(start - item.left) <= 1)) starts.push(item.left);
  }
  starts.sort((a, b) => a - b);
  expect(starts).toHaveLength(columns);
  for (const [index, start] of starts.entries()) {
    expect(
      Math.abs(start - geometry.left - index * (expectedWidth + geometry.gap)),
      'Masonry column start and gap',
    ).toBeLessThanOrEqual(1);
    const column = geometry.items.filter((item) => Math.abs(item.left - start) <= 1);
    for (let item = 1; item < column.length; item += 1) {
      const current = column[item];
      const previous = column[item - 1];
      if (!current || !previous) throw new Error(`Missing masonry item pair at index ${item}`);
      expect(current.top - previous.bottom, 'Masonry vertical item gap').toBeGreaterThanOrEqual(
        geometry.gap - 1,
      );
    }
  }
}

async function dragDivider(
  page: Page,
  splitter: Locator,
  direction: 'horizontal' | 'vertical',
  change: number,
) {
  await splitter.scrollIntoViewIfNeeded();
  const divider = splitter.getByRole('separator');
  const root = await splitter.boundingBox();
  const handle = await divider.boundingBox();
  if (!root || !handle) throw new Error('Splitter or divider has no visible geometry');
  const start = { x: handle.x + handle.width / 2, y: handle.y + handle.height / 2 };
  const end = {
    x:
      direction === 'horizontal'
        ? Math.min(
            root.x + root.width - 1,
            Math.max(root.x + 1, start.x + (root.width * change) / 100),
          )
        : start.x,
    y:
      direction === 'vertical'
        ? Math.min(
            root.y + root.height - 1,
            Math.max(root.y + 1, start.y + (root.height * change) / 100),
          )
        : start.y,
  };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  try {
    await page.mouse.move(end.x, end.y, { steps: 8 });
  } finally {
    await page.mouse.up();
  }
  await settleAnimations(splitter);
}

async function expectFeedbackBelow(
  preview: Locator,
  englishPrefix: string,
  chinesePrefix: string,
  english: boolean,
) {
  const feedback = preview
    .locator('.leaf-text')
    .filter({ hasText: new RegExp(`^${english ? englishPrefix : chinesePrefix}`) });
  await expect(feedback).toHaveCount(1);
  const metrics = await feedback.evaluate((node) => {
    const splitter = node.parentElement?.querySelector('.leaf-splitter');
    if (!splitter) throw new Error('Missing splitter associated with the proportion feedback');
    const control = splitter.getBoundingClientRect();
    const text = node.getBoundingClientRect();
    return { horizontal: text.left - control.left, gap: text.top - control.bottom };
  });
  expect(Math.abs(metrics.horizontal)).toBeLessThanOrEqual(1);
  expect(metrics.gap).toBeGreaterThanOrEqual(0);
}

for (const profile of profiles) {
  const { english, width, appearance } = profile;
  const suffix = `${english ? 'en' : 'zh'} ${width} ${appearance}`;

  test(`InfiniteScroll real loading and retry: ${suffix}`, async ({ page }, testInfo) => {
    const { preview, errors } = await openExamples(page, 'infinite-scroll', profile);
    const basic = preview('基础用法', 'Basic usage');
    const viewport = basic.getByRole('region', {
      name: english ? 'Growing list' : '动态列表',
      exact: true,
    });
    const list = basic.getByRole('list');
    const loading = basic.locator('.leaf-infinite-scroll');
    await viewport.scrollIntoViewIfNeeded();
    await expect(list.getByRole('listitem')).toHaveCount(20);
    await expect(loading).toHaveAttribute('aria-busy', 'false');
    for (const length of [30, 40]) {
      await wheelListToEnd(page, viewport);
      await expect(loading).toHaveAttribute('aria-busy', 'true');
      await expect(basic.getByRole('status')).toBeVisible();
      await expect(list.getByRole('listitem')).toHaveCount(length);
      await expect(loading).toHaveAttribute('aria-busy', 'false');
    }
    await scrollListToEnd(page, viewport);
    await expect(
      basic.getByText(english ? 'All items loaded' : '已加载全部内容', { exact: true }),
    ).toBeVisible();
    await expect(list.getByRole('listitem')).toHaveText(
      Array.from({ length: 40 }, (_, index) => `${english ? 'Item' : '项目'} ${index + 1}`),
    );
    await expect(basic.getByRole('status')).toHaveCount(0);
    await basic.screenshot({ path: testInfo.outputPath('infinite-all-items-loaded.png') });

    const retry = preview('失败重试', 'Retry after failure');
    const retryViewport = retry.getByRole('region', {
      name: english ? 'Retryable list' : '可重试列表',
      exact: true,
    });
    await wheelListToEnd(page, retryViewport);
    const retryButton = retry.getByRole('button', {
      name: english ? 'Loading failed. Retry' : '加载失败，重试',
      exact: true,
    });
    await expect(retryButton).toBeVisible();
    await expect(retry.getByRole('listitem')).toHaveCount(6);
    await expect(retry.locator('.leaf-infinite-scroll')).toHaveAttribute('aria-busy', 'false');
    await scrollListToEnd(page, retryViewport);
    await settleAnimations(retryButton);
    await retry.screenshot({ path: testInfo.outputPath('infinite-failed-retry.png') });
    await retryButton.click();
    await expect(retry.locator('.leaf-infinite-scroll')).toHaveAttribute('aria-busy', 'true');
    await expect(retry.getByRole('listitem')).toHaveCount(12);
    await expect(retry.locator('.leaf-infinite-scroll')).toHaveAttribute('aria-busy', 'false');
    await expect(retryButton).toHaveCount(0);
    await scrollListToEnd(page, retryViewport);
    await expect(
      retry.getByText(english ? 'All items loaded' : '已加载全部内容', { exact: true }),
    ).toBeVisible();
    await expect(retry.getByRole('listitem')).toHaveText(
      Array.from({ length: 12 }, (_, index) => `${english ? 'Record' : '记录'} ${index + 1}`),
    );
    await retry.screenshot({ path: testInfo.outputPath('infinite-retry-recovered.png') });
    await expectPreviewsFit(page);
    expect(errors).toEqual([]);
  });

  test(`InfiniteScroll aborts the real active load on SPA unmount: ${suffix}`, async ({
    page,
  }, testInfo) => {
    const { preview, errors } = await openExamples(page, 'infinite-scroll', profile);
    const basic = preview('基础用法', 'Basic usage');
    const viewport = basic.getByRole('region', {
      name: english ? 'Growing list' : '动态列表',
      exact: true,
    });
    await viewport.scrollIntoViewIfNeeded();
    await expect(basic.getByRole('listitem')).toHaveCount(20);
    await expect(basic.locator('.leaf-infinite-scroll')).toHaveAttribute('aria-busy', 'false');

    const destination = page.locator('a.rp-prev-next-page__next');
    const href = await destination.getAttribute('href');
    if (!href) throw new Error('The documentation has no next-page route for real SPA navigation');
    const destinationPath = new URL(href, page.url()).pathname.replace(/\.html$/u, '');
    const probe = await observeNewAbortController(page);
    try {
      await wheelListToEnd(page, viewport);
      await expect(basic.locator('.leaf-infinite-scroll')).toHaveAttribute('aria-busy', 'true');
      await probe.observe();
      const before = await probe.read();
      expect(before, 'This real load must have exactly one uniquely new native controller').toEqual(
        [{ aborted: false, aborts: 0 }],
      );
      await expect(basic.getByRole('listitem')).toHaveCount(20);
      await destination.click();
      await expect
        .poll(() => new URL(page.url()).pathname.replace(/\.html$/u, ''))
        .toBe(destinationPath);
      await expect(basic.locator('.leaf-infinite-scroll')).toHaveCount(0);
      await expect.poll(() => probe.read()).toEqual([{ aborted: true, aborts: 1 }]);
      await testInfo.attach('native-request-cancellation', {
        body: JSON.stringify(
          { before, after: await probe.read(), destination: page.url() },
          null,
          2,
        ),
        contentType: 'application/json',
      });
      expect(errors).toEqual([]);
    } finally {
      await probe.dispose();
    }
  });

  test(`Masonry responsive columns and image layout: ${suffix}`, async ({ page }, testInfo) => {
    const { preview, errors } = await openExamples(page, 'masonry', profile);
    const basic = preview('基础用法', 'Basic usage');
    const responsive = preview('响应列数', 'Responsive columns');
    const images = preview('图片排列', 'Image layout');
    for (const section of [basic, responsive])
      await expect(section.locator('.leaf-card')).toHaveCount(6);
    const heights = await basic
      .locator('.leaf-card')
      .evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().height)));
    expect(
      new Set(heights).size,
      'Natural card content produces different heights',
    ).toBeGreaterThan(1);
    await expect(images.locator('.leaf-image')).toHaveCount(4);
    await expect(images.getByRole('button')).toHaveCount(0);
    for (const image of await images.getByRole('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0),
        )
        .toBe(true);
    }
    const aspectRatios = await images.locator('.leaf-image').evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        const image = node.querySelector('img');
        if (!image) throw new Error('Masonry image has no actual img element');
        return {
          actual: rect.width / rect.height,
          intrinsic: image.naturalWidth / image.naturalHeight,
          imageWidth: image.getBoundingClientRect().width,
          columnWidth: node.parentElement?.getBoundingClientRect().width,
        };
      }),
    );
    const expectedRatios = [1.5, 1, 2, 1.2];
    expect(aspectRatios).toHaveLength(expectedRatios.length);
    for (const [index, image] of aspectRatios.entries()) {
      const expectedRatio = expectedRatios[index];
      if (expectedRatio === undefined) throw new Error(`Missing image aspect ratio ${index}`);
      expect(Math.abs(image.actual - expectedRatio), 'Declared display aspect ratio').toBeLessThan(
        0.02,
      );
      expect(Math.abs(image.actual - image.intrinsic), 'No image distortion').toBeLessThan(0.02);
      expect(
        Math.abs(image.imageWidth - (image.columnWidth ?? 0)),
        'Images fill their column',
      ).toBeLessThanOrEqual(1);
    }
    for (const section of [basic, responsive, images]) {
      await settleAnimations(section);
      await section.screenshot({
        path: testInfo.outputPath(
          `masonry-${section === basic ? 'default' : section === responsive ? 'responsive' : 'images'}.png`,
        ),
      });
    }

    for (const viewport of [375, 800, 1280]) {
      await page.setViewportSize({ width: viewport, height: 900 });
      await expectMasonryColumns(
        basic.locator('.leaf-masonry'),
        viewport >= 992 ? 3 : viewport >= 576 ? 2 : 1,
        6,
      );
      await expectMasonryColumns(responsive.locator('.leaf-masonry'), viewport >= 576 ? 2 : 1, 6);
      await expectMasonryColumns(images.locator('.leaf-masonry'), viewport >= 576 ? 2 : 1, 4);
      await expectPreviewsFit(page);
    }
    await page.setViewportSize({ width, height: 900 });
    await expectPreviewsFit(page);
    expect(errors).toEqual([]);
  });

  test(`Splitter pointer, keyboard, limits, collapse and controlled reset: ${suffix}`, async ({
    page,
  }, testInfo) => {
    const { preview, errors } = await openExamples(page, 'splitter', profile);
    const basic = preview('基础用法', 'Basic usage').locator('.leaf-splitter');
    const divider = basic.getByRole('separator');
    await expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    await expect(divider).toHaveAttribute('aria-valuenow', '50');
    await divider.focus();
    for (const [key, value] of [
      ['ArrowRight', '52'],
      ['Shift+ArrowRight', '62'],
      ['ArrowLeft', '60'],
      ['Shift+ArrowLeft', '50'],
    ] as const) {
      await divider.press(key);
      await expect(divider).toHaveAttribute('aria-valuenow', value);
    }
    const originalWidth = await basic
      .locator('.leaf-splitter__panel')
      .first()
      .evaluate((node) => node.getBoundingClientRect().width);
    await dragDivider(page, basic, 'horizontal', 20);
    await expect(divider).toHaveAttribute('aria-valuenow', '70');
    expect(
      await basic
        .locator('.leaf-splitter__panel')
        .first()
        .evaluate((node) => node.getBoundingClientRect().width),
    ).toBeGreaterThan(originalWidth);
    await basic.screenshot({ path: testInfo.outputPath('splitter-pointer-horizontal.png') });

    const vertical = preview('上下布局', 'Vertical panels').locator('.leaf-splitter');
    const horizontalDivider = vertical.getByRole('separator');
    await expect(horizontalDivider).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(horizontalDivider).toHaveAttribute('aria-valuenow', '50');
    for (const [key, value] of [
      ['ArrowDown', '52'],
      ['Shift+ArrowDown', '62'],
      ['ArrowUp', '60'],
      ['Shift+ArrowUp', '50'],
    ] as const) {
      await horizontalDivider.press(key);
      await expect(horizontalDivider).toHaveAttribute('aria-valuenow', value);
    }
    await dragDivider(page, vertical, 'vertical', 15);
    await expect(horizontalDivider).toHaveAttribute('aria-valuenow', '65');
    await vertical.screenshot({ path: testInfo.outputPath('splitter-pointer-vertical.png') });

    const limits = preview('尺寸限制', 'Size limits');
    const constrained = limits.locator('.leaf-splitter');
    const limitDivider = constrained.getByRole('separator');
    await expect(limitDivider).toHaveAttribute('aria-valuemin', '20');
    await expect(limitDivider).toHaveAttribute('aria-valuemax', '55');
    for (let index = 0; index < 3; index += 1) await limitDivider.press('Shift+ArrowRight');
    await expect(limitDivider).toHaveAttribute('aria-valuenow', '55');
    await expect(
      limits
        .locator('.leaf-text')
        .filter({ hasText: english ? /^Left proportion:/ : /^左侧比例：/ }),
    ).toHaveText(english ? 'Left proportion: 55%' : '左侧比例：55%');
    await dragDivider(page, constrained, 'horizontal', 100);
    await expect(limitDivider).toHaveAttribute('aria-valuenow', '55');
    await dragDivider(page, constrained, 'horizontal', -100);
    await expect(limitDivider).toHaveAttribute('aria-valuenow', '20');
    await limitDivider.press('ArrowLeft');
    await expect(limitDivider).toHaveAttribute('aria-valuenow', '20');
    await expect(
      limits
        .locator('.leaf-text')
        .filter({ hasText: english ? /^Left proportion:/ : /^左侧比例：/ }),
    ).toHaveText(english ? 'Left proportion: 20%' : '左侧比例：20%');
    await expectFeedbackBelow(limits, 'Left proportion:', '左侧比例：', english);
    await limits.screenshot({ path: testInfo.outputPath('splitter-minimum-boundary.png') });

    const collapsible = preview('折叠面板', 'Collapsible panels');
    const collapsibleDivider = collapsible.getByRole('separator');
    const toggle = collapsible.getByRole('button', {
      name: english ? 'Toggle panel' : '折叠或展开面板',
      exact: true,
    });
    const leftPanel = collapsible.locator('.leaf-splitter__panel').first();
    const expectCollapsed = async (collapsed: boolean) => {
      await expect(collapsibleDivider).toHaveAttribute('aria-valuenow', collapsed ? '0' : '35');
      if (collapsed) {
        await expect(leftPanel).toHaveAttribute('inert', '');
        await expect(leftPanel).toHaveAttribute('data-collapsed', 'true');
        await expect(leftPanel).not.toBeVisible();
      } else {
        await expect(leftPanel).not.toHaveAttribute('inert', '');
        await expect(leftPanel).not.toHaveAttribute('data-collapsed', 'true');
        await expect(leftPanel).toBeVisible();
      }
    };
    await toggle.click();
    await expectCollapsed(true);
    await collapsible.screenshot({ path: testInfo.outputPath('splitter-collapsed.png') });
    await toggle.click();
    await expectCollapsed(false);
    await collapsibleDivider.press('Enter');
    await expectCollapsed(true);
    await collapsibleDivider.press('Enter');
    await expectCollapsed(false);
    // Avoid the nested collapse button when double-clicking the separator itself.
    await collapsibleDivider.dblclick({ position: { x: 3, y: 20 } });
    await expectCollapsed(true);
    await collapsibleDivider.dblclick({ position: { x: 3, y: 20 } });
    await expectCollapsed(false);

    const controlled = preview('受控比例', 'Controlled proportions');
    const controlledSplitter = controlled.locator('.leaf-splitter');
    const controlledDivider = controlled.getByRole('separator');
    const proportions = controlled
      .locator('.leaf-text')
      .filter({ hasText: english ? /^Current proportions:/ : /^当前比例：/ });
    await controlledDivider.press('ArrowRight');
    await expect(controlledDivider).toHaveAttribute('aria-valuenow', '37');
    await expect(proportions).toHaveText(
      english ? 'Current proportions: 37% / 63%' : '当前比例：37% / 63%',
    );
    const reset = controlled.getByRole('button', {
      name: english ? 'Reset proportions' : '重置比例',
      exact: true,
    });
    await reset.click();
    await expect(controlledDivider).toHaveAttribute('aria-valuenow', '35');
    await expect(proportions).toHaveText(
      english ? 'Current proportions: 35% / 65%' : '当前比例：35% / 65%',
    );
    await dragDivider(page, controlledSplitter, 'horizontal', 10);
    await expect(controlledDivider).toHaveAttribute('aria-valuenow', '45');
    await expect(proportions).toHaveText(
      english ? 'Current proportions: 45% / 55%' : '当前比例：45% / 55%',
    );
    await reset.click();
    await expect(controlledDivider).toHaveAttribute('aria-valuenow', '35');
    await expectFeedbackBelow(controlled, 'Current proportions:', '当前比例：', english);
    await controlled.screenshot({ path: testInfo.outputPath('splitter-controlled-reset.png') });
    await expectPreviewsFit(page);
    expect(errors).toEqual([]);
  });
}
