import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '../confirm/confirm';
import { Button, ConfigProvider, Select, useConfirm } from '../index';
import { Modal } from './modal';

describe('Modal and Confirm', () => {
  it('uses a plain content surface without changing dialog semantics', () => {
    render(
      <Modal open title="Content surface">
        Content
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Content surface' });
    expect(dialog).not.toHaveClass('leaf-modal--card');
    expect(dialog).toHaveClass('leaf-modal--divided');
    expect(dialog.querySelector('.leaf-modal__footer .leaf-button')).toHaveClass(
      'leaf-button--outline',
    );
  });
  it('allows disabling modal dividers while keeping confirmations on divided mini layout', () => {
    const { rerender } = render(
      <Modal open title="Undivided" divided={false}>
        Content
      </Modal>,
    );
    expect(screen.getByRole('dialog')).not.toHaveClass('leaf-modal--divided');
    rerender(
      <ConfigProvider components={{ Modal: { divided: false } }}>
        <ConfirmDialog open title="Confirm" onClose={() => {}}>
          Notice
        </ConfirmDialog>
      </ConfigProvider>,
    );
    const confirm = screen.getByRole('alertdialog');
    expect(confirm).toHaveClass('leaf-modal--mini', 'leaf-modal--divided');
  });
  it('places built-in footer actions directly inside the footer without an extra wrapper', () => {
    const { rerender } = render(
      <Modal open title="Default actions">
        Content
      </Modal>,
    );
    const footer = screen.getByRole('dialog').querySelector('.leaf-modal__footer');
    expect(footer?.querySelector('.leaf-modal__actions')).toBeNull();
    expect(footer?.children).toHaveLength(2);
    expect(footer?.querySelectorAll('button')).toHaveLength(2);
    rerender(
      <ConfirmDialog open title="Confirm" onClose={() => {}}>
        Notice
      </ConfirmDialog>,
    );
    const confirmFooter = screen.getByRole('alertdialog').querySelector('.leaf-modal__footer');
    expect(confirmFooter?.querySelector('.leaf-modal__actions')).toBeNull();
    expect(confirmFooter?.children).toHaveLength(2);
  });
  it('defaults confirmations to a neutral icon tray while supporting hidden and custom icons', () => {
    const { rerender } = render(
      <ConfirmDialog open title="Continue" onClose={() => {}}>
        Notice
      </ConfirmDialog>,
    );
    const dialog = screen.getByRole('alertdialog', { name: 'Continue' });
    expect(dialog).toHaveClass('leaf-confirm--default', 'leaf-modal--mini');
    expect(dialog).toHaveStyle({ width: '340px' });
    expect(
      dialog.querySelector('.leaf-modal__header > .leaf-modal__icon .lucide-info'),
    ).not.toBeNull();
    expect(dialog.querySelector('.leaf-modal__header > .leaf-modal__icon')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(dialog).toHaveAccessibleDescription('Notice');
    rerender(
      <ConfirmDialog open title="Continue" icon={<span>Lock</span>} onClose={() => {}}>
        Notice
      </ConfirmDialog>,
    );
    expect(dialog).toHaveClass('leaf-confirm--default');
    expect(screen.getByText('Lock').closest('.leaf-modal__icon')).not.toBeNull();
    rerender(
      <ConfirmDialog open title="Continue" icon={null} onClose={() => {}}>
        Notice
      </ConfirmDialog>,
    );
    expect(dialog).toHaveClass('leaf-confirm--default');
    expect(dialog.querySelector('.leaf-modal__icon')).toBeNull();
  });
  it('associates supporting text with the dialog and keeps decorative icons outside its name', () => {
    render(
      <Modal
        open
        title="Access"
        description="Choose the services this agent may access"
        icon={<span>Shield</span>}
        aria-describedby="extra-description"
        footer={null}
      >
        <p id="extra-description">Changes take effect immediately</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Access' });
    expect(dialog.querySelector('.leaf-modal__header')).toHaveClass('leaf-modal__header--icon');
    expect(dialog).toHaveAccessibleDescription(
      'Changes take effect immediately Choose the services this agent may access',
    );
    expect(dialog.querySelector('.leaf-modal__icon')).toHaveAttribute('aria-hidden', 'true');
    expect(dialog.querySelector('.leaf-modal__header > .leaf-modal__close')).toBeNull();
    expect(dialog).toHaveClass('leaf-modal--closable');
    expect(dialog.querySelector(':scope > .leaf-modal__close')).not.toBeNull();
    expect(dialog).not.toHaveAttribute('divided');
  });
  it('omits empty header shells on untitled modals while keeping the floating close action', () => {
    render(
      <Modal open aria-label="Frameless notice" footer={null}>
        Notice body
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Frameless notice' });
    expect(dialog).toHaveClass('leaf-modal--closable');
    expect(dialog.querySelector('.leaf-modal__header')).toBeNull();
    expect(dialog.querySelector(':scope > .leaf-modal__close')).not.toBeNull();
    expect(screen.getByText('Notice body')).toBeInTheDocument();
  });
  it('places a custom confirmation icon in the header tray, outside its accessible name', () => {
    render(
      <ConfirmDialog
        open
        type="danger"
        title="Delete project"
        icon={<span>Lock</span>}
        onClose={() => {}}
      >
        This cannot be undone.
      </ConfirmDialog>,
    );
    const dialog = screen.getByRole('alertdialog', { name: 'Delete project' });
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
    expect(dialog).toHaveClass('leaf-modal--mini', 'leaf-modal--danger', 'leaf-modal--divided');
    expect(screen.getByText('Lock').closest('.leaf-modal__icon')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByText('Lock').closest('.leaf-modal__header')).not.toBeNull();
    expect(dialog.querySelector('.leaf-modal__close')).toBeNull();
  });
  it('keeps an untitled confirmation icon in the centered header tray and supports hiding it', () => {
    const { rerender } = render(
      <ConfirmDialog open type="warning" onClose={() => {}}>
        Continue with these settings?
      </ConfirmDialog>,
    );
    const dialog = screen.getByRole('alertdialog');
    expect(dialog.querySelector('.leaf-modal__header > .leaf-modal__icon svg')).not.toBeNull();
    rerender(
      <ConfirmDialog open type="warning" title="Continue" icon={null} onClose={() => {}}>
        Continue with these settings?
      </ConfirmDialog>,
    );
    expect(screen.getByRole('alertdialog', { name: 'Continue' })).not.toHaveClass(
      'leaf-modal--danger',
    );
    expect(dialog.querySelector('.leaf-modal__icon')).toBeNull();
  });
  it.each(['modal', 'confirm'] as const)(
    'ignores a stale async %s error after closing and reopening',
    async (kind) => {
      let reject: (error: Error) => void = () => {};
      const request = new Promise<void>((_resolve, rejectPromise) => {
        reject = rejectPromise;
      });
      const close = vi.fn();
      const Surface = kind === 'modal' ? Modal : ConfirmDialog;
      const example = (open: boolean) => (
        <ConfigProvider locale="en-US">
          <Surface open={open} title="Save" onConfirm={() => request} onClose={close}>
            Details
          </Surface>
        </ConfigProvider>
      );
      const { rerender } = render(example(true));
      await userEvent.click(screen.getByRole('button', { name: 'OK' }));
      rerender(example(false));
      rerender(example(true));
      await act(async () => reject(new Error('Previous save failed')));
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
      expect(close).not.toHaveBeenCalled();
    },
  );
  it('supplies default actions to an extended footer and respects native form validation', async () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const close = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Modal
          open
          title="Edit"
          onClose={close}
          confirmButtonProps={{ type: 'submit', form: 'edit-form' }}
          footer={({ cancelButton, confirmButton }) => (
            <>
              <Button>Help</Button>
              {cancelButton}
              {confirmButton}
            </>
          )}
        >
          <form id="edit-form" onSubmit={submit}>
            <input aria-label="Title" required />
          </form>
        </Modal>
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(submit).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Leaf');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(submit).toHaveBeenCalledOnce();
    expect(close).not.toHaveBeenCalled();
  });
  it('hides a null or false footer, skips boolean shells, and propagates custom aria-labelledby to the scrollable region', async () => {
    const close = vi.fn();
    const { rerender } = render(
      <>
        <h2 id="external-modal-heading">External heading</h2>
        <Modal
          open
          title={false}
          aria-labelledby="external-modal-heading"
          footer={false}
          onClose={close}
        >
          {false}
        </Modal>
      </>,
    );
    const externalDialog = screen.getByRole('dialog', { name: 'External heading' });
    expect(externalDialog.querySelector('.leaf-modal__header')).toBeNull();
    expect(externalDialog.querySelector('.leaf-modal__body')).toBeNull();
    expect(externalDialog.querySelector('.leaf-modal__footer')).toBeNull();

    rerender(
      <>
        <h2 id="external-modal-heading">External heading</h2>
        <Modal open aria-labelledby="external-modal-heading" footer={() => false} onClose={close}>
          Scrollable details
        </Modal>
      </>,
    );
    expect(screen.getByRole('region', { name: 'External heading' })).toBeInTheDocument();
    expect(screen.getByRole('dialog').querySelector('.leaf-modal__footer')).toBeNull();

    rerender(<Modal open title="Edit" footer={null} onClose={close} />);
    expect(screen.queryByRole('button', { name: '确定' })).toBeNull();
    rerender(
      <Modal
        open
        title="Edit"
        onClose={close}
        onConfirm={() => Promise.reject(new Error('Save failed'))}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    await waitFor(() => expect(screen.getByRole('button', { name: '确定' })).toBeEnabled());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(close).not.toHaveBeenCalled();
  });
  it.each(['default', 'success', 'warning', 'danger'] as const)(
    'renders %s confirmation actions and icons',
    (type) => {
      render(
        <ConfigProvider locale="en-US">
          <ConfirmDialog open type={type} title="Continue" onClose={() => {}}>
            Notice
          </ConfirmDialog>
        </ConfigProvider>,
      );
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveClass('leaf-modal--mini', 'leaf-modal--divided');
      expect(dialog.classList.contains('leaf-modal--danger')).toBe(type === 'danger');
      expect(dialog.querySelector('.leaf-modal__header > .leaf-modal__icon svg')).not.toBeNull();
      const iconSelector = {
        default: '.lucide-info',
        success: '.lucide-check',
        warning: '.lucide-triangle-alert',
        danger: '.lucide-circle-alert',
      }[type];
      expect(dialog.querySelector(`.leaf-modal__icon ${iconSelector}`)).not.toBeNull();
      const title = screen.getByRole('heading', { name: 'Continue' });
      expect(title.closest('.leaf-modal__header')).not.toBeNull();
      expect(screen.getByText('Notice').closest('.leaf-modal__body')).not.toBeNull();
      expect(dialog).toHaveAccessibleName('Continue');
      expect(screen.queryByRole('button', { name: 'Cancel' }) !== null).toBe(type !== 'success');
      expect(
        screen.getByRole('button', { name: 'OK' }).classList.contains('leaf-button--danger'),
      ).toBe(type === 'danger');
    },
  );
  it('locks scrolling, restores focus and closes with Escape', async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open</Button>
          <Modal open={open} title="Settings" onClose={() => setOpen(false)}>
            <Button>Inside</Button>
          </Modal>
        </>
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByText('Open'));
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });
  it('allows a portalled picker inside a modal, closing the picker first', async () => {
    const close = vi.fn();
    render(
      <Modal open title="Settings" onClose={close}>
        <Select aria-label="Choice" options={[{ value: 'a', label: 'Alpha' }]} />
      </Modal>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{ArrowDown}{Escape}');
    expect(close).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).toBeNull();
    await userEvent.keyboard('{Escape}');
    expect(close).toHaveBeenCalledOnce();
  });
  it('closes standalone rejected confirmations cleanly and handles async success in StrictMode', async () => {
    const close = vi.fn();
    const confirm = vi
      .fn()
      .mockRejectedValueOnce(new Error('Try again'))
      .mockResolvedValueOnce(undefined);
    const { rerender } = render(
      <StrictMode>
        <ConfigProvider locale="en-US">
          <ConfirmDialog open title="Delete" onConfirm={confirm} onClose={close}>
            Delete this item?
          </ConfirmDialog>
        </ConfigProvider>
      </StrictMode>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).toBeNull();

    rerender(
      <StrictMode>
        <ConfigProvider locale="en-US">
          <ConfirmDialog open title="Delete" onConfirm={confirm} onClose={close}>
            Delete this item?
          </ConfirmDialog>
        </ConfigProvider>
      </StrictMode>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => expect(close).toHaveBeenCalledTimes(2));
  });
  it('resolves hook requests independently and preserves content during dismissal', async () => {
    let result: Promise<boolean> | undefined;
    function Example() {
      const { confirm } = useConfirm();
      return (
        <Button
          onClick={() => {
            result = confirm({ title: 'Continue', children: 'Ready?' });
          }}
        >
          Open
        </Button>
      );
    }
    render(
      <ConfigProvider>
        <Example />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByText('Open'));
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    await expect(result).resolves.toBe(true);
    await act(async () => {});
  });
  it('allocates monotonic layers across hook confirmations, out-of-order close, and theme tokens', async () => {
    function Example({ firstOpen }: { firstOpen: boolean }) {
      const { confirm } = useConfirm();
      const [third, setThird] = useState(false);
      return (
        <>
          <Modal open={firstOpen} title="First modal">
            <Button
              onClick={() => {
                void confirm({ title: 'Root confirm', children: 'Proceed?' });
              }}
            >
              Ask
            </Button>
          </Modal>
          <Button onClick={() => setThird(true)}>Open third</Button>
          <Modal open={third} title="Third modal" />
        </>
      );
    }

    const { rerender } = render(
      <ConfigProvider locale="en-US" theme={{ tokens: { modalZIndex: 1300 } }}>
        <Example firstOpen={false} />
      </ConfigProvider>,
    );
    // 未打开且非 forceRender 的 Modal 不应预先挂载 .leaf-portal-scope
    expect(document.querySelectorAll('.leaf-portal-scope')).toHaveLength(0);

    rerender(
      <ConfigProvider locale="en-US" theme={{ tokens: { modalZIndex: 1300 } }}>
        <Example firstOpen />
      </ConfigProvider>,
    );
    const firstMask = screen
      .getByRole('dialog', { name: 'First modal' })
      .closest<HTMLElement>('.leaf-modal-mask');
    expect(
      firstMask
        ?.closest<HTMLElement>('.leaf-portal-scope')
        ?.style.getPropertyValue('--leaf-z-index-modal'),
    ).toBe('1300');
    expect(firstMask?.style.zIndex).toBe('');

    await userEvent.click(screen.getByRole('button', { name: 'Ask' }));
    const confirmMask = screen
      .getByRole('alertdialog', { name: 'Root confirm' })
      .closest<HTMLElement>('.leaf-modal-mask');
    expect(confirmMask?.style.zIndex).toBe('calc(var(--leaf-z-index-modal, 1100) + 2)');

    // 底层 First modal 在 Root confirm 之后先关闭，新打开的 Third modal 仍需高于 Root confirm
    rerender(
      <ConfigProvider locale="en-US" theme={{ tokens: { modalZIndex: 1300 } }}>
        <Example firstOpen={false} />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open third' }));
    const thirdMask = screen
      .getByRole('dialog', { name: 'Third modal' })
      .closest<HTMLElement>('.leaf-modal-mask');
    expect(thirdMask?.style.zIndex).toBe('calc(var(--leaf-z-index-modal, 1100) + 4)');
  });

  it('supports uniform and section-level padding overrides including ConfigProvider defaults', () => {
    const { rerender } = render(
      <Modal open title="Default spacing" padding={{ body: 'none', footer: 12 }}>
        Content
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Default spacing' });
    expect(dialog).toHaveClass('leaf-modal--divided');
    expect(dialog).not.toHaveAttribute('data-header-padding');
    expect(dialog).toHaveAttribute('data-body-padding', '');
    expect(dialog).toHaveAttribute('data-footer-padding', '');
    expect(dialog.style.getPropertyValue('--leaf-modal-header-padding')).toBe('');
    expect(dialog.style.getPropertyValue('--leaf-modal-body-padding')).toBe('0px');
    expect(dialog.style.getPropertyValue('--leaf-modal-footer-padding')).toBe('12px');

    rerender(
      <ConfigProvider components={{ Modal: { padding: 28 } }}>
        <Modal open title="Configured" padding="10px 18px">
          Content
        </Modal>
      </ConfigProvider>,
    );
    const configured = screen.getByRole('dialog', { name: 'Configured' });
    expect(configured).not.toHaveAttribute('data-header-padding');
    expect(configured).not.toHaveAttribute('data-body-padding');
    expect(configured).not.toHaveAttribute('data-footer-padding');
    expect(configured.style.getPropertyValue('--leaf-modal-shell-padding-top')).toBe('10px');
    expect(configured.style.getPropertyValue('--leaf-modal-shell-padding-right')).toBe('18px');
    expect(configured.style.getPropertyValue('--leaf-modal-header-padding')).toBe('10px 18px');
    expect(configured.style.getPropertyValue('--leaf-modal-body-padding')).toBe('10px 18px');
    expect(configured.style.getPropertyValue('--leaf-modal-footer-padding')).toBe('10px 18px');
    expect(configured.style.getPropertyValue('--leaf-modal-close-inset-top')).toBe('10px');
    expect(configured.style.getPropertyValue('--leaf-modal-close-inset-right')).toBe('18px');
    expect(configured.style.getPropertyValue('--leaf-modal-close-inset-left')).toBe('18px');
  });

  it('supports mini size narrowing default width while keeping manual widths and danger actions', () => {
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Modal
          open
          size="mini"
          danger
          icon={<span>Trash</span>}
          title="Delete chat?"
          description="This will permanently delete this chat conversation."
          confirmText="Delete"
        />
      </ConfigProvider>,
    );
    const mini = screen.getByRole('dialog', { name: 'Delete chat?' });
    expect(mini).toHaveClass('leaf-modal--mini', 'leaf-modal--danger', 'leaf-modal--divided');
    expect(mini).toHaveStyle({ width: '340px' });
    expect(mini).toHaveAccessibleDescription(
      'This will permanently delete this chat conversation.',
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('leaf-button--danger');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('leaf-button--outline');

    rerender(
      <ConfigProvider locale="en-US" components={{ Modal: { width: 520 } }}>
        <Modal
          open
          size="mini"
          danger
          confirmButtonProps={{ variant: 'solid' }}
          title="Configured width"
        />
      </ConfigProvider>,
    );
    const configured = screen.getByRole('dialog', { name: 'Configured width' });
    expect(configured).toHaveStyle({ width: '520px' });
    expect(screen.getByRole('button', { name: 'OK' })).toHaveClass('leaf-button--solid');

    rerender(
      <ConfigProvider locale="en-US">
        <Modal open size="mini" width={400} title="Explicit width" />
      </ConfigProvider>,
    );
    expect(screen.getByRole('dialog', { name: 'Explicit width' })).toHaveStyle({ width: '400px' });
  });
});
