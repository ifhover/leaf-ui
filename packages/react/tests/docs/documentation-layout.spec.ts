import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  parseComponentDocument,
  readComponentDocument,
} from '../../../../apps/docs/scripts/component-document.mjs';
import { resolveComponentDocumentLinks } from '../../../../apps/docs/scripts/export-component-docs.mjs';
import { settleAnimations } from '../browser/helpers/motion';

const pages = [
  'table',
  'virtual-list',
  'splitter',
  'scrollbar',
  'scroll-area',
  'masonry',
  'layout',
  'infinite-scroll',
  'float-button',
  'back-top',
  'icons',
  'config-provider',
  'alert',
  'anchor',
  'auto-complete',
  'avatar',
  'badge',
  'breadcrumb',
  'button',
  'calendar',
  'card',
  'carousel',
  'cascader',
  'checkbox',
  'color-picker',
  'collapse',
  'confirm',
  'date-picker',
  'date-range-picker',
  'descriptions',
  'divider',
  'drawer',
  'dropdown',
  'empty',
  'error-boundary',
  'file-list',
  'flex',
  'form',
  'grid',
  'image',
  'input',
  'input-mask',
  'input-number',
  'input-otp',
  'loading',
  'loading-bar',
  'mentions',
  'menu',
  'message',
  'modal',
  'notification',
  'pagination',
  'popconfirm',
  'popover',
  'progress',
  'qr-code',
  'radio',
  'rate',
  'result',
  'select',
  'skeleton',
  'slider',
  'space',
  'statistic',
  'steps',
  'switch',
  'tag',
  'tabs',
  'textarea',
  'tooltip',
  'tour',
  'timeline',
  'transfer',
  'tree',
  'tree-select',
  'typography',
  'upload',
];

