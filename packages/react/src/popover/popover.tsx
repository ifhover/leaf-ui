import {
  type CSSProperties,
  cloneElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
  version,
} from 'react';
import { tabbable } from 'tabbable';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { FloatingPanel, useFloatingDismiss } from '../shared/floating';

export interface PopoverProps {
  children: ReactElement<
    HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement>; disabled?: boolean }
  >;
  title?: ReactNode;
  content: ReactNode;
  trigger?: 'click' | 'hover';
  placement?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  enterDelay?: number;
  leaveDelay?: number;
  width?: number | string;
  maxWidth?: number | string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}
export function Popover({
  children,
  title,
  content,
  trigger: mode = 'click',
  placement = 'top',
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  autoFocus = true,
  enterDelay = 100,
  leaveDelay = 100,
  width = 'max-content',
  maxWidth = 320,
  className,
  style,
  'aria-label': label,
}: PopoverProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const inactive = disabled || children.props.disabled;
  const open = !inactive && (controlled ?? internal);
  const trigger = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const childRef = version.startsWith('18.')
    ? (children as typeof children & { ref?: Ref<HTMLElement> }).ref
    : children.props.ref;
  const ref = useMergedRef(trigger, childRef);
  const id = `${useId()}-popover`;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focused = useRef(false);
  const hovered = useRef(false);
  const change = (next: boolean) => {
    if (controlled === undefined) setInternal(next);
    if (next !== open) onOpenChange?.(next);
  };
  const dismiss = () => {
    clearTimeout(timer.current);
    change(false);
  };
  const schedule = (next: boolean, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => change(next), Math.max(0, delay));
  };
  useFloatingDismiss(open, dismiss, trigger, panel);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (inactive) {
      clearTimeout(timer.current);
      setInternal(false);
    }
  }, [inactive]);
  useEffect(() => {
    const node = panel.current;
    if (!open || mode !== 'click' || !node || !autoFocus) return;
    (tabbable(node)[0] ?? node).focus();
    return () => {
      if (node.contains(document.activeElement)) trigger.current?.focus();
    };
  }, [open, mode, autoFocus]);
  return (
    <>
      {cloneElement(children, {
        ref,
        'aria-haspopup': mode === 'click' ? 'dialog' : children.props['aria-haspopup'],
        'aria-expanded': mode === 'click' ? open : children.props['aria-expanded'],
        'aria-controls': open ? id : children.props['aria-controls'],
        'aria-describedby':
          mode === 'hover' && open
            ? [children.props['aria-describedby'], id].filter(Boolean).join(' ')
            : children.props['aria-describedby'],
        onClick: (event) => {
          children.props.onClick?.(event);
          if (mode === 'click' && !inactive && !event.defaultPrevented) change(!open);
        },
        onKeyDown: (event) => {
          children.props.onKeyDown?.(event);
          if (
            mode === 'click' &&
            !inactive &&
            !event.defaultPrevented &&
            event.key === 'ArrowDown'
          ) {
            event.preventDefault();
            change(true);
          }
        },
        onPointerEnter: (event) => {
          children.props.onPointerEnter?.(event);
          if (
            mode === 'hover' &&
            !inactive &&
            !event.defaultPrevented &&
            event.pointerType !== 'touch'
          ) {
            hovered.current = true;
            schedule(true, enterDelay);
          }
        },
        onPointerLeave: (event) => {
          children.props.onPointerLeave?.(event);
          hovered.current = false;
          if (mode === 'hover' && !focused.current) schedule(false, leaveDelay);
        },
        onFocus: (event) => {
          children.props.onFocus?.(event);
          if (mode === 'hover' && !inactive && !event.defaultPrevented) {
            focused.current = true;
            clearTimeout(timer.current);
            change(true);
          }
        },
        onBlur: (event) => {
          children.props.onBlur?.(event);
          focused.current = false;
          if (mode === 'hover' && !hovered.current && !panel.current?.contains(event.relatedTarget))
            schedule(false, leaveDelay);
        },
      })}
      <FloatingPanel
        open={open}
        triggerRef={trigger}
        panelRef={panel}
        id={id}
        role={mode === 'click' ? 'dialog' : 'tooltip'}
        tabIndex={-1}
        placement={placement}
        width={width}
        maxWidth={maxWidth}
        className={classes('leaf-floating', 'leaf-popover', className)}
        style={style}
        aria-label={label ?? (typeof title === 'string' ? title : undefined)}
        aria-labelledby={title != null ? `${id}-title` : undefined}
        onPointerEnter={() => {
          hovered.current = true;
          clearTimeout(timer.current);
        }}
        onPointerLeave={() => {
          hovered.current = false;
          if (
            mode === 'hover' &&
            !focused.current &&
            !panel.current?.contains(document.activeElement)
          )
            schedule(false, leaveDelay);
        }}
      >
        {title != null && (
          <div id={`${id}-title`} className="leaf-popover__title">
            {title}
          </div>
        )}
        <div className="leaf-popover__content">{content}</div>
      </FloatingPanel>
    </>
  );
}
