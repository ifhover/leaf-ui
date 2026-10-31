import {
  createContext,
  type FieldsetHTMLAttributes,
  type FormHTMLAttributes,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import type { LeafThemeStyle } from '../theme';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  layout?: 'horizontal' | 'vertical' | 'settings';
  labelWidth?: number;
  labelAlign?: 'left' | 'right';
  /** Align controls within the control column of settings fields. */
  controlAlign?: 'left' | 'right';
  /** Set the control-column width of settings fields. Numbers use pixels. */
  settingsControlWidth?: number | string;
  disabled?: boolean;
}
export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  description?: ReactNode;
  layout?: FormProps['layout'];
  htmlFor?: string;
  required?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  labelWidth?: number;
  /** Override control alignment for this settings field. */
  controlAlign?: FormProps['controlAlign'];
  /** Override the control-column width for this settings field. Numbers use pixels. */
  settingsControlWidth?: FormProps['settingsControlWidth'];
}
export interface FormError {
  fieldId: string;
  message: ReactNode;
  label?: ReactNode;
}
const FormContext = createContext({
  layout: 'horizontal' as NonNullable<FormProps['layout']>,
  labelAlign: 'right' as 'left' | 'right',
  controlAlign: 'left' as NonNullable<FormProps['controlAlign']>,
  disabled: false,
  errors: [] as readonly FormError[],
  registerError: (_id: string, _error: FormError | null) => {},
});
interface FieldContextValue {
  id?: string;
  labelId?: string;
  descriptionId?: string;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
}
const FieldContext = createContext<FieldContextValue | undefined>(undefined);
export function useFormField() {
  const field = useContext(FieldContext);
  const form = useContext(FormContext);
  return form.disabled ? { ...field, disabled: true } : field;
}

/** Internal controls belong to the composite value, not to the outer field. */
export function FieldScope({ children }: { children: ReactNode }) {
  return <FieldContext.Provider value={undefined}>{children}</FieldContext.Provider>;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(rawProps: FormProps, ref) {
  const {
    layout = 'horizontal',
    labelWidth = 112,
    labelAlign = 'right',
    controlAlign = 'left',
    settingsControlWidth,
    disabled = false,
    className,
    style,
    children,
    ...props
  } = useComponentProps('Form', rawProps);
  const invalidFocusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(invalidFocusTimer.current), []);
  const [errors, setErrors] = useState<readonly FormError[]>([]);
  const registerError = useCallback((id: string, error: FormError | null) => {
    setErrors((previous) =>
      error
        ? [...previous.filter((entry) => entry.fieldId !== id), error]
        : previous.some((entry) => entry.fieldId === id)
          ? previous.filter((entry) => entry.fieldId !== id)
          : previous,
    );
  }, []);
  const context = useMemo(
    () => ({ layout, labelAlign, controlAlign, disabled, errors, registerError }),
    [layout, labelAlign, controlAlign, disabled, errors, registerError],
  );
  const variables: LeafThemeStyle = {
    '--leaf-form-label-width': `${Math.max(0, labelWidth)}px`,
    ...(settingsControlWidth !== undefined
      ? {
          '--leaf-form-settings-control-width':
            typeof settingsControlWidth === 'number'
              ? `${Math.max(0, settingsControlWidth)}px`
              : settingsControlWidth,
        }
      : {}),
    ...style,
  };
  return (
    <FormContext.Provider value={context}>
      <form
        {...props}
        ref={ref}
        className={classes('leaf-form', `leaf-form--${layout}`, className)}
        style={variables}
        onInvalidCapture={(event) => {
          props.onInvalidCapture?.(event);
          if (event.defaultPrevented || invalidFocusTimer.current !== undefined) return;
          const target = event.target as HTMLElement;
          // Native validation can run microtasks between invalid events; wait for the full batch.
          invalidFocusTimer.current = setTimeout(() => {
            invalidFocusTimer.current = undefined;
            if (!target.isConnected) return;
            const control = target
              .closest('.leaf-form-field')
              ?.querySelector<HTMLElement>(
                'input:not([aria-hidden="true"]), textarea, [role="combobox"], button',
              );
            (control ?? target).focus();
          });
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});
Form.displayName = 'Form';

export function FormField(rawProps: FormFieldProps) {
  const {
    label,
    description,
    layout: suppliedLayout,
    htmlFor,
    required,
    help,
    error,
    labelWidth,
    controlAlign: suppliedControlAlign,
    settingsControlWidth,
    children,
    className,
    style,
    ...props
  } = useComponentProps('FormField', rawProps);
  const form = useContext(FormContext);
  const layout = suppliedLayout ?? form.layout;
  const controlAlign = suppliedControlAlign ?? form.controlAlign;
  const { messages } = useLeafConfig();
  const generated = useId();
  const inputId = htmlFor ?? `${generated}-control`;
  const descriptionId = `${generated}-description`;
  const summaryId = `${generated}-summary`;
  const [validationError, setValidationError] = useState<string>();
  const displayedError = error ?? validationError;
  useEffect(() => {
    form.registerError(
      inputId,
      displayedError ? { fieldId: inputId, message: displayedError, label } : null,
    );
    return () => form.registerError(inputId, null);
  }, [form.registerError, inputId, displayedError, label]);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const owner = root.current?.closest('form');
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) setValidationError(undefined);
      });
    };
    owner?.addEventListener('reset', reset);
    return () => owner?.removeEventListener('reset', reset);
  }, []);
  const context: FieldContextValue = {
    id: inputId,
    labelId: label != null ? `${generated}-label` : undefined,
    required,
    disabled: form.disabled,
    error: displayedError,
    descriptionId:
      [description != null && summaryId, (displayedError || help) && descriptionId]
        .filter(Boolean)
        .join(' ') || undefined,
  };
  const variables: LeafThemeStyle = {
    ...(labelWidth !== undefined
      ? { '--leaf-form-label-width': `${Math.max(0, labelWidth)}px` }
      : {}),
    ...(settingsControlWidth !== undefined
      ? {
          '--leaf-form-settings-control-width':
            typeof settingsControlWidth === 'number'
              ? `${Math.max(0, settingsControlWidth)}px`
              : settingsControlWidth,
        }
      : {}),
    ...style,
  };
  return (
    <FieldContext.Provider value={context}>
      <div
        {...props}
        ref={root}
        className={classes(
          'leaf-form-field',
          `leaf-form-field--${layout}`,
          form.layout === 'settings' && 'leaf-form-field--settings-row',
          `leaf-form-field--${form.labelAlign}`,
          `leaf-form-field--control-${controlAlign}`,
          description != null && 'leaf-form-field--has-description',
          className,
        )}
        style={variables}
        onInvalidCapture={(event) => {
          props.onInvalidCapture?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          const target = event.target as HTMLInputElement;
          setValidationError(
            target.validity?.valueMissing ? messages.form.required : messages.form.invalid,
          );
          document.getElementById(inputId)?.focus();
        }}
        onInput={(event) => {
          props.onInput?.(event);
          // Capture-phase updates can restore a controlled input before its onChange runs.
          setValidationError(undefined);
        }}
      >
        {(label != null || description != null) && (
          <div className="leaf-form-field__header">
            {label != null && (
              <label id={`${generated}-label`} className="leaf-form-field__label" htmlFor={inputId}>
                <span>
                  {required && (
                    <span className="leaf-form-field__required" aria-hidden="true">
                      *
                    </span>
                  )}
                  {label}
                </span>
              </label>
            )}
            {description != null && (
              <div id={summaryId} className="leaf-form-field__summary-description">
                {description}
              </div>
            )}
          </div>
        )}
        <div className="leaf-form-field__body">
          {children}
          {(displayedError || help) && (
            <div
              id={descriptionId}
              className={classes(
                'leaf-form-field__description',
                Boolean(displayedError) && 'leaf-form-field__error',
              )}
              role={displayedError ? 'alert' : undefined}
            >
              {displayedError || help}
            </div>
          )}
        </div>
      </div>
    </FieldContext.Provider>
  );
}

