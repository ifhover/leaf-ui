import { expect, type Locator, test } from '@playwright/test';

async function expectReadableLabels(form: Locator, stacked: boolean) {
  const fields = await form.locator('.leaf-form-field').evaluateAll((nodes) =>
    nodes.map((node) => {
      const label = node.querySelector('.leaf-form-field__label');
      const body = node.querySelector('.leaf-form-field__body');
      if (!label || !body) throw new Error('Missing form field label or body');
      const text = document.createRange();
      text.selectNodeContents(label);
      const labelBox = label.getBoundingClientRect();
      const bodyBox = body.getBoundingClientRect();
      return {
        textHeight: text.getBoundingClientRect().height,
        lineHeight: Number.parseFloat(getComputedStyle(label).lineHeight),
        beside: labelBox.right <= bodyBox.left,
        stacked: labelBox.bottom <= bodyBox.top,
      };
    }),
  );
  expect(fields).toHaveLength(2);
  for (const field of fields) {
    expect(field.textHeight).toBeLessThanOrEqual(field.lineHeight + 1);
    expect(stacked ? field.stacked : field.beside).toBe(true);
  }
  expect(await form.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
}

async function fieldColumns(form: Locator) {
  return form.locator('.leaf-form-field').evaluateAll((nodes) =>
    nodes.map((node) => {
      const header = node.querySelector('.leaf-form-field__header');
      const body = node.querySelector('.leaf-form-field__body');
      if (!header || !body) throw new Error('Missing form columns');
      return {
        labelWidth: header.getBoundingClientRect().width,
        controlStart: body.getBoundingClientRect().left - node.getBoundingClientRect().left,
      };
    }),
  );
}

for (const english of [false, true]) {
  for (const width of [1280, 375]) {
    for (const appearance of ['light', 'dark'] as const) {
      test(`ConfigProvider labels before and after hydration: ${english ? 'en' : 'zh'} ${width} ${appearance}`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: appearance });
        await page.addInitScript(() => localStorage.setItem('rspress-visited', '1'));
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));

        // Hold application scripts so the server-rendered layout cannot be hidden by hydration.
        let releaseScripts = () => {};
        const scriptsReleased = new Promise<void>((resolve) => {
          releaseScripts = resolve;
        });
        await page.route('**/*', async (route) => {
          if (route.request().resourceType() === 'script') await scriptsReleased;
          await route.continue();
        });
        try {
          await page.goto(`${english ? '/en' : ''}/components/config-provider.html`, {
            waitUntil: 'commit',
          });
          const form = page.locator('.leaf-component-example__preview form').first();
          await expect(form).toBeVisible();
          await expectReadableLabels(form, width === 375);
          const before = await fieldColumns(form);
          if (width === 1280) {
            expect(before.map((field) => field.labelWidth)).toEqual([112, 112]);
          }
          await form.screenshot({ path: testInfo.outputPath('before-hydration.png') });

          releaseScripts();
          await page.waitForLoadState('load');
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
          await form.getByRole('combobox').click();
          await expect(page.getByRole('option').first()).toBeVisible();
          await page.keyboard.press('Escape');
          await expectReadableLabels(form, width === 375);
          expect(await fieldColumns(form)).toEqual(before);
          await form.screenshot({ path: testInfo.outputPath('after-hydration.png') });
          expect(errors).toEqual([]);
        } finally {
          releaseScripts();
          await page.unrouteAll({ behavior: 'wait' });
        }
      });
    }
  }
}
