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
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { FloatingPanel, type PopupOptions, useHoverFocus } from '../shared/floating';

export interface TooltipProps extends PopupOptions {
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
  arrow?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  enterDelay?: number;
  leaveDelay?: number;
  className?: string;
}
export function TooltipControl({
  content,
  children,
  placement = 'top',
  arrow = true,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  enterDelay = 100,
  leaveDelay = 100,
  className,
  popupPlacement,
  popupClassName,
  popupStyle,
  popupRender,
  getPopupContainer,
}: TooltipProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const inactive = disabled || children.props.disabled || content == null || content === '';
  const open = !inactive && (controlled ?? internal);
  const openRef = useRef(open);
  openRef.current = open;
  const trigger = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const childRef = version.startsWith('18.')
    ? (children as typeof children & { ref?: Ref<HTMLElement> }).ref
    : children.props.ref;
  const ref = useMergedRef(trigger, childRef);
  const id = `${useId()}-tooltip`;
  const change = (next: boolean) => {
    if (inactive && next) return;
    if (next === openRef.current) return;
    if (controlled === undefined) {
      openRef.current = next;
      setInternal(next);
    }
    onOpenChange?.(next);
  };
  const hoverFocus = useHoverFocus({
    inactive,
    open,
    change,
    enterDelay,
    leaveDelay,
    triggerRef: trigger,
    panelRef: panel,
  });
  useEffect(() => {
    if (inactive) setInternal(false);
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
          hoverFocus.onTriggerPointerEnter(event);
        },
        onPointerLeave: (event) => {
          children.props.onPointerLeave?.(event);
          hoverFocus.onTriggerPointerLeave();
        },
        onPointerDown: (event) => {
          children.props.onPointerDown?.(event);
          hoverFocus.onTriggerPointerDown(event);
        },
        onFocus: (event) => {
          children.props.onFocus?.(event);
          hoverFocus.onTriggerFocus(event);
        },
        onBlur: (event) => {
          children.props.onBlur?.(event);
          hoverFocus.onTriggerBlur(event);
        },
      })}
      <FloatingPanel
        open={open}
        render={popupRender}
        container={getPopupContainer}
        triggerRef={trigger}
        panelRef={panel}
        id={id}
        role="tooltip"
        data-arrow={arrow ? 'true' : 'false'}
        placement={popupPlacement ?? placement}
        className={classes('leaf-floating', 'leaf-tooltip', className, popupClassName)}
        style={popupStyle}
        onPointerEnter={hoverFocus.onPanelPointerEnter}
        onPointerLeave={hoverFocus.onPanelPointerLeave}
      >
        {content}
      </FloatingPanel>
    </>
  );
}

export function Tooltip(rawProps: TooltipProps) {
  const props = useComponentProps('Tooltip', rawProps);
  return <TooltipControl {...props} />;
}
