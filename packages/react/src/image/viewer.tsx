import {
  ChevronLeft,
  ChevronRight,
  Download,
  ImageOff,
  Maximize2,
  Minimize2,
  PanelBottom,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Lightbox, {
  type FullscreenRef,
  ImageSlide,
  isImageSlide,
  useController,
  useLightboxState,
  useLoseFocus,
  useNavigationState,
  type ZoomRef,
} from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { LoadingControl as Loading } from '../loading/loading';
import { ScrollbarControl } from '../scrollbar/scrollbar';
import { motionDuration, useMotionEnabled } from '../shared/motion';
import { ScopedPortal } from '../shared/scoped-portal';
import { useFormattedText } from '../shared/use-formatted-text';
import { useText } from '../shared/use-text';
import type { ImagePreviewItem, ImagePreviewProps } from './image';

const maxZoomPixelRatio = 20;

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
  const { focus } = useController();
  const focusHandlers = useLoseFocus(focus, disabled);
  return (
    <button
      type="button"
      className={`leaf-image-viewer__control ${className}`}
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      {...focusHandlers}
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
  onRotate,
}: {
  items: readonly ImagePreviewItem[];
  thumbnails: boolean;
  downloadable: boolean;
  zoomControl: ZoomRef | null;
  fullscreenControl: FullscreenRef | null;
  onRotate: (src: string, delta: number) => void;
}) {
  const t = useText();
  const format = useFormattedText();
  const motion = useMotionEnabled();
  const { currentIndex } = useLightboxState();
  const { prev, next, close } = useController();
  const { prevDisabled, nextDisabled } = useNavigationState();
  const strip = useRef<HTMLDivElement>(null);
  const [showThumbs, setShowThumbs] = useState(thumbnails);
  const [failedDownload, setFailedDownload] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const item = items[currentIndex];
  const hasThumbs = thumbnails && items.length > 1;
  const zoom = zoomControl?.zoom ?? 1;
  // The engine measures zoom relative to the fitted image, not its original pixels.
  const originalZoom =
    Math.max(zoomControl?.maxZoom ?? maxZoomPixelRatio, maxZoomPixelRatio) / maxZoomPixelRatio;
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
        behavior: motion ? 'smooth' : 'auto',
      });
  }, [currentIndex, showThumbs, motion]);
  const choose = (target: number) => {
    const difference = target - currentIndex;
    if (difference > 0) next({ count: difference });
    else if (difference < 0) prev({ count: -difference });
  };
  const scrollThumbnails = (distance: number) => {
    const viewport = strip.current;
    if (!viewport) return;
    const left = viewport.scrollLeft + distance;
    viewport.scrollTo({ left, behavior: motion ? 'smooth' : 'auto' });
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
          <span className="leaf-image-viewer__count" aria-live="polite">
            {currentIndex + 1} / {items.length}
          </span>
        </div>
        <div className="leaf-image-viewer__header-actions">
          {downloadable && item?.download !== false && (
            <Control
              label={t('image.downloadImage')}
              onClick={() => void download()}
              disabled={downloading}
            >
              {downloading ? <Loading size="sm" /> : <Download size={19} />}
            </Control>
          )}
          <Control
            label={fullscreen ? t('image.exitFullscreen') : t('image.enterFullscreen')}
            disabled={!fullscreenControl || fullscreenControl.disabled}
            onClick={() => (fullscreen ? fullscreenControl?.exit() : fullscreenControl?.enter())}
          >
            {fullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </Control>
          <Control label={t('image.closePreview')} onClick={close}>
            <X size={22} />
          </Control>
        </div>
      </header>
      {items.length > 1 && (
        <>
          <Control
            className="leaf-image-viewer__previous"
            label={t('image.previousImage')}
            disabled={prevDisabled}
            onClick={() => prev()}
          >
            <ChevronLeft size={26} />
          </Control>
          <Control
            className="leaf-image-viewer__next"
            label={t('image.nextImage')}
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
            {t('image.downloadFailedOpenTheOriginalImageToSaveIt')}{' '}
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              {t('image.openOriginal')}
            </a>
          </p>
        )}
        <div className="leaf-image-viewer__tools">
          <Control
            label={t('image.zoomOut')}
            disabled={!zoomControl || zoomControl.disabled || zoom <= zoomControl.minZoom}
            onClick={() => zoomControl?.zoomOut()}
          >
            <ZoomOut size={18} />
          </Control>
          <button
            type="button"
            className="leaf-image-viewer__zoom-level"
            onClick={() => zoomControl?.changeZoom(1)}
            title={t('image.fitToWindow')}
            aria-label={t('image.fitToWindow')}
            disabled={!zoomControl || zoomControl.disabled}
          >
            {Math.round((zoom / originalZoom) * 100)}%
          </button>
          <Control
            label={t('image.zoomIn')}
            disabled={!zoomControl || zoomControl.disabled || zoom >= zoomControl.maxZoom}
            onClick={() => zoomControl?.zoomIn()}
          >
            <ZoomIn size={18} />
          </Control>
          <Control
            label={t('image.actualSize')}
            disabled={!zoomControl || zoomControl.disabled}
            onClick={() => zoomControl?.changeZoom(originalZoom)}
          >
            <span className="leaf-image-viewer__actual-size" aria-hidden="true">
              1:1
            </span>
          </Control>
          <Control
            label={t('image.rotateCounterclockwise')}
            disabled={!zoomControl || zoomControl.disabled}
            onClick={() => item && onRotate(item.src, -90)}
          >
            <RotateCcw size={18} />
          </Control>
          <Control
            label={t('image.rotateClockwise')}
            disabled={!zoomControl || zoomControl.disabled}
            onClick={() => item && onRotate(item.src, 90)}
          >
            <RotateCw size={18} />
          </Control>
          {hasThumbs && (
            <>
              <span className="leaf-image-viewer__tool-separator" />
              <Control
                label={t('image.showThumbnails')}
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
              label={t('image.scrollThumbnailsBackward')}
              onClick={() => scrollThumbnails(-(strip.current?.clientWidth ?? 0) * 0.7)}
            >
              <ChevronLeft size={18} />
            </Control>
            <ScrollbarControl
              className="leaf-image-viewer__strip"
              contentClassName="leaf-image-viewer__thumbnails"
              ref={strip}
              orientation="horizontal"
              role="group"
              tabIndex={-1}
              scrollbarTabIndex={-1}
              aria-label={t('image.imageList')}
            >
              {items.map((image, target) => (
                <button
                  type="button"
                  // biome-ignore lint/suspicious/noArrayIndexKey: Stateless thumbnails may intentionally repeat the same source URL.
                  key={`${image.src}-${target}`}
                  className="leaf-image-viewer__thumbnail"
                  data-index={target}
                  aria-current={currentIndex === target || undefined}
                  aria-label={format('image.viewImage', {
                    index: target + 1,
                    alt: image.alt ? `: ${image.alt}` : '',
                  })}
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
            </ScrollbarControl>
            <Control
              label={t('image.scrollThumbnailsForward')}
              onClick={() => scrollThumbnails((strip.current?.clientWidth ?? 0) * 0.7)}
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
  const [rotations, setRotations] = useState<Record<string, number>>({});
  const [dimensions, setDimensions] = useState<Record<string, { width: number; height: number }>>(
    {},
  );
  const [slides, setSlides] = useState(() => items.map((item) => ({ ...item })));
  // A new array with the same images must not reset the carousel's navigation animation.
  if (
    items.length !== slides.length ||
    items.some((item, position) => {
      const slide = slides[position];
      return (
        !slide ||
        item.src !== slide.src ||
        item.alt !== slide.alt ||
        item.width !== slide.width ||
        item.height !== slide.height ||
        item.thumbnailSrc !== slide.thumbnailSrc ||
        item.download !== slide.download ||
        item.downloadName !== slide.downloadName
      );
    })
  ) {
    setSlides(items.map((item) => ({ ...item })));
  }
  const t = useText();
  const format = useFormattedText();
  const motion = useMotionEnabled();
  const duration = root && motion ? motionDuration(root) : 0;
  useEffect(() => {
    if (!root || !open) return;
    let container: HTMLElement | null = null;
    const closeOnMock = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (
        target.closest('.leaf-image-viewer__control, .leaf-image-viewer__thumbnail') ||
        target.closest('.yarl__slide_image')
      )
        return;
      if (target === container || target.closest('.yarl__slide, .yarl__slide_wrapper')) onClose();
    };
    const connect = () => {
      const next = root.querySelector<HTMLElement>('.yarl__container');
      if (next === container) return;
      container?.removeEventListener('click', closeOnMock);
      container = next;
      container?.addEventListener('click', closeOnMock);
    };
    connect();
    const observer = new MutationObserver(connect);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      container?.removeEventListener('click', closeOnMock);
    };
  }, [root, open, onClose]);
  const rotate = useCallback((src: string, delta: number) => {
    setRotations((previous) => ({ ...previous, [src]: (previous[src] ?? 0) + delta }));
  }, []);
  const previewSlides = useMemo(
    () =>
      slides.map((slide) => {
        const size = dimensions[slide.src] ?? slide;
        const turned = Math.abs((rotations[slide.src] ?? 0) % 180) === 90;
        // Keep the zoom engine's pan bounds aligned with the rotated image.
        return {
          ...slide,
          width: turned ? size.height : size.width,
          height: turned ? size.width : size.height,
        };
      }),
    [slides, dimensions, rotations],
  );
  return (
    <div ref={setRoot} className="leaf-image-viewer">
      {root && (
        <Lightbox
          open={open && items.length > 0}
          close={onClose}
          slides={previewSlides}
          index={Math.max(0, Math.min(index, items.length - 1))}
          portal={{ root }}
          plugins={[Zoom, Fullscreen]}
          className="leaf-image-viewer__lightbox"
          carousel={{ finite: true, padding: 0, spacing: 24 }}
          animation={{
            fade: duration * 1.2,
            swipe: duration * 1.6,
            navigation: duration * 1.6,
            zoom: duration * 0.85,
          }}
          zoom={{
            ref: setZoomControl,
            minZoom: 0.1,
            maxZoomPixelRatio,
            zoomInMultiplier: 1.25,
            wheelZoomDistanceFactor: 160,
            scrollToZoom: true,
          }}
          fullscreen={{ ref: setFullscreenControl }}
          controller={{ closeOnBackdropClick: true }}
          toolbar={{ buttons: [] }}
          render={{
            slide: ({ slide, rect, offset }) => {
              if (!isImageSlide(slide)) return undefined;
              const size = dimensions[slide.src];
              const angle = rotations[slide.src] ?? 0;
              const turned = Math.abs(angle % 180) === 90;
              const width = size?.width ?? slide.width;
              const height = size?.height ?? slide.height;
              const scale =
                width && height
                  ? Math.min(
                      1,
                      rect.width / (turned ? height : width),
                      rect.height / (turned ? width : height),
                    )
                  : 1;
              return (
                <ImageSlide
                  slide={{ ...slide, width, height }}
                  offset={offset}
                  rect={rect}
                  render={{
                    iconLoading: () => <Loading />,
                    iconError: () => <ImageOff size={32} />,
                  }}
                  style={{
                    width: width ? width * scale : undefined,
                    height: height ? height * scale : undefined,
                    maxWidth: width ? 'none' : undefined,
                    maxHeight: height ? 'none' : undefined,
                    rotate: `${angle}deg`,
                    transition: motion
                      ? `rotate ${duration * 1.8}ms var(--leaf-motion-easing)`
                      : 'none',
                  }}
                  onLoad={(image) =>
                    setDimensions((previous) => {
                      const next = { width: image.naturalWidth, height: image.naturalHeight };
                      return previous[slide.src]?.width === next.width &&
                        previous[slide.src]?.height === next.height
                        ? previous
                        : { ...previous, [slide.src]: next };
                    })
                  }
                />
              );
            },
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
                onRotate={rotate}
              />
            ),
          }}
          labels={{
            Lightbox: t('image.imagePreview'),
            'Photo gallery': t('image.imageList'),
            Slide: t('image.image'),
            '{index} of {total}': format('image.position', {
              index: index + 1,
              total: items.length,
            }),
            Close: t('image.closePreview'),
          }}
          on={{
            exited: () => setRotations({}),
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
