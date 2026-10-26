import { Alert, Flex, Text } from '@ifhover/leaf-ui';
import { ShieldCheck } from 'lucide-react';

export function AlertIcons() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Custom icon</Text>
        <Alert type="success" title="Access permissions updated" icon={<ShieldCheck size={20} />} />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Hidden icon</Text>
        <Alert type="success" title="Access permissions updated" showIcon={false} />
      </Flex>
    </Flex>
  );
}
