import { Menu } from '@ifhover/leaf-ui';
import { Folder, House, Settings } from 'lucide-react';

export function MenuBasic() {
  return (
    <Menu
      defaultSelectedKey="home"
      items={[
        { key: 'home', label: '首页', icon: <House /> },
        {
          key: 'projects',
          label: '项目',
          icon: <Folder />,
          children: [
            { key: 'design', label: '设计资源' },
            { key: 'release', label: '发布记录' },
          ],
        },
        { key: 'settings', label: '设置', icon: <Settings /> },
      ]}
    />
  );
}
