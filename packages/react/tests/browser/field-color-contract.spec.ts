import { TinyColor } from '@ctrl/tinycolor';
import { expect, type Locator, type Page, test } from '@playwright/test';

const rgb = (value: string) => new TinyColor(value).toRgbString();
const globalBorder = rgb('#7a5c00');
const nestedPrimary = rgb('#c026d3');
const nestedSurface = rgb('#fff7ed');
const rootPrimary = rgb('#1265f5');
const familyKinds = [
  'auto-complete',
  'input-number',
  'textarea',
  'mentions',
  'cascader',
  'tree-select',
  'color-picker',
  'date-picker',
] as const;
type FamilyKind = (typeof familyKinds)[number];
const familyShells: Record<FamilyKind, string> = {
  'auto-complete': 'leaf-autocomplete',
  'input-number': 'leaf-input-number',
  textarea: 'leaf-textarea',
  mentions: 'leaf-mentions',
  cascader: 'leaf-cascader',
  'tree-select': 'leaf-tree-select',
  'color-picker': 'leaf-color-picker',
  'date-picker': 'leaf-date-picker',
};

function field(page: Page, name: string, kind: 'leaf-input' | 'leaf-select' | 'leaf-textarea') {
  return page.locator(`[data-field="${name}"] .${kind}`);
}

function familyShell(page: Page, name: string, kind: FamilyKind) {
  return page.locator(`[data-field="${name}"] .${familyShells[kind]}`);
}

function familyControl(page: Page, name: string, kind: FamilyKind) {
  const scope = page.locator(`[data-field="${name}"]`);
  if (kind === 'input-number') return scope.getByRole('spinbutton');
  if (kind === 'textarea') return scope.getByRole('textbox');
  if (kind === 'color-picker') return scope.getByRole('button');
  return scope.getByRole('combobox');
}

function control(page: Page, name: string) {
  return page.getByLabel(name, { exact: true });
}

function selectControl(page: Page, name: string) {
  return page.getByRole('combobox', { name, exact: true });
}

async function resolveColor(locator: Locator, expression: string) {
  return locator.evaluate((node, value) => {
    const probe = document.createElement('span');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.color = value;
    (node.parentElement ?? document.body).append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, expression);
}

async function resolveVariable(locator: Locator, variable: `--leaf-${string}`) {
  return locator.evaluate((node, name) => {
    const probe = document.createElement('span');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    // Textarea cannot render a child probe; resolve its local custom property first.
    probe.style.color = getComputedStyle(node).getPropertyValue(name);
    (node.parentElement ?? document.body).append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, variable);
}

async function expectBorder(locator: Locator, expected: string) {
  await expect(locator).toHaveCSS('border-top-color', expected);
}

async function expectShellBorder(locator: Locator, expected: string) {
  await expect(locator).toHaveCSS('border-top-width', '1px');
  for (const side of ['top', 'right', 'bottom', 'left']) {
    await expect(locator).toHaveCSS(`border-${side}-color`, expected);
  }
}

async function focusOrOpenFamily(page: Page, name: string, kind: FamilyKind) {
  const target = familyControl(page, name, kind);
  if (kind === 'auto-complete' || kind === 'input-number' || kind === 'textarea') {
    await target.focus();
    return;
  }
  if (kind === 'mentions') {
    await target.fill('@');
    await expect(target).toHaveAttribute('aria-expanded', 'true');
    return;
  }
  await target.click();
  await expect(target).toHaveAttribute('aria-expanded', 'true');
}

async function releaseFamily(page: Page, name: string, kind: FamilyKind) {
  const target = familyControl(page, name, kind);
  if (kind === 'mentions') {
    await target.fill('');
    await expect(target).toHaveAttribute('aria-expanded', 'false');
  } else if (kind !== 'input-number' && kind !== 'textarea') {
    await page.keyboard.press('Escape');
    await expect(target).toHaveAttribute('aria-expanded', 'false');
  }
  await familyShell(page, name, kind).evaluate((node) => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && node.contains(active)) active.blur();
  });
  await page.mouse.move(0, 0);
}

