import { Badge, Button, Flex, Space, Text } from '@ifhover/leaf-ui';
import { Bell, Mail } from 'lucide-react';

export function BadgeBasic() {
  return (
    <Badge count={8} aria-label="8 条未读通知">
      <Button variant="outline" startIcon={<Bell />} aria-label="通知" />
    </Badge>
  );
}

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

export function BadgeDot() {
  return (
    <Badge dot aria-label="有未读消息">
      <Button variant="outline" startIcon={<Mail />} aria-label="消息" />
    </Badge>
  );
}

export function BadgeStatuses() {
  return (
    <Space wrap size={24}>
      <Badge status="success" text="运行中" />
      <Badge status="warning" text="待处理" />
      <Badge status="error" text="已停止" />
      <Badge status="info" text="更新中" />
      <Badge status="default" text="未启动" />
    </Space>
  );
}
