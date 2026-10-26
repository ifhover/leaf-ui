import { Alert, Flex, Text } from '@ifhover/leaf-ui';
import { ShieldCheck } from 'lucide-react';

export function AlertIcons() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">自定义图标</Text>
        <Alert type="success" title="访问权限已更新" icon={<ShieldCheck size={20} />} />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">隐藏图标</Text>
        <Alert type="success" title="访问权限已更新" showIcon={false} />
      </Flex>
    </Flex>
  );
}
