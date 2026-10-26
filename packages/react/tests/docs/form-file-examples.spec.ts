import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

const profiles = [
  { width: 1280, appearance: 'light' },
  { width: 375, appearance: 'dark' },
] as const;

async function expectPreviewLayout(page: Page) {
  const previews = await page
    .locator('.leaf-component-example__preview-content')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const preview = node.closest('.leaf-component-example__preview');
        if (!preview) throw new Error('Missing form or file preview');
        const inner = node.getBoundingClientRect();
        const outer = preview.getBoundingClientRect();
        return {
          centered: Math.abs(inner.left + inner.width / 2 - (outer.left + outer.width / 2)) < 1,
          contained: inner.left >= outer.left - 1 && inner.right <= outer.right + 1,
          overflow: node.scrollWidth - node.clientWidth,
        };
      }),
    );
  for (const preview of previews) {
    expect(preview.centered).toBe(true);
    expect(preview.contained).toBe(true);
    expect(preview.overflow).toBeLessThanOrEqual(1);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}

async function expectContentFits(scope: Locator, selector: string) {
  const bounds = await scope.evaluate((node, query) => {
    const outer = node.getBoundingClientRect();
    return [...node.querySelectorAll<HTMLElement>(query)]
      .filter((child) => {
        const style = getComputedStyle(child);
        return child.getClientRects().length && style.visibility !== 'hidden';
      })
      .map((child) => {
        const box = child.getBoundingClientRect();
        const ellipsis = getComputedStyle(child).textOverflow === 'ellipsis';
        return {
          contained:
            box.left >= outer.left - 1 &&
            box.right <= outer.right + 1 &&
            box.top >= outer.top - 1 &&
            box.bottom <= outer.bottom + 1,
          overflow: ellipsis ? 0 : child.scrollWidth - child.clientWidth,
        };
      });
  }, selector);
  expect(bounds.length).toBeGreaterThan(0);
  for (const child of bounds) {
    expect(child.contained).toBe(true);
    expect(child.overflow).toBeLessThanOrEqual(1);
  }
}

async function expectFormFields(page: Page, width: number) {
  const fields = await page
    .locator('.leaf-component-example__preview .leaf-form-field')
    .evaluateAll((nodes) =>
      nodes.flatMap((node) => {
        const label = node.querySelector<HTMLLabelElement>('.leaf-form-field__label');
        if (!label) return [];
        const body = node.querySelector('.leaf-form-field__body');
        const control = body?.querySelector<HTMLElement>('input:not([type="hidden"]), textarea');
        if (!body || !control) throw new Error('Missing associated form control');
        const name = label.getBoundingClientRect();
        const field = body.getBoundingClientRect();
        return [
          {
            associated: Boolean(control.id) && label.htmlFor === control.id,
            vertical: node.classList.contains('leaf-form-field--vertical'),
            stacked: name.bottom <= field.top + 1,
            beside: name.right <= field.left + 1,
          },
        ];
      }),
    );
  expect(fields.length).toBeGreaterThan(0);
  for (const field of fields) {
    expect(field.associated).toBe(true);
    expect(width === 375 || field.vertical ? field.stacked : field.beside).toBe(true);
  }
}

async function openExamples(
  page: Page,
  component: 'form' | 'upload' | 'file-list',
  english: boolean,
  { width, appearance }: (typeof profiles)[number],
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: appearance });
  await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
  await page.goto(`${english ? '/en' : ''}/components/${component}.html`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
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
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.locator('.leaf-component-example__preview')).toHaveCount(
    component === 'upload' ? 7 : 6,
  );
  await expectPreviewLayout(page);
  return {
    errors,
    preview: (zh: string, en: string) =>
      page
        .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
        .locator('.leaf-component-example__preview'),
  };
}

const file = (name: string, size = 4, mimeType = 'text/plain') => ({
  name,
  mimeType,
  buffer: Buffer.alloc(size, 'L'),
});

const fileRow = (preview: Locator, name: string) =>
  preview.locator('.leaf-file-list__item').filter({ hasText: name });

