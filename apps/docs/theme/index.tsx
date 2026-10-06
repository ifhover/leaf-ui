import '@sudden3/leaf-ui/styles.css';
import './index.scss';
import { useDark } from '@rspress/core/runtime';
import { type LayoutProps, Layout as RspressLayout } from '@rspress/core/theme-original';
import { ConfigProvider } from '@sudden3/leaf-ui';
import { useDocsLocale } from '../src/components/i18n';
import { VersionSwitcher } from '../src/components/version-switcher';

export * from '@rspress/core/theme-original';
export { CodeButtonGroup } from '../src/components/code-button-group';
export { HomeLayout } from '../src/components/home';
export { SearchButton } from '../src/components/search-button';

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
