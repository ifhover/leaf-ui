import { X } from 'lucide-react';
import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { defaultColors, mixColors } from '../colors';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { composedParent } from '../shared/dom';
import { inertProps } from '../shared/inert';
import { usePresence } from '../shared/presence';
import type { ControlSize } from '../shared/types';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | (string & {});
  variant?: 'soft' | 'outline' | 'solid';
  size?: ControlSize;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}
const presets = ['default', 'primary', 'success', 'warning', 'error', 'info'];
export function Tag({
  color = 'default',
  variant = 'soft',
  size = 'md',
  icon,
  closable = false,
  onClose,
  className,
  style,
  children,
  ...props
}: TagProps) {
  const { messages, theme } = useLeafConfig();
  const [closed, setClosed] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const present = usePresence(!closed, root);
  const custom = !presets.includes(color);
  const surface = theme.tokens?.surfaceColor ?? defaultColors[theme.appearance ?? 'light'].surface;
  const customVariables = custom
    ? {
        '--leaf-tag-color': color,
        '--leaf-tag-color-alpha-22': mixColors(color, 'transparent', 22),
        '--leaf-tag-color-alpha-10': mixColors(color, 'transparent', 10),
        '--leaf-tag-color-surface-8': mixColors(color, surface, 8),
      }
    : {};
  useEffect(() => {
    const node = root.current;
    if (!node || !custom) return;
    const sync = () => {
      const probe = document.createElement('span');
      probe.style.color = color;
      probe.hidden = true;
      node.append(probe);
      const concrete = getComputedStyle(probe).color;
      const background =
        getComputedStyle(node).getPropertyValue('--leaf-color-surface').trim() || surface;
      probe.remove();
      for (const [suffix, target, weight] of [
        ['alpha-22', 'transparent', 22],
        ['alpha-10', 'transparent', 10],
        ['surface-8', background, 8],
      ] as const) {
        const value = mixColors(concrete, target, weight);
        const key = `--leaf-tag-color-${suffix}`;
        if (value && node.style.getPropertyValue(key) !== value) node.style.setProperty(key, value);
      }
    };
    sync();
    const observer = new MutationObserver(sync);
    let ancestor: HTMLElement | null = node;
    while (ancestor) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-leaf-theme'],
      });
      ancestor = composedParent(ancestor);
    }
    return () => observer.disconnect();
  }, [color, custom, surface]);
  if (!present) return null;
  return (
    <span
      {...props}
      {...inertProps(closed)}
      ref={root}
      data-state={closed ? 'closing' : undefined}
      aria-hidden={closed || props['aria-hidden']}
      className={classes('leaf-tag', `leaf-tag--${variant}`, `leaf-tag--${size}`, className)}
      data-color={presets.includes(color) ? color : undefined}
      style={{ ...customVariables, ...style }}
    >
      {icon && (
        <span className="leaf-tag__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          className="leaf-tag__close"
          aria-label={messages.remove}
          onClick={(event) => {
            onClose?.(event);
            if (!event.defaultPrevented) {
              const node = root.current;
              if (node) {
                node.style.setProperty(
                  '--leaf-tag-width',
                  `${node.getBoundingClientRect().width}px`,
                );
                void node.offsetWidth;
                if (node.contains(document.activeElement)) {
                  const buttons = Array.from(
                    node.parentElement?.querySelectorAll<HTMLButtonElement>('.leaf-tag__close') ??
                      [],
                  );
                  const index = buttons.indexOf(event.currentTarget);
                  (buttons[index + 1] ?? buttons[index - 1])?.focus();
                }
              }
              setClosed(true);
            }
          }}
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