const fileContent =
  '.leaf-file-list__name, .leaf-file-list__meta, .leaf-file-list__error, .leaf-file-list__actions button, .leaf-file-list__actions a, .leaf-upload__errors, .leaf-upload__hint';

for (const english of [false, true]) {
  for (const profile of profiles) {
    const suffix = `${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`;

    test(`Form data and validation examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'form', english, profile);
      await expectFormFields(page, profile.width);
      const basic = preview('基础用法', 'Basic usage');
      const name = basic.getByRole('textbox', { name: english ? 'Name' : '姓名', exact: true });
      const email = basic.getByRole('textbox', {
        name: english ? 'Work email' : '工作邮箱',
        exact: true,
      });
      await basic.getByRole('button', { name: english ? 'Submit' : '提交', exact: true }).click();
      await expect(name).toBeFocused();
      await expect(basic.getByRole('status')).toHaveCount(0);
      await name.fill('Alice');
      await email.fill('alice@example.com');
      const team = basic.getByRole('combobox', {
        name: english ? 'Team' : '所属团队',
        exact: true,
      });
      await team.press('ArrowDown');
      await team.press('Enter');
      await expect(team).toHaveValue(english ? 'Design team' : '设计团队');
      await basic.getByRole('button', { name: english ? 'Submit' : '提交', exact: true }).click();
      await expect(basic.getByRole('status')).toHaveText(
        `${english ? 'Submitted: ' : '已提交：'}Alice · alice@example.com · design`,
      );
      expect(
        await basic
          .locator('form')
          .evaluate((node) => Object.fromEntries(new FormData(node as HTMLFormElement))),
      ).toEqual({ name: 'Alice', email: 'alice@example.com', team: 'design' });
      await expectContentFits(
        basic,
        '.leaf-form-field__label, .leaf-form-field__description, .leaf-text, button',
      );
      await basic.screenshot({ path: testInfo.outputPath('form-submitted-data.png') });
      await basic.getByRole('button', { name: english ? 'Reset' : '重置', exact: true }).click();
      await expect(name).toHaveValue('');
      await expect(email).toHaveValue('');
      await expect(team).toHaveValue('');
      await expect(basic.getByRole('status')).toHaveCount(0);

      const dynamic = preview('动态表单列表', 'Dynamic form lists');
      const contacts = dynamic.getByRole('textbox');
      await expect(contacts).toHaveCount(1);
      await contacts.first().fill('alice@example.com');
      const firstId = await contacts.first().getAttribute('id');
      await dynamic
        .getByRole('button', { name: english ? 'Add contact' : '添加联系人', exact: true })
        .click();
      await expect(contacts).toHaveCount(2);
      await contacts.nth(1).fill('bob@example.com');
      const secondId = await contacts.nth(1).getAttribute('id');
      await expect(
        dynamic.getByRole('button', { name: english ? 'Move up' : '上移', exact: true }).first(),
      ).toBeDisabled();
      await dynamic
        .getByRole('button', { name: english ? 'Move up' : '上移', exact: true })
        .nth(1)
        .click();
      await expect(contacts.nth(0)).toHaveValue('bob@example.com');
      await expect(contacts.nth(1)).toHaveValue('alice@example.com');
      await expect(contacts.nth(0)).toHaveAttribute('id', secondId ?? '');
      await expect(contacts.nth(1)).toHaveAttribute('id', firstId ?? '');
      await expect(contacts.nth(0)).toHaveAttribute('name', 'contacts.0');
      await expect(contacts.nth(1)).toHaveAttribute('name', 'contacts.1');
      await settleAnimations(dynamic);
      await expectContentFits(dynamic, '.leaf-form-field__label, input, button');
      await dynamic.screenshot({ path: testInfo.outputPath('form-reordered-contacts.png') });
      await dynamic
        .getByRole('button', { name: english ? 'Remove' : '移除', exact: true })
        .first()
        .click();
      await expect(contacts).toHaveCount(1);
      await expect(contacts.first()).toHaveValue('alice@example.com');
      await dynamic.getByRole('button', { name: english ? 'Reset' : '重置', exact: true }).click();
      await expect(contacts).toHaveCount(1);
      await expect(contacts.first()).toHaveValue('');

      const summary = preview('错误汇总', 'Error summary');
      await summary
        .getByRole('button', { name: english ? 'Validate' : '检查表单', exact: true })
        .click();
      const errorList = summary.locator('.leaf-form-error-summary');
      await expect(errorList.getByRole('button')).toHaveCount(2);
      await errorList.getByRole('button').nth(1).click();
      await expect(
        summary.getByRole('textbox', { name: english ? 'Email' : '邮箱', exact: true }),
      ).toBeFocused();
      await expectContentFits(
        summary,
        '.leaf-form-error-summary, .leaf-form-error-summary button, .leaf-form-field__description',
      );
      await summary.screenshot({ path: testInfo.outputPath('form-error-summary.png') });
      await summary.getByRole('button', { name: english ? 'Reset' : '重置', exact: true }).click();
      await expect(errorList).toHaveCount(0);
      await expect(summary.getByRole('alert')).toHaveCount(0);

      const custom = preview('业务校验', 'Custom validation');
      const customName = custom.getByRole('textbox', {
        name: english ? 'Name' : '姓名',
        exact: true,
      });
      await custom.getByRole('button', { name: english ? 'Save' : '保存', exact: true }).click();
      await expect(custom.getByRole('alert')).toHaveText(english ? 'Enter a name' : '请输入姓名');
      await expect(customName).toBeFocused();
      await customName.fill('Alice');
      await expect(custom.getByRole('alert')).toHaveCount(0);
      await custom.getByRole('button', { name: english ? 'Save' : '保存', exact: true }).click();
      await expect(custom.getByRole('status')).toHaveText(
        english ? 'Saved: Alice' : '已保存：Alice',
      );
      await custom.getByRole('button', { name: english ? 'Reset' : '重置', exact: true }).click();
      await expect(customName).toHaveValue('');
      await expect(custom.getByRole('status')).toHaveCount(0);
      await expect(custom.getByRole('alert')).toHaveCount(0);
      await expectFormFields(page, profile.width);
      await expectPreviewLayout(page);
      expect(errors).toEqual([]);
    });

    test(`Upload selection and request examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'upload', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      await basic.locator('input[type="file"]').setInputFiles(file('notes.txt'));
      await expect(fileRow(basic, 'notes.txt')).toHaveAttribute('data-status', 'ready');
      await expect(basic.getByRole('progressbar')).toHaveCount(0);
      await expect(basic.getByRole('button', { name: /^(Retry upload|重新上传)/ })).toHaveCount(0);

      const limits = preview('文件限制', 'File restrictions');
      await limits
        .locator('input[type="file"]')
        .setInputFiles([
          file('accepted.txt'),
          file('blocked.exe', 4, 'application/octet-stream'),
          file('oversized.txt', 5 * 1024 * 1024 + 1),
        ]);
      await expect(limits.locator('.leaf-file-list__item')).toHaveCount(1);
      await expect(fileRow(limits, 'accepted.txt')).toHaveAttribute('data-status', 'ready');
      const rejections = limits.getByRole('alert');
      await expect(rejections.locator('li')).toHaveCount(2);
      await expect(rejections).toContainText('blocked.exe');
      await expect(rejections).toContainText('oversized.txt');
      await expectContentFits(limits, fileContent);
      await limits.screenshot({ path: testInfo.outputPath('upload-rejected-files.png') });
      await limits
        .locator('input[type="file"]')
        .setInputFiles(
          ['one.txt', 'two.txt', 'three.txt', 'four.txt', 'overflow.txt'].map((name) => file(name)),
        );
      await expect(limits.locator('.leaf-file-list__item')).toHaveCount(5);
      await expect(rejections.locator('li')).toHaveCount(1);
      await expect(rejections).toContainText('overflow.txt');
      await expect(fileRow(limits, 'overflow.txt')).toHaveCount(0);

      await page.clock.install({ time: new Date('2026-10-26T13:00:00Z') });
      await page.clock.pauseAt(new Date('2026-10-26T13:00:01Z'));
      const drag = preview('拖拽、进度与取消', 'Drag, progress and cancellation');
      await drag.locator('input[type="file"]').setInputFiles(file('progress.txt'));
      const progress = fileRow(drag, 'progress.txt');
      await expect(progress).toHaveAttribute('data-status', 'uploading');
      await page.clock.runFor(300);
      await expect(progress.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10');
      await expectContentFits(drag, fileContent);
      await drag.screenshot({ path: testInfo.outputPath('upload-progress.png') });
      await progress
        .getByRole('button', {
          name: english ? 'Cancel upload progress.txt' : '取消上传 progress.txt',
          exact: true,
        })
        .click();
      await expect(progress).toHaveAttribute('data-status', 'cancelled');
      await expect(progress.getByRole('progressbar')).toHaveCount(0);
      await page.clock.runFor(3000);
      await expect(progress).toHaveAttribute('data-status', 'cancelled');
      await drag.screenshot({ path: testInfo.outputPath('upload-cancelled.png') });
      await progress
        .getByRole('button', {
          name: english ? 'Retry upload progress.txt' : '重新上传 progress.txt',
          exact: true,
        })
        .click();
      await expect(progress).toHaveAttribute('data-status', 'uploading');
      await page.clock.runFor(300);
      await expect(progress.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10');
      await page.clock.runFor(2700);
      await expect(progress).toHaveAttribute('data-status', 'done');
      await expect(progress.getByRole('progressbar')).toHaveCount(0);

      const manual = preview('手动上传', 'Manual upload');
      await manual.locator('input[type="file"]').setInputFiles(file('manual.txt'));
      const queued = fileRow(manual, 'manual.txt');
      await expect(queued).toHaveAttribute('data-status', 'ready');
      await page.clock.runFor(1500);
      await expect(queued).toHaveAttribute('data-status', 'ready');
      await manual
        .getByRole('button', { name: english ? 'Start upload' : '开始上传', exact: true })
        .click();
      await expect(queued).toHaveAttribute('data-status', 'uploading');
      await page.clock.runFor(500);
      await manual
        .getByRole('button', { name: english ? 'Cancel uploads' : '取消上传', exact: true })
        .click();
      await expect(queued).toHaveAttribute('data-status', 'cancelled');
      await page.clock.runFor(1500);
      await expect(queued).toHaveAttribute('data-status', 'cancelled');
      await expectContentFits(manual, `${fileContent}, .leaf-flex > button`);
      await manual.screenshot({ path: testInfo.outputPath('upload-manual-cancelled.png') });
      await manual
        .getByRole('button', { name: english ? 'Start upload' : '开始上传', exact: true })
        .click();
      await expect(queued).toHaveAttribute('data-status', 'uploading');
      await page.clock.runFor(1500);
      await expect(queued).toHaveAttribute('data-status', 'done');
      await page.clock.resume();
      await expectPreviewLayout(page);
      expect(errors).toEqual([]);
    });

    test(`FileList metadata and gallery examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'file-list', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      await expect(basic.locator('.leaf-file-list__item')).toHaveCount(3);
      await expect(fileRow(basic, 'empty.txt').locator('.leaf-file-list__size')).toHaveText('0 B');
      await expect(basic.getByRole('button')).toHaveCount(0);
      await expect(basic.getByRole('link')).toHaveCount(0);
      await expectContentFits(basic, fileContent);

      const thumbnails = preview('缩略图列表', 'Thumbnail list');
      const cards = preview('图片卡片', 'Picture cards');
      for (const media of [thumbnails, cards]) {
        await expect(media.locator('.leaf-file-list__item')).toHaveCount(3);
        const images = media.locator('.leaf-file-list__icon img');
        await expect(images).toHaveCount(2);
        await expect
          .poll(() =>
            images.evaluateAll((nodes) =>
              nodes.every((node) => {
                const image = node as HTMLImageElement;
                return image.complete && image.naturalWidth > 0;
              }),
            ),
          )
          .toBe(true);
        await expect(media.getByRole('button', { name: /^(Preview|预览) / })).toHaveCount(2);
        await expect(media.getByRole('link', { name: /^(Download|下载) / })).toHaveCount(3);
        await expectContentFits(media, fileContent);
      }
      const opener = cards.getByRole('button', {
        name: english ? 'Preview Lakeside.svg' : '预览 湖畔.svg',
        exact: true,
      });
      await opener.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(page.locator('.yarl__portal')).toHaveCSS('opacity', '1');
      await expect(dialog.locator('.leaf-image-viewer__count')).toHaveText('1 / 2');
      await dialog
        .getByRole('button', { name: english ? 'Next image' : '下一张', exact: true })
        .click();
      await expect(dialog.locator('.leaf-image-viewer__count')).toHaveText('2 / 2');
      await settleAnimations(dialog);
      await expectContentFits(
        dialog,
        '.leaf-image-viewer__header, .leaf-image-viewer__header button, .leaf-image-viewer__count, .leaf-image-viewer__tools, .leaf-image-viewer__tools button',
      );
      await page.screenshot({ path: testInfo.outputPath('file-list-image-gallery.png') });
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(opener).toBeFocused();
      await expectPreviewLayout(page);
      expect(errors).toEqual([]);
    });

    test(`FileList status and removal examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openExamples(page, 'file-list', english, profile);
      const states = preview('上传状态', 'Upload status');
      await expect(states.locator('.leaf-file-list__item')).toHaveCount(5);
      await expect(states.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
      await expect(states.getByRole('button')).toHaveCount(0);
      await expectContentFits(states, fileContent);
      await expect(preview('空列表', 'Empty list').locator('.leaf-file-list__empty')).toContainText(
        english ? 'No files' : '暂无文件',
      );

      await page.clock.install({ time: new Date('2026-10-26T14:00:00Z') });
      await page.clock.pauseAt(new Date('2026-10-26T14:00:01Z'));
      const removal = preview('移除文件', 'Remove files');
      const planName = english ? 'Project plan.pdf' : '项目方案.pdf';
      const target = fileRow(removal, planName);
      const remove = target.getByRole('button', {
        name: `${english ? 'Remove' : '移除'} ${planName}`,
        exact: true,
      });
      await remove.click();
      await expect(remove).toBeDisabled();
      await expect(remove).toHaveAttribute('aria-busy', 'true');
      await expect(target).toHaveAttribute('aria-busy', 'true');
      await expect(removal.locator('.leaf-file-list__item')).toHaveCount(2);
      const button = await remove.boundingBox();
      if (!button) throw new Error('Missing pending removal pointer target');
      await page.mouse.click(button.x + button.width / 2, button.y + button.height / 2);
      await expect(removal.locator('.leaf-file-list__item')).toHaveCount(2);
      await expectContentFits(removal, fileContent);
      await removal.screenshot({ path: testInfo.outputPath('file-list-removal-pending.png') });
      await page.clock.runFor(499);
      await expect(removal.locator('.leaf-file-list__item')).toHaveCount(2);
      await page.clock.runFor(1);
      await expect(target).toHaveCount(0);
      await expect(removal.locator('.leaf-file-list__item')).toHaveCount(1);
      const remaining = removal.locator('.leaf-file-list__item');
      await expect(remaining).toContainText(english ? 'Project notes.md' : '项目笔记.md');
      await page.clock.runFor(300);
      await remaining.getByRole('button', { name: /^(Remove|移除) / }).click();
      await page.clock.runFor(500);
      await expect(removal.locator('.leaf-file-list__item')).toHaveCount(0);
      await expect(removal.locator('.leaf-file-list__empty')).toContainText(
        english ? 'No files' : '暂无文件',
      );
      await page.clock.resume();
      await removal.screenshot({ path: testInfo.outputPath('file-list-removed-all.png') });
      await expectPreviewLayout(page);
      expect(errors).toEqual([]);
    });
  }
}
