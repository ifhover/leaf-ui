import { Badge, Flex, Menu, type MenuProps, Switch, Tabs } from '@ifhover/leaf-ui';
import { FolderKanban, House, Settings, Users } from 'lucide-react';
import { useState } from 'react';

export function MenuBasic() {
  const [collapsed, setCollapsed] = useState(false);
  const [variant, setVariant] = useState<NonNullable<MenuProps['variant']>>('default');
  const [selectedKey, setSelectedKey] = useState('design');
  const [openKeys, setOpenKeys] = useState<readonly string[]>(['projects']);
  return (
    <Flex direction="column" gap="lg" align="center">
      <Flex direction="column" gap="md" align="start">
        <Switch
          checked={collapsed}
          onChange={(event) => {
            setCollapsed(event.currentTarget.checked);
            setOpenKeys(event.currentTarget.checked ? [] : ['projects']);
          }}
        >
          折叠菜单
        </Switch>
        <Tabs
          aria-label="菜单样式"
          type="segmented"
          activeKey={variant}
          onChange={(key) => {
            if (key === 'default' || key === 'raised' || key === 'primary') setVariant(key);
          }}
          items={[
            { key: 'default', label: '默认' },
            { key: 'raised', label: '浮起' },
            { key: 'primary', label: '主题色' },
          ]}
        />
      </Flex>
      <Menu
        variant={variant}
        collapsed={collapsed}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        items={[
          { key: 'home', label: '工作台', icon: <House /> },
          {
            key: 'projects',
            label: '项目管理',
            icon: <FolderKanban />,
            children: [
              { key: 'design', label: '设计资源' },
              {
                key: 'release',
                label: '发布管理',
                extra: <Badge count="新" />,
              },
            ],
          },
          {
            key: 'team',
            label: '团队成员',
            icon: <Users />,
            extra: <Badge count={12} />,
          },
          { key: 'settings', label: '设置', icon: <Settings /> },
        ]}
      />
    </Flex>
  );
}
