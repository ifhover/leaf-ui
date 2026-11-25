import { useMemo } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { formatIcu, type IcuFormatterCaches, type IcuNode, parseIcu } from '../locales/icu';
import { getMessage } from '../locales/lookup';
import type { TranslationKey } from '../locales/types';

declare const process: { env: { NODE_ENV?: string } };

/** ICU 仅由带变量句式的组件使用，不接入外部 ICU 解析库以控制单组件体积。 */
export function useFormattedText() {
  const { locale, messages, messageLocales, fallbackMessages } = useLeafConfig();
  return useMemo(() => {
    const astCache = new Map<string, IcuNode[]>();
    const warned = new Set<string>();
    const caches: IcuFormatterCaches = {
      numbers: new Map(),
      dates: new Map(),
      plurals: new Map(),
    };
    function format(
      template: string,
      pluralLocale: string,
      values: Record<string, string | number | Date>,
    ) {
      let ast = astCache.get(template);
      if (!ast) {
        ast = parseIcu(template);
        astCache.set(template, ast);
      }
      return formatIcu(ast, locale, pluralLocale, values, caches);
    }
    return (key: TranslationKey, values: Record<string, string | number | Date>) => {
      try {
        return format(getMessage(messages, key), messageLocales[key] ?? locale, values);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production' && !warned.has(key)) {
          warned.add(key);
          console.warn(`Leaf UI: invalid translation "${key}"; using English.`, error);
        }
        return format(
          getMessage(fallbackMessages ?? messages, key),
          fallbackMessages ? 'en-US' : 'zh-CN',
          values,
        );
      }
    };
  }, [locale, messages, messageLocales, fallbackMessages]);
}
