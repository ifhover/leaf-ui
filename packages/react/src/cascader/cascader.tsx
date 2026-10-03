import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef, useEffect, useId, useRef, useState } from 'react';
import { classes } from '../shared/classes';
import { ClearButton } from '../shared/clear-button';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import { FloatingPanel, useFloatingDismiss, usePopupState } from '../shared/floating';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface CascaderOption {
  value: string;
  label: string;
  disabled?: boolean;
  children?: readonly CascaderOption[];
}

export interface CascaderProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'children'
  > {
  options: readonly CascaderOption[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  size?: ControlSize;
  status?: ControlStatus;
  placeholder?: string;
  name?: string;
  required?: boolean;
  allowClear?: boolean;
  onChange?: (value: string[], selectedOptions: CascaderOption[]) => void;
  onOpenChange?: (open: boolean) => void;
}

const emptyPath: readonly string[] = [];
function resolvePath(options: readonly CascaderOption[], values: readonly string[]) {
  const path: CascaderOption[] = [];
  let level = options;
  for (const value of values) {
    const option = level.find((item) => item.value === value);
    if (!option) break;
    path.push(option);
    level = option.children ?? [];
  }
  return path;
}

export const Cascader = forwardRef<HTMLButtonElement, CascaderProps>(function Cascader(
  {
    options,
    value,
    defaultValue = emptyPath,
    size = 'md',
    status,
    placeholder = '请选择',
    name,
    form,
    required,
    allowClear = true,
    disabled,
    className,
    style,
    onChange,
    onOpenChange,
    onClick,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-invalid': ariaInvalid,
    ...props
  },
  forwardedRef,
) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ref = useMergedRef(triggerRef, forwardedRef);
  const panelId = `${useId()}-cascader`;
  const [selectedValue, setSelectedValue] = useFieldValue(value, defaultValue, triggerRef, form);
  const [draft, setDraft] = useState<readonly string[]>(selectedValue);
  const [open, setOpen] = usePopupState(disabled, onOpenChange);
  const [focusLevel, setFocusLevel] = useState<number | null>(null);
  const selectedOptions = resolvePath(options, selectedValue);
  const draftOptions = resolvePath(options, draft);
  const levels: (readonly CascaderOption[])[] = [options];
  for (const option of draftOptions) if (option.children?.length) levels.push(option.children);
  const close = () => {
    setOpen(false);
  };
  useFloatingDismiss(open, close, triggerRef, panelRef);
  useEffect(() => {
    if (open && focusLevel !== null) {
      const column = panelRef.current?.querySelector<HTMLElement>(`[data-level='${focusLevel}']`);
      const option =
        column?.querySelector<HTMLButtonElement>('button[aria-selected="true"]:not(:disabled)') ??
        column?.querySelector<HTMLButtonElement>('button:not(:disabled)');
      option?.focus();
      option?.scrollIntoView?.({ block: 'nearest' });
      setFocusLevel(null);
    }
  }, [open, focusLevel]);

  const openPanel = () => {
    if (disabled) return;
    setDraft(selectedValue);
    setFocusLevel(0);
    setOpen(true);
  };
  const choose = (option: CascaderOption, level: number) => {
    if (option.disabled) return;
    const next = [...draft.slice(0, level), option.value];
    setDraft(next);
    if (!option.children?.length) {
      setSelectedValue(next);
      onChange?.(next, resolvePath(options, next));
      close();
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      className={classes('leaf-cascader', `leaf-cascader--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
      data-open={open ? '' : undefined}
      data-clearable={allowClear && selectedValue.length && !disabled ? '' : undefined}
    >
      <button
        {...props}
        ref={ref}
        type="button"
        form={form}
        className="leaf-cascader__trigger"
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={ariaLabel}
        aria-invalid={status === 'error' ? true : ariaInvalid}
        aria-required={required || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            if (open) close();
            else openPanel();
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!open) openPanel();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        }}
      >
        <span
          className={classes(
            'leaf-cascader__value',
            !selectedOptions.length && 'leaf-cascader__placeholder',
          )}
        >
          {selectedOptions.length
            ? selectedOptions.map((option) => option.label).join(' / ')
            : placeholder}
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {allowClear && selectedValue.length > 0 && !disabled && (
        <ClearButton
          label="清除级联选择"
          beforeArrow
          onClear={() => {
            setSelectedValue([]);
            setDraft([]);
            onChange?.([], []);
            close();
            triggerRef.current?.focus();
          }}
        />
      )}
      <FormValue
        name={name}
        form={form}
        required={required}
        disabled={disabled}
        value={selectedValue.length ? JSON.stringify(selectedValue) : ''}
        triggerRef={triggerRef}
      />
      {open && (
        <FloatingPanel
          triggerRef={triggerRef}
          panelRef={panelRef}
          id={panelId}
          className="leaf-floating leaf-cascader__panel"
          role="dialog"
          aria-label="级联选择"
        >
          <div className="leaf-cascader__columns">
            {levels.map((level, depth) => (
              <div
                key={depth === 0 ? 'root' : draft[depth - 1]}
                className="leaf-cascader__column"
                data-level={depth}
                role="listbox"
                aria-label={`第 ${depth + 1} 级`}
              >
                {level.length ? (
                  level.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      className="leaf-floating__option"
                      aria-selected={draft[depth] === option.value}
                      disabled={option.disabled}
                      tabIndex={
                        option.value ===
                        (draft[depth] ?? level.find((item) => !item.disabled)?.value)
                          ? 0
                          : -1
                      }
                      onClick={() => {
                        choose(option, depth);
                        if (option.children?.length) setFocusLevel(depth + 1);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'ArrowRight' && option.children?.length) {
                          event.preventDefault();
                          choose(option, depth);
                          setFocusLevel(depth + 1);
                        } else if (event.key === 'ArrowLeft' && depth > 0) {
                          event.preventDefault();
                          setFocusLevel(depth - 1);
                        } else if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
                          event.preventDefault();
                          const items = Array.from(
                            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                              'button:not(:disabled)',
                            ) ?? [],
                          );
                          const index = items.indexOf(event.currentTarget);
                          const next =
                            event.key === 'Home'
                              ? 0
                              : event.key === 'End'
                                ? items.length - 1
                                : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) %
                                  items.length;
                          items[next]?.focus();
                          items[next]?.scrollIntoView?.({ block: 'nearest' });
                        }
                      }}
                    >
                      <span>{option.label}</span>
                      {option.children?.length ? (
                        <ChevronRight size={14} aria-hidden="true" />
                      ) : (
                        draft[depth] === option.value && <Check size={14} aria-hidden="true" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="leaf-floating__empty">暂无选项</div>
                )}
              </div>
            ))}
          </div>
        </FloatingPanel>
      )}
    </div>
  );
});
Cascader.displayName = 'Cascader';
