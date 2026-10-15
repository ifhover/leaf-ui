import { expect, test } from '@playwright/test';
import axe from 'axe-core';

for (const appearance of ['light', 'dark']) {
  test(`default scopes, size overrides and forced disabled in ${appearance}`, async ({
    page,
  }, info) => {
    await page.goto(`/?fixture=component-defaults&theme=${appearance}`);
    const inherited = page.getByRole('button', { name: 'Inherited', exact: true });
    await expect(inherited).toHaveClass(/leaf-button--outline/u);
    await expect(inherited).toHaveCSS('height', '30px');
    await expect(page.getByRole('button', { name: 'Nested override' })).toHaveCSS('height', '42px');
    await expect(page.getByRole('button', { name: 'Instance override' })).toHaveCSS(
      'height',
      '36px',
    );
    await expect(page.getByRole('button', { name: 'Outside defaults' })).toHaveClass(
      /leaf-button--solid/u,
    );
    await expect(
      page.getByRole('textbox', { name: 'Disabled search', exact: true }),
    ).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Disabled find' })).toBeDisabled();
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () =>
      (await (window as unknown as { axe: typeof axe }).axe.run(document.body)).violations.map(
        (item) => item.id,
      ),
    );
    expect(violations).toEqual([]);
    await page.screenshot({
      path: `.quality/component-defaults-${appearance}-${info.project.name}.png`,
      fullPage: true,
    });
  });
}

