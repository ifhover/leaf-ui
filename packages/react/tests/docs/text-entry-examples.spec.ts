import { expect, type Locator, type Page, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

const profiles = [
  { width: 1280, appearance: 'light' },
  { width: 375, appearance: 'dark' },
] as const;

async function expectPreviewLayout(page: Page) {
  const geometry = await page
    .locator('.leaf-component-example__preview-content')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const preview = node.closest('.leaf-component-example__preview');
        if (!preview) throw new Error('Missing text entry preview');
        const box = node.getBoundingClientRect();
        const outer = preview.getBoundingClientRect();
        return {
          centered: Math.abs(box.left + box.width / 2 - (outer.left + outer.width / 2)) < 1,
          contained: box.left >= outer.left - 1 && box.right <= outer.right + 1,
          overflow: node.scrollWidth - node.clientWidth,
        };
      }),
    );
  for (const box of geometry) {
    expect(box.centered).toBe(true);
    expect(box.contained).toBe(true);
    expect(box.overflow).toBeLessThanOrEqual(1);
  }
  const fields = await page
    .locator('.leaf-component-example__preview .leaf-form-field')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const label = node.querySelector<HTMLLabelElement>('.leaf-form-field__label');
        const body = node.querySelector('.leaf-form-field__body');
        const input = body?.querySelector('input');
        if (!label || !body || !input) throw new Error('Missing labeled text entry field');
        const labelBox = label.getBoundingClientRect();
        const bodyBox = body.getBoundingClientRect();
        return {
          associated: Boolean(input.id) && label.htmlFor === input.id,
          stacked: labelBox.bottom <= bodyBox.top + 1,
          aligned: Math.abs(labelBox.left - bodyBox.left) < 1,
        };
      }),
    );
  expect(fields.length).toBeGreaterThan(0);
  for (const field of fields) {
    expect(field.associated).toBe(true);
    expect(field.stacked).toBe(true);
    expect(field.aligned).toBe(true);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
}

async function openTextEntryPage(
  page: Page,
  component: 'input-mask' | 'input-otp' | 'auto-complete',
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
    { 'input-mask': 4, 'input-otp': 5, 'auto-complete': 5 }[component],
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

async function pasteCode(input: Locator, text: string) {
  await input.focus();
  await input.press('ControlOrMeta+A');
  // Exercise the component's paste handler without sharing the system clipboard.
  await input.evaluate((node, value) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', value);
    node.dispatchEvent(
      new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData }),
    );
  }, text);
}

async function suggestionPopup(page: Page, input: Locator) {
  const id = await input.getAttribute('aria-controls');
  expect(id).toBeTruthy();
  const list = page.locator(`[id="${id}"]`);
  const panel = page.locator('.leaf-autocomplete__panel[data-state="open"]').filter({ has: list });
  await expect(panel).toHaveCount(1);
  await expect(panel).toBeVisible();
  await expect(list).toHaveAttribute('role', 'listbox');
  return { panel, list };
}

async function expectPopupBounds(panel: Locator) {
  await expect(panel).toHaveAttribute('data-positioned', 'true');
  await settleAnimations(panel);
  const geometry = await panel.evaluate((node) => {
    const viewport = node.querySelector('.leaf-floating__viewport');
    if (!viewport) throw new Error('Missing suggestion popup viewport');
    const bounds = node.getBoundingClientRect();
    const inner = viewport.getBoundingClientRect();
    const content = [
      ...node.querySelectorAll<HTMLElement>(
        '.leaf-floating__option-label, .leaf-select__group, .leaf-floating__empty, .leaf-floating__empty button, .leaf-floating__empty .leaf-text',
      ),
    ];
    return {
      inViewport:
        bounds.left >= -1 &&
        bounds.right <= innerWidth + 1 &&
        bounds.top >= -1 &&
        bounds.bottom <= innerHeight + 1,
      overflow: viewport.scrollWidth - viewport.clientWidth,
      contentCount: content.length,
      contentFits: content.every((child) => {
        const box = child.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(child);
        const text = range.getBoundingClientRect();
        return (
          box.left >= inner.left - 1 &&
          box.right <= inner.right + 1 &&
          box.top >= inner.top - 1 &&
          box.bottom <= inner.bottom + 1 &&
          text.left >= box.left - 1 &&
          text.right <= box.right + 1 &&
          (child.clientWidth === 0 || child.scrollWidth <= child.clientWidth + 1)
        );
      }),
    };
  });
  expect(geometry.inViewport).toBe(true);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  expect(geometry.contentCount).toBeGreaterThan(0);
  expect(geometry.contentFits).toBe(true);
}

