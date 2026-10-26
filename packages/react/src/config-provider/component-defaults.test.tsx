import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, memo } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  Button,
  Form,
  FormField,
  Input,
  InputSearch,
  Modal,
  Pagination,
  Select,
  SplitButton,
  Upload,
  useConfirm,
} from '../index';
import {
  type LeafComponentDefaults,
  mergeComponentDefaults,
  mergeComponentProps,
  useComponentProps,
} from './component-defaults';
import { ConfigProvider, useLeafConfig } from './config-provider';

describe('component defaults merging', () => {
  it('only copies props when supplementing a defined default', () => {
    const props = { size: 'lg', disabled: false, value: '', count: 0, footer: null };
    expect(mergeComponentProps(undefined, props)).toBe(props);
    expect(
      mergeComponentProps({ size: 'sm', disabled: true, value: 'Leaf', count: 1 }, props),
    ).toBe(props);
    expect(mergeComponentProps({ size: undefined }, {})).toEqual({});
    const missing: { size?: string; disabled?: boolean } = { size: undefined, disabled: false };
    expect(mergeComponentProps({ size: 'sm', disabled: true }, missing)).toEqual({
      size: 'sm',
      disabled: false,
    });
    expect(missing).toEqual({ size: undefined, disabled: false });
  });

  it('keeps nested values and callback references and replaces them as a whole', () => {
    const style = { color: 'red', padding: 10 };
    const options = [{ value: 'leaf', label: 'Leaf' }];
    const callback = vi.fn();
    const defaults = { style, options, className: 'global', onClick: callback };
    const props = mergeComponentProps(defaults, {} as Partial<typeof defaults>);
    expect(props.style).toBe(style);
    expect(props.options).toBe(options);
    expect(props.onClick).toBe(callback);
    const localStyle = { color: 'blue' };
    const localCallback = vi.fn();
    const resolved = mergeComponentProps(defaults, {
      style: localStyle,
      className: '',
      onClick: localCallback,
    } as Partial<typeof defaults>);
    expect(resolved.style).toBe(localStyle);
    expect(resolved.className).toBe('');
    resolved.onClick?.();
    expect(localCallback).toHaveBeenCalledOnce();
    expect(callback).not.toHaveBeenCalled();
  });

  it('merges nested scopes by prop without mutating or recopying unchanged entries', () => {
    const style = { color: 'red', padding: 10 };
    const input = { allowClear: true };
    const parent: LeafComponentDefaults = {
      Button: { variant: 'outline', size: 'sm', style, onClick: vi.fn() },
      Input: input,
    };
    expect(mergeComponentDefaults(parent, undefined)).toBe(parent);
    expect(mergeComponentDefaults(parent, { Button: {} })).toBe(parent);
    expect(mergeComponentDefaults(parent, { Button: { size: undefined } })).toBe(parent);
    expect(mergeComponentDefaults(parent, { Button: { size: 'sm', style } })).toBe(parent);
    const innerStyle = { color: 'blue' };
    const innerCallback = vi.fn();
    const inner: LeafComponentDefaults = {
      Button: { size: 'lg', style: innerStyle, onClick: innerCallback },
      Modal: { footer: null },
    };
    const merged = mergeComponentDefaults(parent, inner);
    expect(merged.Button).toEqual({
      variant: 'outline',
      size: 'lg',
      style: innerStyle,
      onClick: innerCallback,
    });
    expect(merged.Input).toBe(input);
    expect(merged.Modal?.footer).toBeNull();
    expect(parent.Button?.size).toBe('sm');
    expect(inner.Button?.variant).toBeUndefined();
  });

  it('clears one inherited entry with null without mutating its parent or other defaults', () => {
    const input = { allowClear: true };
    const parent: LeafComponentDefaults = {
      Button: { variant: 'outline', size: 'sm' },
      Input: input,
    };
    const cleared = mergeComponentDefaults(parent, { Button: null });
    expect(cleared.Button).toBeUndefined();
    expect(cleared.Input).toBe(input);
    expect(parent.Button).toEqual({ variant: 'outline', size: 'sm' });
    expect(mergeComponentDefaults(cleared, { Button: null })).toBe(cleared);
    expect(mergeComponentDefaults(cleared, { Button: undefined })).toBe(cleared);
    expect(mergeComponentDefaults(cleared, { Button: { size: 'lg' } }).Button).toEqual({
      size: 'lg',
    });
    expect(mergeComponentProps(null, input)).toBe(input);
  });
});

