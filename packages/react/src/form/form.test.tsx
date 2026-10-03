import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, ConfigProvider, Input, RadioGroup, Select } from '../index';
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
    expect(screen.queryByRole('alert')).toBeNull();
  });
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
      '136px',
    );
    rerender(fields(false));
    expect(container.querySelector('form')?.style.getPropertyValue('--leaf-form-label-width')).toBe(
      '40px',
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
