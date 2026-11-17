import { fireEvent, render, screen } from '@testing-library/react';
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
  it('stacks a newly opened drawer above an earlier open modal and preserves closing order', async () => {
    function Example({ snapshotKey }: { snapshotKey: number }) {
      const [modal, setModal] = useState(false);
      const [drawer, setDrawer] = useState(false);
      return (
        <ConfigProvider locale="en-US">
          <Button onClick={() => setModal(true)}>Open snapshot</Button>
          <Drawer open={drawer} title="Merchant" onClose={() => setDrawer(false)}>
            <Select aria-label="Status" options={[{ value: 'active', label: 'Active' }]} />
            <Button onClick={() => setDrawer(false)}>Done</Button>
          </Drawer>
          {modal && (
            <Modal key={snapshotKey} open title="Snapshot" onClose={() => setModal(false)}>
              <Button onClick={() => setDrawer(true)}>Open merchant</Button>
              <Button onClick={() => setModal(false)}>Close snapshot</Button>
            </Modal>
          )}
        </ConfigProvider>
      );
    }

    const { rerender } = render(<Example snapshotKey={1} />);
    expect(document.querySelectorAll('.leaf-portal-scope')).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: 'Open snapshot' }));
    const modalMask = screen
      .getByRole('dialog', { name: 'Snapshot' })
      .closest<HTMLElement>('.leaf-modal-mask');
    expect(modalMask?.style.zIndex).toBe('');

    await userEvent.click(screen.getByRole('button', { name: 'Open merchant' }));
    const drawerDialog = screen.getByRole('dialog', { name: 'Merchant' });
    const drawerMask = drawerDialog.closest<HTMLElement>('.leaf-drawer-mask');
    const drawerBackdrop = drawerMask?.querySelector<HTMLElement>('.leaf-drawer-backdrop');
    if (!drawerMask || !drawerBackdrop) throw new Error('Drawer mask missing');
    expect(drawerMask.style.zIndex).toBe('calc(var(--leaf-z-index-modal, 1100) + 2)');
    expect(drawerDialog.style.getPropertyValue('--leaf-z-index-popup')).toBe(
      'calc(var(--leaf-z-index-modal, 1100) + 3)',
    );

    await userEvent.click(screen.getByRole('combobox', { name: 'Status' }));
    const popup = screen.getByRole('listbox').closest<HTMLElement>('[data-leaf-popup]');
    expect(popup?.style.getPropertyValue('--leaf-z-index-popup')).toBe(
      'calc(var(--leaf-z-index-modal, 1100) + 3)',
    );
    await userEvent.keyboard('{Escape}');

    // 退出过渡期间保持原有叠层，结束后才释放
    drawerBackdrop.style.transitionDuration = '200ms';
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(drawerMask).toHaveAttribute('data-state', 'closing');
    expect(drawerMask.style.zIndex).toBe('calc(var(--leaf-z-index-modal, 1100) + 2)');
    fireEvent.transitionEnd(drawerBackdrop, { propertyName: 'opacity' });
    expect(drawerMask).toHaveAttribute('hidden');

    // 关闭下层弹窗后再用新 key 挂载弹窗并重新打开已保留的抽屉，依然叠放于弹窗之上
    await userEvent.click(screen.getByRole('button', { name: 'Close snapshot' }));
    rerender(<Example snapshotKey={2} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open snapshot' }));
    await userEvent.click(screen.getByRole('button', { name: 'Open merchant' }));
    expect(drawerMask.style.zIndex).toBe('calc(var(--leaf-z-index-modal, 1100) + 2)');
  });
});
