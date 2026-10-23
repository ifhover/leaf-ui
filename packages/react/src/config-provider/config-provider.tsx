import { type HTMLAttributes, useContext, useMemo } from 'react';
import { ConfirmScope } from '../confirm/provider';
import { type LeafDensity, leafDensityVariables } from '../density';
import { LoadingBarScope } from '../loadingbar/loadingbar';
import { localeChain, mergeTranslations, resolveTranslations } from '../locales/resolve';
import type { LeafTranslations } from '../locales/types';
import { MessageScope } from '../message/provider';
import { NotificationScope } from '../notification/notification';
import { type LeafTheme, leafThemeVariables, mergeLeafTheme } from '../theme';
import {
  ComponentDefaultsContext,
  type LeafComponentDefaults,
  mergeComponentDefaults,
} from './component-defaults';
import { ConfigContext, type LeafDirection, type LeafLocale, useLeafConfig } from './context';

export type { LeafDensity } from '../density';
export type { LeafTranslation, LeafTranslations } from '../locales/types';
export type { LeafTheme, LeafThemeTokens } from '../theme';
export type { LeafComponentDefaults } from './component-defaults';
export type { LeafDirection, LeafLocale } from './context';
export { useLeafConfig } from './context';

export interface ConfigProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** Current language followed by per-entry fallbacks. The first tag controls Intl and lang. */
  locale?: LeafLocale | readonly LeafLocale[];
  /** JSON translation resources; inner providers merge languages and individual entries. */
  translations?: LeafTranslations;
  theme?: LeafTheme;
  direction?: LeafDirection;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  getPopupContainer?: () => Element | DocumentFragment;
  /** Enable the background blur on Modal and Drawer masks. Defaults to true. */
  maskBlur?: boolean;
  /** Inherited spacing preset; explicit theme and component sizes take precedence. */
  density?: LeafDensity;
  /** Scoped defaults; instance props take precedence and null entries clear inherited defaults. */
  components?: LeafComponentDefaults;
}

/** Nested scopes inherit unspecified theme and language settings. */
export function ConfigProvider({
  locale,
  translations,
  theme,
  direction,
  weekStartsOn,
  getPopupContainer,
  maskBlur,
  density,
  components,
  style,
  children,
  ...props
}: ConfigProviderProps) {
  const parent = useLeafConfig();
  const parentComponents = useContext(ComponentDefaultsContext);
  const mergedComponents = useMemo(
    () => mergeComponentDefaults(parentComponents, components),
    [parentComponents, components],
  );
  const languages = useMemo(
    () => (locale === undefined ? parent.localeChain : localeChain(locale)),
    [locale, parent.localeChain],
  );
  const resources = useMemo(
    () => mergeTranslations(parent.translations, translations),
    [parent.translations, translations],
  );
  const text = useMemo(
    () =>
      languages === parent.localeChain && resources === parent.translations
        ? { messages: parent.messages, messageLocales: parent.messageLocales }
        : resolveTranslations(languages, resources),
    [
      languages,
      resources,
      parent.localeChain,
      parent.translations,
      parent.messages,
      parent.messageLocales,
    ],
  );
  const merged = useMemo(() => {
    return {
      locale: languages[0] as LeafLocale,
      localeChain: languages,
      translations: resources,
      ...text,
      theme: mergeLeafTheme(parent.theme, theme),
      direction: direction ?? parent.direction,
      weekStartsOn: weekStartsOn ?? parent.weekStartsOn,
      getPopupContainer: getPopupContainer ?? parent.getPopupContainer,
      maskBlur: maskBlur ?? parent.maskBlur,
      density: density ?? parent.density,
    };
  }, [
    parent,
    languages,
    resources,
    text,
    theme,
    direction,
    weekStartsOn,
    getPopupContainer,
    maskBlur,
    density,
  ]);
  const variables = useMemo(() => leafThemeVariables(merged.theme), [merged.theme]);
  return (
    <ConfigContext.Provider value={merged}>
      <div
        {...props}
        lang={merged.locale}
        dir={merged.direction}
        data-leaf-scope=""
        data-leaf-density={merged.density}
        data-leaf-motion={
          merged.theme.motion === undefined ? undefined : merged.theme.motion ? 'on' : 'off'
        }
        data-leaf-theme={merged.theme.appearance}
        style={{ ...leafDensityVariables(merged.density), ...variables, ...style }}
      >
        <ComponentDefaultsContext.Provider value={mergedComponents}>
          <MessageScope>
            <ConfirmScope>
              <NotificationScope>
                <LoadingBarScope>{children}</LoadingBarScope>
              </NotificationScope>
            </ConfirmScope>
          </MessageScope>
        </ComponentDefaultsContext.Provider>
      </div>
    </ConfigContext.Provider>
  );
}
