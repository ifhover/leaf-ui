import { Button, Space } from '@ifhover/leaf-ui';

export function SpaceBasic() {
  return (
    <Space size="md" wrap>
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="soft">More</Button>
    </Space>
  );
}