for (const english of [false, true]) {
  for (const profile of profiles) {
    const suffix = `${english ? 'en' : 'zh'} ${profile.width} ${profile.appearance}`;

    test(`InputMask examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openTextEntryPage(page, 'input-mask', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const phone = basic.getByRole('textbox', {
        name: english ? 'Phone number' : '电话号码',
        exact: true,
      });
      await phone.pressSequentially('x13800000000');
      await expect(phone).toHaveValue('138 0000 0000');

      const controlled = preview('未格式化值', 'Unmasked value');
      const contact = controlled.getByRole('textbox', {
        name: english ? 'Contact number' : '联系号码',
        exact: true,
      });
      const feedback = controlled.getByRole('status');
      const values = (raw: string, formatted: string) =>
        english
          ? [`Value: ${raw || 'Empty'}`, `Display: ${formatted || 'Empty'}`]
          : [`组件值：${raw || '空'}`, `显示值：${formatted || '空'}`];
      await expect(feedback.locator('.leaf-text')).toHaveText(values('', ''));
      await contact.pressSequentially('13912345678');
      await expect(contact).toHaveValue('139 1234 5678');
      await expect(feedback.locator('.leaf-text')).toHaveText(
        values('13912345678', '139 1234 5678'),
      );
      await controlled.screenshot({ path: testInfo.outputPath('input-mask-unmasked-value.png') });
      await contact.hover();
      await controlled
        .getByRole('button', { name: english ? 'Clear input' : '清除输入', exact: true })
        .click();
      await expect(contact).toHaveValue('');
      await expect(contact).toBeFocused();
      await expect(feedback.locator('.leaf-text')).toHaveText(values('', ''));
      await expect(controlled.getByRole('button')).toHaveCount(0);

      const persistent = preview('固定占位', 'Persistent placeholders');
      const card = persistent.getByRole('textbox', {
        name: english ? 'Card number' : '卡号',
        exact: true,
      });
      await expect(card).toHaveValue('____ ____ ____ ____');
      await card.press('Home');
      await card.pressSequentially('1234');
      await expect(card).toHaveValue('1234 ____ ____ ____');
      await persistent.screenshot({
        path: testInfo.outputPath('input-mask-persistent-placeholder.png'),
      });

      const custom = preview('自定义规则', 'Custom rules').getByRole('textbox', {
        name: english ? 'Identifier' : '编号',
        exact: true,
      });
      await custom.pressSequentially('aAB1234');
      await expect(custom).toHaveValue('AB-1234');
      await expectPreviewLayout(page);
      expect(errors).toEqual([]);
    });

    test(`InputOTP examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openTextEntryPage(page, 'input-otp', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const code = basic.getByRole('textbox', {
        name: english ? 'Verification code' : '验证码',
        exact: true,
      });
      const completion = basic.getByRole('status');
      await expect(code).toHaveAttribute('autocomplete', 'one-time-code');
      await expect(code).toHaveAttribute('inputmode', 'numeric');
      await expect(completion).toHaveText(english ? 'Incomplete' : '尚未填满');
      await pasteCode(code, 'a1-2 3b4/5c6d7');
      await expect(code).toHaveValue('123456');
      await expect(completion).toHaveText(english ? 'Code complete' : '输入已完成');
      await expect(basic.locator('[data-otp-slot]')).toHaveText(['1', '2', '3', '4', '5', '6']);
      await basic.screenshot({ path: testInfo.outputPath('input-otp-complete.png') });
      await code.press('End');
      await code.press('Backspace');
      await expect(code).toHaveValue('12345');
      await expect(completion).toHaveText(english ? 'Incomplete' : '尚未填满');
      await expect(basic.locator('[data-otp-slot]').last()).toHaveText('');
      await pasteCode(code, '987654');
      await expect(code).toHaveValue('987654');
      await expect(completion).toHaveText(english ? 'Code complete' : '输入已完成');

      const alphanumeric = preview('字母与数字', 'Letters and digits').getByRole('textbox', {
        name: english ? 'Alphanumeric code' : '字母数字验证码',
        exact: true,
      });
      await expect(alphanumeric).toHaveAttribute('inputmode', 'text');
      await pasteCode(alphanumeric, 'aB-12_cD34');
      await expect(alphanumeric).toHaveValue('aB12cD');

      const separator = preview('分隔符', 'Separator');
      await pasteCode(
        separator.getByRole('textbox', {
          name: english ? 'Grouped code' : '分组验证码',
          exact: true,
        }),
        '12-34-56',
      );
      await expect(separator.locator('[data-otp-slot]')).toHaveText(['1', '2', '3', '4', '5', '6']);
      await expect(
        separator.locator('.leaf-input-otp__item').nth(2).locator('.leaf-text'),
      ).toHaveText('-');
      await expect(separator.locator('.leaf-input-otp__slots .leaf-text')).toHaveCount(1);

      const masked = preview('隐藏字符', 'Masked characters');
      const secret = masked.getByRole('textbox', {
        name: english ? 'Masked code' : '隐藏验证码',
        exact: true,
      });
      await pasteCode(secret, '314159');
      await expect(secret).toHaveValue('314159');
      await expect(secret).toHaveAttribute('type', 'text');
      await expect(masked.locator('[data-otp-slot]')).toHaveText(Array(6).fill('\u2022'));
      await masked.screenshot({ path: testInfo.outputPath('input-otp-masked.png') });

      const disabled = preview('禁用状态', 'Disabled').getByRole('textbox', {
        name: english ? 'Disabled code' : '禁用验证码',
        exact: true,
      });
      await expect(disabled).toBeDisabled();
      await expect(disabled).toHaveValue('123456');
      await disabled.scrollIntoViewIfNeeded();
      const box = await disabled.boundingBox();
      if (!box) throw new Error('Missing disabled OTP pointer target');
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(disabled).not.toBeFocused();
      await expect(disabled).toHaveValue('123456');
      await expectPreviewLayout(page);
      expect(errors).toEqual([]);
    });

    test(`AutoComplete examples: ${suffix}`, async ({ page }, testInfo) => {
      const { preview, errors } = await openTextEntryPage(page, 'auto-complete', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const project = basic.getByRole('combobox', {
        name: english ? 'Project name' : '项目名称',
        exact: true,
      });
      const feedback = basic.getByRole('status').locator('.leaf-text');
      const textAndSelection = (text: string, selection: string) =>
        english
          ? [`Input: ${text || 'Empty'}`, `Last selection: ${selection || 'None'}`]
          : [`输入：${text || '空'}`, `最近选中：${selection || '无'}`];
      await project.fill('Custom project');
      await expect(project).toHaveValue('Custom project');
      await expect(feedback).toHaveText(textAndSelection('Custom project', ''));
      await project.fill('lEaF');
      const filteredPopup = await suggestionPopup(page, project);
      await expect(filteredPopup.list.getByRole('option')).toHaveText([
        'Leaf Garden',
        'Leaf Studio',
      ]);
      await expect(feedback).toHaveText(textAndSelection('lEaF', ''));
      await project.fill('');
      const basicPopup = await suggestionPopup(page, project);
      await expect(basicPopup.list.getByRole('option')).toHaveCount(4);
      const archived = basicPopup.list.getByRole('option', {
        name: 'Archived Garden',
        exact: true,
      });
      await expect(archived).toBeDisabled();
      await expect(archived).toHaveAttribute('aria-disabled', 'true');
      await project.press('ArrowUp');
      await expect(
        basicPopup.list.getByRole('option', { name: 'Pine Forest', exact: true }),
      ).toHaveAttribute('aria-selected', 'true');
      await project.press('ArrowDown');
      const garden = basicPopup.list.getByRole('option', { name: 'Leaf Garden', exact: true });
      await expect(garden).toHaveAttribute('aria-selected', 'true');
      await expect(archived).toHaveAttribute('aria-selected', 'false');
      await expectPopupBounds(basicPopup.panel);
      await page.screenshot({ path: testInfo.outputPath('autocomplete-keyboard-suggestions.png') });
      await project.press('Enter');
      await expect(project).toHaveValue('Leaf Garden');
      await expect(project).toHaveAttribute('aria-expanded', 'false');
      await expect(feedback).toHaveText(textAndSelection('Leaf Garden', 'Leaf Garden'));
      await project.fill('Another project');
      await expect(feedback).toHaveText(textAndSelection('Another project', 'Leaf Garden'));
      await project.press('Escape');

      const dynamic = preview('动态建议', 'Dynamic suggestions');
      const email = dynamic.getByRole('combobox', {
        name: english ? 'Email address' : '邮箱地址',
        exact: true,
      });
      await email.fill('leaf@custom.test');
      const dynamicPopup = await suggestionPopup(page, email);
      await expect(dynamicPopup.list.getByRole('option')).toHaveText([
        'leaf@gmail.com',
        'leaf@outlook.com',
        'leaf@icloud.com',
      ]);
      await expectPopupBounds(dynamicPopup.panel);
      await dynamicPopup.list
        .getByRole('option', { name: 'leaf@outlook.com', exact: true })
        .click();
      await expect(email).toHaveValue('leaf@outlook.com');
      await expect(email).toHaveAttribute('aria-expanded', 'false');
      await email.hover();
      await dynamic
        .getByRole('button', { name: english ? 'Clear input' : '清除输入', exact: true })
        .click();
      await expect(email).toHaveValue('');
      await expect(email).toBeFocused();
      await expect(dynamic.getByRole('button')).toHaveCount(0);
      await email.press('ArrowDown');
      const clearedPopup = await suggestionPopup(page, email);
      await expect(clearedPopup.panel.getByRole('option')).toHaveCount(0);
      await expect(clearedPopup.panel.getByRole('status')).toBeVisible();
      await expectPopupBounds(clearedPopup.panel);
      await email.press('Escape');

      const grouped = preview('分组建议', 'Grouped suggestions');
      const team = grouped.getByRole('combobox', {
        name: english ? 'Team email' : '团队邮箱',
        exact: true,
      });
      await team.fill(english ? 'Design' : '设计');
      const groupPopup = await suggestionPopup(page, team);
      await expect(groupPopup.panel.locator('.leaf-select__group')).toHaveText(
        english ? 'Team' : '团队',
      );
      await expect(groupPopup.list.getByRole('option')).toHaveCount(1);
      await expect(groupPopup.list.getByRole('option')).toContainText('Alice');
      await expect(groupPopup.list.getByRole('option')).toContainText(english ? 'Design' : '设计');
      await expectPopupBounds(groupPopup.panel);
      await page.screenshot({ path: testInfo.outputPath('autocomplete-rich-suggestions.png') });
      await team.press('ArrowDown');
      await team.press('Enter');
      await expect(team).toHaveValue('alice@example.com');

      const loading = preview('加载与重试', 'Loading and retry');
      const remote = loading.getByRole('combobox', {
        name: english ? 'Remote project' : '远程项目',
        exact: true,
      });
      const status = loading.getByRole('status');
      const fail = loading.getByRole('button', {
        name: english ? 'Simulate failure' : '模拟失败',
        exact: true,
      });
      await expect(status).toHaveText(english ? 'Load failed' : '加载失败');
      await remote.click();
      const failedPopup = await suggestionPopup(page, remote);
      const retry = failedPopup.panel.getByRole('button', {
        name: english ? 'Retry' : '重试',
        exact: true,
      });
      await expect(failedPopup.panel.getByRole('alert')).toContainText(
        english ? 'Suggestions failed to load' : '建议加载失败',
      );
      await expect(retry).toBeEnabled();
      await expectPopupBounds(failedPopup.panel);
      await page.screenshot({ path: testInfo.outputPath('autocomplete-error-and-retry.png') });
      await page.clock.install({ time: new Date('2026-10-26T12:00:00Z') });
      await page.clock.pauseAt(new Date('2026-10-26T12:00:01Z'));
      await retry.click();
      await expect(remote).toBeFocused();
      await expect(status).toHaveText(english ? 'Loading' : '正在加载');
      await expect(fail).toBeDisabled();
      const pending = await suggestionPopup(page, remote);
      await expect(pending.list).toHaveAttribute('aria-busy', 'true');
      await expect(pending.panel.getByRole('status')).toBeVisible();
      await expect(pending.panel.getByRole('option')).toHaveCount(0);
      await expect(pending.panel.getByRole('alert')).toHaveCount(0);
      await page.clock.runFor(799);
      await expect(status).toHaveText(english ? 'Loading' : '正在加载');
      await expect(pending.panel.getByRole('option')).toHaveCount(0);
      await page.clock.runFor(1);
      await expect(status).toHaveText(english ? 'Loaded 2 suggestions' : '已加载 2 条建议');
      await expect(fail).toBeEnabled();
      await page.clock.resume();
      const readyPopup = await suggestionPopup(page, remote);
      await expect(readyPopup.list).not.toHaveAttribute('aria-busy', 'true');
      await expect(readyPopup.list.getByRole('option')).toHaveText(['Leaf Garden', 'Leaf Studio']);
      await expectPopupBounds(readyPopup.panel);
      await page.screenshot({ path: testInfo.outputPath('autocomplete-loaded-suggestions.png') });
      await readyPopup.list.getByRole('option', { name: 'Leaf Studio', exact: true }).click();
      await expect(remote).toHaveValue('Leaf Studio');
      await fail.click();
      await expect(status).toHaveText(english ? 'Load failed' : '加载失败');
      const repeatedFailure = await suggestionPopup(page, remote);
      await expect(repeatedFailure.panel.getByRole('option')).toHaveCount(0);
      await expect(
        repeatedFailure.panel.getByRole('button', {
          name: english ? 'Retry' : '重试',
          exact: true,
        }),
      ).toBeEnabled();
      await expectPopupBounds(repeatedFailure.panel);
      await remote.press('Escape');

      const states = preview('禁用与只读', 'Disabled and read-only');
      const disabled = states.getByRole('combobox', {
        name: english ? 'Disabled' : '禁用',
        exact: true,
      });
      const readOnly = states.getByRole('combobox', {
        name: english ? 'Read only' : '只读',
        exact: true,
      });
      await expect(disabled).toBeDisabled();
      await expect(disabled).toHaveValue('Leaf Garden');
      await expect(disabled).toHaveAttribute('aria-expanded', 'false');
      await expect(readOnly).toHaveAttribute('readonly', '');
      await readOnly.focus();
      await readOnly.press('End');
      await readOnly.press('Backspace');
      await readOnly.press('ArrowDown');
      await expect(readOnly).toBeFocused();
      await expect(readOnly).toHaveValue('Leaf Garden');
      await expect(readOnly).toHaveAttribute('aria-expanded', 'false');
      await expectPreviewLayout(page);
      expect(errors).toEqual([]);
    });
  }
}
