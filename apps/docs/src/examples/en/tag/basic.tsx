import type { TabItem } from '@ifhover/leaf-ui';
import { Flex, Space, Tabs, Tag, Text } from '@ifhover/leaf-ui';

type TagSize = 'sm' | 'md' | 'lg';

const colors = [
  { value: 'primary', label: 'Primary' },
  { value: 'success', label: 'Success' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'danger', label: 'Danger' },
  { value: '#7654c6', label: 'Custom' },
] as const;
const variants = [
  { value: 'soft', label: 'Tinted' },
  { value: 'solid', label: 'Solid' },
] as const;

function TagGallery({ size }: { size: TagSize }) {
  return (
    <Space direction="vertical" align="stretch" size="md">
      {variants.map((variant) => (
        <Space key={variant.value} direction="vertical" align="stretch" size="sm">
          <Text strong>{variant.label}</Text>
          <Flex gap="sm" wrap>
            {colors.map((color) => (
              <Tag key={color.value} color={color.value} size={size} variant={variant.value}>
                {color.label}
              </Tag>
            ))}
          </Flex>
        </Space>
      ))}
    </Space>
  );
}

const items: readonly TabItem[] = [
  { key: 'sm', label: 'Small', children: <TagGallery size="sm" /> },
  { key: 'md', label: 'Default', children: <TagGallery size="md" /> },
  { key: 'lg', label: 'Large', children: <TagGallery size="lg" /> },
];

export function TagBasic() {
  return <Tabs aria-label="Tag size" defaultActiveKey="md" items={items} />;
}
