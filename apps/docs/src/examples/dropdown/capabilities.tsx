import { Button, Dropdown, Space } from '@sudden3/leaf-ui';

const items = [
  { key: 'edit', label: 'Edit' },
  { key: 'more', label: 'More', children: [{ key: 'archive', label: 'Archive' }] },
];
export function Capabilities({ english = false }) {
  return (
    <Space>
      <Dropdown trigger="hover" items={items}>
        <Button variant="outline">{english ? 'Hover to open' : '悬停展开'}</Button>
      </Dropdown>
      <Dropdown trigger="contextMenu" items={items}>
        <Button variant="outline">{english ? 'Right-click here' : '在此右键点击'}</Button>
      </Dropdown>
    </Space>
  );
}
