import { Menu } from '@sudden3/leaf-ui';
import { FolderKanban, House, Palette, Rocket, Settings, Users } from 'lucide-react';
export function MenuBasic() {
  return (
    <Menu
      mode="inline"
      defaultSelectedKey="design"
      defaultOpenKeys={['projects']}
      items={[
        { key: 'home', label: 'Overview', icon: <House /> },
        {
          key: 'projects',
          label: 'Projects',
          icon: <FolderKanban />,
          children: [
            { key: 'design', label: 'Design resources', icon: <Palette /> },
            { key: 'release', label: 'Releases', icon: <Rocket /> },
          ],
        },
        { key: 'team', label: 'Team members', icon: <Users /> },
        { key: 'settings', label: 'Settings', icon: <Settings /> },
      ]}
    />
  );
}
