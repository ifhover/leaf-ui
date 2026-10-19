import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { testThemes } from '../../tests/fixtures/theme-data';
import { ConfigProvider } from '../config-provider/config-provider';
import { Select } from '../select/select';
import { ScopedPortal } from './scoped-portal';
import { readThemeVariables } from './theme-variables';

afterEach(() => vi.restoreAllMocks());

// Model the browser's guaranteed-invalid computed value and the Firefox case
// where inherited custom properties are absent from computed-style enumeration.
function omitComputedResets() {
  const original = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
    const computed = original(element, pseudo);
    if (!element.closest('[data-reset-source]')) return computed;
    return new Proxy(computed, {
      get(target, property) {
        if (property === 'length') return 0;
        if (property === 'getPropertyValue')
          return (key: string) => {
            if (key === '--leaf-color-focus' || key === '--leaf-surface-shadow') return '';
            if (key === '--leaf-border-width') return '1px';
            return target.getPropertyValue(key);
          };
        const value = Reflect.get(target, property, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  });
}

describe('portal theme resets', () => {
  it('retains non-enumerated resets from composed ancestors without copying application variables', () => {
    omitComputedResets();
    const parent = document.createElement('div');
    parent.setAttribute('data-reset-source', '');
    parent.style.setProperty('--leaf-color-focus', 'initial');
    parent.style.setProperty('--leaf-surface-shadow', 'initial');
    parent.style.setProperty('--leaf-border-width', '1px');
    parent.style.setProperty('--application-secret', 'private');
    const source = parent.appendChild(document.createElement('button'));
    const variables = readThemeVariables(source);
    expect(variables['--leaf-color-focus']).toBe('initial');
    expect(variables['--leaf-surface-shadow']).toBe('initial');
    expect(variables['--leaf-border-width']).toBe('1px');
    expect(variables).not.toHaveProperty('--application-secret');
  });

  it('preserves nested default resets when floating and scoped portals target the outer themed container', async () => {
    omitComputedResets();
    const popupContainer = () => document.querySelector<HTMLElement>('#outer-theme') as HTMLElement;
    render(
      <ConfigProvider id="outer-theme" theme={testThemes.cartoon}>
        <ConfigProvider
          data-reset-source=""
          theme={testThemes.default}
          getPopupContainer={popupContainer}
        >
          <Select
            aria-label="Nested default selection"
            options={[{ value: 'leaf', label: 'Leaf' }]}
          />
          <ScopedPortal>
            <span>Scoped default content</span>
          </ScopedPortal>
        </ConfigProvider>
      </ConfigProvider>,
    );
    const scoped = screen
      .getByText('Scoped default content')
      .closest<HTMLElement>('.leaf-portal-scope');
    expect(scoped?.parentElement).toBe(popupContainer());
    for (const key of ['--leaf-surface-shadow', '--leaf-color-focus'])
      expect(scoped?.style.getPropertyValue(key)).toBe('initial');
    await userEvent.click(screen.getByRole('combobox', { name: 'Nested default selection' }));
    const panel = screen.getByRole('listbox').closest<HTMLElement>('[data-leaf-popup]')!;
    await waitFor(() => {
      expect(panel.style.getPropertyValue('--leaf-surface-shadow')).toBe('initial');
      expect(panel.style.getPropertyValue('--leaf-color-focus')).toBe('initial');
    });
    expect(panel.parentElement).toBe(popupContainer());
    expect(panel.closest('[data-reset-source]')).toBeNull();
  });
});
