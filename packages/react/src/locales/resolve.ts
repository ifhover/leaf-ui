import enUS from './en-US.json';
import jaJP from './ja-JP.json';
import koKR from './ko-KR.json';
import type { LeafTranslations, LocaleMessages, TranslationKey } from './types';
import zhCN from './zh-CN.json';
import zhTW from './zh-TW.json';

const builtins: Readonly<Record<string, LocaleMessages>> = {
  'en-US': enUS,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
};
const emptyTranslations: LeafTranslations = {};
type Group = keyof LocaleMessages;

/** Only explicit tags participate; no implicit language or region matching. */
export function localeChain(locale: string | readonly string[]): readonly string[] {
  const values = typeof locale === 'string' ? [locale] : locale;
  if (values.length === 0)
    throw new RangeError('ConfigProvider locale must contain at least one language tag.');
  return Intl.getCanonicalLocales([...values]);
}

/** Pure per-scope merge. Arrays are atomic and undefined never erases inherited entries. */
export function mergeTranslations(
  parent: LeafTranslations,
  own: LeafTranslations | undefined,
): LeafTranslations {
  if (!own || Object.keys(own).length === 0) return parent;
  const merged: Record<string, Record<string, unknown>> = { ...parent };
  for (const [tag, resource] of Object.entries(own)) {
    const language = localeChain(tag)[0] as string;
    const previous = merged[language];
    const groups: Record<string, unknown> = { ...previous };
    // Ignore unknown keys at runtime. JSON Schema and the public type catch them in authoring.
    for (const group of Object.keys(enUS) as Group[]) {
      const content = resource?.[group];
      if (!content || typeof content !== 'object' || Array.isArray(content)) continue;
      const entries: Record<string, unknown> = { ...(groups[group] as object) };
      for (const key of Object.keys(enUS[group])) {
        const value = (content as Record<string, unknown>)[key];
        const template = (enUS[group] as Record<string, unknown>)[key];
        if (typeof template === 'string' && typeof value === 'string') entries[key] = value;
        else if (
          Array.isArray(template) &&
          Array.isArray(value) &&
          value.length === template.length &&
          value.every((entry) => typeof entry === 'string')
        )
          entries[key] = value;
      }
      groups[group] = entries;
    }
    merged[language] = groups;
  }
  return merged as LeafTranslations;
}

/** Resolve each entry once per Provider update, preserving the source language for plurals. */
export function resolveTranslations(
  chain: readonly string[],
  translations: LeafTranslations = emptyTranslations,
) {
  const result: Record<string, Record<string, unknown>> = {};
  const messageLocales: Partial<Record<TranslationKey, string>> = {};
  for (const group of Object.keys(enUS) as Group[]) {
    const entries: Record<string, unknown> = {};
    for (const key of Object.keys(enUS[group])) {
      let value: unknown;
      let source = 'en-US';
      for (const language of chain) {
        const custom = translations[language]?.[group] as Record<string, unknown> | undefined;
        const builtin = builtins[language]?.[group] as Record<string, unknown> | undefined;
        value = custom?.[key] ?? builtin?.[key];
        if (value !== undefined) {
          source = language;
          break;
        }
      }
      entries[key] = value ?? (enUS[group] as Record<string, unknown>)[key];
      if (source !== chain[0]) messageLocales[`${group}.${key}` as TranslationKey] = source;
    }
    result[group] = entries;
  }
  // Every group and entry above comes from the complete English template.
  return { messages: result as unknown as LocaleMessages, messageLocales };
}

export function getMessage(messages: LocaleMessages, key: TranslationKey): string {
  const [group, name] = key.split('.') as [Group, string];
  return (messages[group] as Record<string, string>)[name] as string;
}
export function getEnglishMessage(key: TranslationKey) {
  return getMessage(enUS, key);
}
