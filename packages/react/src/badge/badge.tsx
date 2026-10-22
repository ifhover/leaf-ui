import { type HTMLAttributes, type ReactNode, useEffect, useRef } from 'react';
import { primaryForeground } from '../colors';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { composedParent } from '../shared/dom';
import { type FeedbackTypeInput, normalizeFeedbackType } from '../shared/feedback';
import { useContentTransition } from '../shared/presence';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count?: number | string;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  status?: FeedbackTypeInput | 'default';
  text?: ReactNode;
  color?: string;
}

function resolveColorExpression(node: HTMLElement, value: string) {
  const probe = document.createElement('span');
  probe.hidden = true;
  probe.style.color = '';
  probe.style.color = value;
  if (!probe.style.color) return undefined;
  node.append(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  if (!computed) return undefined;
  if (
    /^(?:color|oklch|oklab|lab|lch)\(/iu.test(computed) &&
    globalThis.CSS?.supports?.('color', computed)
  ) {
    const canvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    if (!canvas) return computed;
    canvas.clearRect(0, 0, 1, 1);
    canvas.fillStyle = computed;
    canvas.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha = 255] = canvas.getImageData(0, 0, 1, 1).data;
    return `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
  }
  return computed;
}

export function Badge(rawProps: BadgeProps) {
  const {
    count,
    max = 99,
    showZero = false,
    dot = false,
    status,
    text,
    color,
    children,
    className,
    style,
    ...props
  } = useComponentProps('Badge', rawProps);
  const normalizedStatus = status && status !== 'default' ? normalizeFeedbackType(status) : status;
  const number = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLSpanElement>(null);
  const resolvedForeground = useRef(false);
  const hasCount = count !== undefined && count !== '' && (count !== 0 || showZero);
  const visible = dot || status || hasCount;
  const display = typeof count === 'number' && count > max ? `${max}+` : count;
  const synchronousForeground = color ? primaryForeground(color) : undefined;
  const explicitForeground =
    style != null &&
    Object.hasOwn(style, '--leaf-badge-on-color') &&
    (style as Record<string, unknown>)['--leaf-badge-on-color'] !== undefined;
  useContentTransition(number, display ?? '');
  useEffect(() => {
    const node = root.current;
    if (!node || explicitForeground) return;
    if (!color) {
      if (resolvedForeground.current) {
        node.style.removeProperty('--leaf-badge-on-color');
        resolvedForeground.current = false;
      }
      return;
    }
    if (synchronousForeground) {
      resolvedForeground.current = false;
      return;
    }
    const sync = () => {
      const concrete = resolveColorExpression(node, color);
      const foreground = concrete ? primaryForeground(concrete) : undefined;
      if (!foreground) {
        if (resolvedForeground.current) {
          node.style.removeProperty('--leaf-badge-on-color');
          resolvedForeground.current = false;
        }
        return;
      }
      if (node.style.getPropertyValue('--leaf-badge-on-color') !== foreground)
        node.style.setProperty('--leaf-badge-on-color', foreground);
      resolvedForeground.current = true;
    };
    sync();
    const observer = new MutationObserver(sync);
    let ancestor: HTMLElement | null = node;
    while (ancestor) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ['style', 'class', 'data-leaf-theme'],
      });
      ancestor = composedParent(ancestor);
    }
    return () => observer.disconnect();
  }, [color, explicitForeground, synchronousForeground]);
  return (
    <span
      {...props}
      ref={root}
      className={classes('leaf-badge', children != null && 'leaf-badge--attached', className)}
      data-status={normalizedStatus}
      style={{
        ...(color ? { '--leaf-badge-color': color } : {}),
        ...(synchronousForeground ? { '--leaf-badge-on-color': synchronousForeground } : {}),
        ...style,
      }}
    >
      {children}
      {visible && (
        <span
          className={classes(
            'leaf-badge__indicator',
            (dot || normalizedStatus) && 'leaf-badge__indicator--dot',
          )}
          role="status"
          aria-label={
            props['aria-label'] ??
            (typeof text === 'string'
              ? text
              : !dot && count !== undefined
                ? String(count)
                : undefined)
          }
          title={count === undefined ? undefined : String(count)}
        >
          {!dot && !normalizedStatus && (
            <span ref={number} className="leaf-badge__count">
              {display}
            </span>
          )}
        </span>
      )}
      {text != null && <span className="leaf-badge__text">{text}</span>}
    </span>
  );
}
