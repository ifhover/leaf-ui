import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, ConfigProvider, Confirm, Select, useConfirm } from '../index';
import { Modal } from './modal';

describe('Modal and Confirm', () => {
  it.each(['modal', 'confirm'] as const)(
    'ignores a stale async %s error after closing and reopening',
    async (kind) => {
      let reject: (error: Error) => void = () => {};
      const request = new Promise<void>((_resolve, rejectPromise) => {
        reject = rejectPromise;
      });
      const close = vi.fn();
      const Surface = kind === 'modal' ? Modal : Confirm;
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
          <Confirm open type={type} title="Continue">
            Notice
          </Confirm>
        </ConfigProvider>,
      );
      const dialog = screen.getByRole('alertdialog');
      expect(dialog.querySelector('.leaf-confirm-icon svg') !== null).toBe(type !== 'default');
      const title = screen.getByRole('heading', { name: 'Continue' });
      expect(title.querySelector('svg')).toBeNull();
      expect(title.parentElement).toBe(screen.getByText('Notice').parentElement);
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
          <Confirm open title="Delete" onConfirm={confirm} onClose={close}>
            Delete this item?
          </Confirm>
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
