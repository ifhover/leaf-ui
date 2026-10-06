import { forwardRef, useEffect, useRef, useState } from 'react';
import { useIMask } from 'react-imask';
import { Input, type InputProps } from '../input';
import { classes } from '../shared/classes';
import { useFieldValue, useMergedRef } from '../shared/field';
export interface InputMaskProps
  extends Omit<
    InputProps,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'type'
    | 'visibilityToggle'
    | 'visible'
    | 'defaultVisible'
    | 'onVisibleChange'
    | 'visibilityIcon'
  > {
  mask: string;
  definitions?: Record<string, RegExp>;
  lazy?: boolean;
  unmask?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, formatted: string) => void;
  onComplete?: (value: string) => void;
}
export const InputMask = forwardRef<HTMLInputElement, InputMaskProps>(function InputMask(
  {
    mask,
    definitions,
    lazy = true,
    unmask = false,
    value,
    defaultValue = '',
    onChange,
    onComplete,
    onClear,
    className,
    ...props
  },
  ref,
) {
  const native = useRef<HTMLInputElement>(null);
  const merged = useMergedRef(native, ref);
  const [current, setCurrent] = useFieldValue(value, defaultValue, native, props.form);
  const [formatted, setFormatted] = useState(defaultValue);
  const syncing = useRef(false);
  const latest = useRef({ onChange, onComplete });
  latest.current = { onChange, onComplete };
  const { maskRef } = useIMask(
    { mask, definitions, lazy },
    {
      ref: native,
      onAccept: (text, instance) => {
        setFormatted(text);
        if (!syncing.current) {
          const next = unmask ? instance.unmaskedValue : text;
          setCurrent(next);
          latest.current.onChange?.(next, text);
        }
      },
      onComplete: (_text, instance) => {
        if (!syncing.current)
          latest.current.onComplete?.(unmask ? instance.unmaskedValue : instance.value);
      },
    },
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: Changing mask options requires reapplying the controlled value to the updated engine.
  useEffect(() => {
    const instance = maskRef.current;
    if (!instance) return;
    syncing.current = true;
    if (unmask) instance.unmaskedValue = current;
    else instance.value = current;
    if (formatted !== instance.value) setFormatted(instance.value);
    syncing.current = false;
  }, [current, formatted, unmask, maskRef, mask, definitions, lazy]);
  return (
    <Input
      {...props}
      className={classes('leaf-input-mask', className)}
      ref={merged}
      value={formatted}
      onChange={() => {}}
      onClear={() => {
        if (maskRef.current) maskRef.current.value = '';
        onClear?.();
      }}
    />
  );
});
