import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Button, ConfigProvider, Drawer, Input, Modal, Select } from '../index';

describe('Drawer', () => {
  it('shares scroll and focus ownership with nested modals and picker portals', async () => {
    function Example() {
      const [drawer, setDrawer] = useState(false);
      const [modal, setModal] = useState(false);
      return (
        <>
          <Button onClick={() => setDrawer(true)}>Open drawer</Button>
          <Drawer open={drawer} title="Details" onClose={() => setDrawer(false)}>
            <Select aria-label="Choice" options={[{ value: 'a', label: 'Alpha' }]} />
            <Button onClick={() => setModal(true)}>Open modal</Button>
            <Modal open={modal} title="Edit" onClose={() => setModal(false)}>
              <Input aria-label="Name" />
            </Modal>
          </Drawer>
        </>
      );
    }
    render(
      <ConfigProvider locale="en-US">
        <Example />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    expect(document.body.style.overflow).toBe('hidden');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Open modal' }));
    expect(screen.getByRole('dialog', { name: 'Edit' }).contains(document.activeElement)).toBe(
      true,
    );
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Edit' })).toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByRole('button', { name: 'Open modal' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('');
    expect(screen.getByRole('button', { name: 'Open drawer' })).toHaveFocus();
  });
});
