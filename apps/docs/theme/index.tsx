import '@sudden3/leaf-ui/styles.css';
import './index.scss';
import { useLang } from '@rspress/core/runtime';
import { type LayoutProps, Layout as RspressLayout } from '@rspress/core/theme-original';
import { ConfigProvider } from '@sudden3/leaf-ui';

export * from '@rspress/core/theme-original';
export { HomeLayout } from '../src/components/home';

export function Layout(props: LayoutProps) {
  const lang = useLang();
  return (
    <ConfigProvider locale={lang === 'en' ? 'en-US' : 'zh-CN'}>
      <RspressLayout {...props} />
    </ConfigProvider>
  );
}
