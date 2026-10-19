import { Menu, Tag } from '@ifhover/leaf-ui';
import { FolderKanban, House, Settings, Users } from 'lucide-react';
export function MenuBasic() {
  return (
    <Menu
      mode="inline"
      defaultSelectedKey="design"
      defaultOpenKeys={['projects']}
      itemRender={(item, content) => (
        <>
          {content}
          {item.key === 'release' && (
            <Tag size="sm" color="primary">
              New
            </Tag>
          )}
          {item.key === 'team' && (
            <Tag size="sm" color="info">
              12
            </Tag>
          )}
        </>
      )}
      items={[
        { key: 'home', label: 'Overview', icon: <House /> },
        {
          key: 'projects',
          label: 'Projects',
          icon: <FolderKanban />,
          children: [
            { key: 'design', label: 'Design resources' },
            { key: 'release', label: 'Releases' },
          ],
        },
        { key: 'team', label: 'Team members', icon: <Users /> },
        { key: 'settings', label: 'Settings', icon: <Settings /> },
      ]}
    />
  );
}
