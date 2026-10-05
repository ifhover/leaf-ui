import { expect, test } from '@playwright/test';

test('10k options and nodes virtualize, search and preserve selection with bounded DOM', async ({
  page,
}, testInfo) => {
  await page.goto('/?fixture=large');
  const input = page.getByRole('combobox', { name: 'Large select' });
  const start = Date.now();
  await input.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  const openMs = Date.now() - start;
  const selectDOM = await page.getByRole('option').count();
  expect(selectDOM).toBeLessThan(60);
  const searchStart = Date.now();
  await input.fill('Person 09999');
  await page.getByRole('option', { name: 'Person 09999', exact: true }).click();
  const searchSelectMs = Date.now() - searchStart;
  await expect(input).toHaveValue('Person 09999');
  expect(await page.getByRole('treeitem').count()).toBeLessThan(60);
  const tree = page.getByRole('tree');
  await tree.getByRole('treeitem').first().focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('treeitem', { name: 'Node 09999', exact: true })).toBeVisible();
  await testInfo.attach('large-data-timings', {
    body: JSON.stringify({
      browser: testInfo.project.name,
      items: 10000,
      openMs,
      searchSelectMs,
      selectDOM,
      treeDOM: await page.getByRole('treeitem').count(),
    }),
    contentType: 'application/json',
  });
});

test('variable virtual rows measure correctly after resizing and keyed reordering', async ({
  page,
}) => {
  await page.goto('/?fixture=large');
  await page.getByRole('button', { name: 'Jump', exact: true }).click();
  const list = page.locator('.leaf-virtual-list');
  await expect(list.getByRole('button', { name: 'Person 05000', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Resize rows', exact: true }).click();
  const rows = list.locator('li');
  await expect
    .poll(async () =>
      rows.evaluateAll((nodes) => {
        const boxes = nodes.map((node) => node.getBoundingClientRect());
        return boxes.filter((box, i) => i > 0 && box.top + 1 < (boxes[i - 1]?.bottom ?? 0)).length;
      }),
    )
    .toBe(0);
  const focused = list.getByRole('button', { name: 'Person 05000', exact: true });
  await focused.focus();
  const beforeScroll = await list.evaluate((node) => node.scrollTop);
  // A server reorder updates data without moving focus to a separate control.
  await page
    .getByRole('button', { name: 'Reverse rows', exact: true })
    .evaluate((node: HTMLButtonElement) => node.click());
  await expect(focused).toBeFocused();
  expect(Math.abs((await list.evaluate((node) => node.scrollTop)) - beforeScroll)).toBeLessThan(
    200,
  );
  await page.getByRole('button', { name: 'Jump', exact: true }).click();
  await expect(list.getByRole('button', { name: 'Person 04999', exact: true })).toBeVisible();
  expect(await rows.count()).toBeLessThan(60);
});
