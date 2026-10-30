import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '../confirm/confirm';
import { Button, ConfigProvider, Select, Space, useConfirm } from '../index';
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
  it('allows disabling modal dividers without adding them to confirmations', () => {
    const { rerender } = render(
      <Modal open title="Undivided" divided={false}>
        Content
      </Modal>,
    );
    expect(screen.getByRole('dialog')).not.toHaveClass('leaf-modal--divided');
    rerender(
      <ConfigProvider components={{ Modal: { divided: true } }}>
        <ConfirmDialog open title="Confirm" onClose={() => {}}>
          Notice
        </ConfirmDialog>
      </ConfigProvider>,
    );
    expect(screen.getByRole('alertdialog')).not.toHaveClass('leaf-modal--divided');
  });
  it('groups only built-in footer actions and leaves Confirm footer structure unchanged', () => {
    const { rerender } = render(
      <Modal open title="Default actions">
        Content
      </Modal>,
    );
    const footer = screen.getByRole('dialog').querySelector('.leaf-modal__footer');
    const actions = footer?.querySelector('.leaf-modal__actions');
    expect(footer?.children).toHaveLength(1);
    expect(actions?.querySelectorAll('button')).toHaveLength(2);
    rerender(
      <ConfirmDialog open title="Confirm" onClose={() => {}}>
        Notice
      </ConfirmDialog>,
    );
    const confirmFooter = screen.getByRole('alertdialog').querySelector('.leaf-modal__footer');
    expect(confirmFooter?.querySelector('.leaf-modal__actions')).toBeNull();
    expect(confirmFooter?.children).toHaveLength(2);
  });
  it('defaults confirmations to info and keeps default and hidden icons explicit', () => {
    const { rerender } = render(
      <ConfirmDialog open title="Continue" onClose={() => {}}>
        Notice
      </ConfirmDialog>,
    );
    const dialog = screen.getByRole('alertdialog', { name: 'Continue' });
    expect(dialog).toHaveClass('leaf-confirm--info', 'leaf-confirm--titled-icon');
    expect(dialog.querySelector('.leaf-modal__header .leaf-confirm__icon svg')).not.toBeNull();
    expect(dialog).toHaveAccessibleDescription('Notice');
    rerender(
      <ConfirmDialog open title="Continue" type="default" onClose={() => {}}>
        Notice
      </ConfirmDialog>,
    );
    expect(dialog).toHaveClass('leaf-confirm--default');
    expect(dialog.querySelector('.leaf-confirm__icon')).toBeNull();
    rerender(
      <ConfirmDialog open title="Continue" icon={null} onClose={() => {}}>
        Notice
      </ConfirmDialog>,
    );
    expect(dialog).toHaveClass('leaf-confirm--info');
    expect(dialog.querySelector('.leaf-confirm__icon')).toBeNull();
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
    expect(dialog).not.toHaveAttribute('divided');
  });
  it('places a custom confirmation icon beside the title, outside its accessible name', () => {
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
    expect(screen.getByRole('alertdialog', { name: 'Delete project' })).toHaveAccessibleDescription(
      'This cannot be undone.',
    );
    expect(screen.getByText('Lock').closest('.leaf-confirm__icon')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByText('Lock').closest('.leaf-modal__header')).not.toBeNull();
    expect(screen.getByText('Lock').closest('.leaf-confirm__body')).toBeNull();
    expect(screen.getByRole('alertdialog')).not.toHaveClass('leaf-modal--divided');
    expect(screen.getByRole('alertdialog').querySelector('.leaf-modal__close')).toBeNull();
  });
  it('keeps an untitled confirmation icon beside its content and supports hiding it', () => {
    const { rerender } = render(
      <ConfirmDialog open type="warning" onClose={() => {}}>
        Continue with these settings?
      </ConfirmDialog>,
    );
    const dialog = screen.getByRole('alertdialog');
    expect(dialog.querySelector('.leaf-confirm__body > .leaf-confirm__icon')).not.toBeNull();
    expect(dialog.querySelector('.leaf-modal__header')).toBeNull();
    rerender(
      <ConfirmDialog open type="warning" title="Continue" icon={null} onClose={() => {}}>
        Continue with these settings?
      </ConfirmDialog>,
    );
    expect(screen.getByRole('alertdialog', { name: 'Continue' })).not.toHaveClass(
      'leaf-confirm--titled-icon',
    );
    expect(dialog.querySelector('.leaf-confirm__icon')).toBeNull();
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
            <Space size="sm" wrap>
              <Button>Help</Button>
              {cancelButton}
              {confirmButton}
            </Space>
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
  it('hides a null footer and keeps rejected async modal actions open', async () => {
    const close = vi.fn();
    const { rerender } = render(<Modal open title="Edit" footer={null} onClose={close} />);
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
    expect(await screen.findByRole('alert')).toHaveTextContent('Save failed');
    expect(close).not.toHaveBeenCalled();
  });
  it.each(['default', 'info', 'success', 'warning', 'danger'] as const)(
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
      expect(dialog.querySelector('.leaf-modal__header .leaf-confirm__icon svg') !== null).toBe(
        type !== 'default',
      );
      if (type === 'danger')
        expect(dialog.querySelector('.leaf-confirm__icon .lucide-circle-alert')).not.toBeNull();
      expect(dialog.querySelector('.leaf-modal__header .leaf-modal__icon')).toBeNull();
      const title = screen.getByRole('heading', { name: 'Continue' });
      expect(title.querySelector('svg') !== null).toBe(type !== 'default');
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
  it('keeps rejected confirmations visible and handles async success in StrictMode', async () => {
    const close = vi.fn();
    const confirm = vi
      .fn()
      .mockRejectedValueOnce(new Error('Try again'))
      .mockResolvedValueOnce(undefined);
    render(
      <StrictMode>
        <ConfigProvider locale="en-US">
          <ConfirmDialog open title="Delete" onConfirm={confirm} onClose={close}>
            Delete this item?
          </ConfirmDialog>
        </ConfigProvider>
      </StrictMode>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Try again');
    expect(close).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
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
});
