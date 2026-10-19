import { Menu } from '@ifhover/leaf-ui';

export function MenuGroups() {
  return (
    <Menu
      defaultSelectedKey="overview"
      items={[
        {
          key: 'workspace',
          type: 'group',
          label: '工作空间',
          children: [
            { key: 'overview', label: '概览' },
            { key: 'projects', label: '项目' },
          ],
        },
        {
          key: 'account',
          type: 'group',
          label: '账户',
          children: [{ key: 'settings', label: '设置' }],
        },
      ]}
    />
  );
}
