import { TinyColor } from '@ctrl/tinycolor';

// Ant Design's HSV palette: link hover uses step 4 (danger uses 5), press uses 7.
// The algorithm and its MIT notice are documented in THIRD_PARTY.md.
export function actionColor(seed: string, offset: -2 | -1 | 1): string {
  const parsed = new TinyColor(seed);
  const { h, s, v } = parsed.toHsv();
  const light = offset < 0;
  const distance = Math.abs(offset);
  const hueDirection = Math.round(h) >= 60 && Math.round(h) <= 240 ? 1 : -1;
  const hue = (Math.round(h) + hueDirection * offset * 2 + 360) % 360;
  const saturation =
    s === 0 && h === 0
      ? 0
      : Math.round(Math.max(0.06, Math.min(1, s + (light ? -0.16 : 0.05) * distance)) * 100) / 100;
  const value =
    Math.round(Math.max(0, Math.min(1, v + (light ? 0.05 : -0.15) * distance)) * 100) / 100;
  return new TinyColor({ h: hue, s: saturation, v: value })
    .setAlpha(parsed.getAlpha())
    .toHexString();
}
