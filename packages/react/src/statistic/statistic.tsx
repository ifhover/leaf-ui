import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { motionDuration, useMotionEnabled } from '../shared/motion';

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
  animation?: boolean;
  initialValue?: number;
  duration?: number;
}
export function StatisticControl({
  title,
  value,
  precision,
  grouping = true,
  prefix,
  suffix,
  formatter,
  loading,
  animation = true,
  initialValue = 0,
  duration = 1000,
  className,
  ...props
}: StatisticProps) {
  const { locale, messages } = useLeafConfig();
  const number = useRef<HTMLSpanElement>(null);
  // Render the target on the server and on hydration; start counting before paint.
  const [displayed, setDisplayed] = useState(value);
  const current = useRef(Number.isFinite(initialValue) ? initialValue : 0);
  const initialized = useRef(false);
  const motion = useMotionEnabled();
  const numeric = typeof value === 'number' && Number.isFinite(value);
  useBrowserLayoutEffect(() => {
    const node = number.current;
    if (loading) return;
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      initialized.current = false;
      setDisplayed(value);
      return;
    }
    if (!initialized.current) {
      current.current = Number.isFinite(initialValue) ? initialValue : 0;
      initialized.current = true;
    }
    const milliseconds =
      node && animation && motion
        ? motionDuration(node, (Number.isFinite(duration) ? Math.max(0, duration) : 1000) / 200)
        : 0;
    const from = current.current;
    if (!milliseconds || from === value || typeof requestAnimationFrame === 'undefined') {
      current.current = value;
      setDisplayed(value);
      return;
    }
    setDisplayed(from);
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - start) / milliseconds));
      const eased = 1 - (1 - progress) ** 3;
      // Weighted interpolation also handles opposite signs near Number.MAX_VALUE.
      current.current = progress === 1 ? value : from * (1 - eased) + value * eased;
      setDisplayed(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, loading, animation, initialValue, duration, motion]);
  const digits = precision === undefined ? undefined : Math.max(0, Math.min(20, precision));
  const numberFormat = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits ?? 6,
        useGrouping: grouping,
      }),
    [locale, digits, grouping],
  );
  const format = (input: number | string) =>
    formatter ? formatter(input) : typeof input === 'number' ? numberFormat.format(input) : input;
  const counting = numeric && animation && motion && displayed !== value && !loading;
  const countDigits = useMemo(
    () =>
      digits ??
      numberFormat.formatToParts(Number(value)).find((part) => part.type === 'fraction')?.value
        .length ??
      0,
    [digits, numberFormat, value],
  );
  const visible =
    counting && typeof displayed === 'number' && !formatter
      ? Number(displayed.toFixed(countDigits))
      : displayed;
  return (
    <div
      {...props}
      className={classes('leaf-statistic', className)}
      aria-busy={loading || undefined}
    >
      {title && <div className="leaf-statistic__title">{title}</div>}
      <div className="leaf-statistic__value">
        {prefix}
        <span
          ref={number}
          className="leaf-statistic__number"
          data-loading={loading || undefined}
          aria-hidden={counting || undefined}
        >
          {loading ? messages.common.loading : format(counting ? visible : value)}
        </span>
        {counting && <span className="leaf-statistic__accessible">{format(value)}</span>}
        {suffix && <span className="leaf-statistic__suffix">{suffix}</span>}
      </div>
    </div>
  );
}
export interface CountdownProps
  extends Omit<
    StatisticProps,
    | 'value'
    | 'precision'
    | 'grouping'
    | 'formatter'
    | 'onChange'
    | 'animation'
    | 'initialValue'
    | 'duration'
  > {
  value: number | Date;
  format?: string;
  onFinish?: () => void;
  onChange?: (remaining: number) => void;
  initialRemaining?: number;
}
export function Countdown(rawProps: CountdownProps) {
  const {
    value,
    format = 'HH:mm:ss',
    onFinish,
    onChange,
    initialRemaining,
    ...props
  } = useComponentProps('Countdown', rawProps);
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
  return <StatisticControl {...props} value={label} />;
}

export function Statistic(rawProps: StatisticProps) {
  const props = useComponentProps('Statistic', rawProps);
  return <StatisticControl {...props} />;
}
