import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Image } from './image';

vi.mock('./viewer', () => ({ ImageViewer: () => <div data-testid="viewer" /> }));

describe('Image placeholders and activation', () => {
  it('renders a missing source immediately without loading or a preview trigger', () => {
    const { container } = render(<Image width={160} height={104} />);
    expect(container.querySelector('.leaf-image')).toHaveAttribute('data-state', 'empty');
    expect(screen.getByText('暂无图片')).toBeInTheDocument();
    expect(container.querySelector('.leaf-image__fallback svg')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('img')).not.toHaveAttribute('src');
  });

  it('does not advertise an empty image as an interactive target', () => {
    const { container } = render(<Image onClick={() => {}} />);
    expect(container.querySelector('img')).not.toHaveAttribute('style', /cursor/);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('blocks loading and failed images and recovers when the source changes', () => {
    const onError = vi.fn();
    const onLoad = vi.fn();
    const { container, rerender } = render(<Image src="/broken.png" onError={onError} />);
    const image = container.querySelector('img');
    if (!image) throw new Error('Missing native image');
    expect(screen.getByRole('button')).toBeDisabled();
    fireEvent.error(image);
    expect(screen.getByText('图片加载失败')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledOnce();
    expect(screen.getByRole('button')).toBeDisabled();
    rerender(<Image src="/good.png" onLoad={onLoad} />);
    expect(container.querySelector('.leaf-image')).toHaveAttribute('data-state', 'loading');
    fireEvent.load(image);
    expect(onLoad).toHaveBeenCalledOnce();
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('keeps custom fallbacks and display-only images', () => {
    const { container } = render(<Image src="/broken.png" preview={false} fallback="Custom" />);
    const image = container.querySelector('img');
    if (!image) throw new Error('Missing native image');
    fireEvent.error(image);
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not mistake a srcSet-only image for a missing image', () => {
    const { container } = render(
      <Image srcSet="/large.png 2x" alt="Responsive" onClick={() => {}} />,
    );
    fireEvent.load(screen.getByAltText('Responsive'));
    expect(container.querySelector('.leaf-image')).toHaveAttribute('data-state', 'ready');
    expect(screen.queryByText('暂无图片')).not.toBeInTheDocument();
    expect(screen.getByAltText('Responsive')).toHaveStyle({ cursor: 'pointer' });
  });
});
