import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert } from './alert';

describe('neutral alerts', () => {
  it.each(['success', 'info', 'warning', 'danger'] as const)(
    'retains %s semantics independently of its surface',
    (type) => {
      render(
        <Alert
          type={type}
          title="Status"
          description="Additional details"
          icon={<span>Custom icon</span>}
        />,
      );
      const alert = screen.getByRole(type === 'warning' || type === 'danger' ? 'alert' : 'status');
      expect(alert).toHaveClass(`leaf-alert--${type}`);
      expect(alert.querySelector('.leaf-alert__icon')).toHaveAttribute('aria-hidden', 'true');
      expect(alert).toHaveTextContent('Additional details');
      expect(alert).not.toHaveAttribute('variant');
    },
  );

  it('normalizes the legacy error type to danger', () => {
    render(<Alert type="error" title="Status" />);
    expect(screen.getByRole('alert')).toHaveClass('leaf-alert--danger');
    expect(screen.getByRole('alert')).not.toHaveClass('leaf-alert--error');
  });
});