for (const slug of pages) {
  for (const english of [false, true]) {
    const language = english ? 'en' : 'zh';
    const sourcePath = path.resolve(
      import.meta.dirname,
      `../../../../apps/docs/docs/${english ? 'en/' : ''}components/${slug}.mdx`,
    );
    const source = fs.readFileSync(sourcePath, 'utf8');
    const structured = source.includes('leafDoc')
      ? parseComponentDocument(source, sourcePath)
      : null;
    const structuredExamples = structured ? [structured.basic, ...structured.examples] : [];
    const examples = [
      ...source.matchAll(/<ComponentExample\b([\s\S]*?)<\/ComponentExample>/gu),
    ].map((match) => {
      const block = match[1];
      if (!block) throw new Error(`Empty example in ${sourcePath}`);
      const id = /\bexampleId="([^"]+)"/u.exec(block)?.[1];
      const title =
        /\btitle="([^"]+)"/u.exec(block)?.[1] ??
        structuredExamples.find((example) => example.id === id)?.title;
      const file = /\bfile="([^"]+\.tsx)"/u.exec(block)?.[1];
      const name = /\bpreview=\{<([\w]+)/u.exec(block)?.[1];
      if (!title || !file || !name) throw new Error(`Incomplete example in ${sourcePath}`);
      if (!fs.existsSync(path.resolve(path.dirname(sourcePath), file))) {
        throw new Error(`Missing example source ${file}`);
      }
      return { title, name, id };
    });

    for (const width of [1280, 375]) {
      for (const appearance of ['light', 'dark'] as const) {
        test(`Documentation layout: ${slug} ${language} ${width} ${appearance}`, async ({
          page,
        }, testInfo) => {
          test.setTimeout(90_000);
          const errors: string[] = [];
          page.on('pageerror', (error) => errors.push(error.message));
          await page.setViewportSize({ width, height: 900 });
          await page.emulateMedia({ colorScheme: appearance });
          await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
          await page.goto(`${english ? '/en' : ''}/components/${slug}.html`);
          await expect(page.locator('h1')).toBeVisible();
          const root = page.locator('html');
          const dark = (await root.getAttribute('class'))?.includes('dark');
          if (Boolean(dark) !== (appearance === 'dark')) {
            await page
              .getByRole('button', {
                name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
              })
              .first()
              .click();
          }
          await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
          await expect(page.locator('.leaf-component-example')).toHaveCount(examples.length);
          expect(examples.length).toBeGreaterThan(0);
          const structuredDocument = structured ? await readComponentDocument(sourcePath) : null;
          if (structuredDocument) {
            const headings = await page.locator('.rspress-doc h2').evaluateAll((nodes) =>
              nodes.map((node) => {
                const heading = node.cloneNode(true) as HTMLElement;
                heading.querySelector('[aria-hidden="true"]')?.remove();
                return heading.textContent;
              }),
            );
            expect(headings).toEqual([
              english ? 'Basic usage' : '基础用法',
              english ? 'Examples' : '示例',
              'API',
            ]);
            const response = await page.request.get(`/ai/v1/${language}/${slug}/detail.json`);
            expect(response.ok()).toBe(true);
            const detail = await response.json();
            const exported = resolveComponentDocumentLinks(structuredDocument, {
              sourceUrl: detail.source.url,
            });
            expect(detail.apiNames[0]).toBe(structuredDocument.primaryApi);
            expect(detail.api).toBe(exported.api);
            expect(detail.examples).toHaveLength(structuredDocument.examples.length);
            const anchors = [...source.matchAll(/<a id="([^"]+)"><\/a>/gu)].map(
              (match) => match[1] ?? '',
            );
            for (const anchor of anchors)
              expect(
                await page.evaluate((id) => Boolean(document.getElementById(id)), anchor),
                anchor,
              ).toBe(true);
          }

          for (const [index, { title, name, id }] of examples.entries()) {
            const example = page.getByRole('region', {
              name: english ? `${title} example` : `${title}示例`,
              exact: true,
            });
            const preview = example.locator('.leaf-component-example__preview');
            await expect(preview).toBeVisible();
            await settleAnimations(preview);
            const geometry = await preview.evaluate((node) => {
              const content = node.querySelector('.leaf-component-example__preview-content');
              if (!content) throw new Error('Missing preview content');
              const outer = node.getBoundingClientRect();
              const inner = content.getBoundingClientRect();
              return {
                center: Math.abs(inner.left + inner.width / 2 - outer.left - outer.width / 2),
                fits: inner.left >= outer.left && inner.right <= outer.right,
                overflow: node.scrollWidth - node.clientWidth,
              };
            });
            expect(geometry.center, `${title}: centered preview`).toBeLessThan(1);
            expect(geometry.fits, `${title}: content fits preview`).toBe(true);
            expect(geometry.overflow, `${title}: no horizontal overflow`).toBeLessThanOrEqual(1);
            await preview.screenshot({
              path: testInfo.outputPath(`preview-${index}.png`),
              // Sticky site chrome can overlap screenshots of previews taller than the viewport.
              style: '.rp-nav, .rp-doc-layout__menu { visibility: hidden !important; }',
            });

            const displayed =
              (await example.locator('.leaf-component-example__source code').textContent()) ?? '';
            expect(displayed, `${title}: matching named example`).toContain(name);
            if (structuredDocument) {
              const block =
                id === 'basic'
                  ? structuredDocument.basic
                  : structuredDocument.examples.find((example) => example.id === id)?.markdown;
              if (!block) throw new Error(`Missing structured example ${index} in ${sourcePath}`);
              const extracted = [...block.matchAll(/```tsx\n([\s\S]*?)\n```/gu)].map((match) =>
                match[1]?.trim(),
              );
              expect(
                extracted,
                `${title}: structured export and page share complete code`,
              ).toContain(displayed.trim());
            }
            await example
              .getByRole('button', { name: english ? 'Copy code' : '复制代码', exact: true })
              .click();
            await expect
              .poll(async () =>
                (await page.evaluate(() => navigator.clipboard.readText())).replaceAll(
                  '\r\n',
                  '\n',
                ),
              )
              .toBe(displayed.replaceAll('\r\n', '\n'));
          }

          const longExample = page
            .locator('.leaf-component-example[data-collapsible="true"]')
            .first();
          if (await longExample.count()) {
            await longExample
              .getByRole('button', { name: english ? 'Expand code' : '展开代码', exact: true })
              .click();
            await expect(longExample).toHaveAttribute('data-expanded', 'true');
            await longExample
              .getByRole('button', { name: english ? 'Collapse code' : '收起代码', exact: true })
              .click();
            await expect(longExample).toHaveAttribute('data-expanded', 'false');
          }

          if (width === 1280 && appearance === 'light') {
            const scope = page.locator('.leaf-component-example__preview-content').first();
            const readColor = () =>
              scope.evaluate((node) =>
                getComputedStyle(node).getPropertyValue('--leaf-color-primary'),
              );
            const previousColor = await readColor();
            await page
              .getByRole('button', { name: english ? 'Change theme color' : '切换主题色' })
              .click();
            await page.getByRole('button', { name: '#1d9bf0', exact: true }).click();
            await page.keyboard.press('Escape');
            await expect.poll(readColor).not.toBe(previousColor);
          }

          expect(
            await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
          ).toBeLessThanOrEqual(1);
          expect(errors).toEqual([]);
        });
      }
    }
  }
}
