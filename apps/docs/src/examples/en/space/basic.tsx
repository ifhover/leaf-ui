import { Button, Space } from '@ifhover/leaf-ui';

export function SpaceBasic() {
  return (
    <Space size="md" wrap>
      <Button variant="solid">Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="link">More</Button>
    </Space>
  );
}
