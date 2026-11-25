import type { LocaleMessages, TranslationKey } from './types';

type Group = keyof LocaleMessages;

/** 从已解析的消息字典中按键路径读取翻译文案，不引入任何静态语言包。 */
export function getMessage(messages: LocaleMessages, key: TranslationKey): string {
  const [group, name] = key.split('.') as [Group, string];
  return (messages[group] as Record<string, string>)[name] as string;
}
