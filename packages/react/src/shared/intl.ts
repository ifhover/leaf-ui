const maxIntlCacheSize = 64;

const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();
const numberFormatCache = new Map<string, Intl.NumberFormat>();

function serializeIntlOptions(options?: Record<string, unknown>): string {
  if (!options) return '';
  const keys = Object.keys(options).sort();
  let result = '';
  for (const key of keys) {
    const value = options[key];
    if (value !== undefined) result += `${key}=${String(value)};`;
  }
  return result;
}

function getCachedFormat<T>(cache: Map<string, T>, key: string, create: () => T): T {
  const existing = cache.get(key);
  if (existing) {
    // 命中后刷新顺序，避免固定场景集合淘汰常用实例。
    cache.delete(key);
    cache.set(key, existing);
    return existing;
  }
  const created = create();
  if (cache.size >= maxIntlCacheSize) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(key, created);
  return created;
}

/** 获取带 LRU 缓存的 Intl.DateTimeFormat，避免渲染周期重复初始化格式化器。 */
export function getDateTimeFormat(
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${serializeIntlOptions(options as Record<string, unknown> | undefined)}`;
  return getCachedFormat(dateTimeFormatCache, key, () => new Intl.DateTimeFormat(locale, options));
}

/** 获取带 LRU 缓存的 Intl.NumberFormat，避免每次格式化或解析重复分配实例。 */
export function getNumberFormat(
  locale: string,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale}|${serializeIntlOptions(options as Record<string, unknown> | undefined)}`;
  return getCachedFormat(numberFormatCache, key, () => new Intl.NumberFormat(locale, options));
}
