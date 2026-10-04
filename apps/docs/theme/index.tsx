import '@sudden3/leaf-ui/styles.css';
import './index.scss';
import { type LayoutProps, Layout as RspressLayout } from '@rspress/core/theme-original';
import { ConfigProvider, Tag } from '@sudden3/leaf-ui';
import packageInfo from '../../../packages/react/package.json';
import { useDocsLocale } from '../src/components/i18n';

export * from '@rspress/core/theme-original';
export { CodeButtonGroup } from '../src/components/code-button-group';
export { HomeLayout } from '../src/components/home';
export { SearchButton } from '../src/components/search-button';

export function Layout(props: LayoutProps) {
  const { english, t, url } = useDocsLocale();
  return (
    <ConfigProvider locale={english ? 'en-US' : 'zh-CN'}>
      <RspressLayout
        {...props}
        afterNavTitle={
          <>
            <a
              className="leaf-nav-version"
              href={url('/changelog.html')}
              aria-label={t(
                `更新记录，当前版本 ${packageInfo.version}`,
                `Changelog, current version ${packageInfo.version}`,
              )}
            >
              <Tag size="sm">v{packageInfo.version}</Tag>
            </a>
            {props.afterNavTitle}
          </>
        }
      />
    </ConfigProvider>
  );
}
