import { Button, Space } from '@sudden3/leaf-ui';

export function SpaceBasic() {
  return (
    <Space size="md" wrap>
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">More</Button>
    </Space>
  );
}
