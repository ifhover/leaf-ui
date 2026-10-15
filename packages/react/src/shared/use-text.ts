import { useLeafConfig } from '../config-provider/context';
import { getMessage } from '../locales/resolve';
import type { TranslationKey } from '../locales/types';

/** Static labels do not import the ICU parser or allocate formatters. */
export function useText() {
  const { messages } = useLeafConfig();
  return (key: TranslationKey) => getMessage(messages, key);
}
