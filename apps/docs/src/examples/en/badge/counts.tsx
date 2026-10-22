import { Badge, Button, Flex, Space, Text } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';
export function BadgeCounts() {
  return (
    <Space wrap size={32}>
      <Flex direction="column" gap="sm" align="start">
        <Text>Count limit</Text>
        <Badge count={120}>
          <Button variant="outline" startIcon={<Bell />} aria-label="Notifications" />
        </Badge>
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>Show zero</Text>
        <Badge count={0} showZero>
          <Button variant="outline" startIcon={<Bell />} aria-label="Notifications" />
        </Badge>
      </Flex>
    </Space>
  );
}
