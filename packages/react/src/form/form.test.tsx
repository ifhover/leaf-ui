import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ChangeEvent, useState } from 'react';
import { flushSync } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, ConfigProvider, Input, RadioGroup, Select, Textarea } from '../index';
import { Form, FormField } from './form';

afterEach(() => vi.restoreAllMocks());
describe('Form', () => {
  it('associates labels, inherits required state and clears validation after editing', async () => {
    render(
      <ConfigProvider locale="en-US">
        <Form>
          <FormField label="Email" required help="Work address">
            <Input name="email" type="email" />
          </FormField>
          <Button type="submit">Save</Button>
        </Form>
      </ConfigProvider>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription('Work address');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please fill out this field');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(input, 'hello@example.com');
    expect(input).toHaveValue('hello@example.com');
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it.each([
    { control: 'Input', controlled: false, formatError: false },
    { control: 'Input', controlled: true, formatError: false },
    { control: 'Textarea', controlled: false, formatError: false },
    { control: 'Textarea', controlled: true, formatError: false },
    { control: 'Input', controlled: false, formatError: true },
    { control: 'Input', controlled: true, formatError: true },
  ])(
    'preserves the first edit after validation in $control (controlled=$controlled, formatError=$formatError)',
    async ({ control, controlled, formatError }) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onInputCapture = vi.fn();
      const onInput = vi.fn();
      const initialValue = formatError ? 'a' : '';
      let submitted: FormDataEntryValue | null | undefined;
      function Example() {
        const [value, setValue] = useState(initialValue);
        const controlProps = {
          name: 'value',
          value: controlled ? value : undefined,
          defaultValue: controlled ? undefined : initialValue,
          // Browsers can flush capture updates before bubbling; user-event batches both in act.
          onInputCapture: () => flushSync(() => {}),
          onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            onChange(event.currentTarget.value);
            setValue(event.currentTarget.value);
          },
        };
        return (
          <ConfigProvider locale="en-US">
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                submitted = new FormData(event.currentTarget).get('value');
              }}
            >
              <FormField label="Value" required onInputCapture={onInputCapture} onInput={onInput}>
                {control === 'Textarea' ? (
                  <Textarea {...controlProps} />
                ) : (
                  <Input {...controlProps} type={formatError ? 'email' : 'text'} />
                )}
              </FormField>
              <Button type="submit">Save</Button>
            </Form>
          </ConfigProvider>
        );
      }
      render(<Example />);
      const input = screen.getByRole('textbox', { name: 'Value' });
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'true');
      await waitFor(() => expect(input).toHaveFocus());

      await user.keyboard(formatError ? '{End}@' : 'a');
      const firstValue = formatError ? 'a@' : 'a';
      expect(input).toHaveValue(firstValue);
      expect(input).toHaveFocus();
      expect(screen.getByRole('textbox', { name: 'Value' })).toBe(input);
      expect(screen.queryByRole('alert')).toBeNull();
      expect(input).not.toHaveAttribute('aria-invalid', 'true');
      expect(onChange).toHaveBeenCalledExactlyOnceWith(firstValue);
      expect(onInputCapture).toHaveBeenCalledOnce();
      expect(onInput).toHaveBeenCalledOnce();

      await user.keyboard(formatError ? 'example.com' : 'lice');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(submitted).toBe(formatError ? 'a@example.com' : 'alice');
    },
  );
  it('submits native FormData and resets custom fields and errors', async () => {
    let submitted: FormData | undefined;
    const { container } = render(
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = new FormData(event.currentTarget);
        }}
      >
        <FormField label="Choice" required>
          <Select name="choice" options={[{ value: 'a', label: 'Alpha' }]} />
        </FormField>
        <Button type="submit">Save</Button>
        <Button type="reset">Reset</Button>
      </Form>,
    );
    await userEvent.click(screen.getByText('Save'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option'));
    expect(screen.queryByRole('alert')).toBeNull();
    await userEvent.click(screen.getByText('Save'));
    expect(submitted?.get('choice')).toBe('a');
    await userEvent.click(screen.getByText('Reset'));
    await waitFor(() =>
      expect(new FormData(container.querySelector('form') as HTMLFormElement).get('choice')).toBe(
        '',
      ),
    );
  });
  it('focuses the first invalid field when several fields fail validation', async () => {
    render(
      <Form>
        <FormField label="Choice" required>
          <Select name="choice" options={[{ value: 'a', label: 'Alpha' }]} />
        </FormField>
        <FormField label="Name" required>
          <Input name="name" />
        </FormField>
        <Button type="submit">Save</Button>
      </Form>,
    );
    await userEvent.click(screen.getByText('Save'));
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Choice' })).toHaveFocus());
  });
  it('applies the widest label and recomputes when fields are removed', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      return {
        width: (this.textContent?.length ?? 0) * 8,
        height: 20,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };
    });
    const fields = (extra: boolean) => (
      <Form>
        <FormField label="Short">
          <Input />
        </FormField>
        {extra && (
          <FormField label="Much longer label">
            <Input />
          </FormField>
        )}
      </Form>
    );
    const { container, rerender } = render(fields(true));
    expect(container.querySelector('form')?.style.getPropertyValue('--leaf-form-label-width')).toBe(
      'min(136px, 40%)',
    );
    rerender(fields(false));
    expect(container.querySelector('form')?.style.getPropertyValue('--leaf-form-label-width')).toBe(
      'min(40px, 40%)',
    );
    rerender(
      <Form labelWidth={120}>
        <FormField label="Name">
          <Input />
        </FormField>
      </Form>,
    );
    expect(container.querySelector('form')?.style.getPropertyValue('--leaf-form-label-width')).toBe(
      '120px',
    );
  });
  it('names radio groups and inherits disabled controls', () => {
    render(
      <Form disabled>
        <FormField label="Theme">
          <RadioGroup name="theme" options={[{ value: 'light', label: 'Light' }]} />
        </FormField>
      </Form>,
    );
    expect(screen.getByRole('group', { name: 'Theme' })).toBeDisabled();
    expect(screen.getByRole('radio')).toBeDisabled();
  });
  it('keeps the label description when help is replaced by an error', async () => {
    render(
      <ConfigProvider locale="en-US">
        <Form layout="settings">
          <FormField
            label="Instructions"
            description={
              <>
                Applied to all chats. <a href="#details">Instruction details</a>
              </>
            }
            help="Keep it brief."
            layout="vertical"
            required
          >
            <Textarea name="instructions" />
          </FormField>
          <Button type="submit">Save</Button>
        </Form>
      </ConfigProvider>,
    );
    const input = screen.getByRole('textbox', { name: 'Instructions' });
    expect(input).toHaveAccessibleDescription(
      'Applied to all chats. Instruction details Keep it brief.',
    );
    await userEvent.click(screen.getByText('Instructions', { exact: true }));
    expect(input).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(input).toHaveAccessibleDescription(
      'Applied to all chats. Instruction details Please fill out this field',
    );
    expect(screen.getByRole('link', { name: 'Instruction details' })).toBeInTheDocument();
    await userEvent.type(input, 'Brief answers');
    expect(input).toHaveAccessibleDescription(
      'Applied to all chats. Instruction details Keep it brief.',
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('measures only horizontal labels when layouts are mixed or changed', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      return { width: (this.textContent?.length ?? 0) * 8 } as DOMRect;
    });
    const fields = (layout: 'vertical' | 'horizontal') => (
      <Form layout="settings">
        <FormField label="Short" layout="horizontal">
          <Input />
        </FormField>
        <FormField label="A longer vertical label" layout={layout}>
          <Textarea />
        </FormField>
        <FormField label="A very long settings label">
          <Input />
        </FormField>
      </Form>
    );
    const { container, rerender } = render(fields('vertical'));
    const width = () =>
      container.querySelector('form')?.style.getPropertyValue('--leaf-form-label-width');
    expect(width()).toBe('min(40px, 40%)');
    rerender(fields('horizontal'));
    expect(width()).toBe('min(184px, 40%)');
    rerender(fields('vertical'));
    expect(width()).toBe('min(40px, 40%)');
  });
  it('inherits region layout defaults and keeps explicit field overrides', () => {
    const { container } = render(
      <ConfigProvider
        components={{
          Form: { layout: 'settings' },
          FormField: { description: 'Default hint' },
        }}
      >
        <Form>
          <FormField label="Name">
            <Input />
          </FormField>
          <FormField label="Notes" layout="vertical">
            <Textarea />
          </FormField>
        </Form>
      </ConfigProvider>,
    );
    expect(container.querySelector('.leaf-form')).toHaveClass('leaf-form--settings');
    expect(screen.getByRole('textbox', { name: 'Name' }).closest('.leaf-form-field')).toHaveClass(
      'leaf-form-field--settings',
    );
    expect(screen.getByRole('textbox', { name: 'Notes' }).closest('.leaf-form-field')).toHaveClass(
      'leaf-form-field--vertical',
    );
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveAccessibleDescription(
      'Default hint',
    );
  });
  it('respects prevented resets', async () => {
    render(
      <Form onReset={(event) => event.preventDefault()}>
        <FormField label="Name" required>
          <Input />
        </FormField>
        <Button type="submit">Save</Button>
        <Button type="reset">Reset</Button>
      </Form>,
    );
    fireEvent.invalid(screen.getByRole('textbox', { name: 'Name' }));
    await userEvent.click(screen.getByText('Reset'));
    await act(async () => {});
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
