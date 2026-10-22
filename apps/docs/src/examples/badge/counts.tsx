import { Badge, Button, Flex, Space, Text } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';
export function BadgeCounts() {
  return (
    <Space wrap size={32}>
      <Flex direction="column" gap="sm" align="start">
        <Text>超过数量上限</Text>
        <Badge count={120}>
          <Button variant="outline" startIcon={<Bell />} aria-label="通知" />
        </Badge>
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>显示零值</Text>
        <Badge count={0} showZero>
          <Button variant="outline" startIcon={<Bell />} aria-label="通知" />
        </Badge>
      </Flex>
    </Space>
  );
}
