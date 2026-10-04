import { Menu } from '@sudden3/leaf-ui';

export function MenuHorizontal() {
  return (
    <Menu
      mode="horizontal"
      items={[
        { key: 'home', label: '概览' },
        {
          key: 'resources',
          label: '资源',
          children: [
            { key: 'components', label: '组件' },
            {
              key: 'themes',
              label: '主题',
              children: [
                { key: 'light', label: '浅色' },
                { key: 'dark', label: '深色' },
              ],
            },
          ],
        },
        { key: 'about', label: '关于' },
      ]}
    />
  );
}
