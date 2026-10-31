import { Menu } from '@ifhover/leaf-ui';
import { Folder, House, Settings } from 'lucide-react';

export function MenuBasic() {
  return (
    <Menu
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
  );
}
