import { Menu } from '@ifhover/leaf-ui';

export function MenuGroups() {
  return (
    <Menu
      defaultSelectedKey="overview"
      items={[
        {
          key: 'workspace',
          type: 'group',
          label: 'Workspace',
          children: [
            { key: 'overview', label: 'Overview' },
            { key: 'projects', label: 'Projects' },
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
  );
}
