import { type FieldsetHTMLAttributes, useMemo } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';
import type { ButtonVariant } from './button';
import { ButtonGroupContext } from './group-context';

export interface ButtonGroupProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** 统一设置组内按钮尺寸，并将 `size="icon"` 自动适配为对应图标方按钮尺寸。 */
  size?: ControlSize;
  /** 统一设置组内按钮外观；子按钮显式指定 `variant` 或 `danger` 时以子按钮为准。 */
  variant?: ButtonVariant;
  /** 禁用整组控件与组内操作。 */
  disabled?: boolean;
  /** 相邻按钮紧贴连接。 @default true */
  attached?: boolean;
}

export function ButtonGroupControl({
  size,
  variant,
  disabled,
  attached = true,
  children,
  className,
  ...props
}: ButtonGroupProps) {
  const contextValue = useMemo(() => ({ size, variant, disabled }), [size, variant, disabled]);

  return (
    <fieldset
      {...props}
      disabled={disabled}
      className={classes('leaf-button-group', attached && 'leaf-button-group--attached', className)}
    >
      <ButtonGroupContext.Provider value={contextValue}>{children}</ButtonGroupContext.Provider>
    </fieldset>
  );
}

export function ButtonGroup(rawProps: ButtonGroupProps) {
  const props = useComponentProps('ButtonGroup', rawProps);
  return <ButtonGroupControl {...props} />;
}