test('updating defaults preserves native inputs, search values and current reset defaults', async ({
  page,
}) => {
  await page.goto('/?fixture=component-defaults');
  const name = page.getByRole('textbox', { name: 'Name', exact: true });
  const search = page.getByRole('textbox', { name: 'Search', exact: true });
  await expect(name).toHaveValue('Leaf');
  await search.fill('Leaf search');
  await name.fill('Edited name');
  await page.getByRole('button', { name: 'Update defaults' }).click();
  await expect(name).toHaveValue('Edited name');
  await expect(search).toHaveValue('Leaf search');
  await expect(page.getByRole('button', { name: 'Find', exact: true })).toHaveCSS('height', '42px');
  await search.press('Enter');
  await expect(page.getByRole('status', { name: 'Search result' })).toHaveText('Leaf search');
  await page.getByRole('button', { name: 'Reset inputs' }).click();
  await expect(name).toHaveValue('Updated');
  await expect(search).toHaveValue('Updated');
  await page.getByRole('button', { name: 'Find', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Search result' })).toHaveText('Updated');
  const form = page.getByRole('form', { name: 'Defaults form' });
  expect(
    await form.evaluate((node) => Object.fromEntries(new FormData(node as HTMLFormElement))),
  ).toEqual({ name: 'Updated', search: 'Updated' });
});

test('Select search defaults retain instance-owned multi-select values', async ({ page }) => {
  await page.goto('/?fixture=component-defaults');
  const input = page.getByRole('combobox', { name: 'Libraries' });
  await input.fill('rea');
  const popup = page.getByRole('listbox');
  await expect(popup).toHaveClass(/defaults-popup/u);
  await expect(popup.getByRole('option', { name: 'Leaf', exact: true })).toHaveCount(0);
  await popup.getByRole('option', { name: 'React', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Selected libraries' })).toHaveText('react');
  await expect(popup).toBeVisible();
  await input.press('Escape');
  await expect(popup).toBeHidden();
});

test('Modal portal inherits defaults and preserves keyboard/focus behavior', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?fixture=component-defaults');
  const trigger = page.getByRole('button', { name: 'Open defaults modal' });
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Default modal' });
  await expect(dialog).toHaveCSS('width', '520px');
  await expect(dialog).toHaveAccessibleDescription('Modal defaults only');
  await expect(dialog.getByRole('button', { name: 'Portal button' })).toHaveCSS('height', '30px');
  await expect(dialog.getByRole('button', { name: 'Portal button' })).toHaveClass(
    /leaf-button--outline/u,
  );
  await expect(dialog.getByRole('textbox', { name: 'Modal name' })).toHaveValue('Leaf');
  const select = dialog.getByRole('combobox', { name: 'Modal library' });
  await select.fill('rea');
  await page.getByRole('option', { name: 'React', exact: true }).click();
  await expect(select).toBeFocused();
  await expect(dialog).toBeVisible();
  await select.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});

test('Confirm retains its own compact dialog and footer under Modal defaults', async ({ page }) => {
  await page.goto('/?fixture=component-defaults');
  await page.getByRole('button', { name: 'Confirm request', exact: true }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Delete item' });
  await expect(dialog).toHaveCSS('width', '420px');
  await expect(dialog).toHaveAccessibleDescription('Cannot undo.');
  await expect(dialog.getByText('Modal defaults only')).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'OK' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();
});

test('cleared defaults restore editable local inputs, builtin buttons and native reset', async ({
  page,
}) => {
  await page.goto('/?fixture=component-defaults');
  const form = page.getByRole('form', { name: 'Cleared defaults' });
  const input = form.getByRole('textbox', { name: 'Local reset input' });
  await expect(input).toBeEditable();
  await expect(input).toHaveAttribute('type', 'text');
  await input.fill('Changed locally');
  const reset = form.getByRole('button', { name: 'Reset local input' });
  await expect(reset).toHaveCSS('height', '36px');
  await expect(reset).toHaveClass(/leaf-button--solid/u);
  await reset.click();
  await expect(input).toHaveValue('Editable');
});

test('global defaults cannot change composite button actions, page size or command search', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?fixture=component-defaults');
  const section = page.getByRole('region', { name: 'Component boundaries' });
  const main = section.getByRole('button', { name: 'Split primary' });
  const menu = section.getByRole('button', { name: 'Split menu' });
  await expect(main).toBeEnabled();
  await expect(menu).toBeEnabled();
  await expect(menu).toHaveAttribute('type', 'button');
  await expect(main).toHaveCSS('height', '30px');
  await expect(menu).toHaveCSS('height', '30px');
  await menu.click();
  await page.getByRole('menuitem', { name: 'Copy item' }).click();
  await expect(section.getByLabel('Copied item')).toHaveText('true');
  await expect(section.getByLabel('Boundary submissions')).toHaveText('0');
  const chooser = page.waitForEvent('filechooser');
  await section.getByRole('button', { name: 'Choose boundary file' }).click();
  await (await chooser).setFiles([]);
  await expect(section.getByLabel('Boundary submissions')).toHaveText('0');
  await main.click();
  await expect(section.getByLabel('Boundary submissions')).toHaveText('1');
  await section.getByRole('combobox', { name: 'Page size' }).click();
  await page.getByRole('option', { name: '20 / page' }).click();
  await expect(section.getByLabel('Boundary page size')).toHaveText('20');
  await section.getByRole('button', { name: 'Open boundary commands' }).click();
  const dialog = page.getByRole('dialog', { name: 'Command search' });
  const search = dialog.getByRole('combobox');
  await expect(search).toBeEditable();
  await expect(search).toHaveAttribute('type', 'text');
  await search.fill('copy');
  await expect(dialog.getByRole('option', { name: 'Copy command' })).toBeVisible();
  await expect(dialog.getByRole('option', { name: 'Save command' })).toHaveCount(0);
  await search.press('Escape');
  await expect(dialog).toBeHidden();
  expect(errors).toEqual([]);
});

test('expanded field and display defaults retain local state and isolate internal controls', async ({
  page,
}) => {
  await page.goto('/?fixture=component-defaults');
  const region = page.getByRole('region', { name: 'Expanded defaults' });
  await expect(region.getByLabel('Independent choice')).toBeChecked();
  await expect(region.getByLabel('Group A', { exact: true })).toBeChecked();
  await expect(region.getByLabel('Group B', { exact: true })).not.toBeChecked();
  await region.getByLabel('Group B', { exact: true }).check();
  const form = region.getByRole('form');
  expect(
    await form.evaluate((node) => new FormData(node as HTMLFormElement).getAll('group')),
  ).toEqual(['a', 'b']);
  const amount = region.getByRole('spinbutton', { name: 'Amount', exact: true });
  await amount.fill('9');
  await region
    .getByRole('button', { name: 'Change expanded defaults' })
    .evaluate((node: HTMLButtonElement) => node.click());
  await expect(amount).toHaveValue('9');
  await expect(amount).toBeFocused();
  await expect(region.locator('.leaf-input-number')).toHaveClass(/leaf-input-number--lg/u);
  const card = region.getByLabel('Embedded tabs card');
  await expect(card).toHaveClass(/leaf-card--sm/u);
  await expect(card.locator('.leaf-tabs')).toHaveClass(/leaf-tabs--sm/u);
  await expect(card.getByRole('button', { name: /close/iu })).toHaveCount(0);
  await expect(region.getByTestId('public-default-tabs')).toHaveClass(/leaf-tabs--lg/u);
  const first = await region.getByRole('button', { name: 'Grid first' }).boundingBox();
  const second = await region.getByRole('button', { name: 'Grid second' }).boundingBox();
  expect(first?.y).toBe(second?.y);
  expect(second?.x).toBeGreaterThan(first?.x ?? 0);
  await expect(region.locator('.leaf-transfer .public-list-default')).toHaveCount(0);
  await expect(region.getByText('Transfer row', { exact: true })).toBeVisible();
  const date = region.getByRole('combobox', { name: 'Event date' });
  await date.fill('2026-10-15');
  await date.press('Enter');
  await expect(date).toHaveValue('2026-10-15');
  await date.click();
  await expect(page.locator('.regional-date-panel')).toBeVisible();
  await date.press('Escape');
  await expect(date).toBeFocused();
});

test('service requests keep options but content follows the calling region', async ({ page }) => {
  await page.goto('/?fixture=component-defaults');
  const region = page.getByRole('region', { name: 'Expanded defaults' });
  await region.getByRole('button', { name: 'Regional message', exact: true }).click();
  await expect(page.locator('.leaf-tag').filter({ hasText: 'Message content' })).toHaveClass(
    /leaf-tag--solid/u,
  );
  await expect(page.locator('.leaf-message').filter({ hasText: 'Message content' })).toHaveClass(
    /leaf-message--warning/u,
  );
  await region.getByRole('button', { name: 'Regional notification', exact: true }).click();
  await expect(page.locator('.leaf-notification-region--bottom-left')).toContainText(
    'Regional notice',
  );
  await region.getByRole('button', { name: 'Regional confirm request' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Regional confirm' });
  await expect(dialog.getByRole('button', { name: 'Proceed', exact: true })).toBeVisible();
  await expect(dialog.locator('.leaf-tag')).toHaveClass(/leaf-tag--solid/u);
  await region
    .getByRole('button', { name: 'Change expanded defaults' })
    .evaluate((node: HTMLButtonElement) => node.click());
  await expect(dialog.getByRole('button', { name: 'Proceed', exact: true })).toBeVisible();
  await expect(dialog.locator('.leaf-tag')).toHaveClass(/leaf-tag--soft/u);
  await expect(page.locator('.leaf-tag').filter({ hasText: 'Message content' })).toHaveClass(
    /leaf-tag--soft/u,
  );
  await expect(page.locator('.leaf-tag').filter({ hasText: 'Notice content' })).toHaveClass(
    /leaf-tag--soft/u,
  );
  await dialog.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(dialog).toBeHidden();
  await region.getByRole('button', { name: 'Regional confirm request' }).click();
  await expect(dialog.getByRole('button', { name: 'Proceed now', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Back', exact: true }).click();
});

test('task loading bar snapshots presentation until the next batch', async ({ page }) => {
  await page.goto('/?fixture=component-defaults');
  const region = page.getByRole('region', { name: 'Expanded defaults' });
  await region.getByRole('button', { name: 'Start scoped task' }).click();
  const bar = page.getByRole('progressbar', { name: 'Page loading progress' });
  await expect(bar).toHaveCSS('height', '5px');
  await expect(bar.locator('span')).toHaveCSS('background-color', 'rgb(29, 155, 240)');
  await region.getByRole('button', { name: 'Change expanded defaults' }).click();
  await expect(bar).toHaveCSS('height', '5px');
  await region.getByRole('button', { name: 'Finish scoped task' }).click();
  await expect(bar).toBeHidden();
  await region.getByRole('button', { name: 'Start scoped task' }).click();
  await expect(bar).toHaveCSS('height', '7px');
  await expect(bar.locator('span')).toHaveCSS('background-color', 'rgb(207, 11, 45)');
  await region.getByRole('button', { name: 'Finish scoped task' }).click();
});
