import { expect, test } from '@playwright/test';
import axe from 'axe-core';

for (const [name, query, width] of [
  ['desktop', '', 1100],
  ['mobile', '', 375],
  ['dark RTL', '&theme=dark&rtl=1', 1100],
  ['compact mobile', '&compact=1', 375],
] as const) {
  test(`file names, visuals and actions align without overflow: ${name}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?fixture=file-list${query}`);
    const text = page.getByRole('region', { name: 'File information', exact: true });
    const rows = text.locator('.leaf-file-list__item');
    const geometry = await rows.evaluateAll((nodes) =>
      nodes.map((node) => {
        const rtl = getComputedStyle(node).direction === 'rtl';
        const icon = node.querySelector('.leaf-file-list__icon')?.getBoundingClientRect();
        const main = node.querySelector('.leaf-file-list__main')?.getBoundingClientRect();
        const details = node.querySelector('.leaf-file-list__details')?.getBoundingClientRect();
        const nameBox = node.querySelector('.leaf-file-list__name')?.getBoundingClientRect();
        const metaBox = node.querySelector('.leaf-file-list__meta')?.getBoundingClientRect();
        const iconColor = node.querySelector('.leaf-file-list__icon')
          ? getComputedStyle(node.querySelector('.leaf-file-list__icon') as Element).color
          : '';
        const row = node.getBoundingClientRect();
        const actions = [...node.querySelectorAll('.leaf-file-list__action')].map((action) => {
          const rect = action.getBoundingClientRect();
          return { width: rect.width, height: rect.height, left: rect.left, right: rect.right };
        });
        return {
          error: node.hasAttribute('data-error'),
          iconColor,
          icon: rtl ? icon?.right : icon?.left,
          iconCenterY: icon ? icon.top + icon.height / 2 : 0,
          mainCenterY: main ? main.top + main.height / 2 : 0,
          details: rtl ? details?.right : details?.left,
          nameTop: nameBox?.top ?? 0,
          metaTop: metaBox?.top ?? 0,
          row: { left: row.left, right: row.right },
          actions,
        };
      }),
    );
    expect(geometry).toHaveLength(4);
    expect(geometry[0]?.iconColor).toBe(geometry[1]?.iconColor);
    expect(geometry[0]?.iconColor).toBe(geometry[3]?.iconColor);
    expect(geometry[2]?.error).toBe(true);
    expect(geometry[2]?.iconColor).not.toBe(geometry[0]?.iconColor);
    for (const entry of geometry) {
      expect(entry.icon).toBeCloseTo(geometry[0]?.icon ?? 0, 0);
      expect(entry.details).toBeCloseTo(geometry[0]?.details ?? 0, 0);
      expect(Math.abs(entry.iconCenterY - entry.mainCenterY)).toBeLessThanOrEqual(1);
      if (width > 480) expect(Math.abs(entry.metaTop - entry.nameTop)).toBeLessThan(6);
      else expect(entry.metaTop).toBeGreaterThan(entry.nameTop + 12);
      for (const action of entry.actions) {
        expect(action.width).toBeCloseTo(action.height, 0);
        expect(action.width).toBeCloseTo(geometry[0]?.actions[0]?.width ?? 0, 0);
        expect(action.left).toBeGreaterThanOrEqual(entry.row.left);
        expect(action.right).toBeLessThanOrEqual(entry.row.right);
      }
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);
    const overflow = await page
      .locator('.leaf-file-list')
      .evaluateAll((nodes) => nodes.map((node) => node.scrollWidth - node.clientWidth));
    expect(Math.max(...overflow)).toBeLessThanOrEqual(1);
    const cards = page.getByRole('region', { name: 'Picture cards', exact: true });
    const cardCaptions = await cards.locator('.leaf-file-list__item').evaluateAll((nodes) =>
      nodes.map((node) => {
        const footer = node.querySelector('.leaf-file-list__footer')?.getBoundingClientRect();
        const title = node.querySelector('.leaf-file-list__name')?.getBoundingClientRect();
        const actions = node.querySelector('.leaf-file-list__actions')?.getBoundingClientRect();
        return {
          footerWidth: footer?.width ?? 0,
          titleWidth: title?.width ?? 0,
          titleBottom: title?.bottom ?? 0,
          actionsTop: actions?.top ?? 0,
        };
      }),
    );
    for (const caption of cardCaptions) {
      expect(caption.titleWidth).toBeCloseTo(caption.footerWidth, 0);
      expect(caption.actionsTop).toBeGreaterThanOrEqual(caption.titleBottom);
    }
    const actionEdges = await cards
      .locator('.leaf-file-list__actions')
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().bottom));
    if (width > 480) expect(Math.max(...actionEdges) - Math.min(...actionEdges)).toBeLessThan(1);
    await page.screenshot({
      path: test
        .info()
        .outputPath(`file-list-${testInfo.project.name}-${name.replaceAll(' ', '-')}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
}

test('removal keeps errors in the affected row, prevents double submit and recovers on retry', async ({
  page,
}) => {
  await page.goto('/?fixture=file-list');
  const text = page.getByRole('region', { name: 'File information', exact: true });
  const first = text.locator('.leaf-file-list__item').first();
  const remove = first.getByRole('button', { name: 'Remove Project proposal.pdf' });
  await remove.click();
  await expect(remove).toBeDisabled();
  await text.getByRole('button', { name: 'Complete removal' }).click();
  await expect(first.getByRole('alert')).toHaveText('Removal failed. Please try again.');
  await expect(text.getByRole('alert')).toHaveCount(1);
  await remove.click();
  await text.getByRole('button', { name: 'Complete removal' }).click();
  await expect(text.getByText('Project proposal.pdf')).toHaveCount(0);
  await expect(text.locator('.leaf-file-list__item')).toHaveCount(3);
  const row = text.locator('.leaf-file-list__item').first();
  await expect(row).toHaveText(/Summer landscape/);
  await expect(row.getByRole('button', { name: /Remove/ })).toBeEnabled();
});

test('keyboard image preview switches images, closes and returns focus to its trigger', async ({
  page,
}) => {
  await page.goto('/?fixture=file-list');
  const trigger = page
    .getByRole('region', { name: 'Thumbnails', exact: true })
    .getByRole('button', { name: 'Preview Summer landscape.svg' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const preview = page.getByRole('dialog', { name: 'Image preview' });
  await expect(preview).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(preview).toContainText('Mountain trail.svg');
  await page.keyboard.press('Escape');
  await expect(preview).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Upload cancel and retry keep their action sizes and show progress and errors in the file row', async ({
  page,
}) => {
  await page.goto('/?fixture=file-list');
  const region = page.getByRole('region', { name: 'Upload integration', exact: true });
  await region
    .locator('input[type=file]')
    .setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('notes') });
  const row = region.locator('.leaf-file-list__item');
  await expect(row).toContainText('Uploading');
  await region.getByRole('button', { name: 'Advance upload' }).click();
  await expect(row.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
  const cancel = row.getByRole('button', { name: 'Cancel upload notes.txt' });
  const remove = row.getByRole('button', { name: 'Remove notes.txt' });
  expect((await cancel.boundingBox())?.height).toBeCloseTo(
    (await remove.boundingBox())?.height ?? 0,
    0,
  );
  await cancel.click();
  await expect(row).toContainText('Cancelled');
  await row.getByRole('button', { name: 'Retry upload notes.txt' }).click();
  await expect(row.getByRole('progressbar')).toBeVisible();
  await region.getByRole('button', { name: 'Fail upload' }).click();
  await expect(row).toContainText('Upload connection failed.');
  await expect(row.getByRole('button', { name: 'Retry upload notes.txt' })).toBeEnabled();
});

test('file lists pass accessibility checks in both themes and respect reduced motion', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    await page.goto(`/?fixture=file-list&theme=${theme}`);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(
      async () => (await (window as unknown as { axe: typeof axe }).axe.run('main')).violations,
    );
    expect(violations).toEqual([]);
    const disabled = page.getByRole('region', { name: 'Disabled actions', exact: true });
    await expect(disabled.getByRole('button')).toHaveCount(2);
    await expect(disabled.getByLabel('Download Summer landscape.svg')).not.toHaveAttribute('href');
    await expect(disabled.getByRole('button').first()).toBeDisabled();
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.leaf-file-list__item').first()).toHaveCSS(
    'transition-duration',
    '0s',
  );
});
