import { Menu } from '@sudden3/leaf-ui';

export function MenuBasic() {
  return (
    <Menu
      style={{ maxWidth: 280 }}
      mode="inline"
      defaultSelectedKey="home"
      defaultOpenKeys={['projects']}
      items={[
        { key: 'home', label: '首页' },
        {
          key: 'projects',
          label: '项目',
          children: [
            { key: 'design', label: '设计资源' },
            { key: 'release', label: '发布管理' },
          ],
        },
        { key: 'settings', label: '设置' },
      ]}
    />
  );
}
