import { X } from 'lucide-react';
import { type ReactNode, type RefObject, useEffect, useId, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { type OverlayLayer, useDialog, useOverlayLayer } from '../shared/dialog';
import { FloatingPanel, type PopupOptions } from '../shared/floating';
import { inertProps } from '../shared/inert';
import { useContentTransition, usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';
import { useControllable } from '../shared/use-controllable';
import { useText } from '../shared/use-text';
export interface TourStep {
  key?: string;
  title: ReactNode;
  description?: ReactNode;
  target?: string | (() => HTMLElement | null);
  placement?: PopupOptions['popupPlacement'];
}
export interface TourProps {
  open: boolean;
  steps: readonly TourStep[];
  current?: number;
  defaultCurrent?: number;
  onChange?: (current: number) => void;
  onClose?: () => void;
  onFinish?: () => void;
  missingTarget?: 'center' | 'skip' | 'close';
  mask?: boolean;
  padding?: number;
  getPopupContainer?: PopupOptions['getPopupContainer'];
}
function TourFocus({
  panel,
  owner,
  close,
  modal,
  open,
  children,
}: {
  panel: RefObject<HTMLDivElement | null>;
  owner: string;
  close: () => void;
  modal: boolean;
  open: boolean;
  children: ReactNode;
}) {
  useDialog(open, panel, owner, close, true, {}, true, modal);
  return children;
}
function TourStage({
  present,
  active,
  children,
}: {
  present: boolean;
  active: boolean;
  children: (layer: OverlayLayer) => ReactNode;
}) {
  // 在 ScopedPortal 就绪后分配叠层，确保与 Modal/Drawer 同轮挂载时叠层顺序一致。
  const layer = useOverlayLayer(present, active);
  return children(layer);
}
export function Tour(rawProps: TourProps) {
  const {
    open,
    steps,
    current,
    defaultCurrent = 0,
    onChange,
    onClose,
    onFinish,
    missingTarget = 'center',
    mask = true,
    padding = 8,
    getPopupContainer,
  } = useComponentProps('Tour', rawProps);
  const t = useText();
  const { messages } = useLeafConfig();
  const [index, setIndex] = useControllable(current, defaultCurrent, onChange);
  const latestStep = useRef(steps[index]);
  if (open && steps[index]) latestStep.current = steps[index];
  const step = open ? steps[index] : latestStep.current;
  const target = useRef<HTMLElement | null>(null),
    panel = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const contentView = useRef<HTMLDivElement>(null);
  const present = usePresence(open && Boolean(step), root);
  useContentTransition(contentView, `${open}:${index}`);
  const id = useId();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const callbacks = useRef({ setIndex, onClose });
  callbacks.current = { setIndex, onClose };
  useEffect(() => {
    if (!open || !step) return;
    let frame = 0;
    const node =
      typeof step.target === 'string'
        ? document.querySelector<HTMLElement>(step.target)
        : step.target?.();
    target.current = node ?? null;
    if (!node) {
      setRect(null);
      if (missingTarget === 'skip' && index < steps.length - 1)
        callbacks.current.setIndex(index + 1);
      else if (missingTarget === 'close' || missingTarget === 'skip') callbacks.current.onClose?.();
      return;
    }
    node.scrollIntoView?.({ block: 'center', behavior: 'instant' });
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRect(node.getBoundingClientRect()));
    };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : undefined;
    observer?.observe(node);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, step, index, missingTarget, steps.length]);
  if (!present || !step) return null;
  const content = (
    <TourFocus panel={panel} owner={id} close={() => onClose?.()} modal={mask} open={open}>
      <div ref={contentView} className="leaf-tour__content">
        <div className="leaf-tour__header">
          <h3 id={`${id}-title`}>{step.title}</h3>
          <ButtonControl
            size="icon-sm"
            variant="text"
            aria-label={messages.common.close}
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </ButtonControl>
        </div>
        <div className="leaf-tour__description">{step.description}</div>
        <div className="leaf-tour__footer">
          <span>
            {index + 1} / {steps.length}
          </span>
          {index > 0 && (
            <ButtonControl size="sm" variant="outline" onClick={() => setIndex(index - 1)}>
              {t('tour.previous')}
            </ButtonControl>
          )}
          <ButtonControl
            size="sm"
            variant="solid"
            onClick={() => {
              if (index < steps.length - 1) setIndex(index + 1);
              else {
                onFinish?.();
                onClose?.();
              }
            }}
          >
            {index === steps.length - 1 ? t('tour.finish') : t('tour.next')}
          </ButtonControl>
        </div>
      </div>
    </TourFocus>
  );
  return (
    <ScopedPortal container={getPopupContainer}>
      <TourStage present={present} active={open && Boolean(step)}>
        {(layer) => (
          <div
            ref={root}
            className="leaf-tour-root"
            style={layer.maskStyle}
            data-state={open ? 'open' : 'closing'}
            aria-hidden={!open || undefined}
            {...inertProps(!open)}
          >
            {mask && (
              <div className="leaf-tour__mask" aria-hidden="true">
                {rect ? (
                  (() => {
                    const viewportWidth = typeof window === 'undefined' ? 0 : window.innerWidth;
                    const viewportHeight = typeof window === 'undefined' ? 0 : window.innerHeight;
                    const holeTop = Math.max(0, rect.top - padding);
                    const holeBottom = Math.min(viewportHeight, rect.bottom + padding);
                    const holeLeft = Math.max(0, rect.left - padding);
                    const holeRight = Math.min(viewportWidth, rect.right + padding);
                    const holeWidth = Math.max(0, holeRight - holeLeft);
                    const holeHeight = Math.max(0, holeBottom - holeTop);
                    return (
                      <>
                        <div style={{ inset: '0 0 auto 0', height: holeTop }} />
                        <div style={{ inset: `${holeBottom}px 0 0 0` }} />
                        <div
                          style={{
                            top: holeTop,
                            left: 0,
                            width: holeLeft,
                            height: holeHeight,
                          }}
                        />
                        <div
                          style={{
                            top: holeTop,
                            left: holeRight,
                            right: 0,
                            height: holeHeight,
                          }}
                        />
                        <div
                          className="leaf-tour__spotlight"
                          style={{
                            top: holeTop,
                            left: holeLeft,
                            width: holeWidth,
                            height: holeHeight,
                          }}
                        />
                      </>
                    );
                  })()
                ) : (
                  <div style={{ inset: 0 }} />
                )}
              </div>
            )}
            {rect ? (
              <FloatingPanel
                open={open}
                triggerRef={target}
                panelRef={panel}
                placement={step.placement ?? 'bottom'}
                container={() => root.current ?? document.body}
                role="dialog"
                aria-modal={mask || undefined}
                aria-labelledby={`${id}-title`}
                className="leaf-floating leaf-tour"
                style={layer.floatingStyle}
                tabIndex={-1}
              >
                {content}
              </FloatingPanel>
            ) : (
              <div
                ref={panel}
                role="dialog"
                aria-modal={mask || undefined}
                aria-labelledby={`${id}-title`}
                tabIndex={-1}
                className="leaf-tour leaf-tour--center"
                style={layer.floatingStyle}
              >
                {content}
              </div>
            )}
          </div>
        )}
      </TourStage>
    </ScopedPortal>
  );
}
