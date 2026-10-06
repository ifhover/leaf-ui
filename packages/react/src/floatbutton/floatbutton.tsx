import { Plus } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Button, type ButtonProps } from '../button';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import { useText } from '../shared/use-text';
import { Tooltip } from '../tooltip';
export interface FloatButtonProps extends ButtonProps {
  tooltip?: ReactNode;
  fixed?: boolean;
}
export function FloatButton({ tooltip, fixed = true, className, ...props }: FloatButtonProps) {
  const button = (
    <Button
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
  expandable?: boolean;
  icon?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
export function FloatButtonGroup({
  actions,
  expandable = true,
  icon,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  className,
}: FloatButtonGroupProps) {
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
      aria-label={t('快捷操作', 'Quick actions')}
      className={classes('leaf-float-group', className)}
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
                  <FloatButton
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
        <FloatButton
          fixed={false}
          aria-label={t('快捷操作', 'Quick actions')}
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
