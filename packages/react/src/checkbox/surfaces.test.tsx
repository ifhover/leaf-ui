import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Form, FormField } from '../form/form';
import { Checkbox } from './checkbox';
import { CheckboxGroup } from './group';

describe('rich checkbox choices', () => {
  it('clicks the whole card, separates its accessible name and description, and retains the native ref', async () => {
    const ref = createRef<HTMLInputElement>();
    const change = vi.fn();
    render(
      <Checkbox
        ref={ref}
        variant="card"
        description="Read messages only"
        extra="Recommended"
        icon={<span>Mail icon</span>}
        onChange={change}
      >
        Mailbox
      </Checkbox>,
    );
    const input = screen.getByRole('checkbox', { name: 'Mailbox' });
    expect(input).toHaveAccessibleDescription('Read messages only Recommended');
    expect(ref.current).toBe(input);
    await userEvent.click(screen.getByText('Read messages only'));
    expect(input).toBeChecked();
    await userEvent.keyboard(' ');
    expect(input).not.toBeChecked();
    await userEvent.click(screen.getByText('Recommended'));
    expect(input).toBeChecked();
    expect(change).toHaveBeenCalledTimes(3);
    expect(input).not.toHaveAttribute('variant');
  });

  it('merges field, explicit and option descriptions without confusing their labels', () => {
    render(
      <Form>
        <FormField label="Access" help="Choose a service">
          <p id="external-help">Company policy</p>
          <Checkbox aria-describedby="external-help" description="Read-only">
            Mail
          </Checkbox>
        </FormField>
      </Form>,
    );
    expect(screen.getByRole('checkbox', { name: 'Mail' })).toHaveAccessibleDescription(
      'Company policy Choose a service Read-only',
    );
  });

  it.each(['card', 'list'] as const)(
    'preserves required groups, values, limits and native reset in the %s variant',
    async (variant) => {
      const { container } = render(
        <form>
          <CheckboxGroup
            legend="Services"
            name="services"
            variant={variant}
            required
            maxCount={2}
            defaultValue={['mail']}
            options={[
              { value: 'mail', label: 'Mail', description: 'Messages' },
              { value: 'drive', label: 'Drive', description: 'Files' },
              { value: 'chat', label: 'Chat', description: 'Discussions' },
              { value: 'blocked', label: 'Blocked', disabled: true },
            ]}
          />
        </form>,
      );
      const group = within(screen.getByRole('group', { name: 'Services' }));
      const form = container.querySelector('form') as HTMLFormElement;
      expect(new FormData(form).getAll('services')).toEqual(['mail']);
      await userEvent.click(group.getByText('Files'));
      await userEvent.click(group.getByText('Discussions'));
      expect(group.getByRole('checkbox', { name: 'Chat' })).not.toBeChecked();
      expect(new FormData(form).getAll('services')).toEqual(['mail', 'drive']);
      fireEvent.reset(form);
      expect(group.getByRole('checkbox', { name: 'Mail' })).toBeChecked();
      await waitFor(() => expect(group.getByRole('checkbox', { name: 'Drive' })).not.toBeChecked());
      expect(group.getByRole('checkbox', { name: 'Blocked' })).toBeDisabled();
      expect(form.checkValidity()).toBe(true);
      await userEvent.click(group.getByText('Messages'));
      expect(form.checkValidity()).toBe(false);
    },
  );
});
