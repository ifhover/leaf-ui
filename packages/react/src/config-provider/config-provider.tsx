import { type HTMLAttributes, useMemo } from 'react';
import { ConfirmScope } from '../confirm/provider';
import { LoadingBarScope } from '../loadingbar/loadingbar';
import { MessageScope } from '../message/provider';
import { NotificationScope } from '../notification/notification';
import { type LeafTheme, leafThemeVariables, mergeLeafTheme } from '../theme';
import { ConfigContext, type LeafLocale, localeMessages, useLeafConfig } from './context';

export type { LeafTheme, LeafThemeTokens } from '../theme';
export type { LeafLocale } from './context';
export { useLeafConfig } from './context';

export interface ConfigProviderProps extends HTMLAttributes<HTMLDivElement> {
  locale?: LeafLocale;
  theme?: LeafTheme;
}

/** Nested scopes inherit unspecified theme and language settings. */
export function ConfigProvider({ locale, theme, style, children, ...props }: ConfigProviderProps) {
  const parent = useLeafConfig();
  const merged = useMemo(() => {
    const language = locale ?? parent.locale;
    return {
      locale: language,
      theme: mergeLeafTheme(parent.theme, theme),
      messages: localeMessages[language],
    };
  }, [parent, locale, theme]);
  const variables = useMemo(() => leafThemeVariables(merged.theme), [merged.theme]);
  return (
    <ConfigContext.Provider value={merged}>
      <div
        {...props}
        lang={merged.locale}
        data-leaf-theme={merged.theme.appearance}
        style={{ ...variables, ...style }}
      >
        <MessageScope>
          <ConfirmScope>
            <NotificationScope>
              <LoadingBarScope>{children}</LoadingBarScope>
            </NotificationScope>
          </ConfirmScope>
        </MessageScope>
      </div>
    </ConfigContext.Provider>
  );
}
