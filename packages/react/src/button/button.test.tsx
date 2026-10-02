import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
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
