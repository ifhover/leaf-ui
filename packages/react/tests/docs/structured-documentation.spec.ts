import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  parseComponentDocument,
  readComponentDocument,
} from '../../../../apps/docs/scripts/component-document.mjs';
import { resolveComponentDocumentLinks } from '../../../../apps/docs/scripts/export-component-docs.mjs';

const directory = path.resolve(import.meta.dirname, '../../../../apps/docs/docs');

for (const language of ['zh', 'en']) {
  const prefix = language === 'en' ? 'en/' : '';
  for (const file of fs.readdirSync(path.join(directory, prefix, 'components'))) {
    if (!file.endsWith('.mdx')) continue;
    const sourcePath = path.join(directory, prefix, 'components', file);
    const source = fs.readFileSync(sourcePath, 'utf8');
    const model = parseComponentDocument(source, sourcePath);
    if (!model) continue;
    const slug = path.basename(file, '.mdx');
    test(`Structured documentation: ${slug} ${language}`, async ({ page }) => {
      const content = await readComponentDocument(sourcePath);
      if (!content) throw new Error(`Missing structured document: ${file}`);
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width: language === 'en' ? 375 : 1280, height: 900 });
      await page.emulateMedia({ colorScheme: language === 'en' ? 'dark' : 'light' });
      await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      await page.goto(`/${prefix}components/${slug}.html`);
      await expect(page.locator('.rspress-doc h1')).toBeVisible();
      const headings = await page.locator('.rspress-doc h2').evaluateAll((nodes) =>
        nodes.map((node) => {
          const copy = node.cloneNode(true) as HTMLElement;
          copy.querySelector('[aria-hidden="true"]')?.remove();
          return copy.textContent;
        }),
      );
      expect(headings).toEqual([
        language === 'en' ? 'Basic usage' : '基础用法',
        language === 'en' ? 'Examples' : '示例',
        'API',
      ]);
      const basic = page.getByRole('region', {
        name: language === 'en' ? 'Basic usage example' : '基础用法示例',
        exact: true,
      });
      await expect(basic).toBeVisible();
      const code = [...content.basic.matchAll(/```[jt]sx?\r?\n([\s\S]*?)\r?\n```/gu)].map((match) =>
        match[1]?.trim(),
      );
      // Setup snippets can precede the full interactive example in the same basic section.
      expect(code).toContain(
        (await basic.locator('.leaf-component-example__source code').textContent())?.trim(),
      );
      const response = await page.request.get(`/ai/v1/${language}/${slug}/detail.json`);
      expect(response.ok()).toBe(true);
      const detail = await response.json();
      const exported = resolveComponentDocumentLinks(content, { sourceUrl: detail.source.url });
      expect(detail.component).toBe(content.component);
      expect(detail.apiNames[0]).toBe(content.primaryApi);
      expect(detail.description).toBe(exported.description);
      expect(detail.introduction).toBe(exported.introduction);
      expect(detail.basic).toBe(exported.basic);
      expect(detail.api).toBe(exported.api);
      expect(detail.examples.map(({ id }: { id: string }) => id)).toEqual(
        content.examples.map(({ id }) => id),
      );
      for (const match of source.matchAll(/<a id="([^"]+)"><\/a>/gu)) {
        const id = match[1];
        if (!id) throw new Error('Empty legacy anchor');
        expect(await page.evaluate((value) => Boolean(document.getElementById(value)), id)).toBe(
          true,
        );
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(1);
      expect(errors).toEqual([]);
    });
  }
}
