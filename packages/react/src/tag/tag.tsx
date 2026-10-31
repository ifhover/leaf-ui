import { X } from 'lucide-react';
import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react';
import { resolveColorRoles } from '../colors';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import { usePresence } from '../shared/presence';
import type { ControlSize } from '../shared/types';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info' | (string & {});
  variant?: 'soft' | 'solid';
  size?: ControlSize;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}
const presets = ['default', 'success', 'warning', 'danger', 'info'];
function tagVariables(
  appearance: 'light' | 'dark',
  seed: string,
  background?: string,
  muted?: string,
  neutral?: string,
) {
  const { values } = resolveColorRoles(
    appearance,
    {
      primary: seed,
      ...(background ? { surface: background } : {}),
      ...(muted ? { 'surface-muted': muted } : {}),
      ...(neutral ? { neutral } : {}),
    },
    ['primary'],
  );
  // Retain local styling hooks, but derive their values from the shared roles.
  return {
    '--leaf-tag-color': seed,
    '--leaf-tag-color-alpha-10': values['--leaf-color-primary-soft-hover'],
    '--leaf-tag-color-surface-8': values['--leaf-color-primary-soft'],
    '--leaf-tag-ink': values['--leaf-color-primary-ink'],
    '--leaf-tag-solid-foreground': 'var(--leaf-color-on-primary)',
  };
}
export function Tag(rawProps: TagProps) {
  const {
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
  } = useComponentProps('Tag', rawProps);
  const { messages, theme } = useLeafConfig();
  const [closed, setClosed] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const present = usePresence(!closed, root);
  // Keep removed semantic aliases predictable while the public presets stay neutral plus four statuses.
  const normalizedColor = color === 'primary' ? 'default' : color === 'error' ? 'danger' : color;
  const custom = !presets.includes(normalizedColor);
  const presetColor = normalizedColor;
  const appearance = theme.appearance ?? 'light';
  const surface = theme.tokens?.surfaceColor;
  const mutedSurface = theme.tokens?.mutedSurfaceColor;
  const neutral = theme.tokens?.neutralColor;
  const customVariables = useMemo(
    () => (custom ? tagVariables(appearance, normalizedColor, surface, mutedSurface, neutral) : {}),
    [appearance, custom, mutedSurface, neutral, normalizedColor, surface],
  );
  if (!present) return null;
  return (
    <span
      {...props}
      {...inertProps(closed)}
      ref={root}
      data-state={closed ? 'closing' : undefined}
      aria-hidden={closed || props['aria-hidden']}
      className={classes('leaf-tag', `leaf-tag--${variant}`, `leaf-tag--${size}`, className)}
      data-color={custom ? undefined : presetColor}
      style={{ ...customVariables, ...style }}
    >
      {icon != null && icon !== false ? (
        <span className="leaf-tag__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          className="leaf-tag__close"
          aria-label={messages.common.remove}
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
