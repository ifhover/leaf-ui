import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, StrictMode, useContext } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { ComponentDefaultsContext } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import type { ImagePreviewProps } from './image';
import { type ImagePreviewApi, ImagePreviewProvider, useImagePreview } from './provider';

const rendererLoad = vi.hoisted(() => {
  let release = () => {};
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { calls: 0, ready, release };
});

vi.mock('./preview-renderer', async (original) => {
  rendererLoad.calls++;
  await rendererLoad.ready;
  return original<typeof import('./preview-renderer')>();
});

vi.mock('./viewer', () => ({
  ImageViewer: (props: ImagePreviewProps) => {
    const config = useLeafConfig();
    const defaults = useContext(ComponentDefaultsContext);
    return props.open ? (
      <div
        data-testid="preview"
        data-locale={config.locale}
        data-thumbnails={String(props.thumbnails)}
        data-appearance={config.theme.appearance}
        data-direction={config.direction}
        data-button-disabled={String(defaults.Button?.disabled)}
      >
        <span>{config.messages.image.closePreview}</span>
        <span>{props.items[props.index ?? 0]?.src}</span>
        <button type="button" onClick={() => props.onIndexChange?.(1)}>
          Next
        </button>
        <button type="button" onClick={props.onClose}>
          Close
        </button>
      </div>
    ) : null;
  },
}));

let api: ImagePreviewApi;
function Caller() {
  const preview = useImagePreview();
  api = preview;
  return (
    <button type="button" onClick={() => preview.preview('/one.png')}>
      Open
    </button>
  );
}
function Region({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider locale="en-US" components={{ ImagePreview: { thumbnails: false } }}>
      {children}
    </ConfigProvider>
  );
}

describe('useImagePreview', () => {
  it('loads only for a request and keeps the initiating focus across a delayed host', async () => {
    const { rerender } = render(
      <Region>
        <Caller />
        <button type="button">Elsewhere</button>
      </Region>,
    );
    expect(rendererLoad.calls).toBe(0);
    const canceled = vi.fn();
    act(() => {
      const close = api.preview('/canceled.png', { onClose: canceled });
      close();
      close();
    });
    expect(canceled).toHaveBeenCalledOnce();

    const unmounted = vi.fn();
    act(() => {
      api.preview('/unmounted.png', { onClose: unmounted });
    });
    await waitFor(() => expect(rendererLoad.calls).toBe(1));
    rerender(<Region>{null}</Region>);
    expect(unmounted).toHaveBeenCalledOnce();
    rerender(
      <Region>
        <Caller />
        <button type="button">Elsewhere</button>
      </Region>,
    );
    const opener = screen.getByText('Open');
    opener.focus();
    const replaced = vi.fn();
    let stale = () => {};
    let close = () => {};
    act(() => {
      stale = api.preview('/old.png', { onClose: replaced });
      close = api.preview('/active.png');
      stale();
    });
    expect(replaced).toHaveBeenCalledOnce();
    screen.getByText('Elsewhere').focus();
    expect(screen.queryByTestId('preview')).not.toBeInTheDocument();
    await act(async () => rendererLoad.release());
    expect(await screen.findByText('/active.png')).toBeInTheDocument();
    expect(screen.queryByText('/canceled.png')).not.toBeInTheDocument();
    expect(screen.queryByText('/unmounted.png')).not.toBeInTheDocument();
    expect(screen.queryByText('/old.png')).not.toBeInTheDocument();
    screen.getByText('Next').focus();
    act(close);
    expect(opener).toHaveFocus();
  });

  it('opens arbitrary sources, navigates and returns an idempotent close handle', async () => {
    render(
      <StrictMode>
        <Region>
          <Caller />
        </Region>
      </StrictMode>,
    );
    const onClose = vi.fn();
    const onIndexChange = vi.fn();
    let close = () => {};
    act(() => {
      close = api.preview(['/one.png', { src: '/two.png' }], { onClose, onIndexChange });
    });
    expect(await screen.findByTestId('preview')).toHaveAttribute('data-locale', 'en-US');
    expect(screen.getByTestId('preview')).toHaveAttribute('data-thumbnails', 'false');
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('/two.png')).toBeInTheDocument();
    expect(onIndexChange).toHaveBeenCalledWith(1);
    act(() => {
      close();
      close();
    });
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('preview')).not.toBeInTheDocument();
  });

  it('replaces a request, ignores old handles and closes when the caller unmounts', async () => {
    const { rerender } = render(
      <Region>
        <Caller />
      </Region>,
    );
    const first = vi.fn();
    const second = vi.fn();
    let stale = () => {};
    act(() => {
      stale = api.preview('/old.png', { onClose: first });
    });
    await screen.findByText('/old.png');
    const replacementOpener = screen.getByText('Open');
    replacementOpener.focus();
    act(() => {
      api.preview({ src: '/new.png' }, { onClose: second, thumbnails: true });
      stale();
    });
    expect(first).toHaveBeenCalledOnce();
    expect(screen.getByText('/new.png')).toBeInTheDocument();
    expect(screen.getByTestId('preview')).toHaveAttribute('data-thumbnails', 'true');
    screen.getByText('Next').focus();
    rerender(<Region>{null}</Region>);
    expect(second).toHaveBeenCalledOnce();
    act(() => {
      api.preview('/after-unmount.png');
    });
    expect(screen.queryByTestId('preview')).not.toBeInTheDocument();
  });

  it('keeps captured options and index while region configuration changes', async () => {
    const { rerender } = render(
      <ConfigProvider locale="en-US" components={{ ImagePreview: { thumbnails: false } }}>
        <Caller />
      </ConfigProvider>,
    );
    let close = () => {};
    act(() => {
      close = api.preview(['/one.png', '/two.png'], { index: 1 });
    });
    await screen.findByTestId('preview');
    rerender(
      <ConfigProvider
        locale="zh-CN"
        theme={{ appearance: 'dark' }}
        direction="rtl"
        components={{ ImagePreview: { thumbnails: true }, Button: { disabled: true } }}
      >
        <Caller />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('preview')).toHaveAttribute('data-locale', 'zh-CN');
    expect(screen.getByTestId('preview')).toHaveAttribute('data-thumbnails', 'false');
    expect(screen.getByTestId('preview')).toHaveAttribute('data-appearance', 'dark');
    expect(screen.getByTestId('preview')).toHaveAttribute('data-direction', 'rtl');
    expect(screen.getByTestId('preview')).toHaveAttribute('data-button-disabled', 'true');
    expect(screen.getByText('关闭预览')).toBeInTheDocument();
    expect(screen.getByText('/two.png')).toBeInTheDocument();
    act(close);
    expect(screen.queryByTestId('preview')).not.toBeInTheDocument();
  });

  it('isolates providers, ignores empty galleries and renders no service layout on the server', async () => {
    const markup = renderToString(
      <ImagePreviewProvider>
        <Caller />
      </ImagePreviewProvider>,
    );
    expect(markup).not.toContain('display:contents');
    render(
      <>
        <ImagePreviewProvider>
          <Caller />
        </ImagePreviewProvider>
        <ImagePreviewProvider>
          <Caller />
        </ImagePreviewProvider>
      </>,
    );
    act(() => {
      api.preview([]);
    });
    expect(screen.queryByTestId('preview')).not.toBeInTheDocument();
    const [opener] = screen.getAllByText('Open');
    if (!opener) throw new Error('Missing preview trigger');
    fireEvent.click(opener);
    await screen.findByTestId('preview');
    expect(screen.getAllByTestId('preview')).toHaveLength(1);
  });
});
