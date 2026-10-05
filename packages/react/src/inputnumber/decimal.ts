/** Exact decimal arithmetic for stringMode, without converting values to Number. */
export function decimalParts(value: string | number) {
  const match = String(value)
    .trim()
    .match(/^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
  if (!match || (!match[2] && !match[3])) return null;
  const exponent = Number(match[4] ?? 0);
  if (!Number.isInteger(exponent) || Math.abs(exponent) > 1000) return null;
  let scale = (match[3]?.length ?? 0) - exponent;
  let units = BigInt(`${match[1] === '-' ? '-' : ''}${match[2] || '0'}${match[3] ?? ''}`);
  if (scale < 0) {
    units *= 10n ** BigInt(-scale);
    scale = 0;
  }
  return { units, scale };
}
export function decimalString(units: bigint, scale: number, trim = true) {
  const negative = units < 0n;
  const digits = (negative ? -units : units).toString().padStart(scale + 1, '0');
  let value = scale ? `${digits.slice(0, -scale)}.${digits.slice(-scale)}` : digits;
  if (trim && scale) value = value.replace(/0+$/, '').replace(/\.$/, '');
  return `${negative && units !== 0n ? '-' : ''}${value}`;
}
export function compareDecimal(left: string | number, right: string | number) {
  const a = decimalParts(left),
    b = decimalParts(right);
  if (!a || !b) return 0;
  const scale = Math.max(a.scale, b.scale);
  const result =
    a.units * 10n ** BigInt(scale - a.scale) - b.units * 10n ** BigInt(scale - b.scale);
  return result < 0n ? -1 : result > 0n ? 1 : 0;
}
export function addDecimal(left: string | number, right: string | number, direction = 1) {
  const a = decimalParts(left),
    b = decimalParts(right);
  if (!a || !b || !Number.isInteger(direction)) return '';
  const scale = Math.max(a.scale, b.scale);
  return decimalString(
    a.units * 10n ** BigInt(scale - a.scale) +
      BigInt(direction) * b.units * 10n ** BigInt(scale - b.scale),
    scale,
  );
}
export function roundDecimal(value: string | number, precision?: number) {
  const parsed = decimalParts(value);
  if (!parsed) return '';
  if (precision === undefined) return decimalString(parsed.units, parsed.scale);
  const scale = Number.isFinite(precision)
    ? Math.max(0, Math.min(100, Math.floor(precision)))
    : parsed.scale;
  if (scale >= parsed.scale)
    return decimalString(parsed.units * 10n ** BigInt(scale - parsed.scale), scale, false);
  const divisor = 10n ** BigInt(parsed.scale - scale);
  return decimalString(
    (parsed.units + (parsed.units < 0n ? -divisor / 2n : divisor / 2n)) / divisor,
    scale,
    false,
  );
}
