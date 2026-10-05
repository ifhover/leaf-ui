import {
  ChevronLeft,
  ChevronRight,
  Download,
  ImageOff,
  Maximize2,
  Minimize2,
  PanelBottom,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import Lightbox, {
  type FullscreenRef,
  useController,
  useLightboxState,
  useNavigationState,
  type ZoomRef,
} from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { Loading } from '../loading';
import { ScopedPortal } from '../shared/scoped-portal';
import { useText } from '../shared/use-text';
import type { ImagePreviewItem, ImagePreviewProps } from './image';

export function ImageViewer(props: ImagePreviewProps) {
  return (
    <ScopedPortal>
      <Viewer {...props} />
    </ScopedPortal>
  );
}
function Control({
  label,
  children,
  active,
  disabled,
  onClick,
  className = '',
}: {
  label: string;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`leaf-image-viewer__control ${className}`}
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function ViewerChrome({
  items,
  thumbnails,
  downloadable,
  zoomControl,
  fullscreenControl,
}: {
  items: readonly ImagePreviewItem[];
  thumbnails: boolean;
  downloadable: boolean;
  zoomControl: ZoomRef | null;
  fullscreenControl: FullscreenRef | null;
}) {
  const t = useText();
  const { currentIndex } = useLightboxState();
  const { prev, next, close } = useController();
  const { prevDisabled, nextDisabled } = useNavigationState();
  const strip = useRef<HTMLFieldSetElement>(null);
  const [showThumbs, setShowThumbs] = useState(thumbnails);
  const [failedDownload, setFailedDownload] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const item = items[currentIndex];
  const hasThumbs = thumbnails && items.length > 1;
  const zoom = zoomControl?.zoom ?? 1;
  const fullscreen = fullscreenControl?.fullscreen ?? false;
  const downloadUrl = typeof item?.download === 'string' ? item.download : item?.src;
  useEffect(() => setShowThumbs(thumbnails), [thumbnails]);
  useEffect(() => {
    setFailedDownload(false);
    if (!showThumbs) return;
    const root = strip.current;
    const selected = root?.querySelector<HTMLElement>(`[data-index="${currentIndex}"]`);
    if (root && selected)
      root.scrollTo({
        left: selected.offsetLeft - root.offsetLeft - (root.clientWidth - selected.clientWidth) / 2,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
  }, [currentIndex, showThumbs]);
  const choose = (target: number) => {
    const difference = target - currentIndex;
    if (difference > 0) next({ count: difference });
    else if (difference < 0) prev({ count: -difference });
  };
  const download = async () => {
    if (!item || downloading) return;
    setDownloading(true);
    setFailedDownload(false);
    try {
      const address = typeof item.download === 'string' ? item.download : item.src;
      const response = await fetch(address);
      if (!response.ok) throw new Error('Download failed');
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = item.downloadName || address.split(/[?#]/)[0]?.split('/').pop() || 'image';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setFailedDownload(true);
    } finally {
      setDownloading(false);
    }
  };
  return (
    <div
      className="leaf-image-viewer__chrome"
      data-thumbnails={(hasThumbs && showThumbs) || undefined}
    >
      <header className="leaf-image-viewer__header">
        <div className="leaf-image-viewer__title">
          <span>{item?.alt || t('图片预览', 'Image preview')}</span>
          <span className="leaf-image-viewer__count" aria-live="polite">
            {currentIndex + 1} / {items.length}
          </span>
        </div>
        <div className="leaf-image-viewer__header-actions">
          {downloadable && item?.download !== false && (
            <Control
              label={t('下载图片', 'Download image')}
              onClick={() => void download()}
              disabled={downloading}
            >
              {downloading ? <Loading size="sm" /> : <Download size={19} />}
            </Control>
          )}
          <Control
            label={
              fullscreen ? t('退出全屏', 'Exit fullscreen') : t('进入全屏', 'Enter fullscreen')
            }
            disabled={!fullscreenControl || fullscreenControl.disabled}
            onClick={() => (fullscreen ? fullscreenControl?.exit() : fullscreenControl?.enter())}
          >
            {fullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </Control>
          <Control label={t('关闭预览', 'Close preview')} onClick={close}>
            <X size={22} />
          </Control>
        </div>
      </header>
      {items.length > 1 && (
        <>
          <Control
            className="leaf-image-viewer__previous"
            label={t('上一张', 'Previous image')}
            disabled={prevDisabled}
            onClick={() => prev()}
          >
            <ChevronLeft size={26} />
          </Control>
          <Control
            className="leaf-image-viewer__next"
            label={t('下一张', 'Next image')}
            disabled={nextDisabled}
            onClick={() => next()}
          >
            <ChevronRight size={26} />
          </Control>
        </>
      )}
      <footer className="leaf-image-viewer__footer">
        {failedDownload && (
          <p role="alert" className="leaf-image-viewer__error">
            {t(
              '下载失败，可在新窗口打开原图保存',
              'Download failed. Open the original image to save it.',
            )}{' '}
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              {t('打开原图', 'Open original')}
            </a>
          </p>
        )}
        <div className="leaf-image-viewer__tools">
          <Control
            label={t('缩小', 'Zoom out')}
            disabled={!zoomControl || zoomControl.disabled || zoom <= 1}
            onClick={() => zoomControl?.zoomOut()}
          >
            <ZoomOut size={18} />
          </Control>
          <button
            type="button"
            className="leaf-image-viewer__zoom-level"
            onClick={() => zoomControl?.changeZoom(1)}
            title={t('重置缩放', 'Reset zoom')}
          >
            {Math.round(zoom * 100)}%
          </button>
          <Control
            label={t('放大', 'Zoom in')}
            disabled={!zoomControl || zoomControl.disabled || zoom >= zoomControl.maxZoom}
            onClick={() => zoomControl?.zoomIn()}
          >
            <ZoomIn size={18} />
          </Control>
          <Control
            label={t('重置缩放', 'Reset zoom')}
            disabled={zoom <= 1}
            onClick={() => zoomControl?.changeZoom(1)}
          >
            <RotateCcw size={17} />
          </Control>
          {hasThumbs && (
            <>
              <span className="leaf-image-viewer__tool-separator" />
              <Control
                label={t('显示缩略图', 'Show thumbnails')}
                active={showThumbs}
                onClick={() => setShowThumbs((value) => !value)}
              >
                <PanelBottom size={18} />
              </Control>
            </>
          )}
        </div>
        {hasThumbs && showThumbs && (
          <div className="leaf-image-viewer__gallery">
            <Control
              label={t('向前滚动缩略图', 'Scroll thumbnails backward')}
              onClick={() =>
                strip.current?.scrollBy({
                  left: -(strip.current.clientWidth * 0.7),
                  behavior: 'smooth',
                })
              }
            >
              <ChevronLeft size={18} />
            </Control>
            <fieldset
              className="leaf-image-viewer__thumbnails"
              ref={strip}
              aria-label={t('图片列表', 'Image list')}
            >
              {items.map((image, target) => (
                <button
                  type="button"
                  // biome-ignore lint/suspicious/noArrayIndexKey: Stateless thumbnails may intentionally repeat the same source URL.
                  key={`${image.src}-${target}`}
                  className="leaf-image-viewer__thumbnail"
                  data-index={target}
                  aria-current={currentIndex === target || undefined}
                  aria-label={`${t('查看第', 'View image')} ${target + 1}${t('张图片', '')}${image.alt ? `: ${image.alt}` : ''}`}
                  title={image.alt || String(target + 1)}
                  tabIndex={currentIndex === target ? 0 : -1}
                  onClick={() => choose(target)}
                  onKeyDown={(event) => {
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                    event.preventDefault();
                    event.stopPropagation();
                    const position =
                      event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? items.length - 1
                          : Math.max(
                              0,
                              Math.min(
                                items.length - 1,
                                target + (event.key === 'ArrowRight' ? 1 : -1),
                              ),
                            );
                    choose(position);
                    strip.current
                      ?.querySelector<HTMLButtonElement>(`[data-index="${position}"]`)
                      ?.focus();
                  }}
                >
                  <img
                    src={image.thumbnailSrc ?? image.src}
                    alt=""
                    loading="lazy"
                    draggable={false}
                  />
                  <span>{target + 1}</span>
                </button>
              ))}
            </fieldset>
            <Control
              label={t('向后滚动缩略图', 'Scroll thumbnails forward')}
              onClick={() =>
                strip.current?.scrollBy({
                  left: strip.current.clientWidth * 0.7,
                  behavior: 'smooth',
                })
              }
            >
              <ChevronRight size={18} />
            </Control>
          </div>
        )}
      </footer>
    </div>
  );
}
function Viewer({
  items,
  open,
  index = 0,
  onClose,
  onIndexChange,
  thumbnails = true,
  downloadable = false,
}: ImagePreviewProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [zoomControl, setZoomControl] = useState<ZoomRef | null>(null);
  const [fullscreenControl, setFullscreenControl] = useState<FullscreenRef | null>(null);
  const slides = useMemo(() => items.map((item) => ({ ...item })), [items]);
  const t = useText();
  return (
    <div ref={setRoot} className="leaf-image-viewer">
      {root && (
        <Lightbox
          open={open && items.length > 0}
          close={onClose}
          slides={slides}
          index={Math.max(0, Math.min(index, items.length - 1))}
          portal={{ root }}
          plugins={[Zoom, Fullscreen]}
          className="leaf-image-viewer__lightbox"
          carousel={{ finite: true, padding: 0, spacing: 24 }}
          zoom={{ ref: setZoomControl, maxZoomPixelRatio: 3, scrollToZoom: true }}
          fullscreen={{ ref: setFullscreenControl }}
          controller={{ closeOnBackdropClick: true }}
          toolbar={{ buttons: [] }}
          render={{
            buttonClose: () => null,
            buttonPrev: () => null,
            buttonNext: () => null,
            buttonZoom: () => null,
            buttonFullscreen: () => null,
            iconLoading: () => <Loading />,
            iconError: () => <ImageOff size={32} />,
            controls: () => (
              <ViewerChrome
                items={items}
                thumbnails={thumbnails}
                downloadable={downloadable}
                zoomControl={zoomControl}
                fullscreenControl={fullscreenControl}
              />
            ),
          }}
          labels={{
            Lightbox: t('图片预览', 'Image preview'),
            'Photo gallery': t('图片列表', 'Image list'),
            Slide: t('图片', 'Image'),
            '{index} of {total}': t('第 {index} 张，共 {total} 张', '{index} of {total}'),
            Close: t('关闭预览', 'Close preview'),
          }}
          on={{
            view: ({ index: next }) => {
              if (next !== index) onIndexChange?.(next);
            },
          }}
          styles={{
            root: {
              '--yarl__color_backdrop': 'rgba(0,0,0,.92)',
              zIndex: 'var(--leaf-z-index-modal)',
            },
          }}
        />
      )}
    </div>
  );
}
