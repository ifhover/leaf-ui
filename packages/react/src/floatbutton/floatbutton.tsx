import { Plus } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import { ButtonControl, type ButtonProps } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import { useText } from '../shared/use-text';
import { TooltipControl as Tooltip } from '../tooltip/tooltip';

export type FloatButtonPlacement =
  | 'bottom-end'
  | 'bottom-start'
  | 'top-end'
  | 'top-start'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

export interface FloatButtonProps extends ButtonProps {
  tooltip?: ReactNode;
  fixed?: boolean;
  placement?: FloatButtonPlacement;
}
export function FloatButtonControl({
  tooltip,
  fixed = true,
  placement = 'bottom-end',
  className,
  size,
  children,
  ...props
}: FloatButtonProps) {
  const button = (
    <ButtonControl
      {...props}
      variant={props.variant ?? 'solid'}
      size={size ?? 'icon'}
      className={classes(
        'leaf-float-button',
        fixed && 'leaf-float-button--fixed',
        fixed && `leaf-float-button--${placement}`,
        className,
      )}
    >
      {children}
    </ButtonControl>
  );
  return tooltip ? <Tooltip content={tooltip}>{button}</Tooltip> : button;
}
export interface FloatButtonAction {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}
export interface FloatButtonGroupProps {
  actions: readonly FloatButtonAction[];
  fixed?: boolean;
  placement?: FloatButtonPlacement;
  expandable?: boolean;
  icon?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
export function FloatButtonGroup(rawProps: FloatButtonGroupProps) {
  const {
    actions,
    fixed = true,
    placement = 'bottom-end',
    expandable = true,
    icon,
    open: controlled,
    defaultOpen = false,
    onOpenChange,
    className,
  } = useComponentProps('FloatButtonGroup', rawProps);
  const t = useText();
  const actionsId = useId();
  const [internal, setInternal] = useState(defaultOpen),
    open = controlled ?? internal;
  const expanded = !expandable || open;
  const [visited, setVisited] = useState(expanded);
  if (expanded && !visited) setVisited(true);
  const root = useRef<HTMLDivElement>(null);
  const isTopPlacement = placement.startsWith('top-');
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled === undefined) setInternal(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open, setOpen]);
  return (
    // biome-ignore lint/a11y/useSemanticElements: 悬浮操作组属于工具操作分组而非表单字段集
    <div
      ref={root}
      role="group"
      aria-label={t('floatButton.quickActions')}
      className={classes(
        'leaf-float-group',
        isTopPlacement && 'leaf-float-group--top',
        fixed && 'leaf-float-group--fixed',
        fixed && `leaf-float-group--${placement}`,
        className,
      )}
      onBlur={(event) => {
        if (open && !root.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setOpen(false);
          root.current?.querySelector<HTMLButtonElement>('[aria-expanded]')?.focus();
          return;
        }
        if (!expanded) return;
        const buttons = Array.from(
          root.current?.querySelectorAll<HTMLButtonElement>(
            '.leaf-float-group__action button:not(:disabled)',
          ) ?? [],
        );
        if (!buttons.length) return;
        const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          if (currentIndex < 0) {
            const target = event.key === 'ArrowUp' ? buttons[buttons.length - 1] : buttons[0];
            target?.focus();
            return;
          }
          const delta = event.key === 'ArrowDown' ? 1 : -1;
          const next = (currentIndex + delta + buttons.length) % buttons.length;
          buttons[next]?.focus();
        } else if (event.key === 'Home') {
          event.preventDefault();
          buttons[0]?.focus();
        } else if (event.key === 'End') {
          event.preventDefault();
          buttons[buttons.length - 1]?.focus();
        }
      }}
    >
      <div
        id={actionsId}
        className="leaf-float-group__actions"
        data-open={expanded || undefined}
        aria-hidden={!expanded || undefined}
        {...inertProps(!expanded)}
      >
        <div className="leaf-float-group__actions-inner">
          <div className="leaf-float-group__actions-content">
            {visited &&
              actions.map((action, index) => (
                <div
                  key={action.key}
                  className="leaf-float-group__action"
                  style={
                    {
                      '--leaf-float-order': isTopPlacement ? index : actions.length - index - 1,
                    } as React.CSSProperties
                  }
                >
                  <FloatButtonControl
                    fixed={false}
                    tooltip={action.label}
                    aria-label={typeof action.label === 'string' ? action.label : action.key}
                    disabled={action.disabled}
                    variant="outline"
                    onClick={() => {
                      action.onClick?.();
                      if (expandable) setOpen(false);
                    }}
                  >
                    {action.icon}
                  </FloatButtonControl>
                </div>
              ))}
          </div>
        </div>
      </div>
      {expandable && (
        <FloatButtonControl
          fixed={false}
          aria-label={t('floatButton.quickActions')}
          aria-expanded={open}
          aria-controls={actionsId}
          onClick={() => setOpen(!open)}
        >
          <span className="leaf-float-group__trigger-icon" data-open={open || undefined}>
            {icon ?? <Plus size={20} />}
          </span>
        </FloatButtonControl>
      )}
    </div>
  );
}
export const FAB = FloatButton;

export function FloatButton(rawProps: FloatButtonProps) {
  const props = useComponentProps('FloatButton', rawProps);
  return <FloatButtonControl {...props} />;
}
