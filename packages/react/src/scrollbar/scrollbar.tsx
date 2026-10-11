import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { useText } from '../shared/use-text';

export interface ScrollbarProps extends HTMLAttributes<HTMLDivElement> {
  height?: CSSProperties['height'];
  maxHeight?: CSSProperties['maxHeight'];
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollbar?: 'auto' | 'always' | 'hidden';
  viewportClassName?: string;
  viewportStyle?: CSSProperties;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  verticalOffset?: number;
}

interface Geometry {
  width: number;
  height: number;
  scrollWidth: number;
  scrollHeight: number;
  left: number;
  top: number;
  rtl: boolean;
}

const initialGeometry: Geometry = {
  width: 0,
  height: 0,
  scrollWidth: 0,
  scrollHeight: 0,
  left: 0,
  top: 0,
  rtl: false,
};

export const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(function Scrollbar(
  {
    height,
    maxHeight,
    orientation = 'both',
    scrollbar = 'auto',
    viewportClassName,
    viewportStyle,
    contentClassName,
    contentStyle,
    verticalOffset = 0,
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
  },
  forwarded,
) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const ref = useMergedRef(viewport, forwarded);
  const generatedId = useId();
  const id = providedId ?? generatedId;
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
    const next: Geometry = {
      width: element.clientWidth,
      height: element.clientHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      left: Math.abs(element.scrollLeft),
      top: element.scrollTop,
      rtl: getComputedStyle(element).direction === 'rtl',
    };
    setGeometry((previous) =>
      Object.keys(next).every(
        (key) => next[key as keyof Geometry] === previous[key as keyof Geometry],
      )
        ? previous
        : next,
    );
  }, []);
  const schedule = useCallback(() => {
    if (frame.current !== undefined) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = undefined;
      measure();
    });
  }, [measure]);
  useEffect(() => {
    measure();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    if (viewport.current) observer?.observe(viewport.current);
    if (content.current) observer?.observe(content.current);
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
      window.removeEventListener('resize', schedule);
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      frame.current = undefined;
      clearTimeout(timeout.current);
    };
  }, [measure, schedule]);

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
    const trackSize = Math.max(0, visibleSize - offset - 8 - (crossOverflow ? 8 : 0));
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
            ? { top: inset + 4, bottom: horizontalOverflow ? 12 : 4 }
            : {
                right: verticalOverflow && !geometry.rtl ? 12 : 4,
                left: verticalOverflow && geometry.rtl ? 12 : 4,
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
          tabIndex={maximum ? 0 : -1}
          className="leaf-scrollbar__control"
          aria-label={
            vertical
              ? t('纵向滚动条', 'Vertical scrollbar')
              : t('横向滚动条', 'Horizontal scrollbar')
          }
          aria-controls={id}
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
      className={classes('leaf-scrollbar', className)}
      data-scrollbar={scrollbar}
      data-scrolling={scrolling || undefined}
      data-dragging={dragging || undefined}
      style={{ height, maxHeight, ...style }}
    >
      <div
        ref={ref}
        id={id}
        tabIndex={tabIndex}
        {...viewportAccessibility}
        className={classes('leaf-scrollbar__viewport', viewportClassName)}
        style={{
          height: (style?.height ?? height) === undefined ? undefined : '100%',
          overflowX: orientation === 'vertical' ? 'hidden' : 'auto',
          overflowY: orientation === 'horizontal' ? 'hidden' : 'auto',
          ...viewportStyle,
        }}
        onScroll={(event) => {
          schedule();
          setScrolling(true);
          clearTimeout(timeout.current);
          timeout.current = setTimeout(() => setScrolling(false), 700);
          onScroll?.(event);
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
      {scrollbar !== 'hidden' &&
        (verticalOverflow || (scrollbar === 'always' && orientation !== 'horizontal')) &&
        bar(true)}
      {scrollbar !== 'hidden' &&
        (horizontalOverflow || (scrollbar === 'always' && orientation !== 'vertical')) &&
        bar(false)}
    </div>
  );
});
