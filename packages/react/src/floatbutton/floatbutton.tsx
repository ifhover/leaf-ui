import { Plus, X } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Button, type ButtonProps } from '../button';
import { classes } from '../shared/classes';
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
      {(!expandable || open) && (
        <div className="leaf-float-group__actions">
          {actions.map((action) => (
            <FloatButton
              fixed={false}
              key={action.key}
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
          ))}
        </div>
      )}
      {expandable && (
        <FloatButton
          fixed={false}
          aria-label={t('快捷操作', 'Quick actions')}
          aria-expanded={open}
          startIcon={open ? <X size={20} /> : (icon ?? <Plus size={20} />)}
          onClick={() => setOpen(!open)}
        />
      )}
    </fieldset>
  );
}
export const FAB = FloatButton;
