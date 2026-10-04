import { Menu } from '@sudden3/leaf-ui';

export function MenuHorizontal() {
  return (
    <Menu
      mode="horizontal"
      items={[
        { key: 'home', label: 'Overview' },
        {
          key: 'resources',
          label: 'Resources',
          children: [
            { key: 'components', label: 'Components' },
            {
              key: 'themes',
              label: 'Themes',
              children: [
                { key: 'light', label: 'Light' },
                { key: 'dark', label: 'Dark' },
              ],
            },
          ],
        },
        { key: 'about', label: 'About' },
      ]}
    />
  );
}
