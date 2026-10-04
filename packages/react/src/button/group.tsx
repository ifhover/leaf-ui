import { ChevronDown } from 'lucide-react';
import {
  Children,
  cloneElement,
  type FieldsetHTMLAttributes,
  isValidElement,
  type ReactElement,
} from 'react';
import { Dropdown, type DropdownItem, type DropdownProps } from '../dropdown';
import { classes } from '../shared/classes';
import { useText } from '../shared/use-text';
import { Button, type ButtonProps } from './button';
export interface ButtonGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  size?: ButtonProps['size'];
  disabled?: boolean;
  attached?: boolean;
}
export function ButtonGroup({
  size,
  disabled,
  attached = true,
  children,
  className,
  ...props
}: ButtonGroupProps) {
  return (
    <fieldset
      {...props}
      disabled={disabled}
      className={classes('leaf-button-group', attached && 'leaf-button-group--attached', className)}
    >
      {Children.map(children, (child) =>
        isValidElement<ButtonProps>(child)
          ? cloneElement(child, {
              size: child.props.size ?? size,
              disabled: disabled || child.props.disabled,
            })
          : child,
      )}
    </fieldset>
  );
}
export interface SplitButtonProps extends ButtonProps {
  items: readonly DropdownItem[];
  menuLabel?: string;
  dropdownProps?: Omit<DropdownProps, 'items' | 'children' | 'disabled'>;
}
export function SplitButton({
  items,
  menuLabel,
  dropdownProps,
  children,
  className,
  ...props
}: SplitButtonProps): ReactElement {
  const t = useText();
  return (
    <ButtonGroup className={className}>
      <Button {...props}>{children}</Button>
      <Dropdown {...dropdownProps} items={items} disabled={props.disabled || props.loading}>
        <Button
          variant={props.variant}
          size={props.size}
          danger={props.danger}
          startIcon={<ChevronDown size={16} />}
          aria-label={menuLabel ?? t('更多操作', 'More actions')}
        />
      </Dropdown>
    </ButtonGroup>
  );
}
