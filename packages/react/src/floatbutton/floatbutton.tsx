import { Plus } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { ButtonControl, type ButtonProps } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import { useText } from '../shared/use-text';
import { TooltipControl as Tooltip } from '../tooltip/tooltip';
export interface FloatButtonProps extends ButtonProps {
  tooltip?: ReactNode;
  fixed?: boolean;
}
export function FloatButtonControl({
  tooltip,
  fixed = true,
  className,
  ...props
}: FloatButtonProps) {
  const button = (
    <ButtonControl
      {...props}
      className={classes('leaf-float-button', fixed && 'leaf-float-button--fixed', className)}
    />
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
    expandable = true,
    icon,
    open: controlled,
    defaultOpen = false,
    onOpenChange,
    className,
  } = useComponentProps('FloatButtonGroup', rawProps);
  const t = useText();
  const [internal, setInternal] = useState(defaultOpen),
    open = controlled ?? internal;
  const expanded = !expandable || open;
  const [visited, setVisited] = useState(expanded);
  if (expanded && !visited) setVisited(true);
  const root = useRef<HTMLFieldSetElement>(null);
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
    <fieldset
      ref={root}
      aria-label={t('floatButton.quickActions')}
      className={classes('leaf-float-group', fixed && 'leaf-float-group--fixed', className)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setOpen(false);
          root.current?.querySelector<HTMLButtonElement>('[aria-expanded]')?.focus();
        }
      }}
    >
      <div
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
                    { '--leaf-float-order': actions.length - index - 1 } as React.CSSProperties
                  }
                >
                  <FloatButtonControl
                    fixed={false}
                    tooltip={action.label}
                    aria-label={typeof action.label === 'string' ? action.label : action.key}
                    startIcon={action.icon}
                    disabled={action.disabled}
                    variant="outline"
                    onClick={() => {
                      action.onClick?.();
                      if (expandable) setOpen(false);
                    }}
                  />
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
          startIcon={
            <span className="leaf-float-group__trigger-icon" data-open={open || undefined}>
              {icon ?? <Plus size={20} />}
            </span>
          }
          onClick={() => setOpen(!open)}
        />
      )}
    </fieldset>
  );
}
export const FAB = FloatButton;

export function FloatButton(rawProps: FloatButtonProps) {
  const props = useComponentProps('FloatButton', rawProps);
  return <FloatButtonControl {...props} />;
}
