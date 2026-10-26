import {
  createContext,
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
import {
  ComponentDefaultsContext,
  type LeafComponentDefaults,
  mergeComponentProps,
} from '../config-provider/component-defaults';
import { type LeafConfig, useLeafConfig } from '../config-provider/context';
import { deepActiveElement } from '../shared/dom';
import type { ImagePreviewItem, ImagePreviewProps } from './image';

const PreviewRenderer = lazy(() => import('./preview-renderer'));

export type ImagePreviewOptions = Omit<ImagePreviewProps, 'items' | 'open' | 'onClose'> & {
  onClose?: () => void;
};
export interface ImagePreviewApi {
  /** Open one image or a gallery. Returns an idempotent close function. */
  preview: (
    images: string | ImagePreviewItem | readonly (string | ImagePreviewItem)[],
    options?: ImagePreviewOptions,
  ) => () => void;
}
export interface ImagePreviewProviderProps {
  children?: ReactNode;
}
export interface ImagePreviewRequest {
  id: symbol;
  scope: string;
  items: readonly ImagePreviewItem[];
  options: ImagePreviewOptions;
  config: LeafConfig;
  components: LeafComponentDefaults;
  open: boolean;
  index: number;
  returnFocus: HTMLElement | null;
}
interface PreviewContextValue {
  show: (request: ImagePreviewRequest) => () => void;
  update: (scope: string, config: LeafConfig, components: LeafComponentDefaults) => void;
  cancel: (scope: string) => void;
}
const PreviewContext = createContext<PreviewContextValue | null>(null);

export function ImagePreviewProvider({ children }: ImagePreviewProviderProps) {
  const [request, setRequest] = useState<ImagePreviewRequest | null>(null);
  const current = useRef(request);
  const api = useMemo<PreviewContextValue>(() => {
    const close = (target: ImagePreviewRequest) => {
      if (current.current !== target || !target.open) return;
      const closed = { ...target, open: false };
      current.current = closed;
      setRequest(closed);
      target.options.onClose?.();
    };
    return {
      show(next) {
        const previous = current.current;
        current.current = next;
        setRequest(next);
        if (previous?.open) previous.options.onClose?.();
        return () => {
          const active = current.current;
          if (active?.id === next.id) close(active);
        };
      },
      update(scope, config, components) {
        const active = current.current;
        if (!active || active.scope !== scope) return;
        const next = { ...active, config, components };
        current.current = next;
        setRequest(next);
      },
      cancel(scope) {
        const active = current.current;
        if (active?.scope === scope) close(active);
      },
    };
  }, []);
  return (
    <PreviewContext.Provider value={api}>
      {children}
      {request && (
        <Suspense fallback={null}>
          <PreviewRenderer
            request={request}
            onClose={() => api.cancel(request.scope)}
            onIndexChange={(index) => {
              const active = current.current;
              if (!active || active.id !== request.id) return;
              current.current = { ...active, index };
              setRequest(current.current);
              request.options.onIndexChange?.(index);
            }}
          />
        </Suspense>
      )}
    </PreviewContext.Provider>
  );
}

export function ImagePreviewScope({ children }: ImagePreviewProviderProps) {
  return useContext(PreviewContext) ? (
    children
  ) : (
    <ImagePreviewProvider>{children}</ImagePreviewProvider>
  );
}

export function useImagePreview(): ImagePreviewApi {
  const host = useContext(PreviewContext);
  const config = useLeafConfig();
  const components = useContext(ComponentDefaultsContext);
  const scope = useId();
  const latest = useRef({ config, components });
  latest.current = { config, components };
  const mounted = useRef(true);
  useEffect(() => host?.update(scope, config, components), [host, scope, config, components]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      host?.cancel(scope);
    };
  }, [host, scope]);
  const api = useMemo<ImagePreviewApi>(
    () => ({
      preview(images, options = {}) {
        if (!host || !mounted.current) return () => {};
        const entries: readonly (string | ImagePreviewItem)[] =
          typeof images === 'string' ? [images] : 'src' in images ? [images] : images;
        const items = entries.map((image) =>
          typeof image === 'string' ? { src: image } : { ...image },
        );
        if (!items.length) return () => {};
        const snapshot = latest.current;
        const defaults = snapshot.components.ImagePreview;
        const resolved = mergeComponentProps<ImagePreviewProps>(defaults, {
          ...options,
          items,
          open: true,
          onClose: options.onClose ?? (() => {}),
        });
        // Capture before either lazy module can move focus away from the caller.
        const active = typeof document === 'undefined' ? null : deepActiveElement();
        return host.show({
          id: Symbol(),
          scope,
          items,
          options: { ...resolved },
          ...snapshot,
          open: true,
          index: resolved.index ?? 0,
          returnFocus: active && active instanceof HTMLElement ? active : null,
        });
      },
    }),
    [host, scope],
  );
  if (!host) throw new Error('useImagePreview requires ConfigProvider or ImagePreviewProvider.');
  return api;
}