describe('ConfigProvider component defaults', () => {
  it('restores local uncontrolled inputs after clearing shared defaults and preserves them on updates', async () => {
    const example = (value: string) => (
      <ConfigProvider
        components={{ Input: { value, readOnly: true }, Button: { variant: 'outline' } }}
      >
        <ConfigProvider components={{ Input: null, Button: null }}>
          <form aria-label="Reset scope">
            <Input aria-label="Local name" defaultValue="Local" />
            <Button>Built in again</Button>
            <ConfigProvider components={{ Input: { allowClear: true } }}>
              <Input aria-label="New defaults" defaultValue="Nested" />
            </ConfigProvider>
          </form>
        </ConfigProvider>
        <Input aria-label="Shared name" />
      </ConfigProvider>
    );
    const { rerender } = render(example('Shared'));
    const input = screen.getByRole('textbox', { name: 'Local name' });
    expect(input).not.toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Built in again' })).toHaveClass(
      'leaf-button--outline',
    );
    await userEvent.type(input, ' edit');
    rerender(example('Updated shared'));
    expect(screen.getByRole('textbox', { name: 'Local name' })).toBe(input);
    expect(input).toHaveValue('Local edit');
    expect(screen.getByRole('textbox', { name: 'Shared name' })).toHaveValue('Updated shared');
    expect(screen.getByRole('textbox', { name: 'New defaults' })).toHaveValue('Nested');
    await userEvent.click(screen.getByRole('button', { name: '清除输入' }));
    expect(screen.getByRole('textbox', { name: 'New defaults' })).toHaveValue('');
    await act(async () =>
      (screen.getByRole('form', { name: 'Reset scope' }) as HTMLFormElement).reset(),
    );
    expect(input).toHaveValue('Local');
  });

  it('resets InputSearch and its shared Input defaults independently', () => {
    render(
      <ConfigProvider
        components={{ Input: { defaultValue: 'Shared' }, InputSearch: { defaultValue: 'Search' } }}
      >
        <ConfigProvider components={{ InputSearch: null }}>
          <InputSearch aria-label="Shared fallback" />
        </ConfigProvider>
        <ConfigProvider components={{ Input: null, InputSearch: null }}>
          <InputSearch aria-label="Built in search" />
        </ConfigProvider>
      </ConfigProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'Shared fallback' })).toHaveValue('Shared');
    expect(screen.getByRole('textbox', { name: 'Built in search' })).toHaveValue('');
  });

  it('resolves SplitButton defaults once and shares disabled and loading across both controls', async () => {
    const select = vi.fn();
    const click = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const example = (loading?: boolean, disabled?: boolean) => (
      <ConfigProvider
        components={{
          Button: { loading: true, disabled: true, type: 'submit', size: 'sm', variant: 'outline' },
        }}
      >
        <form onSubmit={submit}>
          <SplitButton
            items={[{ key: 'copy', label: 'Copy', onClick: select }]}
            menuLabel="More"
            loading={loading}
            disabled={disabled}
            onClick={click}
          >
            Save
          </SplitButton>
        </form>
      </ConfigProvider>
    );
    const { rerender } = render(example());
    const main = screen.getByRole('button', { name: 'Save' });
    const more = screen.getByRole('button', { name: 'More' });
    expect(main).toBeDisabled();
    expect(more).toBeDisabled();
    for (const button of [main, more])
      expect(button).toHaveClass('leaf-button--sm', 'leaf-button--outline');
    rerender(example(false, false));
    expect(main).toBeEnabled();
    expect(more).toBeEnabled();
    expect(more).toHaveAttribute('type', 'button');
    await userEvent.click(more);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Copy' }));
    expect(select).toHaveBeenCalledOnce();
    expect(click).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
    await userEvent.click(main);
    expect(click).toHaveBeenCalledOnce();
    expect(submit).toHaveBeenCalledOnce();
    rerender(example(true, false));
    expect(main).toBeDisabled();
    expect(more).toBeDisabled();
  });

  it('keeps internal Upload and pagination controls independent of public control defaults', async () => {
    const click = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const changePage = vi.fn();
    const search = vi.fn();
    render(
      <ConfigProvider
        locale="en-US"
        components={{
          Button: { type: 'submit', loading: true, disabled: true, onClick: click },
          Select: { readOnly: true, showSearch: true, onSearch: search, loading: true },
        }}
      >
        <form onSubmit={submit}>
          <Upload>Choose a file</Upload>
          <Pagination total={100} showSizeChanger onChange={changePage} />
        </form>
      </ConfigProvider>,
    );
    const trigger = screen.getByRole('button', { name: 'Choose a file' });
    expect(trigger).toBeEnabled();
    expect(trigger).toHaveAttribute('type', 'button');
    await userEvent.click(trigger);
    expect(submit).not.toHaveBeenCalled();
    expect(click).not.toHaveBeenCalled();
    const size = screen.getByRole('combobox');
    expect(size).toBeEnabled();
    await userEvent.click(size);
    await userEvent.click(screen.getByRole('option', { name: '20 / page' }));
    expect(changePage).toHaveBeenLastCalledWith(1, 20);
    expect(search).not.toHaveBeenCalled();
  });

  it('respects instance, inner, outer and builtin precedence including false and undefined', () => {
    render(
      <>
        <Button>Built in</Button>
        <ConfigProvider components={{ Button: { variant: 'outline', size: 'sm', danger: true } }}>
          <Button>Outer</Button>
          <ConfigProvider components={{ Button: { size: 'lg', danger: false } }}>
            <Button size={undefined}>Inner</Button>
            <Button size="md" variant="link">
              Instance
            </Button>
          </ConfigProvider>
          <ConfigProvider>
            <Button>Inherited</Button>
          </ConfigProvider>
        </ConfigProvider>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Built in' })).toHaveClass(
      'leaf-button--outline',
      'leaf-button--md',
    );
    expect(screen.getByRole('button', { name: 'Outer' })).toHaveClass(
      'leaf-button--outline',
      'leaf-button--sm',
      'leaf-button--danger',
    );
    expect(screen.getByRole('button', { name: 'Inner' })).toHaveClass(
      'leaf-button--outline',
      'leaf-button--lg',
    );
    expect(screen.getByRole('button', { name: 'Inner' })).not.toHaveClass('leaf-button--danger');
    expect(screen.getByRole('button', { name: 'Instance' })).toHaveClass(
      'leaf-button--link',
      'leaf-button--md',
    );
    expect(screen.getByRole('button', { name: 'Inherited' })).toHaveClass('leaf-button--sm');
  });

  it('forwards refs and retains loading constraints and replacement event semantics', async () => {
    const ref = createRef<HTMLButtonElement>();
    const defaults = vi.fn();
    const instance = vi.fn();
    render(
      <ConfigProvider
        components={{ Button: { loading: true, disabled: false, onClick: defaults } }}
      >
        <Button ref={ref}>Busy</Button>
        <Button loading={false}>Available</Button>
        <Button loading={false} onClick={instance}>
          Override
        </Button>
      </ConfigProvider>,
    );
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Busy' }));
    expect(ref.current).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Busy' }));
    expect(defaults).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Available' }));
    await userEvent.click(screen.getByRole('button', { name: 'Override' }));
    expect(defaults).toHaveBeenCalledOnce();
    expect(instance).toHaveBeenCalledOnce();
  });

  it('updates defaults without replacing native refs or resetting edited input values', async () => {
    const ref = createRef<HTMLInputElement>();
    const example = (defaultValue: string, size: 'sm' | 'lg') => (
      <ConfigProvider components={{ Input: { defaultValue, allowClear: true, size } }}>
        <form aria-label="Settings">
          <Input ref={ref} name="name" aria-label="Name" />
        </form>
      </ConfigProvider>
    );
    const { rerender } = render(example('Leaf', 'sm'));
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveValue('Leaf');
    await userEvent.type(input, ' UI');
    rerender(example('New default', 'lg'));
    expect(ref.current).toBe(input);
    expect(input).toHaveValue('Leaf UI');
    expect(input.closest('.leaf-input')).toHaveClass('leaf-input--lg');
    const form = screen.getByRole('form') as HTMLFormElement;
    expect(new FormData(form).get('name')).toBe('Leaf UI');
    await userEvent.click(screen.getByRole('button', { name: '清除输入' }));
    expect(input).toHaveValue('');
    await act(async () => form.reset());
    expect(input).toHaveValue('New default');
  });

  it('keeps configured Input values controlled and lets instance value and callbacks replace them', () => {
    const onChange = vi.fn();
    const instance = vi.fn();
    const example = (value: string) => (
      <ConfigProvider components={{ Input: { value, onChange } }}>
        <Input aria-label="Controlled" />
        <Input aria-label="Empty override" value="" onChange={instance} />
      </ConfigProvider>
    );
    const { rerender } = render(example('Leaf'));
    fireEvent.change(screen.getByRole('textbox', { name: 'Controlled' }), {
      target: { value: 'Edit' },
    });
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Controlled' })).toHaveValue('Leaf');
    fireEvent.change(screen.getByRole('textbox', { name: 'Empty override' }), {
      target: { value: 'Edit' },
    });
    expect(instance).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Empty override' })).toHaveValue('');
    rerender(example('Updated'));
    expect(screen.getByRole('textbox', { name: 'Controlled' })).toHaveValue('Updated');
  });

  it('cannot override Form disabled even in InputSearch or Select', () => {
    render(
      <ConfigProvider
        components={{
          Input: { disabled: false },
          InputSearch: { disabled: false },
          Select: { disabled: false },
        }}
      >
        <Form disabled>
          <FormField label="Name">
            <Input disabled={false} />
          </FormField>
          <FormField label="Search">
            <InputSearch disabled={false} enterButton="Search" />
          </FormField>
          <FormField label="Choice">
            <Select disabled={false} options={[]} />
          </FormField>
        </Form>
      </ConfigProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Choice' })).toBeDisabled();
  });

  it('keeps search state, Enter, clearing and form reset aligned with resolved Input defaults', async () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    const submit = vi.fn();
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(
      <ConfigProvider
        components={{
          Input: { defaultValue: 'Leaf', allowClear: true, size: 'sm', onChange },
          InputSearch: { enterButton: 'Find', onSearch },
          Button: { size: 'lg', type: 'submit', disabled: true },
        }}
      >
        <form
          aria-label="Search form"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <InputSearch ref={ref} aria-label="Search" name="q" />
        </form>
      </ConfigProvider>,
    );
    const input = screen.getByRole('textbox', { name: 'Search' });
    expect(ref.current).toBe(input);
    expect(input).toHaveValue('Leaf');
    expect(input.closest('.leaf-input')).toHaveClass('leaf-input--sm');
    expect(screen.getByRole('button', { name: 'Find' })).toHaveClass('leaf-button--sm');
    await userEvent.type(input, ' UI{Enter}');
    expect(onSearch).toHaveBeenLastCalledWith('Leaf UI');
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('q')).toBe('Leaf UI');
    await userEvent.click(screen.getByRole('button', { name: '清除输入' }));
    await userEvent.click(screen.getByRole('button', { name: 'Find' }));
    expect(onSearch).toHaveBeenLastCalledWith('');
    await act(async () => (screen.getByRole('form') as HTMLFormElement).reset());
    expect(input).toHaveValue('Leaf');
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(submit).not.toHaveBeenCalled();
    rerender(
      <ConfigProvider
        components={{
          Input: { value: 'Base', onChange },
          InputSearch: { value: 'Search value', onSearch, enterButton: 'Find', size: 'lg' },
        }}
      >
        <InputSearch aria-label="Search" />
      </ConfigProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('Search value');
    await userEvent.click(screen.getByRole('button', { name: 'Find' }));
    expect(onSearch).toHaveBeenLastCalledWith('Search value');
  });

  it('applies Select defaults in portals while keeping multi-selection instance-owned', async () => {
    const selected = vi.fn();
    const options = [
      { value: 'leaf', label: 'Leaf' },
      { value: 'react', label: 'React' },
    ];
    const popupRender = vi.fn((content) => content);
    render(
      <ConfigProvider
        components={{
          Select: {
            size: 'sm',
            showSearch: true,
            allowClear: true,
            popupClassName: 'configured-popup',
            popupRender,
          },
        }}
      >
        <Select
          aria-label="Libraries"
          multiple
          defaultValue={['leaf']}
          options={options}
          onChange={selected}
        />
      </ConfigProvider>,
    );
    const input = screen.getByRole('combobox');
    expect(input).not.toHaveAttribute('readonly');
    expect(input.closest('.leaf-select')).toHaveClass('leaf-select--sm');
    await userEvent.click(input);
    expect(screen.getByRole('listbox').closest('[data-leaf-popup]')).toHaveClass(
      'configured-popup',
    );
    expect(popupRender).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('option', { name: 'React' }));
    expect(selected).toHaveBeenLastCalledWith(['leaf', 'react'], options);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('replaces Select popup styles and reflects default updates on an open panel', async () => {
    const options = [{ value: 'leaf', label: 'Leaf' }];
    const example = (size: 'sm' | 'lg') => (
      <ConfigProvider
        components={{
          Select: { size, showSearch: true, popupStyle: { color: 'red', background: 'pink' } },
        }}
      >
        <Select aria-label="Library" options={options} popupStyle={{ color: 'blue' }} />
      </ConfigProvider>
    );
    const { rerender } = render(example('sm'));
    await userEvent.click(screen.getByRole('combobox'));
    const panel = screen.getByRole('listbox').closest<HTMLElement>('[data-leaf-popup]');
    if (!panel) throw new Error('Select popup missing');
    expect(panel.style.color).toBe('blue');
    expect(panel.style.background).toBe('');
    rerender(example('lg'));
    expect(screen.getByRole('combobox').closest('.leaf-select')).toHaveClass('leaf-select--lg');
    expect(screen.getByRole('option', { name: 'Leaf' })).toBeInTheDocument();
  });

  it('resolves Modal defaults before choosing its portal and preserves explicit null footer', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const close = vi.fn();
    try {
      const { rerender } = render(
        <ConfigProvider
          components={{
            Modal: { width: 560, title: 'Configured', container, onClose: close, footer: null },
            Button: { variant: 'outline' },
          }}
        >
          <Modal open>
            <Button>Inside portal</Button>
          </Modal>
        </ConfigProvider>,
      );
      const dialog = within(container).getByRole('dialog', { name: 'Configured' });
      expect(dialog).toHaveStyle({ width: '560px' });
      expect(within(dialog).getByRole('button', { name: 'Inside portal' })).toHaveClass(
        'leaf-button--outline',
      );
      expect(dialog.querySelector('.leaf-modal__footer')).toBeNull();
      await userEvent.click(within(dialog).getByRole('button', { name: '关闭' }));
      expect(close).toHaveBeenCalledOnce();
      rerender(
        <ConfigProvider components={{ Modal: { width: 560, footer: 'Default footer' } }}>
          <Modal open title="Instance" width={420} footer={null} />
        </ConfigProvider>,
      );
      expect(screen.getByRole('dialog', { name: 'Instance' })).toHaveStyle({ width: '420px' });
      expect(screen.queryByText('Default footer')).toBeNull();
    } finally {
      container.remove();
    }
  });

  it('does not leak Modal defaults into the confirmation service', async () => {
    const modalConfirm = vi.fn();
    function Request() {
      const { confirm } = useConfirm();
      return (
        <Button
          disabled={false}
          loading={false}
          onClick={() => void confirm({ title: 'Delete item', children: 'Cannot undo.' })}
        >
          Request
        </Button>
      );
    }
    render(
      <ConfigProvider
        components={{
          Button: { disabled: true, loading: true },
          Modal: {
            description: 'Modal only',
            onConfirm: modalConfirm,
            confirmLoading: true,
            width: 800,
          },
        }}
      >
        <Request />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Request' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Delete item' });
    expect(dialog).toHaveStyle({ width: '420px' });
    expect(screen.queryByText('Modal only')).toBeNull();
    expect(within(dialog).getByRole('button', { name: '确定' })).toBeEnabled();
    await userEvent.click(within(dialog).getByRole('button', { name: '确定' }));
    expect(modalConfirm).not.toHaveBeenCalled();
  });

  it('keeps dialog actions non-submitting unless action props explicitly request submit', async () => {
    const close = vi.fn();
    const defaults: LeafComponentDefaults = {
      Button: { type: 'submit', disabled: true, loading: true },
    };
    const { rerender } = render(
      <ConfigProvider locale="en-US" components={defaults}>
        <Modal open title="Settings" onClose={close} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'OK' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(close).toHaveBeenCalledOnce();
    rerender(
      <ConfigProvider locale="en-US" components={defaults}>
        <Modal open title="Settings" onClose={close} confirmButtonProps={{ type: 'submit' }} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'OK' })).toHaveAttribute('type', 'submit');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(close).toHaveBeenCalledOnce();
  });

  it('separates default-prop subscriptions from language/theme subscriptions', () => {
    const defaultRender = vi.fn();
    const configRender = vi.fn();
    const DefaultsOnly = memo(function DefaultsOnly() {
      defaultRender();
      return <output>{useComponentProps('Button', {}).size}</output>;
    });
    const ConfigOnly = memo(function ConfigOnly() {
      configRender();
      return <output>{useLeafConfig().locale}</output>;
    });
    const defaults: LeafComponentDefaults = { Button: { size: 'sm' } };
    const example = (locale: 'zh-CN' | 'en-US', components: LeafComponentDefaults) => (
      <ConfigProvider locale={locale} components={components}>
        <DefaultsOnly />
        <ConfigOnly />
      </ConfigProvider>
    );
    const { rerender } = render(example('zh-CN', defaults));
    expect(defaultRender).toHaveBeenCalledOnce();
    expect(configRender).toHaveBeenCalledOnce();
    rerender(example('en-US', defaults));
    expect(defaultRender).toHaveBeenCalledOnce();
    expect(configRender).toHaveBeenCalledTimes(2);
    rerender(example('en-US', { Button: { size: 'lg' } }));
    expect(defaultRender).toHaveBeenCalledTimes(2);
    expect(configRender).toHaveBeenCalledTimes(2);
    expect(screen.getByText('lg')).toBeInTheDocument();
  });

  it('renders matching scoped defaults on the server and during hydration', async () => {
    const content = (
      <ConfigProvider
        components={{
          Button: { variant: 'outline', size: 'sm' },
          Input: { defaultValue: 'Leaf' },
          InputSearch: { enterButton: 'Find' },
          Select: { showSearch: true },
        }}
      >
        <Button>Hydrated</Button>
        <Input aria-label="Name" />
        <InputSearch aria-label="Search" />
        <Select aria-label="Library" options={[]} />
      </ConfigProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(content);
    document.body.append(container);
    const errors = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, content, { onRecoverableError: errors });
      });
      expect(errors).not.toHaveBeenCalled();
      expect(within(container).getByRole('button', { name: 'Hydrated' })).toHaveClass(
        'leaf-button--outline',
        'leaf-button--sm',
      );
      expect(within(container).getByRole('textbox', { name: 'Name' })).toHaveValue('Leaf');
      expect(within(container).getByRole('textbox', { name: 'Search' })).toHaveValue('Leaf');
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});
