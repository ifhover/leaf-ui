import { Flex, Space, Tag, Text } from '@ifhover/leaf-ui';
import { Sparkles } from 'lucide-react';

type TagVariant = 'soft' | 'outline';

const variants = [
  { value: 'soft', label: 'Tinted' },
  { value: 'outline', label: 'Outlined' },
] as const;
const statuses = [
  { color: 'success', label: 'Published' },
  { color: 'warning', label: 'In review' },
  { color: 'danger', label: 'Disabled' },
  { color: 'info', label: 'Info' },
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
          No dot
        </Tag>
        <Tag color="primary" icon={<Sparkles />} variant={variant}>
          Custom icon
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
