import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrowRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { createRef, Fragment } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider/config-provider';
import { Dropdown } from '../dropdown/dropdown';
import { Button } from './button';
import { ButtonGroup } from './group';

describe('Button', () => {
  it('uses the outlined appearance by default', () => {
    render(<Button>默认按钮</Button>);
    expect(screen.getByRole('button', { name: '默认按钮' })).toHaveClass('leaf-button--outline');
  });

  it('supports icon button sizes and preserves an icon-only button name during loading', () => {
    const { rerender } = render(
      <Button size="icon" aria-label="添加项目">
        <Plus />
      </Button>,
    );
    const button = screen.getByRole('button', { name: '添加项目' });
    expect(button).toHaveClass('leaf-button--icon');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    rerender(
      <Button size="icon-sm" aria-label="添加项目" loading>
        <Plus />
      </Button>,
    );
    expect(button).toHaveClass('leaf-button--icon-sm');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('.leaf-button__spinner')).not.toBeNull();
    expect(button).toHaveAccessibleName('添加项目');
  });
  it('renders danger as a standalone variant and falls back from deprecated danger prop', async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button variant="danger" onClick={onClick}>
        <Trash2 />
        删除项目
      </Button>,
    );
    const button = screen.getByRole('button', { name: '删除项目' });
    expect(button).toHaveClass('leaf-button--danger');
    expect(button).not.toHaveClass('leaf-button--outline');
    expect(button).not.toHaveAttribute('danger');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    for (const variant of ['solid', 'outline', 'text', 'link'] as const) {
      rerender(
        <Button danger variant={variant}>
          删除项目
        </Button>,
      );
      expect(button).toHaveClass('leaf-button--danger');
      expect(button).not.toHaveClass(`leaf-button--${variant}`);
      expect(button).not.toHaveAttribute('danger');
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

  it.each(['solid', 'outline', 'text', 'link', 'danger'] as const)(
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
      <Button ref={ref} className="custom-button" aria-label="添加项目" size="icon">
        <span>+</span>
      </Button>,
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

  it('tracks text boundaries around icons and marks loading spinners at inline-start', () => {
    const { rerender } = render(
      <Button>
        <Fragment key="lead">
          {' '}
          <Plus />
        </Fragment>
        新建项目
      </Button>,
    );
    const button = screen.getByRole('button', { name: '新建项目' });
    expect(button).not.toHaveAttribute('data-leading-text');
    expect(button).toHaveAttribute('data-trailing-text', '');

    rerender(
      <Button>
        继续下一步
        <ArrowRight />
      </Button>,
    );
    expect(button).toHaveAttribute('data-leading-text', '');
    expect(button).not.toHaveAttribute('data-trailing-text');

    rerender(
      <Button>
        {0}
        <ArrowRight />
      </Button>,
    );
    expect(button).toHaveAttribute('data-leading-text', '');
    expect(button).not.toHaveAttribute('data-trailing-text');

    rerender(
      <Button>
        <Plus />
        新建并继续
        <ArrowRight />
      </Button>,
    );
    expect(button).not.toHaveAttribute('data-leading-text');
    expect(button).not.toHaveAttribute('data-trailing-text');

    rerender(
      <Button>
        点击
        <ArrowRight />
        继续
      </Button>,
    );
    expect(button).toHaveAttribute('data-leading-text', '');
    expect(button).toHaveAttribute('data-trailing-text', '');

    rerender(<Button>保存</Button>);
    expect(button).not.toHaveAttribute('data-leading-text');
    expect(button).not.toHaveAttribute('data-trailing-text');

    rerender(<Button loading>保存更改</Button>);
    expect(button.querySelector('.leaf-button__spinner')).toHaveAttribute(
      'data-icon',
      'inline-start',
    );
    expect(button).not.toHaveAttribute('data-leading-text');
    expect(button).not.toHaveAttribute('data-trailing-text');

    rerender(
      <Button variant="link">
        <Plus />
        链接操作
      </Button>,
    );
    expect(button).not.toHaveAttribute('data-leading-text');
    expect(button).not.toHaveAttribute('data-trailing-text');
  });
});

describe('ButtonGroup', () => {
  it('propagates size, variant, disabled and adapts icon button sizes across Dropdown triggers', async () => {
    const primaryClick = vi.fn();
    const copyClick = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());

    const { rerender } = render(
      <form onSubmit={submit}>
        <ButtonGroup size="sm" variant="solid" aria-label="保存操作组">
          <Button type="submit" onClick={primaryClick}>
            保存
          </Button>
          <Dropdown items={[{ key: 'copy', label: '保存副本', onClick: copyClick }]}>
            <Button size="icon" aria-label="更多保存方式">
              <ChevronDown />
            </Button>
          </Dropdown>
        </ButtonGroup>
      </form>,
    );

    const main = screen.getByRole('button', { name: '保存' });
    const more = screen.getByRole('button', { name: '更多保存方式' });
    const group = main.closest('fieldset');
    expect(group).toHaveClass('leaf-button-group', 'leaf-button-group--attached');
    expect(main).toHaveClass('leaf-button--sm', 'leaf-button--solid');
    expect(more).toHaveClass('leaf-button--icon-sm', 'leaf-button--solid');
    expect(more).toHaveAttribute('type', 'button');

    await userEvent.click(more);
    const menu = screen.getByRole('menu');
    expect(menu.closest('.leaf-dropdown')).toHaveClass('leaf-dropdown--sm');
    await userEvent.click(screen.getByRole('menuitem', { name: '保存副本' }));
    expect(copyClick).toHaveBeenCalledOnce();
    expect(primaryClick).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();

    await userEvent.click(main);
    expect(primaryClick).toHaveBeenCalledOnce();
    expect(submit).toHaveBeenCalledOnce();

    rerender(
      <form onSubmit={submit}>
        <ButtonGroup size="lg" variant="danger" attached={false} disabled aria-label="保存操作组">
          <Button disabled={false} variant="outline">
            保存
          </Button>
          <Dropdown items={[{ key: 'copy', label: '保存副本', onClick: copyClick }]}>
            <Button size="icon" aria-label="更多保存方式">
              <ChevronDown />
            </Button>
          </Dropdown>
        </ButtonGroup>
      </form>,
    );

    expect(group).toHaveClass('leaf-button-group');
    expect(group).not.toHaveClass('leaf-button-group--attached');
    expect(main).toHaveClass('leaf-button--lg', 'leaf-button--outline');
    expect(more).toHaveClass('leaf-button--icon-lg', 'leaf-button--danger');
    expect(main).toBeDisabled();
    expect(more).toBeDisabled();

    more.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('respects ConfigProvider Button size for icon triggers inside ButtonGroup without explicit group size', () => {
    render(
      <ConfigProvider components={{ Button: { size: 'sm' } }}>
        <ButtonGroup aria-label="组内按钮">
          <Button>保存</Button>
          <Button size="icon" aria-label="更多">
            <ChevronDown />
          </Button>
        </ButtonGroup>
      </ConfigProvider>,
    );

    expect(screen.getByRole('button', { name: '保存' })).toHaveClass('leaf-button--sm');
    expect(screen.getByRole('button', { name: '更多' })).toHaveClass('leaf-button--icon-sm');
  });
});
