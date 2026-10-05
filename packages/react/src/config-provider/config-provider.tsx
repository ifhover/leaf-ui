import { type HTMLAttributes, useMemo } from 'react';
import { ConfirmScope } from '../confirm/provider';
import { LoadingBarScope } from '../loadingbar/loadingbar';
import { MessageScope } from '../message/provider';
import { NotificationScope } from '../notification/notification';
import { type LeafTheme, leafThemeVariables, mergeLeafTheme } from '../theme';
import {
  ConfigContext,
  type LeafDirection,
  type LeafLocale,
  type LeafMessages,
  localeMessages,
  useLeafConfig,
} from './context';

export type { LeafTheme, LeafThemeTokens } from '../theme';
export type { LeafDirection, LeafLocale, LeafMessages } from './context';
export { useLeafConfig } from './context';

export interface ConfigProviderProps extends HTMLAttributes<HTMLDivElement> {
  locale?: LeafLocale;
  theme?: LeafTheme;
  messages?: Partial<LeafMessages>;
  textMessages?: Record<string, string>;
  direction?: LeafDirection;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  getPopupContainer?: () => Element | DocumentFragment;
}

/** Nested scopes inherit unspecified theme and language settings. */
export function ConfigProvider({
  locale,
  theme,
  messages,
  textMessages,
  direction,
  weekStartsOn,
  getPopupContainer,
  style,
  children,
  ...props
}: ConfigProviderProps) {
  const parent = useLeafConfig();
  const merged = useMemo(() => {
    const language = locale ?? parent.locale;
    return {
      locale: language,
      theme: mergeLeafTheme(parent.theme, theme),
      messages: {
        ...(locale ? (localeMessages[language] ?? localeMessages['en-US']) : parent.messages),
        ...messages,
      } as LeafMessages,
      textMessages: { ...parent.textMessages, ...textMessages },
      direction: direction ?? parent.direction,
      weekStartsOn: weekStartsOn ?? parent.weekStartsOn,
      getPopupContainer: getPopupContainer ?? parent.getPopupContainer,
    };
  }, [parent, locale, theme, messages, textMessages, direction, weekStartsOn, getPopupContainer]);
  const variables = useMemo(() => leafThemeVariables(merged.theme), [merged.theme]);
  return (
    <ConfigContext.Provider value={merged}>
      <div
        {...props}
        lang={merged.locale}
        dir={merged.direction}
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
