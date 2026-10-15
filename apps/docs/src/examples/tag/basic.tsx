import { Flex, Space, Tag } from '@ifhover/leaf-ui';
import { Check } from 'lucide-react';
export function TagBasic() {
  return (
    <Space direction="vertical" align="stretch">
      <Flex gap="md" align="center" wrap justify="center">
        {(['default', 'primary', 'success', 'info', 'warning', 'error'] as const).map((color) => (
          <Tag key={color} color={color}>
            {color}
          </Tag>
        ))}
      </Flex>
      <Flex gap="md" align="center" wrap justify="center">
        <Tag color="primary" variant="solid">
          已发布
        </Tag>
        <Tag color="success" icon={<Check />}>
          已完成
        </Tag>
        <Tag color="#7654c6" closable>
          可移除
        </Tag>
        <Tag size="lg" color="primary">
          大标签
        </Tag>
      </Flex>
    </Space>
  );
}
