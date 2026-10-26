import { Flex, Menu, Switch } from '@ifhover/leaf-ui';
import { Folder, House, Settings } from 'lucide-react';
import { useState } from 'react';

export function MenuCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Flex direction="column" gap="md" align="start">
      <Switch checked={collapsed} onChange={(event) => setCollapsed(event.currentTarget.checked)}>
        折叠菜单
      </Switch>
      <Menu
        collapsed={collapsed}
        defaultSelectedKey="home"
        items={[
          { key: 'home', label: '首页', icon: <House /> },
          {
            key: 'projects',
            label: '项目',
            icon: <Folder />,
            children: [
              { key: 'design', label: '设计资源' },
              { key: 'release', label: '发布记录' },
            ],
          },
          { key: 'settings', label: '设置', icon: <Settings /> },
        ]}
      />
    </Flex>
  );
}
