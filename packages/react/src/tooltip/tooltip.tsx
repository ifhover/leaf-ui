import {
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
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { FloatingPanel, useFloatingDismiss } from '../shared/floating';

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement<
    HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement>; disabled?: boolean }
  >;
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
  enterDelay?: number;
  leaveDelay?: number;
  className?: string;
}
export function Tooltip({
  content,
  children,
  placement = 'top',
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  enterDelay = 100,
  leaveDelay = 100,
  className,
}: TooltipProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const inactive = disabled || children.props.disabled || content == null || content === '';
  const open = !inactive && (controlled ?? internal);
  const trigger = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const childRef = version.startsWith('18.')
    ? (children as typeof children & { ref?: Ref<HTMLElement> }).ref
    : children.props.ref;
  const ref = useMergedRef(trigger, childRef);
  const id = `${useId()}-tooltip`;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focused = useRef(false);
  const hovered = useRef(false);
  const change = (next: boolean) => {
    if (controlled === undefined) setInternal(next);
    if (next !== open) onOpenChange?.(next);
  };
  const schedule = (next: boolean, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => change(next), Math.max(0, delay));
  };
  const dismiss = () => {
    clearTimeout(timer.current);
    change(false);
  };
  useFloatingDismiss(open, dismiss, trigger, panel);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (inactive) {
      clearTimeout(timer.current);
      setInternal(false);
    }
  }, [inactive]);
  return (
    <>
      {cloneElement(children, {
        ref,
        'aria-describedby':
          [children.props['aria-describedby'], open ? id : undefined].filter(Boolean).join(' ') ||
          undefined,
        onPointerEnter: (event) => {
          children.props.onPointerEnter?.(event);
          if (!inactive && !event.defaultPrevented && event.pointerType !== 'touch') {
            hovered.current = true;
            schedule(true, enterDelay);
          }
        },
        onPointerLeave: (event) => {
          children.props.onPointerLeave?.(event);
          hovered.current = false;
          if (!focused.current) schedule(false, leaveDelay);
        },
        onFocus: (event) => {
          children.props.onFocus?.(event);
          if (!inactive && !event.defaultPrevented) {
            focused.current = true;
            clearTimeout(timer.current);
            change(true);
          }
        },
        onBlur: (event) => {
          children.props.onBlur?.(event);
          focused.current = false;
          if (!hovered.current) schedule(false, leaveDelay);
        },
      })}
      <FloatingPanel
        open={open}
        triggerRef={trigger}
        panelRef={panel}
        id={id}
        role="tooltip"
        placement={placement}
        className={classes('leaf-floating', 'leaf-tooltip', className)}
        onPointerEnter={() => {
          hovered.current = true;
          clearTimeout(timer.current);
        }}
        onPointerLeave={() => {
          hovered.current = false;
          if (!focused.current) schedule(false, leaveDelay);
        }}
      >
        {content}
      </FloatingPanel>
    </>
  );
}
