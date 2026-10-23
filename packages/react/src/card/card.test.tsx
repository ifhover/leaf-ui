import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Card } from './card';

const items = [
  { key: 'details', label: 'Details', children: <input aria-label="Project name" /> },
  { key: 'billing', label: 'Billing', disabled: true, children: 'Billing content' },
  { key: 'members', label: 'Members', children: 'Team members' },
];

describe('Card tabs', () => {
  it('uses Tabs keyboard navigation and retains visited form state', async () => {
    const change = vi.fn();
    render(<Card title="Project" tabs={{ items, onChange: change }} footer="Actions" />);
    expect(screen.getByRole('tablist')).toHaveAccessibleName('Project');
    await userEvent.type(screen.getByRole('textbox', { name: 'Project name' }), 'Leaf');
    screen.getByRole('tab', { name: 'Details' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Members' })).toHaveTextContent('Team members');
    expect(change).toHaveBeenCalledWith('members');
    expect(screen.getByText('Actions')).toBeInTheDocument();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('textbox', { name: 'Project name' })).toHaveValue('Leaf');
  });

  it('supports controlled manual activation and destroying inactive content', async () => {
    const change = vi.fn();
    const { rerender } = render(
      <Card tabs={{ items, activeKey: 'details', activationMode: 'manual', onChange: change }} />,
    );
    screen.getByRole('tab', { name: 'Details' }).focus();
    await userEvent.keyboard('{End}');
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    expect(change).toHaveBeenCalledWith('members');
    rerender(<Card tabs={{ items, activeKey: 'members', destroyInactive: true }} />);
    expect(screen.getByRole('tabpanel', { name: 'Members' })).toHaveTextContent('Team members');
    expect(screen.queryByRole('textbox', { hidden: true })).toBeNull();
  });

  it('keeps navigation and selection while loading then restores content', async () => {
    const { rerender } = render(
      <Card title="Project" loading tabs={{ items, defaultActiveKey: 'members' }} />,
    );
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    expect(within(screen.getByRole('tabpanel')).getByRole('status')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Details' }));
    rerender(<Card title="Project" tabs={{ items }} />);
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('textbox', { name: 'Project name' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('supports closing tabs, shared children and falling back when the list is empty', async () => {
    function Example() {
      const [tabs, setTabs] = useState([
        { key: 'draft', label: 'Draft', children: 'Draft content', closable: true },
      ]);
      return (
        <Card
          title="Project"
          extra={<button type="button">Card action</button>}
          tabs={{
            items: tabs,
            extra: <button type="button">Tab action</button>,
            onClose: (key) => setTabs((items) => items.filter((item) => item.key !== key)),
          }}
        >
          Shared explanation
        </Card>
      );
    }
    render(<Example />);
    expect(screen.getByText('Shared explanation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Card action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tab action' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '关闭标签页 Draft' }));
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Tab action' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Card action' })).toBeInTheDocument();
    expect(screen.getByText('Shared explanation')).toBeInTheDocument();
  });
});

describe('Card variants', () => {
  it('supports visual selection without adding an interactive role or forwarding selected to the DOM', () => {
    const { rerender } = render(
      <Card data-testid="card" selected bordered={false}>
        Content
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('leaf-card--selected');
    expect(card).not.toHaveAttribute('selected');
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabindex');
    rerender(<Card data-testid="card">Content</Card>);
    expect(card).not.toHaveClass('leaf-card--selected');
  });

  it('inherits the selection default and lets instances opt out', () => {
    render(
      <ConfigProvider components={{ Card: { selected: true } }}>
        <Card data-testid="selected-card" variant="layered">
          Selected
        </Card>
        <Card data-testid="plain-card" selected={false}>
          Plain
        </Card>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('selected-card')).toHaveClass('leaf-card--selected');
    expect(screen.getByTestId('plain-card')).not.toHaveClass('leaf-card--selected');
  });

  it('keeps the heading and footer on the canvas and hides layered descriptions', () => {
    render(
      <Card
        data-testid="layered-card"
        description="Standalone supporting text"
        footer="Footer content"
        title="Layered card"
        variant="layered"
      >
        Body content
      </Card>,
    );

    const card = screen.getByTestId('layered-card');
    const panel = card.querySelector(':scope > .leaf-card__panel');
    expect(card).toHaveClass('leaf-card--layered');
    expect(panel).not.toBeNull();
    expect(panel?.contains(screen.getByRole('heading', { name: 'Layered card' }))).toBe(false);
    expect(panel?.contains(screen.getByText('Body content'))).toBe(true);
    expect(panel?.contains(screen.getByText('Footer content'))).toBe(false);
    expect(card.querySelector(':scope > .leaf-card__footer')).toHaveTextContent('Footer content');
    expect(screen.queryByText('Standalone supporting text')).not.toBeInTheDocument();
  });

  it('does not create a heading for a hidden description or reserve its tab actions', () => {
    const { rerender } = render(
      <Card variant="layered" description="Hidden details" extra="Actions" tabs={{ items }} />,
    );
    expect(screen.queryByText('Hidden details')).not.toBeInTheDocument();
    expect(screen.getByText('Actions').closest('.leaf-card__tab-extra')).not.toBeNull();
    expect(document.querySelector('.leaf-card__header')).toBeNull();

    rerender(
      <Card description="Visible details" footer="Default footer">
        Body
      </Card>,
    );
    expect(screen.getByText('Visible details')).toBeInTheDocument();
    expect(document.querySelector('.leaf-card__panel > .leaf-card__footer')).toHaveTextContent(
      'Default footer',
    );
  });
});
