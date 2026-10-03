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
  type HTMLAttributes,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { tabbable } from 'tabbable';
import type { LeafThemeStyle } from '../theme';
import { inertAttribute } from './inert';
import { OverlayOwner } from './overlay-owner';
import { usePresence } from './presence';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Close disabled fields immediately and report each open-state change once. */
export function usePopupState(disabled?: boolean, onOpenChange?: (open: boolean) => void) {
  const [requestedOpen, setRequestedOpen] = useState(false);
  const requestedRef = useRef(false);
  const open = requestedOpen && !disabled;
  const setOpen = useCallback(
    (next: boolean) => {
      if (next === requestedRef.current || (next && disabled)) return;
      requestedRef.current = next;
      setRequestedOpen(next);
      onOpenChange?.(next);
    },
    [disabled, onOpenChange],
  );
  useEffect(() => {
    if (disabled && requestedOpen) setOpen(false);
  }, [disabled, requestedOpen, setOpen]);
  return [open, setOpen] as const;
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
  style,
  children,
  ...props
}: FloatingPanelProps) {
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
      panelRef.current = node;
      refs.setFloating(node);
    },
    [panelRef, refs.setFloating],
  );

  useBrowserLayoutEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !present) return;
    refs.setReference(trigger);
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
        attributeFilter: ['class', 'style', 'data-leaf-theme'],
      });
      ancestor = ancestor.parentElement;
    }
    return () => observer.disconnect();
  }, [triggerRef, refs.setReference, present]);

  if (!present || typeof document === 'undefined') return null;
  return createPortal(
    <div
      {...props}
      ref={setPanelRef}
      data-leaf-owner={owner}
      data-state={open ? 'open' : 'closing'}
      data-positioned={isPositioned || !open}
      aria-hidden={!open || undefined}
      inert={inertAttribute(!open)}
      style={{ ...theme, ...style, ...(open ? floatingStyles : previousPosition.current) }}
    >
      {open ? children : closingContent.current}
    </div>,
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
  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (boundaryRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      onClose('outside');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose('escape');
        triggerRef.current?.focus();
      } else if (event.key === 'Tab') {
        const panel = panelRef.current;
        const trigger = triggerRef.current;
        if (!panel || !trigger || !panel.contains(document.activeElement)) return;
        const items = tabbable(panel);
        const index =
          document.activeElement instanceof HTMLElement
            ? items.indexOf(document.activeElement)
            : -1;
        const leaving = event.shiftKey ? index <= 0 : index === items.length - 1;
        if (!leaving) return;
        event.preventDefault();
        onClose('tab');
        if (event.shiftKey) trigger.focus();
        else {
          const pageItems = tabbable(document.body).filter((item) => !panel.contains(item));
          const triggerIndex = pageItems.indexOf(trigger);
          (pageItems[triggerIndex + 1] ?? trigger).focus();
        }
      }
    };

    const handleFocus = (event: FocusEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !boundaryRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      )
        onClose('focus');
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocus);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', handleFocus);
    };
  }, [open, onClose, panelRef, triggerRef, boundaryRef]);
}

/** Keep keyboard-highlighted options visible without animated scrolling. */
export function useActiveOption(open: boolean, optionId: string | undefined) {
  useEffect(() => {
    if (open && optionId) document.getElementById(optionId)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, optionId]);
}
