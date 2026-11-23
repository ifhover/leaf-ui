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
    expect(dialog.querySelector('.leaf-drawer__header > .leaf-drawer__close')).toBeNull();
    expect(dialog).toHaveClass('leaf-drawer--closable');
    expect(dialog.querySelector(':scope > .leaf-drawer__close')).not.toBeNull();
    expect(dialog).not.toHaveClass('leaf-drawer--divided');
    expect(dialog).not.toHaveClass('leaf-drawer--card');
  });
  it('omits empty headers on untitled drawers unless extra actions are supplied', () => {
    const { rerender } = render(
      <Drawer open aria-label="Plain drawer">
        Plain body
      </Drawer>,
    );
    const plain = screen.getByRole('dialog', { name: 'Plain drawer' });
    expect(plain).toHaveClass('leaf-drawer--closable');
    expect(plain.querySelector('.leaf-drawer__header')).toBeNull();
    expect(plain.querySelector(':scope > .leaf-drawer__close')).not.toBeNull();

    rerender(
      <Drawer open aria-label="Extra drawer" extra={<button type="button">Help</button>}>
        Body with extra
      </Drawer>,
    );
    const withExtra = screen.getByRole('dialog', { name: 'Extra drawer' });
    expect(
      withExtra.querySelector('.leaf-drawer__header--compact > .leaf-drawer__extra'),
    ).not.toBeNull();
    expect(withExtra.querySelector(':scope > .leaf-drawer__close')).not.toBeNull();
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

  it('supports section-level padding overrides without changing default divided behavior', () => {
    const { rerender } = render(
      <Drawer open title="Drawer spacing" padding={{ body: 'none', header: 16 }}>
        Body
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Drawer spacing' });
    expect(dialog).not.toHaveClass('leaf-drawer--divided');
    expect(dialog).toHaveAttribute('data-header-padding', '');
    expect(dialog).toHaveAttribute('data-body-padding', '');
    expect(dialog).not.toHaveAttribute('data-footer-padding');
    expect(dialog.style.getPropertyValue('--leaf-drawer-header-padding')).toBe('16px');
    expect(dialog.style.getPropertyValue('--leaf-drawer-body-padding')).toBe('0px');
    expect(dialog.style.getPropertyValue('--leaf-drawer-footer-padding')).toBe('');
    expect(dialog.style.getPropertyValue('--leaf-drawer-close-inset-top')).toBe('16px');
    expect(dialog.style.getPropertyValue('--leaf-drawer-close-inset-right')).toBe('16px');
    expect(dialog.style.getPropertyValue('--leaf-drawer-close-inset-left')).toBe('16px');

    rerender(
      <Drawer open title="Divided drawer" divided padding="none">
        Body
      </Drawer>,
    );
    const divided = screen.getByRole('dialog', { name: 'Divided drawer' });
    expect(divided).toHaveClass('leaf-drawer--divided');
    expect(divided).not.toHaveAttribute('data-header-padding');
    expect(divided.style.getPropertyValue('--leaf-drawer-shell-padding-top')).toBe('0px');
    expect(divided.style.getPropertyValue('--leaf-drawer-header-padding')).toBe('0px');
    expect(divided.style.getPropertyValue('--leaf-drawer-body-padding')).toBe('0px');
    expect(divided.style.getPropertyValue('--leaf-drawer-footer-padding')).toBe('0px');
  });

  it('defaults showSwipeHandle on bottom placement, honors overrides, and closes when swiped past threshold', () => {
    const close = vi.fn();
    const { rerender } = render(
      <Drawer open title="Right drawer" onClose={close}>
        Body
      </Drawer>,
    );
    const rightDialog = screen.getByRole('dialog', { name: 'Right drawer' });
    expect(rightDialog).not.toHaveClass('leaf-drawer--swipeable');
    expect(rightDialog.querySelector('[data-swipe-handle]')).toBeNull();

    rerender(
      <Drawer open placement="bottom" title="Bottom sheet" onClose={close}>
        Body
      </Drawer>,
    );
    const bottomDialog = screen.getByRole('dialog', { name: 'Bottom sheet' });
    expect(bottomDialog).toHaveClass('leaf-drawer--placement-bottom', 'leaf-drawer--swipeable');
    const handle = bottomDialog.querySelector<HTMLElement>('[data-swipe-handle]');
    expect(handle).toHaveClass('leaf-drawer__swipe-handle--bottom');
    expect(handle).toHaveAttribute('aria-hidden', 'true');

    if (!handle) throw new Error('Swipe handle missing');
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 100, clientY: 100 });
    expect(bottomDialog).toHaveAttribute('data-swiping', 'true');
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 100, clientY: 120 });
    expect(bottomDialog.style.getPropertyValue('--leaf-drawer-swipe-transform')).toBe(
      'translateY(20px)',
    );
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 100, clientY: 120 });
    expect(close).not.toHaveBeenCalled();
    expect(bottomDialog).not.toHaveAttribute('data-swiping');

    fireEvent.pointerDown(handle, { pointerId: 2, button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(window, { pointerId: 2, clientX: 100, clientY: 240 });
    fireEvent.pointerUp(window, { pointerId: 2, clientX: 100, clientY: 240 });
    expect(close).toHaveBeenCalledOnce();

    rerender(
      <Drawer open placement="bottom" showSwipeHandle={false} title="No handle" onClose={close}>
        Body
      </Drawer>,
    );
    expect(screen.getByRole('dialog', { name: 'No handle' })).not.toHaveClass(
      'leaf-drawer--swipeable',
    );
    expect(
      screen.getByRole('dialog', { name: 'No handle' }).querySelector('[data-swipe-handle]'),
    ).toBeNull();

    rerender(
      <Drawer open placement="right" showSwipeHandle title="Right swipe" onClose={close}>
        Body
      </Drawer>,
    );
    const rightSwipe = screen.getByRole('dialog', { name: 'Right swipe' });
    expect(rightSwipe).toHaveClass('leaf-drawer--swipeable');
    expect(rightSwipe.querySelector('[data-swipe-handle]')).toHaveClass(
      'leaf-drawer__swipe-handle--right',
    );
  });

  it('uses localized drawer resize label on the resize separator handle', () => {
    render(
      <ConfigProvider locale="en-US">
        <Drawer open resizable width={360} title="Resizable">
          Body
        </Drawer>
      </ConfigProvider>,
    );
    const separator = screen.getByRole('separator', { name: 'Resize drawer' });
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveAttribute('aria-valuenow', '360');
  });
});
