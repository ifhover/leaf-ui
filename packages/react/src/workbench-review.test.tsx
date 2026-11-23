import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { Anchor } from './anchor';
import { Breadcrumb } from './breadcrumb';
import { Button } from './button';
import { Carousel } from './carousel';
import { ConfigProvider } from './config-provider';
import { Descriptions } from './descriptions';
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

it('highlights bottom anchor section at container bottom, mirrors RTL breadcrumb separator, avoids empty Descriptions headings, and assigns stable keys to unkeyed Carousel slides', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const scrollBox = document.createElement('div');
  Object.defineProperties(scrollBox, {
    scrollTop: { value: 400, configurable: true },
    scrollHeight: { value: 800, configurable: true },
    clientHeight: { value: 400, configurable: true },
  });
  vi.spyOn(scrollBox, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 400, 400));

  const firstTarget = document.createElement('section');
  firstTarget.id = 'sec-1';
  vi.spyOn(firstTarget, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -100, 400, 200));
  const secondTarget = document.createElement('section');
  secondTarget.id = 'sec-2';
  // 第二个章节仍在 offset+24 之下，但容器已滚到底部，应自动高亮末节
  vi.spyOn(secondTarget, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 200, 400, 150));
  scrollBox.append(firstTarget, secondTarget);
  document.body.appendChild(scrollBox);

  const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0);
    return 1;
  });

  try {
    render(
      <ConfigProvider direction="rtl" locale="en-US">
        <Anchor
          container={() => scrollBox}
          items={[
            { key: '1', title: 'One', href: '#sec-1' },
            { key: '2', title: 'Two', href: '#sec-2' },
          ]}
        />
        <Breadcrumb items={[{ title: 'Home', href: '/' }, { title: 'Current' }]} />
        <Descriptions
          extra={<button type="button">Edit</button>}
          items={[{ key: 'a', label: 'Owner', children: 'Leaf' }]}
        />
        <Carousel>
          <div>Slide A</div>
          <div>Slide B</div>
        </Carousel>
      </ConfigProvider>,
    );
    expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('aria-current', 'location');
    expect(document.querySelector('.leaf-breadcrumb__separator svg')).toHaveClass(
      'lucide-chevron-left',
    );
    expect(document.querySelector('.leaf-descriptions__header h3')).toBeNull();
    expect(errorSpy).not.toHaveBeenCalled();
  } finally {
    rafSpy.mockRestore();
    errorSpy.mockRestore();
    scrollBox.remove();
  }
});
