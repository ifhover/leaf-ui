import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, ConfigProvider, Drawer, Input, Modal, Select } from '../index';

describe('Drawer', () => {
  it('provides a named header, supporting description and a decorative icon', () => {
    render(
      <Drawer
        open
        title="Workspace"
        description="Manage the connected services"
        icon={<span>Services icon</span>}
        divided={false}
      >
        Details
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Workspace' });
    expect(dialog).toHaveAccessibleDescription('Manage the connected services');
    expect(dialog.querySelector('.leaf-drawer__icon')).toHaveAttribute('aria-hidden', 'true');
    expect(dialog).not.toHaveClass('leaf-drawer--divided');
    expect(dialog).not.toHaveClass('leaf-drawer--card');
  });
  it('shares scroll and focus ownership with nested modals and picker portals', async () => {
    function Example() {
      const [drawer, setDrawer] = useState(false);
      const [modal, setModal] = useState(false);
      return (
        <>
          <Button onClick={() => setDrawer(true)}>Open drawer</Button>
          <Drawer open={drawer} title="Details" onClose={() => setDrawer(false)}>
            <Select aria-label="Choice" options={[{ value: 'a', label: 'Alpha' }]} />
            <Button onClick={() => setModal(true)}>Open modal</Button>
            <Modal open={modal} title="Edit" onClose={() => setModal(false)}>
              <Input aria-label="Name" />
            </Modal>
          </Drawer>
        </>
      );
    }
    render(
      <ConfigProvider locale="en-US">
        <Example />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    expect(document.body.style.overflow).toBe('hidden');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Open modal' }));
    expect(screen.getByRole('dialog', { name: 'Edit' }).contains(document.activeElement)).toBe(
      true,
    );
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Edit' })).toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByRole('button', { name: 'Open modal' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('');
    expect(screen.getByRole('button', { name: 'Open drawer' })).toHaveFocus();
  });
  it('embeds top line tabs outside the scrolling body and preserves panel state', async () => {
    const tabItems = [
      { key: 'profile', label: 'Profile', children: <input aria-label="Display name" /> },
      { key: 'tokens', label: 'Tokens', children: 'Access tokens' },
    ];
    render(
      <Drawer
        open
        title={<span>Account</span>}
        extra={<button type="button">Help</button>}
        tabs={{ items: tabItems }}
      >
        Shared footer hint
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Account' });
    expect(dialog).toHaveClass('leaf-drawer--tabbed', 'leaf-drawer--headed');
    expect(dialog).not.toHaveClass('leaf-drawer--divided');
    const tablist = screen.getByRole('tablist', { name: 'Account' });
    const body = dialog.querySelector('.leaf-drawer__body');
    expect(body?.contains(tablist)).toBe(false);
    expect(body?.contains(screen.getByRole('tabpanel', { name: 'Profile' }))).toBe(true);
    expect(screen.getByText('Shared footer hint').closest('.leaf-drawer__content')).not.toBeNull();

    await userEvent.type(screen.getByRole('textbox', { name: 'Display name' }), 'Alice');
    await userEvent.click(screen.getByRole('tab', { name: 'Tokens' }));
    expect(screen.getByRole('tabpanel', { name: 'Tokens' })).toHaveTextContent('Access tokens');
    await userEvent.click(screen.getByRole('tab', { name: 'Profile' }));
    expect(screen.getByRole('textbox', { name: 'Display name' })).toHaveValue('Alice');
  });
  it('supports header-only tabs and places extra and close actions on untitled drawer tabs', async () => {
    const close = vi.fn();
    function Example() {
      const [view, setView] = useState('summary');
      return (
        <Drawer
          open
          aria-label="Inspect"
          extra={<button type="button">Refresh</button>}
          footer={<div>Footer actions</div>}
          onClose={close}
          tabs={{
            activeKey: view,
            onChange: setView,
            items: [
              { key: 'summary', label: 'Summary' },
              { key: 'events', label: 'Events' },
            ],
          }}
        >
          {view === 'summary' ? 'Summary view' : 'Events view'}
        </Drawer>
      );
    }
    render(<Example />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('.leaf-drawer__header')).toBeNull();
    expect(dialog.querySelector('.leaf-tabs__panels')).toBeNull();
    expect(screen.queryByRole('tabpanel')).toBeNull();
    expect(screen.getByRole('tab', { name: 'Summary' })).not.toHaveAttribute('aria-controls');
    expect(dialog.querySelector('.leaf-drawer__body')).not.toBeNull();
    expect(dialog.querySelector('.leaf-drawer__tab-extra > .leaf-drawer__extra')).not.toBeNull();
    expect(dialog.querySelector('.leaf-drawer__tab-extra > .leaf-drawer__close')).not.toBeNull();

    await userEvent.click(screen.getByRole('tab', { name: 'Events' }));
    expect(screen.getByText('Events view')).toBeInTheDocument();
    await userEvent.click(dialog.querySelector('.leaf-drawer__close') as HTMLButtonElement);
    expect(close).toHaveBeenCalledOnce();
  });
});
