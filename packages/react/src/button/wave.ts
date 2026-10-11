import { useEffect, useRef } from 'react';
import { motionDuration, useMotionEnabled } from '../shared/motion';

// Sparse property keyframes give the shadow a 400ms expansion and opacity a
// 2s decay (at the default 200ms regional duration), in one browser animation.
// No size/color measurement, React root, observer or per-frame JS is needed.
const waveFrames: Keyframe[] = [
  {
    boxShadow: '0 0 0 0 currentColor',
    opacity: 0.2,
    offset: 0,
    easing: 'cubic-bezier(0.08, 0.82, 0.17, 1)',
  },
  { boxShadow: '0 0 0 6px currentColor', offset: 0.2 },
  { boxShadow: '0 0 0 6px currentColor', opacity: 0, offset: 1 },
];

/** One transient wave per button; never animate the button or its contents. */
export function useButtonWave(inactive: boolean) {
  const enabled = useMotionEnabled();
  const wave = useRef<HTMLSpanElement>(null);
  const running = useRef<Animation | undefined>(undefined);

  useEffect(() => {
    if (!enabled || inactive) {
      running.current?.cancel();
      running.current = undefined;
    }
    return () => {
      running.current?.cancel();
      running.current = undefined;
    };
  }, [enabled, inactive]);

  function play(button: HTMLButtonElement) {
    const element = wave.current;
    if (
      !enabled ||
      inactive ||
      !element?.animate ||
      button.matches(':disabled') ||
      button.getAttribute('aria-disabled') === 'true' ||
      window.matchMedia?.('(forced-colors: active)').matches
    ) {
      return;
    }
    // Shadows are ink overflow: expanding them cannot create a
    // scrollbar in a full-width button's surrounding scroll container.
    running.current?.cancel();
    running.current = undefined;
    let animation: Animation | undefined;
    try {
      const duration = motionDuration(element, 10);
      if (!duration) return;
      animation = element.animate(waveFrames, { duration });
    } catch {
      // An unsupported animation must never prevent
      // the consumer's click handler, preventDefault or native submission.
      return;
    }
    running.current = animation;
    if (animation) {
      animation.onfinish = () => {
        if (running.current === animation) running.current = undefined;
      };
    }
  }

  return { wave, play };
}
