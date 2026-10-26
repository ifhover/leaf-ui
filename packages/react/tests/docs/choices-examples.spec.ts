import { expect, type Locator, type Page, test } from '@playwright/test';

const profiles = [
  { width: 1280, appearance: 'light' },
  { width: 375, appearance: 'dark' },
] as const;

async function openExamples(
  page: Page,
  component: 'checkbox' | 'radio' | 'switch',
  english: boolean,
  { width, appearance }: (typeof profiles)[number],
) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ colorScheme: appearance });
  await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
  await page.goto(`${english ? '/en' : ''}/components/${component}.html`);
  const root = page.locator('html');
  const dark = (await root.getAttribute('class'))?.includes('dark');
  if (Boolean(dark) !== (appearance === 'dark')) {
    const toggle = english ? /Switch to (light|dark) theme/ : /切换到[浅深]色主题/;
    await page.getByRole('button', { name: toggle }).first().click();
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

async function expectNaturalChoiceWidth(input: Locator, component: 'checkbox' | 'switch') {
  const geometry = await input.evaluate((node, family) => {
    const label = node.closest('label');
    const control = label?.querySelector(`.leaf-${family}__control`);
    const text = label?.querySelector(`.leaf-${family}__label`);
    const content = label?.closest('.leaf-component-example__preview-content');
    if (!label || !control || !text || !content) {
      throw new Error('Missing single-choice preview structure');
    }
    const range = document.createRange();
    range.selectNodeContents(text);
    const style = getComputedStyle(label);
    const naturalWidth =
      control.getBoundingClientRect().width +
      Number.parseFloat(style.columnGap) +
      range.getBoundingClientRect().width +
      Number.parseFloat(style.paddingLeft) +
      Number.parseFloat(style.paddingRight) +
      Number.parseFloat(style.borderLeftWidth) +
      Number.parseFloat(style.borderRightWidth);
    return {
      choiceWidthDelta: Math.abs(label.getBoundingClientRect().width - naturalWidth),
      contentWidthDelta: Math.abs(content.getBoundingClientRect().width - naturalWidth),
    };
  }, component);
  expect(geometry.choiceWidthDelta).toBeLessThan(1);
  expect(geometry.contentWidthDelta).toBeLessThan(1);
}

async function expectComparisonLayout(preview: Locator, width: number, rows: number) {
  const geometry = await preview.locator('.leaf-grid').evaluate((grid) => {
    const children = [...grid.children];
    const labels = children
      .filter((_, index) => index % 2 === 0)
      .map((node) => node.getBoundingClientRect());
    const controls = children
      .filter((_, index) => index % 2 === 1)
      .map((node) => node.getBoundingClientRect());
    const [firstLabel] = labels;
    const [firstControl] = controls;
    if (!firstLabel || !firstControl || labels.length !== controls.length) {
      throw new Error('Choice comparison must contain matching label/control pairs');
    }
    const pairs = labels.map((label, index) => {
      const control = controls[index];
      if (!control) throw new Error(`Missing choice control for comparison row ${index}`);
      return { label, control };
    });
    return {
      childCount: children.length,
      labelsAligned: labels.every((box) => Math.abs(box.left - firstLabel.left) < 1),
      controlsAligned: controls.every((box) => Math.abs(box.left - firstControl.left) < 1),
      stacked: pairs.every(({ label, control }) => label.bottom <= control.top),
      beside: pairs.every(({ label, control }) => label.right <= control.left),
    };
  });
  expect(geometry.childCount).toBe(rows * 2);
  expect(geometry.labelsAligned).toBe(true);
  expect(geometry.controlsAligned).toBe(true);
  expect(width === 375 ? geometry.stacked : geometry.beside).toBe(true);
}

async function expectDisabledChoiceUnchanged(page: Page, input: Locator, checked: boolean) {
  await expect(input).toBeDisabled();
  await expect(input).toHaveJSProperty('checked', checked);
  await input.scrollIntoViewIfNeeded();
  const box = await input.boundingBox();
  if (!box) throw new Error('Disabled choice has no pointer target');
  // Real pointer input exercises native disabled behavior without forcing an action.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(input).toHaveJSProperty('checked', checked);
}

async function expectListStatusesFit(
  preview: Locator,
  component: 'checkbox' | 'radio',
  texts: string[],
) {
  const tags = preview.locator(`.leaf-${component}__extra .leaf-tag`);
  await expect(tags).toHaveText(texts);
  for (const tag of await tags.all()) {
    await expect(tag).toBeVisible();
    const geometry = await tag.evaluate((node, family) => {
      const text = node.querySelector(':scope > span:not([aria-hidden])');
      const extra = node.closest(`.leaf-${family}__extra`);
      const row = node.closest('label');
      if (!text || !extra || !row) throw new Error('Missing list status structure');
      const tagBox = node.getBoundingClientRect();
      const extraBox = extra.getBoundingClientRect();
      return {
        textOverflow: text.scrollWidth > text.clientWidth,
        extraOverflow: extra.scrollWidth > extra.clientWidth,
        rowOverflow: row.scrollWidth > row.clientWidth,
        tagWithinExtra: tagBox.left >= extraBox.left - 1 && tagBox.right <= extraBox.right + 1,
      };
    }, component);
    expect(geometry.textOverflow).toBe(false);
    expect(geometry.extraOverflow).toBe(false);
    expect(geometry.rowOverflow).toBe(false);
    expect(geometry.tagWithinExtra).toBe(true);
  }
}

for (const language of ['zh', 'en']) {
  for (const profile of profiles) {
    const english = language === 'en';
    const suffix = `${language} ${profile.width} ${profile.appearance}`;

    test(`Checkbox examples: ${suffix}`, async ({ page }) => {
      const { preview, errors } = await openExamples(page, 'checkbox', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const news = basic.getByRole('checkbox', {
        name: english ? 'Receive project news' : '接收项目动态',
        exact: true,
      });
      await expect(basic.getByRole('checkbox')).toHaveCount(1);
      await expect(news).not.toBeChecked();
      await expectNaturalChoiceWidth(news, 'checkbox');
      await news.check();
      await expect(news).toBeChecked();
      await news.press('Space');
      await expect(news).not.toBeChecked();

      const group = preview('选项组', 'Checkbox group').getByRole('group', {
        name: english ? 'Subscriptions' : '订阅内容',
        exact: true,
      });
      const design = group.getByRole('checkbox', {
        name: english ? 'Design updates' : '设计更新',
        exact: true,
      });
      const product = group.getByRole('checkbox', {
        name: english ? 'Product news' : '产品动态',
        exact: true,
      });
      const weekly = group.getByRole('checkbox', {
        name: english ? 'Weekly updates' : '每周摘要',
        exact: true,
      });
      await expect(group.getByRole('checkbox')).toHaveCount(3);
      await expect(design).toBeChecked();
      await expect(product).not.toBeChecked();
      await expect(weekly).not.toBeChecked();
      await product.check();
      await expect(design).toBeChecked();
      await expect(product).toBeChecked();
      await design.uncheck();
      await weekly.check();
      await expect(design).not.toBeChecked();
      await expect(product).toBeChecked();
      await expect(weekly).toBeChecked();

      const disabled = preview('禁用状态', 'Disabled states');
      await expect(disabled.getByRole('checkbox')).toHaveCount(2);
      await expect(disabled.locator('.leaf-grid > .leaf-text')).toHaveText(
        english ? ['Unchecked', 'Checked'] : ['未选中', '已选中'],
      );
      await expectComparisonLayout(disabled, profile.width, 2);
      await expectDisabledChoiceUnchanged(page, disabled.getByRole('checkbox').nth(0), false);
      await expectDisabledChoiceUnchanged(page, disabled.getByRole('checkbox').nth(1), true);

      const checkAll = preview('全选与半选', 'Select all and indeterminate');
      const all = checkAll.getByRole('checkbox', {
        name: english ? 'Subscribe to all' : '订阅全部',
        exact: true,
      });
      const option = (zh: string, en: string) =>
        checkAll.getByRole('checkbox', { name: english ? en : zh, exact: true });
      const options = [
        option('设计更新', 'Design updates'),
        option('产品动态', 'Product news'),
        option('每周摘要', 'Weekly updates'),
      ] as const;
      const status = checkAll.getByRole('status');
      const selectedText = (count: number) =>
        english ? `Selected ${count} items` : `已选择 ${count} 项`;
      await expect(all).not.toBeChecked();
      await expect(all).toHaveJSProperty('indeterminate', true);
      await expect(options[0]).toBeChecked();
      await expect(options[1]).not.toBeChecked();
      await expect(options[2]).not.toBeChecked();
      await expect(status).toHaveText(selectedText(1));
      await all.click();
      for (const option of options) await expect(option).toBeChecked();
      await expect(all).toBeChecked();
      await expect(all).toHaveJSProperty('indeterminate', false);
      await expect(status).toHaveText(selectedText(3));
      await options[1].uncheck();
      await expect(all).not.toBeChecked();
      await expect(all).toHaveJSProperty('indeterminate', true);
      await expect(status).toHaveText(selectedText(2));
      await all.click();
      for (const option of options) await expect(option).toBeChecked();
      await expect(all).toBeChecked();
      await expect(all).toHaveJSProperty('indeterminate', false);
      await expect(status).toHaveText(selectedText(3));
      await all.click();
      for (const option of options) await expect(option).not.toBeChecked();
      await expect(all).not.toBeChecked();
      await expect(all).toHaveJSProperty('indeterminate', false);
      await expect(status).toHaveText(selectedText(0));
      if (profile.width === 375) {
        await expectListStatusesFit(
          preview('成组选项', 'Grouped choices'),
          'checkbox',
          english ? ['Approval', 'Restricted'] : ['需审批', '已限制'],
        );
      }
      expect(errors).toEqual([]);
    });

    test(`Radio examples: ${suffix}`, async ({ page }) => {
      const { preview, errors } = await openExamples(page, 'radio', english, profile);
      const basic = preview('基础用法', 'Basic usage').getByRole('group', {
        name: english ? 'Choose appearance' : '选择项目外观',
        exact: true,
      });
      const light = basic.getByRole('radio', {
        name: english ? 'Light' : '浅色',
        exact: true,
      });
      const dark = basic.getByRole('radio', {
        name: english ? 'Dark' : '深色',
        exact: true,
      });
      const system = basic.getByRole('radio', {
        name: english ? 'System' : '跟随系统',
        exact: true,
      });
      await expect(basic.getByRole('radio')).toHaveCount(3);
      for (const radio of [light, dark, system])
        await expect(radio).toHaveAttribute('name', 'appearance');
      await expect(light).toBeChecked();
      await expect(dark).not.toBeChecked();
      await expect(system).not.toBeChecked();
      await dark.check();
      await expect(light).not.toBeChecked();
      await expect(dark).toBeChecked();
      await dark.press('ArrowRight');
      await expect(system).toBeFocused();
      await expect(system).toBeChecked();
      await expect(dark).not.toBeChecked();
      await system.press('ArrowLeft');
      await expect(dark).toBeFocused();
      await expect(dark).toBeChecked();
      await expect(system).not.toBeChecked();
      await expect(basic.locator('input:checked')).toHaveCount(1);

      const controlled = preview('受控选择', 'Controlled selection');
      const frequency = controlled.getByRole('group', {
        name: english ? 'Notification frequency' : '提醒频率',
        exact: true,
      });
      const daily = frequency.getByRole('radio', {
        name: english ? 'Daily' : '每天',
        exact: true,
      });
      const weekly = frequency.getByRole('radio', {
        name: english ? 'Weekly' : '每周',
        exact: true,
      });
      const important = frequency.getByRole('radio', {
        name: english ? 'Important messages only' : '仅重要消息',
        exact: true,
      });
      const status = controlled.getByRole('status');
      const selectedText = (value: string) =>
        english ? `Selected: ${value}` : `当前选择：${value}`;
      await expect(frequency.getByRole('radio')).toHaveCount(3);
      const frequencyName = await daily.getAttribute('name');
      expect(frequencyName).toBeTruthy();
      expect(frequencyName).not.toBe('appearance');
      for (const radio of [weekly, important]) {
        await expect(radio).toHaveAttribute('name', frequencyName as string);
      }
      await expect(daily).toBeChecked();
      await expect(weekly).not.toBeChecked();
      await expect(important).not.toBeChecked();
      await expect(status).toHaveText(selectedText('daily'));
      await weekly.check();
      await expect(daily).not.toBeChecked();
      await expect(weekly).toBeChecked();
      await expect(status).toHaveText(selectedText('weekly'));
      await weekly.press('ArrowRight');
      await expect(important).toBeFocused();
      await expect(important).toBeChecked();
      await expect(weekly).not.toBeChecked();
      await expect(status).toHaveText(selectedText('important'));
      await important.press('ArrowRight');
      await expect(daily).toBeFocused();
      await expect(daily).toBeChecked();
      await expect(important).not.toBeChecked();
      await expect(status).toHaveText(selectedText('daily'));
      await expect(frequency.locator('input:checked')).toHaveCount(1);
      await expect(dark).toBeChecked();

      const vertical = preview('纵向排列', 'Vertical layout');
      await expect(vertical.getByRole('radio')).toHaveCount(3);
      const geometry = await vertical.locator('.leaf-radio').evaluateAll((radios) => {
        const boxes = radios.map((radio) => radio.getBoundingClientRect());
        const [first] = boxes;
        if (!first) throw new Error('Vertical radio example has no choices');
        return {
          aligned: boxes.every((box) => Math.abs(box.left - first.left) < 1),
          stacked: boxes.slice(1).every((box, index) => {
            const previous = boxes[index];
            if (!previous) throw new Error(`Missing preceding radio choice ${index}`);
            return previous.bottom <= box.top;
          }),
        };
      });
      expect(geometry.aligned).toBe(true);
      expect(geometry.stacked).toBe(true);

      const list = preview('成组选项', 'Grouped choices');
      await expect(
        list.getByRole('radio', { name: english ? 'Read only' : '只读访问', exact: true }),
      ).toBeChecked();
      const copies = list.locator('.leaf-radio__copy');
      await expect(copies).toHaveCount(2);
      const copyLeftDelta = await copies.evaluateAll((nodes) => {
        const [first, second] = nodes;
        if (!first || !second) throw new Error('Missing grouped radio descriptions');
        return Math.abs(first.getBoundingClientRect().left - second.getBoundingClientRect().left);
      });
      expect(copyLeftDelta).toBeLessThan(1);
      if (profile.width === 375) {
        await expectListStatusesFit(list, 'radio', [english ? 'Recommended' : '推荐']);
      }
      expect(errors).toEqual([]);
    });

    test(`Switch examples: ${suffix}`, async ({ page }) => {
      const { preview, errors } = await openExamples(page, 'switch', english, profile);
      const basic = preview('基础用法', 'Basic usage');
      const notifications = basic.getByRole('switch', {
        name: english ? 'Enable notifications' : '开启通知',
        exact: true,
      });
      await expect(basic.getByRole('switch')).toHaveCount(1);
      await expect(notifications).not.toBeChecked();
      await expectNaturalChoiceWidth(notifications, 'switch');
      await notifications.check();
      await expect(notifications).toBeChecked();
      await notifications.press('Space');
      await expect(notifications).not.toBeChecked();

      const states = preview('禁用与加载', 'Disabled and loading');
      await expect(states.getByRole('switch')).toHaveCount(2);
      await expect(states.locator('.leaf-grid > .leaf-text')).toHaveText(
        english ? ['Disabled', 'Loading'] : ['禁用', '加载'],
      );
      const disabled = states.locator('input[role="switch"]:not([aria-busy="true"])');
      const loading = states.getByRole('switch').and(states.locator('[aria-busy="true"]'));
      await expect(disabled).toHaveCount(1);
      await expect(loading).toHaveCount(1);
      await expect(loading).toHaveAttribute('aria-busy', 'true');
      await expectComparisonLayout(states, profile.width, 2);
      await expectDisabledChoiceUnchanged(page, disabled, true);
      await expectDisabledChoiceUnchanged(page, loading, true);

      const sizes = preview('尺寸', 'Sizes');
      await expect(sizes.getByRole('switch')).toHaveCount(3);
      await expect(sizes.locator('.leaf-grid > .leaf-text')).toHaveText(
        english ? ['Small', 'Medium', 'Large'] : ['小', '中', '大'],
      );
      await expectComparisonLayout(sizes, profile.width, 3);
      for (const [size, width, height] of [
        ['sm', 32, 20],
        ['md', 40, 24],
        ['lg', 48, 28],
      ] as const) {
        const input = sizes.locator(`.leaf-switch--${size}`).getByRole('switch');
        await expect(input).toBeEnabled();
        await expect(input).not.toBeChecked();
        await expect(input).toHaveCSS('width', `${width}px`);
        await expect(input).toHaveCSS('height', `${height}px`);
      }

      const controlled = preview('受控状态', 'Controlled state');
      const email = controlled.getByRole('switch', {
        name: english ? 'Receive email' : '接收邮件',
        exact: true,
      });
      const status = controlled.getByRole('status');
      await expect(email).toBeChecked();
      await expect(status).toHaveText(english ? 'Email notifications enabled' : '邮件通知已开启');
      await email.uncheck();
      await expect(email).not.toBeChecked();
      await expect(status).toHaveText(english ? 'Email notifications disabled' : '邮件通知已关闭');
      await email.press('Space');
      await expect(email).toBeChecked();
      await expect(status).toHaveText(english ? 'Email notifications enabled' : '邮件通知已开启');
      expect(errors).toEqual([]);
    });
  }
}
