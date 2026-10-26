import { Menu } from '@ifhover/leaf-ui';
export function MenuBasic() {
  return (
    <Menu
      defaultSelectedKey="home"
      items={[
        { key: 'home', label: 'Home' },
        {
          key: 'projects',
          label: 'Projects',
          children: [
            { key: 'design', label: 'Design resources' },
            { key: 'release', label: 'Releases' },
          ],
        },
        { key: 'settings', label: 'Settings' },
      ]}
    />
  );
}
