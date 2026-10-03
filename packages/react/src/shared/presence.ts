import { type RefObject, useEffect, useState } from 'react';

/** Keep a closing overlay mounted until its CSS animation finishes. */
export function usePresence(open: boolean, ref: RefObject<HTMLElement | null>) {
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  useEffect(() => {
    if (open || !present) return;
    const node = ref.current;
    if (!node) {
      setPresent(false);
      return;
    }
    const duration = getComputedStyle(node)
      .animationDuration.split(',')
      .reduce((max, value) => {
        const numeric = Number.parseFloat(value) || 0;
        return Math.max(max, value.trim().endsWith('ms') ? numeric : numeric * 1000);
      }, 0);
    const finish = () => setPresent(false);
    const ended = (event: AnimationEvent) => {
      if (event.target === node) finish();
    };
    const timer = setTimeout(finish, duration ? duration + 32 : 0);
    node.addEventListener('animationend', ended);
    return () => {
      clearTimeout(timer);
      node.removeEventListener('animationend', ended);
    };
  }, [open, present, ref]);
  return present;
}
