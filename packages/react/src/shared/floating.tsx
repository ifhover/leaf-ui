import {
  autoUpdate,
  flip,
  offset,
  type Placement,
  shift,
  size,
  useFloating,
} from '@floating-ui/react-dom';
import {
  type CSSProperties,
  createContext,
  type HTMLAttributes,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { tabbable } from 'tabbable';
import { useLeafConfig } from '../config-provider/context';
import { ScrollbarControl } from '../scrollbar/scrollbar';
import type { LeafThemeStyle } from '../theme';
import { composedEventTarget, composedParent, deepActiveElement } from './dom';
import { assignRef } from './field';
import { inertProps } from './inert';
import { OverlayOwner } from './overlay-owner';
import { usePresence } from './presence';
import { readThemeVariables } from './theme-variables';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const PopupParent = createContext<string | undefined>(undefined);
const popupNodes = new Map<string, HTMLElement>();
const dismissStack: RefObject<HTMLElement | null>[] = [];
function insidePopup(target: Node, panel: HTMLElement | null) {
  if (!panel) return false;
  const boundary = panel.closest<HTMLElement>('[data-leaf-popup]') ?? panel;
  if (boundary.contains(target)) return true;
  let popup = target instanceof Element ? target.closest<HTMLElement>('[data-leaf-popup]') : null;
  const visited = new Set<string>();
  while (popup?.dataset.leafPopupParent) {
    const parent = popup.dataset.leafPopupParent;
    if (visited.has(parent)) break;
    visited.add(parent);
    popup = popupNodes.get(parent) ?? null;
    if (popup === boundary) return true;
  }
  return false;
}

/** Close disabled fields immediately and report each open-state change once. */
export function usePopupState(
  disabled?: boolean,
  onOpenChange?: (open: boolean) => void,
  controlledOpen?: boolean,
  defaultOpen = false,
) {
  const [internalOpen, setRequestedOpen] = useState(defaultOpen);
  const requestedOpen = controlledOpen ?? internalOpen;
  const requestedRef = useRef(requestedOpen);
  requestedRef.current = requestedOpen;
  const open = requestedOpen && !disabled;
  const setOpen = useCallback(
    (next: boolean) => {
      if (next === requestedRef.current || (next && disabled)) return;
      requestedRef.current = next;
      if (controlledOpen === undefined) setRequestedOpen(next);
      onOpenChange?.(next);
    },
    [disabled, onOpenChange, controlledOpen],
  );
  useEffect(() => {
    if (disabled && requestedOpen) setOpen(false);
  }, [disabled, requestedOpen, setOpen]);
  return [open, setOpen] as const;
}

export interface PopupOptions {
  popupPlacement?: Placement;
  popupClassName?: string;
  popupStyle?: CSSProperties;
  popupRender?: (content: React.ReactNode) => React.ReactNode;
  getPopupContainer?: () => Element | DocumentFragment;
}
interface FloatingPanelProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  matchWidth?: boolean;
  width?: CSSProperties['width'];
  minWidth?: CSSProperties['minWidth'] | 'trigger';
  maxWidth?: CSSProperties['maxWidth'];
  maxHeight?: CSSProperties['maxHeight'];
  placement?: Placement;
  sideFallback?: boolean;
  resetSurfaceGeometry?: boolean;
  container?: Element | DocumentFragment | (() => Element | DocumentFragment);
  render?: (content: React.ReactNode) => React.ReactNode;
  position?: { x: number; y: number };
}

