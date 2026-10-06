import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Button, Drawer, Input, Modal, Select, TimePicker } from '../index';
import { ConfigProvider, useLeafConfig } from './config-provider';

describe('ConfigProvider', () => {
  it('inherits density, permits nested resets and keeps explicit theme sizes', () => {
    function Value() {
      return <output>{useLeafConfig().density}</output>;
    }
    const { rerender } = render(
      <ConfigProvider density="compact">
        <ConfigProvider data-testid="compact">
          <Value />
        </ConfigProvider>
        <ConfigProvider density="comfortable" data-testid="reset" theme={{ controlHeight: 40 }} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('compact')).toHaveAttribute('data-leaf-density', 'compact');
    expect(screen.getByTestId('compact').style.getPropertyValue('--leaf-density-form-gap')).toBe(
      '12px',
    );
    expect(screen.getByTestId('reset').style.getPropertyValue('--leaf-control-height')).toBe(
      '40px',
    );
    expect(screen.getByText('compact')).toBeInTheDocument();
    rerender(
      <ConfigProvider>
        <ConfigProvider data-testid="compact">
          <Value />
        </ConfigProvider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('compact').style.getPropertyValue('--leaf-control-height')).toBe(
      '34px',
    );
    expect(screen.getByText('comfortable')).toBeInTheDocument();
  });
  it('defaults mask blur on and inherits overrides in portalled dialogs', () => {
    function BlurValue() {
      return <output data-testid="default-blur">{String(useLeafConfig().maskBlur)}</output>;
    }
    function Example({ blur }: { blur: boolean }) {
      return (
        <>
          <BlurValue />
          <ConfigProvider maskBlur={blur}>
            <ConfigProvider>
              <Modal open title="Inherited blur" />
            </ConfigProvider>
            <ConfigProvider maskBlur>
              <Drawer open title="Enabled blur" />
            </ConfigProvider>
          </ConfigProvider>
        </>
      );
    }
    const { rerender } = render(<Example blur={false} />);
    expect(screen.getByTestId('default-blur')).toHaveTextContent('true');
    const modalMask = screen.getByRole('dialog', { name: 'Inherited blur' }).parentElement;
    const drawerMask = screen.getByRole('dialog', { name: 'Enabled blur' }).parentElement;
    expect(modalMask).toHaveAttribute('data-blur', 'off');
    expect(drawerMask).not.toHaveAttribute('data-blur');
    expect(modalMask?.closest('.leaf-portal-scope')).toBeInTheDocument();
    rerender(<Example blur />);
    expect(modalMask).not.toHaveAttribute('data-blur');
  });
  it('inherits advanced overrides and removes stale settings when the theme changes', () => {
    const { rerender } = render(
      <ConfigProvider
        theme={{
          borderRadius: 8,
          controlHeight: 38,
          tokens: { controlHeightSm: 30, infoColor: '#006cff' },
        }}
      >
        <ConfigProvider
          data-testid="nested"
          theme={{ borderRadius: 12, controlHeight: 42, tokens: { surfaceColor: '#fafafa' } }}
        />
      </ConfigProvider>,
    );
    const scope = screen.getByTestId('nested');
    expect(scope.style.getPropertyValue('--leaf-radius')).toBe('12px');
    expect(scope.style.getPropertyValue('--leaf-control-height')).toBe('42px');
    expect(scope.style.getPropertyValue('--leaf-control-height-sm')).toBe('30px');
    expect(scope.style.getPropertyValue('--leaf-color-info')).toBe('#006cff');
    expect(scope.style.getPropertyValue('--leaf-color-surface')).toBe('#fafafa');
    rerender(
      <ConfigProvider>
        <ConfigProvider data-testid="nested" theme={{ appearance: 'dark', motion: false }} />
      </ConfigProvider>,
    );
    expect(scope.style.getPropertyValue('--leaf-control-height-sm')).toBe('');
    expect(scope.style.getPropertyValue('--leaf-color-info')).toBe('');
    expect(scope.style.getPropertyValue('--leaf-motion-duration')).toBe('0ms');
    expect(scope).toHaveAttribute('data-leaf-theme', 'dark');
  });
  it('supports explicit small and large sizes, CSS lengths and per-scope motion', () => {
    render(
      <ConfigProvider
        data-testid="theme"
        theme={{
          borderRadius: '0.75rem',
          fontSize: 16,
          controlHeight: '2.5rem',
          fontFamily: 'Arial',
          tokens: {
            borderRadiusLg: 24,
            controlHeightLg: '3rem',
            fontSizeSm: 13,
            fontWeight: 600,
            motionDuration: 250,
            popupZIndex: 1400,
          },
        }}
      >
        <ConfigProvider data-testid="still" theme={{ motion: false }} />
        <ConfigProvider data-testid="moving" theme={{ motion: false }}>
          <ConfigProvider data-testid="resumed" theme={{ motion: true }} />
        </ConfigProvider>
      </ConfigProvider>,
    );
    const scope = screen.getByTestId('theme');
    expect(scope.style.getPropertyValue('--leaf-radius')).toBe('0.75rem');
    expect(scope.style.getPropertyValue('--leaf-radius-lg')).toBe('24px');
    expect(scope.style.getPropertyValue('--leaf-control-height-lg')).toBe('3rem');
    expect(scope.style.getPropertyValue('--leaf-font-size-sm')).toBe('13px');
    expect(scope.style.getPropertyValue('--leaf-font-weight')).toBe('600');
    expect(scope.style.getPropertyValue('--leaf-z-index-popup')).toBe('1400');
    expect(screen.getByTestId('still').style.getPropertyValue('--leaf-motion-play-state')).toBe(
      'paused',
    );
    expect(screen.getByTestId('resumed').style.getPropertyValue('--leaf-motion-duration')).toBe(
      '250ms',
    );
    expect(screen.getByTestId('resumed').style.getPropertyValue('--leaf-motion-play-state')).toBe(
      'running',
    );
  });
  it('renders a configured first frame on the server and hydrates without replacing it', async () => {
    const app = (
      <ConfigProvider
        locale="en-US"
        theme={{ appearance: 'dark', primaryColor: '#7654c6', borderRadius: 8, controlHeight: 38 }}
      >
        <Button>Save</Button>
        <Input name="title" defaultValue="Leaf" />
        <Select
          aria-label="Team"
          options={[{ value: 'design', label: 'Design' }]}
          defaultValue="design"
        />
      </ConfigProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(app);
    document.body.append(container);
    const scope = container.firstElementChild;
    const serverButton = container.querySelector('button');
    expect(scope).toHaveAttribute('data-leaf-theme', 'dark');
    expect(container.innerHTML).toContain('--leaf-control-height:38px');
    expect(container.innerHTML).toContain('--leaf-radius:8px');
    const recover = vi.fn();
    const root = hydrateRoot(container, app, { onRecoverableError: recover });
    try {
      await act(async () => {});
      expect(recover).not.toHaveBeenCalled();
      expect(container.firstElementChild).toBe(scope);
      expect(container.querySelector('button')).toBe(serverButton);
      expect(container.querySelector('input[name="title"]')).toHaveValue('Leaf');
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });
  it('merges nested regions without affecting siblings', () => {
    function Values() {
      const { locale, theme } = useLeafConfig();
      return <output>{`${locale}/${theme.primaryColor}/${theme.borderRadius}`}</output>;
    }
    render(
      <ConfigProvider locale="en-US" theme={{ primaryColor: '#7654c6', borderRadius: 8 }}>
        <Values />
        <ConfigProvider theme={{ borderRadius: 2 }}>
          <Values />
        </ConfigProvider>
        <ConfigProvider locale="zh-CN">
          <Values />
        </ConfigProvider>
      </ConfigProvider>,
    );
    expect(screen.getByText('en-US/#7654c6/8')).toBeInTheDocument();
    expect(screen.getByText('en-US/#7654c6/2')).toBeInTheDocument();
    expect(screen.getByText('zh-CN/#7654c6/8')).toBeInTheDocument();
  });
  it('localizes options and time panels, and reacts to language changes', async () => {
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Select aria-label="Choice" options={[]} />
        <TimePicker aria-label="Time" use12Hours defaultValue="00:00" />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Choice' }));
    expect(screen.getByText('No options')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox', { name: 'Time' }));
    expect(screen.getByRole('listbox', { name: 'Hours' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('listbox', { name: 'Period' })).getByRole('option', { name: 'AM' }),
    ).toHaveAttribute('aria-selected', 'true');
    rerender(
      <ConfigProvider locale="zh-CN">
        <TimePicker aria-label="Time" />
      </ConfigProvider>,
    );
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', '请选择时间');
  });
});
