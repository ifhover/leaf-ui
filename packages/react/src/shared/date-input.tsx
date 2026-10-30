import { CalendarDays } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { classes } from './classes';
import { ClearButton } from './clear-button';
import { FormValue, useMergedRef } from './field';
import { FloatingPanel, type PopupOptions, useFloatingDismiss } from './floating';
import type { PickerSegments, SegmentKind } from './segments';
import type { ControlSize, ControlStatus } from './types';
import { useSegmentedInput } from './use-segmented-input';

export interface PickerFieldProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'children' | 'multiple'
    >,
    PopupOptions {
  size?: ControlSize;
  status?: ControlStatus;
  allowClear?: boolean;
  inputReadOnly?: boolean;
  /** `card` insets the picker content on a muted canvas. */
  panelVariant?: 'plain' | 'card';
  open?: boolean;
  defaultOpen?: boolean;
}
export interface DateInputProps extends PickerFieldProps {
  segments?: PickerSegments;
  displayValue: string;
  formValue: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpening: () => void;
  onClear: () => void;
  onTextCommit: (text: string) => boolean;
  onTextChange?: (text: string) => void;
  onPanelConfirm?: () => boolean;
  onSegmentChange?: (group: number) => void;
  commitOnBlur?: boolean;
  /** Called when the panel closes by an outside click, focus move or Tab without typed text. */
  onDismiss?: () => void;
  renderPanel: (close: (focusSegment?: SegmentKind, group?: number) => void) => ReactNode;
  panelClassName?: string;
  clearLabel?: string;
  panelLabel?: string;
  icon?: ReactNode;
}
/** Editable text field with a custom calendar/time popup and canonical FormData value. */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput(
  {
    size = 'md',
    status: statusProp,
    placeholder,
    name,
    required: requiredProp,
    allowClear = true,
    inputReadOnly,
    panelVariant = 'plain',
    defaultOpen: _defaultOpen,
    popupPlacement,
    popupClassName,
    popupStyle,
    popupRender,
    getPopupContainer,
    displayValue,
    segments,
    formValue,
    open,
    onOpenChange,
    onOpening,
    onClear,
    onTextCommit,
    onTextChange,
    onPanelConfirm,
    onSegmentChange,
    commitOnBlur = true,
    onDismiss,
    renderPanel,
    panelClassName,
    clearLabel,
    panelLabel,
    icon,
    className,
    style,
    disabled: disabledProp,
    id: idProp,
    onClick,
    onKeyDown,
    onBlur,
    onFocus,
    onPaste,
    onCompositionStart,
    onCompositionEnd,
    form,
    ...props
  },
  forwardedRef,
) {
  const field = useFormField();
  const { messages, weekStartsOn, direction } = useLeafConfig();
  const disabled = disabledProp || field?.disabled;
  const required = requiredProp ?? field?.required;
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelId = `${useId()}-picker-panel`;
  const ref = useMergedRef(input, forwardedRef);
  const [text, setText] = useState(displayValue);
  const [dirty, setDirty] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [focusPanel, setFocusPanel] = useState(false);
  const prepared = useRef(false);
  const settled = useRef(false);
  const editText = (value: string) => {
    settled.current = false;
    if (segments && value === '') {
      onClear();
      setText('');
      setDirty(false);
      setInvalid(false);
      return;
    }
    setText(value);
    setDirty(true);
    setInvalid(false);
    onTextChange?.(value);
  };
  const segmented = useSegmentedInput({
    config: segments,
    input,
    displayValue,
    text,
    dirty,
    readOnly: disabled || props.readOnly || inputReadOnly,
    periods: [messages.timePicker.am, messages.timePicker.pm],
    weekStartsOn,
    onEdit: editText,
    onSegmentChange,
  });
  const status = statusProp ?? (invalid || field?.error ? 'error' : undefined);
  const resetSegments = segmented.reset;
  const restore = () => {
    settled.current = true;
    setText(displayValue);
    setDirty(false);
    setInvalid(false);
    segmented.reset();
  };
  const close = () => {
    onOpenChange(false);
    restore();
  };
  const finish = (focusSegment?: SegmentKind, group = 0) => {
    onOpenChange(false);
    restore();
    input.current?.focus();
    if (focusSegment) segmented.focus(focusSegment, group);
  };
  const opening = () => {
    if (!open && !disabled && !props.readOnly) {
      settled.current = false;
      prepared.current = true;
      onOpening();
      if (dirty) onTextChange?.(text);
      onOpenChange(true);
    }
  };
  const prepareExternal = useRef(() => {});
  prepareExternal.current = () => {
    settled.current = false;
    onOpening();
    if (dirty) onTextChange?.(text);
  };
  useEffect(() => {
    if (open && !prepared.current) prepareExternal.current();
    prepared.current = open;
  }, [open]);
  const dismiss = (reason?: 'escape' | 'outside' | 'focus' | 'tab') => {
    // Outside pointerdown, blur and focusin can settle the same edit in one event sequence.
    if (settled.current) return;
    settled.current = true;
    if (reason !== 'escape') {
      if (dirty && commitOnBlur) onTextCommit(text.trim());
      else if (!dirty) onDismiss?.();
    }
    // Invalid or incomplete text is a canceled edit, not a committed validation error.
    close();
  };
  useFloatingDismiss(open, dismiss, input, panel, root);
  useEffect(() => {
    setText(displayValue);
    setDirty(false);
    setInvalid(false);
  }, [displayValue]);
  useEffect(() => {
    input.current?.setCustomValidity(invalid ? messages.form.invalid : '');
  }, [invalid, messages.form.invalid]);
  useEffect(() => {
    if (open && focusPanel) {
      (
        panel.current?.querySelector<HTMLElement>('[data-day][tabindex="0"]:not(:disabled)') ??
        panel.current?.querySelector<HTMLElement>('[tabindex="0"]:not(:disabled)') ??
        panel.current?.querySelector<HTMLElement>('button:not(:disabled)')
      )?.focus();
      setFocusPanel(false);
    }
  }, [open, focusPanel]);
  useEffect(() => {
    const owner = input.current?.form;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          setText(displayValue);
          setDirty(false);
          setInvalid(false);
          resetSegments();
          onOpenChange(false);
        }
      });
    owner?.addEventListener('reset', reset);
    return () => owner?.removeEventListener('reset', reset);
  }, [displayValue, onOpenChange, resetSegments]);
  const commitText = (focus = true) => {
    const valid = onTextCommit(text.trim());
    setInvalid(!valid);
    if (valid) {
      restore();
      onOpenChange(false);
      if (focus) input.current?.focus();
    }
    return valid;
  };
  return (
    <div
      ref={root}
      className={classes('leaf-date-picker', `leaf-date-picker--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
      data-open={open ? '' : undefined}
      data-segmented={segments ? '' : undefined}
      data-direction={direction}
      data-clearable={
        allowClear && (formValue || text) && !disabled && !props.readOnly ? '' : undefined
      }
    >
      <input
        {...props}
        ref={ref}
        id={idProp ?? field?.id}
        type="text"
        inputMode={
          props.inputMode ??
          (segments && !segments.template.segments.some((segment) => segment.kind === 'period')
            ? 'numeric'
            : undefined)
        }
        form={form}
        className="leaf-date-picker__input"
        disabled={disabled}
        readOnly={props.readOnly || inputReadOnly}
        value={segmented.value}
        placeholder={placeholder ?? messages.datePicker.placeholder}
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-keyshortcuts={
          props['aria-keyshortcuts'] ??
          (segments
            ? 'ArrowUp ArrowDown ArrowLeft ArrowRight Tab Shift+Tab Space Alt+ArrowDown'
            : undefined)
        }
        aria-required={required || undefined}
        aria-invalid={status === 'error' ? true : props['aria-invalid']}
        aria-describedby={
          [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
        }
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            segmented.onClick(event);
            opening();
          }
        }}
        onFocus={(event) => {
          onFocus?.(event);
          if (!event.defaultPrevented) segmented.onFocus();
        }}
        onPaste={(event) => {
          onPaste?.(event);
          if (!event.defaultPrevented) segmented.onPaste(event);
        }}
        onCompositionStart={(event) => {
          onCompositionStart?.(event);
          if (!event.defaultPrevented) segmented.onCompositionStart();
        }}
        onCompositionEnd={(event) => {
          onCompositionEnd?.(event);
          if (!event.defaultPrevented) segmented.onCompositionEnd(event);
        }}
        onChange={(event) => {
          if (!segments) opening();
          if (!segmented.onChange(event)) editText(event.target.value);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (
            event.defaultPrevented ||
            root.current?.contains(event.relatedTarget) ||
            panel.current?.contains(event.relatedTarget)
          )
            return;
          if (dirty) dismiss('focus');
        }}
        onInvalid={(event) => {
          props.onInvalid?.(event);
          event.preventDefault();
          input.current?.focus();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.nativeEvent.isComposing || segmented.isComposing)
            return;
          if (event.key === 'ArrowDown' && (!segments || event.altKey)) {
            event.preventDefault();
            opening();
            setFocusPanel(true);
          } else if (segmented.onKeyDown(event)) {
            return;
          } else if (event.key === 'Enter') {
            event.preventDefault();
            if (dirty) commitText();
            else if (open && onPanelConfirm?.()) finish();
            else opening();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        }}
      />
      {allowClear && (formValue || text) && !disabled && !props.readOnly && (
        <ClearButton
          tabIndex={segments ? -1 : undefined}
          label={clearLabel ?? messages.datePicker.clear}
          onClear={() => {
            onClear();
            setText('');
            setDirty(false);
            setInvalid(false);
            finish();
          }}
        />
      )}
      <button
        type="button"
        className="leaf-date-picker__icon"
        tabIndex={-1}
        disabled={disabled}
        aria-label={panelLabel ?? messages.datePicker.label}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (open) close();
          else {
            opening();
            setFocusPanel(true);
          }
        }}
      >
        {icon ?? <CalendarDays size={16} aria-hidden="true" />}
      </button>
      <FormValue
        name={name}
        form={form}
        value={formValue}
        disabled={disabled}
        required={required}
        triggerRef={input}
      />
      <FloatingPanel
        resetSurfaceGeometry
        open={open}
        triggerRef={root}
        panelRef={panel}
        id={panelId}
        className={classes(
          'leaf-floating',
          'leaf-picker-panel',
          panelVariant === 'card' && 'leaf-picker-panel--card',
          panelClassName,
          popupClassName,
        )}
        placement={popupPlacement}
        style={popupStyle}
        render={popupRender}
        container={getPopupContainer}
        role="dialog"
        aria-label={panelLabel ?? messages.datePicker.label}
      >
        {renderPanel(finish)}
      </FloatingPanel>
    </div>
  );
});
