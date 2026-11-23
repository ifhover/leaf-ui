import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfigProvider, Progress } from '../index';

describe('Progress', () => {
  it('renders line successPercent, auto-success at 100%, and ignores circle-only modifiers on line', () => {
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Progress percent={70} successPercent={35} dashboard aria-label="Upload" />
      </ConfigProvider>,
    );
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveClass('leaf-progress--line');
    expect(bar).not.toHaveClass('leaf-progress--dashboard');
    expect(bar.querySelector('.leaf-progress__fill')).toHaveStyle({ width: '70%' });
    expect(bar.querySelector('.leaf-progress__fill--success')).toHaveStyle({ width: '35%' });

    rerender(
      <ConfigProvider locale="en-US">
        <Progress percent={100} aria-label="Upload" />
      </ConfigProvider>,
    );
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute(
      'data-status',
      'success',
    );

    rerender(
      <ConfigProvider locale="en-US">
        <Progress percent={100} status="error" aria-label="Upload" />
      </ConfigProvider>,
    );
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute(
      'data-status',
      'error',
    );
  });

  it('renders steps, segments, and circle dashboard modes cleanly', () => {
    const { container, rerender } = render(<Progress percent={60} steps={5} aria-label="Steps" />);
    expect(container.querySelector('.leaf-progress--steps')).toBeInTheDocument();
    expect(container.querySelectorAll('.leaf-progress__step')).toHaveLength(5);
    expect(container.querySelectorAll('.leaf-progress__step[data-filled]')).toHaveLength(3);

    rerender(
      <Progress
        type="circle"
        dashboard
        steps={5}
        percent={50}
        successPercent={80}
        indeterminate
        showInfo
        aria-label="Circular"
      />,
    );
    const circle = screen.getByRole('progressbar', { name: 'Circular' });
    expect(circle).toHaveClass('leaf-progress--circle', 'leaf-progress--dashboard');
    expect(circle).not.toHaveClass('leaf-progress--steps');
    expect(circle.querySelector('.leaf-progress__info')).toBeNull();
    expect(circle.querySelector('.leaf-progress__arc--success')).toBeInTheDocument();
  });

  it('supports custom format and ConfigProvider defaults', () => {
    render(
      <ConfigProvider components={{ Progress: { active: true, showInfo: false } }}>
        <Progress percent={45} active={false} format={(v) => `${v} done`} showInfo />
      </ConfigProvider>,
    );
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('data-active');
    expect(bar).toHaveTextContent('45 done');
  });
});
