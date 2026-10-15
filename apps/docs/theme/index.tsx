import '@fontsource-variable/inter';
import '@ifhover/leaf-ui/styles.css';
import './index.scss';
import './tailwind.css';
import { type LayoutProps, Layout as RspressLayout } from '@rspress/core/theme-original';
import { DocsThemeProvider } from '../src/components/docs-theme';
import { ThemeColorSwitcher } from '../src/components/theme-color-switcher';
import { VersionSwitcher } from '../src/components/version-switcher';

export * from '@rspress/core/theme-original';
export { CodeButtonGroup } from '../src/components/code-button-group';
export { DocsSidebar as Sidebar } from '../src/components/docs-sidebar';
export { HomeLayout } from '../src/components/home';
export { SearchButton } from '../src/components/search-button';
export { SwitchAppearance } from '../src/components/switch-appearance';

export function Layout(props: LayoutProps) {
  return (
    <DocsThemeProvider>
      <RspressLayout
        {...props}
        afterNavTitle={
          <>
            <VersionSwitcher />
            {props.afterNavTitle}
          </>
        }
        afterNavMenu={
          <>
            {props.afterNavMenu}
            <ThemeColorSwitcher />
          </>
        }
      />
    </DocsThemeProvider>
  );
}
