import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Badge, Button, ConfigProvider, Loading, Progress, Steps, Tag } from '../index';

describe('Display feedback', () => {
  it('lets tag close handlers prevent removal', async () => {
    const { rerender } = render(
      <Tag closable onClose={(event) => event.preventDefault()}>
        Keep
      </Tag>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Keep')).toBeInTheDocument();
    rerender(<Tag closable>Keep</Tag>);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Keep')).toBeNull();
  });
  it('handles empty counts, overflow badges and bounded progress', () => {
    const { rerender } = render(
      <Badge count={0}>
        <Button>Notifications</Button>
      </Badge>,
    );
    expect(screen.queryByRole('status')).toBeNull();
    rerender(
      <Badge count={120}>
        <Button>Notifications</Button>
      </Badge>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('99+');
    rerender(<Progress percent={140} aria-label="Upload" />);
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });
  it('reports step selection while honoring disabled steps', async () => {
    const change = vi.fn();
    render(
      <Steps
        current={1}
        onChange={change}
        items={[{ title: 'Create' }, { title: 'Review' }, { title: 'Publish', disabled: true }]}
      />,
    );
    expect(screen.getByText('Review').closest('li')).toHaveAttribute('aria-current', 'step');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(change).toHaveBeenCalledWith(0);
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
  });
  it('avoids showing a spinner for work that completes before the delay', async () => {
    vi.useFakeTimers();
    try {
      const { rerender } = render(
        <ConfigProvider locale="en-US">
          <Loading delay={200}>Content</Loading>
        </ConfigProvider>,
      );
      expect(screen.queryByRole('status')).toBeNull();
      rerender(
        <Loading spinning={false} delay={200}>
          Content
        </Loading>,
      );
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByRole('status')).toBeNull();
      expect(screen.getByText('Content')).not.toHaveAttribute('inert');
    } finally {
      vi.useRealTimers();
    }
  });
});
