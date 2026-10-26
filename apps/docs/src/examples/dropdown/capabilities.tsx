import { Button, Dropdown, Space } from '@ifhover/leaf-ui';

const items = (english: boolean) => [
  { key: 'edit', label: english ? 'Edit' : '编辑' },
  {
    key: 'more',
    label: english ? 'More' : '更多',
    children: [{ key: 'archive', label: english ? 'Archive' : '归档' }],
  },
];

export function Capabilities({ english = false }) {
  return (
    <Space>
      <Dropdown items={items(english)} trigger="hover">
        <Button variant="outline">{english ? 'Hover to open' : '悬停展开'}</Button>
      </Dropdown>
      <Dropdown items={items(english)} trigger="contextMenu">
        <Button variant="outline">{english ? 'Right-click here' : '在此右键点击'}</Button>
      </Dropdown>
    </Space>
  );
}
