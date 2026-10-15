import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Alert,
  Badge,
  Card,
  Checkbox,
  CheckboxGroup,
  ConfigProvider,
  ErrorBoundary,
  Form,
  Input,
  InputNumber,
  Pagination,
  Progress,
  RadioGroup,
  Skeleton,
  Switch,
  Tabs,
  Tag,
  Transfer,
  useConfirm,
  useLoadingBar,
  useMessage,
  useNotification,
  VirtualList,
} from '../index';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function ServiceActions() {
  const { message } = useMessage();
  const notification = useNotification();
  const confirm = useConfirm();
  const loading = useLoadingBar();
  return (
    <>
      <button
        type="button"
        onClick={() => message.open({ content: <Tag>Message content tag</Tag> })}
      >
        Message request
      </button>
      <button type="button" onClick={() => notification.open({ title: 'Scoped notification' })}>
        Notification request
      </button>
      <button
        type="button"
        onClick={() => {
          void confirm.confirm({
            title: 'Scoped confirm',
            children: <Input aria-label="Confirm user input" />,
          });
        }}
      >
        Confirm request
      </button>
      <button type="button" onClick={() => loading.start()}>
        Start scoped bar
      </button>
      <button type="button" onClick={() => loading.reset()}>
        Reset scoped bar
      </button>
    </>
  );
}

