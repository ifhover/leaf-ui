import { Badge, Space } from '@ifhover/leaf-ui';

export function BadgeStandalone() {
  return (
    <Space wrap>
      <Badge count={8} />
      <Badge count={120} />
      <Badge count={0} showZero />
      <Badge count="NEW" />
    </Space>
  );
}
