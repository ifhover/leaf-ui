import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert } from './alert';

describe('neutral alerts', () => {
  it.each(['success', 'info', 'warning', 'error'] as const)(
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
      const alert = screen.getByRole(type === 'warning' || type === 'error' ? 'alert' : 'status');
      expect(alert).toHaveClass(`leaf-alert--${type}`);
      expect(alert.querySelector('.leaf-alert__icon')).toHaveAttribute('aria-hidden', 'true');
      expect(alert).toHaveTextContent('Additional details');
      expect(alert).not.toHaveAttribute('variant');
    },
  );
});
