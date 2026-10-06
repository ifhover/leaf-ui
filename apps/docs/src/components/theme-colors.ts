export const themeColorPresets = [
  { color: '#20834a', zh: '主题绿', en: 'Theme green' },
  { color: '#18181b', zh: '黑色', en: 'Black' },
  { color: '#ff6900', zh: '活力橙', en: 'Orange' },
  { color: '#1d9bf0', zh: '亮蓝', en: 'Blue' },
  { color: '#cf0b2d', zh: '红色', en: 'Red' },
] as const;

export const defaultThemeColor = themeColorPresets[0].color;

export function normalizeThemeColor(color: string) {
  const values = color.match(/[\d.]+/g)?.map(Number);
  if (!values || values.length < 3) return color;
  let channels: number[];
  if (/^rgb\(/i.test(color)) {
    channels = values.slice(0, 3);
  } else if (/^hsl\(/i.test(color)) {
    const [h = 0, s = 0, l = 0] = values;
    const lightness = l / 100;
    const chroma = (1 - Math.abs(2 * lightness - 1)) * (s / 100);
    const hue = (((h % 360) + 360) % 360) / 60;
    const intermediate = chroma * (1 - Math.abs((hue % 2) - 1));
    const offset = lightness - chroma / 2;
    channels = (
      [
        [chroma, intermediate, 0],
        [intermediate, chroma, 0],
        [0, chroma, intermediate],
        [0, intermediate, chroma],
        [intermediate, 0, chroma],
        [chroma, 0, intermediate],
      ][Math.floor(hue)] ?? [0, 0, 0]
    ).map((channel) => (channel + offset) * 255);
  } else {
    return color;
  }
  return `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}
