import { type HTMLAttributes, useMemo, useRef } from 'react';
import { ConfirmScope } from '../confirm/provider';
import { type LeafDensity, leafDensityVariables } from '../density';
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
import { useColorVariables } from './use-color-variables';

export type { LeafDensity } from '../density';
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
  /** Enable the background blur on Modal and Drawer masks. Defaults to true. */
  maskBlur?: boolean;
  /** Inherited spacing preset; explicit theme and component sizes take precedence. */
  density?: LeafDensity;
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
  maskBlur,
  density,
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
      maskBlur: maskBlur ?? parent.maskBlur,
      density: density ?? parent.density,
    };
  }, [
    parent,
    locale,
    theme,
    messages,
    textMessages,
    direction,
    weekStartsOn,
    getPopupContainer,
    maskBlur,
    density,
  ]);
  const variables = useMemo(() => leafThemeVariables(merged.theme), [merged.theme]);
  const root = useRef<HTMLDivElement>(null);
  const resolved = useColorVariables(root, merged.theme);
  return (
    <ConfigContext.Provider value={merged}>
      <div
        {...props}
        ref={root}
        lang={merged.locale}
        dir={merged.direction}
        data-leaf-scope=""
        data-leaf-density={merged.density}
        data-leaf-motion={
          merged.theme.motion === undefined ? undefined : merged.theme.motion ? 'on' : 'off'
        }
        data-leaf-theme={merged.theme.appearance}
        style={{ ...leafDensityVariables(merged.density), ...variables, ...resolved, ...style }}
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
