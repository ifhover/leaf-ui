import { describe, expect, it } from 'vitest';
import { fitRatio, initialTransform, transformStyle, wrapIndex, zoomAt } from './geometry';

describe('preview geometry', () => {
  it('fits inside the available canvas without enlarging small originals', () => {
    expect(fitRatio(1000, 500, 500, 500)).toBe(0.45);
    expect(fitRatio(100, 50, 500, 500)).toBe(1);
    expect(fitRatio(0, 0, 500, 500)).toBe(1);
  });
  it('keeps the focal pixel fixed through zoom, rotation and flips', () => {
    const before = { ...initialTransform(0.5), x: 20, y: 10, rotate: 90, flipX: -1 };
    const after = zoomAt(before, 1, 100, 70);
    expect(after).toEqual({ ...before, ratio: 1, x: -60, y: -50 });
    expect((100 - before.x) / before.ratio).toBe((100 - after.x) / after.ratio);
    expect((70 - before.y) / before.ratio).toBe((70 - after.y) / after.ratio);
  });
  it('clamps zoom independently of the initial fitted size', () => {
    expect(zoomAt(initialTransform(), -1).ratio).toBe(0.01);
    expect(zoomAt(initialTransform(), 1000).ratio).toBe(100);
    expect(zoomAt(initialTransform(0.5), 0.1).ratio).toBe(0.1);
  });
  it('composes one transform and wraps both ends of a gallery', () => {
    expect(transformStyle(initialTransform(0.5))).toBe(
      'translate3d(0px, 0px, 0) rotate(0deg) scale(0.5, 0.5)',
    );
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(1, 0)).toBe(0);
  });
});
