import { Flex, Menu, Switch } from '@ifhover/leaf-ui';
import { Folder, House, Settings } from 'lucide-react';
import { useState } from 'react';

export function MenuCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Flex direction="column" gap="md" align="start">
      <Switch checked={collapsed} onChange={(event) => setCollapsed(event.currentTarget.checked)}>
        Collapse menu
      </Switch>
      <Menu
        collapsed={collapsed}
        defaultSelectedKey="home"
        items={[
          { key: 'home', label: 'Home', icon: <House /> },
          {
            key: 'projects',
            label: 'Projects',
            icon: <Folder />,
            children: [
              { key: 'design', label: 'Design resources' },
              { key: 'release', label: 'Releases' },
            ],
          },
          { key: 'settings', label: 'Settings', icon: <Settings /> },
        ]}
      />
    </Flex>
  );
}
