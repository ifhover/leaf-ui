import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Button, DatePicker, Drawer, Input, Modal, Pagination, Select, TimePicker } from '../index';
import { useText } from '../shared/use-text';
import { ConfigProvider, type ConfigProviderProps, useLeafConfig } from './config-provider';

describe('ConfigProvider', () => {
  it('exposes language selection and component defaults without dictionary override props', () => {
    expectTypeOf<ConfigProviderProps>().not.toHaveProperty('messages');
    expectTypeOf<ConfigProviderProps>().not.toHaveProperty('textMessages');
  });
  it.each([
    ['zh-CN', '请选择日期', '预览'],
    ['zh-TW', '請選擇日期', '預覽'],
    ['en-US', 'Select a date', 'Preview'],
    ['ja-JP', '日付を選択', 'プレビュー'],
    ['ko-KR', '날짜 선택', '미리 보기'],
    ['fr-FR', 'Select a date', 'Preview'],
    ['zh-HK', 'Select a date', 'Preview'],
  ])(
    'inherits built-in and extended text for %s while isolating nested languages',
    (locale, placeholder, preview) => {
      function PreviewLabel() {
        const text = useText();
        return <output>{text('common.preview')}</output>;
      }
      render(
        <ConfigProvider locale={locale}>
          <ConfigProvider>
            <DatePicker aria-label="Inherited date" />
            <PreviewLabel />
          </ConfigProvider>
          <ConfigProvider
            locale="en-US"
            components={{ DatePicker: { placeholder: 'Project date' } }}
          >
            <DatePicker aria-label="Configured date" />
            <DatePicker aria-label="Overridden date" placeholder="Instance date" />
          </ConfigProvider>
        </ConfigProvider>,
      );
      expect(screen.getByRole('combobox', { name: 'Inherited date' })).toHaveAttribute(
        'placeholder',
        placeholder,
      );
      expect(screen.getByRole('status')).toHaveTextContent(preview);
      expect(screen.getByRole('combobox', { name: 'Configured date' })).toHaveAttribute(
        'placeholder',
        'Project date',
      );
      expect(screen.getByRole('combobox', { name: 'Overridden date' })).toHaveAttribute(
        'placeholder',
        'Instance date',
      );
    },
  );
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
    expect(screen.getByTestId('compact').style.getPropertyValue('--leaf-control-height')).toBe(
      '30px',
    );
    expect(screen.getByTestId('compact').style.getPropertyValue('--leaf-density-form-gap')).toBe(
      '16px',
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
  it('switches built-in Japanese and Korean in open portals without resetting values', async () => {
    function View({ locale }: { locale: string }) {
      return (
        <ConfigProvider locale={locale}>
          <Select aria-label="Choice" options={[]} />
          <DatePicker aria-label="Date" defaultValue={new Date(2026, 9, 16)} />
          <TimePicker aria-label="Time" use12Hours defaultValue="14:30" />
          <Pagination total={24} showTotal />
        </ConfigProvider>
      );
    }
    const { rerender } = render(<View locale="ja-JP" />);
    const choice = screen.getByRole('combobox', { name: 'Choice' });
    const date = screen.getByRole('combobox', { name: 'Date' });
    const time = screen.getByRole('combobox', { name: 'Time' });
    expect(time).toHaveValue('02:30 午後');
    expect(screen.getByText('全 24 件')).toBeInTheDocument();
    await userEvent.click(choice);
    expect(screen.getByText('選択肢がありません').closest('[lang]')).toHaveAttribute(
      'lang',
      'ja-JP',
    );

    rerender(<View locale="ko-KR" />);
    expect(screen.getByRole('combobox', { name: 'Choice' })).toBe(choice);
    expect(choice).toHaveAttribute('placeholder', '선택해 주세요');
    expect(screen.getByText('선택 항목 없음').closest('[lang]')).toHaveAttribute('lang', 'ko-KR');
    expect(date).toHaveValue('2026-10-16');
    expect(time).toHaveValue('02:30 오후');
    expect(screen.getByText('총 24개')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(date);
    expect(screen.getByRole('button', { name: '오늘' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await userEvent.clear(time);
    await userEvent.type(time, '3:45 오후{Enter}');
    expect(time).toHaveValue('03:45 오후');

    rerender(<View locale="ja-JP" />);
    expect(time).toHaveValue('03:45 午後');
    await userEvent.clear(time);
    await userEvent.type(time, '午前 9:15{Enter}');
    expect(time).toHaveValue('09:15 午前');
  });
  it.each([
    ['ja-JP', '日付を選択', '全 24 件'],
    ['ko-KR', '날짜 선택', '총 24개'],
  ])(
    'renders and hydrates built-in %s without custom resources',
    async (locale, placeholder, total) => {
      const app = (
        <ConfigProvider locale={locale}>
          <DatePicker aria-label="Date" />
          <Pagination total={24} showTotal />
        </ConfigProvider>
      );
      const container = document.createElement('div');
      container.innerHTML = renderToString(app);
      document.body.append(container);
      const serverInput = container.querySelector('input[role="combobox"]');
      expect(serverInput).toHaveAttribute('placeholder', placeholder);
      expect(container.textContent).toContain(total);
      const onError = vi.fn();
      const root = hydrateRoot(container, app, { onRecoverableError: onError });
      try {
        await act(async () => {});
        expect(onError).not.toHaveBeenCalled();
        expect(container.querySelector('input[role="combobox"]')).toBe(serverInput);
        expect(container.firstElementChild).toHaveAttribute('lang', locale);
      } finally {
        await act(async () => root.unmount());
        container.remove();
      }
    },
  );
});
