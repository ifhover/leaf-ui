import { ImageOff, Scan } from 'lucide-react';
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
import { Loading } from '../loading';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { useClient } from '../shared/use-client';
import { useControllable } from '../shared/use-controllable';
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
export function ImagePreview(props: ImagePreviewProps) {
  const client = useClient();
  const [visited, setVisited] = useState(props.open);
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
export function ImagePreviewGroup({
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
}: ImagePreviewGroupProps) {
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
      <ImagePreview
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
  {
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
  },
  ref,
) {
  const t = useText();
  const group = useContext(GroupContext);
  const id = useId();
  const native = useRef<HTMLImageElement>(null);
  const mergedRef = useMergedRef(native, ref);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [open, setOpen] = useState(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A changed source begins a new image loading cycle.
  useEffect(() => {
    const node = native.current;
    setState(node?.complete ? (node.naturalWidth > 0 ? 'ready' : 'error') : 'loading');
  }, [src]);
  const register = group?.register;
  useEffect(() => {
    register?.(id, preview && src ? { src: previewSrc ?? src, alt } : null);
  }, [id, src, previewSrc, alt, preview, register]);
  useEffect(() => () => register?.(id, null), [id, register]);
  const image = (
    <img
      {...props}
      ref={mergedRef}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={props.loading ?? 'lazy'}
      style={{ objectFit: fit }}
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
      data-state={state}
    >
      {preview && src ? (
        <button
          type="button"
          className="leaf-image__trigger"
          aria-label={`${t('预览图片', 'Preview image')}${alt ? `: ${alt}` : ''}`}
          onClick={(event) => {
            if (!event.defaultPrevented && state !== 'error') {
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
      {state === 'loading' && (
        <span className="leaf-image__placeholder">
          <Loading size="sm" />
        </span>
      )}
      {state === 'error' && (
        <span
          className="leaf-image__placeholder"
          role="img"
          aria-label={alt || t('图片加载失败', 'Image unavailable')}
        >
          {fallback ?? <ImageOff size={24} aria-hidden="true" />}
        </span>
      )}
      {!group && (
        <ImagePreview
          items={src ? [{ src: previewSrc ?? src, alt }] : []}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </span>
  );
});
