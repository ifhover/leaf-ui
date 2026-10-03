import { type RefObject, useEffect, useState } from 'react';

/** Keep a closing overlay mounted until its CSS transition or animation finishes. */
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
    const computed = getComputedStyle(node);
    const durations = [computed.animationDuration, computed.transitionDuration];
    const delays = [computed.animationDelay, computed.transitionDelay];
    const milliseconds = (value: string) => {
      const numeric = Number.parseFloat(value) || 0;
      return value.trim().endsWith('ms') ? numeric : numeric * 1000;
    };
    const duration = Math.max(
      0,
      ...durations.flatMap((list, index) => {
        const delay = (delays[index] || '0s').split(',').map(milliseconds);
        return (list || '0s')
          .split(',')
          .map((value, i) => milliseconds(value) + (delay[i % delay.length] ?? 0));
      }),
    );
    const finish = () => setPresent(false);
    const ended = (event: Event) => {
      if (event.target === node && (!('propertyName' in event) || event.propertyName === 'opacity'))
        finish();
    };
    const timer = setTimeout(finish, duration ? duration + 32 : 0);
    node.addEventListener('animationend', ended);
    node.addEventListener('transitionend', ended);
    return () => {
      clearTimeout(timer);
      node.removeEventListener('animationend', ended);
      node.removeEventListener('transitionend', ended);
    };
  }, [open, present, ref]);
  return present;
}
