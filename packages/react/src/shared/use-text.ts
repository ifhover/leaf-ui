import { useLeafConfig } from '../config-provider/context';
import { traditionalTextMessages } from '../locales/zh-tw';

/** Small component-local labels follow the nearest language scope. */
export function useText() {
  const { locale, textMessages } = useLeafConfig();
  return (zh: string, en: string) =>
    textMessages[en] ??
    (locale === 'zh-TW' ? (traditionalTextMessages[en] ?? zh) : locale.startsWith('zh') ? zh : en);
}
