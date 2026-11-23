import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Steps } from '../index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Steps', () => {
  it('renders sizes, progressDot, active percentage ring, and selection callbacks', async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <Steps
        size="sm"
        current={1}
        percent={65}
        loading
        onChange={onChange}
        items={[
          { key: '1', title: 'Setup', description: 'Basic config' },
          { key: '2', title: 'Verify' },
          { key: '3', title: 'Done', disabled: true },
        ]}
      />,
    );
    const list = container.querySelector('.leaf-steps');
    expect(list).toHaveClass('leaf-steps--sm', 'leaf-steps--horizontal');
    expect(container.querySelector('.leaf-steps__progress')).toBeInTheDocument();
    expect(container.querySelector('.leaf-steps__spinner')).toBeInTheDocument();
    expect(screen.getByText('Verify').closest('li')).toHaveAttribute('aria-current', 'step');

    await userEvent.click(screen.getByRole('button', { name: /Setup/ }));
    expect(onChange).toHaveBeenCalledWith(0);
    expect(screen.getByRole('button', { name: /Done/ })).toBeDisabled();

    rerender(
      <Steps
        size="lg"
        direction="vertical"
        progressDot={(dot, info) => (
          <span data-testid={`dot-${info.index}`} data-status={info.status}>
            {dot}
          </span>
        )}
        items={[{ title: 'One' }, { title: 'Two', status: 'error' }]}
      />,
    );
    expect(container.querySelector('.leaf-steps')).toHaveClass(
      'leaf-steps--lg',
      'leaf-steps--vertical',
      'leaf-steps--dot',
    );
    expect(screen.getByTestId('dot-1')).toHaveAttribute('data-status', 'error');
  });

  it('uses restrained opacity transition instead of spring scaling on state transitions', () => {
    const animate = vi.fn<
      (
        keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
        options?: number | KeyframeAnimationOptions,
      ) => Animation
    >(() => ({ cancel: vi.fn() }) as unknown as Animation);
    HTMLElement.prototype.animate = animate;
    const { rerender } = render(<Steps current={0} items={[{ title: 'One' }, { title: 'Two' }]} />);
    rerender(<Steps current={1} items={[{ title: 'One' }, { title: 'Two' }]} />);
    expect(animate).toHaveBeenCalled();
    const frames = animate.mock.calls[0]?.[0];
    expect(frames).toEqual([{ opacity: 0.45 }, { opacity: 1 }]);
  });
});
