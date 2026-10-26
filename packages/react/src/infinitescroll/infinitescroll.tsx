import { type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { LoadingControl as Loading } from '../loading/loading';
import { classes } from '../shared/classes';
import { useText } from '../shared/use-text';
export interface InfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
  dataLength: number;
  hasMore: boolean;
  onLoadMore: (signal: AbortSignal) => Promise<void>;
  target?: () => HTMLElement | null;
  threshold?: number;
  loader?: ReactNode;
  endMessage?: ReactNode;
  onError?: (error: unknown) => void;
}
export function InfiniteScroll(rawProps: InfiniteScrollProps) {
  const {
    dataLength,
    hasMore,
    onLoadMore,
    target,
    threshold = 200,
    loader,
    endMessage,
    onError,
    className,
    children,
    ...props
  } = useComponentProps('InfiniteScroll', rawProps);
  const t = useText();
  const sentinel = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  const manualLoad = useRef<() => void>(() => {});
  const [manual, setManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const requested = useRef<string | undefined>(undefined);
  const latest = useRef({ onLoadMore, onError });
  latest.current = { onLoadMore, onError };
  useEffect(() => {
    mounted.current = true;
    setLoading(false);
    setManual(typeof IntersectionObserver === 'undefined');
    return () => {
      mounted.current = false;
      controller.current?.abort();
      controller.current = null;
      requested.current = undefined;
    };
  }, []);
  useEffect(() => {
    if (!hasMore && controller.current) {
      controller.current.abort();
      controller.current = null;
      setLoading(false);
    }
  }, [hasMore]);
  useEffect(() => {
    if (!hasMore || error || loading) return;
    const element = sentinel.current;
    if (!element) return;
    let alive = true;
    let root = target?.() ?? null;
    if (!root) {
      let parent = element.parentElement;
      while (parent) {
        if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) {
          root = parent;
          break;
        }
        parent = parent.parentElement;
      }
    }
    const load = () => {
      const key = `${dataLength}:${retry}`;
      if (!alive || controller.current || requested.current === key) return;
      requested.current = key;
      const request = new AbortController();
      controller.current = request;
      setLoading(true);
      Promise.resolve()
        .then(() => {
          if (!request.signal.aborted) return latest.current.onLoadMore(request.signal);
        })
        .catch((reason) => {
          if (mounted.current && !request.signal.aborted) {
            setError(true);
            latest.current.onError?.(reason);
          }
        })
        .finally(() => {
          if (controller.current === request) controller.current = null;
          if (mounted.current && !request.signal.aborted) setLoading(false);
        });
    };
    manualLoad.current = load;
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) load();
            },
            { root, rootMargin: `${Math.max(0, threshold)}px` },
          );
    observer?.observe(element);
    return () => {
      alive = false;
      observer?.disconnect();
    };
  }, [dataLength, hasMore, error, retry, target, threshold, loading]);
  return (
    <div {...props} className={classes('leaf-infinite-scroll', className)} aria-busy={loading}>
      {children}
      <div ref={sentinel} className="leaf-infinite-scroll__sentinel" />
      <div className="leaf-infinite-scroll__status" aria-live="polite">
        <span
          key={
            error ? 'error' : loading ? 'loading' : !hasMore ? 'end' : manual ? 'manual' : 'idle'
          }
          className="leaf-infinite-scroll__feedback"
        >
          {error ? (
            <ButtonControl
              variant="text"
              onClick={() => {
                setError(false);
                setRetry((value) => value + 1);
              }}
            >
              {t('infiniteScroll.loadingFailedRetry')}
            </ButtonControl>
          ) : loading ? (
            (loader ?? <Loading size="sm" tip={t('common.loading')} />)
          ) : !hasMore ? (
            (endMessage ?? t('infiniteScroll.allItemsLoaded'))
          ) : manual ? (
            <ButtonControl variant="text" onClick={() => manualLoad.current()}>
              {t('infiniteScroll.loadMore')}
            </ButtonControl>
          ) : null}
        </span>
      </div>
    </div>
  );
}
