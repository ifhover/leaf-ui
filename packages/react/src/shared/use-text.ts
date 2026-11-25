import { useCallback } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { getMessage } from '../locales/lookup';
import type { TranslationKey } from '../locales/types';

/** 静态文案不引入 ICU 解析器与格式化实例，并以消息对象引用保持回调稳定。 */
export function useText() {
  const { messages } = useLeafConfig();
  return useCallback((key: TranslationKey) => getMessage(messages, key), [messages]);
}
