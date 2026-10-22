import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { AutoComplete } from './autocomplete';

const options = [
  { value: 'Leaf Garden' },
  { value: 'Leaf Studio', disabled: true },
  { value: 'Pine Forest' },
];
describe('AutoComplete', () => {
  it('shows decorative icons above loading and custom empty content', async () => {
    const { rerender } = render(<AutoComplete aria-label="项目" options={[]} loading />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('处理中').parentElement?.querySelector('svg')).toHaveClass(
      'leaf-floating__loading-icon',
    );
    rerender(<AutoComplete aria-label="项目" options={[]} notFoundContent="没有项目" />);
    expect(screen.getByText('没有项目').parentElement?.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByText('没有项目').parentElement?.querySelector('svg')).not.toHaveClass(
      'leaf-floating__loading-icon',
    );
  });
  it('filters suggestions, supports free text and selects with arrows and Enter', async () => {
    const onSelect = vi.fn();
    render(<AutoComplete aria-label="项目" options={options} onSelect={onSelect} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'leaf');
    expect(screen.queryByRole('option', { name: 'Pine Forest' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Leaf Studio' })).toBeDisabled();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(input).toHaveValue('Leaf Garden');
    expect(onSelect).toHaveBeenCalledWith('Leaf Garden', options[0]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, '自由内容');
    expect(input).toHaveValue('自由内容');
    expect(screen.getByText('没有匹配建议，可继续输入')).toBeInTheDocument();
  });
  it('does not select during IME composition and dismisses on focus departure', async () => {
    const onSelect = vi.fn();
    render(
      <>
        <AutoComplete aria-label="项目" options={options} onSelect={onSelect} />
        <button type="button">继续</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onSelect).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: '继续' })).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('uses the current control height for suggestion rows unless optionHeight is explicit', async () => {
    const { unmount } = render(
      <ConfigProvider density="compact">
        <AutoComplete aria-label="紧凑建议" options={options} />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    const compactPanel = screen
      .getByRole('listbox')
      .closest<HTMLElement>('.leaf-autocomplete__panel');
    expect(compactPanel).not.toBeNull();
    expect(compactPanel?.style.getPropertyValue('--leaf-autocomplete-option-height')).toBe('30px');

    unmount();
    render(<AutoComplete aria-label="自定义建议" options={options} optionHeight={28} />);
    await userEvent.click(screen.getByRole('combobox'));
    const customPanel = screen
      .getByRole('listbox')
      .closest<HTMLElement>('.leaf-autocomplete__panel');
    expect(customPanel).not.toBeNull();
    expect(customPanel?.style.getPropertyValue('--leaf-autocomplete-option-height')).toBe('28px');
  });
});
