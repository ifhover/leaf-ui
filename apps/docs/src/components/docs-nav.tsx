import { Button, Drawer, Dropdown } from '@ifhover/leaf-ui';
import type { NavItemWithLink } from '@rspress/core';
import {
  matchNavbar,
  removeBase,
  useLocation,
  useNav,
  usePage,
  withBase,
} from '@rspress/core/runtime';
import {
  IconGithub,
  Link,
  type NavProps,
  Search,
  useLinkNavigate,
} from '@rspress/core/theme-original';
import { ArrowRight, ArrowUpRight, ChevronDown, Languages, Menu } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useDocsLocale } from './i18n';
import { SwitchAppearance } from './switch-appearance';
import { ThemeColorSwitcher } from './theme-color-switcher';
import './docs-nav.scss';

function navigationDescription(link: string, english: boolean) {
  if (link.includes('/components'))
    return english ? 'Find the right building blocks' : '找到适合你的界面组件';
  if (link.includes('/api'))
    return english ? 'Explore props, tokens and types' : '查阅参数、主题变量与类型';
  if (link.includes('/changelog'))
    return english ? 'See what is new in Leaf UI' : '了解每个版本的新变化';
  return english ? 'Start building with Leaf UI' : '从安装到定制，轻松开始';
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const items = useNav().filter((item): item is NavItemWithLink => 'link' in item);
  const { pathname } = useLocation();
  const { english } = useDocsLocale();

  return (
    <ul className="leaf-docs-nav__links">
      {items.map((item) => {
        const active = matchNavbar(item, pathname);
        const description = navigationDescription(item.link, english);
        return (
          <li key={item.link}>
            <Link
              href={item.link}
              className="leaf-docs-nav__link"
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
            >
              <span className="leaf-docs-nav__link-copy">
                <span>{item.text}</span>
                <span className="leaf-docs-nav__link-description">{description}</span>
              </span>
              <ArrowRight className="leaf-docs-nav__link-arrow" size={16} aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function LanguageSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const { english, t } = useDocsLocale();
  const { pathname, search, hash } = useLocation();
  const navigate = useLinkNavigate();
  const { page } = usePage();
  const path = page.pageType === '404' ? '/' : removeBase(pathname);
  const neutralPath = path.replace(/^\/en(?=\/|$)/, '') || '/';

  return (
    <Dropdown
      placement="bottom-end"
      popupWidth={160}
      items={[
        {
          key: 'zh',
          label: '简体中文',
          type: 'radio',
          checked: !english,
          group: 'language',
          closeOnSelect: true,
        },
        {
          key: 'en',
          label: 'English',
          type: 'radio',
          checked: english,
          group: 'language',
          closeOnSelect: true,
        },
      ]}
      onSelect={(language) => {
        if ((language === 'en') !== english) {
          void navigate(`${language === 'en' ? '/en' : ''}${neutralPath}${search}${hash}`);
        }
        onNavigate?.();
      }}
    >
      <button
        type="button"
        className="leaf-docs-nav__language"
        aria-label={t('选择语言', 'Select language')}
      >
        <Languages size={18} aria-hidden="true" />
        <span>{english ? 'English' : '简体中文'}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
    </Dropdown>
  );
}

function SourceLink() {
  const { t } = useDocsLocale();
  return (
    <Link
      href="https://github.com/ifhover/leaf-ui"
      className="leaf-docs-nav__source"
      aria-label={t('在 GitHub 查看源代码', 'View source on GitHub')}
      title="GitHub"
    >
      <IconGithub width={19} height={19} aria-hidden="true" focusable="false" />
      <span>GitHub</span>
      <ArrowUpRight className="leaf-docs-nav__source-arrow" size={16} aria-hidden="true" />
    </Link>
  );
}

export function DocsNav({
  beforeNavTitle,
  navTitle,
  afterNavTitle,
  beforeNavMenu,
  afterNavMenu,
  beforeLeftNavItems,
  afterLeftNavItems,
  beforeRightNavItems,
  afterRightNavItems,
}: NavProps) {
  const { t, url } = useDocsLocale();
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const close = () => setOpen(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Close the drawer on browser history and language navigation too.
  useEffect(() => setOpen(false), [pathname, search]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1440px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <>
      <header className="rp-nav leaf-docs-nav">
        <div className="leaf-docs-nav__inner">
          <div className="leaf-docs-nav__brand">
            {beforeNavTitle}
            {navTitle ?? (
              <Link
                href={url('/')}
                className="leaf-docs-nav__home"
                aria-label={t('Leaf UI 首页', 'Leaf UI home')}
              >
                <img src={withBase('/leaf.svg')} width={36} height={36} alt="" data-no-zoom />
                <span className="leaf-docs-nav__wordmark">
                  <span>Leaf UI</span>
                  <span>{t('React 组件库', 'React components')}</span>
                </span>
              </Link>
            )}
            {afterNavTitle}
          </div>
          <div className="leaf-docs-nav__search">
            <Search />
          </div>
          <div className="leaf-docs-nav__tools">
            <nav className="leaf-docs-nav__desktop" aria-label={t('主导航', 'Main navigation')}>
              {beforeLeftNavItems}
              {afterLeftNavItems}
              {beforeRightNavItems}
              <NavigationLinks />
              {afterRightNavItems}
            </nav>
            {beforeNavMenu}
            <div className="leaf-docs-nav__preferences">
              <ThemeColorSwitcher />
              <LanguageSwitcher />
            </div>
            <SwitchAppearance />
            <div className="leaf-docs-nav__repository">
              <SourceLink />
            </div>
            {afterNavMenu}
            <Button
              className="leaf-docs-nav__menu"
              aria-label={t('打开导航菜单', 'Open navigation menu')}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={open ? drawerId : undefined}
              startIcon={<Menu />}
              onClick={() => setOpen(true)}
            />
          </div>
        </div>
      </header>
      <Drawer
        id={drawerId}
        className="leaf-docs-nav-drawer"
        open={open}
        onClose={close}
        width="min(400px, 100vw)"
        title={t('文档导航', 'Documentation')}
        description={t(
          '从一个组件，开始你的下一个界面。',
          'The building blocks for your next idea.',
        )}
        footer={<SourceLink />}
      >
        <nav aria-label={t('主导航', 'Main navigation')}>
          <NavigationLinks onNavigate={close} />
        </nav>
        <div className="leaf-docs-nav-drawer__settings">
          <div>
            <span>{t('语言', 'Language')}</span>
            <LanguageSwitcher onNavigate={close} />
          </div>
          <div>
            <span>{t('主题色', 'Theme color')}</span>
            <ThemeColorSwitcher />
          </div>
          <div>
            <span>{t('外观', 'Appearance')}</span>
            <SwitchAppearance />
          </div>
        </div>
      </Drawer>
    </>
  );
}
