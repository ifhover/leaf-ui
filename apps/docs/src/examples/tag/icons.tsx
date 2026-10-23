import { Flex, Space, Tag, Text } from '@ifhover/leaf-ui';
import { Sparkles } from 'lucide-react';

type TagVariant = 'soft' | 'outline';

const variants = [
  { value: 'soft', label: '浅底' },
  { value: 'outline', label: '描边' },
] as const;
const statuses = [
  { color: 'success', label: '已发布' },
  { color: 'warning', label: '待审核' },
  { color: 'danger', label: '已停用' },
  { color: 'info', label: '说明' },
] as const;

function TagGallery({ variant, label }: { variant: TagVariant; label: string }) {
  return (
    <Space direction="vertical" align="stretch" size="sm">
      <Text strong>{label}</Text>
      <Flex gap="sm" wrap>
        {statuses.map((status) => (
          <Tag key={status.color} color={status.color} variant={variant}>
            {status.label}
          </Tag>
        ))}
        <Tag dot={false} variant={variant}>
          无圆点
        </Tag>
        <Tag color="primary" icon={<Sparkles />} variant={variant}>
          自定义图标
        </Tag>
      </Flex>
    </Space>
  );
}

export function TagIcons() {
  return (
    <Space direction="vertical" align="stretch" size="md">
      {variants.map((variant) => (
        <TagGallery key={variant.value} variant={variant.value} label={variant.label} />
      ))}
    </Space>
  );
}
