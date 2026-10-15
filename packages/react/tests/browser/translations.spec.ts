import { expect, test } from '@playwright/test';
import axe from 'axe-core';

for (const appearance of ['light', 'dark']) {
  test(`${appearance}: scoped translations, language switching, ICU, portals and time input`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/?fixture=translations&theme=${appearance}`);
    await expect(page.getByTestId('translations')).toHaveAttribute('lang', 'ja-JP');
    await expect(page.getByLabel('Choice', { exact: true })).toHaveAttribute(
      'placeholder',
      '選択してください',
    );
    await expect(page.getByText('全 21 件')).toBeVisible();
    const date = page.getByLabel('Date', { exact: true });
    await date.click();
    await expect(page.getByRole('button', { name: '月', exact: true })).toHaveText('10月');
    await expect(page.getByRole('button', { name: '今日', exact: true })).toBeVisible();
    await date.press('Escape');
    const choice = page.getByLabel('Choice', { exact: true });
    await choice.click();
    await expect(page.getByText('選択肢がありません', { exact: true })).toBeVisible();
    await expect(page.locator('[data-leaf-popup]:visible').last()).toHaveAttribute('lang', 'ja-JP');
    await choice.press('Escape');
    await page.getByRole('combobox', { name: 'Nested choice', exact: true }).click();
    await expect(page.getByText('候補なし', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    const time = page.getByLabel('Time', { exact: true });
    await time.fill('3:45 午後');
    await time.press('Enter');
    await expect(time).toHaveValue('03:45 午後');
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Continue?' });
    await expect(dialog.getByRole('button', { name: '確認', exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'キャンセル', exact: true }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole('button', { name: 'Message', exact: true }).click();
    await page.getByRole('button', { name: 'Notification', exact: true }).click();
    await expect(page.getByRole('button', { name: '閉じる', exact: true })).toHaveCount(2);
    await page.getByRole('button', { name: 'Korean', exact: true }).click();
    await expect(page.getByTestId('translations')).toHaveAttribute('lang', 'ko-KR');
    await expect(choice).toHaveAttribute('placeholder', '선택해 주세요');
    await expect(time).toHaveValue('03:45 오후');
    await expect(page.getByText('총 21개')).toBeVisible();
    await expect(page.getByRole('button', { name: '닫기', exact: true })).toHaveCount(2);
    await page.getByRole('button', { name: 'English', exact: true }).click();
    await expect(page.getByTestId('translations')).toHaveAttribute('lang', 'en-US');
    await expect(choice).toHaveAttribute('placeholder', 'Please select');
    await expect(time).toHaveValue('03:45 PM');
    await expect(page.getByText('Total 21 items')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close', exact: true })).toHaveCount(2);
    await page.getByRole('button', { name: 'Close', exact: true }).first().click();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.waitForTimeout(450);
    await page.evaluate(axe.source);
    const audit = await page.evaluate(async () => {
      const main = document.querySelector('main');
      if (!main) throw new Error('Fixture main was not rendered');
      return (window as unknown as { axe: typeof axe }).axe.run(main);
    });
    expect(audit.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}
