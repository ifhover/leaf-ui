import { expect, type Page, test } from '@playwright/test';

async function visitLoadingPage(
  page: Page,
  component: 'loading' | 'loading-bar' | 'skeleton',
  english: boolean,
  appearance: 'light' | 'dark',
) {
  await page.goto(`${english ? '/en' : ''}/components/${component}.html`);
  await expect(page.locator('h1')).toBeVisible();
  const root = page.locator('html');
  const dark = Boolean((await root.getAttribute('class'))?.includes('dark'));
  if (dark !== (appearance === 'dark')) {
    await page
      .getByRole('button', {
        name: english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/,
      })
      .first()
      .click();
  }
  await expect(root).toHaveClass(appearance === 'dark' ? /dark/ : /^(?!.*\bdark\b)/);
}

function preview(page: Page, english: boolean, zh: string, en: string) {
  return page
    .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
    .locator('.leaf-component-example__preview');
}

async function pauseClock(page: Page) {
  await page.clock.install({ time: new Date('2026-10-26T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
}

for (const english of [false, true]) {
  for (const { width, appearance } of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Loading examples: ${english ? 'en' : 'zh'} ${width} ${appearance}`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme: appearance });

      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      });

      test('Loading blocks its content and cancels delayed indicators', async ({ page }) => {
        await visitLoadingPage(page, 'loading', english, appearance);
        const area = preview(page, english, '区域加载', 'Loading an area');
        const content = area.locator('.leaf-loading__content');
        const edit = area.getByRole('button', {
          name: english ? 'Edit project' : '编辑项目',
          exact: true,
          includeHidden: true,
        });
        const feedback = area.getByText(english ? 'Project editor opened' : '已打开项目编辑', {
          exact: true,
        });
        await expect(area.locator('.leaf-loading--wrapped')).toHaveAttribute('aria-busy', 'true');
        await expect(content).toHaveAttribute('inert', '');
        await expect(
          area.getByRole('status', {
            name: english ? 'Loading projects' : '正在读取项目',
            exact: true,
          }),
        ).toBeVisible();

        await edit.scrollIntoViewIfNeeded();
        const bounds = await edit.boundingBox();
        if (!bounds) throw new Error('Missing covered edit button bounds');
        // A real pointer click must not reach the handler inside the inert content.
        await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        await expect(feedback).toHaveCount(0);
        await area
          .getByRole('button', { name: english ? 'Finish loading' : '结束加载', exact: true })
          .click();
        await expect(content).not.toHaveAttribute('inert');
        await expect(area.locator('.leaf-loading--wrapped')).toHaveAttribute('aria-busy', 'false');
        await edit.click();
        await expect(feedback).toBeVisible();

        const delayed = preview(page, english, '延迟显示', 'Delayed display');
        const start = delayed.getByRole('button', {
          name: english ? 'Start loading' : '开始加载',
          exact: true,
        });
        const finish = delayed.getByRole('button', {
          name: english ? 'Finish loading' : '结束加载',
          exact: true,
        });
        const loading = delayed.locator('.leaf-loading');
        await delayed.scrollIntoViewIfNeeded();
        await pauseClock(page);
        await expect(delayed.locator('.leaf-loading__state')).toHaveCount(0);
        await start.click();
        await expect(loading).toHaveAttribute('aria-busy', 'true');
        await page.clock.runFor(200);
        await expect(delayed.locator('.leaf-loading__state')).toHaveCount(0);
        await finish.click();
        await expect(loading).toHaveAttribute('aria-busy', 'false');
        await page.clock.runFor(800);
        await expect(delayed.locator('.leaf-loading__state')).toHaveCount(0);

        await start.click();
        await expect(loading).toHaveAttribute('aria-busy', 'true');
        await expect(delayed.locator('.leaf-loading__state')).toHaveCount(0);
        await page.clock.runFor(600);
        await expect(
          delayed.getByRole('status', { name: english ? 'Loading' : '正在加载', exact: true }),
        ).toBeVisible();
        await finish.click();
        await expect(loading).toHaveAttribute('aria-busy', 'false');
        await expect(delayed.getByRole('status')).toHaveCount(0);
      });

      test('LoadingBar manual progress is independent of the async service task', async ({
        page,
      }) => {
        await visitLoadingPage(page, 'loading-bar', english, appearance);
        const basic = preview(page, english, '基础用法', 'Basic usage');
        const simulate = basic.getByRole('button', {
          name: english ? 'Simulate page loading' : '模拟页面加载',
          exact: true,
        });
        const manual = preview(page, english, '手动控制进度', 'Control progress manually');
        const finish = manual.getByRole('button', {
          name: english ? 'Finish' : '完成',
          exact: true,
        });
        const bars = page.getByRole('progressbar', {
          name: english ? 'Page loading progress' : '页面加载进度',
          exact: true,
        });
        const serviceBar = bars.and(page.locator(':not([aria-valuenow])'));
        const manualBar = bars.and(page.locator('[aria-valuenow]'));
        await expect(bars).toHaveCount(0);
        await expect(finish).toBeDisabled();
        await expect(manual.getByRole('status')).toHaveText(
          english ? 'Loading bar is hidden' : '加载条已收起',
        );
        await pauseClock(page);

        await simulate.click();
        await expect(simulate).toBeDisabled();
        await expect(simulate).toHaveAttribute('aria-busy', 'true');
        await expect(serviceBar).toBeVisible();
        for (const progress of [40, 70]) {
          await manual
            .getByRole('button', {
              name: english ? `Set to ${progress}%` : `设为 ${progress}%`,
              exact: true,
            })
            .click();
          await expect(bars).toHaveCount(2);
          await expect(manualBar).toHaveAttribute('aria-valuenow', String(progress));
          await expect(manual.getByRole('status')).toHaveText(
            english ? `Current progress: ${progress}%` : `当前进度：${progress}%`,
          );
          await expect(serviceBar).toBeVisible();
          await expect(simulate).toBeDisabled();
        }

        await finish.click();
        await expect(finish).toBeDisabled();
        await expect(manual.getByRole('status')).toHaveText(
          english ? 'Loading bar is hidden' : '加载条已收起',
        );
        await page.clock.runFor(800);
        await expect(bars).toHaveCount(1);
        await expect(serviceBar).toBeVisible();
        await expect(simulate).toBeDisabled();
        await expect(simulate).toHaveAttribute('aria-busy', 'true');

        await page.clock.runFor(800);
        await expect(simulate).toBeEnabled();
        await expect(simulate).not.toHaveAttribute('aria-busy');
        await page.clock.runFor(800);
        await expect(bars).toHaveCount(0);
      });

      test('Skeleton mounts children only after loading finishes', async ({ page }) => {
        await visitLoadingPage(page, 'skeleton', english, appearance);
        const content = preview(page, english, '展示加载结果', 'Show loaded content');
        const placeholder = content.getByRole('status', {
          name: english ? 'Loading' : '处理中',
          exact: true,
        });
        const loaded = content.getByText(
          english ? 'Project content is ready.' : '项目内容已加载完成。',
          { exact: true },
        );
        await expect(placeholder).toBeVisible();
        await expect(loaded).toHaveCount(0);
        await content
          .getByRole('button', { name: english ? 'Show content' : '显示内容', exact: true })
          .click();
        await expect(placeholder).toHaveCount(0);
        await expect(loaded).toBeVisible();
        await content
          .getByRole('button', { name: english ? 'Show placeholder' : '显示占位', exact: true })
          .click();
        await expect(placeholder).toBeVisible();
        await expect(loaded).toHaveCount(0);
      });
    });
  }
}
