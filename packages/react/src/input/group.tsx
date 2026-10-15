import { Search } from 'lucide-react';
import { type FieldsetHTMLAttributes, forwardRef, type ReactNode, useRef } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { useFieldValue, useMergedRef } from '../shared/field';
import { useText } from '../shared/use-text';
import { InputControl, type InputProps } from './input';
export interface InputSearchProps extends InputProps {
  onSearch?: (value: string) => void;
  loading?: boolean;
  enterButton?: ReactNode;
}
export const InputSearch = forwardRef<HTMLInputElement, InputSearchProps>(
  function InputSearch(rawProps, ref) {
    const {
      onSearch,
      loading = false,
      enterButton,
      ...searchProps
    } = useComponentProps('InputSearch', rawProps);
    const {
      value,
      defaultValue,
      onChange,
      onPressEnter,
      className,
      style,
      size = 'md',
      disabled: disabledProp,
      ...props
    } = useComponentProps('Input', searchProps);
    const field = useFormField();
    const disabled = Boolean(disabledProp || field?.disabled);
    const t = useText();
    const input = useRef<HTMLInputElement>(null);
    const merged = useMergedRef(input, ref);
    const [current, setCurrent] = useFieldValue(
      value === undefined ? undefined : String(value),
      String(defaultValue ?? ''),
      input,
      props.form,
    );
    return (
      <div className={classes('leaf-input-search', className)} style={style}>
        <InputControl
          {...props}
          size={size}
          disabled={disabled}
          ref={merged}
          value={current}
          onChange={(event) => {
            setCurrent(event.target.value);
            onChange?.(event);
          }}
          onPressEnter={(event) => {
            onPressEnter?.(event);
            if (!event.defaultPrevented && !loading) {
              event.preventDefault();
              onSearch?.(current);
            }
          }}
        />
        <ButtonControl
          type="button"
          size={size}
          loading={loading}
          disabled={disabled}
          startIcon={enterButton ? undefined : <Search size={16} />}
          aria-label={enterButton ? undefined : t('common.searchAction')}
          onClick={() => onSearch?.(current)}
        >
          {enterButton}
        </ButtonControl>
      </div>
    );
  },
);
export interface InputGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  compact?: boolean;
}
export function InputGroup(rawProps: InputGroupProps) {
  const { compact = true, className, ...props } = useComponentProps('InputGroup', rawProps);
  return (
    <fieldset
      {...props}
      className={classes('leaf-input-group', compact && 'leaf-input-group--compact', className)}
    />
  );
}
