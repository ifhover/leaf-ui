import { Menu, Space, Switch } from '@ifhover/leaf-ui';
import { FolderKanban, House, Settings } from 'lucide-react';
import { useState } from 'react';

export function MenuRaised() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Space direction="vertical" align="start">
      <Switch checked={collapsed} onChange={(event) => setCollapsed(event.currentTarget.checked)}>
        Collapse menu
      </Switch>
      <Menu
        variant="raised"
        collapsed={collapsed}
        defaultSelectedKey="design"
        defaultOpenKeys={['projects']}
        items={[
          { key: 'home', label: 'Overview', icon: <House /> },
          {
            key: 'projects',
            label: 'Projects',
            icon: <FolderKanban />,
            children: [
              { key: 'design', label: 'Design resources' },
              { key: 'release', label: 'Releases' },
            ],
          },
          { key: 'settings', label: 'Settings', icon: <Settings /> },
        ]}
      />
    </Space>
  );
}
