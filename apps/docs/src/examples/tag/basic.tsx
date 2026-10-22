import type { TabItem } from '@ifhover/leaf-ui';
import { Flex, Space, Tabs, Tag, Text } from '@ifhover/leaf-ui';

type TagSize = 'sm' | 'md' | 'lg';

const colors = [
  { value: 'primary', label: '主题' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' },
  { value: '#7654c6', label: '自定义' },
] as const;
const variants = [
  { value: 'soft', label: '浅底' },
  { value: 'solid', label: '实色' },
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
  { key: 'sm', label: '小', children: <TagGallery size="sm" /> },
  { key: 'md', label: '默认', children: <TagGallery size="md" /> },
  { key: 'lg', label: '大', children: <TagGallery size="lg" /> },
];

export function TagBasic() {
  return <Tabs aria-label="标签尺寸" defaultActiveKey="md" items={items} />;
}
