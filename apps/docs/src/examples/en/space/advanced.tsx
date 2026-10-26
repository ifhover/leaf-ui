import { Button, Space } from '@ifhover/leaf-ui';

export function SpaceVertical() {
  return (
    <Space direction="vertical" align="start">
      <Button>Save</Button>
      <Button>Cancel</Button>
      <Button>More</Button>
    </Space>
  );
}
