import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { useText } from '../shared/use-text';

export interface ScrollbarProps extends HTMLAttributes<HTMLDivElement> {
  height?: CSSProperties['height'];
  maxHeight?: CSSProperties['maxHeight'];
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollbar?: 'auto' | 'always' | 'hidden';
  /** Keep tracks visible in reserved gutters instead of overlaying content. */
  persistent?: boolean;
  viewportClassName?: string;
  viewportStyle?: CSSProperties;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  verticalOffset?: number;
  /** Track thickness; `sm` is narrower and quieter for dense lists. */
  size?: 'sm' | 'md';
}

interface LayoutMetrics {
  width: number;
  height: number;
  scrollWidth: number;
  scrollHeight: number;
  rtl: boolean;
  x: number;
  y: number;
}

interface ScrollPosition {
  top: number;
  left: number;
}

interface ScrollbarControlProps extends ScrollbarProps {
  /** Internal composition keeps semantic attributes on the actual scroll viewport. */
  viewportProps?: HTMLAttributes<HTMLDivElement>;
  rootRef?: Ref<HTMLDivElement>;
  scrollbarTabIndex?: number;
  externalViewport?: RefObject<HTMLElement | null>;
  viewportRevision?: unknown;
  resizeHandle?: boolean;
}

// Keep in sync with the bar inset and thickness in scrollbar.scss.
const trackMetrics = {
  sm: { inset: 2, thickness: 6 },
  md: { inset: 4, thickness: 8 },
} as const;

const initialMetrics: LayoutMetrics = {
  width: 0,
  height: 0,
  scrollWidth: 0,
  scrollHeight: 0,
  rtl: false,
  x: 0,
  y: 0,
};

function computeBarMetrics(
  vertical: boolean,
  metrics: LayoutMetrics,
  pos: ScrollPosition,
  inset: number,
  resizeHandle: boolean,
  persistent: boolean,
  edge: number,
  cross: number,
  orientation: 'vertical' | 'horizontal' | 'both',
) {
  const horizontalOverflow = orientation !== 'vertical' && metrics.scrollWidth > metrics.width + 1;
  const verticalOverflow =
    orientation !== 'horizontal' && metrics.scrollHeight > metrics.height + 1;
  const visibleSize = vertical ? metrics.height : metrics.width;
  const contentSize = vertical ? metrics.scrollHeight : metrics.scrollWidth;
  const offset = vertical ? inset : 0;
  const crossOverflow = vertical ? horizontalOverflow : verticalOverflow;
  const endInset = resizeHandle ? 16 : crossOverflow && !persistent ? cross : edge;
  const trackSize = Math.max(0, visibleSize - offset - edge - endInset);
  const thumbSize = Math.min(
    trackSize,
    Math.max(24, (trackSize * (visibleSize - offset)) / Math.max(1, contentSize - offset)),
  );
  const maximum = Math.max(0, contentSize - visibleSize);
  const position = Math.min(maximum, Math.max(0, vertical ? pos.top : pos.left));
  const thumbPosition = maximum ? (position / maximum) * (trackSize - thumbSize) : 0;
  const logicalPosition =
    !vertical && metrics.rtl ? trackSize - thumbSize - thumbPosition : thumbPosition;
  return {
    horizontalOverflow,
    verticalOverflow,
    visibleSize,
    endInset,
    trackSize,
    thumbSize,
    maximum,
    position,
    logicalPosition,
  };
}

