import { Eye, EyeOff, X } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEventHandler,
  type ReactNode,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { useFieldValue, useMergedRef } from '../shared/field';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: ControlSize;
  status?: ControlStatus;
  prefix?: ReactNode;
  suffix?: ReactNode;
  allowClear?: boolean;
  onClear?: () => void;
  showCount?: boolean | ((value: string, maxLength?: number) => ReactNode);
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
    allowClear = false,
    onClear,
    showCount = false,
    value,
    defaultValue,
    onChange,
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
  const input = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRef(input, ref);
  const [current, setCurrent] = useFieldValue(
    value === undefined ? undefined : String(value),
    String(defaultValue ?? ''),
    input,
    props.form,
  );
  const [internalVisible, setVisible] = useState(defaultVisible);
  const visible = controlledVisible ?? internalVisible;
  const password = type === 'password';
  const disabled = disabledProp || field?.disabled;
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
        value={current}
        onChange={(event) => {
          setCurrent(event.target.value);
          onChange?.(event);
        }}
        aria-describedby={
          [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
        }
        ref={mergedRef}
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
      {allowClear && current && !disabled && !props.readOnly && (
        <button
          type="button"
          className="leaf-input__clear"
          aria-label={messages.clearInput}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            const node = input.current;
            if (!node) return;
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
              node,
              '',
            );
            node.dispatchEvent(new Event('input', { bubbles: true }));
            node.focus();
            onClear?.();
          }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
      {showCount && (
        <span className="leaf-input__count">
          {typeof showCount === 'function'
            ? showCount(current, props.maxLength)
            : `${current.length}${props.maxLength === undefined ? '' : ` / ${props.maxLength}`}`}
        </span>
      )}
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
