import '@fontsource-variable/inter';
import '@ifhover/leaf-ui/styles.css';
import './index.scss';
import { ConfigProvider } from '@ifhover/leaf-ui';
import { useDark } from '@rspress/core/runtime';
import { type LayoutProps, Layout as RspressLayout } from '@rspress/core/theme-original';
import { useDocsLocale } from '../src/components/i18n';
import { VersionSwitcher } from '../src/components/version-switcher';

export * from '@rspress/core/theme-original';
export { CodeButtonGroup } from '../src/components/code-button-group';
export { HomeLayout } from '../src/components/home';
export { SearchButton } from '../src/components/search-button';
export { SwitchAppearance } from '../src/components/switch-appearance';

export function Layout(props: LayoutProps) {
  const { english } = useDocsLocale();
  const dark = useDark();
  return (
    <ConfigProvider
      locale={english ? 'en-US' : 'zh-CN'}
      theme={{ appearance: dark ? 'dark' : 'light' }}
    >
      <RspressLayout
        {...props}
        afterNavTitle={
          <>
            <VersionSwitcher />
            {props.afterNavTitle}
          </>
        }
      />
    </ConfigProvider>
  );
}
