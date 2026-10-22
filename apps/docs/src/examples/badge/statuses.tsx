import { Badge, Space } from '@ifhover/leaf-ui';
export function BadgeStatuses() {
  return (
    <Space wrap size={24}>
      <Badge status="success" text="运行中" />
      <Badge status="warning" text="待处理" />
      <Badge status="danger" text="已停止" />
      <Badge status="info" text="更新中" />
      <Badge status="default" text="未启动" />
    </Space>
  );
}
