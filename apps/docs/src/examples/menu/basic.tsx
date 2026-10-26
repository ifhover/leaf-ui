import { Menu } from '@ifhover/leaf-ui';
export function MenuBasic() {
  return (
    <Menu
      defaultSelectedKey="home"
      items={[
        { key: 'home', label: '首页' },
        {
          key: 'projects',
          label: '项目',
          children: [
            { key: 'design', label: '设计资源' },
            { key: 'release', label: '发布记录' },
          ],
        },
        { key: 'settings', label: '设置' },
      ]}
    />
  );
}
