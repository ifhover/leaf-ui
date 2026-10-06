import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from './slider';

describe('Slider', () => {
  it('keeps the numeric display opt-in without hiding the accessible value', () => {
    const { rerender } = render(<Slider defaultValue={50} />);
    expect(screen.getByRole('slider')).toHaveValue('50');
    expect(screen.queryByText('50')).not.toBeInTheDocument();
    rerender(<Slider defaultValue={50} showValue />);
    expect(screen.getByText('50')).toBeInTheDocument();
    rerender(<Slider range value={[20, 70]} showValue />);
    expect(screen.getByText('20 – 70')).toBeInTheDocument();
  });
  it('steps decimals with keys and reports a completed change once', async () => {
    const complete = vi.fn();
    function Example() {
      const [value, setValue] = useState(0.1);
      return (
        <Slider
          value={value}
          onChange={setValue}
          min={0}
          max={1}
          step={0.1}
          onChangeComplete={complete}
        />
      );
    }
    render(<Example />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('slider')).toHaveValue('0.2');
    expect(complete).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenLastCalledWith(0.2);
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('slider')).toHaveValue('1');
  });
  it('prevents range thumbs crossing and submits repeated values with native reset', async () => {
    render(
      <form aria-label="Range">
        <Slider range defaultValue={[20, 60]} name="range" aria-label="Range" />
        <button type="reset">Reset</button>
      </form>,
    );
    const form = screen.getByRole('form') as HTMLFormElement;
    const start = screen.getByRole('slider', { name: 'Range 开始' });
    fireEvent.change(start, { target: { value: '90' } });
    expect(start).toHaveValue('60');
    expect(new FormData(form).getAll('range')).toEqual(['60', '60']);
    await act(async () => form.reset());
    expect(new FormData(form).getAll('range')).toEqual(['20', '60']);
  });
  it('chooses a mark, respects readOnly and uses independent range IDs', async () => {
    const change = vi.fn();
    const { rerender } = render(
      <Slider marks={[{ value: 50, label: 'Half' }]} onChange={change} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Half' }));
    expect(change).toHaveBeenCalledWith(50);
    rerender(<Slider defaultValue={10} readOnly onChange={change} />);
    await userEvent.click(screen.getByRole('slider'));
    await userEvent.keyboard('{ArrowRight}');
    expect(change).toHaveBeenCalledOnce();
    rerender(
      <>
        <Slider range />
        <Slider range />
      </>,
    );
    expect(new Set(screen.getAllByRole('slider').map((node) => node.id)).size).toBe(4);
  });
});
