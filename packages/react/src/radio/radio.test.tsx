import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { RadioGroup } from './radio';

const options = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '自定义', value: 'custom', disabled: true },
];
describe('RadioGroup', () => {
  it('supports native arrow keys, mutual exclusion and group labels', async () => {
    render(<RadioGroup label="外观" options={options} defaultValue="light" />);
    expect(screen.getByRole('group', { name: '外观' })).toBeInTheDocument();
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: '浅色' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '深色' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '浅色' })).not.toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '浅色' })).toBeChecked();
  });
  it('updates controlled values and isolates groups without explicit names', async () => {
    function Example() {
      const [value, setValue] = useState('light');
      return (
        <>
          <RadioGroup
            label="受控外观"
            options={options}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <RadioGroup label="另一个外观" options={options} defaultValue="light" />
        </>
      );
    }
    render(<Example />);
    const firstGroup = within(screen.getByRole('group', { name: '受控外观' }));
    const secondGroup = within(screen.getByRole('group', { name: '另一个外观' }));
    const firstDark = firstGroup.getByRole('radio', { name: '深色' });
    const secondDark = secondGroup.getByRole('radio', { name: '深色' });
    await userEvent.click(firstDark);
    expect(firstDark).toBeChecked();
    expect(secondGroup.getByRole('radio', { name: '浅色' })).toBeChecked();
    expect(firstDark.getAttribute('name')).not.toEqual(secondDark.getAttribute('name'));
  });
  it('disables every radio when the group is disabled', async () => {
    render(<RadioGroup label="外观" options={options} defaultValue="light" disabled />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
    await userEvent.click(screen.getByRole('radio', { name: '深色' }));
    expect(screen.getByRole('radio', { name: '浅色' })).toBeChecked();
  });
});
