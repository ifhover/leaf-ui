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
              新
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
        { key: 'home', label: '工作台', icon: <House /> },
        {
          key: 'projects',
          label: '项目管理',
          icon: <FolderKanban />,
          children: [
            { key: 'design', label: '设计资源' },
            { key: 'release', label: '发布管理' },
          ],
        },
        { key: 'team', label: '团队成员', icon: <Users /> },
        { key: 'settings', label: '设置', icon: <Settings /> },
      ]}
    />
  );
}
