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

  it('renders external decrease and increase buttons around the field in split variant', async () => {
    const { container, rerender } = render(
      <ConfigProvider components={{ InputNumber: { variant: 'split' } }}>
        <InputNumber aria-label="Split count" defaultValue={1} min={0} max={2} size="sm" />
      </ConfigProvider>,
    );
    const root = container.querySelector('.leaf-input-number') as HTMLElement;
    const field = container.querySelector('.leaf-input-number__field') as HTMLElement;
    const decrease = screen.getByRole('button', { name: '减少数值' });
    const increase = screen.getByRole('button', { name: '增加数值' });
    const input = screen.getByRole('spinbutton', { name: 'Split count' });

    expect(root).toHaveClass('leaf-input-number--split', 'leaf-input-number--sm');
    expect(field).toHaveClass('leaf-input-number__field--sm');
    expect(field).not.toContainElement(decrease);
    expect(field).not.toContainElement(increase);
    expect(container.querySelector('.leaf-input-number__controls')).toBeNull();
    expect(decrease).toHaveClass('leaf-button', 'leaf-button--outline', 'leaf-button--icon-sm');
    expect(increase).toHaveClass('leaf-button', 'leaf-button--outline', 'leaf-button--icon-sm');

    await userEvent.click(increase);
    expect(input).toHaveValue('2');
    expect(input).toHaveFocus();
    expect(increase).toBeDisabled();
    expect(decrease).toBeEnabled();

    await userEvent.click(decrease);
    await userEvent.click(decrease);
    expect(input).toHaveValue('0');
    expect(decrease).toBeDisabled();

    rerender(
      <InputNumber
        aria-label="Exact split"
        variant="split"
        stringMode
        defaultValue="1.05"
        step="0.05"
        precision={2}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: '增加数值' }));
    expect(screen.getByRole('spinbutton', { name: 'Exact split' })).toHaveValue('1.10');

    rerender(<InputNumber aria-label="Hidden controls" variant="split" controls={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('exposes spinbutton numeric bounds in stringMode and clears form validation after stepping', async () => {
    render(
      <ConfigProvider locale="en-US">
        <Form>
          <FormField label="Exact quota">
            <InputNumber stringMode min="1" max="10" defaultValue="15" />
          </FormField>
        </Form>
      </ConfigProvider>,
    );
    const input = screen.getByRole('spinbutton', { name: 'Exact quota' });
    expect(input).toHaveAttribute('aria-valuemin', '1');
    expect(input).toHaveAttribute('aria-valuemax', '10');
    expect(input).toHaveAttribute('aria-valuenow', '15');
    expect(input).toHaveAttribute('aria-valuetext', '15');

    fireEvent.invalid(input);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a valid number within the allowed range',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Decrease value' }));
    expect(input).toHaveValue('10');
    expect(input).toHaveAttribute('aria-valuenow', '10');
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
