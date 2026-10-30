import {
  ChevronLeft,
  ChevronRight,
  Download,
  FlipHorizontal2,
  FlipVertical2,
  ImageOff,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  X,
} from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useDialog } from '../shared/dialog';
import { useMotionEnabled } from '../shared/motion';
import { usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';
import { useFormattedText } from '../shared/use-formatted-text';
import { useText } from '../shared/use-text';
import {
  fitRatio,
  type ImageTransform,
  initialTransform,
  transformStyle,
  wrapIndex,
  zoomAt,
} from './geometry';
import type { ImageViewerProps } from './types';

export function ImageViewer(props: ImageViewerProps) {
  const [identity, setIdentity] = useState({ session: props.session, key: 0 });
  if (identity.session !== props.session)
    setIdentity({ session: props.session, key: identity.key + 1 });
  return (
    <ScopedPortal>
      <ViewerHost key={identity.key} {...props} />
    </ScopedPortal>
  );
}

function Tool({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
>) {
  return (
    <button
      type="button"
      className="leaf-image-viewer__tool"
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}

interface Pointer {
  x: number;
  y: number;
}
interface Gesture {
  transform: ImageTransform;
  center: Pointer;
  distance: number;
  angle: number;
  moved: boolean;
  multiple: boolean;
  touch: boolean;
  hitImage: boolean;
}

function ViewerHost({
  items,
  open,
  index = 0,
  thumbnails = true,
  downloadable = false,
  onClose,
  onHidden,
  onIndexChange,
}: ImageViewerProps) {
  const t = useText();
  const format = useFormattedText();
  const motion = useMotionEnabled();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const tooltip = useRef<HTMLOutputElement>(null);
  const transform = useRef(initialTransform());
  const bounds = useRef({ left: 0, top: 0, width: 1, height: 1 });
  const fitted = useRef(1);
  const frame = useRef<number | undefined>(undefined);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const downloadRequest = useRef<AbortController | null>(null);
  const pointers = useRef(new Map<number, Pointer>());
  const gesture = useRef<Gesture | null>(null);
  const lastTap = useRef({ time: 0, x: 0, y: 0 });
  const manualDoubleTap = useRef(0);
  const suppressClick = useRef(false);
  const thumbnailDrag = useRef<{
    pointer: number;
    x: number;
    index: number;
    moved: boolean;
  } | null>(null);
  const suppressThumbnailClick = useRef(false);
  const focusThumbnail = useRef(false);
  const reportedHidden = useRef(false);
  const [closing, setClosing] = useState(false);
  const visible = open && !closing && items.length > 0;
  const present = usePresence(visible, root);
  const [current, setCurrent] = useState(() => Math.max(0, Math.min(index, items.length - 1)));
  const currentRef = useRef(current);
  const [size, setSize] = useState({
    width: items[current]?.width ?? 0,
    height: items[current]?.height ?? 0,
  });
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [downloadFailed, setDownloadFailed] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const latest = useRef({ items, index, open, onClose, onHidden, onIndexChange, size });
  latest.current = { items, index, open, onClose, onHidden, onIndexChange, size };
  const item = items[current];

  const paint = useCallback((queued = false) => {
    const write = () => {
      frame.current = undefined;
      if (image.current) image.current.style.transform = transformStyle(transform.current);
    };
    if (!queued) {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      write();
    } else if (frame.current === undefined) frame.current = requestAnimationFrame(write);
  }, []);
  function hint() {
    if (!tooltip.current) return;
    tooltip.current.textContent = `${Math.round(transform.current.ratio * 100)}%`;
    tooltip.current.dataset.visible = 'true';
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => {
      if (tooltip.current) delete tooltip.current.dataset.visible;
    }, 1000);
  }
  function zoom(ratio: number, x = 0, y = 0, queued = false) {
    transform.current = zoomAt(transform.current, ratio, x, y);
    paint(queued);
    hint();
  }
  function toggleSize(x = 0, y = 0) {
    zoom(Math.abs(transform.current.ratio - 1) < 0.001 ? fitted.current : 1, x, y);
  }
  function reset() {
    transform.current = initialTransform(fitted.current);
    paint();
  }
  const select = useCallback((next: number) => {
    const count = latest.current.items.length;
    if (!count) return;
    const position = wrapIndex(next, count);
    if (position === currentRef.current) return;
    focusThumbnail.current = Boolean(
      root.current
        ?.querySelector('.leaf-image-viewer__thumbnails')
        ?.contains(document.activeElement),
    );
    currentRef.current = position;
    setCurrent(position);
    latest.current.onIndexChange?.(position);
  }, []);
  function close() {
    setClosing(true);
  }
  useDialog(present, root, id, close, true, { initialFocus: root, returnFocus: false });
  useEffect(() => {
    if (present) {
      reportedHidden.current = false;
      return;
    }
    if (reportedHidden.current) return;
    reportedHidden.current = true;
    latest.current.onHidden?.();
    if (closing && latest.current.open) latest.current.onClose();
  }, [present, closing]);
  useEffect(() => {
    if (open) setClosing(false);
  }, [open]);
  useEffect(() => {
    const position = Math.max(0, Math.min(index, items.length - 1));
    currentRef.current = position;
    setCurrent(position);
  }, [index, items.length]);
  const source = item?.src;
  const imageKey = `${current}:${source ?? ''}`;
  const hintWidth = item?.width;
  const hintHeight = item?.height;
  useLayoutEffect(() => {
    void current;
    if (!focusThumbnail.current) return;
    focusThumbnail.current = false;
    root.current
      ?.querySelector<HTMLButtonElement>('.leaf-image-viewer__thumbnails [aria-current]')
      ?.focus({ preventScroll: true });
  }, [current]);
  useLayoutEffect(() => {
    void imageKey;
    void present;
    setLoaded(false);
    setFailed(false);
    setDownloadFailed(false);
    setBusy(false);
    pointers.current.clear();
    gesture.current = null;
    lastTap.current.time = 0;
    manualDoubleTap.current = 0;
    root.current?.removeAttribute('data-moving');
    root.current?.removeAttribute('data-wheeling');
    clearTimeout(wheelTimer.current);
    downloadRequest.current?.abort();
    downloadRequest.current = null;
    setSize({ width: hintWidth ?? 0, height: hintHeight ?? 0 });
    const box = bounds.current;
    fitted.current = fitRatio(hintWidth ?? 0, hintHeight ?? 0, box.width, box.height);
    transform.current = initialTransform(fitted.current);
    paint();
  }, [imageKey, hintWidth, hintHeight, present, paint]);
  useLayoutEffect(() => {
    const node = stage.current;
    if (!node || !present) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      bounds.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width || window.innerWidth,
        height: rect.height || window.innerHeight,
      };
      setViewportWidth(bounds.current.width);
      const previous = fitted.current;
      fitted.current = fitRatio(
        latest.current.size.width,
        latest.current.size.height,
        bounds.current.width,
        bounds.current.height,
      );
      if (Math.abs(transform.current.ratio - previous) < 0.001) {
        transform.current = { ...transform.current, x: 0, y: 0, ratio: fitted.current };
        paint();
      }
    };
    measure();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(node);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [present, paint]);
  const previousSource =
    items.length > 1 ? items[wrapIndex(current - 1, items.length)]?.src : undefined;
  const nextSource =
    items.length > 1 ? items[wrapIndex(current + 1, items.length)]?.src : undefined;
  // Only adjacent originals are warmed, after the current image is usable.
  useEffect(() => {
    if (!loaded || !visible) return;
    const pending = [...new Set([previousSource, nextSource])].filter(Boolean).map((source) => {
      const preload = new window.Image();
      preload.decoding = 'async';
      preload.fetchPriority = 'low';
      preload.src = source ?? '';
      return preload;
    });
    return () => {
      for (const preload of pending) if (!preload.complete) preload.src = '';
    };
  }, [loaded, visible, previousSource, nextSource]);
  const actions = useRef({ zoom });
  actions.current = { zoom };
  useEffect(() => {
    const node = stage.current;
    if (!node || !present) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      root.current?.setAttribute('data-wheeling', 'true');
      clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => root.current?.removeAttribute('data-wheeling'), 100);
      const rect = bounds.current;
      const delta =
        event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1);
      actions.current.zoom(
        transform.current.ratio * 1.1 ** (-Math.max(-100, Math.min(100, delta)) / 100),
        event.clientX - rect.left - rect.width / 2,
        event.clientY - rect.top - rect.height / 2,
        true,
      );
    };
    node.addEventListener('wheel', wheel, { passive: false });
    return () => node.removeEventListener('wheel', wheel);
  }, [present]);
  useEffect(
    () => () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      clearTimeout(hintTimer.current);
      clearTimeout(wheelTimer.current);
      downloadRequest.current?.abort();
    },
    [],
  );

  function point(event: { clientX: number; clientY: number }) {
    const rect = bounds.current;
    return {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    };
  }
  function begin(touch: boolean, moved = false, hitImage = true) {
    const values = [...pointers.current.values()];
    const first = values[0];
    if (!first) {
      gesture.current = null;
      return;
    }
    const second = values[1] ?? first;
    gesture.current = {
      transform: { ...transform.current },
      center: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
      distance: Math.hypot(second.x - first.x, second.y - first.y),
      angle: Math.atan2(second.y - first.y, second.x - first.x),
      moved,
      multiple: values.length > 1 || moved,
      touch,
      hitImage,
    };
  }
  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as Element).closest('button, a')) return;
    suppressClick.current = false;
    pointers.current.set(event.pointerId, point(event));
    stage.current?.setPointerCapture?.(event.pointerId);
    begin(event.pointerType === 'touch', pointers.current.size > 1, event.target === image.current);
  }
  function pointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (!start || !pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, point(event));
    const [first, second] = [...pointers.current.values()];
    if (!first) return;
    const center = second ? { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 } : first;
    const dx = center.x - start.center.x;
    const dy = center.y - start.center.y;
    if (Math.hypot(dx, dy) > 3 || second) start.moved = true;
    if (!start.moved) return;
    root.current?.setAttribute('data-moving', 'true');
    if (second && start.distance > 0) {
      const ratio =
        (start.transform.ratio * Math.hypot(second.x - first.x, second.y - first.y)) /
        start.distance;
      const value = zoomAt(start.transform, ratio, start.center.x, start.center.y);
      const angle =
        ((Math.atan2(second.y - first.y, second.x - first.x) - start.angle) * 180) / Math.PI;
      const rotation = ((angle + 540) % 360) - 180;
      const radians = (rotation * Math.PI) / 180;
      const x = value.x - start.center.x;
      const y = value.y - start.center.y;
      transform.current = {
        ...value,
        x: center.x + x * Math.cos(radians) - y * Math.sin(radians),
        y: center.y + x * Math.sin(radians) + y * Math.cos(radians),
        rotate: start.transform.rotate + rotation,
      };
    } else if (!start.touch || start.transform.ratio > fitted.current * 1.01 || start.multiple)
      transform.current = {
        ...start.transform,
        x: start.transform.x + dx,
        y: start.transform.y + dy,
      };
    paint(true);
  }
  function pointerEnd(event: ReactPointerEvent<HTMLDivElement>, cancelled = false) {
    const start = gesture.current;
    if (!start || !pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    suppressClick.current = start.moved || start.hitImage || cancelled;
    const finish = point(event);
    if (!cancelled && start.touch && !start.multiple) {
      const dx = finish.x - start.center.x;
      const dy = finish.y - start.center.y;
      if (
        start.moved &&
        start.transform.ratio <= fitted.current * 1.01 &&
        Math.abs(dx) > 50 &&
        Math.abs(dx) > Math.abs(dy) * 1.5
      )
        select(currentRef.current + (dx < 0 ? 1 : -1));
      if (!start.moved && start.hitImage) {
        const now = Date.now();
        if (
          now - lastTap.current.time < 300 &&
          Math.hypot(finish.x - lastTap.current.x, finish.y - lastTap.current.y) < 24
        ) {
          toggleSize(finish.x, finish.y);
          manualDoubleTap.current = now;
          lastTap.current.time = 0;
        } else lastTap.current = { ...finish, time: now };
      }
    }
    if (pointers.current.size) begin(start.touch, true);
    else {
      paint();
      root.current?.removeAttribute('data-moving');
    }
  }
  async function download() {
    if (!item || downloadRequest.current || item.download === false) return;
    const request = new AbortController();
    downloadRequest.current = request;
    setBusy(true);
    setDownloadFailed(false);
    const address = typeof item.download === 'string' ? item.download : item.src;
    try {
      const response = await fetch(address, { signal: request.signal });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      if (request.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download =
        item.downloadName ||
        (!/^(data|blob):/i.test(address) && address.split(/[?#]/)[0]?.split('/').pop()) ||
        'image';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      if (!request.signal.aborted) setDownloadFailed(true);
    } finally {
      if (downloadRequest.current === request) {
        downloadRequest.current = null;
        setBusy(false);
      }
    }
  }
  if (!present || !item) return null;
  const nearby = Math.min(5, Math.max(3, Math.ceil(viewportWidth / 31 / 2) + 1));
  const firstThumbnail = Math.max(0, current - nearby);
  const lastThumbnail = Math.min(items.length, current + nearby + 1);
  const downloadAddress = typeof item.download === 'string' ? item.download : item.src;
  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={t('image.imagePreview')}
      aria-describedby={`${id}-position`}
      tabIndex={-1}
      className="leaf-image-viewer"
      data-state={visible ? 'open' : 'closing'}
      data-motion={motion ? 'on' : 'off'}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          select(currentRef.current + (event.key === 'ArrowLeft' ? -1 : 1));
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
          zoom(transform.current.ratio * (event.key === 'ArrowUp' ? 1.1 : 1 / 1.1));
        } else if (event.ctrlKey && (event.key === '0' || event.key === '1')) {
          event.preventDefault();
          toggleSize();
        }
      }}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Canvas gestures supplement the named toolbar buttons and dialog keyboard commands. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape and the close button provide keyboard backdrop dismissal. */}
      <div
        ref={stage}
        className="leaf-image-viewer__stage"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={(event) => pointerEnd(event)}
        onPointerCancel={(event) => pointerEnd(event, true)}
        onLostPointerCapture={(event) => pointerEnd(event, true)}
        onClick={(event) => {
          if (event.target === event.currentTarget && !suppressClick.current) close();
          suppressClick.current = false;
        }}
        onDoubleClick={(event) => {
          // Pointer capture can retarget the browser's double-click to the stage.
          const start = gesture.current;
          const hitImage =
            event.target === image.current ||
            (event.target === stage.current && start?.hitImage && !start.moved && !start.touch);
          if (hitImage && Date.now() - manualDoubleTap.current > 400) {
            const position = point(event);
            toggleSize(position.x, position.y);
          }
        }}
      >
        <img
          key={imageKey}
          ref={image}
          src={source}
          alt={item.alt || item.downloadName || t('image.image')}
          draggable={false}
          decoding="async"
          fetchPriority="high"
          className="leaf-image-viewer__image"
          data-loaded={loaded || undefined}
          style={{
            width: size.width || undefined,
            height: size.height || undefined,
            marginLeft: -size.width / 2,
            marginTop: -size.height / 2,
          }}
          onLoad={(event) => {
            const node = event.currentTarget;
            const dimensions = {
              width: node.naturalWidth || item.width || 1,
              height: node.naturalHeight || item.height || 1,
            };
            setSize(dimensions);
            fitted.current = fitRatio(
              dimensions.width,
              dimensions.height,
              bounds.current.width,
              bounds.current.height,
            );
            transform.current = initialTransform(fitted.current);
            paint();
            setLoaded(true);
            setFailed(false);
          }}
          onError={() => {
            setFailed(true);
            setLoaded(false);
          }}
        />
        {!loaded && !failed && (
          <span
            className="leaf-image-viewer__loading"
            role="status"
            aria-label={t('image.image')}
          />
        )}
        {failed && (
          <div className="leaf-image-viewer__error" role="alert">
            <ImageOff />
            <span>{t('image.imageUnavailable')}</span>
            <a href={item.src} target="_blank" rel="noopener noreferrer">
              {t('image.openOriginal')}
            </a>
          </div>
        )}
        <output
          ref={tooltip}
          className="leaf-image-viewer__tooltip"
          aria-live="off"
          aria-label={t('image.zoomLevel')}
        />
        {items.length > 1 && (
          <>
            <button
              type="button"
              className="leaf-image-viewer__navigation leaf-image-viewer__navigation--previous"
              aria-label={t('image.previousImage')}
              title={t('image.previousImage')}
              onClick={() => select(currentRef.current - 1)}
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              className="leaf-image-viewer__navigation leaf-image-viewer__navigation--next"
              aria-label={t('image.nextImage')}
              title={t('image.nextImage')}
              onClick={() => select(currentRef.current + 1)}
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>
      <div className="leaf-image-viewer__footer">
        <div className="leaf-image-viewer__title" aria-live="polite">
          {downloadFailed ? (
            <span role="alert">
              {t('image.downloadFailedOpenTheOriginalImageToSaveIt')}{' '}
              <a href={downloadAddress} target="_blank" rel="noopener noreferrer">
                {t('image.openOriginal')}
              </a>
            </span>
          ) : (
            <>
              {item.alt || item.downloadName || t('image.image')}
              {loaded && ` (${size.width} × ${size.height})`}
            </>
          )}
        </div>
        <div
          className="leaf-image-viewer__toolbar"
          role="toolbar"
          aria-label={t('image.imagePreview')}
        >
          <Tool label={t('image.zoomIn')} onClick={() => zoom(transform.current.ratio * 1.1)}>
            <Plus />
          </Tool>
          <Tool label={t('image.zoomOut')} onClick={() => zoom(transform.current.ratio / 1.1)}>
            <Minus />
          </Tool>
          <Tool label={t('image.actualSize')} onClick={() => toggleSize()}>
            <span className="leaf-image-viewer__one-to-one">1:1</span>
          </Tool>
          <Tool label={t('image.resetImage')} onClick={reset}>
            <RefreshCw />
          </Tool>
          <Tool
            label={t('image.previousImage')}
            onClick={() => select(currentRef.current - 1)}
            disabled={items.length < 2}
          >
            <ChevronLeft />
          </Tool>
          <Tool
            label={t('image.nextImage')}
            onClick={() => select(currentRef.current + 1)}
            disabled={items.length < 2}
          >
            <ChevronRight />
          </Tool>
          <Tool
            label={t('image.rotateCounterclockwise')}
            onClick={() => {
              transform.current.rotate -= 90;
              paint();
            }}
          >
            <RotateCcw />
          </Tool>
          <Tool
            label={t('image.rotateClockwise')}
            onClick={() => {
              transform.current.rotate += 90;
              paint();
            }}
          >
            <RotateCw />
          </Tool>
          <Tool
            label={t('image.flipHorizontal')}
            onClick={() => {
              transform.current.flipX *= -1;
              paint();
            }}
          >
            <FlipHorizontal2 />
          </Tool>
          <Tool
            label={t('image.flipVertical')}
            onClick={() => {
              transform.current.flipY *= -1;
              paint();
            }}
          >
            <FlipVertical2 />
          </Tool>
          {downloadable && item.download !== false && (
            <Tool
              label={t('image.downloadImage')}
              aria-disabled={busy || undefined}
              onClick={() => void download()}
            >
              <Download />
            </Tool>
          )}
        </div>
        {thumbnails && (
          <nav
            className="leaf-image-viewer__thumbnails"
            aria-label={t('image.imageList')}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              suppressThumbnailClick.current = false;
              thumbnailDrag.current = {
                pointer: event.pointerId,
                x: event.clientX,
                index: currentRef.current,
                moved: false,
              };
            }}
            onPointerMove={(event) => {
              const drag = thumbnailDrag.current;
              if (!drag || drag.pointer !== event.pointerId) return;
              const distance = event.clientX - drag.x;
              if (Math.abs(distance) < 4) return;
              drag.moved = true;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              select(drag.index - Math.round(distance / 31));
            }}
            onPointerUp={() => {
              suppressThumbnailClick.current = thumbnailDrag.current?.moved ?? false;
              thumbnailDrag.current = null;
            }}
            onPointerCancel={() => {
              suppressThumbnailClick.current = true;
              thumbnailDrag.current = null;
            }}
            onLostPointerCapture={() => {
              thumbnailDrag.current = null;
            }}
            onClickCapture={(event) => {
              if (suppressThumbnailClick.current) {
                event.preventDefault();
                event.stopPropagation();
                suppressThumbnailClick.current = false;
              }
            }}
          >
            {items.slice(firstThumbnail, lastThumbnail).map((thumbnail, offset) => {
              const position = firstThumbnail + offset;
              return (
                <button
                  type="button"
                  key={position}
                  aria-label={format('image.viewImage', {
                    index: position + 1,
                    alt: thumbnail.alt ? `: ${thumbnail.alt}` : '',
                  })}
                  aria-current={position === current ? 'true' : undefined}
                  style={{ left: `calc(50% + ${(position - current) * 31}px)` }}
                  onClick={() => select(position)}
                >
                  <img
                    src={thumbnail.thumbnailSrc || thumbnail.src}
                    alt=""
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                    draggable={false}
                  />
                </button>
              );
            })}
          </nav>
        )}
      </div>
      <button
        type="button"
        className="leaf-image-viewer__close"
        aria-label={t('image.closePreview')}
        title={t('image.closePreview')}
        onClick={close}
      >
        <X />
      </button>
      <span id={`${id}-position`} className="leaf-image-viewer__sr-only">
        {format('image.position', { index: current + 1, total: items.length })}
      </span>
    </div>
  );
}
