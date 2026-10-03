import { X } from 'lucide-react';
import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';

export interface TabItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  closable?: boolean;
}
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: readonly TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  type?: 'line' | 'card';
  placement?: 'top' | 'left';
  size?: ControlSize;
  activationMode?: 'automatic' | 'manual';
  destroyInactive?: boolean;
  extra?: ReactNode;
  onClose?: (key: string, event: MouseEvent<HTMLButtonElement>) => void;
}
export function Tabs({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  type = 'line',
  placement = 'top',
  size = 'md',
  activationMode = 'automatic',
  destroyInactive = false,
  extra,
  onClose,
  className,
  'aria-label': label,
  ...props
}: TabsProps) {
  const { messages } = useLeafConfig();
  const enabled = items.filter((item) => !item.disabled);
  const [internal, setInternal] = useState(defaultActiveKey ?? enabled[0]?.key);
  const requested = activeKey ?? internal;
  const selected = enabled.find((item) => item.key === requested)?.key ?? enabled[0]?.key;
  const [focused, setFocused] = useState<string>();
  const focusKey = enabled.some((item) => item.key === focused) ? focused : selected;
  const [visited, setVisited] = useState<readonly string[]>(selected ? [selected] : []);
  if (selected && !visited.includes(selected)) setVisited([...visited, selected]);
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const choose = (key: string) => {
    if (!enabled.some((item) => item.key === key)) return;
    if (activeKey === undefined) setInternal(key);
    if (key !== selected) onChange?.(key);
  };
  return (
    <div
      {...props}
      className={classes(
        'leaf-tabs',
        `leaf-tabs--${type}`,
        `leaf-tabs--${placement}`,
        `leaf-tabs--${size}`,
        className,
      )}
    >
      <div className="leaf-tabs__header">
        <div
          ref={list}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(undefined);
          }}
          role="tablist"
          aria-label={label}
          aria-orientation={placement === 'left' ? 'vertical' : 'horizontal'}
          className="leaf-tabs__list"
        >
          {items.map((item, index) => (
            <div
              className="leaf-tabs__entry"
              key={item.key}
              data-active={item.key === selected || undefined}
            >
              <button
                id={`${id}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={item.key === selected}
                aria-controls={`${id}-panel-${index}`}
                disabled={item.disabled}
                tabIndex={item.key === focusKey ? 0 : -1}
                className="leaf-tabs__tab"
                onFocus={() => setFocused(item.key)}
                onClick={() => choose(item.key)}
                onKeyDown={(event) => {
                  let next: string | undefined;
                  const position = enabled.findIndex((entry) => entry.key === item.key);
                  const forward = placement === 'left' ? 'ArrowDown' : 'ArrowRight';
                  const backward = placement === 'left' ? 'ArrowUp' : 'ArrowLeft';
                  if (event.key === forward) next = enabled[(position + 1) % enabled.length]?.key;
                  else if (event.key === backward)
                    next = enabled[(position - 1 + enabled.length) % enabled.length]?.key;
                  else if (event.key === 'Home') next = enabled[0]?.key;
                  else if (event.key === 'End') next = enabled.at(-1)?.key;
                  if (next !== undefined) {
                    event.preventDefault();
                    setFocused(next);
                    const nextIndex = items.findIndex((entry) => entry.key === next);
                    list.current
                      ?.querySelector<HTMLButtonElement>(`[id='${id}-tab-${nextIndex}']`)
                      ?.focus();
                    if (activationMode === 'automatic') choose(next);
                  }
                }}
              >
                {item.icon && <span aria-hidden="true">{item.icon}</span>}
                {item.label}
              </button>
              {item.closable && (
                <button
                  type="button"
                  className="leaf-tabs__close"
                  disabled={item.disabled || !onClose}
                  aria-label={`${messages.closeTab} ${typeof item.label === 'string' ? item.label : item.key}`}
                  onClick={(event) => {
                    onClose?.(item.key, event);
                    if (event.defaultPrevented) return;
                    const position = enabled.findIndex((entry) => entry.key === item.key);
                    const next =
                      item.key === selected
                        ? (enabled[position + 1] ?? enabled[position - 1])
                        : enabled.find((entry) => entry.key === selected);
                    if (next) {
                      if (item.key === selected) choose(next.key);
                      const nextIndex = items.findIndex((entry) => entry.key === next.key);
                      list.current
                        ?.querySelector<HTMLButtonElement>(`[id='${id}-tab-${nextIndex}']`)
                        ?.focus();
                    }
                  }}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        {extra && <div className="leaf-tabs__extra">{extra}</div>}
      </div>
      <div className="leaf-tabs__panels">
        {items.map((item, index) => (
          <div
            key={item.key}
            id={`${id}-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${index}`}
            hidden={item.key !== selected}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: Tabpanels are keyboard focus destinations in the ARIA tabs pattern.
            tabIndex={0}
            className="leaf-tabs__panel"
          >
            {(item.key === selected || (!destroyInactive && visited.includes(item.key))) &&
              item.children}
          </div>
        ))}
      </div>
    </div>
  );
}
