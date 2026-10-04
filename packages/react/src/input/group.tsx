import { Search } from 'lucide-react';
import { type FieldsetHTMLAttributes, forwardRef, type ReactNode, useRef } from 'react';
import { Button } from '../button';
import { classes } from '../shared/classes';
import { useFieldValue, useMergedRef } from '../shared/field';
import { useText } from '../shared/use-text';
import { Input, type InputProps } from './input';
export interface InputSearchProps extends InputProps {
  onSearch?: (value: string) => void;
  loading?: boolean;
  enterButton?: ReactNode;
}
export const InputSearch = forwardRef<HTMLInputElement, InputSearchProps>(function InputSearch(
  {
    value,
    defaultValue,
    onChange,
    onSearch,
    onPressEnter,
    loading = false,
    enterButton,
    className,
    style,
    ...props
  },
  ref,
) {
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
      <Input
        {...props}
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
      <Button
        size={props.size}
        loading={loading}
        disabled={props.disabled}
        startIcon={enterButton ? undefined : <Search size={16} />}
        aria-label={enterButton ? undefined : t('搜索', 'Search')}
        onClick={() => onSearch?.(current)}
      >
        {enterButton}
      </Button>
    </div>
  );
});
export interface InputGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  compact?: boolean;
}
export function InputGroup({ compact = true, className, ...props }: InputGroupProps) {
  return (
    <fieldset
      {...props}
      className={classes('leaf-input-group', compact && 'leaf-input-group--compact', className)}
    />
  );
}
