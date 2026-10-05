import { X } from 'lucide-react';
import { type ReactNode, type RefObject, useEffect, useId, useRef, useState } from 'react';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/context';
import { useDialog } from '../shared/dialog';
import { FloatingPanel, type PopupOptions } from '../shared/floating';
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
  children,
}: {
  panel: RefObject<HTMLDivElement | null>;
  owner: string;
  close: () => void;
  modal: boolean;
  children: ReactNode;
}) {
  useDialog(true, panel, owner, close, true, {}, true, modal);
  return children;
}
export function Tour({
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
}: TourProps) {
  const t = useText();
  const { messages } = useLeafConfig();
  const [index, setIndex] = useControllable(current, defaultCurrent, onChange);
  const step = steps[index];
  const target = useRef<HTMLElement | null>(null),
    panel = useRef<HTMLDivElement>(null);
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
    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, step, index, missingTarget, steps.length]);
  if (!open || !step) return null;
  const content = (
    <TourFocus panel={panel} owner={id} close={() => onClose?.()} modal={mask}>
      <div className="leaf-tour__header">
        <h3 id={`${id}-title`}>{step.title}</h3>
        <Button
          size="sm"
          variant="ghost"
          startIcon={<X size={16} />}
          aria-label={messages.close}
          onClick={onClose}
        />
      </div>
      <div className="leaf-tour__description">{step.description}</div>
      <div className="leaf-tour__footer">
        <span>
          {index + 1} / {steps.length}
        </span>
        {index > 0 && (
          <Button size="sm" variant="outline" onClick={() => setIndex(index - 1)}>
            {t('上一步', 'Previous')}
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => {
            if (index < steps.length - 1) setIndex(index + 1);
            else {
              onFinish?.();
              onClose?.();
            }
          }}
        >
          {index === steps.length - 1 ? t('完成', 'Finish') : t('下一步', 'Next')}
        </Button>
      </div>
    </TourFocus>
  );
  return (
    <ScopedPortal container={getPopupContainer}>
      {mask && (
        <div className="leaf-tour__mask" aria-hidden="true">
          {rect ? (
            <>
              <div style={{ inset: `0 0 auto 0`, height: Math.max(0, rect.top - padding) }} />
              <div style={{ inset: `${rect.bottom + padding}px 0 0 0` }} />
              <div
                style={{
                  top: rect.top - padding,
                  left: 0,
                  width: Math.max(0, rect.left - padding),
                  height: rect.height + 2 * padding,
                }}
              />
              <div
                style={{
                  top: rect.top - padding,
                  left: rect.right + padding,
                  right: 0,
                  height: rect.height + 2 * padding,
                }}
              />
            </>
          ) : (
            <div style={{ inset: 0 }} />
          )}
        </div>
      )}
      {rect ? (
        <FloatingPanel
          open
          triggerRef={target}
          panelRef={panel}
          placement={step.placement ?? 'bottom'}
          container={getPopupContainer}
          role="dialog"
          aria-modal={mask || undefined}
          aria-labelledby={`${id}-title`}
          className="leaf-floating leaf-tour"
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
        >
          {content}
        </div>
      )}
    </ScopedPortal>
  );
}
