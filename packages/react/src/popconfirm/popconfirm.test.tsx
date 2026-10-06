import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Button } from '../button';
import { ConfigProvider } from '../config-provider';
import { Popconfirm } from './popconfirm';

it('ignores an async completion from a previous controlled open cycle', async () => {
  let resolve: () => void = () => {};
  const request = new Promise<void>((done) => {
    resolve = done;
  });
  const change = vi.fn();
  const example = (open: boolean) => (
    <ConfigProvider locale="en-US">
      <Popconfirm open={open} onOpenChange={change} title="Delete item?" onConfirm={() => request}>
        <Button>Delete</Button>
      </Popconfirm>
    </ConfigProvider>
  );
  const { rerender } = render(example(true));
  await userEvent.click(screen.getByRole('button', { name: 'OK' }));
  rerender(example(false));
  rerender(example(true));
  change.mockClear();
  await act(async () => resolve());
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog', { name: 'Delete item?' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
});
