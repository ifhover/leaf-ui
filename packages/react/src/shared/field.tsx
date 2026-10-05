import { type Ref, type RefObject, useCallback, useEffect, useRef, useState } from 'react';

export function useMergedRef<T>(local: RefObject<T | null>, forwarded?: Ref<T>) {
  return useCallback(
    (node: T | null) => {
      local.current = node;
      if (typeof forwarded === 'function') forwarded(node);
      else if (forwarded) forwarded.current = node;
    },
    [local, forwarded],
  );
}

/** Keep uncontrolled custom fields aligned with native form reset behavior. */
export function useFieldValue<T>(
  value: T | undefined,
  defaultValue: T,
  ref: RefObject<HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement | null>,
  formId?: string,
) {
  const [internal, setInternal] = useState(defaultValue);
  useEffect(() => {
    const form =
      ref.current?.form ??
      (formId ? (document.getElementById(formId) as HTMLFormElement | null) : null);
    if (!form) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented && value === undefined) setInternal(defaultValue);
      });
    };
    form.addEventListener('reset', reset);
    return () => form.removeEventListener('reset', reset);
  }, [ref, formId, value, defaultValue]);
  const setValue = (next: T) => {
    if (value === undefined) setInternal(next);
  };
  return [value === undefined ? internal : value, setValue] as const;
}

interface FormValueProps {
  value: string;
  name?: string;
  form?: string;
  disabled?: boolean;
  required?: boolean;
  triggerRef: RefObject<HTMLButtonElement | HTMLInputElement | null>;
}

/** A non-interactive form proxy; custom overlays never use native picker controls. */
export function FormValue({ value, name, form, disabled, required, triggerRef }: FormValueProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previousValue = useRef(value);
  useEffect(() => {
    if (previousValue.current !== value) {
      inputRef.current?.dispatchEvent(new Event('input', { bubbles: true }));
      previousValue.current = value;
    }
  }, [value]);
  return (
    <input
      ref={inputRef}
      type="text"
      className="leaf-form-value"
      aria-hidden="true"
      tabIndex={-1}
      name={name}
      form={form}
      value={value}
      disabled={disabled}
      required={required}
      onChange={() => {}}
      onFocus={() => triggerRef.current?.focus()}
      onInvalid={(event) => {
        event.preventDefault();
        triggerRef.current?.focus();
      }}
    />
  );
}
