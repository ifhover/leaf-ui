import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, StrictMode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LightboxExternalProps } from 'yet-another-react-lightbox';
import type { ImagePreviewItem } from './image';
import { ImageViewer } from './viewer';

// Observe the real carousel state without replacing its navigation or animation logic.
vi.mock('yet-another-react-lightbox', async (importOriginal) => {
  const actual = await importOriginal<typeof import('yet-another-react-lightbox')>();
  function NavigationProbe({ children }: { children: ReactNode }) {
    const { animation, currentSlide } = actual.useLightboxState();
    return (
      <>
        <output data-testid="navigation" data-increment={animation?.increment} />
        <output data-testid="slide" data-src={currentSlide?.src} data-alt={currentSlide?.alt} />
        {children}
      </>
    );
  }
  return {
    ...actual,
    default: (props: LightboxExternalProps) => (
      <actual.default
        {...props}
        render={{
          ...props.render,
          controls: () => <NavigationProbe>{props.render?.controls?.()}</NavigationProbe>,
        }}
      />
    ),
  };
});

const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn() });
});
afterEach(() => {
  vi.unstubAllGlobals();
  if (originalScrollTo) Object.defineProperty(HTMLElement.prototype, 'scrollTo', originalScrollTo);
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');
});

describe('Image preview navigation', () => {
  it('preserves the active animation when a controlled caller rebuilds the same image list', async () => {
    function Gallery() {
      const [index, setIndex] = useState(0);
      return (
        <ImageViewer
          open
          index={index}
          items={[
            { src: '/first.png', alt: 'First' },
            { src: '/second.png', alt: 'Second' },
            { src: '/third.png', alt: 'Third' },
          ]}
          onIndexChange={setIndex}
          onClose={() => {}}
        />
      );
    }
    render(
      <StrictMode>
        <Gallery />
      </StrictMode>,
    );
    fireEvent.click(await screen.findByRole('button', { name: '下一张' }));
    expect(screen.getByTestId('slide')).toHaveAttribute('data-src', '/second.png');
    expect(screen.getByTestId('navigation')).toHaveAttribute('data-increment', '1');
    fireEvent.click(screen.getByRole('button', { name: '上一张' }));
    expect(screen.getByTestId('slide')).toHaveAttribute('data-src', '/first.png');
    expect(screen.getByTestId('navigation')).toHaveAttribute('data-increment', '-1');
  });

  it('applies changed image data, order and an externally selected index', async () => {
    const props = { open: true, onClose: () => {} };
    const items: ImagePreviewItem[] = [
      { src: '/first.png', alt: 'First' },
      { src: '/second.png', alt: 'Second' },
    ];
    const { rerender } = render(<ImageViewer {...props} items={items} index={0} />);
    await screen.findByTestId('slide');
    rerender(<ImageViewer {...props} items={items.map((item) => ({ ...item }))} index={1} />);
    expect(screen.getByTestId('slide')).toHaveAttribute('data-src', '/second.png');
    rerender(
      <ImageViewer
        {...props}
        index={1}
        items={[
          { src: '/second.png', alt: 'Second' },
          { src: '/updated.png', alt: 'Updated' },
        ]}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('slide')).toHaveAttribute('data-src', '/updated.png');
      expect(screen.getByTestId('slide')).toHaveAttribute('data-alt', 'Updated');
    });
  });
});
