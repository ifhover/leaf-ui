import { Menu, Space, Switch } from '@ifhover/leaf-ui';
import { FolderKanban, House, Settings } from 'lucide-react';
import { useState } from 'react';

export function MenuRaised() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Space direction="vertical" align="start">
      <Switch checked={collapsed} onChange={(event) => setCollapsed(event.currentTarget.checked)}>
        折叠菜单
      </Switch>
      <Menu
        variant="raised"
        collapsed={collapsed}
        defaultSelectedKey="design"
        defaultOpenKeys={['projects']}
        items={[
          { key: 'home', label: '工作台', icon: <House /> },
          {
            key: 'projects',
            label: '项目管理',
            icon: <FolderKanban />,
            children: [
              { key: 'design', label: '设计资源' },
              { key: 'release', label: '发布管理' },
            ],
          },
          { key: 'settings', label: '设置', icon: <Settings /> },
        ]}
      />
    </Space>
  );
}
