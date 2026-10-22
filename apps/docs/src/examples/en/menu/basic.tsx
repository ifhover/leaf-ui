import { Flex, Menu, type MenuProps, Switch, Tabs, Tag } from '@ifhover/leaf-ui';
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
          Collapse menu
        </Switch>
        <Tabs
          aria-label="Menu appearance"
          type="segmented"
          activeKey={variant}
          onChange={(key) => {
            if (key === 'default' || key === 'raised' || key === 'primary') setVariant(key);
          }}
          items={[
            { key: 'default', label: 'Default' },
            { key: 'raised', label: 'Raised' },
            { key: 'primary', label: 'Primary' },
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
          { key: 'home', label: 'Overview', icon: <House /> },
          {
            key: 'projects',
            label: 'Projects',
            icon: <FolderKanban />,
            children: [
              { key: 'design', label: 'Design resources' },
              {
                key: 'release',
                label: 'Releases',
                extra: (
                  <Tag size="sm" variant="solid" color="#1e964f">
                    New
                  </Tag>
                ),
              },
            ],
          },
          {
            key: 'team',
            label: 'Team members',
            icon: <Users />,
            extra: (
              <Tag size="sm" variant="solid" color="#1e964f">
                12
              </Tag>
            ),
          },
          { key: 'settings', label: 'Settings', icon: <Settings /> },
        ]}
      />
    </Flex>
  );
}
