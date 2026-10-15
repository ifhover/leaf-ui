import { Badge, Button, Flex, Space, Text } from '@ifhover/leaf-ui';
import { Bell, Mail } from 'lucide-react';

export function BadgeBasic() {
  return (
    <Badge count={8} aria-label="8 unread notifications">
      <Button variant="outline" startIcon={<Bell />} aria-label="Notifications" />
    </Badge>
  );
}

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

export function BadgeDot() {
  return (
    <Badge dot aria-label="Unread messages">
      <Button variant="outline" startIcon={<Mail />} aria-label="Messages" />
    </Badge>
  );
}

export function BadgeStatuses() {
  return (
    <Space wrap size={24}>
      <Badge status="success" text="Running" />
      <Badge status="warning" text="Pending" />
      <Badge status="error" text="Stopped" />
      <Badge status="info" text="Updating" />
      <Badge status="default" text="Inactive" />
    </Space>
  );
}
