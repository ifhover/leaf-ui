import { Check, X } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  percent?: number;
  type?: 'line' | 'circle';
  status?: 'normal' | 'success' | 'error';
  showInfo?: boolean;
  format?: (percent: number) => ReactNode;
  strokeWidth?: number;
  color?: string;
  size?: number;
  indeterminate?: boolean;
  trailColor?: string;
}
export function Progress({
  percent = 0,
  type = 'line',
  status = 'normal',
  showInfo = true,
  format,
  strokeWidth,
  color,
  size = 100,
  indeterminate = false,
  trailColor,
  className,
  style,
  'aria-label': label,
  ...props
}: ProgressProps) {
  const { messages } = useLeafConfig();
  const value = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  const state = !indeterminate && status === 'normal' && value === 100 ? 'success' : status;
  const width = Math.max(1, Math.min(20, strokeWidth ?? (type === 'circle' ? 6 : 8)));
  const content = format ? (
    format(value)
  ) : state === 'success' ? (
    <Check aria-hidden="true" />
  ) : state === 'error' ? (
    <X aria-hidden="true" />
  ) : (
    `${value}%`
  );
  const radius = 50 - width / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      {...props}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : value}
      aria-label={label ?? messages.progress}
      aria-valuetext={indeterminate ? messages.loading : `${value}%`}
      data-status={state}
      data-indeterminate={indeterminate || undefined}
      className={classes('leaf-progress', `leaf-progress--${type}`, className)}
      style={{
        ...(color ? { '--leaf-progress-color': color } : {}),
        ...(trailColor ? { '--leaf-progress-trail': trailColor } : {}),
        ...(type === 'circle' ? { width: size, height: size } : {}),
        ...style,
      }}
    >
      {type === 'line' ? (
        <div className="leaf-progress__track" style={{ height: width }}>
          <div className="leaf-progress__fill" style={{ width: `${value}%` }} />
        </div>
      ) : (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle className="leaf-progress__trail" cx="50" cy="50" r={radius} strokeWidth={width} />
          <circle
            className="leaf-progress__arc"
            cx="50"
            cy="50"
            r={radius}
            strokeWidth={width}
            strokeDasharray={
              indeterminate ? `${circumference * 0.25} ${circumference}` : circumference
            }
            strokeDashoffset={circumference * (1 - value / 100)}
            transform="rotate(-90 50 50)"
          />
        </svg>
      )}
      {showInfo && !indeterminate && <span className="leaf-progress__info">{content}</span>}
    </div>
  );
}
