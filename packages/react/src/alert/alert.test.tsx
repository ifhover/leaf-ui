import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../button/button';
import { ConfigProvider } from '../config-provider/config-provider';
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

  it.each([undefined, 'Additional details'])(
    'keeps trailing actions independent of dismissal with description %s',
    async (description) => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      const onClose = vi.fn();
      render(
        <ConfigProvider locale="en-US" theme={{ motion: false }}>
          <Alert
            title="Status"
            description={description}
            showIcon={false}
            extra={
              <button type="button" onClick={onAction}>
                View details
              </button>
            }
            closable
            onClose={onClose}
            data-testid="custom-alert"
          />
        </ConfigProvider>,
      );
      const alert = screen.getByRole('status');
      const action = screen.getByRole('button', { name: 'View details' });
      const extra = action.parentElement;
      const close = screen.getByRole('button', { name: 'Close' });
      expect(alert).toHaveAttribute('data-testid', 'custom-alert');
      expect(alert).not.toHaveAttribute('extra');
      expect(extra).toHaveClass('leaf-alert__extra');
      expect(extra?.previousElementSibling).toHaveClass('leaf-alert__content');
      expect(extra?.nextElementSibling).toBe(close);
      await user.tab();
      expect(action).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(onAction).toHaveBeenCalledOnce();
      expect(onClose).not.toHaveBeenCalled();
      expect(alert).toBeInTheDocument();
      await user.tab();
      expect(close).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(onClose).toHaveBeenCalledOnce();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    },
  );

  it('supports regional extra defaults, instance overrides and public components in the slot', () => {
    const defaults = {
      Alert: { extra: <Button>Default action</Button> },
      Button: { disabled: true },
    };
    const { rerender } = render(
      <ConfigProvider components={defaults}>
        <Alert title="Status" />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Default action' })).toBeDisabled();
    rerender(
      <ConfigProvider components={defaults}>
        <Alert title="Status" extra={<a href="#details">Details</a>} />
      </ConfigProvider>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute('href', '#details');
    rerender(
      <ConfigProvider components={defaults}>
        <Alert title="Status" extra={null} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('status').querySelector('.leaf-alert__extra')).toBeNull();
  });

  it('preserves numeric extra content and leaves no wrapper when omitted', () => {
    const { rerender } = render(<Alert title="Status" extra={0} />);
    expect(screen.getByRole('status').querySelector('.leaf-alert__extra')).toHaveTextContent('0');
    rerender(<Alert title="Status" />);
    expect(screen.getByRole('status').querySelector('.leaf-alert__extra')).toBeNull();
  });
});
