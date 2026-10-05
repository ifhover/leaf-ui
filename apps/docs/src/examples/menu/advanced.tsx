import { Button, Menu, type MenuItem, Space } from '@sudden3/leaf-ui';
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
    <Space direction="vertical" align="start" size={20}>
      <div>
        <p className="leaf-demo-note">横向导航</p>
        <Menu mode="horizontal" items={items} defaultSelectedKey="home" />
      </div>
      <div>
        <p className="leaf-demo-note">可折叠侧栏</p>
        <Button variant="ghost" size="sm" onClick={() => setCollapsed((value) => !value)}>
          切换折叠
        </Button>
        <Menu collapsed={collapsed} items={items} defaultSelectedKey="home" />
      </div>
    </Space>
  );
}
