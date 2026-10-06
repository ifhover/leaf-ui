import { Check, LoaderCircle, X } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import { classes } from '../shared/classes';
import { animateMotion, useMotionEnabled } from '../shared/motion';
import type { ControlSize } from '../shared/types';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface StepItem {
  key?: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  status?: 'wait' | 'process' | 'finish' | 'error';
  disabled?: boolean;
}
export interface StepsProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onChange'> {
  items: readonly StepItem[];
  current?: number;
  status?: 'process' | 'finish' | 'error';
  direction?: 'horizontal' | 'vertical';
  size?: ControlSize;
  loading?: boolean;
  onChange?: (current: number) => void;
  progressDot?: boolean | ((dot: ReactNode, info: { index: number; status: string }) => ReactNode);
  percent?: number;
}

export function Steps({
  items,
  current = 0,
  status = 'process',
  direction = 'horizontal',
  size = 'md',
  loading = false,
  onChange,
  progressDot,
  percent,
  className,
  ...props
}: StepsProps) {
  const root = useRef<HTMLOListElement>(null);
  const motion = useMotionEnabled();
  const states = items.map(
    (item, index) =>
      item.status ?? (index < current ? 'finish' : index === current ? status : 'wait'),
  );
  const previous = useRef(states);
  const animations = useRef<Animation[]>([]);
  const signature = states.join(',');
  useBrowserLayoutEffect(() => {
    for (const animation of animations.current) animation.cancel();
    animations.current = [];
    if (motion)
      for (const [index, state] of states.entries()) {
        if (previous.current[index] === state || previous.current[index] === undefined) continue;
        const icon = root.current?.querySelector<HTMLElement>(
          `[data-step-index="${index}"] .leaf-steps__icon`,
        );
        if (icon) {
          const animation = animateMotion(
            icon,
            [{ transform: 'scale(0.88)' }, { transform: 'scale(1)' }],
            { durationMultiplier: 1.6, easing: 'spring' },
          );
          if (animation) animations.current.push(animation);
        }
      }
    previous.current = states;
  }, [signature, motion]);
  useEffect(
    () => () => {
      for (const animation of animations.current) animation.cancel();
    },
    [],
  );
  return (
    <ol
      {...props}
      ref={root}
      className={classes(
        'leaf-steps',
        `leaf-steps--${direction}`,
        `leaf-steps--${size}`,
        progressDot && 'leaf-steps--dot',
        className,
      )}
    >
      {items.map((item, index) => {
        const state =
          item.status ?? (index < current ? 'finish' : index === current ? status : 'wait');
        const content = (
          <>
            <span className="leaf-steps__icon" aria-hidden="true">
              {progressDot ? (
                typeof progressDot === 'function' ? (
                  progressDot(<span className="leaf-steps__dot" />, { index, status: state })
                ) : (
                  <span className="leaf-steps__dot" />
                )
              ) : (
                <>
                  {percent !== undefined && index === current && (
                    <svg className="leaf-steps__progress" viewBox="0 0 40 40" aria-hidden="true">
                      <circle className="leaf-steps__progress-trail" cx="20" cy="20" r="18" />
                      <circle
                        cx="20"
                        cy="20"
                        r="18"
                        strokeDasharray={`${113.097 * (Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0)) / 100)} 113.097`}
                      />
                    </svg>
                  )}
                  {item.icon ??
                    (state === 'finish' ? (
                      <Check />
                    ) : state === 'error' ? (
                      <X />
                    ) : index === current && loading ? (
                      <LoaderCircle className="leaf-steps__spinner" />
                    ) : (
                      index + 1
                    ))}
                </>
              )}
            </span>
            <span className="leaf-steps__copy">
              <span className="leaf-steps__title">{item.title}</span>
              {item.description && (
                <span className="leaf-steps__description">{item.description}</span>
              )}
            </span>
          </>
        );
        return (
          <li
            key={item.key ?? index}
            className="leaf-steps__item"
            data-status={state}
            data-step-index={index}
            aria-current={index === current ? 'step' : undefined}
          >
            {onChange ? (
              <button
                type="button"
                className="leaf-steps__content"
                disabled={item.disabled}
                onClick={() => onChange(index)}
              >
                {content}
              </button>
            ) : (
              <div className="leaf-steps__content">{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
