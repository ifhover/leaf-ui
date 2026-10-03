import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, Tooltip } from '../index';

describe('Tooltip', () => {
  it('opens on keyboard focus, merges descriptions and refs, and closes on Escape', async () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Tooltip content="Save changes">
        <Button ref={ref} aria-describedby="hint">
          Save
        </Button>
      </Tooltip>,
    );
    await act(async () => {
      ref.current?.focus();
    });
    const tooltip = screen.getByRole('tooltip');
    expect(ref.current).toHaveAttribute('aria-describedby', `hint ${tooltip.id}`);
    fireEvent.keyDown(document, { key: 'Escape' });
    await act(async () => {});
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(ref.current).toHaveAttribute('aria-describedby', 'hint');
  });
  it('cancels delayed appearances and keeps hover content reachable', async () => {
    vi.useFakeTimers();
    try {
      render(
        <Tooltip content="Help" enterDelay={200} leaveDelay={100}>
          <Button>Hover</Button>
        </Tooltip>,
      );
      const button = screen.getByRole('button');
      fireEvent.pointerEnter(button, { pointerType: 'mouse' });
      fireEvent.pointerLeave(button);
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByRole('tooltip')).toBeNull();
      fireEvent.pointerEnter(button, { pointerType: 'mouse' });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      const tooltip = screen.getByRole('tooltip');
      fireEvent.pointerLeave(button);
      fireEvent.pointerEnter(tooltip);
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
