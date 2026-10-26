import { Button, Space } from '@ifhover/leaf-ui';

export function SpaceVertical() {
  return (
    <Space direction="vertical" align="start">
      <Button>保存</Button>
      <Button>取消</Button>
      <Button>更多</Button>
    </Space>
  );
}
