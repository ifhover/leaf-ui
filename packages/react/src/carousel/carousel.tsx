import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Children,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type MutableRefObject,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import { animateMotion, useMotionEnabled } from '../shared/motion';
import { useControllable } from '../shared/use-controllable';
import { useText } from '../shared/use-text';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
export interface CarouselHandle {
  goTo: (index: number) => void;
  next: () => void;
  previous: () => void;
}
export interface CarouselProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  activeIndex?: number;
  defaultActiveIndex?: number;
  onChange?: (index: number) => void;
  arrows?: boolean;
  dots?: boolean;
  autoplay?: boolean | number;
  infinite?: boolean;
  pauseOnHover?: boolean;
}
export const Carousel = forwardRef<CarouselHandle, CarouselProps>(function Carousel(
  {
    activeIndex,
    defaultActiveIndex = 0,
    onChange,
    arrows = true,
    dots = true,
    autoplay = false,
    infinite = true,
    pauseOnHover = true,
    children,
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const t = useText(),
    config = useLeafConfig(),
    id = useId();
  const slides = Children.toArray(children),
    count = slides.length;
  const [requested, setIndex] = useControllable(activeIndex, defaultActiveIndex, onChange);
  const index = Math.min(Math.max(0, requested), Math.max(0, count - 1));
  const [paused, setPaused] = useState(false);
  const motion = useMotionEnabled();
  const track = useRef<HTMLDivElement>(null);
  const moveDirection = useRef(0);
  useCarouselMotion(track, index, moveDirection, config.direction, motion);
  const latest = useRef(index);
  latest.current = index;
  const go = (next: number) => {
    if (!count) return;
    moveDirection.current = Math.sign(next - index);
    setIndex(infinite ? ((next % count) + count) % count : Math.max(0, Math.min(count - 1, next)));
  };
  const callback = useRef(go);
  callback.current = go;
  const pointer = useRef<number | undefined>(undefined);
  useImperativeHandle(ref, () => ({
    goTo: go,
    next: () => go(index + 1),
    previous: () => go(index - 1),
  }));
  useEffect(() => {
    if (!autoplay || paused || !motion || count < 2) return;
    const timer = setInterval(
      () => {
        if (!document.hidden) callback.current(latest.current + 1);
      },
      typeof autoplay === 'number' ? Math.max(500, autoplay) : 4000,
    );
    return () => clearInterval(timer);
  }, [autoplay, paused, count, motion]);
  return (
    <section
      {...props}
      aria-roledescription="carousel"
      aria-label={props['aria-label'] ?? t('轮播', 'Carousel')}
      className={classes('leaf-carousel', className)}
      onPointerEnter={() => {
        if (pauseOnHover) setPaused(true);
      }}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onPointerDown={(event) => {
        if (!(event.target as HTMLElement).closest('button,a,input'))
          pointer.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (pointer.current === undefined) return;
        const distance = event.clientX - pointer.current;
        pointer.current = undefined;
        if (Math.abs(distance) > 40)
          go(index + (distance < 0 ? 1 : -1) * (config.direction === 'rtl' ? -1 : 1));
      }}
      onPointerCancel={() => {
        pointer.current = undefined;
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || (event.target as HTMLElement).matches('input,textarea'))
          return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          go(index + (event.key === 'ArrowRight' ? 1 : -1) * (config.direction === 'rtl' ? -1 : 1));
        }
        if (event.key === 'Home') {
          event.preventDefault();
          go(0);
        }
        if (event.key === 'End') {
          event.preventDefault();
          go(count - 1);
        }
      }}
      tabIndex={props.tabIndex ?? 0}
    >
      <div className="leaf-carousel__viewport">
        <div ref={track} className="leaf-carousel__track">
          {slides.map((slide, position) => (
            <fieldset
              key={isValidElement(slide) ? slide.key : `slide-${position}`}
              id={`${id}-${position}`}
              aria-roledescription="slide"
              aria-label={`${position + 1} / ${count}`}
              aria-hidden={position !== index || undefined}
              {...inertProps(position !== index)}
              className="leaf-carousel__slide"
              data-slide-index={position}
              data-active={position === index || undefined}
            >
              {slide}
            </fieldset>
          ))}
        </div>
      </div>
      {arrows &&
        count > 1 &&
        [-1, 1].map((direction) => (
          <button
            key={direction}
            type="button"
            className={classes(
              'leaf-carousel__arrow',
              direction === -1 ? 'leaf-carousel__arrow--previous' : 'leaf-carousel__arrow--next',
            )}
            disabled={!infinite && (direction === -1 ? index === 0 : index === count - 1)}
            aria-label={
              direction === -1 ? t('上一张', 'Previous slide') : t('下一张', 'Next slide')
            }
            onClick={() => go(index + direction)}
          >
            {direction === -1 ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        ))}
      {dots && count > 1 && (
        <div className="leaf-carousel__dots">
          {slides.map((slide, position) => (
            <button
              key={isValidElement(slide) ? slide.key : String(slide)}
              type="button"
              aria-label={`${t('转到', 'Go to')} ${position + 1}`}
              aria-current={position === index ? 'true' : undefined}
              aria-controls={`${id}-${position}`}
              onClick={() => go(position)}
            />
          ))}
        </div>
      )}
      <span className="leaf-carousel__status" aria-live={autoplay && !paused ? 'off' : 'polite'}>
        {count ? index + 1 : 0} / {count}
      </span>
    </section>
  );
});

