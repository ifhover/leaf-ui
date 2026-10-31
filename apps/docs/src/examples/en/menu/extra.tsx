import { Badge, Menu } from '@ifhover/leaf-ui';
import { Folder, House, Users } from 'lucide-react';

export function MenuExtra() {
  return (
    <Menu
      defaultSelectedKey="home"
      items={[
        { key: 'home', label: 'Home', icon: <House /> },
        {
          key: 'projects',
          label: 'Projects',
          icon: <Folder />,
          extra: (
            <Badge count="New">
              <span aria-hidden="true" />
            </Badge>
          ),
        },
        {
          key: 'team',
          label: 'Team members',
          icon: <Users />,
          extra: (
            <Badge count={12}>
              <span aria-hidden="true" />
            </Badge>
          ),
        },
      ]}
    />
  );
}
