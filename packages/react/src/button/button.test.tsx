import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Plus, Trash2 } from 'lucide-react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('hides decorative icons and preserves an icon-only button name during loading', () => {
    const { rerender } = render(<Button aria-label="添加项目" startIcon={<Plus />} />);
    const button = screen.getByRole('button', { name: '添加项目' });
    expect(button).toHaveClass('leaf-button--icon-only');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    rerender(<Button aria-label="添加项目" startIcon={<Plus />} loading />);
    expect(button).toHaveClass('leaf-button--icon-only');
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleName('添加项目');
  });
  it('supports danger semantics with native click handling and every variant', async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button danger startIcon={<Trash2 />} onClick={onClick}>
        删除项目
      </Button>,
    );
    const button = screen.getByRole('button', { name: '删除项目' });
    expect(button).toHaveClass('leaf-button--danger');
    expect(button).not.toHaveAttribute('danger');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    for (const variant of ['solid', 'outline', 'soft', 'link'] as const) {
      rerender(
        <Button danger variant={variant}>
          删除项目
        </Button>,
      );
      expect(button).toHaveClass('leaf-button--danger', `leaf-button--${variant}`);
    }
  });
  it('passes native props and click events to the button', async () => {
    const onClick = vi.fn();
    render(
      <Button name="action" value="save" onClick={onClick}>
        保存
      </Button>,
    );
    const button = screen.getByRole('button', { name: '保存' });
    expect(button).toHaveAttribute('name', 'action');
    expect(button).toHaveAttribute('value', 'save');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('keeps link actions keyboard accessible without a wave and blocks loading actions', async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button variant="link" onClick={onClick}>
        详情
      </Button>,
    );
    const button = screen.getByRole('button', { name: '详情' });
    expect(button.querySelector('.leaf-button__wave')).toBeNull();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
    rerender(
      <Button variant="link" loading onClick={onClick}>
        详情
      </Button>,
    );
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleName('详情');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not accidentally submit a form by default', async () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>保存</Button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: '保存' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('supports an explicit submit button', async () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">提交</Button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('preserves preventDefault and the native click target when activation is decorated', async () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    const onClick = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" onClick={onClick}>
          保存
        </Button>
      </form>,
    );
    const button = screen.getByRole('button', { name: '保存' });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.calls[0]?.[0].target).toBe(button);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps native actions and consumer cancellation working if decorative animation is unsupported', async () => {
    const onClick = vi.fn((event) => event.preventDefault());
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" onClick={onClick}>
          继续
        </Button>
      </form>,
    );
    const button = screen.getByRole('button', { name: '继续' });
    const wave = button.querySelector('.leaf-button__wave') as HTMLElement;
    wave.animate = vi.fn(() => {
      throw new TypeError('Unsupported animation easing');
    });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('replaces an unfinished wave and cancels it when disabled, switched to soft or unmounted', () => {
    const { rerender, unmount } = render(<Button>继续</Button>);
    const button = screen.getByRole('button', { name: '继续' });
    const wave = button.querySelector('.leaf-button__wave') as HTMLElement;
    const first = { cancel: vi.fn(), onfinish: null };
    const second = { cancel: vi.fn(), onfinish: null };
    const third = { cancel: vi.fn(), onfinish: null };
    const fourth = { cancel: vi.fn(), onfinish: null };
    const animate = vi
      .fn()
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second)
      .mockReturnValueOnce(third)
      .mockReturnValueOnce(fourth);
    wave.animate = animate;
    fireEvent.click(button);
    fireEvent.click(button);
    expect(first.cancel).toHaveBeenCalledOnce();
    expect(button.querySelectorAll('.leaf-button__wave')).toHaveLength(1);
    rerender(<Button loading>继续</Button>);
    expect(second.cancel).toHaveBeenCalledOnce();
    fireEvent.click(button);
    expect(animate).toHaveBeenCalledTimes(2);
    rerender(<Button>继续</Button>);
    fireEvent.click(button);
    rerender(<Button variant="soft">继续</Button>);
    expect(third.cancel).toHaveBeenCalledOnce();
    fireEvent.click(button);
    expect(animate).toHaveBeenCalledTimes(3);
    rerender(<Button>继续</Button>);
    const restoredWave = button.querySelector('.leaf-button__wave') as HTMLElement;
    restoredWave.animate = animate;
    fireEvent.click(button);
    unmount();
    expect(fourth.cancel).toHaveBeenCalledOnce();
  });

  it('prevents mouse and keyboard actions while disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        不可操作
      </Button>,
    );
    const button = screen.getByRole('button', { name: '不可操作' });
    await userEvent.click(button);
    await userEvent.tab();
    expect(button).not.toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('blocks repeated interactions while loading and preserves the accessible name', async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button loading onClick={onClick}>
        保存更改
      </Button>,
    );
    const button = screen.getByRole('button', { name: '保存更改' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    rerender(<Button onClick={onClick}>保存更改</Button>);
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards refs for focus management and preserves custom attributes', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button
        ref={ref}
        className="custom-button"
        aria-label="添加项目"
        startIcon={<span>+</span>}
      />,
    );
    const button = screen.getByRole('button', { name: '添加项目' });
    expect(ref.current).toBe(button);
    expect(button).toHaveClass('leaf-button', 'custom-button');
    ref.current?.focus();
    expect(button).toHaveFocus();
  });

  it('supports keyboard activation', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>继续</Button>);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: '继续' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('preserves a consumer-provided aria-busy value when not loading', () => {
    render(<Button aria-busy="true">后台处理中</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});
