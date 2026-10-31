import { Badge, Menu } from '@ifhover/leaf-ui';
import { Folder, House, Users } from 'lucide-react';

export function MenuExtra() {
  return (
    <Menu
      defaultSelectedKey="home"
      items={[
        { key: 'home', label: '首页', icon: <House /> },
        {
          key: 'projects',
          label: '项目',
          icon: <Folder />,
          extra: (
            <Badge count="新">
              <span aria-hidden="true" />
            </Badge>
          ),
        },
        {
          key: 'team',
          label: '团队成员',
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
