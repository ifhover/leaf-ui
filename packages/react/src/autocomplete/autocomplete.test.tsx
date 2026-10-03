import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AutoComplete } from './autocomplete';

const options = [
  { value: 'Leaf Garden' },
  { value: 'Leaf Studio', disabled: true },
  { value: 'Pine Forest' },
];
describe('AutoComplete', () => {
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
});
