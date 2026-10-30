export interface ImageTransform {
  x: number;
  y: number;
  ratio: number;
  rotate: number;
  flipX: number;
  flipY: number;
}

export function fitRatio(
  width: number,
  height: number,
  availableWidth: number,
  availableHeight: number,
) {
  if (!(width > 0 && height > 0)) return 1;
  return Math.min(
    1,
    (Math.max(1, availableWidth) * 0.9) / width,
    (Math.max(1, availableHeight) * 0.9) / height,
  );
}

export function initialTransform(ratio = 1): ImageTransform {
  return { x: 0, y: 0, ratio, rotate: 0, flipX: 1, flipY: 1 };
}

/** Keep the pixel under the pointer stationary, including rotated/flipped images. */
export function zoomAt(transform: ImageTransform, ratio: number, x = 0, y = 0): ImageTransform {
  const next = Math.max(0.01, Math.min(100, ratio));
  const factor = next / transform.ratio;
  return {
    ...transform,
    ratio: next,
    x: x - (x - transform.x) * factor,
    y: y - (y - transform.y) * factor,
  };
}

export function transformStyle(value: ImageTransform) {
  return `translate3d(${value.x}px, ${value.y}px, 0) rotate(${value.rotate}deg) scale(${value.ratio * value.flipX}, ${value.ratio * value.flipY})`;
}

export function wrapIndex(index: number, length: number) {
  return length ? ((index % length) + length) % length : 0;
}
