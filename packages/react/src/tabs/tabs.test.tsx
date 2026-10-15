import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from './tabs';

const items = [
  { key: 'one', label: 'First', children: <input aria-label="Draft" /> },
  { key: 'disabled', label: 'Disabled', disabled: true, children: 'Disabled content' },
  { key: 'two', label: 'Second', children: 'Second content' },
];
describe('Tabs', () => {
  it('removes the whole surface after the last close and restores it when items are added', async () => {
    const onAdd = vi.fn();
    function Example() {
      const initial = items
        .filter((item) => !item.disabled)
        .map((item) => ({ ...item, closable: true }));
      const [list, setList] = useState(initial);
      return (
        <>
          <div data-testid="tabs-host">
            <Tabs
              items={list}
              type="card"
              onAdd={onAdd}
              extra={<span>Extra actions</span>}
              onClose={(key) => setList((current) => current.filter((item) => item.key !== key))}
            />
          </div>
          <button type="button" onClick={() => setList(initial)}>
            Restore tabs
          </button>
        </>
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: '关闭标签页 First' }));
    await userEvent.click(screen.getByRole('button', { name: '关闭标签页 Second' }));
    expect(screen.getByTestId('tabs-host')).toBeEmptyDOMElement();
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByText('Extra actions')).toBeNull();
    expect(onAdd).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Restore tabs' }));
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    await userEvent.click(screen.getByRole('tab', { name: 'First' }));
    expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('tab', { name: 'Second' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second content');
  });

  it('closes an active tab and moves selection and focus to a surviving tab', async () => {
    function Example() {
      const [list, setList] = useState(items.map((item) => ({ ...item, closable: true })));
      return (
        <Tabs
          items={list}
          onClose={(key) => setList((list) => list.filter((item) => item.key !== key))}
        />
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: '关闭标签页 First' }));
    expect(screen.queryByRole('tab', { name: 'First' })).toBeNull();
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Second' })).toHaveFocus();
  });
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
