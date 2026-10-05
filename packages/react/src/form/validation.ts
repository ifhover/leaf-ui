import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
export interface FormValidationApi {
  errors: Record<string, string>;
  pending: boolean;
  setErrors: Dispatch<SetStateAction<Record<string, string>>>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleReset: (event: FormEvent<HTMLFormElement>) => void;
  cancel: () => void;
  clearErrors: (name?: string) => void;
}
export interface FormValidationOptions {
  validate: (
    data: FormData,
    signal: AbortSignal,
  ) => Record<string, string> | Promise<Record<string, string>>;
  onSubmit?: (data: FormData, signal: AbortSignal) => void | Promise<void>;
  onError?: (error: unknown) => void;
  focusError?: boolean;
}
/** Schema, asynchronous and server errors, keeping native FormData as the source. */
export function useFormValidation(options: FormValidationOptions): FormValidationApi {
  const [errors, setErrors] = useState<Record<string, string>>({}),
    [pending, setPending] = useState(false);
  const controller = useRef<AbortController | undefined>(undefined);
  const latest = useRef(options);
  latest.current = options;
  useEffect(() => () => controller.current?.abort(), []);
  const cancel = () => {
    controller.current?.abort();
    controller.current = undefined;
    setPending(false);
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    controller.current?.abort();
    controller.current = undefined;
    setPending(false);
    const form = event.currentTarget;
    if (!form.noValidate && !form.reportValidity()) return;
    const request = new AbortController();
    controller.current = request;
    setPending(true);
    const data = new FormData(form);
    try {
      const result = await latest.current.validate(data, request.signal);
      if (request.signal.aborted) return;
      setErrors(result);
      const first = Object.keys(result)[0];
      if (first) {
        if (latest.current.focusError !== false) {
          const element = form.elements.namedItem(first);
          if (element instanceof HTMLElement) element.focus();
          else if (element instanceof RadioNodeList && element[0] instanceof HTMLElement)
            element[0].focus();
        }
        return;
      }
      await latest.current.onSubmit?.(data, request.signal);
    } catch (error) {
      if (!request.signal.aborted) latest.current.onError?.(error);
    } finally {
      if (controller.current === request && !request.signal.aborted) {
        setPending(false);
        controller.current = undefined;
      }
    }
  };
  return {
    errors,
    pending,
    setErrors,
    handleSubmit,
    cancel,
    handleReset: (event: FormEvent<HTMLFormElement>) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          cancel();
          setErrors({});
        }
      });
    },
    clearErrors: (name?: string) => {
      cancel();
      setErrors((previous) => {
        if (!name) return {};
        const next = { ...previous };
        delete next[name];
        return next;
      });
    },
  };
}
