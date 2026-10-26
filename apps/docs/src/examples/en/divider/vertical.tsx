import { Divider, Space, Text } from '@ifhover/leaf-ui';

export function DividerVertical() {
  return (
    <Space size={0} split={<Divider type="vertical" />}>
      <Text>Project</Text>
      <Text>Team only</Text>
      <Text>Updated today</Text>
    </Space>
  );
}
