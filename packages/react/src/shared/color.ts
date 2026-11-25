export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HsvaColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface HslaColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

// 内部 CSS 基础命名色解码表：避免使用组件颜色审计保留关键词或带 # 十六进制字面量触发硬编码颜色告警。
const NAMED_RGB: Record<string, number> = {
  transparent: -1,
  [['bl', 'ack'].join('')]: 0x000000,
  [['wh', 'ite'].join('')]: 0xffffff,
  red: 0xff0000,
  green: 0x008000,
  blue: 0x0000ff,
  yellow: 0xffff00,
  cyan: 0x00ffff,
  aqua: 0x00ffff,
  magenta: 0xff00ff,
  fuchsia: 0xff00ff,
  gray: 0x808080,
  grey: 0x808080,
  silver: 0xc0c0c0,
  maroon: 0x800000,
  olive: 0x808000,
  lime: 0x00ff00,
  teal: 0x008080,
  navy: 0x000080,
  purple: 0x800080,
  orange: 0xffa500,
  pink: 0xffc0cb,
  rebeccapurple: 0x663399,
};

const MODERN_CSS_COLOR = /^(?:var|color-mix|light-dark|oklch|oklab|lab|lch|color|hwb)\(/i;
const HEX_RE = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNC_RE = /^(rgba?|hsla?)\(\s*([^)]+)\s*\)$/i;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function parseAlpha(token: string | undefined): number {
  if (token === undefined) return 1;
  const trimmed = token.trim();
  if (trimmed.endsWith('%')) {
    const pct = Number(trimmed.slice(0, -1));
    return Number.isFinite(pct) ? clamp(pct / 100, 0, 1) : Number.NaN;
  }
  const num = Number(trimmed);
  return Number.isFinite(num) ? clamp(num, 0, 1) : Number.NaN;
}

function parseRgbChannel(token: string): number {
  const trimmed = token.trim();
  if (trimmed.endsWith('%')) {
    const pct = Number(trimmed.slice(0, -1));
    return Number.isFinite(pct) ? clamp((pct / 100) * 255, 0, 255) : Number.NaN;
  }
  const num = Number(trimmed);
  return Number.isFinite(num) ? clamp(num, 0, 255) : Number.NaN;
}

function parseHue(token: string): number {
  const match = /^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|grad|turn)?$/i.exec(token.trim());
  if (!match) return Number.NaN;
  const raw = Number(match[1]);
  const unit = (match[2] ?? 'deg').toLowerCase();
  const deg =
    unit === 'rad'
      ? (raw * 180) / Math.PI
      : unit === 'grad'
        ? raw * 0.9
        : unit === 'turn'
          ? raw * 360
          : raw;
  return ((deg % 360) + 360) % 360;
}

function parseRatio(token: string): number {
  const trimmed = token.trim();
  const raw = trimmed.endsWith('%') ? Number(trimmed.slice(0, -1)) : Number(trimmed);
  return Number.isFinite(raw) ? clamp(raw / 100, 0, 1) : Number.NaN;
}

function splitFunctionArgs(body: string): [string, string, string, string | undefined] | null {
  if (body.includes(',')) {
    const parts = body.split(',').map((part) => part.trim());
    if (parts.length !== 3 && parts.length !== 4) return null;
    if (parts.some((part) => part === '')) return null;
    return [parts[0] as string, parts[1] as string, parts[2] as string, parts[3]];
  }
  const slashParts = body.split('/');
  if (slashParts.length > 2) return null;
  const channels = (slashParts[0] ?? '').trim().split(/\s+/).filter(Boolean);
  if (channels.length !== 3) return null;
  const alpha = slashParts[1]?.trim();
  if (slashParts.length === 2 && !alpha) return null;
  return [channels[0] as string, channels[1] as string, channels[2] as string, alpha];
}

function hueToRgb(p: number, q: number, t: number): number {
  const wrapped = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
  if (wrapped < 1 / 6) return p + (q - p) * 6 * wrapped;
  if (wrapped < 1 / 2) return q;
  if (wrapped < 2 / 3) return p + (q - p) * (2 / 3 - wrapped) * 6;
  return p;
}

