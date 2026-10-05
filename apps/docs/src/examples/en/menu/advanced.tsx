import { Button, Menu, type MenuItem, Space } from '@sudden3/leaf-ui';
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
    <Space direction="vertical" align="start" size={20}>
      <div>
        <p className="leaf-demo-note">Horizontal navigation</p>
        <Menu mode="horizontal" items={items} defaultSelectedKey="home" />
      </div>
      <div>
        <p className="leaf-demo-note">Collapsible sidebar</p>
        <Button variant="ghost" size="sm" onClick={() => setCollapsed((value) => !value)}>
          Toggle sidebar
        </Button>
        <Menu collapsed={collapsed} items={items} defaultSelectedKey="home" />
      </div>
    </Space>
  );
}
