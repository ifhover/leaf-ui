import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, Popover } from '../index';

// jsdom omits geometry; keep disabled and tabIndex checks without layout visibility checks.
vi.mock('tabbable', async (importOriginal) => {
  const original = await importOriginal<typeof import('tabbable')>();
  return {
    ...original,
    tabbable: (node: Element) => original.tabbable(node, { displayCheck: 'none' }),
  };
});

describe('Popover', () => {
  it('preserves trigger events and refs, focuses content and returns focus on Escape', async () => {
    const ref = createRef<HTMLButtonElement>();
    const click = vi.fn();
    render(
      <Popover title="Settings" content={<Button>Inside</Button>}>
        <Button ref={ref} onClick={click}>
          Open
        </Button>
      </Popover>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(click).toHaveBeenCalledOnce();
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inside' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(ref.current).toHaveFocus();
  });
  it('supports focus on hover triggers and never opens disabled triggers', async () => {
    const { rerender } = render(
      <Popover title="Details" trigger="hover" content="Description">
        <Button>Details</Button>
      </Popover>,
    );
    await userEvent.tab();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
    rerender(
      <Popover title="Details" content="Description" disabled>
        <Button>Details</Button>
      </Popover>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
