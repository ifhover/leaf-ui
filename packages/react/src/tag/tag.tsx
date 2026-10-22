import { X } from 'lucide-react';
import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { defaultColors, mixColors, primaryForeground, readableColor } from '../colors';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { composedParent } from '../shared/dom';
import { inertProps } from '../shared/inert';
import { usePresence } from '../shared/presence';
import type { ControlSize } from '../shared/types';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  color?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'error'
    | 'info'
    | (string & {});
  variant?: 'soft' | 'solid';
  size?: ControlSize;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}
const presets = ['default', 'primary', 'success', 'warning', 'danger', 'error', 'info'];
export function Tag(rawProps: TagProps) {
  const {
    color = 'primary',
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
  const custom = !presets.includes(color);
  const presetColor = color === 'default' ? 'primary' : color === 'error' ? 'danger' : color;
  const appearance = theme.appearance ?? 'light';
  const surface = theme.tokens?.surfaceColor ?? defaultColors[appearance].surface;
  const mutedSurface =
    theme.tokens?.mutedSurfaceColor ?? defaultColors[appearance]['surface-muted'];
  const customSurface = custom ? mixColors(color, surface, 8) : undefined;
  const customVariables = custom
    ? {
        '--leaf-tag-color': color,
        '--leaf-tag-color-alpha-10': mixColors(color, 'transparent', 10),
        '--leaf-tag-color-surface-8': customSurface,
        '--leaf-tag-ink': readableColor(
          color,
          [surface, mutedSurface, customSurface ?? surface],
          4.5,
          appearance,
        ),
        '--leaf-tag-solid-ink': primaryForeground(color) ?? defaultColors[appearance]['on-primary'],
      }
    : {};
  useEffect(() => {
    const node = root.current;
    if (!node || !custom) return;
    let canvas: CanvasRenderingContext2D | null | undefined;
    const sync = () => {
      const probe = document.createElement('span');
      probe.hidden = true;
      node.append(probe);
      const resolve = (value: string) => {
        probe.style.color = '';
        probe.style.color = value;
        let concrete = getComputedStyle(probe).color;
        if (
          /^(?:color|oklch|oklab|lab|lch)\(/i.test(concrete) &&
          globalThis.CSS?.supports?.('color', concrete)
        ) {
          canvas ??= document
            .createElement('canvas')
            .getContext('2d', { willReadFrequently: true });
          if (canvas) {
            canvas.clearRect(0, 0, 1, 1);
            canvas.fillStyle = concrete;
            canvas.fillRect(0, 0, 1, 1);
            const [r, g, b, a = 255] = canvas.getImageData(0, 0, 1, 1).data;
            concrete = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
          }
        }
        return concrete;
      };
      const concrete = resolve(color);
      const nodeStyle = getComputedStyle(node);
      // Theme surfaces can themselves be CSS expressions; contrast needs their rendered sRGB.
      const background = resolve(
        nodeStyle.getPropertyValue('--leaf-color-surface').trim() || surface,
      );
      const muted = resolve(
        nodeStyle.getPropertyValue('--leaf-color-surface-muted').trim() || mutedSurface,
      );
      probe.remove();
      const softSurface = mixColors(concrete, background, 8);
      for (const [key, value] of [
        ['--leaf-tag-color-alpha-10', mixColors(concrete, 'transparent', 10)],
        ['--leaf-tag-color-surface-8', softSurface],
        [
          '--leaf-tag-ink',
          readableColor(concrete, [background, muted, softSurface ?? background], 4.5, appearance),
        ],
        ['--leaf-tag-solid-ink', primaryForeground(concrete)],
      ] as const) {
        if (
          !value ||
          (style && Object.hasOwn(style, key)) ||
          node.style.getPropertyValue(key) === value
        )
          continue;
        node.style.setProperty(key, value);
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
  }, [appearance, color, custom, mutedSurface, style, surface]);
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
