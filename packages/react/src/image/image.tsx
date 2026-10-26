import { Image as ImageIcon, ImageOff, Scan } from 'lucide-react';
import {
  createContext,
  forwardRef,
  type ImgHTMLAttributes,
  lazy,
  type ReactNode,
  Suspense,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { LoadingControl as Loading } from '../loading/loading';
import { classes } from '../shared/classes';
import { deepActiveElement } from '../shared/dom';
import { useMergedRef } from '../shared/field';
import { useClient } from '../shared/use-client';
import { useControllable } from '../shared/use-controllable';
import { useFormattedText } from '../shared/use-formatted-text';
import { useText } from '../shared/use-text';

export interface ImagePreviewItem {
  src: string;
  thumbnailSrc?: string;
  alt?: string;
  width?: number;
  height?: number;
  download?: string | boolean;
  downloadName?: string;
}
export interface ImagePreviewProps {
  items: readonly ImagePreviewItem[];
  open: boolean;
  index?: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  thumbnails?: boolean;
  downloadable?: boolean;
}
const Viewer = lazy(() => import('./viewer').then((module) => ({ default: module.ImageViewer })));
interface ImagePreviewControlProps extends ImagePreviewProps {
  returnFocus?: HTMLElement | null;
}
export function ImagePreviewControl({ returnFocus, ...props }: ImagePreviewControlProps) {
  const client = useClient();
  const [visited, setVisited] = useState(props.open);
  const wasOpen = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const requestedOpener = useRef(returnFocus);
  requestedOpener.current = returnFocus;
  // Safari may omit focus-event relatedTarget; snapshot before the lazy viewer takes focus.
  if (props.open && !wasOpen.current && typeof document !== 'undefined') {
    const active = deepActiveElement();
    opener.current =
      returnFocus === undefined ? (active instanceof HTMLElement ? active : null) : returnFocus;
  }
  wasOpen.current = props.open;
  useEffect(() => {
    if (!props.open) return;
    const target = opener.current;
    return () => {
      const restore = requestedOpener.current === undefined ? target : requestedOpener.current;
      if (restore?.isConnected) restore.focus({ preventScroll: true });
    };
  }, [props.open]);
  useEffect(() => {
    if (props.open) setVisited(true);
  }, [props.open]);
  if (!client || (!props.open && !visited)) return null;
  return (
    <Suspense fallback={null}>
      <Viewer {...props} />
    </Suspense>
  );
}
interface GroupContextValue {
  register: (id: string, item: ImagePreviewItem | null) => void;
  show: (id: string) => void;
}
const GroupContext = createContext<GroupContextValue | null>(null);
export interface ImagePreviewGroupProps {
  children?: ReactNode;
  items?: readonly ImagePreviewItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  thumbnails?: boolean;
  downloadable?: boolean;
}
export function ImagePreviewGroup(rawProps: ImagePreviewGroupProps) {
  const {
    children,
    items,
    open: controlled,
    defaultOpen = false,
    onOpenChange,
    index: controlledIndex,
    defaultIndex = 0,
    onIndexChange,
    thumbnails = true,
    downloadable = false,
  } = useComponentProps('ImagePreviewGroup', rawProps);
  const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  const [index, setIndex] = useControllable(controlledIndex, defaultIndex, onIndexChange);
  const [registered, setRegistered] = useState<{ id: string; item: ImagePreviewItem }[]>([]);
  // Registration must not depend on the list or opening a viewer would reorder images.
  const register = useMemo(
    () => (id: string, item: ImagePreviewItem | null) =>
      setRegistered((previous) => {
        const position = previous.findIndex((entry) => entry.id === id);
        if (!item) return previous.filter((entry) => entry.id !== id);
        if (position < 0) return [...previous, { id, item }];
        return previous.map((entry) => (entry.id === id ? { id, item } : entry));
      }),
    [],
  );
  const context = useMemo<GroupContextValue>(
    () => ({
      register,
      show(id) {
        const position = registered.findIndex((entry) => entry.id === id);
        if (position >= 0) {
          setIndex(position);
          setOpen(true);
        }
      },
    }),
    [registered, setIndex, setOpen, register],
  );
  return (
    <GroupContext.Provider value={context}>
      {children}
      <ImagePreviewControl
        items={items ?? registered.map((entry) => entry.item)}
        open={open}
        index={index}
        onClose={() => setOpen(false)}
        onIndexChange={setIndex}
        thumbnails={thumbnails}
        downloadable={downloadable}
      />
    </GroupContext.Provider>
  );
}
export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  preview?: boolean;
  previewSrc?: string;
  fallback?: ReactNode;
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  rawProps: ImageProps,
  ref,
) {
  const {
    src,
    alt = '',
    preview = true,
    previewSrc,
    fallback,
    fit = 'cover',
    className,
    style,
    width,
    height,
    onLoad,
    onError,
    ...props
  } = useComponentProps('Image', rawProps);
  const t = useText();
  const format = useFormattedText();
  const group = useContext(GroupContext);
  const id = useId();
  const native = useRef<HTMLImageElement>(null);
  const mergedRef = useMergedRef(native, ref);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const empty = !src?.trim() && !props.srcSet?.trim();
  const status = empty ? 'empty' : state;
  const [open, setOpen] = useState(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A changed source begins a new image loading cycle.
  useEffect(() => {
    const node = native.current;
    setState(node?.complete ? (node.naturalWidth > 0 ? 'ready' : 'error') : 'loading');
  }, [src, props.srcSet]);
  const register = group?.register;
  useEffect(() => {
    register?.(id, preview && src?.trim() ? { src: previewSrc ?? src, alt } : null);
  }, [id, src, previewSrc, alt, preview, register]);
  useEffect(() => () => register?.(id, null), [id, register]);
  const image = (
    <img
      {...props}
      ref={mergedRef}
      src={src?.trim() ? src : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={props.loading ?? 'lazy'}
      style={{
        objectFit: fit,
        cursor: props.onClick && !empty ? 'pointer' : undefined,
      }}
      onLoad={(event) => {
        setState('ready');
        onLoad?.(event);
      }}
      onError={(event) => {
        setState('error');
        onError?.(event);
      }}
    />
  );
  return (
    <span
      className={classes('leaf-image', className)}
      style={{ width, height, ...style }}
      data-state={status}
    >
      {preview && src?.trim() ? (
        <button
          type="button"
          className="leaf-image__trigger"
          disabled={state !== 'ready'}
          aria-label={format('image.previewImage', { alt: alt ? `: ${alt}` : '' })}
          onClick={(event) => {
            if (!event.defaultPrevented && state !== 'error') {
              event.currentTarget.focus({ preventScroll: true });
              if (group) group.show(id);
              else setOpen(true);
            }
          }}
        >
          {image}
          <span className="leaf-image__zoom" aria-hidden="true">
            <Scan size={20} />
          </span>
        </button>
      ) : (
        image
      )}
      {status === 'loading' && (
        <span className="leaf-image__placeholder">
          <Loading size="sm" />
        </span>
      )}
      {(status === 'error' || status === 'empty') && (
        <span
          className="leaf-image__placeholder"
          role="img"
          aria-label={alt || t(empty ? 'image.noImage' : 'image.imageUnavailable')}
        >
          {fallback ?? (
            <span className="leaf-image__fallback">
              {empty ? <ImageIcon aria-hidden="true" /> : <ImageOff aria-hidden="true" />}
              <span>{t(empty ? 'image.noImage' : 'image.imageUnavailable')}</span>
            </span>
          )}
        </span>
      )}
      {!group && (
        <ImagePreviewControl
          items={src ? [{ src: previewSrc ?? src, alt }] : []}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </span>
  );
});

export function ImagePreview(rawProps: ImagePreviewProps) {
  const props = useComponentProps('ImagePreview', rawProps);
  return <ImagePreviewControl {...props} />;
}
