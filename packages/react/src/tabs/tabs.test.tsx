import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from './tabs';

const items = [
  { key: 'one', label: 'First', children: <input aria-label="Draft" /> },
  { key: 'disabled', label: 'Disabled', disabled: true, children: 'Disabled content' },
  { key: 'two', label: 'Second', children: 'Second content' },
];
describe('Tabs', () => {
  it('skips disabled tabs, activates using arrow keys and preserves visited panel state', async () => {
    render(<Tabs items={items} aria-label="Project" />);
    const first = screen.getByRole('tab', { name: 'First' });
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('First');
    await userEvent.type(screen.getByRole('textbox'), 'draft');
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second content');
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('textbox')).toHaveValue('draft');
  });
  it('supports manual activation, controlled keys and destroying inactive panels', async () => {
    const change = vi.fn();
    const { rerender } = render(
      <Tabs items={items} activationMode="manual" activeKey="one" onChange={change} />,
    );
    await userEvent.click(screen.getByRole('tab', { name: 'First' }));
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    expect(change).toHaveBeenCalledWith('two');
    rerender(<Tabs items={items} activeKey="two" destroyInactive />);
    expect(within(screen.getByRole('tabpanel')).getByText('Second content')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { hidden: true })).toBeNull();
  });
});
