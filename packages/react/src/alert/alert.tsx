import { CheckCircle2, CircleX, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useRef, useState } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { type FeedbackTypeInput, normalizeFeedbackType } from '../shared/feedback';
import { inertProps } from '../shared/inert';
import { useContentTransition, usePresence } from '../shared/presence';

export type { FeedbackType, FeedbackTypeInput } from '../shared/feedback';
export type AlertType = 'default' | 'success' | 'warning' | 'danger';
export type AlertTypeInput = AlertType | 'error';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Trailing content, displayed before the close button. */
  extra?: ReactNode;
  type?: AlertTypeInput;
  icon?: ReactNode;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
}
export function FeedbackIcon({
  type: rawType,
  size = 18,
}: {
  type: FeedbackTypeInput | AlertTypeInput | 'loading';
  size?: number;
}) {
  const normalized =
    rawType === 'loading' || rawType === 'default' ? rawType : normalizeFeedbackType(rawType);
  const Icon = {
    default: Info,
    success: CheckCircle2,
    info: Info,
    warning: TriangleAlert,
    danger: CircleX,
    loading: LoaderCircle,
  }[normalized];
  return (
    <Icon
      size={size}
      aria-hidden="true"
      className={normalized === 'loading' ? 'leaf-feedback-spinner' : undefined}
    />
  );
}
export function Alert(rawProps: AlertProps) {
  const {
    title,
    description,
    extra,
    type = 'default',
    icon,
    showIcon = true,
    closable,
    onClose,
    className,
    ...props
  } = useComponentProps('Alert', rawProps);
  const normalizedType: AlertType = type === 'error' ? 'danger' : type;
  const { messages } = useLeafConfig();
  const [closed, setClosed] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const present = usePresence(!closed, root);
  useContentTransition(content, normalizedType);
  if (!present) return null;
  return (
    <div
      {...props}
      {...inertProps(closed)}
      ref={root}
      data-state={closed ? 'closing' : undefined}
      data-description={description ? '' : undefined}
      aria-hidden={closed || props['aria-hidden']}
      role={
        props.role ??
        (normalizedType === 'danger' || normalizedType === 'warning' ? 'alert' : 'status')
      }
      className={classes('leaf-alert', `leaf-alert--${normalizedType}`, className)}
    >
      {showIcon && (
        <span className="leaf-alert__icon" aria-hidden="true">
          {icon ?? <FeedbackIcon type={normalizedType} size={16} />}
        </span>
      )}
      <div className="leaf-alert__content" ref={content}>
        <div className="leaf-alert__title">{title}</div>
        {description && <div className="leaf-alert__description">{description}</div>}
      </div>
      {extra != null && <div className="leaf-alert__extra">{extra}</div>}
      {closable && (
        <button
          type="button"
          className="leaf-alert__close"
          aria-label={messages.common.close}
          onClick={() => {
            const node = root.current;
            if (node) {
              node.style.setProperty(
                '--leaf-alert-height',
                `${node.getBoundingClientRect().height}px`,
              );
              void node.offsetHeight;
            }
            setClosed(true);
            onClose?.();
          }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
