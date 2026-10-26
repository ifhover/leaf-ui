import { expect, type Locator, test } from '@playwright/test';

async function dragVertical(root: Locator) {
  const bar = root.locator(':scope > .leaf-scrollbar__bar--vertical');
  await expect(bar).toBeAttached();
  await root.hover();
  await expect(bar).toHaveCSS('opacity', '1');
  const bounds = await bar.boundingBox();
  if (!bounds) throw new Error('Missing internal scrollbar track');
  await bar.page().mouse.move(bounds.x + bounds.width / 2, bounds.y + 12);
  await bar.page().mouse.down();
  await bar.page().mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height * 0.75);
  await bar.page().mouse.up();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=internal-scrollbar');
});

test('select viewport keeps native wheel, drag, scroll callbacks and virtual keyboard navigation', async ({
  page,
}) => {
  for (const name of ['Selection', 'Virtual selection']) {
    const input = page.getByRole('combobox', { name, exact: true });
    await input.click();
    const popup = page.locator('.leaf-select__panel[data-state="open"]');
    const viewport = popup.getByRole('listbox');
    await expect(viewport).toHaveClass(/leaf-scrollbar__viewport/);
    await expect(viewport.getByRole('scrollbar')).toHaveCount(0);
    const bar = popup.getByRole('scrollbar', { name: /Vertical|垂直/ });
    await expect(bar).toHaveAttribute('tabindex', '-1');
    await viewport.hover();
    await page.mouse.wheel(0, 130);
    await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
    await expect(page.locator('output[aria-label="Popup scroll event"]')).toHaveText(/^true:[1-9]/);
    await dragVertical(popup);
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toBeFocused();
    await page.keyboard.press('End');
    const active = await input.getAttribute('aria-activedescendant');
    expect(active).toBeTruthy();
    await expect(page.locator(`[id="${active}"]`)).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Option 119');
    await page.keyboard.press('Escape');
  }
});

test('native textarea and mentions edit areas use shared tracks without changing focus or selection', async ({
  page,
}) => {
  for (const name of ['Native scrolling editor', 'Scrolling mentions editor']) {
    const editor = page.getByRole(name === 'Native scrolling editor' ? 'textbox' : 'combobox', {
      name,
      exact: true,
    });
    const root = editor.locator('..');
    await expect(editor).toHaveCSS('scrollbar-width', 'none');
    await editor.evaluate((node: HTMLTextAreaElement) => {
      node.focus();
      node.setSelectionRange(2, 7);
      node.dataset.refIdentity = 'native';
    });
    await editor.hover();
    await page.mouse.wheel(0, 140);
    await expect.poll(() => editor.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
    await dragVertical(root);
    await expect(editor).toBeFocused();
    await expect(editor).toHaveAttribute('data-ref-identity', 'native');
    expect(
      await editor.evaluate((node: HTMLTextAreaElement) => [
        node.selectionStart,
        node.selectionEnd,
      ]),
    ).toEqual([2, 7]);
    const nativeBounds = await editor.boundingBox();
    const trackBounds = await root.locator(':scope > .leaf-scrollbar__bar--vertical').boundingBox();
    expect(nativeBounds && trackBounds).toBeTruthy();
    if (nativeBounds && trackBounds) {
      expect(trackBounds.x + trackBounds.width).toBeLessThanOrEqual(
        nativeBounds.x + nativeBounds.width,
      );
      expect(trackBounds.y + trackBounds.height).toBeLessThan(
        nativeBounds.y + nativeBounds.height - 12,
      );
    }
    if (name === 'Native scrolling editor')
      await expect(page.locator('output[aria-label="Editor scroll event"]')).toHaveText('true:2:7');
  }
});

test('suggestions and cascaders share overlay tracks while time columns reserve gutters', async ({
  page,
}) => {
  for (const name of ['Suggestions', 'Tree selection', 'Cascading selection', 'Time selection']) {
    const input = page.getByRole('combobox', { name, exact: true });
    await input.click();
    const popup = page.locator('.leaf-floating[data-state="open"]');
    await expect(popup.locator('.leaf-scrollbar__bar--vertical').first()).toBeAttached();
    for (const list of await popup.getByRole('listbox').all())
      await expect(list.getByRole('scrollbar')).toHaveCount(0);
    if (name === 'Time selection') {
      const minutes = popup.locator('.leaf-time-picker__column').first();
      await expect(minutes.locator('..')).toHaveAttribute('data-persistent', '');
      await expect(minutes).toHaveCSS('scrollbar-width', 'none');
      await minutes.getByRole('option', { name: '09', exact: true }).focus();
      await page.keyboard.press('End');
      await expect(minutes.getByRole('option', { name: '23', exact: true })).toBeFocused();
      await expect.poll(() => minutes.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
    }
    await page.keyboard.press('Escape');
  }
});

test('drawer body and independent virtual rows reuse scrollbars and preserve surrounding layout', async ({
  page,
}) => {
  const rows = page.getByRole('region', { name: 'Virtual rows' });
  await expect(rows.locator('..').getByRole('scrollbar')).toBeAttached();
  await rows.evaluate((node) => {
    node.scrollTop = 2200;
  });
  await expect(rows.getByText('Option 55', { exact: true })).toBeAttached();
  await page.getByRole('button', { name: 'Open scrolling drawer' }).click();
  const drawer = page.getByRole('dialog', { name: 'Scrolling drawer' });
  await expect(drawer).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const body = drawer.locator('.leaf-drawer__body');
  const heading = drawer.getByRole('heading');
  const before = await heading.boundingBox();
  await dragVertical(body);
  await expect
    .poll(() => body.locator('.leaf-scrollbar__viewport').evaluate((node) => node.scrollTop))
    .toBeGreaterThan(100);
  expect(await heading.boundingBox()).toEqual(before);
  await expect(drawer.getByText('Pinned footer')).toBeVisible();
});