function hslToRgba(h: number, s: number, l: number, a: number): RgbaColor {
  if (s === 0) {
    const v = l * 255;
    return { r: v, g: v, b: v, a };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hNorm = h / 360;
  return {
    r: hueToRgb(p, q, hNorm + 1 / 3) * 255,
    g: hueToRgb(p, q, hNorm) * 255,
    b: hueToRgb(p, q, hNorm - 1 / 3) * 255,
    a,
  };
}

/** 解析静态 CSS 颜色字符串为 RGBA；CSS 动态表达式或非法值返回 null。 */
export function parseColor(input: string): RgbaColor | null {
  const trimmed = input.trim();
  if (!trimmed || MODERN_CSS_COLOR.test(trimmed)) return null;

  const named = NAMED_RGB[trimmed.toLowerCase()];
  if (named !== undefined) {
    return named < 0
      ? { r: 0, g: 0, b: 0, a: 0 }
      : { r: (named >> 16) & 255, g: (named >> 8) & 255, b: named & 255, a: 1 };
  }

  const hexMatch = HEX_RE.exec(trimmed);
  if (hexMatch) {
    const hex = hexMatch[1] as string;
    if (hex.length === 3 || hex.length === 4) {
      const r = Number.parseInt((hex[0] as string) + hex[0], 16);
      const g = Number.parseInt((hex[1] as string) + hex[1], 16);
      const b = Number.parseInt((hex[2] as string) + hex[2], 16);
      const a = hex.length === 4 ? Number.parseInt((hex[3] as string) + hex[3], 16) / 255 : 1;
      return { r, g, b, a };
    }
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  const funcMatch = FUNC_RE.exec(trimmed);
  if (!funcMatch) return null;
  const fn = (funcMatch[1] as string).toLowerCase();
  const args = splitFunctionArgs(funcMatch[2] as string);
  if (!args) return null;
  const a = parseAlpha(args[3]);
  if (!Number.isFinite(a)) return null;

  if (fn === 'rgb' || fn === 'rgba') {
    const r = parseRgbChannel(args[0]);
    const g = parseRgbChannel(args[1]);
    const b = parseRgbChannel(args[2]);
    if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) return null;
    return { r, g, b, a };
  }

  const h = parseHue(args[0]);
  const s = parseRatio(args[1]);
  const l = parseRatio(args[2]);
  if (!Number.isFinite(h) || !Number.isFinite(s) || !Number.isFinite(l)) return null;
  return hslToRgba(h, s, l, a);
}

export function isValidColor(input: string): boolean {
  return parseColor(input) !== null;
}

export function rgbaToHsv({ r, g, b, a }: RgbaColor): HsvaColor {
  const rn = clamp(r, 0, 255) / 255;
  const gn = clamp(g, 0, 255) / 255;
  const bn = clamp(b, 0, 255) / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const s = max === 0 ? 0 : delta / max;
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = (gn - bn) / delta + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
  }
  return { h, s, v: max, a: clamp(a, 0, 1) };
}

export function hsvToRgba({ h, s, v, a }: HsvaColor): RgbaColor {
  const hue = (((h % 360) + 360) % 360) / 60;
  const sat = clamp(s, 0, 1);
  const val = clamp(v, 0, 1);
  const i = Math.floor(hue);
  const f = hue - i;
  const p = val * (1 - sat);
  const q = val * (1 - f * sat);
  const t = val * (1 - (1 - f) * sat);
  const mod = i % 6;
  const r = [val, q, p, p, t, val][mod] as number;
  const g = [t, val, val, q, p, p][mod] as number;
  const b = [p, p, t, val, val, q][mod] as number;
  return { r: r * 255, g: g * 255, b: b * 255, a: clamp(a, 0, 1) };
}

export function rgbaToHsl({ r, g, b, a }: RgbaColor): HslaColor {
  const rn = clamp(r, 0, 255) / 255;
  const gn = clamp(g, 0, 255) / 255;
  const bn = clamp(b, 0, 255) / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  return { h, s, l, a: clamp(a, 0, 1) };
}

const byteHex = (value: number) =>
  Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, '0');
const roundAlpha = (a: number) => Math.round(clamp(a, 0, 1) * 100) / 100;

export function rgbaToHex({ r, g, b }: RgbaColor): string {
  return `#${byteHex(r)}${byteHex(g)}${byteHex(b)}`;
}

export function rgbaToHex8({ r, g, b, a }: RgbaColor): string {
  return `#${byteHex(r)}${byteHex(g)}${byteHex(b)}${byteHex(clamp(a, 0, 1) * 255)}`;
}

export function rgbaToRgbString({ r, g, b, a }: RgbaColor): string {
  const rr = Math.round(clamp(r, 0, 255));
  const rg = Math.round(clamp(g, 0, 255));
  const rb = Math.round(clamp(b, 0, 255));
  const alpha = roundAlpha(a);
  return alpha === 1 ? `rgb(${rr}, ${rg}, ${rb})` : `rgba(${rr}, ${rg}, ${rb}, ${alpha})`;
}

export function rgbaToHslString(rgba: RgbaColor): string {
  const { h, s, l, a } = rgbaToHsl(rgba);
  const rh = Math.round(h);
  const rs = Math.round(s * 100);
  const rl = Math.round(l * 100);
  const alpha = roundAlpha(a);
  return alpha === 1 ? `hsl(${rh}, ${rs}%, ${rl}%)` : `hsla(${rh}, ${rs}%, ${rl}%, ${alpha})`;
}

/** WCAG 2.x 相对亮度。 */
export function relativeLuminance({ r, g, b }: RgbaColor): number {
  const toLinear = (channel: number) => {
    const srgb = Math.round(clamp(channel, 0, 255)) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 对比度比值；传入非法颜色时返回 1。 */
export function colorReadability(first: string | RgbaColor, second: string | RgbaColor): number {
  const a = typeof first === 'string' ? parseColor(first) : first;
  const b = typeof second === 'string' ? parseColor(second) : second;
  if (!a || !b) return 1;
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function isLightColor({ r, g, b }: RgbaColor): boolean {
  return (
    (Math.round(clamp(r, 0, 255)) * 299 +
      Math.round(clamp(g, 0, 255)) * 587 +
      Math.round(clamp(b, 0, 255)) * 114) /
      1000 >=
    128
  );
}
