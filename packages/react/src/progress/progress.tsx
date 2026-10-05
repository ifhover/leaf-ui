import { Check, X } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';

export interface ProgressSegment {
  key?: string;
  percent: number;
  color?: string;
}
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
  segments?: readonly ProgressSegment[];
  steps?: number;
  dashboard?: boolean;
  successPercent?: number;
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
  segments,
  steps,
  dashboard = false,
  successPercent,
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
  const sweep = dashboard ? circumference * 0.75 : circumference;
  const stepCount =
    steps && Number.isFinite(steps) ? Math.max(1, Math.min(1000, Math.trunc(steps))) : 0;
  let remaining = 100;
  const sections = segments?.map((segment) => {
    const percent = Math.max(
      0,
      Math.min(remaining, Number.isFinite(segment.percent) ? segment.percent : 0),
    );
    remaining -= percent;
    return { ...segment, percent };
  });
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
      className={classes(
        'leaf-progress',
        `leaf-progress--${type}`,
        dashboard && 'leaf-progress--dashboard',
        Boolean(steps) && 'leaf-progress--steps',
        className,
      )}
      style={{
        ...(color ? { '--leaf-progress-color': color } : {}),
        ...(trailColor ? { '--leaf-progress-trail': trailColor } : {}),
        ...(type === 'circle' ? { width: size, height: size } : {}),
        ...style,
      }}
    >
      {type === 'line' ? (
        <div
          className="leaf-progress__track"
          style={{ height: width, display: segments?.length ? 'flex' : undefined }}
        >
          {stepCount ? (
            Array.from({ length: stepCount }, (_, index) => index).map((index) => (
              <span
                key={`step-${index}`}
                className="leaf-progress__step"
                data-filled={(index / stepCount) * 100 < value || undefined}
                style={
                  segments?.[index]
                    ? ({ '--leaf-progress-color': segments[index]?.color } as React.CSSProperties)
                    : undefined
                }
              />
            ))
          ) : segments?.length ? (
            sections?.map((segment, index) => (
              <div
                key={segment.key ?? `segment-${index}`}
                className="leaf-progress__fill"
                style={{ width: `${segment.percent}%`, background: segment.color }}
              />
            ))
          ) : (
            <div className="leaf-progress__fill" style={{ width: `${value}%` }} />
          )}
        </div>
      ) : (
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle
            className="leaf-progress__trail"
            cx="50"
            cy="50"
            r={radius}
            strokeWidth={width}
            strokeDasharray={dashboard ? `${sweep} ${circumference}` : undefined}
            transform={dashboard ? 'rotate(135 50 50)' : undefined}
          />
          <circle
            className="leaf-progress__arc"
            cx="50"
            cy="50"
            r={radius}
            strokeWidth={width}
            strokeDasharray={
              indeterminate
                ? `${circumference * 0.25} ${circumference}`
                : `${(sweep * value) / 100} ${circumference}`
            }
            strokeDashoffset={0}
            transform={dashboard ? 'rotate(135 50 50)' : 'rotate(-90 50 50)'}
          />
          {successPercent !== undefined && (
            <circle
              className="leaf-progress__arc leaf-progress__arc--success"
              cx="50"
              cy="50"
              r={radius}
              strokeWidth={width}
              strokeDasharray={`${(sweep * Math.max(0, Math.min(value, successPercent))) / 100} ${circumference}`}
              transform={dashboard ? 'rotate(135 50 50)' : 'rotate(-90 50 50)'}
            />
          )}
        </svg>
      )}
      {showInfo && !indeterminate && <span className="leaf-progress__info">{content}</span>}
    </div>
  );
}
