import { useLeafConfig } from '../config-provider/context';

/** Small component-local labels follow the nearest language scope. */
export function useText() {
  const { locale } = useLeafConfig();
  return (zh: string, en: string) => (locale === 'en-US' ? en : zh);
}