function useCarouselMotion(
  track: React.RefObject<HTMLDivElement | null>,
  index: number,
  moveDirection: MutableRefObject<number>,
  direction: 'ltr' | 'rtl',
  enabled: boolean,
) {
  const previous = useRef({ index, height: 0 });
  const animations = useRef<Animation[]>([]);
  const heightAnimation = useRef<Animation | undefined>(undefined);
  useBrowserLayoutEffect(() => {
    const host = track.current;
    if (!host) return;
    const outgoing = host.querySelector<HTMLElement>(
      `[data-slide-index="${previous.current.index}"]`,
    );
    const incoming = host.querySelector<HTMLElement>(`[data-slide-index="${index}"]`);
    const interruptedHeight =
      heightAnimation.current?.playState === 'running'
        ? host.offsetHeight
        : previous.current.height;
    const outgoingStyle = outgoing ? getComputedStyle(outgoing) : null;
    const incomingStyle = incoming?.dataset.exiting ? getComputedStyle(incoming) : null;
    const incomingTransform = incomingStyle?.transform;
    const incomingOpacity = incomingStyle?.opacity;
    const outgoingTransform = outgoingStyle?.transform ?? 'none';
    const outgoingOpacity = animations.current.some(
      (animation) => animation.playState === 'running',
    )
      ? (outgoingStyle?.opacity ?? '1')
      : '1';
    for (const animation of animations.current) animation.cancel();
    animations.current = [];
    heightAnimation.current = undefined;
    for (const slide of host.querySelectorAll<HTMLElement>('[data-exiting]'))
      slide.removeAttribute('data-exiting');
    const height = host.offsetHeight;
    if (enabled && incoming && previous.current.index !== index) {
      const sign =
        (moveDirection.current || Math.sign(index - previous.current.index)) *
        (direction === 'rtl' ? -1 : 1);
      const enter = animateMotion(
        incoming,
        [
          {
            opacity: incomingOpacity ?? 0,
            transform: incomingTransform ?? `translateX(${sign * 12}%) scale(0.985)`,
          },
          { opacity: 1, transform: 'translateX(0) scale(1)' },
        ],
        { durationMultiplier: 2 },
      );
      if (enter) animations.current.push(enter);
      if (outgoing) {
        outgoing.dataset.exiting = 'true';
        const exit = animateMotion(
          outgoing,
          [
            { opacity: outgoingOpacity, transform: outgoingTransform },
            { opacity: 0, transform: `translateX(${sign * -12}%) scale(0.985)` },
          ],
          { durationMultiplier: 2 },
        );
        if (exit) {
          animations.current.push(exit);
          exit.addEventListener('finish', () => outgoing.removeAttribute('data-exiting'), {
            once: true,
          });
        } else outgoing.removeAttribute('data-exiting');
      }
      if (interruptedHeight > 0 && Math.abs(height - interruptedHeight) > 1) {
        const resize = animateMotion(
          host,
          [{ height: `${interruptedHeight}px` }, { height: `${height}px` }],
          { durationMultiplier: 2 },
        );
        if (resize) {
          animations.current.push(resize);
          heightAnimation.current = resize;
        }
      }
    }
    moveDirection.current = 0;
    previous.current = { index, height };
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            if (!animations.current.some((animation) => animation.playState === 'running'))
              previous.current.height = host.offsetHeight;
          });
    if (incoming) observer?.observe(incoming);
    return () => observer?.disconnect();
  }, [track, index, moveDirection, direction, enabled]);
  useEffect(
    () => () => {
      for (const animation of animations.current) animation.cancel();
    },
    [],
  );
}
