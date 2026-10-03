import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../button';
import { Dropdown } from './dropdown';

it('navigates enabled menu items, skips dividers, selects and restores focus', async () => {
  const selected = vi.fn();
  render(
    <Dropdown
      onSelect={selected}
      items={[
        { key: 'a', label: 'Alpha' },
        { key: 'd', type: 'divider' },
        { key: 'b', label: 'Beta', disabled: true },
        { key: 'c', label: 'Charlie', danger: true },
      ]}
    >
      <Button>Menu</Button>
    </Dropdown>,
  );
  screen.getByRole('button', { name: 'Menu' }).focus();
  await userEvent.keyboard('{ArrowDown}');
  expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}{Enter}');
  expect(selected).toHaveBeenCalledWith('c');
  expect(screen.queryByRole('menu')).toBeNull();
  expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus();
});
describe('controlled menus', () => {
  it('reports state changes without assuming approval from a controlled prop', async () => {
    const change = vi.fn();
    render(
      <Dropdown open={false} onOpenChange={change} items={[]}>
        <Button>Menu</Button>
      </Dropdown>,
    );
    await userEvent.click(screen.getByText('Menu'));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('menu')).toBeNull();
  });
  it('preserves the trigger ref and avoids submitting its owner form', async () => {
    const ref = createRef<HTMLButtonElement>();
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <Dropdown items={[{ key: 'a', label: 'Alpha' }]}>
          {/* biome-ignore lint/a11y/useButtonType: Dropdown supplies the safe default type being tested. */}
          <button ref={ref}>Menu</button>
        </Dropdown>
      </form>,
    );
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Menu' }));
    await userEvent.click(screen.getByText('Menu'));
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
  it('does not reopen an uncontrolled menu when re-enabled', async () => {
    const example = (disabled: boolean) => (
      <Dropdown disabled={disabled} items={[{ key: 'a', label: 'Alpha' }]}>
        <Button>Menu</Button>
      </Dropdown>
    );
    const { rerender } = render(example(false));
    await userEvent.click(screen.getByText('Menu'));
    rerender(example(true));
    expect(screen.queryByRole('menu')).toBeNull();
    rerender(example(false));
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
