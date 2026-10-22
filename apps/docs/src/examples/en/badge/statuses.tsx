import { Badge, Space } from '@ifhover/leaf-ui';
export function BadgeStatuses() {
  return (
    <Space wrap size={24}>
      <Badge status="success" text="Running" />
      <Badge status="warning" text="Pending" />
      <Badge status="danger" text="Stopped" />
      <Badge status="info" text="Updating" />
      <Badge status="default" text="Inactive" />
    </Space>
  );
}