describe('component defaults rollout', () => {
  it('isolates Transfer virtual lists from standalone generic list defaults', () => {
    const { container } = render(
      <ConfigProvider
        components={{ VirtualList: { horizontal: true, className: 'standalone-list' } }}
      >
        <VirtualList items={['Standalone row']} itemKey={(row) => row} renderItem={(row) => row} />
        <Transfer virtual items={[{ key: 'a', label: 'Transfer row' }]} />
      </ConfigProvider>,
    );
    expect(container.querySelectorAll('.standalone-list')).toHaveLength(1);
    expect(container.querySelector('.leaf-transfer .leaf-virtual-list__canvas')).toHaveStyle({
      width: '100%',
    });
  });
  it('keeps embedded tabs and pagination controls isolated from standalone defaults', () => {
    render(
      <ConfigProvider
        components={{
          Tabs: { size: 'lg', type: 'card' },
          Select: { disabled: true },
          Pagination: { size: 'sm', variant: 'ghost', showSizeChanger: true },
        }}
      >
        <Tabs items={[{ key: 'a', label: 'Standalone tab', children: 'Standalone panel' }]} />
        <Card
          title="Tabbed card"
          size="sm"
          tabs={{ items: [{ key: 'a', label: 'Embedded tab', children: 'Embedded panel' }] }}
        />
        <Pagination total={100} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('tab', { name: 'Standalone tab' }).closest('.leaf-tabs')).toHaveClass(
      'leaf-tabs--lg',
      'leaf-tabs--card',
    );
    expect(screen.getByRole('tab', { name: 'Embedded tab' }).closest('.leaf-tabs')).toHaveClass(
      'leaf-tabs--sm',
      'leaf-tabs--line',
    );
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });

  it('preserves the native numeric input, focus and current value when defaults change or reset', () => {
    const ref = createRef<HTMLInputElement>();
    const view = (defaults: 'sm' | 'lg' | null) => (
      <ConfigProvider components={{ InputNumber: defaults === null ? null : { size: defaults } }}>
        <form aria-label="Number form">
          <InputNumber ref={ref} name="amount" aria-label="Amount" defaultValue={4} />
        </form>
      </ConfigProvider>
    );
    const { rerender } = render(view('sm'));
    const node = screen.getByRole('spinbutton');
    fireEvent.focus(node);
    fireEvent.change(node, { target: { value: '7' } });
    rerender(view('lg'));
    expect(ref.current).toBe(node);
    expect(node).toHaveValue('7');
    rerender(view(null));
    expect(ref.current).toBe(node);
    expect(node).toHaveValue('7');
  });

  it('freezes request options while forwarding the calling scope to service content', () => {
    vi.useFakeTimers();
    const view = (duration: number) => (
      <ConfigProvider locale="en-US">
        <ConfigProvider
          components={{
            Message: { duration, type: 'warning' },
            Notification: { duration, placement: 'bottom-left' },
            Confirm: { confirmText: 'Proceed', showCancel: false },
            Tag: { variant: 'solid' },
            Input: { size: 'sm' },
            LoadingBar: { height: 5, position: 'bottom' },
          }}
        >
          <ServiceActions />
        </ConfigProvider>
      </ConfigProvider>
    );
    const { rerender } = render(view(1));
    fireEvent.click(screen.getByText('Message request'));
    fireEvent.click(screen.getByText('Notification request'));
    expect(screen.getByText('Message content tag').closest('.leaf-tag')).toHaveClass(
      'leaf-tag--solid',
    );
    expect(document.querySelector('.leaf-notification-region--bottom-left')).toHaveTextContent(
      'Scoped notification',
    );
    act(() => vi.advanceTimersByTime(500));
    rerender(view(10));
    act(() => vi.advanceTimersByTime(600));
    expect(document.querySelector('.leaf-message-slot')).toHaveAttribute('data-state', 'closing');
    expect(screen.queryByRole('status')).toBeNull();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('Message content tag')).toBeNull();
    expect(screen.queryByText('Scoped notification')).toBeNull();
    fireEvent.click(screen.getByText('Confirm request'));
    expect(screen.getByRole('button', { name: 'Proceed' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    expect(
      screen.getByRole('textbox', { name: 'Confirm user input' }).closest('.leaf-input'),
    ).toHaveClass('leaf-input--sm');
  });

  it('keeps loading presentation stable until the task batch completes', () => {
    const view = (height: number) => (
      <ConfigProvider components={{ LoadingBar: { height, position: 'bottom' } }}>
        <ServiceActions />
      </ConfigProvider>
    );
    const { rerender } = render(view(5));
    fireEvent.click(screen.getByText('Start scoped bar'));
    expect(screen.getByRole('progressbar')).toHaveStyle({ height: '5px' });
    rerender(view(9));
    expect(screen.getByRole('progressbar')).toHaveStyle({ height: '5px' });
    fireEvent.click(screen.getByText('Reset scoped bar'));
    fireEvent.click(screen.getByText('Start scoped bar'));
    expect(screen.getByRole('progressbar')).toHaveStyle({ height: '9px' });
  });

  it('retains the ErrorBoundary class ref and reacts to effective reset keys', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const ref = createRef<ErrorBoundary>();
    const reset = vi.fn();
    let broken = true;
    function Content() {
      if (broken) throw new Error('Test boundary');
      return <span>Recovered</span>;
    }
    const view = (key: number) => (
      <ConfigProvider
        components={{
          ErrorBoundary: { fallback: 'Configured fallback', resetKeys: [key], onReset: reset },
        }}
      >
        <ErrorBoundary ref={ref}>
          <Content />
        </ErrorBoundary>
      </ConfigProvider>
    );
    const { rerender } = render(view(1));
    const instance = ref.current;
    expect(screen.getByText('Configured fallback')).toBeVisible();
    broken = false;
    rerender(view(2));
    expect(ref.current).toBe(instance);
    expect(screen.getByText('Recovered')).toBeVisible();
    expect(reset).toHaveBeenCalledOnce();
  });
  it('keeps group values and field identities independent from individual control defaults', () => {
    const changed = vi.fn();
    render(
      <ConfigProvider
        components={{
          Checkbox: {
            defaultChecked: true,
            id: 'standalone-checkbox',
            name: 'standalone',
            onChange: changed,
          },
          Radio: { checked: true, name: 'standalone-radio' },
          CheckboxGroup: { size: 'sm', defaultValue: ['a'] },
          RadioGroup: { size: 'lg', defaultValue: 'a' },
        }}
      >
        <Form aria-label="Choice form">
          <Checkbox>Standalone choice</Checkbox>
          <CheckboxGroup
            name="checks"
            options={[
              { value: 'a', label: 'Check A' },
              { value: 'b', label: 'Check B' },
            ]}
          />
          <RadioGroup
            name="radio"
            options={[
              { value: 'a', label: 'Radio A' },
              { value: 'b', label: 'Radio B' },
            ]}
          />
        </Form>
      </ConfigProvider>,
    );
    const form = screen.getByRole('form') as HTMLFormElement;
    expect(screen.getByLabelText('Standalone choice')).toBeChecked();
    expect(screen.getByLabelText('Check B')).not.toBeChecked();
    expect(screen.getByLabelText('Radio B')).not.toBeChecked();
    fireEvent.click(screen.getByLabelText('Check B'));
    expect(changed).not.toHaveBeenCalled();
    expect(new FormData(form).getAll('checks')).toEqual(['a', 'b']);
    expect(new FormData(form).get('radio')).toBe('a');
    expect(form.querySelectorAll('#standalone-checkbox')).toHaveLength(1);
  });

  it('does not let explicit or configured enabled controls escape a disabled Form', () => {
    render(
      <ConfigProvider components={{ Checkbox: { disabled: false }, Switch: { disabled: false } }}>
        <Form disabled>
          <Checkbox disabled={false}>Locked choice</Checkbox>
          <Switch disabled={false}>Locked switch</Switch>
        </Form>
      </ConfigProvider>,
    );
    expect(screen.getByLabelText('Locked choice')).toBeDisabled();
    expect(screen.getByRole('switch')).toBeDisabled();
  });
  it('applies display defaults while preserving explicit false and local presentation', () => {
    const { container } = render(
      <ConfigProvider
        components={{
          Alert: { type: 'warning', showIcon: false },
          Badge: { dot: true },
          Card: { size: 'sm', divided: true },
          Progress: { showInfo: false, active: false },
          Tag: { variant: 'solid', closable: true },
        }}
      >
        <Alert title="Scoped warning" />
        <Badge count={2}>Badge target</Badge>
        <Card title="Scoped card" divided={false}>
          Card body
        </Card>
        <Progress percent={28} aria-label="Scoped progress" />
        <Tag closable={false}>Scoped tag</Tag>
      </ConfigProvider>,
    );
    expect(screen.getByRole('alert')).toHaveClass('leaf-alert--warning');
    expect(container.querySelector('.leaf-alert__icon')).toBeNull();
    expect(container.querySelector('.leaf-badge__indicator')).toHaveClass(
      'leaf-badge__indicator--dot',
    );
    expect(container.querySelector('.leaf-card')).toHaveClass('leaf-card--sm');
    expect(container.querySelector('.leaf-card')).not.toHaveClass('leaf-card--divided');
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('data-active');
    expect(container.querySelector('.leaf-tag')).toHaveClass('leaf-tag--solid');
    expect(container.querySelector('.leaf-tag__close')).toBeNull();
  });

  it('isolates implementation-owned loading placeholders from public Skeleton defaults', () => {
    render(
      <ConfigProvider components={{ Skeleton: { loading: true, rows: 8 } }}>
        <Skeleton>
          <span>Standalone loaded content</span>
        </Skeleton>
        <Card title="Ready card">
          <span>Ready card content</span>
        </Card>
      </ConfigProvider>,
    );
    expect(screen.queryByText('Standalone loaded content')).toBeNull();
    expect(screen.getByText('Ready card content')).toBeVisible();
  });

  it('uses inherited callbacks once and replaces them with an instance callback', () => {
    const inherited = vi.fn();
    const local = vi.fn();
    render(
      <ConfigProvider components={{ Alert: { closable: true, onClose: inherited } }}>
        <Alert title="Inherited close" />
        <Alert title="Local close" onClose={local} />
      </ConfigProvider>,
    );
    fireEvent.click(
      within(screen.getByText('Inherited close').closest('.leaf-alert') as HTMLElement).getByRole(
        'button',
      ),
    );
    fireEvent.click(
      within(screen.getByText('Local close').closest('.leaf-alert') as HTMLElement).getByRole(
        'button',
      ),
    );
    expect(inherited).toHaveBeenCalledOnce();
    expect(local).toHaveBeenCalledOnce();
  });
});
