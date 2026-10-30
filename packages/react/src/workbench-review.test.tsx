import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { Anchor } from './anchor';
import { Button } from './button';
import { Carousel } from './carousel';
import { ConfigProvider } from './config-provider';
import { Drawer } from './drawer';
import { Popconfirm } from './popconfirm';
import { Text } from './typography';

vi.mock('tabbable', async (original) => {
  const actual = await original<typeof import('tabbable')>();
  // jsdom has no layout; real-browser coverage retains visibility checks.
  return {
    ...actual,
    tabbable: (node: HTMLElement) => actual.tabbable(node, { displayCheck: 'none' }),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  history.replaceState(null, '', '/');
});

it('lets keyboard users cancel or confirm a popconfirm and restores trigger focus', async () => {
  const confirm = vi.fn();
  render(
    <ConfigProvider locale="en-US">
      <Popconfirm title="Delete?" onConfirm={confirm}>
        <Button>Delete</Button>
      </Popconfirm>
    </ConfigProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Delete' });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
  await userEvent.tab();
  expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(confirm).toHaveBeenCalledOnce();
  await waitFor(() => expect(trigger).toHaveFocus());
});

it('copies and edits the rendered text of nested React children', async () => {
  const user = userEvent.setup();
  const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  const change = vi.fn();
  render(
    <ConfigProvider locale="en-US">
      <Text copyable editable={{ onChange: change }}>
        <strong>Hello</strong> <em>world</em>
        {42}
      </Text>
    </ConfigProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Copy text' }));
  expect(write).toHaveBeenCalledWith('Hello world42');
  await user.click(screen.getByRole('button', { name: 'Edit text' }));
  expect(screen.getByRole('textbox')).toHaveValue('Hello world42');
  await user.keyboard('{End}!{Enter}');
  expect(change).toHaveBeenCalledWith('Hello world42!');
});

it('honors explicit copy and edit text instead of rendered children', async () => {
  const user = userEvent.setup();
  const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  render(
    <ConfigProvider locale="en-US">
      <Text
        copyable={{ text: 'Copy override' }}
        editable={{ text: 'Edit override', onChange: vi.fn() }}
      >
        <b>Content</b>
      </Text>
    </ConfigProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Copy text' }));
  expect(write).toHaveBeenCalledWith('Copy override');
  await user.click(screen.getByRole('button', { name: 'Edit text' }));
  expect(screen.getByRole('textbox')).toHaveValue('Edit override');
});

it('updates anchor history, focuses the destination and keeps modified clicks native', async () => {
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  render(
    <>
      <Anchor
        smooth={false}
        items={[
          { key: 'target', title: 'Target', href: '#target' },
          { key: 'bad', title: 'Bad', href: '#%zz' },
        ]}
      />
      <h2 id="target">Destination</h2>
    </>,
  );
  const link = screen.getByRole('link', { name: 'Target' });
  fireEvent.click(link, { ctrlKey: true });
  expect(location.hash).toBe('');
  await userEvent.click(link);
  expect(location.hash).toBe('#target');
  expect(screen.getByText('Destination')).toHaveFocus();
  expect(scroll).toHaveBeenCalledWith({ top: -12, behavior: 'instant' });
  link.focus();
  expect(screen.getByText('Destination')).not.toHaveAttribute('tabindex');
  expect(() =>
    fireEvent.click(screen.getByRole('link', { name: 'Bad' }), { ctrlKey: true }),
  ).not.toThrow();
});

it('forwards carousel pointer and focus events and does not steal editor arrow keys', () => {
  const callbacks = {
    onPointerDown: vi.fn((event) => event.preventDefault()),
    onPointerUp: vi.fn(),
    onPointerCancel: vi.fn(),
    onPointerEnter: vi.fn(),
    onPointerLeave: vi.fn(),
    onFocus: vi.fn(),
    onBlur: vi.fn(),
  };
  const change = vi.fn();
  render(
    <Carousel {...callbacks} onChange={change}>
      <input aria-label="Slide input" />
      <p>Second</p>
    </Carousel>,
  );
  const carousel = screen.getByRole('region');
  fireEvent.pointerEnter(carousel);
  fireEvent.pointerDown(carousel, { clientX: 150 });
  fireEvent.pointerUp(carousel, { clientX: 0 });
  fireEvent.pointerCancel(carousel);
  fireEvent.pointerLeave(carousel);
  const input = screen.getByRole('textbox');
  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: 'ArrowRight' });
  fireEvent.blur(input);
  for (const callback of Object.values(callbacks)) expect(callback).toHaveBeenCalled();
  expect(change).not.toHaveBeenCalled();
});

it('uses one Drawer surface and keeps section dividers opt-in', () => {
  const { rerender } = render(
    <Drawer open title="Details">
      Content
    </Drawer>,
  );
  expect(screen.getByRole('dialog')).not.toHaveClass('leaf-drawer--card');
  expect(screen.getByRole('dialog')).not.toHaveClass('leaf-drawer--divided');
  rerender(
    <Drawer open divided title="Details">
      Content
    </Drawer>,
  );
  expect(screen.getByRole('dialog')).toHaveClass('leaf-drawer--divided');
});
