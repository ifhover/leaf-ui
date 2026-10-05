import { Menu, type MenuItem } from '@sudden3/leaf-ui';
import { BookOpen, House, Settings } from 'lucide-react';
import {
  type AnchorHTMLAttributes,
  cloneElement,
  isValidElement,
  type ReactElement,
  useState,
} from 'react';

export function MenuRouting({ english = false }: { english?: boolean }) {
  const [selected, setSelected] = useState('overview');
  const items: MenuItem[] = [
    { key: 'overview', label: english ? 'Overview' : '概览', href: '#overview', icon: <House /> },
    {
      key: 'resources',
      label: english ? 'Resources' : '资源',
      icon: <BookOpen />,
      children: [
        { key: 'guides', label: english ? 'Guides' : '使用指南', href: '#guides' },
        {
          key: 'settings',
          label: english ? 'Settings' : '设置',
          href: '#settings',
          icon: <Settings />,
        },
      ],
    },
  ];
  return (
    <div>
      <Menu
        aria-label={english ? 'Application navigation' : '应用导航'}
        items={items}
        selectedKey={selected}
        defaultOpenKeys={['resources']}
        onSelect={setSelected}
        linkRender={(_item, link) => {
          if (!isValidElement(link)) return link;
          const element = link as ReactElement<AnchorHTMLAttributes<HTMLAnchorElement>>;
          return cloneElement(element, {
            onClick: (event) => {
              element.props.onClick?.(event);
              event.preventDefault();
            },
          });
        }}
      />
      <p className="leaf-demo-note">
        {english
          ? `Current page: ${selected}. The example updates local state; replace the anchor with your router Link and retain its props.`
          : `当前页面：${selected}。示例切换本地状态；接入路由时使用自己的 Link，并保留传入属性。`}
      </p>
    </div>
  );
}
