import { Eye, EyeOff } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEventHandler,
  type ReactNode,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: ControlSize;
  status?: ControlStatus;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Show a visibility toggle when type is password. */
  visibilityToggle?: boolean;
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  visibilityIcon?: (visible: boolean) => ReactNode;
  /** Called on Enter, excluding IME composition and prevented events. */
  onPressEnter?: KeyboardEventHandler<HTMLInputElement>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    status: statusProp,
    prefix,
    suffix,
    type = 'text',
    visibilityToggle = true,
    visible: controlledVisible,
    defaultVisible = false,
    onVisibleChange,
    visibilityIcon,
    className,
    style,
    disabled: disabledProp,
    onKeyDown,
    onPressEnter,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const field = useFormField();
  const { messages } = useLeafConfig();
  const [internalVisible, setVisible] = useState(defaultVisible);
  const visible = controlledVisible ?? internalVisible;
  const password = type === 'password';
  const disabled = disabledProp ?? field?.disabled;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  return (
    <div
      className={classes(
        'leaf-input',
        `leaf-input--${size}`,
        password && 'leaf-input--password',
        className,
      )}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
    >
      {prefix && (
        <span className="leaf-input__affix" aria-hidden="true">
          {prefix}
        </span>
      )}
      <input
        {...props}
        type={password && visible ? 'text' : type}
        id={props.id ?? field?.id}
        required={props.required ?? field?.required}
        aria-describedby={
          [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
        }
        ref={ref}
        disabled={disabled}
        className="leaf-input__native"
        aria-invalid={status === 'error' ? true : ariaInvalid}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === 'Enter' && !event.nativeEvent.isComposing && !event.defaultPrevented) {
            onPressEnter?.(event);
          }
        }}
      />
      {suffix && (
        <span className="leaf-input__affix" aria-hidden="true">
          {suffix}
        </span>
      )}
      {password && visibilityToggle && (
        <button
          type="button"
          className="leaf-input__visibility"
          disabled={disabled}
          aria-label={visible ? messages.hidePassword : messages.showPassword}
          aria-pressed={visible}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (controlledVisible === undefined) setVisible(!visible);
            onVisibleChange?.(!visible);
          }}
        >
          {visibilityIcon ? (
            visibilityIcon(visible)
          ) : visible ? (
            <EyeOff size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
});
Input.displayName = 'Input';
