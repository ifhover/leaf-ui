import { ChevronDown } from 'lucide-react';
import {
  Children,
  cloneElement,
  type FieldsetHTMLAttributes,
  isValidElement,
  type ReactElement,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import type { DropdownItem, DropdownProps } from '../dropdown';
import { DropdownControl as Dropdown } from '../dropdown/dropdown';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';
import { useText } from '../shared/use-text';
import { ButtonControl, type ButtonProps } from './button';
export interface ButtonGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  size?: ControlSize;
  disabled?: boolean;
  attached?: boolean;
}
export function ButtonGroupControl({
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
export function SplitButton(incomingProps: SplitButtonProps): ReactElement {
  const { items, menuLabel, dropdownProps, ...rawProps } = useComponentProps(
    'SplitButton',
    incomingProps,
  );
  const { children, className, ...props } = useComponentProps('Button', rawProps);
  const inactive = Boolean(props.disabled || props.loading);
  const t = useText();
  return (
    <ButtonGroupControl className={classes('leaf-split-button', className)}>
      <ButtonControl {...props}>{children}</ButtonControl>
      <Dropdown {...dropdownProps} items={items} disabled={inactive}>
        <ButtonControl
          type="button"
          disabled={inactive}
          variant={props.variant}
          size={props.size}
          danger={props.danger}
          startIcon={<ChevronDown size={16} />}
          aria-label={menuLabel ?? t('button.moreActions')}
        />
      </Dropdown>
    </ButtonGroupControl>
  );
}

export function ButtonGroup(rawProps: ButtonGroupProps) {
  const props = useComponentProps('ButtonGroup', rawProps);
  return <ButtonGroupControl {...props} />;
}
