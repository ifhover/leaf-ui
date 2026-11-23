import { ArrowUp } from 'lucide-react';
import { type ButtonHTMLAttributes, useEffect, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import { useMotionEnabled } from '../shared/motion';
import { useText } from '../shared/use-text';
export interface BackTopProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  target?: () => HTMLElement | Window | null;
  visibilityHeight?: number;
  behavior?: ScrollBehavior;
}
export function BackTop(rawProps: BackTopProps) {
  const {
    target,
    visibilityHeight = 400,
    behavior = 'smooth',
    className,
    children,
    onClick,
    ...props
  } = useComponentProps('BackTop', rawProps);
  const t = useText();
  const motion = useMotionEnabled();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let frame = 0;
    let retry = 0;
    let attached: HTMLElement | Window | null = null;
    const update = () => {
      const current = attached ?? window;
      setVisible(
        (current instanceof Window ? current.scrollY : current.scrollTop) >= visibilityHeight,
      );
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    const bind = () => {
      const next = target ? target() : window;
      if (!next) return false;
      attached = next;
      update();
      next.addEventListener('scroll', schedule, { passive: true });
      return true;
    };
    // 目标容器可能在兄弟节点之后挂载，首帧未找到时顺延一帧尝试绑定。
    if (!bind()) {
      retry = requestAnimationFrame(() => {
        retry = 0;
        bind();
      });
    }
    return () => {
      if (retry) cancelAnimationFrame(retry);
      if (frame) cancelAnimationFrame(frame);
      attached?.removeEventListener('scroll', schedule);
    };
  }, [target, visibilityHeight]);
  const hasContent =
    children !== undefined && children !== null && children !== false && children !== '';
  return (
    <ButtonControl
      {...props}
      variant="solid"
      size={hasContent ? 'md' : 'icon'}
      className={classes('leaf-back-top', hasContent && 'leaf-back-top--labeled', className)}
      aria-label={props['aria-label'] ?? t('backTop.backToTop')}
      data-visible={visible || undefined}
      tabIndex={visible ? props.tabIndex : -1}
      aria-hidden={!visible || undefined}
      {...inertProps(!visible)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        (target?.() ?? window).scrollTo({ top: 0, behavior: motion ? behavior : 'auto' });
      }}
    >
      {hasContent ? children : <ArrowUp aria-hidden="true" />}
    </ButtonControl>
  );
}
