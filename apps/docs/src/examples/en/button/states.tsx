import { Button, Space } from '@ifhover/leaf-ui';

export function ButtonStates() {
  return (
    <Space wrap>
      <Button disabled>Unavailable</Button>
      <Button loading>Loading</Button>
      <Button variant="outline" disabled>
        Disabled
      </Button>
    </Space>
  );
}
