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
      aria-label="Vertical menu states"
      items={[
        {
          key: 'expanded',
          label: 'Expanded',
          children: (
            <Menu items={items} defaultSelectedKey="components" defaultOpenKeys={['resources']} />
          ),
        },
        {
          key: 'collapsed',
          label: 'Collapsed',
          children: (
            <Flex direction="column" gap="md" align="start">
              <Button
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
