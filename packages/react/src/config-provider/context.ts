import { useContext } from 'react';
import type { LeafDensity } from '../density';
import type { LeafTranslations, LocaleMessages, TranslationKey } from '../locales/types';
import zhCN from '../locales/zh-CN.json';
import type { LeafTheme } from '../theme';
import { ConfigContext } from './config-context';

export { ConfigContext } from './config-context';

export type LeafLocale = 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | 'ko-KR' | (string & {});
export type LeafDirection = 'ltr' | 'rtl';

const defaultConfig = {
  locale: 'zh-CN' as LeafLocale,
  localeChain: ['zh-CN'] as readonly LeafLocale[],
  translations: {} as LeafTranslations,
  // The default language is complete; only ConfigProvider needs the fallback resolver and other packs.
  messages: zhCN as LocaleMessages,
  messageLocales: {} as Partial<Record<TranslationKey, string>>,
  theme: {} as LeafTheme,
  direction: 'ltr' as LeafDirection,
  weekStartsOn: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  maskBlur: true,
  density: 'comfortable' as LeafDensity,
  getPopupContainer: undefined as undefined | (() => Element | DocumentFragment),
};
export type LeafConfig = typeof defaultConfig;
export function useLeafConfig() {
  return useContext(ConfigContext) ?? defaultConfig;
}
