import { Button, ConfigProvider, Dropdown, Space } from '@ifhover/leaf-ui';
import { Copy, Pencil } from 'lucide-react';

const items = [
  { key: 'edit', label: 'Edit', icon: <Pencil size={15} /> },
  { key: 'copy', label: 'Copy link', icon: <Copy size={15} />, extra: 'Ctrl C' },
  {
    key: 'more',
    label: 'More',
    extra: 'CSV',
    children: [{ key: 'nested', label: 'Nested action', icon: <Copy size={15} /> }],
  },
];

export function DropdownFixture() {
  return (
    <Space wrap>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Dropdown key={size} size={size} items={items}>
          <Button>{size} menu</Button>
        </Dropdown>
      ))}
      <Dropdown items={[{ key: 'short', label: 'Edit' }]}>
        <Button>Short menu</Button>
      </Dropdown>
      <Dropdown
        items={[
          {
            key: 'wide',
            label: 'Copy the current project link',
            icon: <Copy size={15} />,
            extra: 'Ctrl Shift C',
          },
        ]}
      >
        <Button>Content menu</Button>
      </Dropdown>
      <Dropdown
        popupWidth={180}
        items={[
          {
            key: 'long',
            label: 'An exceptionally long label that must wrap inside a fixed width menu',
            extra: 'Ctrl C',
          },
        ]}
      >
        <Button>Fixed menu</Button>
      </Dropdown>
      <Dropdown
        popupMaxWidth={240}
        items={[{ key: 'long', label: 'A'.repeat(100), extra: 'Ctrl Shift C' }]}
      >
        <Button>Limited menu</Button>
      </Dropdown>
      <ConfigProvider theme={{ components: { Dropdown: { fontSize: 18 } } }}>
        <Dropdown items={items} size="sm">
          <Button>Token menu</Button>
        </Dropdown>
      </ConfigProvider>
    </Space>
  );
}
