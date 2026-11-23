import { Alert, Flex, Text } from '@ifhover/leaf-ui';
import { ShieldCheck } from 'lucide-react';

export function AlertIcons() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Custom icon</Text>
        <Alert
          type="success"
          title="Access permissions updated"
          description="Team members will see the updated permissions within seconds."
          icon={<ShieldCheck size={16} />}
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Hidden icon</Text>
        <Alert
          type="success"
          title="Access permissions updated"
          description="Displayed without an icon for tighter layouts."
          showIcon={false}
        />
      </Flex>
    </Flex>
  );
}
