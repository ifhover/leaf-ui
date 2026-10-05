import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Children,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import { useControllable } from '../shared/use-controllable';
import { useText } from '../shared/use-text';
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
  const latest = useRef(index);
  latest.current = index;
  const go = (next: number) => {
    if (!count) return;
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
    if (
      !autoplay ||
      paused ||
      config.theme.motion === false ||
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      count < 2
    )
      return;
    const timer = setInterval(
      () => {
        if (!document.hidden) callback.current(latest.current + 1);
      },
      typeof autoplay === 'number' ? Math.max(500, autoplay) : 4000,
    );
    return () => clearInterval(timer);
  }, [autoplay, paused, count, config.theme.motion]);
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
        <div
          className="leaf-carousel__track"
          style={{
            transform: `translateX(${index * 100 * (config.direction === 'rtl' ? 1 : -1)}%)`,
          }}
        >
          {slides.map((slide, position) => (
            <fieldset
              key={isValidElement(slide) ? slide.key : `slide-${position}`}
              id={`${id}-${position}`}
              aria-roledescription="slide"
              aria-label={`${position + 1} / ${count}`}
              aria-hidden={position !== index || undefined}
              {...inertProps(position !== index)}
              className="leaf-carousel__slide"
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
