import { Divider, Space, Text } from '@ifhover/leaf-ui';

export function DividerVertical() {
  return (
    <Space size={0} split={<Divider type="vertical" />}>
      <Text>项目资料</Text>
      <Text>团队可见</Text>
      <Text>今日更新</Text>
    </Space>
  );
}
