import { Check, LoaderCircle, X } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';

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
}

export function Steps({
  items,
  current = 0,
  status = 'process',
  direction = 'horizontal',
  size = 'md',
  loading = false,
  onChange,
  className,
  ...props
}: StepsProps) {
  return (
    <ol
      {...props}
      className={classes(
        'leaf-steps',
        `leaf-steps--${direction}`,
        `leaf-steps--${size}`,
        className,
      )}
    >
      {items.map((item, index) => {
        const state =
          item.status ?? (index < current ? 'finish' : index === current ? status : 'wait');
        const content = (
          <>
            <span className="leaf-steps__icon" aria-hidden="true">
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
