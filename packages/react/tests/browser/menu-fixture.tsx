import { Button, Input, Menu, MenuGroup, Space, Text } from '@ifhover/leaf-ui';
import { BookOpen, Folder, House, Palette } from 'lucide-react';
import { useState } from 'react';

export function MenuFixture() {
  const [collapsed, setCollapsed] = useState(false);
  const [created, setCreated] = useState(false);
  if (new URLSearchParams(location.search).has('popup')) return <MenuPopupFixture />;
  return (
    <Space direction="vertical" align="start">
      <Button onClick={() => setCollapsed(!collapsed)}>Toggle collapsed</Button>
      <Menu
        aria-label="Grouped navigation"
        collapsed={collapsed}
        defaultSelectedKey="home"
        items={[
          {
            key: 'workspace',
            type: 'group',
            label: <span>Workspace</span>,
            children: [
              { key: 'home', label: 'Home' },
              { key: 'disabled', label: 'Unavailable', disabled: true },
            ],
          },
          {
            key: 'account',
            type: 'group',
            label: 'Account',
            children: [{ key: 'settings', label: 'Settings' }],
          },
        ]}
      />
      <MenuGroup title="Quick create">
        <Space direction="vertical" align="stretch">
          <Text>Keep custom controls under the same group title.</Text>
          <Input aria-label="Project name" defaultValue="Draft" />
          <Button onClick={() => setCreated(true)}>Create project</Button>
          {created && <Text role="status">Project created</Text>}
        </Space>
      </MenuGroup>
    </Space>
  );
}

function MenuPopupFixture() {
  const collapsed = new URLSearchParams(location.search).has('collapsed');
  return (
    <Menu
      aria-label="Popup navigation"
      mode={collapsed ? 'vertical' : 'horizontal'}
      collapsed={collapsed}
      style={
        new URLSearchParams(location.search).has('center') ? { marginInline: 'auto' } : undefined
      }
      defaultSelectedKey="components"
      items={[
        { key: 'home', label: 'Home', icon: <House /> },
        {
          key: 'resources',
          label: 'Resources',
          icon: <Folder />,
          children: [
            { key: 'components', label: 'Components', icon: <BookOpen />, href: '#components' },
            { key: 'themes', label: 'Themes', icon: <Palette /> },
            { key: 'disabled', label: 'Unavailable', disabled: true },
            { key: 'divider', type: 'divider', label: '' },
            {
              key: 'more',
              label: 'More',
              children: [{ key: 'examples', label: 'Examples', icon: <BookOpen /> }],
            },
          ],
        },
      ]}
    />
  );
}
