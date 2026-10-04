import { ArrowUp } from 'lucide-react';
import { type ButtonHTMLAttributes, useEffect, useState } from 'react';
import { Button } from '../button';
import { classes } from '../shared/classes';
import { useText } from '../shared/use-text';
export interface BackTopProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  target?: () => HTMLElement | Window | null;
  visibilityHeight?: number;
  behavior?: ScrollBehavior;
}
export function BackTop({
  target,
  visibilityHeight = 400,
  behavior = 'smooth',
  className,
  children,
  onClick,
  ...props
}: BackTopProps) {
  const t = useText();
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
    <Button
      {...props}
      className={classes('leaf-back-top', className)}
      aria-label={props['aria-label'] ?? t('回到顶部', 'Back to top')}
      data-visible={visible || undefined}
      tabIndex={visible ? props.tabIndex : -1}
      aria-hidden={!visible}
      startIcon={!children ? <ArrowUp /> : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        (target?.() ?? window).scrollTo({ top: 0, behavior: reduced ? 'auto' : behavior });
      }}
    >
      {children}
    </Button>
  );
}
