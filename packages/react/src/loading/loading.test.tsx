import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Loading, LoadingControl } from './loading';

describe('Loading', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults to the spinner variant while preserving status role and accessible label', () => {
    const { container } = render(
      <ConfigProvider locale="en-US">
        <Loading />
      </ConfigProvider>,
    );
    const root = container.querySelector('.leaf-loading') as HTMLElement;
    expect(root).toHaveClass('leaf-loading', 'leaf-loading--md', 'leaf-loading--spinner');
    expect(root).toHaveAttribute('aria-busy', 'true');
    const status = screen.getByRole('status', { name: 'Loading' });
    expect(status.querySelector('.leaf-loading__spinner')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['ring', '.leaf-loading__ring', 1],
    ['dual', '.leaf-loading__dual-outer, .leaf-loading__dual-inner', 2],
    ['orbit', '.leaf-loading__orbit-track, .leaf-loading__orbit-arm', 2],
    ['chase', '.leaf-loading__chase-dot', 8],
    ['dots', '.leaf-loading__dot', 3],
    ['wave', '.leaf-loading__wave-dot', 5],
    ['bars', '.leaf-loading__bar', 4],
    ['pulse', '.leaf-loading__pulse-ring', 3],
    ['grid', '.leaf-loading__grid-cell', 9],
    ['blocks', '.leaf-loading__block', 3],
    ['flip', '.leaf-loading__flip', 1],
  ] as const)(
    'renders the %s animation variant with expected decorative nodes',
    (variant, selector, count) => {
      const { container } = render(<Loading variant={variant} size="lg" tip="Loading data" />);
      const root = container.querySelector('.leaf-loading') as HTMLElement;
      expect(root).toHaveClass(`leaf-loading--${variant}`, 'leaf-loading--lg');
      const status = screen.getByRole('status', { name: 'Loading data' });
      expect(status.querySelectorAll(selector)).toHaveLength(count);
      const graphic = status.firstElementChild as HTMLElement;
      expect(graphic).toHaveAttribute('aria-hidden', 'true');
    },
  );

  it('supports ConfigProvider defaults, nested reset, instance precedence, and internal control isolation', () => {
    const { container, rerender } = render(
      <ConfigProvider components={{ Loading: { variant: 'dots', size: 'sm' } }}>
        <Loading />
        <Loading variant="grid" />
        <ConfigProvider components={{ Loading: null }}>
          <Loading data-testid="reset-loading" />
        </ConfigProvider>
        <LoadingControl data-testid="internal-loading" />
      </ConfigProvider>,
    );

    const loadings = container.querySelectorAll<HTMLElement>('.leaf-loading');
    expect(loadings[0]).toHaveClass('leaf-loading--dots', 'leaf-loading--sm');
    expect(loadings[1]).toHaveClass('leaf-loading--grid', 'leaf-loading--sm');
    expect(screen.getByTestId('reset-loading')).toHaveClass(
      'leaf-loading--spinner',
      'leaf-loading--md',
    );
    expect(screen.getByTestId('internal-loading')).toHaveClass(
      'leaf-loading--spinner',
      'leaf-loading--md',
    );

    rerender(
      <ConfigProvider components={{ Loading: { variant: 'bars', size: 'lg' } }}>
        <Loading />
      </ConfigProvider>,
    );
    expect(container.querySelector('.leaf-loading')).toHaveClass(
      'leaf-loading--bars',
      'leaf-loading--lg',
    );
  });

  it('keeps content overlay inert semantics, delay timer, and native attributes', () => {
    vi.useFakeTimers();
    render(
      <Loading variant="pulse" delay={300} tip="Syncing" data-testid="delayed-loading">
        <button type="button">Action</button>
      </Loading>,
    );
    expect(screen.getByTestId('delayed-loading')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Syncing' })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const status = screen.getByRole('status', { name: 'Syncing' });
    expect(status.querySelector('.leaf-loading__pulse')).toBeInTheDocument();
    const content = screen
      .getByRole('button', { name: 'Action' })
      .closest('.leaf-loading__content');
    expect(content).toHaveAttribute('data-loading', 'true');
    expect(content).toHaveAttribute('inert');
  });
});
