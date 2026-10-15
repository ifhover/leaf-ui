import { type Formatters, IntlMessageFormat } from 'intl-messageformat';
import { useMemo } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { getEnglishMessage, getMessage } from '../locales/resolve';
import type { TranslationKey } from '../locales/types';

declare const process: { env: { NODE_ENV?: string } };

/** ICU is used only by components with variable sentences, not the base configuration. */
export function useFormattedText() {
  const { locale, messages, messageLocales } = useLeafConfig();
  return useMemo(() => {
    const cache = new Map<string, IntlMessageFormat>();
    const warned = new Set<string>();
    const numbers = new Map<string, Intl.NumberFormat>();
    const dates = new Map<string, Intl.DateTimeFormat>();
    const plurals = new Map<string, Intl.PluralRules>();
    const formatters: Formatters = {
      getNumberFormat: (_, options) => {
        const id = JSON.stringify(options ?? {});
        let formatter = numbers.get(id);
        if (!formatter) {
          // FormatJS includes newer Intl options than the project's ES2020 lib declarations.
          formatter = new Intl.NumberFormat(locale, options as Intl.NumberFormatOptions);
          numbers.set(id, formatter);
        }
        return formatter;
      },
      getDateTimeFormat: (_, options) => {
        const id = JSON.stringify(options ?? {});
        let formatter = dates.get(id);
        if (!formatter) {
          formatter = new Intl.DateTimeFormat(locale, options);
          dates.set(id, formatter);
        }
        return formatter;
      },
      getPluralRules: (language, options) => {
        const id = JSON.stringify([language, options]);
        let formatter = plurals.get(id);
        if (!formatter) {
          formatter = new Intl.PluralRules(language, options);
          plurals.set(id, formatter);
        }
        return formatter;
      },
    };
    function format(
      template: string,
      language: string,
      values: Record<string, string | number | Date>,
    ) {
      const id = `${language}:${template}`;
      let formatter = cache.get(id);
      if (!formatter) {
        formatter = new IntlMessageFormat(template, locale, undefined, {
          ignoreTag: true,
          formatters: {
            ...formatters,
            // Sentence grammar follows its translation; regional formats follow the active locale.
            getPluralRules: (_, options) => formatters.getPluralRules(language, options),
          },
        });
        cache.set(id, formatter);
      }
      return String(formatter.format(values));
    }
    return (key: TranslationKey, values: Record<string, string | number | Date>) => {
      try {
        return format(getMessage(messages, key), messageLocales[key] ?? locale, values);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production' && !warned.has(key)) {
          warned.add(key);
          console.warn(`Leaf UI: invalid translation "${key}"; using English.`, error);
        }
        return format(getEnglishMessage(key), 'en-US', values);
      }
    };
  }, [locale, messages, messageLocales]);
}