/** Position a lazily mounted portal, preserving the trigger's scoped theme. */
export function FloatingPanel({
  open,
  triggerRef,
  panelRef,
  matchWidth,
  width,
  minWidth,
  maxWidth,
  maxHeight,
  placement = 'bottom-start',
  sideFallback = false,
  resetSurfaceGeometry = false,
  container,
  render,
  position,
  style,
  children,
  ...props
}: FloatingPanelProps) {
  const popupId = useId();
  const parentPopup = useContext(PopupParent);
  const config = useLeafConfig();
  const owner = useContext(OverlayOwner);
  const floatingRef = useRef<HTMLDivElement>(null);
  const present = usePresence(open, floatingRef);
  const [theme, setTheme] = useState<LeafThemeStyle>({});
  const [inheritedMotion, setInheritedMotion] = useState<string>();
  const openRef = useRef(open);
  openRef.current = open;
  const previousPosition = useRef<CSSProperties>({});
  const closingContent = useRef(children);
  const referenceElement = triggerRef.current;
  if (open) closingContent.current = children;
  const {
    refs,
    floatingStyles,
    isPositioned,
    update,
    placement: resolvedPlacement,
  } = useFloating({
    open,
    placement,
    strategy: 'fixed',
    // Keep viewport positioning outside the popup's local scale/translate motion.
    transform: false,
    whileElementsMounted: (reference, floating, update) =>
      autoUpdate(reference, floating, () => {
        if (openRef.current) update();
      }),
    middleware: [
      offset(6),
      flip({ padding: 12, fallbackAxisSideDirection: sideFallback ? 'end' : 'none' }),
      shift({ padding: 12 }),
      size(
        {
          padding: 12,
          apply({ availableHeight, availableWidth, rects, elements }) {
            if (!openRef.current) return;
            const length = (value: string | number) =>
              typeof value === 'number' ? `${value}px` : value;
            const widthMaximum = maxWidth ?? style?.maxWidth;
            const heightMaximum = maxHeight ?? style?.maxHeight;
            const viewportWidth = `${Math.max(0, availableWidth)}px`;
            const viewportHeight = `${Math.max(0, availableHeight)}px`;
            const widthLimit =
              widthMaximum === undefined
                ? viewportWidth
                : `min(${length(widthMaximum)}, ${viewportWidth})`;
            Object.assign(elements.floating.style, {
              maxHeight:
                heightMaximum === undefined
                  ? viewportHeight
                  : `min(${length(heightMaximum)}, ${viewportHeight})`,
              maxWidth: widthLimit,
              width: matchWidth
                ? `${Math.min(rects.reference.width, availableWidth)}px`
                : length(width ?? style?.width ?? ''),
              minWidth:
                minWidth === 'trigger'
                  ? `min(${rects.reference.width}px, ${widthLimit})`
                  : length(minWidth ?? style?.minWidth ?? ''),
            });
          },
        },
        [
          matchWidth,
          width,
          minWidth,
          maxWidth,
          maxHeight,
          style?.width,
          style?.minWidth,
          style?.maxWidth,
          style?.maxHeight,
        ],
      ),
    ],
  });
  if (open) previousPosition.current = floatingStyles;
  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) popupNodes.set(popupId, node);
      else popupNodes.delete(popupId);
      assignRef(floatingRef, node);
      refs.setFloating(node);
    },
    [refs.setFloating, popupId],
  );
  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => assignRef(panelRef, node),
    [panelRef],
  );

  useBrowserLayoutEffect(() => {
    const trigger = referenceElement ?? triggerRef.current;
    if (!trigger || !present) return;
    refs.setReference(
      position
        ? {
            getBoundingClientRect: () => ({
              x: position.x,
              y: position.y,
              top: position.y,
              bottom: position.y,
              left: position.x,
              right: position.x,
              width: 0,
              height: 0,
            }),
          }
        : trigger,
    );
    const syncTheme = () => {
      let motionAncestor: HTMLElement | null = trigger;
      while (motionAncestor && !motionAncestor.hasAttribute('data-leaf-motion'))
        motionAncestor = composedParent(motionAncestor);
      setInheritedMotion(motionAncestor?.getAttribute('data-leaf-motion') ?? undefined);
      const variables = readThemeVariables(trigger);
      if (resetSurfaceGeometry) {
        // Navigation triggers define their own inset surface. The popup solves
        // its geometry independently while keeping scoped theme paint/shadows.
        for (const key of Object.keys(variables)) {
          if (
            /^--leaf-surface-(?:radius$|border$|padding(?:-|$)|inner-)/.test(key) ||
            key === '--leaf-floating-option-radius'
          ) {
            delete variables[key as `--leaf-${string}`];
          }
        }
      }
      setTheme(variables);
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    let ancestor: HTMLElement | null = trigger;
    while (ancestor) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-leaf-theme', 'data-leaf-motion', 'dir'],
      });
      ancestor = composedParent(ancestor);
    }
    return () => observer.disconnect();
  }, [triggerRef, referenceElement, refs.setReference, present, position, resetSurfaceGeometry]);

  useBrowserLayoutEffect(() => {
    // A quick reopen can reuse the exit-presence node without remounting autoUpdate.
    if (open && present) void update();
  }, [open, present, update]);

  if (!present || typeof document === 'undefined') return null;
  const viewportProps: HTMLAttributes<HTMLDivElement> = {};
  const rootProps = { ...props };
  for (const key of Object.keys(rootProps)) {
    if (key === 'id' || key === 'role' || key === 'tabIndex' || key.startsWith('aria-')) {
      Object.assign(viewportProps, { [key]: rootProps[key as keyof typeof rootProps] });
      delete rootProps[key as keyof typeof rootProps];
    }
  }
  return createPortal(
    <PopupParent.Provider value={popupId}>
      <ScrollbarControl
        {...rootProps}
        ref={setViewportRef}
        rootRef={setPanelRef}
        viewportProps={viewportProps}
        viewportClassName="leaf-floating__viewport"
        role={props.role ?? 'presentation'}
        tabIndex={props.tabIndex ?? -1}
        scrollbarTabIndex={-1}
        data-leaf-owner={owner}
        data-leaf-popup={popupId}
        data-leaf-popup-parent={parentPopup}
        data-leaf-motion={config.theme.motion === false ? 'off' : inheritedMotion}
        data-side={resolvedPlacement.split('-')[0]}
        data-align={resolvedPlacement.split('-')[1] ?? 'center'}
        dir={props.dir ?? theme.direction ?? config.direction}
        lang={props.lang ?? config.locale}
        data-state={open ? 'open' : 'closing'}
        data-positioned={isPositioned || !open}
        aria-hidden={!open || undefined}
        {...inertProps(!open)}
        style={{ ...theme, ...style, ...(open ? floatingStyles : previousPosition.current) }}
      >
        {render
          ? render(open ? children : closingContent.current)
          : open
            ? children
            : closingContent.current}
      </ScrollbarControl>
    </PopupParent.Provider>,
    (typeof container === 'function' ? container() : container) ??
      config.getPopupContainer?.() ??
      document.body,
  );
}

