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
import type { LeafThemeStyle } from '../theme';
import { composedEventTarget, composedParent, deepActiveElement } from './dom';
import { assignRef } from './field';
import { inertProps } from './inert';
import { OverlayOwner } from './overlay-owner';
import { usePresence } from './presence';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const PopupParent = createContext<string | undefined>(undefined);
const popupNodes = new Map<string, HTMLElement>();
const dismissStack: RefObject<HTMLElement | null>[] = [];
function insidePopup(target: Node, panel: HTMLElement | null) {
  if (!panel) return false;
  if (panel.contains(target)) return true;
  let popup = target instanceof Element ? target.closest<HTMLElement>('[data-leaf-popup]') : null;
  const visited = new Set<string>();
  while (popup?.dataset.leafPopupParent) {
    const parent = popup.dataset.leafPopupParent;
    if (visited.has(parent)) break;
    visited.add(parent);
    popup = popupNodes.get(parent) ?? null;
    if (popup === panel) return true;
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
  const present = usePresence(open, panelRef);
  const [theme, setTheme] = useState<LeafThemeStyle>({});
  const openRef = useRef(open);
  openRef.current = open;
  const previousPosition = useRef<CSSProperties>({});
  const closingContent = useRef(children);
  if (open) closingContent.current = children;
  const { refs, floatingStyles, isPositioned } = useFloating({
    open,
    placement,
    strategy: 'fixed',
    whileElementsMounted: (reference, floating, update) =>
      autoUpdate(reference, floating, () => {
        if (openRef.current) update();
      }),
    middleware: [
      offset(6),
      flip({ padding: 12 }),
      shift({ padding: 12 }),
      size({
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
      }),
    ],
  });
  if (open) previousPosition.current = floatingStyles;
  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) popupNodes.set(popupId, node);
      else popupNodes.delete(popupId);
      assignRef(panelRef, node);
      refs.setFloating(node);
    },
    [panelRef, refs.setFloating, popupId],
  );

  useBrowserLayoutEffect(() => {
    const trigger = triggerRef.current;
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
      const computed = getComputedStyle(trigger);
      const variables: LeafThemeStyle = {
        colorScheme: computed.colorScheme,
        direction: computed.direction as CSSProperties['direction'],
      };
      for (let i = 0; i < computed.length; i += 1) {
        const key = computed.item(i);
        if (key.startsWith('--leaf-'))
          variables[key as `--leaf-${string}`] = computed.getPropertyValue(key);
      }
      setTheme(variables);
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    let ancestor: HTMLElement | null = trigger;
    while (ancestor) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-leaf-theme', 'dir'],
      });
      ancestor = composedParent(ancestor);
    }
    return () => observer.disconnect();
  }, [triggerRef, refs.setReference, present, position]);

  if (!present || typeof document === 'undefined') return null;
  return createPortal(
    <PopupParent.Provider value={popupId}>
      <div
        {...props}
        ref={setPanelRef}
        data-leaf-owner={owner}
        data-leaf-popup={popupId}
        data-leaf-popup-parent={parentPopup}
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
      </div>
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
      if (boundaryRef.current?.contains(target) || insidePopup(target, panelRef.current)) {
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
