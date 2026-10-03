import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Rate } from './rate';

describe('Rate', () => {
  it('supports half ratings, clear, keyboard navigation and form reset', async () => {
    render(
      <form aria-label="Review">
        <Rate name="score" allowHalf required defaultValue={2.5} />
        <button type="reset">Reset</button>
      </form>,
    );
    const form = screen.getByRole('form') as HTMLFormElement;
    await userEvent.click(screen.getByRole('radio', { name: '3.5 / 5' }));
    expect(new FormData(form).get('score')).toBe('3.5');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '4 / 5' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Delete}');
    expect(form.checkValidity()).toBe(false);
    await act(async () => form.reset());
    expect(new FormData(form).get('score')).toBe('2.5');
  });
  it('keeps readOnly ratings unchanged and has one tab stop', async () => {
    const change = vi.fn();
    render(<Rate value={3} readOnly onChange={change} />);
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: '3 / 5' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await userEvent.click(screen.getByRole('radio', { name: '5 / 5' }));
    expect(change).not.toHaveBeenCalled();
  });
});
