import { Menu } from '@sudden3/leaf-ui';

export function MenuBasic() {
  return (
    <Menu
      style={{ maxWidth: 280 }}
      mode="inline"
      defaultSelectedKey="home"
      defaultOpenKeys={['projects']}
      items={[
        { key: 'home', label: 'Home' },
        {
          key: 'projects',
          label: 'Projects',
          children: [
            { key: 'design', label: 'Design assets' },
            { key: 'release', label: 'Releases' },
          ],
        },
        { key: 'settings', label: 'Settings' },
      ]}
    />
  );
}
