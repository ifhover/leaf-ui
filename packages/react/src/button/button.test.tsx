import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Plus, Trash2 } from 'lucide-react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('uses the outlined appearance by default', () => {
    render(<Button>默认按钮</Button>);
    expect(screen.getByRole('button', { name: '默认按钮' })).toHaveClass('leaf-button--outline');
  });

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
    for (const variant of ['solid', 'outline', 'link'] as const) {
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

  it('preserves preventDefault and the native click target during native activation', async () => {
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

  it.each(['solid', 'outline', 'link'] as const)(
    'keeps %s actions free of decorative wave nodes during repeated activation',
    async (variant) => {
      const onClick = vi.fn();
      const { rerender } = render(
        <Button variant={variant} onClick={onClick}>
          继续
        </Button>,
      );
      const button = screen.getByRole('button', { name: '继续' });
      await userEvent.click(button);
      await userEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(2);
      expect(button.querySelector('.leaf-button__wave')).toBeNull();
      rerender(
        <Button variant={variant} loading onClick={onClick}>
          继续
        </Button>,
      );
      expect(button).toBeDisabled();
      await userEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(2);
      expect(button.querySelector('.leaf-button__wave')).toBeNull();
    },
  );

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
