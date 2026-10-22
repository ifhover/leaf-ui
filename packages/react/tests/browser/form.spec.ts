import { expect, test } from '@playwright/test';

for (const method of ['typing', 'replacement'] as const) {
  test(`keeps the edited value after validation during ${method}`, async ({ page }) => {
    await page.goto('/?fixture=form');
    const form = page.getByRole('form', { name: 'Profile' });
    const input = form.getByRole('textbox', { name: 'Name', exact: true });
    await input.fill('');
    await form.getByRole('button', { name: 'Save profile', exact: true }).click();
    await expect(form.getByRole('alert')).toBeVisible();
    await expect(input).toBeFocused();

    if (method === 'typing') await input.pressSequentially('Leaf Garden');
    else await input.fill('Leaf Garden');
    await expect(input).toHaveValue('Leaf Garden');
    await expect(form.getByRole('alert')).toHaveCount(0);
    await form.getByRole('button', { name: 'Save profile', exact: true }).click();
    await expect(form.getByLabel('Saved name')).toHaveText('Leaf Garden');

    await form.getByRole('button', { name: 'Reset profile', exact: true }).click();
    await expect(input).toHaveValue('Leaf Studio');
    await expect(form.getByLabel('Saved name')).toBeEmpty();
  });
}

for (const [name, query, width] of [
  ['horizontal', '', 1100],
  ['vertical', '&layout=vertical', 1100],
  ['stacked mobile', '', 375],
  ['compact mobile', '&layout=vertical&compact=1', 375],
  ['large text with small gap', '&layout=vertical&large-text=1&small-gap=1', 1100],
  ['nested fields', '&layout=vertical&nested=1', 1100],
] as const) {
  test(`help stays in normal flow and preserves field spacing: ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?fixture=form-help${query}`);
    const form = page.getByRole('form', { name: 'Help spacing' });
    const primary = form.getByRole('textbox', { name: 'Primary', exact: true });
    const geometry = () =>
      form.evaluate((node) => {
        const first = node.querySelector('.leaf-form-field') as HTMLElement;
        const next = node
          .querySelector('input[name="next"]')
          ?.closest('.leaf-form-field') as HTMLElement;
        const last = node
          .querySelector('input[name="last"]')
          ?.closest('.leaf-form-field') as HTMLElement;
        const description = first.querySelector('.leaf-form-field__description');
        const lastDescription = last.querySelector('.leaf-form-field__description') as HTMLElement;
        const nextDescription = next.querySelector('.leaf-form-field__description') as HTMLElement;
        const hint = description?.getBoundingClientRect();
        return {
          fieldGap: Number.parseFloat(getComputedStyle(node).rowGap),
          nextTop: next.getBoundingClientRect().top - first.getBoundingClientRect().top,
          gapAfterHint: hint ? next.getBoundingClientRect().top - hint.bottom : null,
          hintHeight: hint?.height ?? 0,
          lineHeight: description ? Number.parseFloat(getComputedStyle(description).lineHeight) : 0,
          formBottom: node.getBoundingClientRect().bottom,
          lastHintBottom: lastDescription.getBoundingClientRect().bottom,
          nextHintBottom: nextDescription.getBoundingClientRect().bottom,
          lastTop: last.getBoundingClientRect().top,
        };
      });
    const baseline = await geometry();
    await page.getByRole('button', { name: 'One line', exact: true }).click();
    await expect(primary).toHaveAccessibleDescription('A short hint.');
    const short = await geometry();
    expect(short.hintHeight).toBeCloseTo(short.lineHeight, 0);
    expect(short.nextTop - baseline.nextTop).toBeGreaterThanOrEqual(short.hintHeight);
    expect(short.gapAfterHint).toBeCloseTo(short.fieldGap, 0);

    await page.getByRole('button', { name: 'Wrapped help', exact: true }).click();
    const wrapped = await geometry();
    expect(wrapped.hintHeight).toBeGreaterThan(short.hintHeight);
    expect(wrapped.nextTop - short.nextTop).toBeCloseTo(wrapped.hintHeight - short.hintHeight, 0);
    expect(wrapped.gapAfterHint).toBeCloseTo(wrapped.fieldGap, 0);
    expect(wrapped.lastHintBottom).toBeLessThanOrEqual(wrapped.formBottom + 0.5);
    expect(wrapped.nextHintBottom).toBeLessThanOrEqual(wrapped.lastTop + 0.5);
    const after = await page.getByTestId('after-form').boundingBox();
    expect(after?.y).toBeGreaterThanOrEqual(wrapped.lastHintBottom);

    await page.getByRole('button', { name: 'Show error', exact: true }).click();
    await expect(primary).toHaveAccessibleDescription('Check this value.');
    await expect(form.getByRole('alert')).toHaveText('Check this value.');
    const error = await geometry();
    expect(error.nextTop - baseline.nextTop).toBeGreaterThanOrEqual(error.hintHeight);

    await page.getByRole('button', { name: 'Long address', exact: true }).click();
    expect((await geometry()).gapAfterHint).toBeGreaterThanOrEqual(-0.5);
    expect(await form.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(
      1,
    );

    await page.getByRole('button', { name: 'No help', exact: true }).click();
    await expect(primary).not.toHaveAttribute('aria-describedby');
    expect((await geometry()).nextTop).toBeCloseTo(baseline.nextTop, 0);
  });
}

test('vertical fields and labels align to the integer line-height grid', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto('/?fixture=form-help&layout=vertical');
  const field = page.locator('.leaf-form-field').first();
  const label = field.locator('.leaf-form-field__label');
  const description = field.locator('.leaf-form-field__description');
  await expect(label).toHaveCSS('line-height', '20px');
  const fieldHeight = await field.evaluate((node) => node.getBoundingClientRect().height);
  expect(fieldHeight).toBe(60);
  await page.getByRole('button', { name: 'One line', exact: true }).click();
  await expect(description).toHaveCSS('line-height', '18px');
});
