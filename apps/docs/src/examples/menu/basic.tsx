import { Menu } from '@sudden3/leaf-ui';
import { FolderKanban, House, Palette, Rocket, Settings, Users } from 'lucide-react';
export function MenuBasic() {
  return (
    <Menu
      mode="inline"
      defaultSelectedKey="design"
      defaultOpenKeys={['projects']}
      items={[
        { key: 'home', label: '工作台', icon: <House /> },
        {
          key: 'projects',
          label: '项目管理',
          icon: <FolderKanban />,
          children: [
            { key: 'design', label: '设计资源', icon: <Palette /> },
            { key: 'release', label: '发布管理', icon: <Rocket /> },
          ],
        },
        { key: 'team', label: '团队成员', icon: <Users /> },
        { key: 'settings', label: '设置', icon: <Settings /> },
      ]}
    />
  );
}
