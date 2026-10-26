import { readFile } from 'node:fs/promises';
import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

const profiles = [
  { english: false, width: 1280, appearance: 'light' },
  { english: true, width: 375, appearance: 'dark' },
  { english: false, width: 375, appearance: 'light' },
  { english: true, width: 1280, appearance: 'dark' },
] as const;

async function openExamples(
  page: Page,
  component: 'image' | 'qr-code' | 'error-boundary',
  { english, width, appearance }: (typeof profiles)[number],
) {
  const errors: string[] = [];
  const expectedRenderErrors: string[] = [];
  let expectingRenderError = false;
  page.on('pageerror', (error) => {
    if (
      component === 'error-boundary' &&
      expectingRenderError &&
      error.message === 'Demo rendering error'
    ) {
      expectedRenderErrors.push(error.message);
    } else {
      errors.push(error.message);
    }
  });
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
    expectedRenderErrors,
    preview: (zh: string, en: string) =>
      page
        .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
        .locator('.leaf-component-example__preview'),
    failRendering: async (trigger: Locator, fallback: Locator) => {
      expectingRenderError = true;
      try {
        await trigger.click();
        await expect(fallback).toBeVisible();
        await settleAnimations(fallback);
      } finally {
        expectingRenderError = false;
      }
    },
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
          if (!preview) throw new Error('Missing media example preview');
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
            '.leaf-image, .leaf-qr-code, .leaf-alert, .leaf-result, button, [role="status"]',
          )) {
            if (!visible(control)) continue;
            const inner = control.getBoundingClientRect();
            if (inner.left < bounds.left - 1 || inner.right > bounds.right + 1) {
              issues.push(`preview ${index} control exceeds content: ${control.className}`);
            }
            const spinner = control.matches('.leaf-loading__indicator')
              ? control.querySelector<SVGElement>(':scope > .leaf-loading__spinner')
              : null;
            if (spinner) {
              // Rotation expands scrollWidth without clipping an overflow-visible indicator.
              const visual = spinner.getBoundingClientRect();
              if (
                Number.parseFloat(getComputedStyle(spinner).width) > control.clientWidth + 1 ||
                Number.parseFloat(getComputedStyle(spinner).height) > control.clientHeight + 1
              ) {
                issues.push(`preview ${index} spinner layout exceeds indicator`);
              }
              if (
                visual.left < bounds.left - 1 ||
                visual.right > bounds.right + 1 ||
                visual.top < bounds.top - 1 ||
                visual.bottom > bounds.bottom + 1
              ) {
                issues.push(`preview ${index} rotated spinner exceeds content`);
              }
              let ancestor: HTMLElement | null = spinner.parentElement;
              while (ancestor && content.contains(ancestor)) {
                const clipping = getComputedStyle(ancestor);
                const clip = ancestor.getBoundingClientRect();
                if (
                  (clipping.overflowX !== 'visible' &&
                    (visual.left < clip.left - 1 || visual.right > clip.right + 1)) ||
                  (clipping.overflowY !== 'visible' &&
                    (visual.top < clip.top - 1 || visual.bottom > clip.bottom + 1))
                ) {
                  issues.push(`preview ${index} rotated spinner is clipped: ${ancestor.className}`);
                }
                ancestor = ancestor.parentElement;
              }
              for (const tip of control.querySelectorAll<HTMLElement>(':scope > span')) {
                if (tip.scrollWidth > tip.clientWidth + 1) {
                  issues.push(`preview ${index} loading tip overflows`);
                }
              }
            } else if (control.scrollWidth > control.clientWidth + 1) {
              issues.push(`preview ${index} control overflows: ${control.className}`);
            }
          }
          for (const label of content.querySelectorAll<HTMLElement>('.leaf-text, button')) {
            if (!visible(label)) continue;
            const labelBounds = label.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(label);
            for (const rect of range.getClientRects()) {
              if (
                rect.width > 0 &&
                (rect.left < labelBounds.left - 1 ||
                  rect.right > labelBounds.right + 1 ||
                  rect.top < labelBounds.top - 1 ||
                  rect.bottom > labelBounds.bottom + 1)
              ) {
                issues.push(`preview ${index} label is clipped: ${label.textContent}`);
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

async function expectStackedImageLabels(preview: Locator) {
  const rows = preview.locator('.leaf-flex:has(> .leaf-text):has(> .leaf-image)');
  expect(await rows.count()).toBeGreaterThan(0);
  for (const row of await rows.all()) {
    const metrics = await row.evaluate((node) => {
      const label = node.querySelector(':scope > .leaf-text')?.getBoundingClientRect();
      const image = node.querySelector(':scope > .leaf-image')?.getBoundingClientRect();
      if (!label || !image) throw new Error('Missing image comparison label');
      return { left: label.left - image.left, gap: image.top - label.bottom };
    });
    expect(Math.abs(metrics.left)).toBeLessThanOrEqual(1);
    expect(metrics.gap).toBeGreaterThanOrEqual(0);
  }
}

async function imageViewer(page: Page, english: boolean) {
  const viewer = page.getByRole('dialog', {
    name: english ? 'Image preview' : '图片预览',
    exact: true,
  });
  await expect(viewer).toBeVisible();
  await expect(viewer).toHaveCSS('opacity', '1');
  await expect
    .poll(() =>
      viewer
        .locator('.yarl__slide_current .yarl__slide_image')
        .evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0),
    )
    .toBe(true);
  await settleAnimations(viewer);
  return viewer;
}

async function expectViewerFits(viewer: Locator) {
  await settleAnimations(viewer);
  await expect
    .poll(() =>
      viewer.evaluate((node) => {
        const issues: string[] = [];
        const bounds = node.getBoundingClientRect();
        const contained = (inner: DOMRect, outer: DOMRect) =>
          inner.left >= outer.left - 1 &&
          inner.right <= outer.right + 1 &&
          inner.top >= outer.top - 1 &&
          inner.bottom <= outer.bottom + 1;
        const visible = (element: Element) =>
          element.getClientRects().length > 0 &&
          !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
          getComputedStyle(element).visibility !== 'hidden';
        if (
          bounds.left < -1 ||
          bounds.right > innerWidth + 1 ||
          bounds.top < -1 ||
          bounds.bottom > innerHeight + 1
        ) {
          issues.push('viewer exceeds viewport');
        }
        for (const part of node.querySelectorAll<HTMLElement>(
          '.leaf-image-viewer__header, .leaf-image-viewer__tools, ' +
            '.leaf-image-viewer__gallery, .leaf-image-viewer__control, ' +
            '.leaf-image-viewer__zoom-level, .leaf-image-viewer__count, ' +
            '.yarl__slide_current .yarl__slide_image',
        )) {
          if (!visible(part)) continue;
          if (!contained(part.getBoundingClientRect(), bounds)) {
            issues.push(`viewer part exceeds viewport: ${part.className}`);
          }
          if (part.scrollWidth > part.clientWidth + 1) {
            issues.push(`viewer part overflows: ${part.className}`);
          }
        }
        for (const label of node.querySelectorAll<HTMLElement>(
          '.leaf-image-viewer__count, .leaf-image-viewer__zoom-level, ' +
            '.leaf-image-viewer__actual-size, .leaf-image-viewer__error',
        )) {
          if (!visible(label)) continue;
          const range = document.createRange();
          range.selectNodeContents(label);
          for (const rect of range.getClientRects()) {
            if (rect.width > 0 && !contained(rect, label.getBoundingClientRect())) {
              issues.push(`viewer label is clipped: ${label.textContent}`);
              break;
            }
          }
        }
        const strip = node.querySelector<HTMLElement>(
          '.leaf-image-viewer__strip .leaf-scrollbar__viewport',
        );
        if (strip && visible(strip)) {
          const stripBounds = strip.getBoundingClientRect();
          if (!contained(stripBounds, bounds)) issues.push('thumbnail viewport exceeds viewer');
          for (const thumbnail of strip.querySelectorAll<HTMLElement>(
            '.leaf-image-viewer__thumbnail',
          )) {
            const inner = thumbnail.getBoundingClientRect();
            if (inner.bottom > stripBounds.bottom + 1 || inner.top < stripBounds.top - 1) {
              issues.push('thumbnail is clipped vertically');
            }
          }
        }
        return issues;
      }),
    )
    .toEqual([]);
}

for (const profile of profiles) {
  const { english, width, appearance } = profile;
  const suffix = `${english ? 'en' : 'zh'} ${width} ${appearance}`;

  test(`Image usage and previews: ${suffix}`, async ({ page }, testInfo) => {
    const { preview, errors } = await openExamples(page, 'image', profile);
    const closeName = english ? 'Close preview' : '关闭预览';
    const nextName = english ? 'Next image' : '下一张';

    const basic = preview('基础用法', 'Basic usage');
    const basicTrigger = basic.getByRole('button', {
      name: english ? 'Preview image: Green valley' : '预览图片: 绿色山谷',
      exact: true,
    });
    await basic.scrollIntoViewIfNeeded();
    await expect(basic.locator('.leaf-image')).toHaveAttribute('data-state', 'ready');
    await basicTrigger.click();
    let viewer = await imageViewer(page, english);
    await expect(viewer.locator('.leaf-image-viewer__count')).toHaveText('1 / 1');
    await expect(viewer.getByRole('button', { name: nextName, exact: true })).toHaveCount(0);
    await expectViewerFits(viewer);
    await viewer.screenshot({ path: testInfo.outputPath('image-single-preview.png') });
    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
    await expect(basicTrigger).toBeFocused();

    const display = preview('仅展示图片', 'Display-only images');
    await expect(display.getByRole('button')).toHaveCount(0);
    await display.locator('img').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    const fitting = preview('填充方式', 'Image fitting');
    await expect(fitting.locator('img').nth(0)).toHaveCSS('object-fit', 'cover');
    await expect(fitting.locator('img').nth(1)).toHaveCSS('object-fit', 'contain');
    await expectStackedImageLabels(fitting);

    const states = preview('空图片与加载失败', 'Empty and failed images');
    await states.scrollIntoViewIfNeeded();
    const images = states.locator('.leaf-image');
    await expect(images).toHaveCount(3);
    await expect(images.nth(0)).toHaveAttribute('data-state', 'empty');
    await expect(images.nth(1)).toHaveAttribute('data-state', 'error');
    await expect(images.nth(2)).toHaveAttribute('data-state', 'empty');
    await expect(images.nth(0).getByRole('button')).toHaveCount(0);
    await expect(images.nth(1).getByRole('button')).toBeDisabled();
    await expect(images.nth(0).locator('.leaf-image__fallback > span')).toHaveText(
      english ? 'No image' : '暂无图片',
    );
    await expect(images.nth(1).locator('.leaf-image__fallback > span')).toHaveText(
      english ? 'Image unavailable' : '图片加载失败',
    );
    await expect(images.nth(2).locator('.leaf-image__placeholder')).toHaveText(
      english ? 'Image unavailable' : '图片暂不可用',
    );
    await expectStackedImageLabels(states);
    await states.screenshot({ path: testInfo.outputPath('image-fallback-states.png') });

    const gallery = preview('图片画廊与预览', 'Gallery and preview');
    const galleryTrigger = gallery.getByRole('button', {
      name: english ? 'Preview image: Landscape 2' : '预览图片: 风景 2',
      exact: true,
    });
    await galleryTrigger.click();
    viewer = await imageViewer(page, english);
    await expect(viewer.locator('.leaf-image-viewer__count')).toHaveText('2 / 3');
    await page.keyboard.press('ArrowLeft');
    await expect(viewer.locator('.leaf-image-viewer__count')).toHaveText('1 / 3');
    await page.keyboard.press('ArrowRight');
    await expect(viewer.locator('.leaf-image-viewer__count')).toHaveText('2 / 3');
    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
    await expect(galleryTrigger).toBeFocused();

    await galleryTrigger.click();
    viewer = await imageViewer(page, english);
    const next = viewer.getByRole('button', { name: nextName, exact: true });
    await next.click();
    await expect(viewer.locator('.leaf-image-viewer__count')).toHaveText('3 / 3');
    await expect(next).toBeDisabled();
    await expectViewerFits(viewer);
    await viewer.screenshot({ path: testInfo.outputPath('image-gallery-finite-end.png') });
    // The independent FileList regression retains the known last-slide Escape/focus failure.
    await viewer.getByRole('button', { name: closeName, exact: true }).click();
    await expect(viewer).toBeHidden();
    await expect(galleryTrigger).toBeFocused();

    const controlled = preview('受控预览', 'Controlled preview');
    const open = controlled.getByRole('button', {
      name: english ? 'Open current image' : '打开当前图片',
      exact: true,
    });
    await open.click();
    viewer = await imageViewer(page, english);
    await expect(viewer.locator('.leaf-image-viewer__count')).toHaveText('1 / 3');
    await viewer.getByRole('button', { name: nextName, exact: true }).click();
    await expect(viewer.locator('.leaf-image-viewer__count')).toHaveText('2 / 3');
    await viewer.getByRole('button', { name: closeName, exact: true }).click();
    await expect(viewer).toBeHidden();
    await expect(controlled.getByRole('status')).toHaveText(
      english ? 'Image: 2 / 3' : '当前图片：2 / 3',
    );
    await open.click();
    viewer = await imageViewer(page, english);
    await expect(viewer.locator('.leaf-image-viewer__count')).toHaveText('2 / 3');
    await viewer.getByRole('button', { name: closeName, exact: true }).click();
    await expect(viewer).toBeHidden();
    await controlled
      .getByRole('button', { name: english ? 'Reset to first image' : '回到第一张', exact: true })
      .click();
    await expect(controlled.getByRole('status')).toHaveText(
      english ? 'Image: 1 / 3' : '当前图片：1 / 3',
    );
    await controlled.screenshot({ path: testInfo.outputPath('image-controlled-reset.png') });

    const service = preview('命令式预览', 'Imperative preview');
    const serviceTrigger = service.getByRole('button', {
      name: english ? 'Start with the second image' : '从第二张开始预览',
      exact: true,
    });
    await serviceTrigger.click();
    viewer = await imageViewer(page, english);
    await expect(viewer.locator('.leaf-image-viewer__count')).toHaveText('2 / 3');
    await viewer
      .getByRole('button', { name: english ? 'Actual size (1:1)' : '原始尺寸（1:1）', exact: true })
      .click();
    const zoom = viewer.getByRole('button', {
      name: english ? 'Fit to window' : '适应窗口',
      exact: true,
    });
    await expect(zoom).toHaveText('100%');
    await viewer.getByRole('button', { name: english ? 'Zoom in' : '放大', exact: true }).click();
    await expect(zoom).toHaveText('125%');
    await zoom.click();
    const active = viewer.locator('.yarl__slide_current .yarl__slide_image');
    await viewer
      .getByRole('button', { name: english ? 'Rotate clockwise' : '顺时针旋转', exact: true })
      .click();
    await expect(active).toHaveCSS('rotate', '90deg');
    await viewer
      .getByRole('button', {
        name: english ? 'Rotate counterclockwise' : '逆时针旋转',
        exact: true,
      })
      .click();
    await expect(active).toHaveCSS('rotate', '0deg');
    const thumbnails = viewer.getByRole('button', {
      name: english ? 'Show thumbnails' : '显示缩略图',
      exact: true,
    });
    await thumbnails.click();
    await expect(thumbnails).toHaveAttribute('aria-pressed', 'false');
    await expect(viewer.locator('.leaf-image-viewer__gallery')).toHaveCount(0);
    await thumbnails.click();
    await expect(thumbnails).toHaveAttribute('aria-pressed', 'true');
    await expectViewerFits(viewer);
    await viewer.screenshot({ path: testInfo.outputPath('image-imperative-toolbar.png') });
    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
    await expect(serviceTrigger).toBeFocused();
    await expectPreviewsFit(page);
    expect(errors).toEqual([]);
  });

  test(`QRCode content and downloads: ${suffix}`, async ({ page }, testInfo) => {
    const { preview, errors } = await openExamples(page, 'qr-code', profile);
    const basic = preview('基础用法', 'Basic usage');
    await expect(basic.locator('.leaf-qr-code__image > svg')).toHaveAccessibleName(
      english ? 'Leaf UI documentation QR code' : 'Leaf UI 文档二维码',
    );
    await expect(basic.locator('.leaf-qr-code__overlay')).toHaveCount(0);
    await expect(basic.getByRole('button')).toHaveCount(0);
    await expect(
      preview('加载状态', 'Loading state').locator('.leaf-qr-code__overlay .leaf-loading'),
    ).toBeVisible();

    const refresh = preview('过期后刷新', 'Refresh after expiry');
    const status = refresh.getByRole('status');
    const path = refresh.locator('.leaf-qr-code__image > svg > path').last();
    const initialCode = await path.getAttribute('d');
    expect(initialCode).toBeTruthy();
    await expect(status).toHaveText(
      english ? 'Token: 1, status: Expired' : '当前令牌：1，状态：已过期',
    );
    const expire = refresh.getByRole('button', {
      name: english ? 'Mark as expired' : '设为过期',
      exact: true,
    });
    await expect(expire).toBeDisabled();
    await refresh
      .getByRole('button', { name: english ? 'Refresh code' : '刷新二维码', exact: true })
      .click();
    await expect(status).toHaveText(
      english ? 'Token: 2, status: Active' : '当前令牌：2，状态：可使用',
    );
    await expect(path).not.toHaveAttribute('d', initialCode ?? '');
    await expect(refresh.locator('.leaf-qr-code__overlay')).toHaveCount(0);
    await expire.click();
    await expect(status).toHaveText(
      english ? 'Token: 2, status: Expired' : '当前令牌：2，状态：已过期',
    );
    await refresh
      .getByRole('button', { name: english ? 'Refresh code' : '刷新二维码', exact: true })
      .click();
    await expect(status).toHaveText(
      english ? 'Token: 3, status: Active' : '当前令牌：3，状态：可使用',
    );
    await refresh.screenshot({ path: testInfo.outputPath('qrcode-refreshed-token.png') });

    const downloadable = preview('下载 SVG', 'Download an SVG');
    const downloaded = page.waitForEvent('download');
    await downloadable
      .getByRole('button', { name: english ? 'Download' : '下载', exact: true })
      .click();
    const download = await downloaded;
    expect(download.suggestedFilename()).toBe('leaf-ui-docs.svg');
    expect(await download.failure()).toBeNull();
    const file = await download.path();
    if (!file) throw new Error('QR code download has no local file');
    const svg = await readFile(file, 'utf8');
    expect(svg).toMatch(/^<svg\b/u);
    expect(svg).toContain('http://www.w3.org/2000/svg');
    expect(svg).toMatch(/<path\b[^>]*\bd="[^"]+"/u);
    expect(svg).not.toContain('var(--');
    expect(
      await page.evaluate((markup) => {
        const document = new DOMParser().parseFromString(markup, 'image/svg+xml');
        return {
          root: document.documentElement.localName,
          errors: document.querySelectorAll('parsererror').length,
        };
      }, svg),
    ).toEqual({ root: 'svg', errors: 0 });

    const logo = preview('中央标志', 'Center logo');
    await expect(logo.locator('.leaf-qr-code__image > svg image')).toHaveAttribute(
      'href',
      /^data:image\/svg\+xml;charset=utf-8,/u,
    );
    await logo.screenshot({ path: testInfo.outputPath('qrcode-center-logo.png') });
    await expectPreviewsFit(page);
    expect(errors).toEqual([]);
  });

  test(`ErrorBoundary fallback and recovery: ${suffix}`, async ({ page }, testInfo) => {
    const { preview, errors, expectedRenderErrors, failRendering } = await openExamples(
      page,
      'error-boundary',
      profile,
    );
    const content = english ? 'Content is displayed normally.' : '内容正常显示。';
    const retry = english ? 'Retry' : '重试';
    const basic = preview('基础用法', 'Basic usage');
    await expect(basic.getByText(content, { exact: true })).toBeVisible();
    const basicFallback = basic.locator('.leaf-result');
    await failRendering(
      basic.getByRole('button', {
        name: english ? 'Simulate a rendering error' : '模拟内容异常',
        exact: true,
      }),
      basicFallback,
    );
    await expect(basicFallback).toContainText(
      english ? 'This content could not be displayed' : '内容暂时无法显示',
    );
    await expect(basic.getByText('Demo rendering error', { exact: true })).toHaveCount(0);
    await expectPreviewsFit(page);
    await basic.screenshot({ path: testInfo.outputPath('error-boundary-default-fallback.png') });
    await basicFallback.getByRole('button', { name: retry, exact: true }).click();
    await expect(basic.getByText(content, { exact: true })).toBeVisible();
    await expect(basicFallback).toHaveCount(0);

    const custom = preview('自定义兜底内容', 'Custom fallback content');
    const alert = custom.getByRole('alert');
    await failRendering(
      custom.getByRole('button', { name: english ? 'Test fallback' : '测试备用界面', exact: true }),
      alert,
    );
    await expect(alert).toContainText(english ? 'This section is unavailable' : '此区块不可用');
    const reset = custom.getByRole('button', {
      name: english ? 'Try again' : '再次尝试',
      exact: true,
    });
    await expect(reset).toBeEnabled();
    await expect(custom.getByText('Demo rendering error', { exact: true })).toHaveCount(0);
    await expectPreviewsFit(page);
    await custom.screenshot({ path: testInfo.outputPath('error-boundary-custom-fallback.png') });
    await reset.click();
    await expect(alert).toHaveCount(0);
    await expect(custom.getByText(content, { exact: true })).toBeVisible();

    const records = preview('切换记录后恢复', 'Recover when the record changes');
    const recordContent = english ? 'Record content loaded successfully.' : '记录内容读取成功。';
    const failure = records.getByRole('button', {
      name: english ? 'Simulate a record error' : '模拟记录异常',
      exact: true,
    });
    const recordFallback = records.locator('.leaf-result');
    await expect(records.getByRole('status')).toHaveText(english ? 'Record: 1' : '当前记录：1');
    await failRendering(failure, recordFallback);
    await records
      .getByRole('button', { name: english ? 'Switch record' : '切换记录', exact: true })
      .click();
    await expect(recordFallback).toHaveCount(0);
    await expect(records.getByRole('status')).toHaveText(english ? 'Record: 2' : '当前记录：2');
    await expect(records.getByText(recordContent, { exact: true })).toBeVisible();
    await failRendering(failure, recordFallback);
    await recordFallback.getByRole('button', { name: retry, exact: true }).click();
    await expect(records.getByRole('status')).toHaveText(english ? 'Record: 2' : '当前记录：2');
    await expect(records.getByText(recordContent, { exact: true })).toBeVisible();
    await records.screenshot({ path: testInfo.outputPath('error-boundary-record-recovery.png') });
    await expectPreviewsFit(page);
    await testInfo.attach('expected-render-pageerrors', {
      body: JSON.stringify(expectedRenderErrors),
      contentType: 'application/json',
    });
    expect(errors).toEqual([]);
  });
}
