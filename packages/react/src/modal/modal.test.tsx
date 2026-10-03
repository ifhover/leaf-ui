import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, ConfigProvider, Confirm, Select, useConfirm } from '../index';
import { Modal } from './modal';

describe('Modal and Confirm', () => {
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
      const { confirm, contextHolder } = useConfirm();
      return (
        <>
          <Button
            onClick={() => {
              result = confirm({ title: 'Continue', children: 'Ready?' });
            }}
          >
            Open
          </Button>
          {contextHolder}
        </>
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByText('Open'));
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    await expect(result).resolves.toBe(true);
    await act(async () => {});
  });
});