async function shadow(locator: Locator) {
  return locator.evaluate((node) => getComputedStyle(node).boxShadow);
}

async function expectNoHalo(locator: Locator, restingShadow: string) {
  await expect(locator).toHaveCSS('outline-style', 'none');
  expect(await shadow(locator)).toBe(restingShadow);
}

for (const appearance of ['light', 'dark'] as const) {
  test.describe(appearance, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/?fixture=field-color-contract&theme=${appearance}`);
      await expect(page.locator('[data-field-section="default"]')).toBeVisible();
    });

    test('Input and Select share default, hover, validation, and disabled borders', async ({
      page,
    }) => {
      const input = field(page, 'default-input', 'leaf-input');
      const select = field(page, 'default-select', 'leaf-select');
      const resting = await resolveColor(
        input,
        'var(--leaf-frame-border-color, var(--leaf-color-border))',
      );
      const primary = await resolveColor(input, 'var(--leaf-color-primary)');
      expect(primary).toBe(rootPrimary);
      await expectBorder(input, resting);
      await expectBorder(select, resting);

      await input.hover();
      await expectBorder(input, resting);
      await select.hover();
      await expectBorder(select, resting);

      const inputShadow = await shadow(input);
      await page.mouse.move(0, 0);
      await control(page, 'Default input').focus();
      await expectBorder(input, primary);
      await expectNoHalo(input, inputShadow);
      await control(page, 'Default input').blur();
      await expectBorder(input, resting);

      const selectShadow = await shadow(select);
      await selectControl(page, 'Default select').click();
      await expect(selectControl(page, 'Default select')).toHaveAttribute('aria-expanded', 'true');
      await expectBorder(select, primary);
      await expectNoHalo(select, selectShadow);
      await page.keyboard.press('Escape');
      await page.mouse.move(0, 0);
      await selectControl(page, 'Default select').blur();
      await expectBorder(select, resting);

      const danger = await resolveColor(input, 'var(--leaf-color-danger)');
      const warning = await resolveColor(input, 'var(--leaf-color-warning)');
      for (const name of ['error-input', 'error-select']) {
        await expectBorder(
          field(page, name, name.endsWith('input') ? 'leaf-input' : 'leaf-select'),
          danger,
        );
      }
      for (const name of ['warning-input', 'warning-select']) {
        await expectBorder(
          field(page, name, name.endsWith('input') ? 'leaf-input' : 'leaf-select'),
          warning,
        );
      }
      await control(page, 'Error input').focus();
      await expectBorder(field(page, 'error-input', 'leaf-input'), danger);
      await expect(field(page, 'error-input', 'leaf-input')).toHaveCSS('outline-style', 'none');
      await control(page, 'Error input').blur();
      await expectBorder(field(page, 'error-input', 'leaf-input'), danger);
      await selectControl(page, 'Error select').click();
      await expectBorder(field(page, 'error-select', 'leaf-select'), danger);
      await expect(field(page, 'error-select', 'leaf-select')).toHaveCSS('outline-style', 'none');
      await page.keyboard.press('Escape');
      await page.mouse.move(0, 0);
      await selectControl(page, 'Error select').blur();
      await expectBorder(field(page, 'error-select', 'leaf-select'), danger);
      await control(page, 'Warning input').focus();
      await expectBorder(field(page, 'warning-input', 'leaf-input'), warning);
      await expect(field(page, 'warning-input', 'leaf-input')).toHaveCSS('outline-style', 'none');
      await control(page, 'Warning input').blur();
      await expectBorder(field(page, 'warning-input', 'leaf-input'), warning);
      await selectControl(page, 'Warning select').click();
      await expectBorder(field(page, 'warning-select', 'leaf-select'), warning);
      await expect(field(page, 'warning-select', 'leaf-select')).toHaveCSS('outline-style', 'none');
      await page.keyboard.press('Escape');
      await page.mouse.move(0, 0);
      await selectControl(page, 'Warning select').blur();
      await expectBorder(field(page, 'warning-select', 'leaf-select'), warning);

      await expectBorder(field(page, 'disabled-input', 'leaf-input'), resting);
      await expectBorder(field(page, 'disabled-select', 'leaf-select'), resting);
      const disabledSelect = selectControl(page, 'Disabled select');
      await expect(disabledSelect).toHaveAttribute('aria-expanded', 'false');
      await disabledSelect.click({ force: true });
      await expect(disabledSelect).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByRole('listbox', { name: 'Disabled select' })).toHaveCount(0);
      await expectBorder(field(page, 'disabled-select', 'leaf-select'), resting);

      const textarea = field(page, 'multiline-textarea', 'leaf-textarea');
      const textareaControl = control(page, 'Multiline textarea');
      await expectBorder(textarea, resting);
      await textarea.hover();
      await expectBorder(textarea, resting);
      const textareaShadow = await shadow(textarea);
      await page.mouse.move(0, 0);
      await textareaControl.focus();
      await expectBorder(textarea, primary);
      await expectNoHalo(textarea, textareaShadow);
      await expectBorder(field(page, 'multiline-error-textarea', 'leaf-textarea'), danger);
      await expectBorder(field(page, 'multiline-warning-textarea', 'leaf-textarea'), warning);
      await expectBorder(field(page, 'multiline-disabled-textarea', 'leaf-textarea'), resting);
    });

    test('global borders and nested themes keep their scoped precedence', async ({ page }) => {
      const globalInput = field(page, 'global-input', 'leaf-input');
      const globalSelect = field(page, 'global-select', 'leaf-select');
      const primary = await resolveColor(globalInput, 'var(--leaf-color-primary)');
      expect(primary).toBe(rootPrimary);
      await expectBorder(globalInput, globalBorder);
      await expectBorder(globalSelect, globalBorder);
      await globalInput.hover();
      await expectBorder(globalInput, globalBorder);
      await globalSelect.hover();
      await expectBorder(globalSelect, globalBorder);

      const inputShadow = await shadow(globalInput);
      await page.mouse.move(0, 0);
      await control(page, 'Global border input').focus();
      await expectBorder(globalInput, primary);
      await expectNoHalo(globalInput, inputShadow);
      await control(page, 'Global border input').blur();
      await expectBorder(globalInput, globalBorder);
      const selectShadow = await shadow(globalSelect);
      await selectControl(page, 'Global border select').click();
      await expectBorder(globalSelect, primary);
      await expectNoHalo(globalSelect, selectShadow);
      await page.keyboard.press('Escape');
      await page.mouse.move(0, 0);
      await selectControl(page, 'Global border select').blur();
      await expectBorder(globalSelect, globalBorder);

      const danger = await resolveColor(globalInput, 'var(--leaf-color-danger)');
      const warning = await resolveColor(globalInput, 'var(--leaf-color-warning)');
      await expectBorder(field(page, 'global-error-input', 'leaf-input'), danger);
      await expectBorder(field(page, 'global-error-select', 'leaf-select'), danger);
      await expectBorder(field(page, 'global-warning-input', 'leaf-input'), warning);
      await expectBorder(field(page, 'global-warning-select', 'leaf-select'), warning);
      await control(page, 'Global error input').focus();
      await expectBorder(field(page, 'global-error-input', 'leaf-input'), danger);
      await control(page, 'Global error input').blur();
      await expectBorder(field(page, 'global-error-input', 'leaf-input'), danger);
      await selectControl(page, 'Global warning select').click();
      await expectBorder(field(page, 'global-warning-select', 'leaf-select'), warning);
      await page.keyboard.press('Escape');
      await page.mouse.move(0, 0);
      await selectControl(page, 'Global warning select').blur();
      await expectBorder(field(page, 'global-warning-select', 'leaf-select'), warning);
      await expectBorder(field(page, 'global-disabled-input', 'leaf-input'), globalBorder);
      await expectBorder(field(page, 'global-disabled-select', 'leaf-select'), globalBorder);

      const nestedInput = field(page, 'nested-input', 'leaf-input');
      const nestedSelect = field(page, 'nested-select', 'leaf-select');
      const nestedRest = await resolveColor(
        nestedInput,
        'var(--leaf-frame-border-color, var(--leaf-color-border))',
      );
      await expectBorder(nestedInput, nestedRest);
      await expectBorder(nestedSelect, nestedRest);
      await nestedInput.hover();
      await expectBorder(nestedInput, nestedRest);
      await nestedSelect.hover();
      await expectBorder(nestedSelect, nestedRest);

      const nestedInputShadow = await shadow(nestedInput);
      await page.mouse.move(0, 0);
      await control(page, 'Nested input').focus();
      await expectBorder(nestedInput, nestedPrimary);
      await expectNoHalo(nestedInput, nestedInputShadow);
      await control(page, 'Nested input').blur();
      await expectBorder(nestedInput, nestedRest);
      const nestedSelectShadow = await shadow(nestedSelect);
      await selectControl(page, 'Nested select').click();
      await expectBorder(nestedSelect, nestedPrimary);
      await expectNoHalo(nestedSelect, nestedSelectShadow);
      await page.keyboard.press('Escape');
      await page.mouse.move(0, 0);
      await selectControl(page, 'Nested select').blur();
      await expectBorder(nestedSelect, nestedRest);

      const nestedDanger = await resolveColor(nestedInput, 'var(--leaf-color-danger)');
      const nestedWarning = await resolveColor(nestedInput, 'var(--leaf-color-warning)');
      await expectBorder(field(page, 'nested-error-input', 'leaf-input'), nestedDanger);
      await expectBorder(field(page, 'nested-error-select', 'leaf-select'), nestedDanger);
      await expectBorder(field(page, 'nested-warning-input', 'leaf-input'), nestedWarning);
      await expectBorder(field(page, 'nested-warning-select', 'leaf-select'), nestedWarning);
      await expectBorder(field(page, 'nested-disabled-input', 'leaf-input'), nestedRest);
      await expectBorder(field(page, 'nested-disabled-select', 'leaf-select'), nestedRest);

      await control(page, 'Default input').focus();
      await expectBorder(field(page, 'default-input', 'leaf-input'), rootPrimary);
    });

    test('component and state overrides stay on their component and state', async ({ page }) => {
      const inputRest = rgb('#6b21a8');
      const inputHover = rgb('#7c3aed');
      const inputFocus = rgb('#4c1d95');
      const inputDisabled = rgb('#a78bfa');
      const selectRest = rgb('#0f766e');
      const selectHover = rgb('#0d9488');
      const selectFocus = rgb('#115e59');
      const selectDisabled = rgb('#5eead4');

      const overriddenInput = field(page, 'override-input', 'leaf-input');
      await expectBorder(overriddenInput, inputRest);
      await overriddenInput.hover();
      await expectBorder(overriddenInput, inputHover);
      const inputShadow = await shadow(overriddenInput);
      await page.mouse.move(0, 0);
      await control(page, 'Overridden input').focus();
      await expectBorder(overriddenInput, inputFocus);
      await expectNoHalo(overriddenInput, inputShadow);
      await control(page, 'Overridden input').blur();
      await expectBorder(overriddenInput, inputRest);
      await expectBorder(field(page, 'override-input-disabled', 'leaf-input'), inputDisabled);

      const inputSiblingSelect = field(page, 'input-override-sibling-select', 'leaf-select');
      await expectBorder(inputSiblingSelect, globalBorder);
      await inputSiblingSelect.hover();
      await expectBorder(inputSiblingSelect, globalBorder);
      const siblingSelectShadow = await shadow(inputSiblingSelect);
      await selectControl(page, 'Input override sibling select').click();
      await expectBorder(inputSiblingSelect, rootPrimary);
      await expectNoHalo(inputSiblingSelect, siblingSelectShadow);
      await page.keyboard.press('Escape');
      await page.mouse.move(0, 0);
      await selectControl(page, 'Input override sibling select').blur();
      await expectBorder(inputSiblingSelect, globalBorder);

      const overriddenSelect = field(page, 'override-select', 'leaf-select');
      await expectBorder(overriddenSelect, selectRest);
      await overriddenSelect.hover();
      await expectBorder(overriddenSelect, selectHover);
      const selectShadow = await shadow(overriddenSelect);
      await page.mouse.move(0, 0);
      await selectControl(page, 'Overridden select').click();
      await expectBorder(overriddenSelect, selectFocus);
      await expectNoHalo(overriddenSelect, selectShadow);
      await page.keyboard.press('Escape');
      await page.mouse.move(0, 0);
      await selectControl(page, 'Overridden select').blur();
      await expectBorder(overriddenSelect, selectRest);
      await expectBorder(field(page, 'override-select-disabled', 'leaf-select'), selectDisabled);

      const selectSiblingInput = field(page, 'select-override-sibling-input', 'leaf-input');
      await expectBorder(selectSiblingInput, globalBorder);
      await selectSiblingInput.hover();
      await expectBorder(selectSiblingInput, globalBorder);
      const siblingInputShadow = await shadow(selectSiblingInput);
      await control(page, 'Select override sibling input').focus();
      await expectBorder(selectSiblingInput, rootPrimary);
      await expectNoHalo(selectSiblingInput, siblingInputShadow);
      await control(page, 'Select override sibling input').blur();
      await expectBorder(selectSiblingInput, globalBorder);

      const defaultInput = field(page, 'default-input', 'leaf-input');
      const defaultBorder = await resolveColor(
        defaultInput,
        'var(--leaf-frame-border-color, var(--leaf-color-border))',
      );
      expect(defaultBorder).not.toBe(globalBorder);
      await control(page, 'Default input').focus();
      await expectBorder(defaultInput, rootPrimary);
      await control(page, 'Default input').blur();
      await expectBorder(defaultInput, defaultBorder);
    });

    test('field families share the resting shell and retain their focus and validation states', async ({
      page,
    }, testInfo) => {
      const textarea = field(page, 'multiline-textarea', 'leaf-textarea');
      const disabledTextarea = field(page, 'multiline-disabled-textarea', 'leaf-textarea');
      const resting = await resolveVariable(textarea, '--leaf-field-rest-border');
      const primary = await resolveColor(textarea, 'var(--leaf-color-primary)');
      const danger = await resolveColor(textarea, 'var(--leaf-color-danger)');
      const warning = await resolveColor(textarea, 'var(--leaf-color-warning)');
      const disabledBackground = await disabledTextarea.evaluate(
        (node) => getComputedStyle(node).backgroundColor,
      );

      expect(primary).toBe(rootPrimary);
      await expectShellBorder(textarea, resting);

      for (const kind of familyKinds) {
        const name = `target-default-${kind}`;
        const shell = familyShell(page, name, kind);
        expect(await resolveVariable(shell, '--leaf-field-rest-border')).toBe(resting);
        expect(await resolveVariable(shell, '--leaf-field-color')).toBe(primary);

        await expectShellBorder(shell, resting);
        await shell.hover();
        await expectShellBorder(shell, resting);
        await page.mouse.move(0, 0);
        await focusOrOpenFamily(page, name, kind);
        await expectShellBorder(shell, primary);
        await expect(shell).toHaveCSS('outline-style', 'none');
        if (kind === 'textarea' || kind === 'mentions' || kind === 'input-number') {
          await shell.screenshot({ path: testInfo.outputPath(`${kind}-focused.png`) });
        }
        if (kind === 'mentions') await expect(shell).toHaveAttribute('data-open', 'true');
        if (kind === 'input-number') {
          await page.locator(`[data-field="${name}"]`).getByRole('button').first().focus();
          await expectShellBorder(shell, primary);
        }
        await releaseFamily(page, name, kind);
        await expectShellBorder(shell, resting);

        await expectShellBorder(familyShell(page, `target-error-${kind}`, kind), danger);
        await expectShellBorder(familyShell(page, `target-warning-${kind}`, kind), warning);
        const disabled = familyShell(page, `target-disabled-${kind}`, kind);
        await expectShellBorder(disabled, resting);
        await expect(disabled).toHaveCSS('background-color', disabledBackground);
        await expect(disabled).toHaveCSS('opacity', '0.55');

        const disabledControl = familyControl(page, `target-disabled-${kind}`, kind);
        await expect(disabledControl).toBeDisabled();
        if (kind !== 'input-number' && kind !== 'textarea') {
          await disabledControl.click({ force: true });
          await expect(disabledControl).toHaveAttribute('aria-expanded', 'false');
        }
      }

      for (const [name, kind, expected] of [
        ['target-error-date-picker', 'date-picker', danger],
        ['target-warning-tree-select', 'tree-select', warning],
        ['target-error-textarea', 'textarea', danger],
        ['target-warning-input-number', 'input-number', warning],
        ['target-error-mentions', 'mentions', danger],
        ['target-warning-mentions', 'mentions', warning],
      ] as const) {
        await focusOrOpenFamily(page, name, kind);
        await expectShellBorder(familyShell(page, name, kind), expected);
        await releaseFamily(page, name, kind);
      }
    });

    test('remaining field families keep scoped global, nested, and component override precedence', async ({
      page,
    }) => {
      const globalDate = familyShell(page, 'target-global-date-picker', 'date-picker');
      const primary = await resolveColor(globalDate, 'var(--leaf-color-primary)');
      const danger = await resolveColor(globalDate, 'var(--leaf-color-danger)');
      const warning = await resolveColor(globalDate, 'var(--leaf-color-warning)');

      expect(primary).toBe(rootPrimary);
      for (const kind of familyKinds) {
        const shell = familyShell(page, `target-global-${kind}`, kind);
        expect(await resolveVariable(shell, '--leaf-field-rest-border')).toBe(globalBorder);
        expect(await resolveVariable(shell, '--leaf-field-color')).toBe(primary);
        await expectShellBorder(shell, globalBorder);
      }
      for (const kind of familyKinds) {
        const name = `target-global-${kind}`;
        await focusOrOpenFamily(page, name, kind);
        await expectShellBorder(familyShell(page, name, kind), primary);
        await releaseFamily(page, name, kind);
        await expectShellBorder(familyShell(page, name, kind), globalBorder);
      }

      await focusOrOpenFamily(page, 'target-global-error-date-picker', 'date-picker');
      await expectShellBorder(
        familyShell(page, 'target-global-error-date-picker', 'date-picker'),
        danger,
      );
      await releaseFamily(page, 'target-global-error-date-picker', 'date-picker');
      await focusOrOpenFamily(page, 'target-global-warning-tree-select', 'tree-select');
      await expectShellBorder(
        familyShell(page, 'target-global-warning-tree-select', 'tree-select'),
        warning,
      );
      await releaseFamily(page, 'target-global-warning-tree-select', 'tree-select');
      const globalDisabled = familyControl(page, 'target-global-disabled-cascader', 'cascader');
      await expect(globalDisabled).toBeDisabled();
      await expect(globalDisabled).toHaveAttribute('aria-expanded', 'false');
      await expectShellBorder(
        familyShell(page, 'target-global-disabled-cascader', 'cascader'),
        globalBorder,
      );

      const nestedDate = familyShell(page, 'target-nested-date-picker', 'date-picker');
      const nestedColor = await resolveColor(nestedDate, 'var(--leaf-color-primary)');
      const nestedDanger = await resolveColor(nestedDate, 'var(--leaf-color-danger)');
      const nestedWarning = await resolveColor(nestedDate, 'var(--leaf-color-warning)');
      const nestedResting = await resolveVariable(
        familyShell(page, 'target-nested-auto-complete', 'auto-complete'),
        '--leaf-field-rest-border',
      );
      expect(nestedColor).toBe(nestedPrimary);

      for (const kind of familyKinds) {
        const shell = familyShell(page, `target-nested-${kind}`, kind);
        expect(await resolveVariable(shell, '--leaf-field-rest-border')).toBe(nestedResting);
        expect(await resolveVariable(shell, '--leaf-field-color')).toBe(nestedColor);
        await expectShellBorder(shell, nestedResting);
        await expect(shell).toHaveCSS('background-color', nestedSurface);
      }
      for (const kind of familyKinds) {
        const name = `target-nested-${kind}`;
        await focusOrOpenFamily(page, name, kind);
        await expectShellBorder(familyShell(page, name, kind), nestedColor);
        await expect(familyShell(page, name, kind)).toHaveCSS('background-color', nestedSurface);
        await releaseFamily(page, name, kind);
      }
      await expectShellBorder(
        familyShell(page, 'target-nested-error-date-picker', 'date-picker'),
        nestedDanger,
      );
      await expectShellBorder(
        familyShell(page, 'target-nested-warning-tree-select', 'tree-select'),
        nestedWarning,
      );
      await expectShellBorder(
        familyShell(page, 'target-nested-disabled-cascader', 'cascader'),
        nestedResting,
      );

      const overrideExpectations: Record<FamilyKind, { focus: string; rest: string }> = {
        'auto-complete': { rest: rgb('#9a3412'), focus: rgb('#7c2d12') },
        'input-number': { rest: rgb('#4d7c0f'), focus: rgb('#3f6212') },
        textarea: { rest: rgb('#4338ca'), focus: rgb('#3730a3') },
        mentions: { rest: rgb('#4338ca'), focus: rgb('#3730a3') },
        cascader: { rest: rgb('#a21caf'), focus: rgb('#86198f') },
        'tree-select': { rest: rgb('#0369a1'), focus: rgb('#075985') },
        'color-picker': { rest: rgb('#b45309'), focus: rgb('#92400e') },
        'date-picker': { rest: rgb('#be123c'), focus: rgb('#9f1239') },
      };
      for (const kind of familyKinds) {
        const name = `target-override-${kind}`;
        const shell = familyShell(page, name, kind);
        await expectShellBorder(shell, overrideExpectations[kind].rest);
        await focusOrOpenFamily(page, name, kind);
        await expectShellBorder(shell, overrideExpectations[kind].focus);
        await releaseFamily(page, name, kind);
        await expectShellBorder(shell, overrideExpectations[kind].rest);
      }

      await expectShellBorder(
        familyShell(page, 'target-override-disabled-date-picker', 'date-picker'),
        rgb('#fda4af'),
      );
      await expectShellBorder(
        familyShell(page, 'target-override-disabled-tree-select', 'tree-select'),
        rgb('#7dd3fc'),
      );

      const sibling = field(page, 'target-override-sibling-input', 'leaf-input');
      await expectShellBorder(sibling, globalBorder);
      await sibling.focus();
      await expectShellBorder(sibling, primary);
      await sibling.blur();
      await page.mouse.move(0, 0);
      await expectShellBorder(sibling, globalBorder);
    });
  });
}