export interface FormGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: ReactNode;
  description?: ReactNode;
}
export function FormGroup(rawProps: FormGroupProps) {
  const { legend, description, disabled, children, className, ...props } = useComponentProps(
    'FormGroup',
    rawProps,
  );
  const inherited = useContext(FormContext);
  const context = useMemo(
    () => ({ ...inherited, disabled: inherited.disabled || Boolean(disabled) }),
    [inherited, disabled],
  );
  return (
    <FormContext.Provider value={context}>
      <fieldset
        {...props}
        disabled={context.disabled}
        className={classes(
          'leaf-form-group',
          inherited.layout === 'settings' && 'leaf-form-group--settings',
          className,
        )}
      >
        {legend && <legend>{legend}</legend>}
        {description && <p className="leaf-form-group__description">{description}</p>}
        {children}
      </fieldset>
    </FormContext.Provider>
  );
}
export interface FormErrorSummaryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  errors?: readonly FormError[];
  title?: ReactNode;
}
export function FormErrorSummary(rawProps: FormErrorSummaryProps) {
  const {
    errors: suppliedErrors,
    title,
    className,
    ...props
  } = useComponentProps('FormErrorSummary', rawProps);
  const context = useContext(FormContext);
  const { messages } = useLeafConfig();
  const errors = suppliedErrors ?? context.errors;
  if (!errors.length) return null;
  return (
    <div {...props} role="alert" className={classes('leaf-form-error-summary', className)}>
      <strong>{title ?? messages.form.errorSummary}</strong>
      <ul>
        {errors.map((error) => (
          <li key={error.fieldId}>
            <button
              type="button"
              onClick={() => {
                const control = document.getElementById(error.fieldId);
                control?.scrollIntoView?.({ block: 'center', behavior: 'auto' });
                control?.focus();
              }}
            >
              {error.label ? <>{error.label}: </> : null}
              {error.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
