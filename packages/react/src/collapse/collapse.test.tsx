import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Collapse, Input } from '../index';

const items = [
  { key: 'first', label: 'First', children: <Input aria-label="Draft" /> },
  { key: 'disabled', label: 'Disabled', disabled: true, children: 'Hidden' },
  { key: 'last', label: 'Last', children: 'Last content' },
];
describe('Collapse', () => {
  it('keeps a visited draft, switches accordion panels and skips disabled headers', async () => {
    render(<Collapse items={items} defaultActiveKey="first" accordion />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Draft' }), 'Keep me');
    await userEvent.click(screen.getByRole('button', { name: 'Last' }));
    expect(screen.getByRole('button', { name: 'First' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('region', { name: 'Last' })).toBeInTheDocument();
    await userEvent.keyboard('{Home}{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: 'First' }));
    expect(screen.getByRole('textbox', { name: 'Draft' })).toHaveValue('Keep me');
  });
  it('supports controlled state and destroys closed content when requested', async () => {
    function Example() {
      const [keys, setKeys] = useState<string[]>([]);
      return <Collapse items={items} activeKey={keys} onChange={setKeys} destroyInactive />;
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'First' }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'First' }));
    expect(screen.queryByRole('textbox', { hidden: true })).toBeNull();
  });
});
