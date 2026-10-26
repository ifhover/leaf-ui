import { expect, test } from '@playwright/test';
import { settleAnimations } from '../browser/helpers/motion';

for (const english of [false, true]) {
  for (const { width, appearance } of [
    { width: 1280, appearance: 'light' },
    { width: 375, appearance: 'dark' },
  ] as const) {
    test(`ColorPicker examples: ${english ? 'en' : 'zh'} ${width} ${appearance}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: appearance });
      await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
      await page.goto(`${english ? '/en' : ''}/components/color-picker.html`);
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
      const preview = (zh: string, en: string) =>
        page
          .getByRole('region', { name: english ? `${en} example` : `${zh}示例`, exact: true })
          .locator('.leaf-component-example__preview');
      const panel = page.getByRole('dialog', {
        name: english ? 'Choose a color' : '选择颜色',
        exact: true,
      });

      await preview('基础用法', 'Basic usage')
        .getByRole('button', { name: english ? 'Brand color' : '品牌颜色', exact: true })
        .click();
      const input = panel.getByRole('textbox', { name: english ? 'Color value' : '颜色值' });
      await input.fill('not-a-color');
      await input.press('Enter');
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(
        panel.getByText(english ? 'Enter a valid color' : '请输入有效的颜色'),
      ).toBeVisible();
      await input.fill('#1677ff');
      await input.press('Enter');
      await expect(input).not.toHaveAttribute('aria-invalid', 'true');
      await expect(input).toHaveValue('#1677ff');
      await panel.getByRole('tab', { name: 'RGB', exact: true }).click();
      await expect(input).toHaveValue('rgb(22, 119, 255)');
      await panel.getByRole('tab', { name: 'HSL', exact: true }).click();
      await expect(input).toHaveValue(/^hsl\(/);
      await settleAnimations(panel);
      await panel.screenshot({ path: testInfo.outputPath('solid-panel.png') });
      await page.keyboard.press('Escape');
      await expect(panel).toBeHidden();

      const formats = preview('颜色格式', 'Color formats');
      for (const [name, format] of [
        ['HEX', /^#/],
        ['RGB', /^rgb\(/],
        ['HSL', /^hsl\(/],
      ] as const) {
        await expect(formats.getByRole('button', { name, exact: true })).toHaveText(format);
      }

      const opacity = preview('透明度', 'Opacity');
      await opacity
        .getByRole('button', { name: english ? 'Translucent color' : '半透明颜色', exact: true })
        .click();
      await expect(
        panel.getByRole('slider', { name: english ? 'Opacity' : '透明度', exact: true }),
      ).toHaveValue('50');
      await page.keyboard.press('Escape');
      await opacity
        .getByRole('button', { name: english ? 'Opaque color' : '不透明颜色', exact: true })
        .click();
      await expect(
        panel.getByRole('slider', { name: english ? 'Opacity' : '透明度', exact: true }),
      ).toHaveCount(0);
      await expect(input).toHaveValue('#1e964f');
      await page.keyboard.press('Escape');

      const presets = preview('预设颜色', 'Preset colors');
      await presets
        .getByRole('button', {
          name: english ? 'Choose a preset color' : '选择预设颜色',
          exact: true,
        })
        .click();
      await expect(panel.getByText(english ? 'Brand colors' : '品牌颜色')).toBeVisible();
      await panel.getByRole('button', { name: '#1677ff', exact: true }).click();
      await expect(input).toHaveValue('#1677ff');
      await page.keyboard.press('Escape');
      await expect(presets.locator('.leaf-color-picker__text')).toHaveText('#1677ff');

      const states = preview('控件状态', 'Control states');
      await expect(
        states.getByRole('button', { name: english ? 'Disabled' : '禁用', exact: true }),
      ).toBeDisabled();
      const readOnly = states.getByRole('button', {
        name: english ? 'Read-only' : '只读',
        exact: true,
      });
      const readOnlyColor = await readOnly.textContent();
      await readOnly.click();
      await expect(readOnly).toHaveAttribute('aria-expanded', 'false');
      await expect(readOnly).toHaveText(readOnlyColor ?? '');
      await expect(
        states.getByRole('button', { name: english ? 'Error state' : '错误状态', exact: true }),
      ).toHaveAttribute('aria-invalid', 'true');

      const gradient = preview('渐变色', 'Gradients');
      const gradientTrigger = gradient.getByRole('button', {
        name: english ? 'Gradient color' : '渐变颜色',
        exact: true,
      });
      await gradientTrigger.click();
      const angle = panel.getByRole('spinbutton', {
        name: english ? 'Gradient angle' : '渐变角度',
      });
      await expect(angle).toHaveValue('90');
      await angle.fill('135');
      await angle.press('Enter');
      await expect(angle).toHaveValue('135');
      await expect(gradientTrigger.locator('.leaf-color-picker__swatch i')).toHaveCSS(
        'background-image',
        /linear-gradient\(135deg/,
      );
      await panel
        .getByRole('button', { name: english ? 'Add color stop' : '增加色标', exact: true })
        .click();
      await expect(
        panel.getByRole('button', { name: english ? 'Color stop 3' : '色标 3', exact: true }),
      ).toBeVisible();
      await settleAnimations(panel);
      await panel.screenshot({ path: testInfo.outputPath('gradient-panel.png') });
      await page.keyboard.press('Escape');

      const controlled = preview('受控值与清除', 'Controlled value and clearing');
      await controlled
        .getByRole('button', { name: english ? 'Clear color' : '清除颜色', exact: true })
        .click();
      await expect(controlled.getByRole('status')).toHaveText(
        english ? 'Current color: Empty' : '当前颜色：未选择',
      );
      await controlled
        .getByRole('button', { name: english ? 'Clearable color' : '可清除颜色', exact: true })
        .click();
      await input.fill('#cf0b2d');
      await input.press('Enter');
      await expect(controlled.getByRole('status')).toContainText('#cf0b2d');
      await page.keyboard.press('Escape');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(1);
    });
  }
}
