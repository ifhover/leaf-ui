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

  it('supports header-only tabs as a card body switcher without empty tab panels', async () => {
    function SwitcherCard() {
      const [view, setView] = useState('overview');
      return (
        <Card
          title="Project"
          tabs={{
            activeKey: view,
            onChange: setView,
            items: [
              { key: 'overview', label: 'Overview' },
              { key: 'activity', label: 'Activity' },
            ],
          }}
        >
          {view === 'overview' ? 'Overview body' : 'Activity body'}
        </Card>
      );
    }

    const { container } = render(<SwitcherCard />);
    expect(container.querySelector('.leaf-tabs__panels')).toBeNull();
    expect(screen.queryByRole('tabpanel')).toBeNull();
    expect(screen.getByRole('tab', { name: 'Overview' })).not.toHaveAttribute('aria-controls');
    expect(screen.getByText('Overview body').closest('.leaf-card__body')).not.toBeNull();

    await userEvent.click(screen.getByRole('tab', { name: 'Activity' }));
    expect(screen.getByText('Activity body')).toBeInTheDocument();
    expect(container.querySelector('.leaf-tabs__panels')).toBeNull();
  });

  it('shows body skeleton while loading header-only tabs and omits empty body otherwise', () => {
    const views = [
      { key: 'overview', label: 'Overview' },
      { key: 'activity', label: 'Activity' },
    ];
    const { container, rerender } = render(
      <Card loading tabs={{ 'aria-label': 'Views', items: views }} />,
    );
    const body = container.querySelector('.leaf-card__body');
    expect(body).not.toBeNull();
    expect(within(body as HTMLElement).getByRole('status')).toBeInTheDocument();
    expect(container.querySelector('.leaf-tabs__panels')).toBeNull();

    rerender(<Card tabs={{ 'aria-label': 'Views', items: views }} footer="Actions" />);
    expect(container.querySelector('.leaf-card__body')).toBeNull();
    expect(container.querySelector('.leaf-tabs__panels')).toBeNull();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('avoids dangling aria-controls for items without children in mixed tab lists', async () => {
    const mixed = [
      { key: 'details', label: 'Details', children: 'Details panel' },
      { key: 'external', label: 'Summary' },
    ];
    render(
      <Card tabs={{ 'aria-label': 'Mixed', items: mixed }}>
        <div>Shared body</div>
      </Card>,
    );
    const detailsTab = screen.getByRole('tab', { name: 'Details' });
    const summaryTab = screen.getByRole('tab', { name: 'Summary' });
    expect(detailsTab).toHaveAttribute('aria-controls');
    expect(summaryTab).not.toHaveAttribute('aria-controls');

    await userEvent.click(summaryTab);
    expect(screen.queryByRole('tabpanel')).toBeNull();
    expect(screen.getByText('Shared body')).toBeInTheDocument();
  });

  it('links non-string card titles to tablist via aria-labelledby unless overridden', () => {
    const { rerender } = render(
      <Card
        title={
          <span>
            Project <strong>Alpha</strong>
          </span>
        }
        tabs={{
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
        }}
      >
        Body
      </Card>,
    );
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAccessibleName('Project Alpha');
    expect(tablist).not.toHaveAttribute('aria-label');
    expect(tablist).toHaveAttribute('aria-labelledby');

    rerender(
      <Card
        title={<span>Project Alpha</span>}
        tabs={{
          'aria-label': 'Custom tabs',
          items: [{ key: 'a', label: 'A' }],
        }}
      >
        Body
      </Card>,
    );
    expect(screen.getByRole('tablist')).toHaveAccessibleName('Custom tabs');
    expect(screen.getByRole('tablist')).not.toHaveAttribute('aria-labelledby');
  });

  it('keeps the line tab bar header intact when bordered is false', () => {
    render(
      <Card
        data-testid="borderless-tabbed-card"
        bordered={false}
        tabs={{
          'aria-label': 'Views',
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
        }}
      >
        Body
      </Card>,
    );
    const card = screen.getByTestId('borderless-tabbed-card');
    expect(card).not.toHaveClass('leaf-card--bordered');
    expect(
      card.querySelector('.leaf-card__tabs.leaf-tabs--line > .leaf-tabs__header'),
    ).not.toBeNull();
  });
});

describe('Card variants', () => {
  it('allows instances to remove the frame and resting shadow', () => {
    render(
      <Card data-testid="unstyled-card" bordered={false} shadow={false}>
        Content
      </Card>,
    );
    const card = screen.getByTestId('unstyled-card');
    expect(card).not.toHaveClass('leaf-card--bordered');
    expect(card).toHaveClass('leaf-card--shadowless');
  });

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

  it('does not reserve an empty body after a cover-only content region', () => {
    render(<Card cover={<div>Cover content</div>} footer="Footer content" />);

    const card = document.querySelector('.leaf-card');
    expect(card?.querySelector(':scope > .leaf-card__panel > .leaf-card__body')).toBeNull();
    expect(
      card?.querySelector(':scope > .leaf-card__panel > .leaf-card__footer'),
    ).toHaveTextContent('Footer content');
  });

  it.each(['default', 'layered'] as const)(
    'keeps a cover last only when it ends the %s content surface',
    (variant) => {
      const cover = <div>Cover content</div>;
      const { rerender } = render(<Card variant={variant} cover={cover} />);
      const content = document.querySelector('.leaf-card__panel');
      expect(content?.querySelector('.leaf-card__cover:only-child')).not.toBeNull();
      expect(content?.querySelector('.leaf-card__body')).toBeNull();

      rerender(
        <Card variant={variant} cover={cover}>
          Body content
        </Card>,
      );
      expect(content?.querySelector('.leaf-card__cover:last-child')).toBeNull();
      expect(content?.querySelector('.leaf-card__body')).toHaveTextContent('Body content');

      rerender(<Card variant={variant} cover={cover} footer="Footer content" />);
      expect(content?.querySelector('.leaf-card__cover:last-child') !== null).toBe(
        variant === 'layered',
      );
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    },
  );

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

  it('supports uniform, none, and section-level padding overrides with ConfigProvider defaults', () => {
    const { rerender } = render(
      <Card title="Flush body" footer="Footer" padding={{ body: 'none', footer: '8px 16px' }}>
        Body
      </Card>,
    );
    const card = document.querySelector<HTMLElement>('.leaf-card');
    expect(card?.style.getPropertyValue('--leaf-card-header-padding')).toBe('');
    expect(card?.style.getPropertyValue('--leaf-card-body-padding')).toBe('0px');
    expect(card?.style.getPropertyValue('--leaf-card-footer-padding')).toBe('8px 16px');

    rerender(
      <ConfigProvider components={{ Card: { padding: { body: 12 } } }}>
        <Card title="Defaulted">Body</Card>
      </ConfigProvider>,
    );
    const configured = document.querySelector<HTMLElement>('.leaf-card');
    expect(configured?.style.getPropertyValue('--leaf-card-body-padding')).toBe('12px');
    expect(configured?.style.getPropertyValue('--leaf-card-header-padding')).toBe('');
  });
});
