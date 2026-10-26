import { expect, test } from '@playwright/test';
import { componentCatalog } from '../../../../apps/docs/src/components/component-catalog';

for (const english of [false, true]) {
  const prefix = english ? '/en' : '';
  for (const width of [1280, 390]) {
    for (const dark of [false, true]) {
      test(`Reader examples: ${english ? 'en' : 'zh'} ${width} ${dark ? 'dark' : 'light'}`, async ({
        page,
      }, testInfo) => {
        test.setTimeout(120_000);
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: dark ? 'dark' : 'light' });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        const visit = async (path: string) => {
          await page.goto(`${prefix}/${path}.html`);
          await expect(page.locator('h1')).toBeVisible();
          const isDark = (await page.locator('html').getAttribute('class'))?.includes('dark');
          if (Boolean(isDark) !== dark) {
            await page
              .getByRole('button', {
                name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
              })
              .first()
              .click();
          }
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
          ).toBeLessThanOrEqual(1);
        };

        await visit('components/tabs');
        const sizes = page.getByRole('region', {
          name: english ? 'Sizes example' : '不同尺寸示例',
          exact: true,
        });
        const appearances = page.getByRole('region', {
          name: english ? 'Appearances example' : '不同形态示例',
          exact: true,
        });
        await expect(sizes.getByRole('tablist')).toHaveCount(3);
        await expect(appearances.getByRole('tablist')).toHaveCount(3);
        await sizes.locator('.leaf-component-example__preview').screenshot({
          path: testInfo.outputPath('tabs-size-comparison.png'),
        });

        await visit('components/input-otp');
        const slots = page.locator('.leaf-component-example__preview .leaf-input-otp__slots');
        for (const row of await slots.all()) {
          const fits = await row.evaluate((node) => {
            const preview = node
              .closest('.leaf-component-example__preview')
              ?.getBoundingClientRect();
            if (!preview) throw new Error('Missing example preview');
            const bounds = node.getBoundingClientRect();
            return bounds.left >= preview.left && bounds.right <= preview.right;
          });
          expect(fits).toBe(true);
        }

        await visit('components/select');
        const validation = page.locator('.leaf-component-example__preview').nth(1);
        await validation
          .getByRole('button', { name: english ? 'Submit' : '提交', exact: true })
          .click();
        await expect(validation).toContainText(english ? 'Select visibility' : '请选择可见性');
        await validation.getByRole('combobox').click();
        await page.getByRole('option', { name: english ? 'Team' : '团队', exact: true }).click();
        await expect(validation.locator('.leaf-form-field__error')).toHaveCount(0);
        await expect(validation.getByRole('status')).toContainText('team');
        const controlSizes = page.locator('.leaf-component-example__preview').nth(2);
        if (width === 1280) {
          const controls = controlSizes.locator('.leaf-flex:has(> .leaf-input)');
          await expect(controls).toHaveCount(3);
          for (const row of await controls.all()) {
            const input = await row.locator('.leaf-input').first().boundingBox();
            const button = await row
              .getByRole('button', { name: english ? 'Search' : '查询', exact: true })
              .boundingBox();
            expect(input?.y).toBeCloseTo(button?.y ?? 0, 0);
          }
        }

        await visit('components/form');
        const form = page.locator('.leaf-component-example__preview').last();
        await form.getByRole('button', { name: english ? 'Save' : '保存', exact: true }).click();
        await expect(form).toContainText(english ? 'Enter a name' : '请输入姓名');
        await form.getByRole('textbox').fill('Leaf');
        await form.getByRole('button', { name: english ? 'Save' : '保存', exact: true }).click();
        await expect(form.getByRole('status')).toContainText('Leaf');
        await form.getByRole('button', { name: english ? 'Reset' : '重置', exact: true }).click();
        await expect(form.getByRole('textbox')).toHaveValue('');

        await visit('components/float-button');
        const floating = page.locator('.leaf-component-example__preview').first();
        const button = floating.getByRole('button', {
          name: english ? 'Create' : '新建',
          exact: true,
        });
        await expect(button).toHaveCSS('position', 'fixed');
        await button.click();
        await expect(floating.getByRole('status')).toContainText('1');
        const floatBox = await button.boundingBox();
        const previewBox = await floating.boundingBox();
        if (!floatBox || !previewBox) throw new Error('Missing floating button bounds');
        expect(floatBox.y + floatBox.height).toBeLessThanOrEqual(previewBox.y + previewBox.height);

        await visit('components/tag');
        await expect(page.locator('.leaf-component-example').first()).toHaveAttribute(
          'data-collapsible',
          'false',
        );
        const check = page.locator('.leaf-component-example__preview .leaf-checkable-tag').first();
        await check.click();
        await expect(check).toHaveAttribute('aria-pressed', 'true');

        await visit('components/result');
        const result = page.locator('.leaf-component-example__preview').first();
        await result
          .getByRole('button', { name: english ? 'Open project' : '进入项目', exact: true })
          .click();
        await expect(result.getByRole('status')).toContainText(english ? 'opened' : '打开');

        await visit('api/index');
        const link = page.locator('main a[href$="components/select.html#select-api"]').first();
        await expect(link).toBeVisible();
        await link.click();
        await expect(page).toHaveURL(/select(?:\.html)?#select-api$/);
        await expect(page.locator('#select-api')).toBeVisible();

        await visit('guide/colors');
        const palette = page.locator('.leaf-component-example__preview');
        const save = palette.getByRole('button', {
          name: english ? 'Save' : '保存',
          exact: true,
        });
        await expect(save).toHaveCSS('color', 'rgb(255, 255, 255)');
        await palette
          .getByRole('button', { name: english ? 'Use black text' : '改为黑字', exact: true })
          .click();
        await expect(save).toHaveCSS('color', 'rgb(0, 0, 0)');
        await palette
          .getByRole('button', { name: english ? 'Use white text' : '改为白字', exact: true })
          .click();
        await expect(save).toHaveCSS('color', 'rgb(255, 255, 255)');
        const themeToggle = page
          .getByRole('button', {
            name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
          })
          .first();
        await themeToggle.click();
        await expect(page.locator('html')).toHaveClass(dark ? /^(?!.*\bdark\b)/ : /dark/);

        await visit('guide/theming');
        const presets = page.locator('.leaf-component-example__preview').nth(1);
        const project = presets.getByRole('textbox', {
          name: english ? 'Project name' : '项目名称',
          exact: true,
        });
        await project.fill('Remember this value');
        const styles = presets.getByRole('tab');
        await expect(styles).toHaveCount(5);
        await styles.first().focus();
        await styles.first().press('End');
        await expect(styles.last()).toHaveAttribute('aria-selected', 'true');
        await expect(project).toHaveValue('Remember this value');
        await presets.screenshot({ path: testInfo.outputPath('theme-presets.png') });
        await styles.last().press('Home');
        await expect(styles.first()).toHaveAttribute('aria-selected', 'true');
        await expect(project).toHaveValue('Remember this value');
        expect(errors).toEqual([]);
      });
    }
  }

  test(`All component pages fit narrow screens: ${english ? 'en' : 'zh'}`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width: 390, height: 900 });
    await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
    const issues: string[] = [];
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const routes = [
      ...componentCatalog.map(([, , slug]) => `components/${slug}`),
      'guide/theming',
      'guide/design-standards',
      'guide/compatibility',
      'guide/colors',
      'api/index',
    ];
    for (const route of routes) {
      await page.goto(`${prefix}/${route}.html`);
      await expect(page.locator('h1')).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (overflow > 1) issues.push(`${route}: page overflow ${overflow}`);
      const previewOverflow = await page
        .locator('.leaf-component-example__preview')
        .evaluateAll((nodes) =>
          nodes.flatMap((node, index) =>
            node.scrollWidth - node.clientWidth > 1
              ? [`preview ${index}: ${node.scrollWidth - node.clientWidth}px`]
              : [],
          ),
        );
      issues.push(...previewOverflow.map((issue) => `${route}: ${issue}`));
    }
    expect(errors).toEqual([]);
    expect(issues).toEqual([]);
  });

  test(`Upload queue progresses and cancels: ${english ? 'en' : 'zh'}`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
    await page.goto(`${prefix}/components/upload.html`);
    const preview = page.locator('.leaf-component-example__preview').filter({
      has: page.getByRole('button', {
        name: english ? 'Choose multiple files' : '选择多个文件',
        exact: true,
      }),
    });
    await preview.locator('input[type="file"]').setInputFiles(
      ['one.txt', 'two.txt', 'three.txt', 'four.txt'].map((name) => ({
        name,
        mimeType: 'text/plain',
        buffer: Buffer.from('Leaf'),
      })),
    );
    const uploading = preview.locator('.leaf-file-list__item[data-status="uploading"]');
    const queued = preview.locator('.leaf-file-list__item[data-status="ready"]');
    await expect(uploading).toHaveCount(2);
    await expect(queued).toHaveCount(2);
    await expect
      .poll(async () =>
        Number(await uploading.first().getByRole('progressbar').getAttribute('aria-valuenow')),
      )
      .toBeGreaterThan(0);
    await preview.screenshot({ path: testInfo.outputPath('upload-queue.png') });
    await uploading
      .first()
      .getByRole('button', { name: english ? /Cancel/ : /取消/ })
      .click();
    await expect(preview.locator('.leaf-file-list__item[data-status="cancelled"]')).toHaveCount(1);
    await expect(uploading).toHaveCount(2);
    await expect(queued).toHaveCount(1);
    await expect(preview.locator('.leaf-file-list__item[data-status="done"]')).toHaveCount(3, {
      timeout: 10_000,
    });
    await expect(uploading).toHaveCount(0);
  });
}
