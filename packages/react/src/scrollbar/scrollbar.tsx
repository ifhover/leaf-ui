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

interface Geometry {
  width: number;
  height: number;
  scrollWidth: number;
  scrollHeight: number;
  left: number;
  top: number;
  rtl: boolean;
  x: number;
  y: number;
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

const initialGeometry: Geometry = {
  width: 0,
  height: 0,
  scrollWidth: 0,
  scrollHeight: 0,
  left: 0,
  top: 0,
  rtl: false,
  x: 0,
  y: 0,
};

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
    const ref = useMergedRef(internalViewport, forwarded);
    const mergedRoot = useMergedRef(root, rootRef);
    const generatedId = useId();
    const id = viewportProps?.id ?? providedId ?? generatedId;
    const t = useText();
    const [geometry, setGeometry] = useState(initialGeometry);
    const [scrolling, setScrolling] = useState(false);
    const [dragging, setDragging] = useState(false);
    const frame = useRef<number | undefined>(undefined);
    const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const drag = useRef<{ pointerId: number; offset: number; vertical: boolean } | undefined>(
      undefined,
    );
    const measure = useCallback(() => {
      const element = viewport.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const rootBounds = root.current?.getBoundingClientRect();
      const next: Geometry = {
        width: element.clientWidth,
        height: element.clientHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        left: Math.abs(element.scrollLeft),
        top: element.scrollTop,
        rtl: getComputedStyle(element).direction === 'rtl',
        x: externalViewport && rootBounds ? bounds.left - rootBounds.left + element.clientLeft : 0,
        y: externalViewport && rootBounds ? bounds.top - rootBounds.top + element.clientTop : 0,
      };
      setGeometry((previous) =>
        Object.keys(next).every(
          (key) => next[key as keyof Geometry] === previous[key as keyof Geometry],
        )
          ? previous
          : next,
      );
    }, [externalViewport, viewport]);
    const schedule = useCallback(() => {
      if (frame.current !== undefined) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = undefined;
        measure();
      });
    }, [measure]);
    const reportScroll = useCallback(() => {
      schedule();
      setScrolling(true);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setScrolling(false), 700);
    }, [schedule]);
    useEffect(() => {
      measure();
      const observer =
        typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
      if (viewport.current) observer?.observe(viewport.current);
      if (content.current) observer?.observe(content.current);
      const external = externalViewport?.current;
      external?.addEventListener('scroll', reportScroll, { passive: true });
      external?.addEventListener('input', schedule);
      const mutation =
        typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(schedule);
      if (content.current)
        mutation?.observe(content.current, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
        });
      window.addEventListener('resize', schedule);
      return () => {
        observer?.disconnect();
        mutation?.disconnect();
        external?.removeEventListener('scroll', reportScroll);
        external?.removeEventListener('input', schedule);
        window.removeEventListener('resize', schedule);
        if (frame.current !== undefined) cancelAnimationFrame(frame.current);
        frame.current = undefined;
        clearTimeout(timeout.current);
      };
    }, [externalViewport, viewport, measure, schedule, reportScroll]);
    // Controlled native values can change scroll geometry without a DOM mutation or input event.
    // biome-ignore lint/correctness/useExhaustiveDependencies: viewportRevision explicitly invalidates external viewport measurements.
    useEffect(() => {
      if (externalViewport) measure();
    }, [externalViewport, viewportRevision, measure]);

    function setPosition(vertical: boolean, value: number) {
      const element = viewport.current;
      if (!element) return;
      const maximum = vertical
        ? element.scrollHeight - element.clientHeight
        : element.scrollWidth - element.clientWidth;
      const position = Math.min(Math.max(0, value), Math.max(0, maximum));
      if (vertical) element.scrollTop = position;
      else element.scrollLeft = geometry.rtl ? -position : position;
      schedule();
    }

    const horizontalOverflow =
      orientation !== 'vertical' && geometry.scrollWidth > geometry.width + 1;
    const verticalOverflow =
      orientation !== 'horizontal' && geometry.scrollHeight > geometry.height + 1;
    const metrics = trackMetrics[size] ?? trackMetrics.md;
    const edge = metrics.inset;
    const cross = metrics.inset + metrics.thickness;
    const inset = Math.min(Math.max(0, verticalOffset), Math.max(0, geometry.height - 32));
    const viewportAccessibility = {
      role,
      'aria-label': label,
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
    };

    function bar(vertical: boolean) {
      const visibleSize = vertical ? geometry.height : geometry.width;
      const contentSize = vertical ? geometry.scrollHeight : geometry.scrollWidth;
      const offset = vertical ? inset : 0;
      const crossOverflow = vertical ? horizontalOverflow : verticalOverflow;
      const endInset = resizeHandle ? 16 : crossOverflow && !persistent ? cross : edge;
      const trackSize = Math.max(0, visibleSize - offset - edge - endInset);
      const thumbSize = Math.min(
        trackSize,
        Math.max(24, (trackSize * (visibleSize - offset)) / Math.max(1, contentSize - offset)),
      );
      const maximum = Math.max(0, contentSize - visibleSize);
      const position = Math.min(maximum, Math.max(0, vertical ? geometry.top : geometry.left));
      const thumbPosition = maximum ? (position / maximum) * (trackSize - thumbSize) : 0;
      const logicalPosition =
        !vertical && geometry.rtl ? trackSize - thumbSize - thumbPosition : thumbPosition;
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
                    top: geometry.y + inset + edge,
                    left: geometry.rtl ? geometry.x + edge : geometry.x + geometry.width - cross,
                    height: trackSize,
                    bottom: 'auto',
                    right: 'auto',
                  }
                : persistent
                  ? { top: inset + edge, height: trackSize, bottom: 'auto' }
                  : { top: inset + edge, bottom: endInset }
              : externalViewport
                ? {
                    top: geometry.y + geometry.height - cross,
                    left: geometry.x + edge,
                    width: trackSize,
                    bottom: 'auto',
                    right: 'auto',
                  }
                : persistent
                  ? {
                      left: geometry.rtl && orientation !== 'horizontal' ? cross + edge : edge,
                      width: trackSize,
                    }
                  : {
                      right: verticalOverflow && !geometry.rtl ? cross : edge,
                      left: verticalOverflow && geometry.rtl ? cross : edge,
                    }
          }
        >
          <span
            aria-hidden="true"
            className="leaf-scrollbar__thumb"
            style={
              vertical
                ? { height: thumbSize, transform: `translateY(${logicalPosition}px)` }
                : { width: thumbSize, transform: `translateX(${logicalPosition}px)` }
            }
          />
          <div
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
              if (!maximum) return;
              const current = viewport.current;
              const position = current
                ? vertical
                  ? current.scrollTop
                  : Math.abs(current.scrollLeft)
                : 0;
              let value: number | undefined;
              if (event.key === 'Home') value = 0;
              if (event.key === 'End') value = maximum;
              if (event.key === 'PageDown') value = position + visibleSize;
              if (event.key === 'PageUp') value = position - visibleSize;
              if (event.key === 'ArrowDown') value = position + 40;
              if (event.key === 'ArrowUp') value = position - 40;
              if (event.key === 'ArrowRight') value = position + (geometry.rtl ? -40 : 40);
              if (event.key === 'ArrowLeft') value = position + (geometry.rtl ? 40 : -40);
              if (value === undefined) return;
              event.preventDefault();
              setPosition(vertical, value);
            }}
            onPointerDown={(event) => {
              if (event.button !== 0 || !maximum) return;
              event.preventDefault();
              const rect = event.currentTarget.getBoundingClientRect();
              const pointer = vertical ? event.clientY - rect.top : event.clientX - rect.left;
              const onThumb = pointer >= logicalPosition && pointer <= logicalPosition + thumbSize;
              drag.current = {
                pointerId: event.pointerId,
                vertical,
                offset: onThumb ? pointer - logicalPosition : thumbSize / 2,
              };
              event.currentTarget.setPointerCapture?.(event.pointerId);
              setDragging(true);
              if (!onThumb) {
                const next = Math.min(trackSize - thumbSize, Math.max(0, pointer - thumbSize / 2));
                setPosition(
                  vertical,
                  ((!vertical && geometry.rtl ? trackSize - thumbSize - next : next) /
                    Math.max(1, trackSize - thumbSize)) *
                    maximum,
                );
              }
            }}
            onPointerMove={(event) => {
              const active = drag.current;
              if (!active || active.pointerId !== event.pointerId || active.vertical !== vertical)
                return;
              const rect = event.currentTarget.getBoundingClientRect();
              const pointer = vertical ? event.clientY - rect.top : event.clientX - rect.left;
              const next = Math.min(trackSize - thumbSize, Math.max(0, pointer - active.offset));
              setPosition(
                vertical,
                ((!vertical && geometry.rtl ? trackSize - thumbSize - next : next) /
                  Math.max(1, trackSize - thumbSize)) *
                  maximum,
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
        data-scrolling={scrolling || undefined}
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