/** Close a custom floating panel when focus leaves it or Escape is pressed. */
export function useFloatingDismiss(
  open: boolean,
  onClose: (reason?: 'escape' | 'outside' | 'focus' | 'tab') => void,
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  boundaryRef: RefObject<HTMLElement | null> = triggerRef,
) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) {
      return;
    }
    dismissStack.push(panelRef);

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.composedPath()[0] ?? event.target;
      if (!(target instanceof Node)) {
        return;
      }
      const label = target instanceof Element ? target.closest('label') : null;
      const labelledControl = label?.control;
      if (
        boundaryRef.current?.contains(target) ||
        insidePopup(target, panelRef.current) ||
        (labelledControl && boundaryRef.current?.contains(labelledControl))
      ) {
        return;
      }
      closeRef.current('outside');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || dismissStack.at(-1) !== panelRef) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current('escape');
        triggerRef.current?.focus();
      } else if (event.key === 'Tab') {
        const panel = panelRef.current;
        const trigger = triggerRef.current;
        const active = deepActiveElement();
        if (!panel || !trigger || !panel.contains(active)) return;
        const items = tabbable(panel, {
          getShadowRoot: (element) => element.shadowRoot ?? undefined,
        });
        const index = active instanceof HTMLElement ? items.indexOf(active) : -1;
        const leaving = event.shiftKey ? index <= 0 : index === items.length - 1;
        if (!leaving) return;
        event.preventDefault();
        closeRef.current('tab');
        if (event.shiftKey) trigger.focus();
        else {
          const pageItems = tabbable(document.body, {
            getShadowRoot: (element) => element.shadowRoot ?? undefined,
          }).filter((item) => !panel.contains(item));
          const triggerIndex = pageItems.indexOf(trigger);
          (pageItems[triggerIndex + 1] ?? trigger).focus();
        }
      }
    };

    const handleFocus = (event: FocusEvent) => {
      const target = composedEventTarget(event);
      if (
        target instanceof Node &&
        !boundaryRef.current?.contains(target) &&
        !insidePopup(target, panelRef.current)
      )
        closeRef.current('focus');
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocus);
    return () => {
      const index = dismissStack.indexOf(panelRef);
      if (index >= 0) dismissStack.splice(index, 1);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', handleFocus);
    };
  }, [open, panelRef, triggerRef, boundaryRef]);
}

/** Keep keyboard-highlighted options visible without animated scrolling. */
export function useActiveOption(
  open: boolean,
  optionId: string | undefined,
  panelRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open || !optionId) return;
    const root = panelRef?.current?.getRootNode();
    const scope = root instanceof ShadowRoot ? root : document;
    scope.getElementById(optionId)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, optionId, panelRef]);
}
