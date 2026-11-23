import { LoaderCircle } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  Fragment,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useComponentDefaults, useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';
import { useButtonGroup } from './group-context';

export type ButtonVariant = 'solid' | 'outline' | 'text' | 'link' | 'danger';
export type ButtonSize = ControlSize | 'icon' | 'icon-sm' | 'icon-lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default 'outline' */
  variant?: ButtonVariant;
  /** 按钮尺寸或纯图标正方形尺寸。 @default 'md' (32px) */
  size?: ButtonSize;
  /** @deprecated 改用 `variant="danger"`，传入时统一回退为危险按钮外观。 */
  danger?: boolean;
  /** Displays a spinner and prevents repeated interactions. */
  loading?: boolean;
  /** Expands the button to the width of its container. */
  fullWidth?: boolean;
}

/** 将控件尺寸映射为对应的正方形纯图标按钮尺寸。 */
export function toIconButtonSize(size: ButtonSize = 'md'): 'icon-sm' | 'icon' | 'icon-lg' {
  if (size === 'sm' || size === 'icon-sm') return 'icon-sm';
  if (size === 'lg' || size === 'icon-lg') return 'icon-lg';
  return 'icon';
}

type ButtonContentNode = string | number | ReactElement;

/** 展平 Fragment 与数组并忽略纯空白文本，用于识别按钮内容首尾是否为非图标文本。 */
function collectButtonContentNodes(
  children: ReactNode,
  result: ButtonContentNode[] = [],
): ButtonContentNode[] {
  if (children === null || children === undefined || typeof children === 'boolean') return result;
  if (typeof children === 'string') {
    if (children.trim() !== '') result.push(children);
    return result;
  }
  if (typeof children === 'number') {
    result.push(children);
    return result;
  }
  if (Array.isArray(children)) {
    for (const child of children) collectButtonContentNodes(child, result);
    return result;
  }
  if (isValidElement<{ children?: ReactNode }>(children)) {
    if (children.type === Fragment) {
      collectButtonContentNodes(children.props.children, result);
    } else {
      result.push(children);
    }
  }
  return result;
}

function resolveTextBoundaries(children: ReactNode) {
  const nodes = collectButtonContentNodes(children);
  if (!nodes.some((node) => isValidElement(node))) {
    return { leadingText: false, trailingText: false };
  }
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  return {
    leadingText: typeof first === 'string' || typeof first === 'number',
    trailingText: typeof last === 'string' || typeof last === 'number',
  };
}

/** Internal rendering primitive; its owner resolves defaults and interaction constraints. */
export const ButtonControl = forwardRef<HTMLButtonElement, ButtonProps>(function ButtonControl(
  rawProps: ButtonProps,
  ref,
) {
  const {
    variant = 'outline',
    size = 'md',
    danger = false,
    loading = false,
    fullWidth = false,
    disabled = false,
    type = 'button',
    className,
    children,
    onClick,
    'aria-busy': ariaBusy,
    ...props
  } = rawProps;
  // 危险按钮仅保留单一外观，兼容期传入 danger 时统一回退到 variant="danger"。
  const resolvedVariant: ButtonVariant = danger ? 'danger' : variant;
  const isIconSize = size === 'icon' || size === 'icon-sm' || size === 'icon-lg';
  const { leadingText, trailingText } =
    !isIconSize && resolvedVariant !== 'link'
      ? resolveTextBoundaries(children)
      : { leadingText: false, trailingText: false };

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={classes(
        'leaf-button',
        `leaf-button--${resolvedVariant}`,
        `leaf-button--${size}`,
        fullWidth && 'leaf-button--full-width',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || ariaBusy}
      data-loading={loading ? '' : undefined}
      data-leading-text={leadingText ? '' : undefined}
      data-trailing-text={trailingText ? '' : undefined}
      onClick={onClick}
    >
      {loading && (
        <LoaderCircle
          className="leaf-button__spinner"
          data-icon="inline-start"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
});
ButtonControl.displayName = 'ButtonControl';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(rawProps, ref) {
  const group = useButtonGroup();
  const buttonDefaults = useComponentDefaults('Button');
  const configProps = useComponentProps('Button', rawProps);
  // 组内 size="icon" 自动匹配分组（或区域默认）的常规控件尺寸，确保与相邻按钮等高对齐。
  const resolvedSize =
    group && rawProps.size === 'icon'
      ? toIconButtonSize(group.size ?? buttonDefaults?.size)
      : (rawProps.size ?? group?.size ?? configProps.size);
  const resolvedVariant = rawProps.variant ?? group?.variant ?? configProps.variant;
  const resolvedDanger =
    rawProps.danger ?? (rawProps.variant || group?.variant ? false : configProps.danger);
  const resolvedDisabled = group?.disabled
    ? true
    : (rawProps.disabled ?? group?.disabled ?? configProps.disabled);
  const props: ButtonProps = {
    ...configProps,
    ...(resolvedSize !== undefined ? { size: resolvedSize } : undefined),
    ...(resolvedVariant !== undefined ? { variant: resolvedVariant } : undefined),
    ...(resolvedDanger !== undefined ? { danger: resolvedDanger } : undefined),
    ...(resolvedDisabled !== undefined ? { disabled: resolvedDisabled } : undefined),
  };
  return <ButtonControl {...props} ref={ref} />;
});
Button.displayName = 'Button';
