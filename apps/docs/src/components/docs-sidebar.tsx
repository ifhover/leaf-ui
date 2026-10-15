import './docs-sidebar.scss';
import type { SidebarData } from '@rspress/core';
import { useLocation, useSidebarDynamic } from '@rspress/core/runtime';
import { Sidebar as RspressSidebar, SidebarList } from '@rspress/core/theme-original';
import { useRef, useState } from 'react';
import { ComponentFilter, matchesComponentQuery } from './component-filter';
import { useDocsLocale } from './i18n';

function filterSidebar(items: SidebarData, query: string): SidebarData {
  const filtered: SidebarData = [];
  for (const item of items) {
    if ('items' in item) {
      const children = filterSidebar(item.items, query);
      if (children.length) {
        filtered.push({ ...item, items: children, collapsed: false, collapsible: false });
      }
    } else if (
      'link' in item &&
      matchesComponentQuery(query, `${item.text} ${item.tag ?? ''} ${item.link.split('/').pop()}`)
    ) {
      filtered.push(item);
    }
  }
  return filtered;
}

function ComponentSidebar() {
  const { t } = useDocsLocale();
  const [sidebar, setSidebar] = useSidebarDynamic();
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLElement>(null);
  const filtered = query.trim() ? filterSidebar(sidebar, query) : sidebar;

  return (
    <div className="leaf-component-sidebar">
      <div className="leaf-component-sidebar__filter">
        <ComponentFilter
          value={query}
          onChange={(value) => {
            setQuery(value);
            if (listRef.current) listRef.current.scrollTop = 0;
          }}
          label={t('过滤组件菜单', 'Filter component menu')}
        />
      </div>
      <nav
        className="leaf-component-sidebar__list rp-scrollbar"
        aria-label={t('组件菜单', 'Component menu')}
        ref={listRef}
      >
        <SidebarList sidebarData={filtered} setSidebarData={setSidebar} />
        {filtered.length === 0 && (
          <p className="leaf-component-sidebar__empty" role="status">
            {t('没有匹配的组件', 'No matching components')}
          </p>
        )}
      </nav>
    </div>
  );
}

export function DocsSidebar() {
  const { pathname } = useLocation();
  return /\/components(?:\/|$)/.test(pathname) ? <ComponentSidebar /> : <RspressSidebar />;
}
