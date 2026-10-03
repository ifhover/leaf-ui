import { ChevronRight } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useId, useRef, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';
import { inertAttribute } from '../shared/inert';
import type { ControlSize } from '../shared/types';

export interface CollapseItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  extra?: ReactNode;
}
export interface CollapseProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'defaultValue'> {
  items: readonly CollapseItem[];
  activeKey?: string | readonly string[];
  defaultActiveKey?: string | readonly string[];
  onChange?: (keys: string[]) => void;
  accordion?: boolean;
  bordered?: boolean;
  size?: ControlSize;
  destroyInactive?: boolean;
}
const keys = (value: string | readonly string[]) => (typeof value === 'string' ? [value] : value);
export function Collapse({
  items,
  activeKey,
  defaultActiveKey = [],
  onChange,
  accordion = false,
  bordered = true,
  size = 'md',
  destroyInactive = false,
  className,
  'aria-label': label,
  ...props
}: CollapseProps) {
  const { messages } = useLeafConfig();
  const [internal, setInternal] = useState(() => keys(defaultActiveKey));
  const requested = keys(activeKey ?? internal);
  const current = accordion ? requested.slice(0, 1) : requested;
  const [visited, setVisited] = useState<readonly string[]>(current);
  const newlyOpened = current.filter((key) => !visited.includes(key));
  if (newlyOpened.length) setVisited([...visited, ...newlyOpened]);
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const toggle = (item: CollapseItem) => {
    if (item.disabled) return;
    const next = current.includes(item.key)
      ? current.filter((key) => key !== item.key)
      : accordion
        ? [item.key]
        : [...current, item.key];
    if (activeKey === undefined) setInternal(next);
    onChange?.([...next]);
  };
  return (
    <section
      {...props}
      ref={root}
      aria-label={label ?? messages.collapse}
      className={classes(
        'leaf-collapse',
        `leaf-collapse--${size}`,
        bordered && 'leaf-collapse--bordered',
        className,
      )}
    >
      {items.map((item, index) => {
        const open = current.includes(item.key);
        return (
          <div className="leaf-collapse__item" key={item.key} data-open={open || undefined}>
            <div className="leaf-collapse__header">
              <button
                id={`${id}-trigger-${index}`}
                type="button"
                className="leaf-collapse__trigger"
                aria-expanded={open}
                aria-controls={`${id}-panel-${index}`}
                disabled={item.disabled}
                onClick={() => toggle(item)}
                onKeyDown={(event) => {
                  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
                  event.preventDefault();
                  const buttons = [
                    ...(root.current?.querySelectorAll<HTMLButtonElement>(
                      '.leaf-collapse__trigger:not(:disabled)',
                    ) ?? []),
                  ];
                  const position = buttons.indexOf(event.currentTarget);
                  const next =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? buttons.length - 1
                        : (position + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) %
                          buttons.length;
                  buttons[next]?.focus();
                }}
              >
                <ChevronRight size={16} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
              {item.extra != null && <div className="leaf-collapse__extra">{item.extra}</div>}
            </div>
            <section
              id={`${id}-panel-${index}`}
              aria-labelledby={`${id}-trigger-${index}`}
              aria-hidden={!open || undefined}
              inert={inertAttribute(!open)}
              className="leaf-collapse__panel"
            >
              <div className="leaf-collapse__inner">
                <div className="leaf-collapse__body">
                  {(open || (!destroyInactive && visited.includes(item.key))) && item.children}
                </div>
              </div>
            </section>
          </div>
        );
      })}
    </section>
  );
}
