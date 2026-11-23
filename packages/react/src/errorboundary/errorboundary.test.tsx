import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider, ErrorBoundary } from '../index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('catches errors with an alert fallback and resets on Retry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    const onReset = vi.fn();
    let shouldThrow = true;
    function Unstable() {
      if (shouldThrow) throw new Error('boom');
      return <span>Healthy</span>;
    }

    render(
      <ConfigProvider locale="en-US">
        <ErrorBoundary onError={onError} onReset={onReset}>
          <Unstable />
        </ErrorBoundary>
      </ConfigProvider>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('leaf-error-boundary');
    expect(onError).toHaveBeenCalledOnce();

    shouldThrow = false;
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onReset).toHaveBeenCalledOnce();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('passes error and reset helper to render-prop fallback', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let broken = true;
    function Child() {
      if (broken) throw new Error('Custom failure');
      return <span>Clean</span>;
    }

    render(
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <button
            type="button"
            onClick={() => {
              broken = false;
              reset();
            }}
          >
            Recover: {error.message}
          </button>
        )}
      >
        <Child />
      </ErrorBoundary>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Recover: Custom failure' }));
    expect(screen.getByText('Clean')).toBeInTheDocument();
  });
});
