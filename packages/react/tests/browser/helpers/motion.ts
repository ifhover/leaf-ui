import type { Locator } from '@playwright/test';

export async function settleAnimations(locator: Locator) {
  await locator.evaluate(async (node) => {
    const animations = node
      .getAnimations({ subtree: true })
      .filter(
        (animation) =>
          animation.playState === 'running' &&
          animation.effect?.getTiming().iterations !== Infinity,
      );
    // Cancellation also settles a transition; infinite loading spinners are ignored.
    await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));
  });
}
