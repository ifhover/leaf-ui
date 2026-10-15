import type { MenuItem } from '@ifhover/leaf-ui';
import { Button, Flex, Menu, Text } from '@ifhover/leaf-ui';
import { BookOpen, Folder, House, Palette, Settings } from 'lucide-react';
import { useState } from 'react';

const items: MenuItem[] = [
  { key: 'home', label: '概览', icon: <House /> },
  {
    key: 'resources',
    label: '资源',
    icon: <Folder />,
    children: [
      { key: 'components', label: '组件', icon: <BookOpen /> },
      { key: 'themes', label: '主题', icon: <Palette /> },
    ],
  },
  { key: 'settings', label: '设置', icon: <Settings /> },
];
export function MenuHorizontal() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Flex direction="column" gap={20}>
      <Flex direction="column" gap="sm" align="center">
        <Text tone="muted">横向导航</Text>
        <Menu mode="horizontal" items={items} defaultSelectedKey="home" />
      </Flex>
      <Flex direction="column" gap="sm" align="center">
        <Text tone="muted">可折叠侧栏</Text>
        <Button variant="ghost" size="sm" onClick={() => setCollapsed((value) => !value)}>
          切换折叠
        </Button>
        <Menu collapsed={collapsed} items={items} defaultSelectedKey="home" />
      </Flex>
    </Flex>
  );
}
