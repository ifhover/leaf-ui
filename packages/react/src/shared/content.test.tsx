import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Avatar, Card, ConfigProvider, Divider, Empty, Skeleton } from '../index';

describe('Content components', () => {
  it('falls back from a failed avatar image and retries when its source changes', () => {
    const error = vi.fn();
    const { container, rerender } = render(
      <Avatar src="/missing.png" alt="Leaf" onError={error}>
        LF
      </Avatar>,
    );
    fireEvent.error(container.querySelector('img') as HTMLImageElement);
    expect(screen.getByText('LF')).toBeInTheDocument();
    expect(error).toHaveBeenCalledOnce();
    rerender(
      <Avatar src="/new.png" alt="Leaf">
        LF
      </Avatar>,
    );
    expect(container.querySelector('img')).toHaveAttribute('src', '/new.png');
  });
  it('renders localized empty and loading states then displays card content', () => {
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Empty />
        <Card title="Project" loading>
          Content
        </Card>
      </ConfigProvider>,
    );
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByText('Content')).toBeNull();
    rerender(
      <Card title="Project" footer="Footer">
        Content
      </Card>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
  it('bounds skeleton rows and supplies separator orientation', () => {
    const { container } = render(
      <>
        <Skeleton rows={10000} avatar />
        <Divider type="vertical" />
      </>,
    );
    expect(container.querySelectorAll('.leaf-skeleton__row')).toHaveLength(20);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
});
