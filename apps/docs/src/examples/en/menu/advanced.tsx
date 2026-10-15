import type { MenuItem } from '@ifhover/leaf-ui';
import { Button, Flex, Menu, Text } from '@ifhover/leaf-ui';
import { BookOpen, Folder, House, Palette, Settings } from 'lucide-react';
import { useState } from 'react';

const items: MenuItem[] = [
  { key: 'home', label: 'Overview', icon: <House /> },
  {
    key: 'resources',
    label: 'Resources',
    icon: <Folder />,
    children: [
      { key: 'components', label: 'Components', icon: <BookOpen /> },
      { key: 'themes', label: 'Themes', icon: <Palette /> },
    ],
  },
  { key: 'settings', label: 'Settings', icon: <Settings /> },
];
export function MenuHorizontal() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Flex direction="column" gap={20}>
      <Flex direction="column" gap="sm" align="center">
        <Text tone="muted">Horizontal navigation</Text>
        <Menu mode="horizontal" items={items} defaultSelectedKey="home" />
      </Flex>
      <Flex direction="column" gap="sm" align="center">
        <Text tone="muted">Collapsible sidebar</Text>
        <Button variant="ghost" size="sm" onClick={() => setCollapsed((value) => !value)}>
          Toggle sidebar
        </Button>
        <Menu collapsed={collapsed} items={items} defaultSelectedKey="home" />
      </Flex>
    </Flex>
  );
}
