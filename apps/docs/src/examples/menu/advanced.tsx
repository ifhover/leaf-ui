import type { MenuItem } from '@ifhover/leaf-ui';
import { Button, Flex, Menu, Tabs } from '@ifhover/leaf-ui';
import { Folder, House, Settings } from 'lucide-react';
import { useState } from 'react';

const items: MenuItem[] = [
  { key: 'home', label: '概览', icon: <House /> },
  {
    key: 'resources',
    label: '资源',
    icon: <Folder />,
    children: [
      { key: 'components', label: '组件' },
      { key: 'themes', label: '主题' },
    ],
  },
  { key: 'settings', label: '设置', icon: <Settings /> },
];
export function MenuLayouts() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <Tabs
      aria-label="菜单排列方式"
      items={[
        {
          key: 'vertical',
          label: '垂直',
          children: (
            <Menu
              mode="vertical"
              items={items}
              defaultSelectedKey="components"
              defaultOpenKeys={['resources']}
            />
          ),
        },
        {
          key: 'inline',
          label: '内嵌',
          children: (
            <Menu
              mode="inline"
              items={items}
              defaultSelectedKey="components"
              defaultOpenKeys={['resources']}
            />
          ),
        },
        {
          key: 'horizontal',
          label: '横向',
          children: <Menu mode="horizontal" items={items} defaultSelectedKey="components" />,
        },
        {
          key: 'collapsed',
          label: '折叠侧栏',
          children: (
            <Flex direction="column" gap="md" align="start">
              <Button
                variant="soft"
                size="sm"
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((value) => !value)}
              >
                {collapsed ? '展开侧栏' : '折叠侧栏'}
              </Button>
              <Menu collapsed={collapsed} items={items} defaultSelectedKey="components" />
            </Flex>
          ),
        },
      ]}
    />
  );
}
