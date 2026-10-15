import { ConfigProvider } from '@ifhover/leaf-ui';
import { useDark } from '@rspress/core/runtime';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDocsLocale } from './i18n';
import { defaultThemeColor, normalizeThemeColor } from './theme-colors';

const storageKey = 'leaf-ui-docs-primary-color';
const brandVariables = [
  '--leaf-site-accent',
  '--rp-c-brand',
  '--rp-c-brand-light',
  '--rp-c-brand-lighter',
  '--rp-c-brand-dark',
  '--rp-c-brand-darker',
  '--rp-c-brand-tint',
] as const;

const DocsThemeContext = createContext({
  color: defaultThemeColor as string,
  setColor: (_color: string) => {},
});

export function useDocsTheme() {
  return useContext(DocsThemeContext);
}

/** Keep the first client render identical to the static HTML. */
export function DocsThemeProvider({ children }: { children: ReactNode }) {
  const { english } = useDocsLocale();
  const dark = useDark();
  const [color, setCurrentColor] = useState<string>(defaultThemeColor);

  useEffect(() => {
    const restore = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        setCurrentColor(
          saved && /^#[\da-f]{6}$/i.test(saved) ? saved.toLowerCase() : defaultThemeColor,
        );
      } catch {
        // The picker still works when browser storage is unavailable.
      }
    };
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) restore();
    };
    restore();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const setColor = useCallback((value: string) => {
    const normalized = normalizeThemeColor(value).toLowerCase();
    if (!/^#[\da-f]{6}$/.test(normalized)) return;
    setCurrentColor(normalized);
    try {
      localStorage.setItem(storageKey, normalized);
    } catch {
      // Updating the theme must not depend on persistence.
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: The computed palette changes when these theme inputs change.
  useEffect(() => {
    const scope = document.querySelector<HTMLElement>('[data-leaf-docs-theme]');
    if (!scope) return;
    const root = document.documentElement.style;
    const computed = getComputedStyle(scope);
    const previous = brandVariables.map(
      (name) => [name, root.getPropertyValue(name), root.getPropertyPriority(name)] as const,
    );
    // Rspress search is portalled outside ConfigProvider; share only site accents with it.
    for (const name of brandVariables)
      root.setProperty(name, computed.getPropertyValue(name).trim());
    return () => {
      for (const [name, value, priority] of previous) {
        if (value) root.setProperty(name, value, priority);
        else root.removeProperty(name);
      }
    };
  }, [color, dark]);

  const context = useMemo(() => ({ color, setColor }), [color, setColor]);
  const theme = useMemo(
    () => ({ primaryColor: color, appearance: dark ? ('dark' as const) : ('light' as const) }),
    [color, dark],
  );
  return (
    <DocsThemeContext.Provider value={context}>
      <ConfigProvider
        className="leaf-docs-theme"
        data-leaf-docs-theme=""
        locale={english ? 'en-US' : 'zh-CN'}
        theme={theme}
      >
        {children}
      </ConfigProvider>
    </DocsThemeContext.Provider>
  );
}
