import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider, Form, FormField, InputNumber } from '../index';

describe('InputNumber', () => {
  it('clears form validation feedback after a step button changes the value', async () => {
    render(
      <Form>
        <FormField label="Required number" required>
          <InputNumber />
        </FormField>
      </Form>,
    );
    const input = screen.getByRole('spinbutton');
    fireEvent.invalid(input);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '增加数值' }));
    expect(input).toHaveValue('1');
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('preserves partial decimal input and steps without floating point drift', async () => {
    function Example() {
      const [value, setValue] = useState<number | null>(0.1);
      return <InputNumber aria-label="Price" value={value} onChange={setValue} step={0.1} />;
    }
    render(
      <ConfigProvider locale="en-US">
        <Example />
      </ConfigProvider>,
    );
    const input = screen.getByRole('spinbutton');
    await userEvent.click(screen.getByRole('button', { name: 'Increase value' }));
    expect(input).toHaveValue('0.2');
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue('0.3');
    await userEvent.clear(input);
    await userEvent.type(input, '-0.');
    expect(input).toHaveValue('-0.');
    await userEvent.type(input, '5');
    expect(input).toHaveValue('-0.5');
  });
  it('clamps on blur, rounds precision, validates invalid drafts and honors disabled/readOnly', async () => {
    const change = vi.fn();
    const { rerender } = render(
      <InputNumber aria-label="Amount" min={0} max={10} precision={2} onChange={change} />,
    );
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '12.567' } });
    expect(input).toBeInvalid();
    fireEvent.blur(input);
    expect(input).toHaveValue('10.00');
    expect(change).toHaveBeenLastCalledWith(10);
    expect(input).toBeValid();
    fireEvent.change(input, { target: { value: 'wrong' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('10.00');
    rerender(<InputNumber aria-label="Amount" value={5} readOnly />);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('5');
    expect(screen.getByRole('button', { name: '增加数值' })).toBeDisabled();
    rerender(<InputNumber aria-label="Amount" disabled />);
    expect(input).toBeDisabled();
  });
  it('submits a native value, follows form field metadata and resets uncontrolled drafts', async () => {
    render(
      <Form>
        <FormField label="Quantity" required>
          <InputNumber name="quantity" defaultValue={2} />
        </FormField>
      </Form>,
    );
    const input = screen.getByRole('spinbutton', { name: 'Quantity' });
    expect(input).toBeRequired();
    const form = input.closest('form') as HTMLFormElement;
    fireEvent.change(input, { target: { value: '7' } });
    expect(new FormData(form).get('quantity')).toBe('7');
    await act(async () => {
      form.reset();
    });
    expect(input).toHaveValue('2');
    fireEvent.change(input, { target: { value: '-' } });
    await act(async () => {
      form.reset();
    });
    expect(input).toHaveValue('2');
  });
});