export const ScrollbarControl = forwardRef<HTMLDivElement, ScrollbarControlProps>(
  function ScrollbarControl(
    {
      height,
      maxHeight,
      orientation = 'both',
      scrollbar = 'auto',
      persistent = false,
      viewportClassName,
      viewportStyle,
      contentClassName,
      contentStyle,
      verticalOffset = 0,
      size = 'md',
      viewportProps,
      rootRef,
      scrollbarTabIndex,
      externalViewport,
      viewportRevision,
      resizeHandle = false,
      className,
      style,
      children,
      tabIndex = 0,
      onScroll,
      id: providedId,
      role = 'region',
      'aria-label': label,
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
      ...props
    }: ScrollbarControlProps,
    forwarded,
  ) {
    const internalViewport = useRef<HTMLDivElement>(null);
    const viewport = externalViewport ?? internalViewport;
    const root = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const verticalThumbRef = useRef<HTMLSpanElement>(null);
    const verticalControlRef = useRef<HTMLDivElement>(null);
    const horizontalThumbRef = useRef<HTMLSpanElement>(null);
    const horizontalControlRef = useRef<HTMLDivElement>(null);
    const ref = useMergedRef(internalViewport, forwarded);
    const mergedRoot = useMergedRef(root, rootRef);
    const generatedId = useId();
    const id = viewportProps?.id ?? providedId ?? generatedId;
    const t = useText();
    const [metrics, setMetrics] = useState<LayoutMetrics>(initialMetrics);
    const metricsRef = useRef<LayoutMetrics>(initialMetrics);
    metricsRef.current = metrics;
    const scrollPosRef = useRef<ScrollPosition>({ top: 0, left: 0 });
    const [dragging, setDragging] = useState(false);
    const measureFrame = useRef<number | undefined>(undefined);
    const scrollFrame = useRef<number | undefined>(undefined);
    const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const drag = useRef<{ pointerId: number; offset: number; vertical: boolean } | undefined>(
      undefined,
    );

    const barSpec = trackMetrics[size] ?? trackMetrics.md;
    const edge = barSpec.inset;
    const cross = barSpec.inset + barSpec.thickness;
    const hidden = scrollbar === 'hidden';

    // 仅更新滑块几何样式与无障碍值，避免滚动期间触发 React 重渲染与布局回流。
    const syncScrollDom = useCallback(() => {
      if (hidden) return;
      const element = viewport.current;
      if (!element) return;
      const pos: ScrollPosition = {
        top: element.scrollTop,
        left: Math.abs(element.scrollLeft),
      };
      scrollPosRef.current = pos;
      const currentMetrics = metricsRef.current;
      const inset = Math.min(Math.max(0, verticalOffset), Math.max(0, currentMetrics.height - 32));
      const targets = [
        [true, verticalThumbRef.current, verticalControlRef.current],
        [false, horizontalThumbRef.current, horizontalControlRef.current],
      ] as const;
      for (const [isVertical, thumb, control] of targets) {
        if (!thumb && !control) continue;
        const barMetrics = computeBarMetrics(
          isVertical,
          currentMetrics,
          pos,
          inset,
          resizeHandle,
          persistent,
          edge,
          cross,
          orientation,
        );
        if (thumb) {
          if (isVertical) {
            thumb.style.height = `${barMetrics.thumbSize}px`;
            thumb.style.transform = `translateY(${barMetrics.logicalPosition}px)`;
          } else {
            thumb.style.width = `${barMetrics.thumbSize}px`;
            thumb.style.transform = `translateX(${barMetrics.logicalPosition}px)`;
          }
        }
        if (control) {
          control.setAttribute('aria-valuenow', String(barMetrics.position));
          control.setAttribute('aria-valuemax', String(barMetrics.maximum));
        }
      }
    }, [hidden, viewport, verticalOffset, resizeHandle, persistent, edge, cross, orientation]);

    const measure = useCallback(() => {
      if (hidden) return;
      const element = viewport.current;
      if (!element) return;
      const bounds = externalViewport ? element.getBoundingClientRect() : null;
      const rootBounds = externalViewport ? root.current?.getBoundingClientRect() : null;
      const next: LayoutMetrics = {
        width: element.clientWidth,
        height: element.clientHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        rtl: getComputedStyle(element).direction === 'rtl',
        x: bounds && rootBounds ? bounds.left - rootBounds.left + element.clientLeft : 0,
        y: bounds && rootBounds ? bounds.top - rootBounds.top + element.clientTop : 0,
      };
      scrollPosRef.current = {
        top: element.scrollTop,
        left: Math.abs(element.scrollLeft),
      };
      metricsRef.current = next;
      setMetrics((previous) =>
        Object.keys(next).every(
          (key) => next[key as keyof LayoutMetrics] === previous[key as keyof LayoutMetrics],
        )
          ? previous
          : next,
      );
      syncScrollDom();
    }, [hidden, externalViewport, viewport, syncScrollDom]);

    const scheduleMeasure = useCallback(() => {
      if (hidden || measureFrame.current !== undefined) return;
      measureFrame.current = requestAnimationFrame(() => {
        measureFrame.current = undefined;
        measure();
      });
    }, [hidden, measure]);

    const scheduleScroll = useCallback(() => {
      if (hidden || scrollFrame.current !== undefined) return;
      scrollFrame.current = requestAnimationFrame(() => {
        scrollFrame.current = undefined;
        syncScrollDom();
      });
    }, [hidden, syncScrollDom]);

    const reportScroll = useCallback(() => {
      if (hidden) return;
      scheduleScroll();
      root.current?.setAttribute('data-scrolling', 'true');
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        root.current?.removeAttribute('data-scrolling');
      }, 700);
    }, [hidden, scheduleScroll]);

    useEffect(() => {
      if (hidden) {
        root.current?.removeAttribute('data-scrolling');
        return;
      }
      measure();
      const observer =
        typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
      if (viewport.current) observer?.observe(viewport.current);
      if (content.current) observer?.observe(content.current);
      const external = externalViewport?.current;
      external?.addEventListener('scroll', reportScroll, { passive: true });
      external?.addEventListener('input', scheduleMeasure);
      window.addEventListener('resize', scheduleMeasure);
      return () => {
        observer?.disconnect();
        external?.removeEventListener('scroll', reportScroll);
        external?.removeEventListener('input', scheduleMeasure);
        window.removeEventListener('resize', scheduleMeasure);
        if (measureFrame.current !== undefined) cancelAnimationFrame(measureFrame.current);
        measureFrame.current = undefined;
        if (scrollFrame.current !== undefined) cancelAnimationFrame(scrollFrame.current);
        scrollFrame.current = undefined;
        clearTimeout(timeout.current);
      };
    }, [hidden, externalViewport, viewport, measure, scheduleMeasure, reportScroll]);

    // Controlled native values can change scroll geometry without a resize event.
    // biome-ignore lint/correctness/useExhaustiveDependencies: viewportRevision explicitly invalidates external viewport measurements.
    useEffect(() => {
      if (!hidden && externalViewport) measure();
    }, [hidden, externalViewport, viewportRevision, measure]);

    function setPosition(vertical: boolean, value: number) {
      const element = viewport.current;
      if (!element) return;
      const maximum = vertical
        ? element.scrollHeight - element.clientHeight
        : element.scrollWidth - element.clientWidth;
      const position = Math.min(Math.max(0, value), Math.max(0, maximum));
      if (vertical) element.scrollTop = position;
      else element.scrollLeft = metricsRef.current.rtl ? -position : position;
      scheduleScroll();
    }

    const horizontalOverflow =
      !hidden && orientation !== 'vertical' && metrics.scrollWidth > metrics.width + 1;
    const verticalOverflow =
      !hidden && orientation !== 'horizontal' && metrics.scrollHeight > metrics.height + 1;
    const inset = Math.min(Math.max(0, verticalOffset), Math.max(0, metrics.height - 32));
    const viewportAccessibility = {
      role,
      'aria-label': label,
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
    };

    function bar(vertical: boolean) {
      const { endInset, trackSize, thumbSize, maximum, position, logicalPosition } =
        computeBarMetrics(
          vertical,
          metrics,
          scrollPosRef.current,
          inset,
          resizeHandle,
          persistent,
          edge,
          cross,
          orientation,
        );
      return (
        <div
          key={vertical ? 'vertical' : 'horizontal'}
          className={classes(
            'leaf-scrollbar__bar',
            vertical ? 'leaf-scrollbar__bar--vertical' : 'leaf-scrollbar__bar--horizontal',
          )}
          style={
            vertical
              ? externalViewport
                ? {
                    top: metrics.y + inset + edge,
                    left: metrics.rtl ? metrics.x + edge : metrics.x + metrics.width - cross,
                    height: trackSize,
                    bottom: 'auto',
                    right: 'auto',
                  }
                : persistent
                  ? { top: inset + edge, height: trackSize, bottom: 'auto' }
                  : { top: inset + edge, bottom: endInset }
              : externalViewport
                ? {
                    top: metrics.y + metrics.height - cross,
                    left: metrics.x + edge,
                    width: trackSize,
                    bottom: 'auto',
                    right: 'auto',
                  }
                : persistent
                  ? {
                      left: metrics.rtl && orientation !== 'horizontal' ? cross + edge : edge,
                      width: trackSize,
                    }
                  : {
                      right: verticalOverflow && !metrics.rtl ? cross : edge,
                      left: verticalOverflow && metrics.rtl ? cross : edge,
                    }
          }
        >
          <span
            ref={vertical ? verticalThumbRef : horizontalThumbRef}
            aria-hidden="true"
            className="leaf-scrollbar__thumb"
            style={
              vertical
                ? { height: thumbSize, transform: `translateY(${logicalPosition}px)` }
                : { width: thumbSize, transform: `translateX(${logicalPosition}px)` }
            }
          />
          <div
            ref={vertical ? verticalControlRef : horizontalControlRef}
            role="scrollbar"
            tabIndex={maximum ? (scrollbarTabIndex ?? 0) : -1}
            className="leaf-scrollbar__control"
            aria-label={
              vertical ? t('scrollbar.verticalScrollbar') : t('scrollbar.horizontalScrollbar')
            }
            aria-controls={externalViewport ? externalViewport.current?.id || undefined : id}
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
            aria-valuemin={0}
            aria-valuemax={maximum}
            aria-valuenow={position}
            aria-disabled={!maximum || undefined}
            onKeyDown={(event) => {
              const latestMetrics = computeBarMetrics(
                vertical,
                metricsRef.current,
                scrollPosRef.current,
                Math.min(Math.max(0, verticalOffset), Math.max(0, metricsRef.current.height - 32)),
                resizeHandle,
                persistent,
                edge,
                cross,
                orientation,
              );
              if (!latestMetrics.maximum) return;
              const current = viewport.current;
              const currentPos = current
                ? vertical
                  ? current.scrollTop
                  : Math.abs(current.scrollLeft)
                : 0;
              let value: number | undefined;
              if (event.key === 'Home') value = 0;
              if (event.key === 'End') value = latestMetrics.maximum;
              if (event.key === 'PageDown') value = currentPos + latestMetrics.visibleSize;
              if (event.key === 'PageUp') value = currentPos - latestMetrics.visibleSize;
              if (event.key === 'ArrowDown') value = currentPos + 40;
              if (event.key === 'ArrowUp') value = currentPos - 40;
              if (event.key === 'ArrowRight')
                value = currentPos + (metricsRef.current.rtl ? -40 : 40);
              if (event.key === 'ArrowLeft')
                value = currentPos + (metricsRef.current.rtl ? 40 : -40);
              if (value === undefined) return;
              event.preventDefault();
              setPosition(vertical, value);
            }}
            onPointerDown={(event) => {
              const latestMetrics = computeBarMetrics(
                vertical,
                metricsRef.current,
                scrollPosRef.current,
                Math.min(Math.max(0, verticalOffset), Math.max(0, metricsRef.current.height - 32)),
                resizeHandle,
                persistent,
                edge,
                cross,
                orientation,
              );
              if (event.button !== 0 || !latestMetrics.maximum) return;
              event.preventDefault();
              const rect = event.currentTarget.getBoundingClientRect();
              const pointer = vertical ? event.clientY - rect.top : event.clientX - rect.left;
              const onThumb =
                pointer >= latestMetrics.logicalPosition &&
                pointer <= latestMetrics.logicalPosition + latestMetrics.thumbSize;
              drag.current = {
                pointerId: event.pointerId,
                vertical,
                offset: onThumb
                  ? pointer - latestMetrics.logicalPosition
                  : latestMetrics.thumbSize / 2,
              };
              event.currentTarget.setPointerCapture?.(event.pointerId);
              setDragging(true);
              if (!onThumb) {
                const maxOffset = latestMetrics.trackSize - latestMetrics.thumbSize;
                const next = Math.min(
                  maxOffset,
                  Math.max(0, pointer - latestMetrics.thumbSize / 2),
                );
                setPosition(
                  vertical,
                  ((!vertical && metricsRef.current.rtl ? maxOffset - next : next) /
                    Math.max(1, maxOffset)) *
                    latestMetrics.maximum,
                );
              }
            }}
            onPointerMove={(event) => {
              const active = drag.current;
              if (!active || active.pointerId !== event.pointerId || active.vertical !== vertical)
                return;
              const latestMetrics = computeBarMetrics(
                vertical,
                metricsRef.current,
                scrollPosRef.current,
                Math.min(Math.max(0, verticalOffset), Math.max(0, metricsRef.current.height - 32)),
                resizeHandle,
                persistent,
                edge,
                cross,
                orientation,
              );
              const rect = event.currentTarget.getBoundingClientRect();
              const pointer = vertical ? event.clientY - rect.top : event.clientX - rect.left;
              const maxOffset = latestMetrics.trackSize - latestMetrics.thumbSize;
              const next = Math.min(maxOffset, Math.max(0, pointer - active.offset));
              setPosition(
                vertical,
                ((!vertical && metricsRef.current.rtl ? maxOffset - next : next) /
                  Math.max(1, maxOffset)) *
                  latestMetrics.maximum,
              );
            }}
            onPointerUp={() => {
              drag.current = undefined;
              setDragging(false);
            }}
            onPointerCancel={() => {
              drag.current = undefined;
              setDragging(false);
            }}
            onLostPointerCapture={() => {
              drag.current = undefined;
              setDragging(false);
            }}
          />
        </div>
      );
    }

    return (
      <div
        {...props}
        ref={mergedRoot}
        className={classes(
          'leaf-scrollbar',
          externalViewport && 'leaf-scrollbar--external',
          size === 'sm' && 'leaf-scrollbar--sm',
          className,
        )}
        data-scrollbar={scrollbar}
        data-persistent={persistent && scrollbar !== 'hidden' && !externalViewport ? '' : undefined}
        data-orientation={orientation}
        data-dragging={dragging || undefined}
        style={{ height, maxHeight, ...style }}
      >
        {externalViewport ? (
          children
        ) : (
          <div
            ref={ref}
            id={id}
            tabIndex={tabIndex}
            {...viewportAccessibility}
            {...viewportProps}
            className={classes('leaf-scrollbar__viewport', viewportClassName)}
            style={{
              height: (style?.height ?? height) === undefined ? undefined : '100%',
              overflowX: orientation === 'vertical' ? 'hidden' : 'auto',
              overflowY: orientation === 'horizontal' ? 'hidden' : 'auto',
              ...viewportStyle,
            }}
            onScroll={(event) => {
              reportScroll();
              onScroll?.(event);
              viewportProps?.onScroll?.(event);
            }}
          >
            <div
              ref={content}
              className={classes('leaf-scrollbar__content', contentClassName)}
              style={contentStyle}
            >
              {children}
            </div>
          </div>
        )}
        {scrollbar !== 'hidden' &&
          (verticalOverflow ||
            ((scrollbar === 'always' || persistent) && orientation !== 'horizontal')) &&
          bar(true)}
        {scrollbar !== 'hidden' &&
          (horizontalOverflow ||
            ((scrollbar === 'always' || persistent) && orientation !== 'vertical')) &&
          bar(false)}
      </div>
    );
  },
);

export const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(function Scrollbar(
  rawProps: ScrollbarProps,
  ref,
) {
  const props = useComponentProps('Scrollbar', rawProps);
  return <ScrollbarControl {...props} ref={ref} />;
});
Scrollbar.displayName = 'Scrollbar';
