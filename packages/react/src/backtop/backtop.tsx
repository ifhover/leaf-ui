import { ArrowUp } from 'lucide-react';
import { type ButtonHTMLAttributes, useEffect, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
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
    const element = target?.() ?? window;
    const update = () =>
      setVisible(
        (element instanceof Window ? element.scrollY : element.scrollTop) >= visibilityHeight,
      );
    update();
    element.addEventListener('scroll', update, { passive: true });
    return () => element.removeEventListener('scroll', update);
  }, [target, visibilityHeight]);
  return (
    <ButtonControl
      {...props}
      className={classes('leaf-back-top', className)}
      aria-label={props['aria-label'] ?? t('backTop.backToTop')}
      data-visible={visible || undefined}
      tabIndex={visible ? props.tabIndex : -1}
      aria-hidden={!visible}
      startIcon={!children ? <ArrowUp /> : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        (target?.() ?? window).scrollTo({ top: 0, behavior: motion ? behavior : 'auto' });
      }}
    >
      {children}
    </ButtonControl>
  );
}
