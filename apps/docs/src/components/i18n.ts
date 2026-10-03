import { useLang, withBase } from '@rspress/core/runtime';
export function useDocsLocale() {
  const english = useLang() === 'en';
  return {
    english,
    t: (zh: string, en: string) => (english ? en : zh),
    url: (path: string) => withBase(`${english ? '/en' : ''}${path}`),
  };
}
