import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Select, TimePicker } from '../index';
import { ConfigProvider, useLeafConfig } from './config-provider';

describe('ConfigProvider', () => {
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
    expect(screen.getByRole('combobox')).toHaveTextContent('请选择时间');
  });
});
