import { expect, type Page, test } from '@playwright/test';

async function visitFeedbackPage(
  page: Page,
  component: 'alert' | 'result' | 'empty',
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

for (const english of [false, true]) {
  for (const { width, appearance } of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test.describe(`Feedback examples: ${english ? 'en' : 'zh'} ${width} ${appearance}`, () => {
      test.use({ viewport: { width, height: 900 }, colorScheme: appearance });

      test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      });

      test('Alert can be dismissed and restored', async ({ page }) => {
        await visitFeedbackPage(page, 'alert', english, appearance);
        const preview = page
          .getByRole('region', {
            name: english ? 'Dismissible alerts example' : '可关闭提示示例',
            exact: true,
          })
          .locator('.leaf-component-example__preview');
        const alert = preview.getByRole('status');
        const title = english ? 'Your draft is saved' : '草稿已自动保存';
        await expect(alert).toHaveText(title);
        await alert.getByRole('button', { name: english ? 'Close' : '关闭', exact: true }).click();
        await expect(preview.locator('.leaf-alert')).toHaveCount(0);
        await preview
          .getByRole('button', { name: english ? 'Show again' : '重新显示', exact: true })
          .click();
        await expect(alert).toHaveText(title);
        await expect(
          alert.getByRole('button', { name: english ? 'Close' : '关闭', exact: true }),
        ).toBeVisible();
      });

      test('Result actions, states, sizes and custom content are live', async ({ page }) => {
        await visitFeedbackPage(page, 'result', english, appearance);
        const basic = page
          .getByRole('region', {
            name: english ? 'Basic usage example' : '基础用法示例',
            exact: true,
          })
          .locator('.leaf-component-example__preview');
        await expect(basic.locator('.leaf-result__title')).toHaveText(
          english ? 'Project created' : '项目已创建',
        );
        await expect(basic.getByRole('status')).toHaveCount(0);
        await basic
          .getByRole('button', { name: english ? 'Back to list' : '返回列表', exact: true })
          .click();
        await expect(basic.getByRole('status')).toHaveText(
          english ? 'Returned to project list' : '已返回项目列表',
        );
        await basic
          .getByRole('button', { name: english ? 'Open project' : '进入项目', exact: true })
          .click();
        await expect(basic.getByRole('status')).toHaveText(
          english ? 'Project opened' : '已打开项目',
        );

        const states = page
          .getByRole('region', {
            name: english ? 'Result states example' : '结果状态示例',
            exact: true,
          })
          .locator('.leaf-component-example__preview');
        await expect(states.locator('.leaf-result')).toHaveCount(4);
        for (const [status, title] of [
          ['empty', english ? 'No projects yet' : '还没有项目'],
          ['warning', english ? 'Storage is almost full' : '存储空间即将用完'],
          ['danger', english ? 'Publishing failed' : '发布未完成'],
          ['info', english ? 'Review in progress' : '审核正在进行'],
        ] as const) {
          await expect(states.locator(`.leaf-result--${status} .leaf-result__title`)).toHaveText(
            title,
          );
        }
        const empty = states.locator('.leaf-result--empty');
        const danger = states.locator('.leaf-result--danger');
        const emptyFeedback = empty.locator('..').getByRole('status');
        const dangerFeedback = danger.locator('..').getByRole('status');
        await expect(states.getByRole('status')).toHaveCount(0);
        await empty
          .getByRole('button', { name: english ? 'Create project' : '创建项目', exact: true })
          .click();
        await expect(emptyFeedback).toHaveText(english ? 'Project created' : '项目已创建');
        await expect(dangerFeedback).toHaveCount(0);
        await danger.getByRole('button', { name: english ? 'Retry' : '重试', exact: true }).click();
        await expect(dangerFeedback).toHaveText(english ? 'Retry completed' : '重试已完成');
        await expect(emptyFeedback).toHaveText(english ? 'Project created' : '项目已创建');
        await expect(states.getByRole('status')).toHaveCount(2);

        const sizes = page
          .getByRole('region', { name: english ? 'Sizes example' : '尺寸示例', exact: true })
          .locator('.leaf-component-example__preview');
        await expect(sizes.locator('.leaf-result--sm')).toBeVisible();
        await expect(sizes.locator('.leaf-result--md')).toBeVisible();
        await expect(sizes.locator('.leaf-result__title')).toHaveText(
          Array(2).fill(english ? 'Project created' : '项目已创建'),
        );
        await expect(sizes.locator('.leaf-result__description')).toHaveText(
          Array(2).fill(english ? 'You can now add project content.' : '现在可以添加项目内容。'),
        );

        const custom = page
          .getByRole('region', {
            name: english ? 'Custom content example' : '自定义内容示例',
            exact: true,
          })
          .locator('.leaf-component-example__preview');
        await expect(custom.locator('.leaf-result__title')).toHaveText(
          english ? 'File archived' : '文件已归档',
        );
        await expect(custom.locator('.leaf-result__description')).toHaveText(
          english ? 'Find the archived file in the file list.' : '归档内容可在文件列表中查看。',
        );
        await expect(custom.locator('.leaf-result__icon .lucide-archive')).toHaveCount(1);
        await expect(custom.locator('.leaf-result__icon .lucide-check')).toHaveCount(0);
        await expect(custom.locator('.leaf-result__content')).toHaveText(
          english ? 'Archived file: quarterly-report.pdf' : '归档文件：季度报告.pdf',
        );
      });

      test('Empty compatibility example links to Result and its migration API', async ({
        page,
      }) => {
        await visitFeedbackPage(page, 'empty', english, appearance);
        const preview = page
          .getByRole('region', {
            name: english ? 'Compatibility usage example' : '兼容用法示例',
            exact: true,
          })
          .locator('.leaf-component-example__preview');
        await expect(preview.locator('.leaf-empty.leaf-result--empty')).toHaveCount(1);
        await expect(preview.locator('.leaf-result__title')).toHaveText(
          english ? 'No projects yet' : '暂无项目',
        );
        const main = page.getByRole('main');
        await main
          .getByRole('link', { name: english ? 'Result' : 'Result 结果', exact: true })
          .click();
        const resultPath = `${english ? '/en' : ''}/components/result`;
        await expect(page).toHaveURL(new RegExp(`^https?://[^/]+${resultPath}(?:\\.html)?$`));
        await expect(
          page.getByRole('heading', {
            level: 1,
            name: english ? 'Result' : 'Result 结果',
            exact: true,
          }),
        ).toBeVisible();

        await page.goBack();
        await expect(preview).toBeVisible();
        await main.getByRole('link', { name: 'Empty API', exact: true }).click();
        await expect(page).toHaveURL(
          new RegExp(`^https?://[^/]+${resultPath}(?:\\.html)?#empty-api$`),
        );
        await expect(page.locator('#empty-api')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Empty API', exact: true })).toBeVisible();
      });
    });
  }
}
