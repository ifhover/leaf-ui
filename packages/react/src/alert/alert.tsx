import { CheckCircle2, CircleAlert, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';
export type FeedbackType = 'success' | 'info' | 'warning' | 'error';
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  type?: FeedbackType;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
}
export function FeedbackIcon({ type }: { type: FeedbackType | 'loading' }) {
  const Icon = {
    success: CheckCircle2,
    info: Info,
    warning: TriangleAlert,
    error: CircleAlert,
    loading: LoaderCircle,
  }[type];
  return (
    <Icon
      size={18}
      aria-hidden="true"
      className={type === 'loading' ? 'leaf-feedback-spinner' : undefined}
    />
  );
}
export function Alert({
  title,
  description,
  type = 'info',
  showIcon = true,
  closable,
  onClose,
  className,
  ...props
}: AlertProps) {
  const { messages } = useLeafConfig();
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return (
    <div
      {...props}
      role={props.role ?? (type === 'error' || type === 'warning' ? 'alert' : 'status')}
      className={classes('leaf-alert', `leaf-alert--${type}`, className)}
    >
      {showIcon && <FeedbackIcon type={type} />}
      <div className="leaf-alert__content">
        <div className="leaf-alert__title">{title}</div>
        {description && <div className="leaf-alert__description">{description}</div>}
      </div>
      {closable && (
        <button
          type="button"
          className="leaf-alert__close"
          aria-label={messages.close}
          onClick={() => {
            setClosed(true);
            onClose?.();
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
