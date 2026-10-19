import type { MenuItem } from '@ifhover/leaf-ui';
import { Button, Flex, Menu, Tabs } from '@ifhover/leaf-ui';
import { Folder, House, Settings } from 'lucide-react';
import { useState } from 'react';

const items: MenuItem[] = [
  { key: 'home', label: 'Overview', icon: <House /> },
  {
    key: 'resources',
    label: 'Resources',
    icon: <Folder />,
    children: [
      { key: 'components', label: 'Components' },
      { key: 'themes', label: 'Themes' },
    ],
  },
  { key: 'settings', label: 'Settings', icon: <Settings /> },
];
export function MenuLayouts() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <Tabs
      aria-label="Menu layouts"
      items={[
        {
          key: 'vertical',
          label: 'Vertical',
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
          label: 'Inline',
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
          label: 'Horizontal',
          children: <Menu mode="horizontal" items={items} defaultSelectedKey="components" />,
        },
        {
          key: 'collapsed',
          label: 'Collapsed',
          children: (
            <Flex direction="column" gap="md" align="start">
              <Button
                variant="soft"
                size="sm"
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((value) => !value)}
              >
                {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              </Button>
              <Menu collapsed={collapsed} items={items} defaultSelectedKey="components" />
            </Flex>
          ),
        },
      ]}
    />
  );
}
