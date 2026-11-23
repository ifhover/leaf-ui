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
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { FloatingPanel, type PopupOptions, useHoverFocus } from '../shared/floating';
import { useNaturalHeightTransition } from '../shared/presence';

export interface PopoverProps extends PopupOptions {
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
  arrow?: boolean;
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
export function PopoverControl({
  children,
  title,
  content,
  trigger: mode = 'click',
  placement = 'top',
  arrow = true,
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
  popupPlacement,
  popupClassName,
  popupStyle,
  popupRender,
  getPopupContainer,
  style,
  'aria-label': label,
}: PopoverProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const inactive = Boolean(disabled || children.props.disabled);
  const open = !inactive && (controlled ?? internal);
  const openRef = useRef(open);
  openRef.current = open;
  const trigger = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  useNaturalHeightTransition(panel, body, open);
  const childRef = version.startsWith('18.')
    ? (children as typeof children & { ref?: Ref<HTMLElement> }).ref
    : children.props.ref;
  const ref = useMergedRef(trigger, childRef);
  const id = `${useId()}-popover`;
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
    enabled: mode === 'hover',
    inactive,
    open,
    change,
    enterDelay,
    leaveDelay,
    triggerRef: trigger,
    panelRef: panel,
    keepPanelFocus: true,
  });
  useEffect(() => {
    if (inactive) setInternal(false);
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
        role={mode === 'click' ? 'dialog' : 'tooltip'}
        tabIndex={-1}
        arrow={arrow}
        placement={popupPlacement ?? placement}
        width={width}
        maxWidth={maxWidth}
        className={classes('leaf-floating', 'leaf-popover', className, popupClassName)}
        style={{ ...style, ...popupStyle }}
        aria-label={label ?? (typeof title === 'string' ? title : undefined)}
        aria-labelledby={title != null ? `${id}-title` : undefined}
        onPointerEnter={hoverFocus.onPanelPointerEnter}
        onPointerLeave={hoverFocus.onPanelPointerLeave}
      >
        {title != null && (
          <div id={`${id}-title`} className="leaf-popover__title">
            {title}
          </div>
        )}
        <div ref={body} className="leaf-popover__content">
          {content}
        </div>
      </FloatingPanel>
    </>
  );
}

export function Popover(rawProps: PopoverProps) {
  const props = useComponentProps('Popover', rawProps);
  return <PopoverControl {...props} />;
}
