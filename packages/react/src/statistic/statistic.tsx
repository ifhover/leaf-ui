import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { animateMotion, useMotionEnabled } from '../shared/motion';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
export interface StatisticProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'prefix'> {
  title?: ReactNode;
  value: number | string;
  precision?: number;
  grouping?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  formatter?: (value: number | string) => ReactNode;
  loading?: boolean;
}
export function Statistic({
  title,
  value,
  precision,
  grouping = true,
  prefix,
  suffix,
  formatter,
  loading,
  className,
  ...props
}: StatisticProps) {
  const { locale, messages } = useLeafConfig();
  const number = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  const animation = useRef<Animation | undefined>(undefined);
  const motion = useMotionEnabled();
  useBrowserLayoutEffect(() => {
    const node = number.current;
    const changed = previous.current !== value;
    const interrupted =
      animation.current?.playState === 'running' && node ? getComputedStyle(node) : null;
    const opacity = interrupted?.opacity ?? 0.65;
    const transform =
      interrupted?.transform ??
      `translateY(${typeof value === 'number' && typeof previous.current === 'number' && value < previous.current ? -4 : 4}px)`;
    animation.current?.cancel();
    if (
      motion &&
      changed &&
      node &&
      !loading &&
      !formatter &&
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      animation.current = animateMotion(
        node,
        [
          { opacity, transform },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { durationMultiplier: 1.6 },
      );
    }
    previous.current = value;
  }, [value, loading, formatter, motion]);
  useEffect(() => () => animation.current?.cancel(), []);
  const digits = precision === undefined ? undefined : Math.max(0, Math.min(20, precision));
  return (
    <div
      {...props}
      className={classes('leaf-statistic', className)}
      aria-busy={loading || undefined}
    >
      {title && <div className="leaf-statistic__title">{title}</div>}
      <div className="leaf-statistic__value">
        {prefix}
        <span ref={number} className="leaf-statistic__number" data-loading={loading || undefined}>
          {loading
            ? messages.loading
            : formatter
              ? formatter(value)
              : typeof value === 'number'
                ? new Intl.NumberFormat(locale, {
                    minimumFractionDigits: digits,
                    maximumFractionDigits: digits ?? 6,
                    useGrouping: grouping,
                  }).format(value)
                : value}
        </span>
        {suffix && <span className="leaf-statistic__suffix">{suffix}</span>}
      </div>
    </div>
  );
}
export interface CountdownProps
  extends Omit<StatisticProps, 'value' | 'precision' | 'grouping' | 'formatter' | 'onChange'> {
  value: number | Date;
  format?: string;
  onFinish?: () => void;
  onChange?: (remaining: number) => void;
  initialRemaining?: number;
}
export function Countdown({
  value,
  format = 'HH:mm:ss',
  onFinish,
  onChange,
  initialRemaining,
  ...props
}: CountdownProps) {
  const rawDeadline = value instanceof Date ? value.getTime() : value;
  const deadline = Number.isFinite(rawDeadline) ? rawDeadline : 0;
  const [now, setNow] = useState(() =>
    initialRemaining !== undefined && Number.isFinite(initialRemaining)
      ? deadline - Math.max(0, initialRemaining)
      : Date.now(),
  );
  const callbacks = useRef({ onFinish, onChange });
  const finishedDeadline = useRef<number | null>(null);
  callbacks.current = { onFinish, onChange };
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const current = Date.now();
      const remaining = Math.max(0, deadline - current);
      setNow(current);
      callbacks.current.onChange?.(remaining);
      if (remaining === 0 && finishedDeadline.current !== deadline) {
        finishedDeadline.current = deadline;
        callbacks.current.onFinish?.();
      }
      if (remaining > 0)
        timer = setTimeout(tick, Math.min(remaining, format.includes('SSS') ? 50 : 1000));
    };
    tick();
    return () => clearTimeout(timer);
  }, [deadline, format]);
  const remaining = Math.max(0, deadline - now);
  const days = Math.floor(remaining / 86400000),
    hours = Math.floor(remaining / 3600000),
    minutes = Math.floor(remaining / 60000) % 60,
    seconds = Math.floor(remaining / 1000) % 60;
  const label = format.replace(/DD|HH|mm|ss|SSS/g, (token) =>
    String(
      token === 'DD'
        ? days
        : token === 'HH'
          ? format.includes('DD')
            ? hours % 24
            : hours
          : token === 'mm'
            ? minutes
            : token === 'ss'
              ? seconds
              : remaining % 1000,
    ).padStart(token === 'SSS' ? 3 : 2, '0'),
  );
  return <Statistic {...props} value={label} />;
}
